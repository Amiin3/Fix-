<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminController extends Controller
{
    public function index()
    {
        $hasDeposits = Schema::hasTable('deposits');
        $hasOrders = Schema::hasTable('orders');
        
        $stats = [
            'total_users'    => DB::table('users')->count(),
            'total_saldo'    => DB::table('users')->sum('saldo') ?? 0,
            'depo_pending'   => $hasDeposits ? DB::table('deposits')->where('status', 'Pending')->count() : 0,
            'order_sukses'   => $hasOrders ? DB::table('orders')->where('status', 'Sukses')->count() : 0,
            'omset_hari_ini' => $hasDeposits ? (DB::table('deposits')->where('status', 'Sukses')->whereDate('created_at', today())->sum('amount') ?? 0) : 0,
        ];
        
        $recent_deposits = $hasDeposits ? DB::table('deposits')
            ->join('users', 'deposits.user_id', '=', 'users.id')
            ->select('deposits.*', 'users.name as buyer')
            ->orderBy('deposits.id', 'desc')
            ->limit(10)->get() : [];
            
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recent_deposits' => $recent_deposits,
            'success' => session('success'),
            'error' => session('error')
        ]);
    }

    public function users() {
        return Inertia::render('Admin/Users', [
            'users' => DB::table('users')->select('id', 'name', 'email', 'level', 'saldo', 'phone')->orderBy('id', 'desc')->get()
        ]);
    }

    public function digiflazz() {
        return redirect()->route('admin.digiflazz.index');
    }

    public function approveDeposit($id) {
        $depo = DB::table('deposits')->where('id', $id)->first();
        if ($depo && $depo->status == 'Pending') {
            DB::beginTransaction();
            try {
                DB::table('deposits')->where('id', $id)->update(['status' => 'Sukses']);
                // TRIGGER WEBHOOK KE RESELLER MILAPAY V12
                app(\App\Http\Controllers\Api\PaymentGatewayController::class)->triggerWebhook($id);
                DB::table('users')->where('id', $depo->user_id)->increment('saldo', $depo->amount);
                DB::commit();
                return back()->with('success', 'Deposit disetujui, Saldo bertambah!');
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->with('error', 'Gagal memproses deposit.');
            }
        }
        return back()->with('error', 'Data deposit tidak valid.');
    }

    public function rejectDeposit($id) {
        DB::table('deposits')->where('id', $id)->where('status', 'Pending')->update([
            'status' => 'Gagal'
        ]);
        return back()->with('success', 'Deposit berhasil ditolak.');
    }
}
