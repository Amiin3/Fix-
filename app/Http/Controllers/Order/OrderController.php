<?php
namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class OrderController extends Controller {

    // 🚀 MESIN DISKON RESELLER V12 (KLOP DENGAN TAMPILAN DEPAN)
    private function kalkulasiDiskonSultan($hargaJual, $hargaBeli, $level) {
        $level = strtolower($level);
        $kastaDewa = ['reseller', 'agen', 'h2h', 'vip', 'mitra', 'super agen'];
        
        // Jika kasta dewa, potong harga berdasarkan margin keuntungan
        if (in_array($level, $kastaDewa)) {
            $margin = $hargaJual - $hargaBeli;
            if ($margin >= 3000) return $hargaJual - 1500;
            if ($margin >= 1500) return $hargaJual - 750;
            if ($margin >= 500) return $hargaJual - 250;
        }
        
        // Jika member biasa, balikin margin wajar seperti kodingan lama (+200)
        if ($level !== 'admin' && !in_array($level, $kastaDewa)) {
            return $hargaJual + 200; 
        }
        
        // Jika Admin, harga jual murni
        return $hargaJual;
    }

    public function place(Request $request, \App\Services\AdammediaService $srv) {
        $userSession = $request->user();
        if (!$userSession) return response()->json(['success' => false, 'message' => 'Sesi habis.']);
        
        $lock = Cache::lock('order_lock_' . $userSession->id, 5);
        if (!$lock->get()) return response()->json(['success' => false, 'message' => 'Sabar Bos, jangan double klik!']);
        
        try {
            // 1. Validasi Produk
            $p = DB::table('ppob_products')->where('product_code', $request->product_code)->first();
            if (!$p) throw new \Exception('Produk ['.$request->product_code.'] Tidak Ketemu!');

            // 2. Baca User Asli dari DB
            $userDb = DB::table('users')->where('id', $userSession->id)->first();
            $userLevel = $userDb->level ?? 'member';

            // 3. 🚀 KALKULASI HARGA DISKON RESELLER (SINKRON DENGAN TAMPILAN V8)
            $hargaAkhir = $this->kalkulasiDiskonSultan($p->price_sell, $p->price_buy ?? 0, $userLevel);

            $targets = preg_split('/[\r\n,]+/', trim($request->target), -1, PREG_SPLIT_NO_EMPTY);
            $jumlahTarget = count($targets);
            if ($jumlahTarget < 1) throw new \Exception('Nomor tujuan tidak valid/kosong!');
            
            $totalHarga = $hargaAkhir * $jumlahTarget;

            // 4. 🚀 BENTENG SULTAN: PESSIMISTIC LOCK (Anti Saldo Minus Saat Dibrutal)
            DB::beginTransaction();
            try {
                $userLocked = \App\Models\User::where('id', $userSession->id)->lockForUpdate()->first();
                if ($userLocked->saldo < $totalHarga) {
                    DB::rollBack();
                    throw new \Exception('Saldo Kurang Bosku! Total Tagihan: Rp ' . number_format($totalHarga, 0, ',', '.'));
                }
                // Potong Saldo dengan Aman
                DB::table('users')->where('id', $userLocked->id)->decrement('saldo', $totalHarga);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw clone $e; // Lempar ke blok catch utama untuk return JSON
            }

            $berhasil = 0; $masukPO = 0; $gagalTotal = 0; $pesanGagal = [];

            // 5. EKSEKUSI TARGET
            foreach ($targets as $index => $noTujuan) {
                $noTujuan = trim($noTujuan);
                $refId = 'MILA' . time() . rand(10,99) . $index;
                
                $trxId = DB::table('transaksi')->insertGetId([
                    'ref_id'       => $refId,
                    'username'     => $userDb->name,
                    'kode_layanan' => $p->product_code,
                    'tujuan'       => $noTujuan,
                    'harga'        => (int)$hargaAkhir,
                    'status'       => 'Pending',
                    'sku'          => 'ADAMMEDIA',
                    'sn'           => 'Memproses ke pusat...',
                    'is_po'        => 0,
                    'retry_count'  => 0,
                    'is_refunded'  => 0,
                    'created_at'   => now(),
                    'updated_at'   => now()
                ]);

                // 🚀 REM CAKRAM PO
                if ($request->order_mode === 'po') {
                    DB::table('transaksi')->where('id', $trxId)->update([
                        'status' => 'Pre-Order', 'sn' => 'Antre PO (Pilihan User)', 'is_po' => 1
                    ]);
                    $masukPO++;
                    continue; // Skip placeOrder, lanjut antrean berikutnya
                }

                // 📡 TEMBAK PROVIDER ADAMMEDIA
                $res = $srv->placeOrder($refId, $noTujuan, $p->product_code);
                $statusAsli = strtoupper($res['status'] ?? '');
                $pesanDariPusat = $res['sn'] ?? $res['message'] ?? 'Menunggu Respon Pusat';
                
                $isStokKosong = ($statusAsli === '45' || str_contains(strtolower($pesanDariPusat), 'kosong') || str_contains(strtolower($pesanDariPusat), 'ditutup'));
                $isNomorSalah = ($statusAsli === '52' || str_contains(strtolower($pesanDariPusat), 'salah'));
                $isGagalUmum = ($statusAsli === 'FAILED' || $statusAsli === 'GAGAL' || $statusAsli === 'ERROR' || str_contains(strtolower($pesanDariPusat), 'saldo'));

                if ($isStokKosong) {
                    // AUTO-KILL LOKAL (Gembok Stok Kosong)
                    DB::table("ppob_products")->where("product_code", $p->product_code)->update(["stock_count" => 0]);
                    DB::table('transaksi')->where('id', $trxId)->update([
                        'status' => 'Pre-Order', 'sn' => 'Antre PO: ' . $pesanDariPusat, 'is_po' => 1
                    ]);
                    $masukPO++;
                } elseif ($isNomorSalah || $isGagalUmum) {
                    // 🔴 REFUND DENGAN PESSIMISTIC LOCK (ANTI BOCOR SAAT TRANSAKSI GAGAL)
                    DB::transaction(function() use ($userLocked, $trxId, $hargaAkhir, $pesanDariPusat) {
                        $dbUserRefund = \App\Models\User::where('id', $userLocked->id)->lockForUpdate()->first();
                        DB::table('users')->where('id', $userLocked->id)->update(['saldo' => $dbUserRefund->saldo + $hargaAkhir]);
                        
                        DB::table('transaksi')->where('id', $trxId)->update([
                            'status' => 'Gagal', 'sn' => 'Refunded: ' . $pesanDariPusat, 'is_refunded' => 1
                        ]);
                    });
                    $pesanGagal[] = "[$noTujuan]";
                    $gagalTotal++;
                } else {
                    // 🟢 SUKSES
                    $statusFinal = ($statusAsli === 'SUCCESS' || $statusAsli === 'SUKSES' || $statusAsli === '20') ? 'Sukses' : 'Pending';
                    DB::table('transaksi')->where('id', $trxId)->update(['status' => $statusFinal, 'sn' => $pesanDariPusat]);
                    
                    // KOMISI UPLINK
                    if ($statusFinal === 'Sukses' && !empty($userDb->uplink_id)) {
                        DB::table("users")->where("id", $userDb->uplink_id)->increment("komisi", 50);
                    }
                    $berhasil++;
                }
            }
            
            $lock->release();
            
            // RESPONS ADAPTIF FRONTEND V8
            if ($request->order_mode === 'po') return response()->json(['success' => true, 'is_po_alert' => true, 'message' => "$jumlahTarget nomor masuk Antrean PO!"]);
            if ($berhasil === $jumlahTarget) return response()->json(['success' => true, 'message' => "Sempurna! $berhasil nomor berhasil disuntik!"]);
            if ($masukPO === $jumlahTarget) return response()->json(['success' => true, 'is_po_alert' => true, 'message' => "Stok pusat limit! $masukPO nomor otomatis masuk PO."]);
            if ($berhasil > 0 || $masukPO > 0) return response()->json(['success' => true, 'message' => "Sukses: $berhasil, PO: $masukPO, Gagal: $gagalTotal"]);
            
            return response()->json(['success' => false, 'message' => "Semua gagal (Kemungkinan nomor salah). Saldo dikembalikan."]);
            
        } catch (\Exception $e) {
            if (isset($lock)) $lock->release();
            return response()->json(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
