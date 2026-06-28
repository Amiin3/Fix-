<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HesdaService {
    protected $baseUrl = 'https://api.hesda-store.com/v2';
    protected $email;
    protected $password;
    protected $apiKey;

    public function __construct() {
        $this->email = env('HESDA_EMAIL');
        $this->password = env('HESDA_PASSWORD');
        $this->apiKey = env('HESDA_API_KEY');
    }

    // 1. CEK SALDO
    public function getBalance() {
        try {
            $response = Http::withBasicAuth($this->email, $this->password)
                ->timeout(10)
                ->get("{$this->baseUrl}/saldo", [
                    'hesdastore' => $this->apiKey
                ]);

            return $response->json();
        } catch (\Exception $e) {
            return ['status' => false, 'message' => 'Koneksi Hesda Terputus'];
        }
    }

    // 2. TARIK DAFTAR PAKET (pa, invite, bes)
    public function getPackages($jenis) {
        try {
            $response = Http::withBasicAuth($this->email, $this->password)
                ->timeout(15)
                ->get("{$this->baseUrl}/list_paket", [
                    'hesdastore' => $this->apiKey,
                    'jenis' => $jenis
                ]);

            return $response->json();
        } catch (\Exception $e) {
            return ['status' => false, 'message' => 'Gagal menarik paket'];
        }
    }

    // 📦 4. FITUR BARU: CEK STOK AKRAB
    public function cekStok($type = null) {
        try {
            $params = ['hesdastore' => $this->apiKey];
            if ($type) $params['type'] = $type;

            $response = Http::withBasicAuth($this->email, $this->password)
                ->timeout(10)
                ->get("{$this->baseUrl}/cek_stok_akrab", $params);
            
            return $response->json();
        } catch (\Exception $e) {
            return ['status' => false, 'message' => 'Gagal menarik data stok'];
        }
    }
}