<?php
namespace App\Processors;

use App\Services\AdammediaService;
use Illuminate\Support\Facades\Log;

class AdamProcessor {
    public static function order($ref_id, $tujuan, $kode) {
        Log::info("📡 [ADAM-LIVE] Kurir Nembak Pusat | Ref: $ref_id | Kode: $kode | Target: $tujuan");
        
        try {
            // Panggil Service Adam Media
            $srv = app(AdammediaService::class);
            $res = $srv->placeOrder($ref_id, $tujuan, $kode);
            
            // Ambil Status dan Pesan Mentah
            $statusRaw = strtoupper($res['status'] ?? 'PROSES');
            // Terkadang pesan error ada di parameter 'message', jadi kita jaga-jaga
            $safeSn = (string) ($res['sn'] ?? $res['message'] ?? 'Sedang diproses pusat');
            $trxid = $res['trxid'] ?? null;

            // ✂️ THE TRIMMER: PEMBANTAI INFO SALDO & SENSOR KEAMANAN
            if ($statusRaw === 'GAGAL' || $statusRaw === 'FAILED') {
                
                // 1. Potong teks variasi "Sal 1.682" atau ". Saldo 1.682" beserta sisa waktu di belakangnya
                // Regex ini sangat pintar, dia akan mencari kata Sal/Saldo yang diikuti angka.
                $safeSn = preg_replace('/(\.\s*)?Sal(do)?\s*[:]?\s*[\d\.\,]+.*/i', '', $safeSn);
                
                // 2. Sensor Rahasia: Cegah pesan "Saldo tidak cukup" bocor ke Reseller
                if (stripos($safeSn, 'saldo') !== false) {
                    $safeSn = 'Sistem Pusat Sedang Sibuk / Maintenance.';
                }

                // 3. Rapikan spasi dan buang titik sisa di akhir kalimat (Biar nggak kaku "GAGAL. ")
                $safeSn = rtrim(trim($safeSn), '.');
                
                // 4. Fallback jika string tiba-tiba kosong setelah dipotong
                if (empty($safeSn)) {
                    $safeSn = "Transaksi Gagal. Nomor tujuan salah atau gangguan provider.";
                }
            }

            // ⚖️ PENENTUAN STATUS FINAL UNTUK DATABASE
            $statusFinal = 'Pending';
            if (in_array($statusRaw, ['SUKSES', 'SUCCESS'])) {
                $statusFinal = 'Sukses';
            } elseif (in_array($statusRaw, ['GAGAL', 'FAILED'])) {
                $statusFinal = 'Gagal';
            }

            Log::info("✅ [ADAM-LIVE] Hasil: $statusFinal | SN/Pesan: $safeSn");

            return [
                'status' => $statusFinal, 
                'sn' => $safeSn, 
                // Jika sukses, lempar TrxID dari provider. Jika tidak ada, pakai SN.
                'trxid' => ($statusFinal === 'Sukses' ? ($trxid ?: $safeSn) : null)
            ];

        } catch (\Exception $e) {
            // Tangkap Error Sistem (Timeout, API Down, dll)
            Log::error("❌ [ADAM-LIVE CRITICAL] Error: " . $e->getMessage());
            return [
                'status' => 'Pending', 
                'sn' => 'Sistem sedang menghubungi pusat...', 
                'trxid' => null
            ];
        }
    }
}
