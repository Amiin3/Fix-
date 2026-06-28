<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class RekberController extends Controller
{
    private $admin_fee = 2500; // Biaya Admin

    public function index() {
        $rekbers = DB::table('rekbers')
            ->where('buyer_id', Auth::id())
            ->orWhere('seller_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('Rekber/Index', ['rekbers' => $rekbers]);
    }

    public function create() {
        return Inertia::render('Rekber/Create', ['adminFee' => $this->admin_fee]);
    }

    public function checkSeller(Request $request) {
        $id = $request->identifier;
        $seller = DB::table('users')
            ->where('whatsapp', $id)
            ->orWhere('email', $id)
            ->orWhere('phone', $id)
            ->first();

        if (!$seller) return response()->json(['found' => false, 'message' => 'Akun Penjual tidak ditemukan di MilaStore!']);
        if ($seller->id === Auth::id()) return response()->json(['found' => false, 'message' => 'Masa Rekber sama diri sendiri Bosku? Lawak! 🤣']);

        $wa = $seller->whatsapp ?? $seller->phone ?? '-';
        $masked_wa = strlen($wa) > 6 ? substr($wa, 0, 4) . '****' . substr($wa, -3) : $wa;

        return response()->json(['found' => true, 'name' => $seller->name, 'masked_wa' => $masked_wa, 'seller_whatsapp' => $wa]);
    }

    public function store(Request $request) {
        $request->validate([
            'judul' => 'required|string|max:100',
            'nominal' => 'required|numeric|min:5000',
            'seller_whatsapp' => 'required|string',
        ]);

        $buyer = Auth::user();
        $seller = DB::table('users')->where('whatsapp', $request->seller_whatsapp)->orWhere('phone', $request->seller_whatsapp)->first();
        
        if (!$seller) return back()->with('error', 'Penjual tidak valid!');
        if ($seller->id === $buyer->id) return back()->with('error', 'Gagal! Rekber dengan diri sendiri.');

        $total_bayar = $request->nominal + $this->admin_fee;
        if ($buyer->saldo < $total_bayar) return back()->with('error', 'Saldo tidak cukup! Silakan Top Up.');

        DB::beginTransaction();
        try {
            $trx_id = 'MS-RK-' . strtoupper(Str::random(6));
            
            // 1. Tarik Saldo Pembeli
            DB::table('users')->where('id', $buyer->id)->decrement('saldo', $total_bayar);
            
            // 2. Catat Transaksi (SINKRONISASI DATABASE)
            DB::table('rekbers')->insert([
                'trx_id' => $trx_id,
                'buyer_id' => $buyer->id,
                'seller_id' => $seller->id,
                'seller_name' => $seller->name,
                'seller_whatsapp' => $seller->whatsapp,
                'judul_pesanan' => $request->judul,
                'deskripsi_pesanan' => '-', // 💉 INI OBATNYA! Biar SQL gak nolak karena kosong
                'nominal' => $request->nominal,
                'fee' => $this->admin_fee,
                'total_bayar' => $total_bayar,
                'fee_payer' => 'buyer',
                'status' => 'secured', // Langsung masuk brankas Admin
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();
            return redirect()->route('rekber.show', $trx_id)->with('success', 'Dana berhasil diamankan di MilaStore!');
        } catch (\Exception $e) {
            DB::rollBack();
            // 🚨 LEMPAR PESAN ERROR ASLI KE LAYAR BIAR KETAHUAN KALAU ADA BUG LAGI
            return back()->with('error', 'Gagal Sistem: ' . $e->getMessage());
        }
    }

    public function accRekber($trx_id) {
        $rekber = DB::table('rekbers')->where('trx_id', $trx_id)->where('seller_id', Auth::id())->first();
        if (!$rekber || $rekber->status !== 'secured') return back()->with('error', 'Akses ditolak!');

        DB::table('rekbers')->where('trx_id', $trx_id)->update(['status' => 'processed', 'updated_at' => now()]);
        return back()->with('success', 'Pesanan diproses! Silakan kirim barang ke Pembeli.');
    }

    public function releaseFunds($trx_id) {
        $rekber = DB::table('rekbers')->where('trx_id', $trx_id)->where('buyer_id', Auth::id())->first();
        if (!$rekber || $rekber->status !== 'processed') return back()->with('error', 'Akses ditolak!');

        DB::beginTransaction();
        try {
            DB::table('users')->where('id', $rekber->seller_id)->increment('saldo', $rekber->nominal);
            DB::table('rekbers')->where('trx_id', $trx_id)->update(['status' => 'success', 'updated_at' => now()]);

            DB::commit();
            return back()->with('success', 'Selesai! Dana sudah masuk ke akun Penjual.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mencairkan: ' . $e->getMessage());
        }
    }

    public function show($trx_id) {
        $rekber = DB::table('rekbers')->where('trx_id', $trx_id)->first();
        if (!$rekber) abort(404);
        return Inertia::render('Rekber/Show', ['rekber' => $rekber]);
    }
}
