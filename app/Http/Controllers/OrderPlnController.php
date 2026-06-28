<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DigiflazzService;
use Inertia\Inertia;

class OrderPlnController extends Controller
{
    protected $digiflazz;
    public function __construct(DigiflazzService $digiflazz) {
        $this->digiflazz = $digiflazz;
    }

    public function index() {
        $products = DB::table('layanan')->where('status', 'active')
            ->whereIn('tipe', ['PLN', 'pln'])->orderBy('harga_jual', 'asc')->get();
        return Inertia::render('Order/Pln', [
            'products' => $products,
            'userBalance' => DB::table('users')->where('id', auth()->id())->value('saldo') ?? 0
        ]);
    }

    public function store(Request $request) {
        $user = auth()->user();
        $kodeLayanan = $request->kode_layanan;
        $tujuan = $request->tujuan;

        if (!$kodeLayanan || !$tujuan) return back()->with('error', 'Data tidak lengkap. Cek kode & tujuan!');
        $product = DB::table('layanan')->where('kode_layanan', $kodeLayanan)->first();
        if (!$product) return back()->with('error', "Produk $kodeLayanan tidak terdaftar.");
        
        $refId = 'PLN' . time() . rand(100,999);

        // 🛡️ TAHAP 1: KUNCI & POTONG SALDO DI DEPAN
        DB::beginTransaction();
        try {
            $dbUser = DB::table('users')->where('id', $user->id)->lockForUpdate()->first();
            if ($dbUser->saldo < $product->harga_jual) {
                DB::rollBack();
                return back()->with('error', 'Saldo tidak cukup Bosku!');
            }

            $cekSpam = DB::table('transaksi')->where('username', $user->name)->where('tujuan', $tujuan)
                ->where('kode_layanan', $kodeLayanan)->where('tanggal', '>=', now()->subMinutes(1))->first();
            if ($cekSpam) {
                DB::rollBack();
                return back()->with('error', '⚡ Sabar Bosku! Tunggu 1 menit sebelum tembak PLN ke nomor yang sama.');
            }

            // POTONG SALDO
            DB::table('users')->where('id', $user->id)->decrement('saldo', $product->harga_jual);
            
            // 🚀 INI DIA TAMBALANNYA BOSKU! (Catat waktu lengkap biar kebaca di Riwayat)
            DB::table('transaksi')->insert([
                'ref_id'       => $refId, 
                'username'     => $user->name, 
                'kode_layanan' => $product->kode_layanan,
                'tujuan'       => $tujuan, 
                'harga'        => $product->harga_jual, 
                'status'       => 'Pending', 
                'sn'           => 'Proses...', // Biar gak nge-bug di frontend
                'tanggal'      => now(),
                'created_at'   => now(),       // 👈 KUNCI UTAMA MUNCUL DI RIWAYAT
                'updated_at'   => now()        // 👈 KUNCI UTAMA
            ]);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Sistem Sibuk: Gagal mengunci saldo.');
        }

        // 🚀 TAHAP 2: TEMBAK API DIGIFLAZZ
        try {
            $order = $this->digiflazz->placeOrder($refId, $tujuan, $product->kode_layanan);
            $statusDigi = strtolower($order['data']['status'] ?? 'pending');
            
            if (!$order['success'] || $statusDigi === 'gagal') {
                $pesanDigi = $order['message'] ?? $order['data']['message'] ?? 'Nomor meter salah / Sedang gangguan.';
                $this->refundDanGagal($user->id, $refId, $product->harga_jual, $pesanDigi);
                return back()->with('error', "❌ Transaksi Gagal: " . $pesanDigi . " (Saldo Kembali)");
            }

            DB::table('transaksi')->where('ref_id', $refId)->update([
                'status'     => $order['data']['status'] ?? 'Pending',
                'sn'         => $order['data']['sn'] ?? '-',
                'updated_at' => now()
            ]);
            return back()->with('success', '✅ Order PLN Berhasil Diproses!');
        } catch (\Exception $e) {
            Log::error("DETAIL ERROR ORDER PLN: " . $e->getMessage());
            return back()->with('success', "Pesanan diproses di latar belakang.");
        }
    }

    private function refundDanGagal($userId, $refId, $harga, $pesan) {
        DB::transaction(function () use ($userId, $refId, $harga, $pesan) {
            $trx = DB::table('transaksi')->where('ref_id', $refId)->where('status', 'Pending')->lockForUpdate()->first();
            if ($trx) {
                DB::table('users')->where('id', $userId)->increment('saldo', $harga);
                DB::table('transaksi')->where('id', $trx->id)->update([
                    'status' => 'Gagal', 
                    'sn'         => substr($pesan, 0, 100),
                    'updated_at' => now()
                ]);
            }
        });
    }
}
