<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReferralController extends Controller {
    public function index(Request $request) {
        $user = clone $request->user();
        
        try {
            // 1. Cek & Buat Kode Referral (Menggunakan kolom 'kode_referral' milik Lu)
            if (empty($user->kode_referral)) {
                $code = 'MILA' . $user->id . rand(100, 999);
                DB::table('users')->where('id', $user->id)->update(['kode_referral' => $code]);
                $user->kode_referral = $code;
            }

            // 2. Ambil Daftar Downline (Menggunakan kolom 'uplink_id' milik Lu)
            $downlines = DB::table('users')
                ->where('uplink_id', $user->id)
                ->select('name', 'email', 'created_at')
                ->orderBy('id', 'desc')
                ->get();

        } catch (\Exception $e) {
            $downlines = [];
        }

        // Paksa referral_code dari kode_referral biar React gak error
        $user->referral_code = $user->kode_referral;

        return Inertia::render('Profile/Referral', [
            'user' => $user,
            'downlines' => $downlines,
            'komisi' => $user->komisi ?? 0
        ]);
    }

    public function cairkan(Request $request) {
        $user = $request->user();
        try {
            if (!isset($user->komisi) || $user->komisi < 10000) {
                return back()->with('error', 'Komisi belum cukup (Minimal Rp 10.000)');
            }

            DB::beginTransaction();
            DB::table('users')->where('id', $user->id)->decrement('komisi', $user->komisi);
            DB::table('users')->where('id', $user->id)->increment('saldo', $user->komisi);
            
            // Catat ke riwayat transaksi
            DB::table('transaksi')->insert([
                'ref_id' => 'CAIR' . time(),
                'username' => $user->name,
                'kode_layanan' => 'CAIR_KOMISI',
                'tujuan' => $user->whatsapp,
                'harga' => $user->komisi,
                'status' => 'SUKSES',
                'sn' => 'Pencairan Komisi',
                'sku' => 'INTERNAL',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            DB::commit();

            return back()->with('success', 'Berhasil! Komisi masuk ke saldo utama.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mencairkan komisi: ' . $e->getMessage());
        }
    }
}
