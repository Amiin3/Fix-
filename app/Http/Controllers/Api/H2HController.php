<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Processors\KhfyProcessor;
use App\Processors\AdamProcessor;
use App\Processors\DigiProcessor;
use App\Processors\KajeProcessor;

class H2HController extends Controller
{
    public function profile(Request $request) {
        $user = $request->get('h2h_user');
        return response()->json(['status' => true, 'message' => 'Koneksi Berhasil', 'data' => ['username' => $user->name, 'level' => $user->level, 'saldo' => (int) $user->saldo]]);
    }

    public function pricelist(Request $request) {
        try {
            $user = $request->get('h2h_user');
            $kReq = strtoupper($request->input('kategori') ?? '');
            $level = strtolower($user->level ?? 'member');
            $all = collect();

            $getHarga = function($hj, $hb) use ($level) {
                $hj = (float)$hj; $hb = (float)$hb;
                if ($hb <= 0) $hb = $hj;
                $final = ($level === 'reseller') ? ($hj - 150) : $hj;
                if ($final < $hb) $final = $hb + 50;
                return $final;
            };

            // 🚀 SENSOR XDA DARI KHFY DITERAPKAN DI SINI (NOT LIKE 'XDA%')
            try {
                $khfy = DB::table('layanan_khfy')
                    ->where('status', 'active')
                    ->where('kode_layanan', 'NOT LIKE', 'XDA%') 
                    ->get()->map(function($i) use ($getHarga) {
                    $arr = (array)$i;
                    return ['kode' => $arr['kode_layanan'] ?? '', 'nama' => $arr['nama_layanan'] ?? '', 'harga' => $getHarga($arr['harga_jual'] ?? 0, $arr['harga_beli'] ?? 0), 'kategori' => 'PRODUK XLA'];
                });
                $all = $all->concat($khfy);
            } catch (\Exception $e) {}

            try {
                $adam = DB::table('ppob_products')->where('is_active', 1)->get()->map(function($i) use ($getHarga) {
                    $arr = (array)$i;
                    return ['kode' => $arr['product_code'] ?? '', 'nama' => $arr['product_name'] ?? '', 'harga' => $getHarga($arr['price_sell'] ?? 0, $arr['price_cost'] ?? 0), 'kategori' => 'AKRAB XDA'];
                });
                $all = $all->concat($adam);
            } catch (\Exception $e) {}

            try {
                $kaje = DB::table('layanan_kaje')->get()->map(function($i) use ($getHarga) {
                    $arr = (array)$i;
                    return ['kode' => $arr['kode_layanan'] ?? '', 'nama' => $arr['nama_layanan'] ?? '', 'harga' => $getHarga($arr['harga_jual'] ?? 0, $arr['harga_beli'] ?? $arr['harga_jual'] ?? 0), 'kategori' => 'XDA_V2'];
                });
                $all = $all->concat($kaje);
            } catch (\Exception $e) {}

            try {
                $digi = DB::table('layanan')->where('status', 'active')->get()->map(function($i) use ($getHarga) {
                    $arr = (array)$i;
                    return ['kode' => $arr['kode_layanan'] ?? '', 'nama' => $arr['nama_layanan'] ?? '', 'harga' => $getHarga($arr['harga_jual'] ?? 0, $arr['harga_beli'] ?? 0), 'kategori' => 'PPOB REGULER'];
                });
                $all = $all->concat($digi);
            } catch (\Exception $e) {}

            if (!empty($kReq)) {
                $all = $all->filter(function($item) use ($kReq) { return str_contains(strtoupper($item['kategori']), $kReq); });
            }
            $data = $all->filter(function($item) { return !empty($item['kode']); })->values()->all();

            return response()->json(['status' => true, 'message' => 'Sukses', 'data' => $data]);
        } catch (\Exception $e) { 
            return response()->json(['status' => false, 'message' => 'Internal Error'], 500); 
        }
    }

    public function transaction(Request $request) {
        $user = $request->get('h2h_user');
        $validator = Validator::make($request->all(), [
            'kode_produk' => 'required', 
            'tujuan' => 'required|numeric', 
            'ref_id' => 'required|unique:transaksi,ref_id'
        ]);
        if ($validator->fails()) return response()->json(['status' => false, 'message' => $validator->errors()->first()], 400);

        $kode = $request->kode_produk;
        $provider = null; $produk = null;

        // 🚀 SENSOR XDA SAAT TRANSAKSI KHFY
        if ($produk = DB::table('layanan_khfy')->where('kode_layanan', $kode)->where('kode_layanan', 'NOT LIKE', 'XDA%')->where('status', 'active')->first()) $provider = 'KHFY';
        elseif ($produk = DB::table('ppob_products')->where('product_code', $kode)->where('is_active', 1)->first()) $provider = 'ADAM';
        elseif ($produk = DB::table('layanan_kaje')->where('kode_layanan', $kode)->first()) $provider = 'KAJE';
        elseif ($produk = DB::table('layanan')->where('kode_layanan', $kode)->where('status', 'active')->first()) $provider = 'DIGI';

        if (!$produk) return response()->json(['status' => false, 'message' => 'Produk tidak ditemukan'], 404);

        $arr = (array)$produk;
        $hj = (float)($arr['harga_jual'] ?? $arr['price_sell'] ?? 0);
        $hb = (float)($arr['harga_beli'] ?? $arr['price_cost'] ?? $hj);
        if ($hb <= 0) $hb = $hj;
        $final = (strtolower($user->level ?? 'member') === 'reseller') ? ($hj - 150) : $hj;
        if ($final < $hb) $final = $hb + 50;

        DB::beginTransaction();
        try {
            $dbUser = DB::table('users')->where('id', $user->id)->lockForUpdate()->first();
            if ($dbUser->saldo < $final) { 
                DB::rollBack(); 
                return response()->json(['status' => false, 'message' => 'Saldo tidak cukup'], 400); 
            }
            DB::table('users')->where('id', $user->id)->decrement('saldo', $final);
            $trxId = DB::table('transaksi')->insertGetId([
                'username' => $user->name, 
                'ref_id' => $request->ref_id, 
                'tujuan' => $request->tujuan, 
                'kode_layanan' => $kode, 
                'harga' => $final, 
                'status' => 'Pending', 
                'sn' => 'Proses...', 
                'created_at' => now(), 
                'updated_at' => now()
            ]);
            DB::commit();

            $res = ['status' => 'Pending', 'sn' => 'Proses...'];
            try {
                if ($provider === 'KHFY') $res = KhfyProcessor::order($request->ref_id, $request->tujuan, $kode);
                elseif ($provider === 'ADAM') $res = AdamProcessor::order($request->ref_id, $request->tujuan, $kode);
                elseif ($provider === 'KAJE') $res = KajeProcessor::order($request->ref_id, $request->tujuan, $kode);
                elseif ($provider === 'DIGI') $res = DigiProcessor::order($request->ref_id, $request->tujuan, $kode);
            } catch (\Exception $e) { 
                Log::error("H2H_PROC_FAIL: ".$e->getMessage()); 
            }

            if (isset($res['status']) && $res['status'] === 'Gagal') {
                DB::table('users')->where('id', $user->id)->increment('saldo', $final);
                DB::table('transaksi')->where('id', $trxId)->update(['status' => 'Gagal', 'sn' => $res['sn'] ?? 'Provider Error']);
                return response()->json(['status' => false, 'message' => $res['sn'] ?? 'Gagal']);
            }

            $sFinal = (isset($res['status']) && $res['status'] === 'Sukses') ? 'Sukses' : 'Pending';
            DB::table('transaksi')->where('id', $trxId)->update([
                'status' => $sFinal, 
                'sn' => $res['sn'] ?? 'Diproses', 
                'ref_id_provider' => $res['trxid'] ?? null
            ]);

            return response()->json([
                'status' => true, 
                'message' => 'Transaksi Diterima', 
                'data' => ['ref_id' => $request->ref_id, 'status' => $sFinal, 'sn' => $res['sn'] ?? 'Diproses']
            ]);
        } catch (\Exception $e) { 
            DB::rollBack(); 
            return response()->json(['status' => false, 'message' => 'Sistem Sibuk'], 500); 
        }
    }

    public function checkStock(Request $request) {
        $kategori = strtoupper($request->input('kategori') ?? '');
        if (empty($kategori)) return response()->json(['status' => false, 'message' => 'Pilih kategori'], 400);

        $stockData = [];
        try {
            if ($kategori === 'PRODUK XLA' || $kategori === 'AKRAB XLA') {
                $kKey = env('KHFY_API_KEY');
                $tempStock = [];
                $resA = Http::timeout(15)->get("https://panel.khfy-store.com/api_v3/cek_stock_akrab_v2?api_key=".$kKey);
                $jsonA = json_decode($resA->body(), true);
                if (!empty($jsonA['message'])) {
                    foreach (explode("\n", trim($jsonA['message'])) as $line) {
                        $p = explode("|", $line);
                        if (count($p) >= 2) { $tempStock[trim($p[0])] = (int)preg_replace('/[^0-9]/', '', $p[1]); }
                    }
                }
                $resL = Http::timeout(15)->get("https://panel.khfy-store.com/api_v2/list_product?api_key=".$kKey);
                $jsonL = json_decode($resL->body(), true);
                $items = $jsonL['data'] ?? $jsonL ?? [];
                if (is_array($items)) {
                    foreach ($items as $i) {
                        $code = $i['kode_produk'] ?? $i['kode'] ?? $i['code'] ?? null;
                        if ($code) {
                            $codeUp = strtoupper($code);
                            // 🚀 SENSOR XDA DI STOK KHFY (HANYA XLA YANG DITARIK)
                            if (str_starts_with($codeUp, 'XLA')) {
                                if (!isset($tempStock[$codeUp])) { $tempStock[$codeUp] = (int)($i['stok'] ?? $i['stock'] ?? 0); }
                            }
                        }
                    }
                }
                foreach ($tempStock as $k => $v) { $stockData[] = ['kode' => $k, 'stok' => $v]; }

            } elseif ($kategori === 'AKRAB XDA') {
                $k = env('ADAMMEDIA_API_KEY');
                $rC = Http::withHeaders(['x-api-key' => $k])->timeout(15)->get("https://juraganxl.my.id/api/circles");
                $rR = Http::withHeaders(['x-api-key' => $k])->timeout(15)->get("https://juraganxl.my.id/api/regulers");
                foreach (array_merge(json_decode($rC->body(), true) ?? [], json_decode($rR->body(), true) ?? []) as $i) {
                    if (isset($i['config'])) $stockData[] = ['kode' => $i['config'], 'stok' => (int)($i['count'] ?? 0)];
                }
            } elseif ($kategori === 'XDA_V2') {
                $res = Http::withHeaders(['x-api-key' => env('KAJE_API_KEY')])->timeout(15)->post("https://end.kaje-store.com/api/service/stock-product", []);
                $j = json_decode($res->body(), true);
                if (isset($j['data'])) {
                    foreach ($j['data'] as $i) $stockData[] = ['kode' => $i['code'] ?? $i['kode'], 'stok' => (int)($i['stock'] ?? $i['stok'])];
                }
            }

            if (empty($stockData)) return response()->json(['status' => false, 'message' => 'Stok pusat kosong / Offline'], 502);
            usort($stockData, function($a, $b) { return strcmp($a['kode'], $b['kode']); });
            return response()->json(['status' => true, 'message' => 'Berhasil mengambil stok murni', 'kategori' => $kategori, 'data' => $stockData]);
        } catch (\Exception $e) { 
            return response()->json(['status' => false, 'message' => 'Provider Timeout'], 504); 
        }
    }

    /**
     * 🔥 H2H WEBHOOK MURNI TRANSAKSI DIGITAL
     */
    public static function sendWebhook($ref_id) {
        $trx = \Illuminate\Support\Facades\DB::table('transaksi')->where('ref_id', $ref_id)->first();
        if (!$trx) return;
        $user = \Illuminate\Support\Facades\DB::table('users')->where('name', $trx->username)->first();
        if (!$user) return;
        
        $url = !empty($user->webhook_url) ? $user->webhook_url : $user->payment_webhook;
        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) return;
        
        $apiKey = $user->api_key;
        $signature      = md5($apiKey . $trx->ref_id);
        $x_signature    = md5($trx->ref_id . $apiKey);
        $x_upper_sign   = strtoupper($x_signature);
        $x_mila_sign    = md5($apiKey . $trx->ref_id . $trx->status);
        $payload = [
            'ref_id' => $trx->ref_id,
            'status' => $trx->status,
            'sn'     => $trx->sn ?? '-',
            'harga'  => (int)$trx->harga,
            'tujuan' => $trx->tujuan
        ];
        
        try {
            \Illuminate\Support\Facades\Http::withoutVerifying()
                ->timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'signature'     => $signature,
                    'x-signature'   => $x_signature,
                    'x-upper-sign'  => $x_upper_sign,
                    'x-mila-sign'   => $x_mila_sign,
                    'User-Agent'    => 'MilaStore-H2H/V12-Digital'
                ])
                ->post($url, $payload);
            \Illuminate\Support\Facades\Log::info("[✅  WEBHOOK H2H PRODUK] Ref: " . $ref_id . " ke " . $url);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("[❌  WEBHOOK H2H FAIL] Ref: " . $ref_id . " | Error: " . $e->getMessage());
        }
    }
}
