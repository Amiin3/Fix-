<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DigiflazzService;
use Inertia\Inertia;

class OrderEwalletController extends Controller
{
    protected $digiflazz;
    public function __construct(DigiflazzService $digiflazz) {
        $this->digiflazz = $digiflazz;
    }

    public function index() {
        $products = DB::table('layanan')->where('status', 'active')
            ->whereIn('tipe', ['E-MONEY', 'e-money', 'E-WALLET', 'e-wallet'])->orderBy('harga_jual', 'asc')->get();
        $grouped = [];
        foreach ($products as $p) { $grouped[strtoupper(str_replace(' ', '', $p->provider))][] = $p; }
        return Inertia::render('Order/Ewallet', [
            'products' => $products,
            'groupedProducts' => (object)$grouped,
            'userBalance' => DB::table('users')->where('id', auth()->id())->value('saldo') ?? 0
        ]);
    }

    public function store(Request $request) {
        $user = auth()->user();
        $kodeLayanan = $request->kode_layanan;
        $tujuan = $request->tujuan;

        if (!$kodeLayanan || !$tujuan) return back()->with('error', 'Data tidak lengkap!');
        $product = DB::table('layanan')->where('kode_layanan', $kodeLayanan)->first();
        if (!$product) return back()->with('error', 'Produk tidak ditemukan!');

        $refId = 'EWL' . time() . rand(100,999);

        // 🛡️ TAHAP 1: KUNCI & POTONG SALDO DI DEPAN
        DB::beginTransaction();
        try {
            $dbUser = DB::table('users')->where('id', $user->id)->lockForUpdate()->first();
            if ($dbUser->saldo < $product->harga_jual) {
                DB::rollBack();
                return back()->with('error', 'Saldo Anda tidak cukup!');
            }

            DB::table('users')->where('id', $user->id)->decrement('saldo', $product->harga_jual);
            DB::table('transaksi')->insert([
                'ref_id' => $refId, 'username' => $user->name, 'kode_layanan' => $product->kode_layanan,
                'tujuan' => $tujuan, 'harga' => $product->harga_jual, 'status' => 'Pending', 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Sistem error: Gagal membuat invoice.');
        }

        // 🚀 TAHAP 2: TEMBAK API DIGIFLAZZ
        try {
            $order = $this->digiflazz->placeOrder($refId, $tujuan, $product->kode_layanan);
            $statusDigi = strtolower($order['data']['status'] ?? 'pending');

            // JIKA DIGIFLAZZ MENOLAK / GAGAL
            if (!$order['success'] || $statusDigi === 'gagal') {
                $pesan = $order['message'] ?? $order['data']['message'] ?? 'Gangguan pusat.';
                
                // REFUND DENGAN GEMBOK
                DB::transaction(function () use ($user, $refId, $product, $pesan) {
                    $trx = DB::table('transaksi')->where('ref_id', $refId)->where('status', 'Pending')->lockForUpdate()->first();
                    if ($trx) {
                        DB::table('users')->where('id', $user->id)->increment('saldo', $product->harga_jual);
                        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => substr($pesan, 0, 100)]);
                    }
                });
                return redirect()->route('riwayat')->with('error', 'Transaksi Gagal: ' . $pesan);
            }

            // JIKA DITERIMA
            DB::table('transaksi')->where('ref_id', $refId)->update([
                'status' => $order['data']['status'] ?? 'Pending',
                'sn' => $order['data']['sn'] ?? '-',
                'updated_at' => now()
            ]);
            return redirect()->route('riwayat')->with('success', 'Transaksi berhasil diproses!');

        } catch (\Exception $e) {
            Log::error("DETAIL ERROR EWALLET: " . $e->getMessage());
            // JANGAN REFUND OTOMATIS JIKA EXCEPTION (Mencegah kerugian jika timeout tapi sukses di pusat)
            return redirect()->route('riwayat')->with('success', 'Pesanan diproses di latar belakang.');
        }
    }
}
