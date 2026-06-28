<?php
namespace App\Processors;

use App\Services\KhfyService;
use Illuminate\Support\Facades\Log;

class KhfyProcessor {
    public static function order($ref_id, $tujuan, $kode) {
        Log::info("📡 [KHFY-H2H] Kurir Nembak Pusat | Ref: $ref_id | Kode: $kode");
        try {
            $srv = app(KhfyService::class);
            $res = $srv->request('/trx', [
                'produk'  => $kode,
                'tujuan'  => $tujuan,
                'reff_id' => $ref_id
            ]);

            // 🎯 AMBIL PESAN RAW MURNI
            $rawMsg = is_array($res) ? ($res['msg'] ?? $res['message'] ?? json_encode($res)) : (string)$res;
            
            // 🛡️ BENTENG SENSOR RAHASIA DAPUR MUTLAK
            $cleanMsg = $rawMsg;
            if (strpos($rawMsg, '#') !== false) {
                $parts = explode('#', $rawMsg);
                $cleanMsg = '#' . trim($parts[1]);
            } else {
                $cleanMsg = preg_replace('/(kodereseller=|password=|pin=)[^&]+&?/i', '***&', $cleanMsg);
            }

            // FILTER KENDALA SALDO PUSAT (BIAR RESELLER GAK TAU SALDO KITA HABIS)
            if (stripos($cleanMsg, 'saldo') !== false) {
                $cleanMsg = "Gangguan jalur pusat, silakan coba beberapa saat lagi.";
            }

            // ⚖️ HAKIM PENENTU LOGIKA (STRICT MODE)
            $isGagal = false;
            $lowerRaw = strtolower($rawMsg);
            
            if (str_contains($lowerRaw, 'gagal') || str_contains($lowerRaw, 'salah') || str_contains($lowerRaw, 'wilayah') || str_contains($lowerRaw, 'kosong') || str_contains($lowerRaw, 'habis')) {
                $isGagal = true;
            } elseif (is_array($res) && empty($res['ok']) && !str_contains($lowerRaw, 'sukses') && !str_contains($lowerRaw, 'proses')) {
                $isGagal = true;
            }

            if ($isGagal) {
                Log::warning("⛔ [KHFY-H2H] Ditolak Pusat: $rawMsg -> Sensor Output: $cleanMsg");
                return ['status' => 'Gagal', 'sn' => $cleanMsg, 'trxid' => null];
            }

            // ✅ JIKA PROSES BERHASIL DITERIMA PUSAT
            $trxid = is_array($res) ? ($res['data']['trxid'] ?? $res['trxid'] ?? 'PROSES') : 'PROSES';
            return ['status' => 'Pending', 'sn' => $cleanMsg, 'trxid' => $trxid];

        } catch (\Exception $e) {
            // 🔥 ANTI RUGI BANDAR: JIKA TIMEOUT/KONEKSI PUTUS, TAHAN STATUS PENDING!
            Log::error("❌ [KHFY-H2H CRITICAL] Error Koneksi: " . $e->getMessage());
            return ['status' => 'Pending', 'sn' => 'Menunggu respon provider', 'trxid' => null];
        }
    }
}
