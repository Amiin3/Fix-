<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Services\AdammediaService;

class AdminPOController extends Controller
{
    // Proteksi Khusus Admin
    private function checkAdmin(Request $request) {
        $user = $request->user();
        if (!$user || $user->level !== 'admin') {
            abort(403, 'Akses Ditolak. Khusus Sultan!');
        }
    }

    public function index(Request $request) {
        $this->checkAdmin($request);
        
        $antrean = DB::table('transaksi')
            ->where('is_po', 1)
            ->where('status', 'Pre-Order')
            ->orderBy('id', 'desc')
            ->get();
            
        $mode = Cache::get('po_v8_mode', 'auto');
        
        return inertia('Admin/ManagePOV8', [
            'antrean' => $antrean,
            'mode' => $mode
        ]);
    }

    public function toggleMode(Request $request) {
        $this->checkAdmin($request);
        $current = Cache::get('po_v8_mode', 'auto');
        $newMode = $current === 'auto' ? 'manual' : 'auto';
        Cache::put('po_v8_mode', $newMode);
        
        return response()->json(['success' => true, 'message' => 'Sistem PO kini berjalan di mode: ' . strtoupper($newMode)]);
    }

    public function retry(Request $request, $id, AdammediaService $srv) {
        $this->checkAdmin($request);
        
        $trx = DB::table('transaksi')->where('id', $id)->where('status', 'Pre-Order')->first();
        if (!$trx) return response()->json(['success' => false, 'message' => 'Data tidak valid atau sudah dieksekusi.']);
        
        try {
            $res = $srv->placeOrder($trx->ref_id, $trx->tujuan, $trx->kode_layanan);
            $statusAsli = strtoupper($res['status'] ?? '');
            $pesan = $res['sn'] ?? $res['message'] ?? 'Gangguan';

            $isNomorSalah = ($statusAsli === '52' || str_contains(strtolower($pesan), 'salah'));

            if ($statusAsli === '20' || $statusAsli === 'SUCCESS' || $statusAsli === 'SUKSES') {
                DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'sn' => $pesan, 'updated_at' => now()]);
                return response()->json(['success' => true, 'message' => '🔥 TEMBUS! Status berhasil diubah jadi Sukses.']);
            } elseif ($isNomorSalah) {
                // 🚀 FIX: Ubah 'username' jadi 'name'
                $user = DB::table('users')->where('name', $trx->username)->first();
                if ($user && $trx->is_refunded == 0) {
                    DB::transaction(function() use ($user, $trx, $pesan) {
                        DB::table('users')->where('id', $user->id)->increment('saldo', $trx->harga);
                        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'sn' => 'Refunded: ' . $pesan, 'is_refunded' => 1]);
                    });
                }
                return response()->json(['success' => true, 'message' => '❌ Nomor Salah! Status digagalkan dan Saldo dikembalikan.']);
            } else {
                DB::table('transaksi')->where('id', $trx->id)->update(['retry_count' => DB::raw('retry_count + 1'), 'sn' => 'Retry Manual: ' . $pesan, 'updated_at' => now()]);
                return response()->json(['success' => false, 'message' => '⚠️ Gagal tembus: ' . $pesan . ' (Stok masih kosong/Gangguan)']);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    public function cancel(Request $request, $id) {
        $this->checkAdmin($request);
        
        $trx = DB::table('transaksi')->where('id', $id)->where('status', 'Pre-Order')->first();
        if (!$trx) return response()->json(['success' => false, 'message' => 'Transaksi tidak ditemukan.']);
        
        if ($trx->is_refunded == 1) return response()->json(['success' => false, 'message' => 'Dana sudah pernah direfund!']);

        // 🚀 FIX: Ubah 'username' jadi 'name'
        $user = DB::table('users')->where('name', $trx->username)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'User tidak ditemukan.']);

        DB::transaction(function() use ($user, $trx) {
            DB::table('users')->where('id', $user->id)->increment('saldo', $trx->harga);
            DB::table('transaksi')->where('id', $trx->id)->update([
                'status' => 'Gagal', 
                'sn' => 'Dibatalkan paksa oleh Admin (Refunded)', 
                'is_refunded' => 1,
                'updated_at' => now()
            ]);
        });

        return response()->json(['success' => true, 'message' => 'Pesanan dibatalkan. Saldo Rp ' . number_format($trx->harga, 0, ',', '.') . ' dikembalikan ke user.']);
    }
}
