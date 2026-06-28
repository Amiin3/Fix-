<?php
namespace App\Http\Processors;

use App\Services\DigiflazzService;

class DigiProcessor {
    public static function process($trx, $kode, $tujuan, $ref_id) {
        $srv = app(DigiflazzService::class);
        $res = $srv->placeOrder($ref_id, $tujuan, $kode);
        
        if (!$res) return ['status' => 'Pending', 'sn' => 'TIMEOUT'];

        if (isset($res['data']['status'])) {
            $s = $res['data']['status'];
            return [
                'status' => ($s === 'Sukses') ? 'Sukses' : (($s === 'Gagal') ? 'Gagal' : 'Pending'),
                'sn' => ($s === 'Sukses') ? ($res['data']['sn'] ?? 'Sukses') : ($res['data']['message'] ?? 'PROSES')
            ];
        }
        return ['status' => 'Pending', 'sn' => 'PROSES'];
    }
}
