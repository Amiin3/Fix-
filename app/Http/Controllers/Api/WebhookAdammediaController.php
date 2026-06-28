<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\TelegramService;

class WebhookAdammediaController extends Controller {

    public function handle(Request $request) {
        $data = $request->all();
        Log::info('--- CALLBACK ADAM MEDIA (IRS) MASUK ---', $data);

        $refId = $request->refid ?? $request->refID;
        $message = $request->message ?? '';

        if (!$refId) return response()->json(['success' => false, 'msg' => 'No RefID']);

        try {
            DB::beginTransaction();

            // 1. CARI TRANSAKSI & KUNCI (Anti Double Proses)
            $trx = DB::table('transaksi')
                ->where('ref_id', $refId)
                ->lockForUpdate()
                ->first();

            // 2. PASTIKAN STATUS MASIH GANTUNG
            if ($trx && in_array(strtoupper($trx->status), ['PENDING', 'PROSES', 'PROSES_API', 'MENUNGGU'])) {
                
                $status_notif = "";
                $sn_final = 'OK';

                // 🎯 LOGIKA SUKSES
                if (stripos($message, 'SUKSES') !== false) {
                    preg_match('/SN\/Ref:?\s*([A-Z0-9.\-\/]+)/i', $message, $matches);
                    $sn_final = $matches[1] ?? 'OK';

                    DB::table('transaksi')->where('id', $trx->id)->update([
                        'status' => 'Sukses',
                        'sn' => $sn_final,
                        'updated_at' => now()
                    ]);
                    $status_notif = "Sukses";

                } 
                // 🎯 LOGIKA GAGAL (REFUND TANPA PILIH KASIH)
                elseif (stripos($message, 'GAGAL') !== false || stripos($message, 'kosong') !== false) {
                    $sn_final = $this->sensorSaldo($message);
                    
                    DB::table('transaksi')->where('id', $trx->id)->update([
                        'status' => 'Gagal',
                        'sn' => $sn_final,
                        'updated_at' => now()
                    ]);

                    // Pukul rata, semua yang gagal wajib balik saldo
                    DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
                    $status_notif = "Gagal";
                } else {
                    // Kalau statusnya gak jelas, batalkan dan biarkan tetap pending
                    DB::rollBack();
                    return response()->json(['success' => true, 'msg' => 'Ignored - Status Unknown']);
                }

                // ==========================================================
                // ✅ KUNCI DATABASE DULUAN (ANTI PENDING ABADI)
                // ==========================================================
                DB::commit();

                // ==========================================================
                // 🚀 JALUR NOTIFIKASI (Aman dari error rollback)
                // ==========================================================
                if ($status_notif !== "") {
                    try {
                        // 1. Notif Telegram
                        if ($status_notif === 'Sukses') {
                            TelegramService::sendMessage("✅ *TRANSAKSI ADAM MEDIA SUKSES*\nTrx: $refId\nUser: {$trx->username}\nSN: $sn_final");
                        } else {
                            TelegramService::sendMessage("🔄 *REFUND ADAM MEDIA*\nTrx: $refId\nUser: {$trx->username}\nSaldo kembali: Rp " . number_format($trx->harga));
                        }
                        
                        // 2. Pelatuk Webhook H2H Reseller
                        if (class_exists('\App\Http\Controllers\Api\H2HController')) {
                            \App\Http\Controllers\Api\H2HController::sendWebhook($refId);
                        }
                    } catch (\Throwable $notifErr) {
                        Log::error("[ADAM MEDIA NOTIF ERROR] " . $notifErr->getMessage());
                    }
                }

            } else {
                // Kalau transaksi gak ketemu atau sudah sukses/gagal
                DB::rollBack();
            }

            return response()->json(['success' => true]);

        } catch (\Throwable $e) {
            // Pakai Throwable biar nangkep error syntax/typo juga
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('WEBHOOK ADAM MEDIA CRITICAL: ' . $e->getMessage());
            return response('Error', 500);
        }
    }

    // FUNGSI SENSOR SALDO MILASTORE DARI PROVIDER
    private function sensorSaldo($msg) {
        if (stripos($msg, 'Saldo') !== false) {
            $parts = explode('Saldo', $msg);
            return trim($parts[0]) . ' [MilaStore]';
        }
        return $msg;
    }
}
