<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class SyncPendingKaje extends Command
{
    protected $signature = 'kaje:sync-pending';
    public function handle()
    {
        $apiKey = env('KAJE_API_KEY');
        // KITA LIBAS SEMUA STATUS YANG MASIH GANTUNG
        $pendingTrx = DB::table('transaksi')
            ->whereIn('status', ['Proses', 'Pending', 'Wait', 'Proses_API'])
            ->where('created_at', '<', now()->subMinutes(2)) // Kita turunkan jadi 2 menit biar gercep!
            ->where('created_at', '>', now()->subDay())
            ->get();

        if ($pendingTrx->isEmpty()) {
            $this->info("Radar Bersih: Tidak ada transaksi pending.");
            return;
        }

        foreach ($pendingTrx as $trx) {
            $target_id = $trx->sn; // Biasanya kita simpan trx_id pusat di SN
            if (empty($target_id)) {
                $this->error("TRX {$trx->ref_id} skip: SN/TRX_ID Kosong!");
                continue;
            }

            try {
                $res = Http::withHeaders(['x-api-key' => $apiKey])->post('https://end.kaje-store.com/api/info/trx-id', ['trx_id' => $target_id]);
                $data = $res->json();
                
                if ($res->successful() && isset($data['data']['status'])) {
                    $status = strtolower($data['data']['status']);
                    if (in_array($status, ['success', 'sukses'])) {
                        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'sn' => $data['data']['serial_number'] ?? $target_id, 'updated_at' => now()]);
                        DB::table('antrian_kaje')->where('ref_id', $trx->ref_id)->update(['status' => 'Sukses']);
                        $this->info("✅ {$trx->ref_id} -> SUKSES");
                    } elseif (in_array($status, ['failed', 'gagal', 'error', 'cancel', 'refund'])) {
                        DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
                        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => 'Gagal Pusat (Auto)', 'updated_at' => now()]);
                        DB::table('antrian_kaje')->where('ref_id', $trx->ref_id)->update(['status' => 'Gagal']);
                        $this->error("🔴 {$trx->ref_id} -> GAGAL & REFUND");
                    } else {
                        $this->warn("🟡 {$trx->ref_id} -> Masih {$status} di pusat.");
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error: " . $e->getMessage());
            }
        }
    }
}
