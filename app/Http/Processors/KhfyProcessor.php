<?php
namespace App\Http\Processors;

use App\Services\KhfyService;
use Illuminate\Support\Facades\DB;

class KhfyProcessor {
    public static function process($trx, $kode, $tujuan, $ref_id) {
        $srv = app(KhfyService::class);
        $res = $srv->request('/trx', ['layanan' => $kode, 'tujuan' => $tujuan, 'refid' => $ref_id]);
        
        $raw = is_string($res) ? $res : json_encode($res);
        if (strpos($raw, '#Gagal') !== false) {
            $parts = explode('#', $raw);
            $errRaw = $parts[1] ?? 'Gagal Sistem';
            $sn = trim(str_replace(['Gagal.', 'Gagal'], '', explode('@', $errRaw)[0]));
            return ['status' => 'Gagal', 'sn' => $sn];
        }
        
        return [
            'status' => (isset($res['success']) && $res['success']) ? 'Sukses' : 'Pending',
            'sn' => $res['data']['sn'] ?? ($res['message'] ?? 'PROSES')
        ];
    }
}
