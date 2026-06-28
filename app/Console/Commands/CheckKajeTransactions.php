<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class CheckKajeTransactions extends Command
{
    protected $signature = 'kaje:check';
    protected $description = 'Cek status transaksi pending di Kaje API dan Auto-Refund jika gagal';

    public function handle()
    {
        $this->info("🤖 Robot Pengawal Kaje Mulai Bekerja...");
        
        // Pakai nama tabel & kolom asli Bos: transaksi, ref_id_provider
        $pendingTrx = DB::table('transaksi')
            ->where('status', 'pending')
            ->whereNotNull('ref_id_provider')
            ->where('ref_id_provider', '!=', '')
            ->get();

        if ($pendingTrx->isEmpty()) {
            $this->info("✅ Mantap! Tidak ada transaksi pending saat ini.");
            return;
        }

        $apiKey = env('KAJE_API_KEY', '');
        if(empty($apiKey)){
            $this->error("❌ API Key Kaje tidak ditemukan di file .env!");
            return;
        }

        foreach ($pendingTrx as $trx) {
            try {
                // Tembak Kaje pakai ref_id_provider
                $res = Http::withHeaders([
                    'x-api-key' => $apiKey,
                    'accept' => 'application/json',
                    'Content-Type' => 'application/json'
                ])->post('https://end.kaje-store.com/api/info/trx-id', [
                    'trx_id' => $trx->ref_id_provider
                ]);

                $data = $res->json();

                if ($res->successful() && isset($data['success']) && $data['success'] == true) {
                    $statusPusat = strtolower($data['data']['status'] ?? 'pending');

                    if (in_array($statusPusat, ['success', 'sukses'])) {
                        // SUKSES
                        DB::table('transaksi')->where('id', $trx->id)->update([
                            'status' => 'sukses',
                            'updated_at' => now()
                        ]);
                        $this->info("🟢 Trx {$trx->ref_id} SUKSES.");
                        
                    } elseif (in_array($statusPusat, ['error', 'failed', 'gagal', 'refund'])) {
                        // GAGAL -> AUTO REFUND
                        DB::beginTransaction();
                        try {
                            DB::table('transaksi')->where('id', $trx->id)->update([
                                'status' => 'gagal',
                                'updated_at' => now()
                            ]);

                            // Cari user pakai username
                            $user = User::where('username', $trx->username)
                                        ->orWhere('name', $trx->username)
                                        ->lockForUpdate()
                                        ->first();
                                        
                            if($user){
                                $user->saldo += $trx->harga;
                                $user->save();
                                $this->warn("🔴 Trx {$trx->ref_id} GAGAL. Saldo Rp " . number_format($trx->harga, 0, ',', '.') . " di-refund ke {$user->username}!");
                            } else {
                                $this->warn("🔴 Trx {$trx->ref_id} GAGAL. Tapi user {$trx->username} tidak ditemukan untuk refund.");
                            }
                            
                            DB::commit();
                        } catch (\Exception $e) {
                            DB::rollBack();
                            $this->error("❌ Gagal proses refund trx {$trx->ref_id}: " . $e->getMessage());
                        }
                    } else {
                        // PENDING
                        $this->line("🟡 Trx {$trx->ref_id} masih PENDING di pusat.");
                    }
                } else {
                    $errorMsg = $data['message'] ?? 'Respon API Kaje tidak valid.';
                    $this->error("⚠️ Gagal cek Trx {$trx->ref_id}. " . $errorMsg);
                    
                    // JIKA PUSAT BILANG DATA TIDAK ADA, LANGSUNG SET GAGAL BIAR TIDAK DITANYA LAGI
                    if (strpos(strtolower($errorMsg), 'tidak ditemukan') !== false || strpos(strtolower($errorMsg), 'not found') !== false) {
                        DB::table('transaksi')->where('id', $trx->id)->update([
                            'status' => 'gagal',
                            'updated_at' => now(),
                            'keterangan' => 'Data tidak ditemukan di provider'
                        ]);
                        $this->warn("🧹 CLEANUP: Trx {$trx->ref_id} otomatis diset GAGAL karena ID tidak valid di pusat.");
                    }
                }
            } catch (\Exception $e) {
                $this->error("🔌 Koneksi error saat cek Trx {$trx->ref_id}: " . $e->getMessage());
            }
        }

        $this->info("🏁 Robot selesai bertugas!");
    }
}
