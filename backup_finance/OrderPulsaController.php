<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DigiflazzService;
use Inertia\Inertia;
use Exception;

class OrderPulsaController extends Controller
{
    protected $digiflazz;

    public function __construct(DigiflazzService $digiflazz) {
        $this->digiflazz = $digiflazz;
    }

    public function index() {
        $products = DB::table('layanan')->where('status', 'active')
            ->whereIn('tipe', ['PULSA', 'pulsa'])
            ->orderBy('harga_jual', 'asc')->get();

        $grouped = [];
        foreach ($products as $p) {
            $providerName = strtoupper(str_replace(' ', '', $p->provider));
            $grouped[$providerName][] = $p;
        }

        return Inertia::render('Order/Pulsa', [
            'products' => $products,
            'groupedProducts' => (object)$grouped,
            'userBalance' => auth()->user()->saldo ?? 0
        ]);
    }

    public function store(Request $request) {
        Log::info('[PULSA MASUK]', $request->all());

        if (empty($request->kode_layanan)) return back()->with('error', 'Pilih nominal pulsa terlebih dahulu!');
        if (empty($request->tujuan)) return back()->with('error', 'Nomor tujuan tidak boleh kosong!');

        $kodeLayanan = $request->kode_layanan;
        $tujuan = preg_replace('/[^0-9]/', '', $request->tujuan);
        $userId = auth()->id();
        $refId = 'AMI-' . date('YmdHis') . rand(100, 999);

        try {
            DB::beginTransaction();
            $user = DB::table('users')->where('id', $userId)->lockForUpdate()->first();
            $product = DB::table('layanan')->where('kode_layanan', $kodeLayanan)->first();

            if (!$user || !$product) throw new Exception('User atau Produk tidak ditemukan!');
            if ((float)$user->saldo < (float)$product->harga_jual) throw new Exception('Saldo Anda tidak cukup!');

            DB::table('users')->where('id', $userId)->decrement('saldo', (float)$product->harga_jual);
            DB::table('transaksi')->insert([
                'ref_id' => $refId, 'username' => $user->name, 'kode_layanan' => $product->kode_layanan,
                'tujuan' => $tujuan, 'harga' => $product->harga_jual, 'status' => 'Pending',
                'tanggal' => now(), 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }

        try {
            $order = $this->digiflazz->placeOrder($refId, $tujuan, $product->kode_layanan);

            if (!isset($order['success']) || $order['success'] == false) {
                DB::beginTransaction();
                DB::table('users')->where('id', $userId)->increment('saldo', $product->harga_jual);
                DB::table('transaksi')->where('ref_id', $refId)->update([
                    'status' => 'Gagal', 'sn' => substr($order['message'] ?? 'Ditolak Pusat', 0, 100), 'updated_at' => now()
                ]);
                DB::commit();
                
                // 🛑 NOTIF GAGAL (OPSIONAL)
                $this->kirimNotifSultan($user->email, "Transaksi Gagal ❌", "Pesanan " . $product->nama_layanan . " gagal. Saldo telah dikembalikan.");
                
                return redirect()->route('riwayat')->with('error', 'Gagal: ' . ($order['message'] ?? 'Gangguan pusat.'));
            }

            DB::table('transaksi')->where('ref_id', $refId)->update([
                'status' => 'Proses', 'sn' => $order['data']['sn'] ?? 'Pesanan Diterima', 'updated_at' => now()
            ]);

            // 🚀 NOTIF SUKSES MELUNCUR KE HP MEMBER!
            $this->kirimNotifSultan(
                $user->email, 
                "Pulsa Diproses! 🚀", 
                "Pesanan " . $product->nama_layanan . " ke " . $tujuan . " sedang diproses. Cek SN berkala!"
            );

            return redirect()->route('riwayat')->with('success', 'Transaksi berhasil diproses!');
        } catch (Exception $e) {
            Log::error('[PULSA TIMEOUT] ' . $e->getMessage());
            return redirect()->route('riwayat')->with('success', 'Pesanan diproses di latar belakang.');
        }
    }
}
