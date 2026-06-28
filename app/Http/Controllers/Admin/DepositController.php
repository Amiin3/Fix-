<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DepositController extends Controller {
    public function index(Request $request) {
        $search = $request->input('search');

        // Kunci koneksi ke tabel user pakai leftJoin (Data Deposit Mutlak Muncul Semua)
        $query = DB::table('deposits')
            ->leftJoin('users', 'deposits.user_id', '=', 'users.id')
            ->select('deposits.*', 'users.name as member_name', 'users.username')
            ->orderBy('deposits.id', 'desc');

        // MESIN PENCARI
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('users.username', 'like', "%{$search}%")
                  ->orWhere('users.name', 'like', "%{$search}%")
                  ->orWhere('deposits.id', 'like', "%{$search}%")
                  ->orWhere('deposits.metode', 'like', "%{$search}%");
            });
            $deposits = $query->paginate(500)->withQueryString();
        } else {
            $deposits = $query->paginate(20)->withQueryString();
        }

        $qris_string = DB::table('payment_settings')->where('metode', 'QRIS')->value('nomor') ?: '';

        return Inertia::render('Admin/Deposit/Index', [
            'deposits' => $deposits,
            'qris_string' => $qris_string,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request) {
        DB::table('payment_settings')->updateOrInsert(
            ['metode' => 'QRIS'],
            [
                'nomor' => $request->qris_base,
                'atas_nama' => 'AMIFI STORE',
                'updated_at' => now()
            ]
        );
        return back()->with('success', 'String Base QRIS Berhasil Diupdate!');
    }
}
