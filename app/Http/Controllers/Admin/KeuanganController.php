<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KeuanganController extends Controller
{
    public function index()
    {
        // 1. Statistik Utama
        $stats = [
            'total_saldo' => DB::table('users')->sum('saldo') ?? 0,
            'depo_pending' => DB::table('deposits')->where('status', 'Pending')->count(),
            'depo_hari_ini' => DB::table('deposits')->where('status', 'Sukses')->whereDate('tanggal', today())->sum('amount') ?? 0,
            'total_member' => DB::table('users')->count()
        ];

        // 2. Data Portofolio Finansial (All Time)
        $total_dana_masuk = DB::table('deposits')->where('status', 'Sukses')->sum('amount') ?? 0;
        $saldo_mengendap = $stats['total_saldo'];
        // Dana terpakai = Total uang masuk dikurangi uang yang masih mengendap di saldo user
        $dana_terpakai = $total_dana_masuk - $saldo_mengendap;
        if ($dana_terpakai < 0) $dana_terpakai = 0; // Jaga-jaga kalau Bos banyak inject saldo gratisan

        $portofolio = [
            'total_masuk' => $total_dana_masuk,
            'saldo_mengendap' => $saldo_mengendap,
            'dana_terpakai' => $dana_terpakai,
            'persentase_terpakai' => $total_dana_masuk > 0 ? round(($dana_terpakai / $total_dana_masuk) * 100) : 0
        ];

        // 3. Ambil Riwayat & Data User
        $deposits = DB::table('deposits')
            ->leftJoin('users', 'deposits.user_id', '=', 'users.id')
            ->select('deposits.*', 'users.name as buyer')
            ->orderBy('deposits.id', 'desc')
            ->limit(10)
            ->get();

        $users = DB::table('users')
            ->select('id', 'name', 'email', 'saldo', 'phone')
            ->orderBy('saldo', 'desc')
            ->get();

        return Inertia::render('Admin/Keuangan', [
            'stats' => $stats,
            'portofolio' => $portofolio,
            'deposits' => $deposits,
            'users' => $users,
            'success' => session('success'),
            'error' => session('error')
        ]);
    }

    public function updateSaldo(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'aksi' => 'required|in:tambah,kurang',
            'jumlah' => 'required|numeric',
        ]);

        $multiplier = ($request->aksi == 'tambah') ? 1 : -1;
        
        $user = DB::table('users')
            ->where('name', $request->username)
            ->orWhere('email', $request->username)
            ->first();
        
        if (!$user) {
            return back()->with('error', 'Member tidak ditemukan!');
        }

        DB::table('users')->where('id', $user->id)->increment('saldo', $multiplier * $request->jumlah);
        
        return back()->with('success', 'Saldo ' . $user->name . ' Berhasil Diupdate!');
    }
}
