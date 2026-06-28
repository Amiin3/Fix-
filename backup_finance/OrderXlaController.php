<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OrderXlaController extends Controller
{
    public function index() {
        $list_po_codes = ['XLA89', 'XLA14', 'XLA39', 'XLA32', 'XLA51', 'XLA65'];
        $products = DB::table('layanan_khfy')
            ->whereIn('kode_layanan', $list_po_codes)
            ->where('status', 'active')
            ->get();
            
        $liveStock = [];
        try {
            $apiRes = Http::timeout(5)->get('https://panel.khfy-store.com/api_v3/cek_stock_akrab')->json();
            if (isset($apiRes['ok']) && $apiRes['ok'] == true) {
                foreach ($apiRes['data'] as $item) {
                    $liveStock[$item['type']] = $item['sisa_slot'];
                }
            }
        } catch (\Exception $e) {}

        foreach ($products as $p) {
            if (isset($liveStock[$p->kode_layanan])) {
                $p->stok = $liveStock[$p->kode_layanan];
            }
        }

        return Inertia::render('Order/Akrab', [
            'products' => $products,
            'userBalance' => auth()->user()->saldo ?? 0
        ]);
    }

    public function store(Request $request) {
        $request->validate([
            'no_hp' => 'required',
            'kode_produk' => 'required'
        ], [
            'no_hp.required' => 'Nomor tujuan wajib diisi!',
            'kode_produk.required' => 'Silakan pilih produk terlebih dahulu!'
        ]);

        $user = auth()->user();
        $user = \App\Models\User::where("id", $user->id)->lockForUpdate()->first();
        $apiKey = env('KHFY_API_KEY');

        $product = DB::table('layanan_khfy')->where('kode_layanan', $request->kode_produk)->first();
        if (!$product) return back()->with('error', 'Produk tidak ditemukan!');

        // 🎯 LOGIKA MULTI-NOMOR (Pemisahan Koma/Enter)
        $list_nomor_kotor = preg_split('/[\r\n, ]+/', $request->no_hp);
        $list_nomor_bersih = array_values(array_unique(array_filter($list_nomor_kotor, function($n) {
            return strlen(preg_replace('/[^0-9]/', '', $n)) >= 10;
        })));

        if (count($list_nomor_bersih) < 1) {
            return back()->with('error', 'Minimal 1 nomor tujuan valid (10 digit)!');
        }

        $total_harga_semua = $product->harga_jual * count($list_nomor_bersih);

        if ($user->saldo < $total_harga_semua) {
            return back()->with('error', 'Saldo tidak mencukupi untuk ' . count($list_nomor_bersih) . ' nomor!');
        }

        $berhasil = 0;
        $gagal = 0;
        $pesanGagal = "";
        $username = $user->username ?? $user->name ?? strval($user->id);

        DB::beginTransaction();
        try {
            foreach ($list_nomor_bersih as $nomor) {
                $reff_id = "INV-" . date("YmdHis") . rand(100, 999);
                
                // 🎯 BUG DIPERBAIKI: Gunakan nama kolom yang benar sesuai tabel 'transaksi'
                $id_trx = DB::table('transaksi')->insertGetId([
                    'ref_id' => $reff_id,
                    'username' => $username,
                    'kode_layanan' => $request->kode_produk,
                    'tujuan' => $nomor,
                    'harga' => $product->harga_jual,
                    'status' => 'Proses', // Default proses, menunggu Webhook
                    'sn' => 'Menunggu Server XLA',
                    'tanggal' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 🚀 TEMBAK API KHFY
                try {
                    $url = 'https://panel.khfy-store.com/api_v2/trx';
                    $response = Http::timeout(10)->get($url, [
                        'api_key' => $apiKey,
                        'produk' => $request->kode_produk,
                        'tujuan' => $nomor,
                        'reff_id' => $reff_id
                    ]);
                    
                    $resData = $response->json();

                    if (isset($resData['ok']) && $resData['ok'] === false) {
                        // Jika langsung ditolak API
                        DB::table('transaksi')->where('id', $id_trx)->update(['status' => 'Gagal', 'sn' => $resData['message'] ?? 'Ditolak Pusat']);
                        $gagal++;
                        $pesanGagal = $resData['message'] ?? '';
                    } else {
                        $berhasil++;
                    }
                } catch (\Exception $e) {
                    // Jika RTO, biarkan Proses, Webhook yang urus
                    $berhasil++; 
                }
            }

            // POTONG SALDO HANYA UNTUK YANG BERHASIL DITEMBAK
            if ($berhasil > 0) {
                $user->saldo -= ($berhasil * $product->harga_jual);
                $user->save();
            }

            DB::commit();

            if ($berhasil > 0) {
                return back()->with('success', "$berhasil Pesanan XLA berhasil dikirim ke Provider!" . ($gagal > 0 ? " ($gagal Gagal: $pesanGagal)" : ""));
            } else {
                return back()->with('error', "Gagal memproses pesanan: $pesanGagal");
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Sistem Sibuk: ' . $e->getMessage());
        }
    }
}
