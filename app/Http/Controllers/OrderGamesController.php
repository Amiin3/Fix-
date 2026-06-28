<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DigiflazzService;
use Inertia\Inertia;

class OrderGamesController extends Controller 
{
    protected $digiflazz;

    public function __construct(DigiflazzService $digiflazz) {
        $this->digiflazz = $digiflazz;
    }

    public function index() {
        $products = DB::table('layanan')->where('status', 'active')
            ->whereIn('tipe', ['GAMES', 'games'])
            ->orderBy('harga_jual', 'asc')->get();

        $grouped = [];
        foreach ($products as $p) {
            $providerName = strtoupper(str_replace(' ', '', $p->provider));
            $grouped[$providerName][] = $p;
        }

        return Inertia::render('Order/Games', [
            'products' => $products,
            'groupedProducts' => (object)$grouped,
            'userBalance' => auth()->user()->saldo ?? 0
        ]);
    }

    public function store(Request $request) {
        Log::info("DATA MASUK DARI REACT (GAMES): ", $request->all());

        try {
            $user = auth()->user();
            $kodeLayanan = $request->kode_layanan;
            $tujuan = $request->tujuan;

            if (!$kodeLayanan || !$tujuan) throw new \Exception("Data tidak lengkap. Kode: $kodeLayanan, Tujuan: $tujuan");

            $product = DB::table('layanan')->where('kode_layanan', $kodeLayanan)->first();

            if (!$product) throw new \Exception("Produk tidak terdaftar.");
            if ($user->saldo < $product->harga_jual) throw new \Exception("Saldo tidak cukup.");

            $refId = 'GME' . time() . rand(100,999);

            return DB::transaction(function() use ($user, $product, $tujuan, $refId) {
                DB::table('users')->where('id', $user->id)->decrement('saldo', $product->harga_jual);
                
                DB::table('transaksi')->insert([
                    'ref_id' => $refId,
                    'username' => $user->name,
                    'kode_layanan' => $product->kode_layanan,
                    'tujuan' => $tujuan,
                    'harga' => $product->harga_jual,
                    'status' => 'Pending',
                    'tanggal' => now(),
                ]);

                $order = $this->digiflazz->placeOrder($refId, $tujuan, $product->kode_layanan);
                if (!$order['success']) throw new \Exception($order['message']);

                DB::table('transaksi')->where('ref_id', $refId)->update([
                    'status' => $order['data']['status'],
                    'sn' => $order['data']['sn'] ?? '-'
                ]);

                return back()->with('success', 'Order Games Berhasil!');
            });
        } catch (\Exception $e) {
            Log::error("DETAIL ERROR GAMES: " . $e->getMessage());
            return back()->with('error', $e->getMessage());
        }
    }
}
