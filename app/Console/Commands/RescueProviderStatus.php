<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class RescueProviderStatus extends Command
{
    protected $signature = 'provider:rescue';
    protected $description = 'Tim SAR: Inspeksi ulang TRX Gagal hari ini & Tarik balik saldo jika ternyata sukses/pending';

    public function handle()
    {
        $db = DB::connection();
        $this->info("🚑 TIM SAR DITERJUNKAN! Inspeksi TRX Gagal 24 Jam Terakhir...");

        // Ambil semua transaksi yang statusnya Gagal/Dibatalkan dalam 24 jam terakhir
        $transactions = $db->table('transaksi')
            ->whereIn('status', ['Gagal', 'Dibatalkan'])
            ->where('updated_at', '>=', Carbon::now()->subHours(24))
            ->get();

        $count = 0;

        foreach ($transactions as $trx) {
            // Pisahkan jalur Kaje dan Khfy
            // Khfy gampang karena pake ref_id. Kaje agak repot kalau SN-nya udah ketimpa tulisan "Gagal..."
            if (str_contains($trx->kode_layanan, 'Kaje')) {
                $this->rescueKaje($trx);
            } else {
                $this->rescueKhfy($trx);
            }
            $count++;
        }

        $this->info("🏁 Inspeksi selesai! Total diperiksa: {$count} transaksi.");
    }

    private function rescueKhfy($trx) {
        $api_key = env("KHFY_API_KEY");
        try {
            $response = Http::withoutVerifying()->timeout(10)->get("https://panel.khfy-store.com/api_v2/history", [
                'api_key' => $api_key,
                'refid' => $trx->ref_id
            ]);

            $res = $response->json();
            if ($response->successful() && isset($res['data'][0])) {
                $st = strtoupper($res['data'][0]['status_text'] ?? '');
                $sn_asli = $res['data']['sn'] ?? $res['data'][0]['keterangan'] ?? 'DONE';

                if ($st == 'SUKSES') {
                    $this->revertToSuccess($trx, $sn_asli, 'Khfy');
                } elseif (!in_array($st, ['GAGAL', 'BATAL', 'FAILED'])) {
                    // Berarti aslinya masih PENDING/PROSES!
                    $this->revertToPending($trx, 'Khfy');
                }
            }
        } catch (\Exception $e) {}
    }

    private function rescueKaje($trx) {
        $api_key = env("KAJE_API_KEY");
        // Kalau SN udah ketimpa "Gagal: Kadaluarsa", kita gak punya ID Kaje-nya lagi.
        // Kita coba cari ID aslinya pake Regex kalau masih ada sisa-sisa ID-nya.
        $trx_id = null;
        if (str_starts_with($trx->sn, 'T')) {
            $trx_id = $trx->sn;
        }

        if (!$trx_id) {
            $this->error("⚠️ {$trx->ref_id} (Kaje) - Tidak bisa diinspeksi karena ID asli (TrxID) sudah tertimpa.");
            return;
        }

        try {
            $response = Http::withHeaders(['x-api-key' => $api_key])->withoutVerifying()->timeout(10)
                ->post("https://end.kaje-store.com/api/info/trx-id", ['trx_id' => $trx_id]);
            
            $res = $response->json();
            if ($response->successful() && isset($res['data']['status'])) {
                $status = strtolower($res['data']['status']);
                $sn_asli = $res['data']['serial_number'] ?? $res['data']['message'] ?? 'DONE';

                if (in_array($status, ['success', 'sukses', 'done'])) {
                    $this->revertToSuccess($trx, $sn_asli, 'Kaje');
                } elseif (!in_array($status, ['failed', 'gagal', 'error', 'cancel'])) {
                    $this->revertToPending($trx, 'Kaje');
                }
            }
        } catch (\Exception $e) {}
    }

    private function revertToSuccess($trx, $sn_asli, $provider) {
        DB::beginTransaction();
        try {
            // 1. Ubah status jadi Sukses
            DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'sn' => $sn_asli]);
            // 2. Tarik balik saldo member (karena sebelumnya udah sempet di-refund)
            DB::table('users')->where('name', $trx->username)->decrement('saldo', $trx->harga);
            DB::commit();
            $this->info("✅ {$trx->ref_id} ({$provider}) - TERNYATA SUKSES! Saldo user dipotong kembali.");
        } catch (\Exception $e) { DB::rollBack(); }
    }

    private function revertToPending($trx, $provider) {
        DB::beginTransaction();
        try {
            // 1. Ubah status jadi Pending
            DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Pending', 'sn' => 'Dipulihkan Tim SAR']);
            // 2. Tarik balik saldo member
            DB::table('users')->where('name', $trx->username)->decrement('saldo', $trx->harga);
            DB::commit();
            $this->warn("⏳ {$trx->ref_id} ({$provider}) - TERNYATA PENDING! Saldo ditarik balik, status jadi Pending.");
        } catch (\Exception $e) { DB::rollBack(); }
    }
}
