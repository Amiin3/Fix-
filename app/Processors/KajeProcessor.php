<?php
namespace App\Processors;

use App\Services\KajeService;
use Illuminate\Support\Facades\Log;

class KajeProcessor {
    public static function order($ref_id, $tujuan, $kode) {
        Log::info("📡 [KAJE-VIP] Menembak Pusat Real-Time | Ref: $ref_id | Kode: $kode");
        try {
            $srv = app(KajeService::class);
            
            // 🔥 FIX: Urutan parameter disesuaikan dengan KajeService ($destination, $code, $refId)
            $res = $srv->placeOrder($tujuan, $kode, $ref_id);
            
            Log::info("📥 [KAJE-VIP] Respon Pusat: " . json_encode($res));

            $statusFinal = 'Pending';
            $safeSn = 'Proses...';
            $trxid = null;

            if ($res && isset($res['success'])) {
                if ($res['success'] === true) {
                    $statusRaw = $res['status'] ?? 'Pending';
                    $safeSn = (!empty($res['sn'])) ? $res['sn'] : ($res['message'] ?? 'PROSES');
                    
                    if ($statusRaw === 'Sukses') {
                        $statusFinal = 'Sukses';
                        $trxid = $safeSn;
                    } elseif ($statusRaw === 'Gagal') {
                        $statusFinal = 'Gagal';
                    }
                } else {
                    $statusFinal = 'Gagal';
                    $safeSn = $res['message'] ?? 'Ditolak Provider/Stok Kosong';
                }
            } else {
                // Jika respon null atau tidak ada field success
                $statusFinal = 'Gagal';
                $safeSn = 'Provider tidak merespon (Timeout)';
            }

            return ['status' => $statusFinal, 'sn' => $safeSn, 'trxid' => $trxid];

        } catch (\Exception $e) {
            Log::error("❌ [KAJE-VIP CRITICAL] Error: " . $e->getMessage());
            return ['status' => 'Pending', 'sn' => 'Gangguan koneksi pusat', 'trxid' => null];
        }
    }
}
