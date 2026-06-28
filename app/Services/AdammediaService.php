<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdammediaService {
    protected function cfg() {
        return [
            'id'    => env('ADAMMEDIA_MEMBER_ID'),
            'pin'   => env('ADAMMEDIA_PIN'),
            'pass'  => env('ADAMMEDIA_PASSWORD'),
            'url'   => 'http://103.178.153.129:6969',
        ];
    }

    public function placeOrder($refId, $target, $productCode) {
        $c = $this->cfg();
        try {
            $res = Http::timeout(45)->get("{$c['url']}/trx", [
                'product' => $productCode, 'qty' => 1, 'dest' => $target,
                'refID'   => $refId, 'memberID' => $c['id'], 'pin' => $c['pin'], 'password' => $c['pass']
            ]);
            $body = $res->body();
            $cleanMsg = $body;
            
            // 🧹 FILTER SULTAN: Sapu bersih format mesin Otomax
            $cleanMsg = preg_replace("/status=\d+&message=/i", "", $cleanMsg);

            if (preg_match('/\.?\s*(Saldo|Sal\s)/i', $cleanMsg)) {
                $parts = preg_split('/\.?\s*(Saldo|Sal\s)/i', $cleanMsg);
                $cleanMsg = trim($parts[0]);
            }
            if (stripos($cleanMsg, 'Yth.') !== false && stripos($cleanMsg, 'ID') !== false) {
                $parts = explode('. ', $cleanMsg);
                if (count($parts) > 2) { unset($parts[0], $parts[1]); $cleanMsg = implode('. ', $parts); }
            }
            $lowerBody = strtolower($body);
            if (str_contains($lowerBody, 'sukses')) {
                preg_match('/SN\/Ref:?\s*([A-Z0-9.\-\/]+)/i', $body, $matches);
                return ['status' => 'SUKSES', 'sn' => $matches[1] ?? 'OK', 'msg' => $cleanMsg];
            }
            if (str_contains($lowerBody, 'gagal') || str_contains($lowerBody, 'kosong')) {
                $cleanMsg = rtrim($cleanMsg, '.');
                return ['status' => 'GAGAL', 'sn' => $cleanMsg, 'msg' => $cleanMsg];
            }
            return ['status' => 'PROSES', 'sn' => 'PROSES', 'msg' => $cleanMsg];
        } catch (\Exception $e) {
            return ['status' => 'PROSES', 'sn' => 'TIMEOUT', 'msg' => 'Menunggu Respon Provider'];
        }
    }

    public function getInfo() {
        $c = $this->cfg();
        try {
            return Http::timeout(10)->get("{$c['url']}/balance", ['memberID' => $c['id'], 'pin' => $c['pin'], 'password' => $c['pass']])->body();
        } catch(\Exception $e) { return "Koneksi Bermasalah"; }
    }

    // 🚀 LOGIKA STOK REAL-TIME & OPEN/CLOSE
    public function getLiveStock() {
        try {
            $key = env('ADAMMEDIA_API_KEY');
            $stockData = [];
            
            // CIRCLES
            $c = Http::withHeaders(['x-api-key' => $key])->timeout(10)->get("https://juraganxl.my.id/api/circles");
            if ($c->successful() && is_array($c->json())) {
                foreach ($c->json() as $i) {
                    if (isset($i['config'])) {
                        $stockData[] = ['kode' => strtoupper($i['config']), 'stok' => (!isset($i['open']) || $i['open'] ? (int)($i['count'] ?? 0) : 0)];
                    }
                }
            }
            // REGULERS
            $r = Http::withHeaders(['x-api-key' => $key])->timeout(10)->get("https://juraganxl.my.id/api/regulers");
            if ($r->successful() && is_array($r->json())) {
                foreach ($r->json() as $i) {
                    if (isset($i['config'])) {
                        $kode = strtoupper($i['config']);
                        if (!collect($stockData)->contains('kode', $kode)) {
                            $stockData[] = ['kode' => $kode, 'stok' => (!isset($i['open']) || $i['open'] ? (int)($i['count'] ?? 0) : 0)];
                        }
                    }
                }
            }
            return $stockData;
        } catch (\Exception $e) { return []; }
    }

    public function getInfoAdmin() {
        $c = $this->cfg();
        try {
            $res = Http::timeout(10)->get("{$c['url']}/balance", ['memberID' => $c['id'], 'pin' => $c['pin'], 'password' => $c['pass']])->body();
            preg_match('/Saldo\s*([\d.]+)/i', $res, $saldoM);
            $saldo = isset($saldoM[1]) ? (int) str_replace('.', '', $saldoM[1]) : 0;
            preg_match('/Pakai hari ini\s*([\d.]+)/i', $res, $usedM);
            $used = isset($usedM[1]) ? (int) str_replace('.', '', $usedM[1]) : 0;
            preg_match('/Komisi\s*([\d.]+)/i', $res, $komisiM);
            $komisi = isset($komisiM[1]) ? (int) str_replace('.', '', $komisiM[1]) : 0;
            return ['saldo' => $saldo, 'used' => $used, 'komisi' => $komisi, 'id' => $c['id']];
        } catch(\Exception $e) { return ['saldo' => 0, 'used' => 0, 'komisi' => 0, 'id' => $c['id']]; }
    }

    public function getLiveStockAdmin($type = 'regulers') {
        try {
            $key = env('ADAMMEDIA_API_KEY');
            $res = Http::withHeaders(['x-api-key' => $key])->timeout(15)->get("https://juraganxl.my.id/api/{$type}");
            $stockData = [];
            if ($res->successful() && is_array($res->json())) {
                foreach ($res->json() as $i) {
                    if (isset($i['config'])) {
                        $stockData[] = ['config' => strtoupper($i['config']), 'name' => $i['name'] ?? $i['config'], 'price' => $i['price'] ?? 0, 'status' => $i['status'] ?? 'pagi'];
                    }
                }
            }
            return $stockData;
        } catch (\Exception $e) { return []; }
    }

    public function requestTicket($amount) {
        $c = $this->cfg();
        try {
            $amt = preg_replace('/[^0-9]/', '', $amount);
            return Http::timeout(15)->get("{$c['url']}/ticket", ['amount' => $amt, 'memberID' => $c['id'], 'pin' => $c['pin'], 'password' => $c['pass']])->body();
        } catch(\Exception $e) { return "Gagal Request Tiket"; }
    }
}
