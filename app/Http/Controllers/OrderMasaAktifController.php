<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DigiflazzService;
use Inertia\Inertia;

class OrderMasaAktifController extends Controller {
    protected $digiflazz;
    public function __construct(DigiflazzService $digiflazz) {
        $this->digiflazz = $digiflazz;
    }

    public function index() {
        $products = DB::table('layanan')->where('status', 'active')->whereIn('tipe', ['MASA AKTIF', 'masa aktif'])->orderBy('harga_jual', 'asc')->get();
        $grouped = []; foreach ($products as $p) { $grouped[strtoupper(str_replace(' ', '', $p->provider))][] = $p; }
        return Inertia::render('Order/MasaAktif', [
            'auth' => ['user' => auth()->user()], 'products' => $products, 'groupedProducts' => (object)$grouped, 'userBalance' => DB::table('users')->where('id', auth()->id())->value('saldo') ?? 0
        ]);
    }

    public function store(Request $request) {
        $tujuan = $request->tujuan ?? $request->target;
        $kodeLayanan = $request->kode_layanan ?? $request->code;
        if (!$kodeLayanan || !$tujuan) return response()->json(['status' => 'error', 'message' => 'Data tidak lengkap.'], 422);

        $product = DB::table('layanan')->where('kode_layanan', $kodeLayanan)->first();
        if (!$product) return response()->json(['status' => 'error', 'message' => 'Produk tidak ditemukan.'], 400);

        $refId = 'MSK' . date('YmdHis') . rand(100,999);
        $userId = auth()->id();

        // 🛡️ TAHAP 1: KUNCI & POTONG SALDO
        DB::beginTransaction();
        try {
            $user = DB::table('users')->where('id', $userId)->lockForUpdate()->first();
            if ($user->saldo < $product->harga_jual) { DB::rollBack(); return response()->json(['status' => 'error', 'message' => 'Saldo tidak mencukupi.'], 400); }
            
            DB::table('users')->where('id', $userId)->decrement('saldo', $product->harga_jual);
            DB::table('transaksi')->insert([
                'ref_id' => $refId, 'username' => $user->name, 'kode_layanan' => $product->kode_layanan,
                'tujuan' => $tujuan, 'harga' => $product->harga_jual, 'status' => 'Pending', 'created_at' => now(), 'updated_at' => now()
            ]);
            DB::commit();
        } catch (\Exception $e) { DB::rollBack(); return response()->json(['status' => 'error', 'message' => 'Sistem sibuk.'], 400); }

        // 🚀 TAHAP 2: TEMBAK API
        try {
            $order = $this->digiflazz->placeOrder($refId, $tujuan, $product->kode_layanan);
            $statusDigi = strtolower($order['data']['status'] ?? 'pending');

            if (!$order['success'] || $statusDigi === 'gagal') {
                $pesan = $order['message'] ?? $order['data']['message'] ?? 'Gangguan pusat.';
                DB::transaction(function () use ($userId, $refId, $product, $pesan) {
                    $trx = DB::table('transaksi')->where('ref_id', $refId)->where('status', 'Pending')->lockForUpdate()->first();
                    if ($trx) { DB::table('users')->where('id', $userId)->increment('saldo', $product->harga_jual); DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => substr($pesan, 0, 100)]); }
                });
                return response()->json(['status' => 'error', 'message' => 'Gagal: ' . $pesan], 400);
            }

            DB::table('transaksi')->where('ref_id', $refId)->update(['status' => $order['data']['status'] ?? 'Pending', 'sn' => $order['data']['sn'] ?? '-']);
            return response()->json(['status' => 'success', 'message' => 'Transaksi berhasil diproses!']);
        } catch (\Exception $e) {
            Log::error("ERROR_MASA_AKTIF: " . $e->getMessage());
            return response()->json(['status' => 'success', 'message' => 'Pesanan diproses di latar belakang.']);
        }
    }
}
