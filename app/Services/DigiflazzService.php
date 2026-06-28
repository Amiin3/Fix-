<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigiflazzService {
    protected $user;
    protected $key;
    protected $endpoint = 'https://api.digiflazz.com/v1';

    public function __construct() {
        $this->user = trim(env('DIGI_USERNAME'));
        $this->key = trim(env('DIGI_APIKEY', env('DIGI_PRODUCTION_KEY')));
    }

    public function placeOrder($buyerRefId, $customerNo, $productCode) {
        try {
            $ref = trim((string) $buyerRefId);
            $sign = md5($this->user . $this->key . $ref);

            $payload = [
                'username'       => $this->user,
                'buyer_sku_code' => trim((string) $productCode),
                'customer_no'    => trim((string) $customerNo),
                'ref_id'         => $ref,
                'sign'           => $sign,
                'testing'        => false // 🟢 SEKARANG SUDAH AKTIF (GAK KE-COMMENT)
            ];

            Log::info("📡 [DIGI-SEND] Nembak Digiflazz: " . json_encode($payload));

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->timeout(60)->post($this->endpoint . '/transaction', $payload);

            $res = $response->json();
            Log::info("🎯 [DIGI-RECEIVE] Balasan: " . json_encode($res));

            if ($response->successful() && isset($res['data'])) {
                return [
                    'success' => true,
                    'status'  => $res['data']['status'] ?? 'Pending',
                    'sn'      => $res['data']['sn'] ?? '',
                    'message' => $res['data']['message'] ?? '',
                    'data'    => $res['data']
                ];
            }

            return [
                'success' => false,
                'message' => $res['data']['message'] ?? ($res['message'] ?? 'API Provider Gagal')
            ];

        } catch (\Exception $e) {
            Log::error("❌ [DIGI-CRITICAL] " . $e->getMessage());
            return ['success' => false, 'message' => 'Sistem Error: ' . $e->getMessage()];
        }
    }
}
