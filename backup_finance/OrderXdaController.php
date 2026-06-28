<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\KajeService;
use Inertia\Inertia;

class OrderXdaController extends Controller
{
    protected $kaje;

    public function __construct(KajeService $kaje) {
        $this->kaje = $kaje;
    }

    public function index() {
        $all_products = DB::table('layanan_kaje')->orderBy('kategori', 'asc')->orderBy('harga_jual', 'asc')->get();
        $grouped = [];
        foreach($all_products as $p) {
            $kat = trim($p->kategori);
            $kat = str_ireplace(['kj', 'KJ'], 'Amifi', $kat);
            if(empty($kat)) $kat = 'Lainnya';
            $grouped[$kat][] = $p;
        }
        return Inertia::render('Order/Xda', [
            'groupedProducts' => $grouped,
            'userBalance' => DB::table('users')->where('id', auth()->id())->value('saldo') ?? 0
        ]);
    }

    public function checkStock() {


        try {
            $res = $this->kaje->getStock();
            $live_data = [];
            if (is_array($res) && isset($res['success']) && $res['success'] == true && isset($res['data'])) {
                foreach ($res['data'] as $p) {
                    $code = $p['code'] ?? $p['kode_layanan'] ?? null;
                    if(!$code) continue;
                    $stock = $p['stock'] ?? $p['stok'] ?? 0;
                    $status = $p['status'] ?? 'closed';
                    $productDb = DB::table('layanan_kaje')->where('kode_layanan', $code)->first();
                    if ($productDb && preg_match('/Flex|Max|Ultra 5G/i', $productDb->nama_layanan)) {
                        DB::table('layanan_kaje')->where('kode_layanan', $code)->update(['stok' => 999, 'status' => 'active']);
                        $live_data[] = ['kode_layanan' => $code, 'stok' => 'Unlimited', 'status' => 'active'];
                        continue;
                    }
                    $stat = ($status == 'open' && $stock > 0) ? 'active' : 'inactive';
                    $harga_pusat = $p['price'] ?? $p['harga'] ?? 0;
                    $margin = 500;
                    $harga_jual_baru = $harga_pusat + $margin;
                    $upd = ['stok' => $stock, 'status' => $stat]; 
                    if ($harga_pusat > 100) { 
                        $upd['harga_beli'] = $harga_pusat; 
                        $upd['harga_jual'] = $harga_jual_baru; 
                    } 
                    DB::table('layanan_kaje')->where('kode_layanan', $code)->update($upd);
                    $live_data[] = ['kode_layanan' => $code, 'stok' => $stock, 'status' => $stat];
                }
                return response()->json(['status' => 'success', 'data' => $live_data]);
            } else {
                return response()->json(['status' => 'error', 'message' => 'Format API Kaje Berubah', 'raw' => $res]);
            }
        } catch (\Throwable $e) {
            return response()->json(['status' => 'error', 'message' => 'Terjadi Error: ' . $e->getMessage()]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            "kode_layanan" => "required",
            "tujuan" => "required"
        ]);
        DB::beginTransaction();
        try {
            $user = auth()->user();
            $user = \App\Models\User::where("id", $user->id)->lockForUpdate()->first();
            $product = DB::table("layanan_kaje")->where("kode_layanan", $request->kode_layanan)->first();
            if (!$product || $product->harga_jual <= 0) {
                return response()->json(["status" => "error", "message" => "Produk tidak valid."]);
            }

            // 🎯 LOGIKA MULTI-NOMOR
            $list_nomor_kotor = preg_split('/[\r\n, ]+/', $request->tujuan);
            $list_nomor_bersih = array_values(array_unique(array_filter($list_nomor_kotor, function($n) {
                return strlen(preg_replace('/[^0-9]/', '', $n)) >= 5;
            })));
            if (count($list_nomor_bersih) < 1) {
                return response()->json(["status" => "error", "message" => "Nomor tujuan tidak valid!"]);
            }
            $total_harga_semua = $product->harga_jual * count($list_nomor_bersih);
            if ($user->saldo < $total_harga_semua) {
                return response()->json(["status" => "error", "message" => "Saldo tidak mencukupi untuk " . count($list_nomor_bersih) . " nomor."]);
            }

            $kajeApiKey = env("KAJE_API_KEY", "");
            $berhasil = 0;
            $gagal = 0;
            $pesanError = "";
            $username = $user->username ?? $user->name ?? strval($user->id);

            // 🚀 TEMBAK API SATU PER SATU
            foreach ($list_nomor_bersih as $nomor) {
                $ref_id = "INV-" . date("YmdHis") . rand(100, 999);
                $response = \Illuminate\Support\Facades\Http::timeout(15)->withHeaders([
                    "x-api-key" => $kajeApiKey, "accept" => "application/json", "Content-Type" => "application/json"
                ])->post("https://end.kaje-store.com/api/service/order-product", [
                    "destination" => $nomor, "ref_id" => $ref_id, "code" => $product->kode_layanan
                ]);
                
                $resData = $response->json();
                
                if ($response->successful() && isset($resData["success"]) && $resData["success"] === true) {
                    $trx_id_pusat = $resData["data"]["trx_id"] ?? "TRX-UNKNOWN";
                    $status_pusat = strtolower($resData["data"]["status"] ?? "pending");
                    
                    // 🎯 BUG 'KETERANGAN' DIMUSNAHKAN! SEKARANG PAKAI 'SN'
                    DB::table("transaksi")->insert([
                        "username" => $username,
                        "ref_id" => $ref_id,
                        "kode_layanan" => $product->kode_layanan,
                        "tujuan" => $nomor,
                        "harga" => $product->harga_jual,
                        "status" => in_array($status_pusat, ['success', 'sukses']) ? "Sukses" : "Proses",
                        "sn" => $trx_id_pusat,
                        "tanggal" => date("Y-m-d H:i:s"),
                        "created_at" => now(),
                        "updated_at" => now()
                    ]);
                    $berhasil++;
                } else {
                    $gagal++;
                    $pesanError = $resData["message"] ?? "Gangguan Pusat";
                }
            }

            // POTONG SALDO HANYA YANG BERHASIL DITERIMA SERVER
            if ($berhasil > 0) {
                $user->saldo -= ($berhasil * $product->harga_jual);
                $user->save();
            }
            DB::commit();

            if ($berhasil > 0) {
                return response()->json([
                    "status" => "success",
                    "message" => "Pesanan diproses! $berhasil Sukses" . ($gagal > 0 ? " | $gagal Gagal ($pesanError)" : "")
                ]);
            } else {
                return response()->json(["status" => "error", "message" => "Gagal: $pesanError"]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(["status" => "error", "message" => "Sistem sibuk: " . $e->getMessage()]);
        }
    }

    // 🔥 KUNCI PERBAIKAN: FUNGSI POLL SEKARANG MANGGIL CHECKSTOCK DULU 🔥
    public function poll()
    {
        // 1. Panggil checkStock() untuk update data dari pusat (Kaje)
        $update = $this->checkStock();
        
        // 2. Jika checkStock() berhasil ngambil data live, langsung lempar datanya ke React
        $content = json_decode($update->getContent(), true);
        if(isset($content['status']) && $content['status'] === 'success') {
             return response()->json(["status" => "success", "data" => $content['data']]);
        }

        // 3. Fallback: Kalau pusat lagi gangguan/timeout, ambil sisa data terakhir dari database biar gak nge-blank
        $data = DB::table("layanan_kaje")->select("kode_layanan", "stok", "status")->get();
        return response()->json(["status" => "success", "data" => $data]);
    }
}
