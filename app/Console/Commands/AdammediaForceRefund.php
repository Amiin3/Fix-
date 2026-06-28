<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Models\PpobTransaction;
use App\Models\User;

class AdammediaForceRefund extends Command {
    protected $signature = 'adammedia:force-refund';
    protected $description = 'Paksa semua transaksi Adammedia yang gantung jadi GAGAL & REFUND';

    public function handle() {
        // Cari semua yang masih nyangkut
        $pending = PpobTransaction::whereIn('status', ['PROSES', 'PENDING', 'proses', 'pending'])->get();
        
        $this->info("🔍 Menemukan " . $pending->count() . " transaksi gantung.");

        foreach ($pending as $trx) {
            $user = User::where('name', $trx->username)->first();
            
            if ($user) {
                // Kembalikan Saldo
                $user->increment('saldo', $trx->price);
                
                // Update Status ke Gagal
                $trx->update([
                    'status' => 'GAGAL',
                    'sn' => 'REFUNDED',
                    'message' => 'Gagal: Refunded by System (Provider Gagal)'
                ]);
                
                $this->info("✅ TRX {$trx->ref_id} -> BERHASIL DI-REFUND!");
            }
        }
        $this->info("🚀 SEMUA TRANSAKSI SELESAI DIBERSIHKAN!");
    }
}
