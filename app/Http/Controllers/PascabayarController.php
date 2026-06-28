<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class PascabayarController extends Controller
{
    public function index()
    {
        $products = DB::table('layanan')
            ->where('tipe', 'like', '%pasca%')
            ->orWhere('tipe', 'like', '%postpaid%')
            ->get();
        
        return Inertia::render('Order/Pascabayar', [
            'products' => $products,
            'userBalance' => auth()->user()->saldo ?? auth()->user()->balance ?? 0
        ]);
    }

    // 🧠 FUNGSI 1: INQUIRY (MENCARI PROMO / CEK TAGIHAN)
    public function inquiry(Request $request)
    {
        $request->validate([
            'tujuan' => 'required',
            'kode_layanan' => 'required'
        ]);

        $nama_layanan = DB::table('layanan')->where('kode_layanan', $request->kode_layanan)->value('nama_layanan') ?? '';
        $nama_layanan_lower = strtolower($nama_layanan);

        // 🎯 DETEKSI JALUR KODEBAYAR
        $isKodebayar = str_contains($nama_layanan_lower, 'indosat') || str_contains($nama_layanan_lower, 'telkomsel') || str_contains($nama_layanan_lower, 'omni') || str_contains($nama_layanan_lower, 'only');

        if ($isKodebayar) {
            $provider = str_contains($nama_layanan_lower, 'indosat') ? 'INDOSAT' : 'TELKOMSEL';
            
            try {
                $kb_response = Http::post('https://kodebayar.web.id/v2/list_paket', [
                    'apikey' => env('KODEBAYAR_API_KEY'),
                    'provider' => $provider,
                    'menu_id' => '', 
                    'dest' => $request->tujuan,
                    'noreff' => 'INQ-' . time()
                ]);

                $kb_res = $kb_response->json();

                // 🚨 LOGIKA PINTAR: Cek apakah promonya kosong []
                if (isset($kb_res['status']) && $kb_res['status'] === true) {
                    
                    if (empty($kb_res['data'])) {
                        // Jika promo kosong, tampilkan pesan elegan!
                        return response()->json([
                            'success' => false,
                            'message' => 'Nomor ini sedang tidak memiliki promo eksklusif (' . $provider . ' Only For You). Silakan coba nomor lain.'
                        ]);
                    }

                    // JIKA ADA PROMO, KONVERSI DATA & TAMBAHKAN ADMIN RP 500
                    $promo_list = [];
                    foreach ($kb_res['data'] as $promo) {
                        \Illuminate\Support\Facades\Cache::put('kdb_' . $request->tujuan . '_' . $promo['code'], $promo['price'] + 500, now()->addMinutes(30));
$promo_list[] = [
                            'kode_promo' => $promo['code'], 
                            'nama_promo' => $promo['name'],
                            'harga' => $promo['price'] + 500 
                        ];
                    }

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'customer_no' => $kb_res['dest'],
                            'customer_name' => 'Promo ' . $provider,
                            'buyer_sku_code' => $request->kode_layanan, 
                            'selling_price' => 0,
                            'desc' => ['detail' => $promo_list] 
                        ],
                        'ref_id' => 'KDB-' . time() 
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => $kb_res['statusDesc'] ?? 'Koneksi API Gagal.'
                    ]);
                }
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => 'Koneksi ke Kodebayar Terputus.']);
            }
        }

        // 🎯 JALUR NORMAL DIGIFLAZZ (PLN, BPJS, DLL)
        $username = env('DIGIFLAZZ_USERNAME');
        $apiKey = env('DIGIFLAZZ_API_KEY');
        $ref_id = "INQ-" . time(); 
        $sign = md5($username . $apiKey . $ref_id);

        try {
            $response = Http::timeout(30)->post('https://api.digiflazz.com/v1/transaction', [
                'commands' => 'inq-pasca',
                'username' => $username,
                'buyer_sku_code' => $request->kode_layanan,
                'customer_no' => $request->tujuan,
                'ref_id' => $ref_id,
                'sign' => $sign
            ]);

            $res = $response->json();
            $rc = $res['data']['rc'] ?? 'XX';
            
            if (isset($res['data']['status']) && ($res['data']['status'] == 'Sukses' || $rc == '00')) {
                return response()->json([
                    'success' => true,
                    'data' => $res['data'],
                    'ref_id' => $ref_id 
                ]);
                \Illuminate\Support\Facades\Cache::put('digi_' . $ref_id, $res['data']['selling_price'] ?? 0, now()->addMinutes(30));
            } else {
                return response()->json(['success' => false, 'message' => "[Kode: $rc] " . ($res['data']['message'] ?? 'Gagal.')]);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Koneksi API Digiflazz terputus.']);
        }
    }

    // 🧠 FUNGSI 2: BAYAR (H2H KODEBAYAR -> DIGIFLAZZ)
    public function pay(Request $request)
    {
        $request->validate([
            'tujuan' => 'required',
            'kode_layanan' => 'required',
            'ref_id' => 'required',
            'harga' => 'required|numeric'
        ]);

                $user = User::where('id', auth()->id())->lockForUpdate()->first();
        
        // 🛡️ BENTENG SENTINEL (Ambil Harga Asli dari Brankas Server)
        $harga_asli = $request->filled('kodebayar_code') 
            ? \Illuminate\Support\Facades\Cache::get('kdb_' . $request->tujuan . '_' . $request->kodebayar_code) 
            : \Illuminate\Support\Facades\Cache::get('digi_' . $request->ref_id);

        if (!$harga_asli || $harga_asli <= 0) {
            return back()->with('error', '🚨 Sesi tagihan kadaluarsa atau HARGA DIMANIPULASI! Silakan Cek Tagihan ulang dari awal.');
        }

        $saldo_user = $user->saldo ?? $user->balance ?? 0;
        if ($saldo_user < $harga_asli) {
            return back()->with('error', 'Saldo tidak mencukupi untuk tagihan ini.');
        }

        DB::beginTransaction();
        try {
            if (isset($user->saldo)) $user->saldo -= $harga_asli;
            else $user->balance -= $harga_asli;
            $user->save();

            $final_target_number = $request->tujuan;

            if ($request->filled('kodebayar_code')) {
                $kb_req = Http::post('https://kodebayar.web.id/v2/order', [
                    'apikey' => env('KODEBAYAR_API_KEY'),
                    'noreff' => $request->ref_id,
                    'code' => $request->kodebayar_code 
                ]);

                $kb_res = $kb_req->json();

                if (!isset($kb_res['status']) || $kb_res['status'] !== true) {
                    DB::rollBack();
                    return back()->with('error', 'Gagal Generate Kode Bayar: ' . ($kb_res['statusDesc'] ?? 'Gangguan'));
                }

                $final_target_number = $kb_res['payment_code']; 
            }

            DB::table('transaksi')->insert([
                'ref_id' => $request->ref_id,
                'username' => $user->username ?? $user->name,
                'kode_layanan' => $request->kode_layanan,
                'tujuan' => $final_target_number, 
                'harga' => $harga_asli,
                'status' => 'Proses',
                'sn' => 'Proses Pembayaran Server',
                'tanggal' => now(),
            ]);

            $username = env('DIGIFLAZZ_USERNAME');
            $apiKey = env('DIGIFLAZZ_API_KEY');
            $sign = md5($username . $apiKey . $request->ref_id);

            $response = Http::timeout(30)->post('https://api.digiflazz.com/v1/transaction', [
                'commands' => 'pay-pasca',
                'username' => $username,
                'buyer_sku_code' => $request->kode_layanan, 
                'customer_no' => $final_target_number, 
                'ref_id' => $request->ref_id,
                'sign' => $sign
            ]);

            $res = $response->json();
            
            if (isset($res['data']['status']) && $res['data']['status'] == 'Gagal') {
                DB::rollBack();
                return back()->with('error', 'Pembayaran Digiflazz Gagal: ' . ($res['data']['message'] ?? 'Hubungi Admin'));
            }

            DB::commit();
            return back()->with('success', 'Transaksi berhasil diproses oleh server!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Sistem Error: Gagal memproses jalur H2H.');
        }
    }
}
