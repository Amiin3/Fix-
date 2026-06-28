<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use App\Services\KajeService;
use Exception;

class OrderKajeAkrabController extends Controller
{
    public function index()
    {
        $userSession = auth()->user();
        
        // 🚀 BACA LEVEL SULTAN (Bypass Session)
        $userLevel = DB::table('users')->where('id', $userSession->id)->value('level') ?? 'member';

        $all_products = DB::table('layanan_kaje')->orderBy('kategori', 'asc')->orderBy('harga_jual', 'asc')->get();
        
        // 🚀 SUNTIK KACAMATA DISKON
        $all_products->transform(function($p) use ($userLevel) {
            $p->harga_jual = $this->hitungHargaReseller(
                $p->harga_jual, 
                $p->harga_beli ?? 0, 
                'kaje', 
                $userLevel
            );
            return $p;
        });

        $akrab_group = []; $other_group = [];
        foreach($all_products as $p) {
            $kat = trim($p->kategori);
            $kat = str_ireplace(['kj', 'KJ'], 'Amifi', $kat);
            if(empty($kat)) $kat = 'Lainnya';
            if (stripos($kat, 'Akrab') !== false) { $akrab_group[$kat][] = $p; }
            else { $other_group[$kat][] = $p; }
        }
        
        $grouped = array_merge($akrab_group, $other_group);
        
        return Inertia::render('Order/Akrab_v2', [
            'groupedProducts' => $grouped,
            'userBalance' => $userSession->saldo ?? 0
        ]);
    }

    public function pollStock(KajeService $kaje)
    {
        $res = $kaje->fetchKajeProducts();
        $live_data = [];
        if (isset($res['success']) && $res['success'] == true && isset($res['data']['products'])) {
            try {
                DB::beginTransaction();
                foreach ($res['data']['products'] as $p) {
                    $stat = ($p['status'] == 'open' && $p['stock'] > 0) ? 'active' : 'inactive';
                    DB::table('layanan_kaje')->where('kode_layanan', $p['code'])->update([
                        'stok' => $p['stock'], 'status' => $stat, 'last_update' => now()
                    ]);
                    $live_data[] = ['kode_layanan' => $p['code'], 'stok' => $p['stock'], 'status' => $stat];
                }
                DB::commit();
            } catch (Exception $e) { DB::rollBack(); }
        } else {
            // Jika API mati, tampilkan data DB yang sudah di diskon
            $live_data = DB::table('layanan_kaje')->orderBy('kategori', 'asc')->orderBy('harga_jual', 'asc')->get();
            $userLevel = DB::table('users')->where('id', auth()->id())->value('level') ?? 'member';
            $live_data->transform(function($p) use ($userLevel) {
                $p->harga_jual = $this->hitungHargaReseller($p->harga_jual, $p->harga_beli ?? 0, 'kaje', $userLevel);
                return $p;
            });
        }
        return response()->json(['status' => 'success', 'data' => $live_data]);
    }

    public function store(Request $request, KajeService $kaje)
    {
        $userSession = auth()->user();
        $lockKey = 'trx_kaje_' . $userSession->id;
        if (Cache::has($lockKey)) return response()->json(['status' => 'error', 'message' => 'Terlalu cepat!']);
        Cache::put($lockKey, true, 3);

        try {
            // 🚀 BACA LEVEL REALTIME
            $user = DB::table('users')->where('id', $userSession->id)->first();
            $userLevel = $user->level ?? 'member';

            $kode_produk = htmlspecialchars($request->kode_produk ?? '');
            $target = preg_replace('/[^0-9]/', '', $request->target ?? '');
            
            if (empty($target) || strlen($target) < 9) throw new Exception("Nomor tidak valid.");

            // 🛡️ TAHAP 1: KUNCI & POTONG SALDO AMAN
            DB::beginTransaction();
            $produk = DB::table('layanan_kaje')->where('kode_layanan', $kode_produk)->lockForUpdate()->first();
            if (!$produk || $produk->stok <= 0) throw new Exception("Stok kosong.");

            // 🚀 HITUNG HARGA DISKON
            $hargaAkhir = $this->hitungHargaReseller($produk->harga_jual, $produk->harga_beli ?? 0, 'kaje', $userLevel);

            if ($user->saldo < $hargaAkhir) throw new Exception("Saldo kurang.");

            $ref_id = "KJE" . date('ymdHi') . rand(100,999);
            
            DB::table('users')->where('id', $user->id)->decrement('saldo', $hargaAkhir);
            DB::table('transaksi')->insert([
                'created_at' => now(), 'updated_at' => now(),
                'username' => $user->name, 'ref_id' => $ref_id, 'kode_layanan' => $kode_produk,
                'tujuan' => $target, 'harga' => $hargaAkhir, 'status' => 'Pending',
                'sumber_api' => 'kajestore', 'tanggal' => now()
            ]);
            DB::commit(); // Transaksi awal sukses
            
        } catch (Exception $e) {
            // Jika gagal potong saldo dll, kembalikan seperti semula
            if (DB::transactionLevel() > 0) DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
        }

        // 🚀 TAHAP 2: TEMBAK API KAJE (Sistem Anti-Boncos)
        try {
            $res = $kaje->orderProduct($target, $kode_produk, $ref_id);
            $pesanPusat = $res['message'] ?? 'Menunggu Kaje';

            if (isset($res['success']) && $res['success'] == true) {
                DB::table('transaksi')->where('ref_id', $ref_id)->update(['status' => 'Proses', 'sn' => $pesanPusat]);
                return response()->json(['status' => 'success', 'message' => "Pesanan diproses!"]);
            } else {
                // 🔴 API KAJE MENOLAK -> REFUND REALTIME INSTAN!
                DB::transaction(function() use ($user, $hargaAkhir, $ref_id, $pesanPusat) {
                    DB::table('users')->where('id', $user->id)->increment('saldo', $hargaAkhir);
                    DB::table('transaksi')->where('ref_id', $ref_id)->update([
                        'status' => 'Gagal', 'sn' => 'Refunded: ' . $pesanPusat
                    ]);
                });
                return response()->json(['status' => 'error', 'message' => 'Pesanan Ditolak: ' . $pesanPusat . '. Saldo otomatis dikembalikan.']);
            }
        } catch (Exception $e) {
            // Jika API ngadat / RTO, biarkan PENDING biar dicek webhook
            return response()->json(['status' => 'success', 'message' => 'Sistem Kaje sibuk, pesanan diproses di latar belakang.']);
        }
    }
}
