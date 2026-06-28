<?php
namespace App\Processors;

use App\Services\DigiflazzService;
use Illuminate\Support\Facades\Log;

class DigiProcessor {
    public static function order($ref_id, $tujuan, $kode) {
        Log::info("📡 [DIGI-VIP] Menembak Pusat Real-Time | Ref: $ref_id | Kode: $kode");
        try {
            $srv = app(DigiflazzService::class);
            
            // Eksekusi tembakan ke Service Digiflazz Lu
            $res = $srv->placeOrder($ref_id, $tujuan, $kode);
            
            // Mapping Status Digiflazz ke standar H2H MilaStore
            $statusFinal = 'Pending';
            $safeSn = 'Proses...';
            $trxid = null;

            if ($res && isset($res['success'])) {
                if ($res['success'] === true) {
                    $statusRaw = $res['status'] ?? 'Pending'; // Status dari Digiflazz (Bisa Gagal, Sukses, Pending)
                    $safeSn = (!empty($res['sn'])) ? $res['sn'] : ($res['message'] ?? 'PROSES');
                    
                    if ($statusRaw === 'Sukses') {
                        $statusFinal = 'Sukses';
                        $trxid = $safeSn; // Gunakan SN sebagai TRX ID jika sukses
                    } elseif ($statusRaw === 'Gagal') {
                        $statusFinal = 'Gagal';
                    }
                } else {
                    // Kalau success === false dari Digiflazz (Ditolak mutlak)
                    $statusFinal = 'Gagal';
                    $safeSn = $res['message'] ?? 'Ditolak Provider';
                }
            } else {
                $statusFinal = 'Gagal';
                $safeSn = 'Tidak ada respon dari server pusat';
            }

            return [
                'status' => $statusFinal, 
                'sn'     => $safeSn, 
                'trxid'  => $trxid
            ];

        } catch (\Exception $e) {
            Log::error("❌ [DIGI-VIP CRITICAL] Error: " . $e->getMessage());
            // Main aman kalau timeout
            return ['status' => 'Pending', 'sn' => 'Menunggu respon provider', 'trxid' => null];
        }
    }
}
