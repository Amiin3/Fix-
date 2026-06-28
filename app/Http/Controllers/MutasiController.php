<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class MutasiController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $bulanIni = Carbon::now()->format('Y-m');

        // 1. Ambil Data Transaksi (Uang Keluar)
        // Kita gunakan tabel 'transaksi' dan pastikan mengecek apakah tabelnya benar ada.
        // Tambahkan fallback kosong jika terjadi error agar halaman tidak crash.
        try {
            $transaksi = DB::table('transaksi')
                ->where('username', $user->username)
                ->select('ref_id as id', 'kode_layanan as keterangan', 'harga as nominal', 'status', 'tanggal', DB::raw("'KELUAR' as tipe"))
                ->get();
        } catch (\Exception $e) {
            $transaksi = collect([]); // Fallback kosong jika tabel belum siap/error
        }

        // 2. Ambil Data Deposit (Uang Masuk)
        try {
            $deposits = DB::table('deposits')
                ->where('username', $user->username)
                ->select('id', DB::raw("'Topup Saldo' as keterangan"), 'amount as nominal', 'status', 'tanggal', DB::raw("'MASUK' as tipe"))
                ->get();
        } catch (\Exception $e) {
            $deposits = collect([]); // Fallback kosong
        }

        // 3. Gabungkan dan Urutkan dari yang terbaru
        $mutasi = $transaksi->concat($deposits)->sortByDesc('tanggal')->values();

        // 4. Hitung Statistik Bulan Ini (Hanya yang Sukses)
        $totalMasuk = $deposits->where('status', 'Sukses')->filter(function ($item) use ($bulanIni) {
            return substr($item->tanggal, 0, 7) == $bulanIni;
        })->sum('nominal');

        $totalKeluar = $transaksi->where('status', 'Sukses')->filter(function ($item) use ($bulanIni) {
            return substr($item->tanggal, 0, 7) == $bulanIni;
        })->sum('nominal');

        return Inertia::render('History/Mutasi', [
            'mutasi' => $mutasi,
            'statistik' => [
                'bulan' => Carbon::now()->translatedFormat('F Y'),
                'total_masuk' => $totalMasuk,
                'total_keluar' => $totalKeluar,
                'saldo_sekarang' => $user->saldo ?? 0
            ]
        ]);
    }
}
