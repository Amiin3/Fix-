<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AuditController extends Controller {
    
    public function index(Request $request) {
        // JALUR API AMBIL DATA AUDIT
        if ($request->has('audit_user')) {
            $identifier = $request->audit_user;
            $user = DB::table('users')
                ->where('name', $identifier)
                ->orWhere('email', $identifier)
                ->orWhere('whatsapp', $identifier)
                ->first();
                
            if (!$user) return response()->json(['error' => 'Member tidak ditemukan!']);

            $deposits = DB::table('deposits')
                ->where('user_id', $user->id)
                ->whereIn('status', ['Sukses', 'success', 'SUKSES'])
                ->orderBy('id', 'desc')->get();

            $transaksi = DB::table('transaksi')
                ->where('username', $user->name)
                ->whereIn('status', ['Sukses', 'Proses', 'Pending', 'success', 'SUKSES', 'PROSES', 'PENDING'])
                ->orderBy('id', 'desc')->get();

            return response()->json([
                'user' => $user,
                'deposits' => $deposits,
                'transaksi' => $transaksi
            ]);
        }

        // JALUR SINKRONISASI SALDO
        if ($request->has('fix_saldo_user_id')) {
            DB::table('users')->where('id', $request->fix_saldo_user_id)->update(['saldo' => $request->new_saldo]);
            return back()->with('success', 'Sinkronisasi berhasil! Saldo user kini Rp ' . number_format($request->new_saldo, 0, ',', '.'));
        }

        return Inertia::render('Admin/Audit/Index');
    }
}
