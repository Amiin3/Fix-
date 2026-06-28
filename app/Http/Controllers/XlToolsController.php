<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class XlToolsController extends Controller
{
    private $apiKey;
    private $baseUrl = 'https://end.kaje-store.com/api';
    public function __construct() { $this->apiKey = env('KAJE_API_KEY', ''); }
    private function hitApi($endpoint, $payload = []) {
        try { $body = empty($payload) ? new \stdClass() : $payload; $response = Http::timeout(20)->asJson()->withHeaders(['x-api-key' => $this->apiKey, 'accept' => 'application/json'])->post($this->baseUrl . $endpoint, $body); return $response->json(); } catch (\Exception $e) { return ['success' => false, 'message' => 'Koneksi pusat gagal.']; }
    }
    public function index() { return Inertia::render('Tools/XlTools', ['userBalance' => DB::table('users')->where('id', auth()->id())->value('saldo') ?? 0]); }
    public function getOtp(Request $request) { $request->validate(['number' => 'required']); return response()->json($this->hitApi('/xl-auth/get-otp', ['number' => $request->number])); }
    public function loginOtp(Request $request) { $request->validate(['number' => 'required', 'code_otp' => 'required']); return response()->json($this->hitApi('/xl-auth/login-otp', ['number' => $request->number, 'code_otp' => $request->code_otp])); }
    public function loginSesi(Request $request) { $request->validate(['number' => 'required']); return response()->json($this->hitApi('/xl-auth/login-sesi', ['number' => $request->number])); }
    public function getInfo(Request $request) { $request->validate(['number' => 'required']); $num = ['number' => $request->number]; return response()->json(['balance' => $this->hitApi('/xl-info/balance', $num), 'quotas' => $this->hitApi('/xl-info/quotas', $num), 'lock' => $this->hitApi('/xl-info/lock-unlock', $num), 'loans' => $this->hitApi('/xl-info/loans', $num), 'city' => $this->hitApi('/xl-info/city', $num)]); }
    public function unsubscribe(Request $request) { $request->validate(['number' => 'required', 'unsubscribe_code' => 'required']); return response()->json($this->hitApi('/xl-update/unsubscribe', $request->all())); }
    public function setLock(Request $request) { $request->validate(['number' => 'required', 'is_locked' => 'required|boolean']); return response()->json($this->hitApi('/xl-update/set-lock-balance', $request->all())); }

    public function listOtp() {
        $res = $this->hitApi('/service/list-package-otp');
        $margin = 1500;
        if (isset($res['success']) && $res['success'] == true && isset($res['data']['products'])) {
            $cleaned_products = [];
            foreach ($res['data']['products'] as $product) {
                $modal = 0;
                if (isset($product['price']) && is_array($product['price'])) { $p = isset($product['price']['pulsa']) ? floatval($product['price']['pulsa']) : 0; $np = isset($product['price']['non_pulsa']) ? floatval($product['price']['non_pulsa']) : 0; $modal = $p + $np; } elseif (isset($product['price']) && is_numeric($product['price'])) { $modal = floatval($product['price']); }
                $fee = isset($product['fee']) ? floatval($product['fee']) : 0;
                $product['display_price'] = $modal + $fee + $margin;
                $cleaned_products[] = $product;
            }
            $res['data']['products'] = $cleaned_products;
        }
        return response()->json($res);
    }

    public function orderOtp(Request $request) {
        $request->validate(['destination' => 'required', 'code' => 'required', 'payment' => 'required', 'price' => 'required|numeric']);
        $harga = $request->price;
        if ($harga <= 0) return response()->json(['success' => false, 'message' => 'Transaksi Ditolak.']);
        $userId = auth()->id();
        $ref_id = "OTP-" . date("YmdHis") . rand(100, 999);

        // 🛡️ TAHAP 1: KUNCI & POTONG SALDO DI AWAL
        DB::beginTransaction();
        try {
            $user = DB::table('users')->where('id', $userId)->lockForUpdate()->first();
            if ($user->saldo < $harga) { DB::rollBack(); return response()->json(['success' => false, 'message' => 'Saldo tidak mencukupi!']); }
            
            DB::table('users')->where('id', $userId)->decrement('saldo', $harga);
            DB::table('transaksi')->insert([
                'username' => $user->username ?? $user->name, 'ref_id' => $ref_id, 'kode_layanan' => $request->code, 'tujuan' => $request->destination,
                'harga' => $harga, 'status' => 'Proses', 'sn' => 'Menunggu OTP', 'tanggal' => now(), 'created_at' => now(), 'updated_at' => now()
            ]);
            DB::commit();
        } catch (\Exception $e) { DB::rollBack(); return response()->json(['success' => false, 'message' => 'Sistem sibuk.']); }

        // 🚀 TAHAP 2: TEMBAK API
        $res = $this->hitApi('/service/order-package-otp', ['destination' => $request->destination, 'ref_id' => $ref_id, 'code' => $request->code, 'payment' => $request->payment]);
        
        if (isset($res['success']) && $res['success'] == true) {
            DB::table('transaksi')->where('ref_id', $ref_id)->update(['status' => 'Sukses', 'sn' => $res['data']['trx_id'] ?? 'OTP-SN']);
            return response()->json(['success' => true, 'message' => 'Pesanan OTP Berhasil!']);
        } else {
            // JIKA GAGAL INSTAN -> REFUND
            DB::transaction(function () use ($userId, $ref_id, $harga, $res) {
                $trx = DB::table('transaksi')->where('ref_id', $ref_id)->lockForUpdate()->first();
                if ($trx && $trx->status !== 'Gagal') { DB::table('users')->where('id', $userId)->increment('saldo', $harga); DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => substr($res['message'] ?? 'Gagal', 0, 100)]); }
            });
            return response()->json(['success' => false, 'message' => $res['message'] ?? 'Gagal ke pusat.']);
        }
    }
}
