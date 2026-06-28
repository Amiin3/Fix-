<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderPoXdaController extends Controller {
    public function store(Request $request) {
        DB::beginTransaction();
        try {
            if (!$request->kode_layanan || !$request->tujuan) throw new Exception("Data tidak lengkap!");

            $user = $request->user();
            
            // Ambil produk
            $prod = DB::table('layanan_kaje')->where('kode_layanan', $request->kode_layanan)->first();
            if (!$prod) throw new Exception("Paket layanan tidak ditemukan di sistem!");

            $list_nomor = array_values(array_unique(array_filter(preg_split('/[\r\n, ]+/', $request->tujuan))));
            if (count($list_nomor) < 1) throw new Exception("Nomor tujuan tidak valid!");

            $total_harga = $prod->harga_jual * count($list_nomor);
            
            // Kunci saldo
            $dbUser = DB::table('users')->where('id', $user->id)->lockForUpdate()->first();
            if ($dbUser->saldo < $total_harga) throw new Exception("Saldo tidak cukup! Butuh Rp " . number_format($total_harga, 0, ',', '.'));

            foreach ($list_nomor as $nomor) {
                // 🎯 FIX: Murni pakai kode_produk untuk tabel antrian_kaje
                $cek = DB::table('antrian_kaje')
                    ->where('tujuan', $nomor)
                    ->where('kode_produk', $prod->kode_layanan)
                    ->whereIn('status', ['Menunggu', 'Proses_API'])
                    ->first();
                if ($cek) continue;

                $ref_id = 'KJE-' . date('YmdHis') . rand(1000, 9999);

                // 1. Masuk ke tabel TRANSAKSI (Pakai kode_layanan sesuai rontgen)
                DB::table('transaksi')->insert([
                    'ref_id' => $ref_id,
                    'username' => $user->name,
                    'tujuan' => $nomor,
                    'kode_layanan' => $prod->kode_layanan,
                    'harga' => $prod->harga_jual,
                    'status' => 'Pending',
                    'tanggal' => date('Y-m-d'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // 2. Masuk ke tabel ANTRIAN KAJE (Pakai kode_produk)
                DB::table('antrian_kaje')->insert([
                    'ref_id' => $ref_id,
                    'username' => $user->name,
                    'tujuan' => $nomor,
                    'kode_produk' => $prod->kode_layanan,
                    'status' => 'Menunggu',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Potong Saldo
            DB::table('users')->where('id', $user->id)->decrement('saldo', $total_harga);
            
            DB::commit();
            return back()->with('success', 'Berhasil! ' . count($list_nomor) . ' order masuk antrian Server Pusat.');
        } catch (Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
