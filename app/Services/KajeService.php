<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KajeService
{
    protected $baseUrl = 'https://end.kaje-store.com';
    protected $apiKey = 'a30381046fc95b29d301c2da79c610375fc582998401ec62bceb82c67e23'; // Ganti API Key Asli Bos

    protected function request($endpoint, $data = [])
    {
        try {
            $req = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(10);

            // FIX 500 ERROR: Jika data kosong, kirim body JSON murni "{}" tanpa merusak tipe data Laravel
            if (empty($data)) {
                $response = $req->withBody('{}', 'application/json')->post($this->baseUrl . $endpoint);
            } else {
                $response = $req->post($this->baseUrl . $endpoint, $data);
            }
            
            return $response->json();
        } catch (\Throwable $e) { // Pakai Throwable untuk menangkap Fatal Error PHP
            Log::error("🚨 KAJE API ERROR [{$endpoint}]: " . $e->getMessage());
            return ['success' => false, 'message' => 'Gagal terhubung ke Server Pusat: ' . $e->getMessage()];
        }
    }

    public function checkSaldo() { return $this->request('/api/info/saldo'); }
    public function placeOrder($destination, $code, $refId) {
        return $this->request('/api/service/order-product', ['destination' => $destination, 'ref_id' => $refId, 'code' => $code]);
    }
    public function checkTrx($trxId) { return $this->request('/api/info/trx-id', ['trx_id' => $trxId]); }
    public function fetchKajeProducts() { return $this->request('/api/service/list-product'); }
    
    public function getStock() { 
        $res = $this->request('/api/service/stock-product');
        return $res;
    }

    // Alat Sakti XL
    public function xlGetOtp($number) { return $this->request('/api/xl-auth/get-otp', ['number' => $number]); }
    public function xlLoginOtp($number, $otp) { return $this->request('/api/xl-auth/login-otp', ['number' => $number, 'code_otp' => $otp]); }
    public function xlCheckQuota($number) { return $this->request('/api/xl-info/quotas', ['number' => $number]); }
    public function xlCheckBalance($number) { return $this->request('/api/xl-info/balance', ['number' => $number]); }
    public function xlLockBalance($number, $isLocked = true) { return $this->request('/api/xl-update/set-lock-balance', ['number' => $number, 'is_locked' => $isLocked]); }
}
