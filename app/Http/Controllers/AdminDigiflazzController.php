<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminDigiflazzController extends Controller
{
    public function index() {
        $products = DB::table('products')->orderBy('category', 'asc')->get();
        $stats = [
            'total' => DB::table('products')->count(),
            'active' => DB::table('products')->where('status', 'active')->count(),
        ];
        return Inertia::render('Admin/DigiflazzManager', ['products' => $products, 'stats' => $stats]);
    }

    public function sync(Request $request) {
        // 🚀 NAFAS PANJANG: Biar browser gak putus asa nungguin ribuan data
        set_time_limit(1200); 
        ini_set('memory_limit', '512M');

        $u = env('DIGI_USERNAME');
        $k = env('DIGI_APIKEY'); 
        $sign = md5($u . $k . 'pricelist');

        try {
            // 🚀 TIMEOUT DITAMBAH: Kadang API Digiflazz lemot kalau diakses via Web
            $res = Http::timeout(180)->post('https://api.digiflazz.com/v1/price-list', [
                'cmd' => 'prepaid',
                'username' => $u,
                'sign' => $sign
            ]);
            
            $result = $res->json();

            // 🔍 DEBUG: Kalau gagal, kita catet di log kenapa gagalnya
            if (!is_array($result) || !isset($result['data'])) {
                Log::error('Digiflazz Sync Error (Web): ' . json_encode($result));
                return response()->json(['success' => false, 'message' => 'Gagal konek ke API. Cek Log System!'], 400);
            }

            // 🧹 PENYEDOT DEBU: Pastikan angka yang masuk dari React beneran angka, bukan string kosong
            $markupP = (float) ($request->input('markup_persen') ?: 0);
            $markupF = (float) ($request->input('markup_flat') ?: 0);
            
            $kelompok = DB::table('kelompok')->first();
            $kId = $kelompok ? $kelompok->id : DB::table('kelompok')->insertGetId(['nama_kelompok' => 'Digiflazz', 'provider' => 'digiflazz', 'created_at' => now(), 'updated_at' => now()]);

            $dataToUpsert = [];
            $count = 0;

            // 🔪 KITA POTONG DATA JADI KECIL-KECIL DULU
            $chunks = array_chunk($result['data'], 500);

            // 🚀 TRANSAKSI DATABASE: Biar lebih cepet dan aman kalau dieksekusi via Web
            DB::beginTransaction();
            
            foreach ($chunks as $chunk) {
                foreach ($chunk as $item) {
                    $sku = $item['buyer_sku_code'] ?? $item['sku'] ?? null;
                    if (!$sku) continue;

                    $modal = (float) $item['price'];
                    $jual = ceil($modal + ($modal * ($markupP / 100)) + $markupF);
                    $status = ($item['buyer_product_status'] && $item['seller_product_status']) ? 'active' : 'inactive';
                    
                    // FIX PROVIDER & TIPE (Sesuai orderan Lu sebelumnya)
                    $brand = strtoupper(trim($item['brand'] ?? 'LAINNYA'));
                    $category = $item['category'] ?? 'LAINNYA';
                    $tipe = (stripos($category, 'data') !== false || stripos($category, 'internet') !== false) ? 'DATA' : $category;

                    DB::table('layanan')->updateOrInsert(
                        ['kode_layanan' => $sku],
                        [
                            'nama_layanan' => $item['product_name'],
                            'provider'     => $brand, 
                            'harga_beli'   => $modal,
                            'harga_jual'   => $jual,
                            'tipe'         => $tipe,
                            'status'       => $status,
                            'kelompok_id'  => $kId,
                            'updated_at'   => now(),
                            'created_at'   => now(),
                        ]
                    );

                    $dataToUpsert[] = [
                        'sku' => $sku,
                        'product_name' => $item['product_name'],
                        'category' => $category,
                        'brand' => $brand,
                        'price' => $jual,
                        'status' => $status,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ];
                    $count++;
                }
            }

            // SIMPAN KE GUDANG (Products)
            foreach (array_chunk($dataToUpsert, 500) as $chunk) {
                DB::table('products')->upsert($chunk, ['sku'], ['product_name', 'category', 'brand', 'price', 'status', 'updated_at']);
            }

            // Kalau semua lancar, baru kita kunci datanya!
            DB::commit();

            return response()->json(['success' => true, 'message' => $count . ' Produk Berhasil Masuk Etalase!']);

        } catch (\Exception $e) {
            // Kalau ada error di tengah jalan, batalin semua!
            DB::rollBack();
            Log::error('Fatal Sync Error (Web): ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error: Cek log sistem.'], 500);
        }
    }
}
