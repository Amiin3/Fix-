<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class SyncProviderStatus extends Command
{
    protected $signature = 'provider:sync-status';
    protected $description = 'Sinkronisasi TRX Reguler (Auto-Refund Order Ghaib)';

    public function handle()
    {
        $db = DB::connection();
        $this->info("🔍 Memulai pengecekan ke Provider...");

        $kajeCodes = Schema::hasTable('layanan_kaje') ? $db->table('layanan_kaje')->pluck('kode_layanan')->toArray() : [];
        $activePoIds = array_merge(
            Schema::hasTable('antrian_kaje') ? $db->table('antrian_kaje')->where('created_at', '>=', Carbon::now()->subHours(24))->pluck('ref_id')->toArray() : [],
            Schema::hasTable('antrian_po') ? $db->table('antrian_po')->where('created_at', '>=', Carbon::now()->subHours(24))->pluck('ref_id')->toArray() : [],
            Schema::hasTable('antrian_khfy') ? $db->table('antrian_khfy')->where('created_at', '>=', Carbon::now()->subHours(24))->pluck('ref_id')->toArray() : []
        );

        $transactions = $db->table('transaksi')
            ->whereIn('status', ['Pending', 'Proses', 'Proses_API'])
            ->whereNotIn('ref_id', $activePoIds)
            ->where('created_at', '>=', Carbon::now()->subDays(2))
            ->limit(30)->get();

        foreach ($transactions as $trx) {
            $isExpired = Carbon::parse($trx->created_at)->diffInHours(Carbon::now()) >= 24;
            if (in_array($trx->kode_layanan, $kajeCodes) || str_contains(strtolower($trx->kode_layanan), 'kaje')) {
                $this->syncKaje($trx, $isExpired);
            } else {
                $this->syncKhfy($trx, $isExpired);
            }
        }
        $this->info("🏁 Pengecekan selesai!");
    }

    private function syncKaje($trx, $isExpired) {
        $api_key = env("KAJE_API_KEY");
        $trx_id = trim($trx->sn);

        if (empty($trx_id) || strlen($trx_id) < 4 || str_contains(strtolower($trx_id), 'proses')) {
            if ($isExpired) $this->forceCancel($trx, 'Gagal: Tanpa ID Resi');
            return;
        }

        try {
            $response = Http::withHeaders(['x-api-key' => $api_key])->withoutVerifying()->timeout(12)
                ->post("https://end.kaje-store.com/api/info/trx-id", ['trx_id' => $trx_id]);
            
            $res = $response->json();
            
            if ($response->successful() && isset($res['data']['status'])) {
                $status = strtolower($res['data']['status']);
                $sn_asli = $res['data']['serial_number'] ?? $res['data']['message'] ?? 'DONE';

                if (in_array($status, ['success', 'sukses', 'done'])) {
                    $this->updateSuccess($trx, $sn_asli);
                } elseif (in_array($status, ['failed', 'gagal', 'error', 'cancel', 'rejected'])) {
                    $this->updateFailed($trx, $sn_asli);
                } else {
                    $this->info("⏳ {$trx->ref_id} - Kaje: Still Pending");
                }
            } else {
                $msg = $res['message'] ?? $response->body() ?: 'No Response';
                
                // 🔥 LOGIKA PEMBANTAI ORDER GHAIB 🔥
                // Jika Kaje bilang "tidak ditemukan" atau "kesalahan tidak terduga", langsung REFUND!
                if (str_contains(strtolower($msg), 'tidak ditemukan') || str_contains(strtolower($msg), 'tidak ditemuka') || str_contains(strtolower($msg), 'terduga')) {
                    $this->updateFailed($trx, "Batal Otomatis: " . substr($msg, 0, 40));
                } else {
                    $this->error("⚠️ {$trx->ref_id} - Kaje Error: " . substr($msg, 0, 40));
                }
            }
        } catch (\Exception $e) { $this->error("⚠️ {$trx->ref_id} - Konek Error"); }
    }

    private function syncKhfy($trx, $isExpired) {
        $api_key = env("KHFY_API_KEY");
        try {
            $response = Http::withoutVerifying()->timeout(10)->get("https://panel.khfy-store.com/api_v2/history", ['api_key' => $api_key, 'refid' => $trx->ref_id]);
            $res = $response->json();
            if ($response->successful() && isset($res['data'][0])) {
                $st = strtoupper($res['data'][0]['status_text'] ?? '');
                $sn_asli = $res['data']['sn'] ?? $res['data'][0]['keterangan'] ?? 'DONE';
                if ($st == 'SUKSES') $this->updateSuccess($trx, $sn_asli);
                elseif (in_array($st, ['GAGAL', 'BATAL', 'FAILED'])) $this->updateFailed($trx, $sn_asli);
            }
        } catch (\Exception $e) {}
    }

    private function updateSuccess($trx, $sn) {
        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'sn' => $sn, 'updated_at' => now()]);
        $this->info("✅ {$trx->ref_id} SUKSES");
    }

    private function updateFailed($trx, $sn) {
        DB::beginTransaction();
        try {
            DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => $sn, 'updated_at' => now()]);
            DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
            DB::commit();
            $this->info("❌ {$trx->ref_id} GAGAL & REFUND");
        } catch (\Exception $e) { DB::rollBack(); }
    }

    private function forceCancel($trx, $reason) {
        $this->updateFailed($trx, $reason);
        $this->info("🧹 SAPU BERSIH: {$trx->ref_id}");
    }
}
