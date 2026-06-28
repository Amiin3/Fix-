<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPoManagerController extends Controller
{
    // Mengeksekusi aksi dari tombol di dashboard admin
    public function action(Request $request)
    {
        $id = $request->id;
        $action = $request->action; // 'skip', 'batal', 'reset', 'delete'

        // 1. AKSI: SKIP (Bekukan sementara)
        if ($action === 'skip') {
            DB::table('antrian_po')->where('id', $id)->update(['status' => 'Di-Skip']);
            return back()->with('success', '⏸️ Nomor Di-Skip. Bot akan melewatkannya.');
        }

        // 2. AKSI: RESET (Kembalikan ke antrean tempur)
        if ($action === 'reset') {
            DB::table('antrian_po')->where('id', $id)->update(['status' => 'Menunggu', 'error_count' => 0]);
            return back()->with('success', '▶️ Masuk Antrean! Bot akan segera menembak.');
        }

        // 3. AKSI: HAPUS (Buang dari layar admin)
        if ($action === 'delete') {
            DB::table('antrian_po')->where('id', $id)->delete();
            return back()->with('success', '🗑️ Baris dihapus dari Radar.');
        }

        // 4. AKSI: BATAL & REFUND (🔥 100% ANTI DOUBLE REFUND)
        if ($action === 'batal') {
            DB::beginTransaction();
            try {
                // 🔒 PASANG GEMBOK DI ANTREAN
                $po = DB::table('antrian_po')->where('id', $id)->lockForUpdate()->first();
                
                if (!$po) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'msg' => '❌ Data tidak ditemukan di Radar!']);
                }

                // Cek apakah sudah pernah Sukses atau Gagal sebelumnya
                if (in_array($po->status, ['Sukses', 'Gagal'])) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'msg' => '❌ Aksi Ditolak: Status sudah ' . strtoupper($po->status) . ' (Mencegah Dobel Refund)']);
                }

                // 🔒 PASANG GEMBOK DI TRANSAKSI UTAMA
                $trx = DB::table('transaksi')->where('ref_id', $po->ref_id)->lockForUpdate()->first();

                // Eksekusi Refund HANYA jika transaksi ditemukan dan belum Sukses/Gagal
                if ($trx && !in_array($trx->status, ['Sukses', 'Gagal'])) {
                    
                    // Update Antrean
                    DB::table('antrian_po')->where('id', $id)->update(['status' => 'Gagal']);
                    
                    // Update Transaksi & SN
                    DB::table('transaksi')->where('id', $trx->id)->update([
                        'status' => 'Gagal',
                        'sn' => 'Dibatalkan oleh Admin',
                        'updated_at' => now()
                    ]);
                    
                    // Kembalikan Saldo User (Refund)
                    DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
                    
                    DB::commit();
                    return back()->with('success', '🛑 Dibatalkan & Saldo User Otomatis Kembali!');
                } else {
                    // Jika transaksi tidak ada di tabel utama, cukup gagalkan antreannya saja
                    DB::table('antrian_po')->where('id', $id)->update(['status' => 'Gagal']);
                    DB::commit();
                    return back()->with('success', '🛑 Antrean Dibatalkan (Tidak ada refund saldo).');
                }

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['success' => false, 'msg' => '🔥 Terjadi kesalahan Database!']);
            }
        }

        return response()->json(['success' => false, 'msg' => 'Aksi tidak valid!']);
    }
}
