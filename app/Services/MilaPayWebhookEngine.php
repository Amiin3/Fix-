<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MilaPayWebhookEngine {
    public static function fire($deposit_id) {
        try {
            $deposit = DB::table('deposits')->where('id', $deposit_id)->first();
            if (!$deposit) return false;

            $status = strtoupper($deposit->status);
            if (!in_array($status, ['SUKSES', 'BERHASIL', 'LUNAS'])) return false;

            $keterangan = $deposit->keterangan ?? '';
            if (strpos($keterangan, 'WEBHOOK:') === false) return false;

            // 🚀 SUPER STRICT URL CLEANER V12
            $temp = str_replace('WEBHOOK:', '', $keterangan);
            $parts = explode('|EXT:', $temp);
            
            // PAKSA URL BENAR-BENAR BERSIH
            $url = isset($parts[0]) ? trim(preg_replace('/\s+/', '', $parts[0])) : '';
            $ext_id = isset($parts[1]) ? trim($parts[1]) : '';

            if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
                Log::warning("MilaPay Webhook Engine Batal: URL Rusak/Kosong TRX {$deposit_id}");
                return false;
            }

            // AMBIL DATA USER UNTUK SECRET KEY
            $user = DB::table('users')->find($deposit->user_id);
            $secret = $user->payment_secret ?? 'MILAPAY_V12_SECRET';
            
            // SIGNATURE MURNI V12
            $signature = md5($deposit->id . (int)$deposit->amount . $secret);

            // PAYLOAD SESUAI DOKUMENTASI V12
            $payload = [
                'status' => 'success',
                'trx_id' => (string)$deposit->id,
                'amount' => (int)$deposit->amount,
                'total_bayar' => (int)$deposit->total_bayar,
                'service' => $deposit->metode,
                'external_id' => $ext_id,
                'signature' => $signature
            ];

            // .WITHOUTVERIFYING() ADALAH KUNCI BIAR GAK ERROR SSL LAGI
            $response = Http::withoutVerifying()->timeout(15)
                ->withHeaders(['User-Agent' => 'MilaPay-Gateway/V12-Engine'])
                ->post($url, $payload);

            Log::info("MilaPay Webhook Fired: TRX {$deposit->id} to {$url} - Status: " . $response->status());
            
            return true;
        } catch (\Exception $e) {
            Log::error("MilaPay Webhook Gagal: TRX {$deposit_id} - " . $e->getMessage());
            return false;
        }
    }
}
