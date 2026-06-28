<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminRekberController extends Controller
{
    private function checkAdmin() {
        $user = Auth::user();
        if ($user->role === 'admin' || $user->is_admin == 1 || $user->level === 'admin') {
            return true;
        }
        return false;
    }

    public function index() {
        if (!$this->checkAdmin()) return redirect('/dashboard')->with('error', 'Akses Ditolak! Lu bukan Hakim Agung!');
        $rekbers = DB::table('rekbers')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Rekber/Index', ['rekbers' => $rekbers]);
    }

    public function action(Request $request, $trx_id) {
        if (!$this->checkAdmin()) abort(403);

        $action = $request->action;

        // 🚨 PENGAMAN: Kalau React ngirim data kosong atau ngaco, tolak mentah-mentah!
        if (!in_array($action, ['refund', 'forward'])) {
            return back()->with('error', 'Perintah tidak valid dari sistem!');
        }

        $rekber = DB::table('rekbers')->where('trx_id', $trx_id)->first();
        if (!$rekber || in_array($rekber->status, ['success', 'refunded', 'canceled'])) {
            return back()->with('error', 'Transaksi sudah selesai/batal. Gak bisa diutak-atik lagi!');
        }

        $msg = 'Vonis berhasil!'; // 💉 OBAT ANTI UNDEFINED VARIABLE
        
        DB::beginTransaction();
        try {
            if ($action === 'refund') {
                DB::table('users')->where('id', $rekber->buyer_id)->increment('saldo', $rekber->total_bayar);
                DB::table('rekbers')->where('trx_id', $trx_id)->update(['status' => 'refunded', 'updated_at' => now()]);
                $msg = 'VONIS DIKETUK: Saldo dikembalikan UTUH ke Pembeli!';
            } elseif ($action === 'forward') {
                DB::table('users')->where('id', $rekber->seller_id)->increment('saldo', $rekber->nominal);
                DB::table('rekbers')->where('trx_id', $trx_id)->update(['status' => 'success', 'updated_at' => now()]);
                $msg = 'VONIS DIKETUK: Saldo dipaksa cair ke Penjual!';
            }

            DB::commit();
            return back()->with('success', $msg);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengeksekusi vonis: ' . $e->getMessage());
        }
    }
}
