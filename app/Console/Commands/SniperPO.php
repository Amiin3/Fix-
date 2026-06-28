<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Services\AdammediaService;
use Illuminate\Support\Facades\Cache;

class SniperPO extends Command
{
    protected $signature = 'sniper:po';
    protected $description = 'Mengeksekusi antrean PO. Patuh pada saklar Admin. (Live Sync V8)';

    public function handle(AdammediaService $srv)
    {
        for ($i = 0; $i < 12; $i++) {
            if (Cache::get('po_v8_mode', 'auto') === 'manual') { sleep(5); continue; }

            $liveStocks = $srv->getLiveStock();
            if (!empty($liveStocks)) {
                // 🚀 ANTI-GHOST: Pukul rata 0 dulu
                DB::table("ppob_products")->where("product_code", "LIKE", "%XDA%")->orWhere("product_code", "LIKE", "%XCLP%")->update(["stock_count" => 0]);
                
                // Isi ulang sesuai live API
                foreach ($liveStocks as $st) {
                    DB::table('ppob_products')->where('product_code', $st['kode'])->update(['stock_count' => $st['stok']]);
                }
            }

            $antrean = DB::table('transaksi')->where('status', 'Pre-Order')->where('is_po', 1)->get();
            if ($antrean->isNotEmpty()) {
                foreach ($antrean as $trx) {
                    $p = DB::table('ppob_products')->where('product_code', $trx->kode_layanan)->first();
                    if ($p && $p->stock_count > 0) {
                        $res = $srv->placeOrder($trx->ref_id, $trx->tujuan, $trx->kode_layanan);
                        $statusAsli = strtoupper($res['status'] ?? '');
                        $pesan = $res['sn'] ?? $res['message'] ?? 'Gangguan';
                        
                        if ($statusAsli === '20' || $statusAsli === 'SUCCESS' || $statusAsli === 'SUKSES') {
                            DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'sn' => $pesan, 'updated_at' => now()]);
                            $user = DB::table('users')->where('name', $trx->username)->first();
                            if ($user && !empty($user->uplink_id)) { DB::table("users")->where("id", $user->uplink_id)->increment("komisi", 50); }
                        } elseif ($statusAsli === '52' || str_contains(strtolower($pesan), 'salah')) {
                            $user = DB::table('users')->where('name', $trx->username)->first();
                            if ($user && $trx->is_refunded == 0) {
                                DB::transaction(function() use ($user, $trx, $pesan) {
                                    DB::table('users')->where('id', $user->id)->increment('saldo', $trx->harga);
                                    DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => 'Refunded: ' . $pesan, 'is_refunded' => 1, 'updated_at' => now()]);
                                });
                            }
                        } else {
                            DB::table('transaksi')->where('id', $trx->id)->update(['retry_count' => DB::raw('retry_count + 1'), 'sn' => 'Antre PO (Retry ' . ($trx->retry_count + 1) . '): ' . $pesan, 'updated_at' => now()]);
                        }
                    }
                }
            }
            sleep(5);
        }
    }
}
