<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KhfyService
{
    protected $baseUrl = 'https://panel.khfy-store.com/api_v2'; 
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('KHFY_API_KEY');
    }

    public function request($endpoint, $data = [])
    {
        try {
            $queryData = array_merge(['api_key' => $this->apiKey], $data);
            
            // Bypass khusus untuk Endpoint V3 (XLA dan XDA)
            if ($endpoint == '/cek_stock_akrab' || $endpoint == '/cek_stock_akrab_v2') {
                $url = 'https://panel.khfy-store.com/api_v3' . $endpoint;
            } else {
                $url = $this->baseUrl . $endpoint;
            }

            $response = Http::timeout(30)->get($url, $queryData);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("Khfy API Error: " . $response->body());
            return ['ok' => false, 'message' => 'Status API: ' . $response->status()];

        } catch (\Exception $e) {
            Log::error("Khfy Connection Error: " . $e->getMessage());
            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }

    public function order($produk, $tujuan, $reff_id)
    {
        return $this->request('/trx', [
            'produk' => $produk,
            'tujuan' => $tujuan,
            'reff_id' => $reff_id
        ]);
    }
}
