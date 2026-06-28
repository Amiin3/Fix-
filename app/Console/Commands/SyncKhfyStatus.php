<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncKhfyStatus extends Command {
    protected $signature = 'khfy:sync';
    protected $description = 'Tanya paksa status ke KHFY';

    public function handle() {
        // Ambil SEMUA yang statusnya Pending (Karena VPS Gahar, kita hajar semua)
        $pendingTrx = DB::table('transaksi')->where('status', 'Pending')->get();
        
        if ($pendingTrx->isEmpty()) {
            $this->info("Papan bersih Bos! Gak ada yang pending.");
            return;
        }

        $this->info("Menyerang " . $pendingTrx->count() . " orderan nyangkut...");

        foreach ($pendingTrx as $trx) {
            $apiKey = env('KHFY_API_KEY');
            try {
                $res = Http::timeout(10)->get("https://panel.khfy-store.com/api_v2/history?api_key=$apiKey&refid=$trx->ref_id");
                $data = $res->json();

                if ($res->successful() && isset($data['data'][0])) {
                    $prov = $data['data'][0];
                    $status = strtoupper($prov['status_text']);

                    if ($status === 'SUKSES' || $status === 'GAGAL') {
                        $finalStatus = ($status === 'SUKSES') ? 'Sukses' : 'Gagal';
                        
                        DB::beginTransaction();
                        DB::table('transaksi')->where('id', $trx->id)->update([
                            'status' => $finalStatus, 
                            'sn' => $prov['sn'] ?? $prov['keterangan'] ?? 'Updated by System',
                            'updated_at' => now()
                        ]);

                        if ($finalStatus === 'Gagal') {
                            if ($trx->status !== 'Gagal' && $trx->status !== 'GAGAL') { DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga); }
                        }
                        DB::commit();
                        $this->info("🎯 $trx->ref_id -> $finalStatus");
                    } else {
                        $this->line("⏳ $trx->ref_id -> Masih Proses di Provider");
                    }
                }
            } catch (\Exception $e) {
                $this->error("❌ Gagal nanya buat: $trx->ref_id");
            }
        }
        $this->info("Operasi Selesai!");
    }
}
