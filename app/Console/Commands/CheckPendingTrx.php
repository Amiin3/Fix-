<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DigiflazzService;
use Exception;

class CheckPendingTrx extends Command
{
    protected $signature = 'trx:patroli';
    protected $description = 'Mengecek ulang transaksi Pending ke Provider (Digiflazz & Khfy)';

    public function handle(DigiflazzService $digiflazz)
    {
        Log::info("[PATROLI TRX] Memulai pengecekan transaksi Pending...");
        $pendings = DB::table('transaksi')
            ->where('status', 'Pending')
            ->where('created_at', '<=', now()->subMinutes(5))
            ->where('created_at', '>=', now()->subHours(24))
            ->get();

        if ($pendings->isEmpty()) return;

        foreach ($pendings as $trx) {
            try {
                DB::beginTransaction();
                $lockedTrx = DB::table('transaksi')->where('id', $trx->id)->lockForUpdate()->first();
                
                if (strtolower($lockedTrx->status) !== 'pending') {
                    DB::rollBack();
                    continue;
                }

                // 🚨 FIX: CEGAH SALAH TEMBAK KE DIGIFLAZZ!
                if (strpos($trx->ref_id, 'KJE-') === 0 || strpos($trx->ref_id, 'KJ-') === 0) {
                    Log::info("[PATROLI TRX] Skip Kaje Ref {$trx->ref_id} - Biar sistem Kaje yang urus.");
                    DB::rollBack();
                    continue; // LEWATI TRANSAKSI KAJE!
                }

                if (strpos($trx->ref_id, 'AKR') !== false || strlen($trx->ref_id) > 20) {
                    Log::info("[PATROLI TRX] Khfy Ref {$trx->ref_id} (Butuh endpoint API Khfy)");
                } else {
                    $cekStatus = $digiflazz->placeOrder($trx->ref_id, $trx->tujuan, $trx->kode_layanan);
                    if (isset($cekStatus['data'])) {
                        $statusDigi = $cekStatus['data']['status'] ?? 'Pending';
                        $sn = $cekStatus['data']['sn'] ?? '';
                        $msg = $cekStatus['data']['message'] ?? '';

                        if ($statusDigi === 'Sukses') {
                            $this->sukseskanTrx($lockedTrx, $sn ?: 'Sukses via Patroli');
                        } elseif ($statusDigi === 'Gagal') {
                            $this->gagalkanTrx($lockedTrx, "Gagal via Patroli: $msg");
                        }
                    }
                }
                DB::commit();
            } catch (Exception $e) {
                DB::rollBack();
                Log::error("[PATROLI TRX] Error cek Ref {$trx->ref_id}: " . $e->getMessage());
            }
        }
    }

    private function sukseskanTrx($trx, $sn) {
        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'sn' => $sn, 'updated_at' => now()]);
        Log::info("[PATROLI TRX] SUKSES UPDATE: {$trx->ref_id}");
    }

    private function gagalkanTrx($trx, $alasan) {
        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => $alasan, 'updated_at' => now()]);
        $user = DB::table('users')->where('name', $trx->username)->first();
        if ($user) {
            DB::table('users')->where('id', $user->id)->increment('saldo', $trx->harga);
            Log::info("[PATROLI TRX] GAGAL & REFUND Rp {$trx->harga} ke {$user->name}");
        }
    }
}
