<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class KhfyWarController extends Controller
{
    private $apiKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = env('KHFY_API_KEY', '');
        $this->baseUrl = rtrim(env('KHFY_BASE_URL', 'https://panel.khfy-store.com/api_v2'), '/');
    }

    public function getTable()
    {
        $data = DB::table('antrian_po')->orderBy('id', 'desc')->limit(100)->get();
        return response()->json($data);
    }

    public function cancelRef(Request $request)
    {
        $ref_id = trim($request->input('ref_id'));
        try {
            DB::beginTransaction();
            $trx = DB::table('antrian_po')->where('ref_id', $ref_id)->where('status', 'Menunggu')->lockForUpdate()->first();
            
            if ($trx) {
                DB::table('antrian_po')->where('id', $trx->id)->update(['status' => 'Dibatalkan']);
                // 🔄 SYNC KE RIWAYAT UTAMA
                DB::table('transaksi')->where('ref_id', $ref_id)->update(['status' => 'Dibatalkan', 'keterangan' => 'Dibatalkan via War Station']);
                
                DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
                DB::commit();
                return response()->json(['status' => 'warning', 'log' => "CANCEL: TRX {$ref_id} dibatalkan & saldo dikembalikan."]);
            } else { 
                DB::rollBack();
                return response()->json(['status' => 'idle', 'log' => "GAGAL: Ref ID {$ref_id} sedang diproses atau sudah selesai."]); 
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'log' => "ERROR DB: " . $e->getMessage()]);
        }
    }

    public function cancelAll()
    {
        try {
            DB::beginTransaction();
            $trxList = DB::table('antrian_po')->where('status', 'Menunggu')->lockForUpdate()->get();
            $count = 0;
            
            foreach ($trxList as $row) {
                DB::table('antrian_po')->where('id', $row->id)->update(['status' => 'Dibatalkan']);
                // 🔄 SYNC KE RIWAYAT UTAMA
                DB::table('transaksi')->where('ref_id', $row->ref_id)->update(['status' => 'Dibatalkan', 'keterangan' => 'Mass Cancel Darurat']);
                
                DB::table('users')->where('name', $row->username)->increment('saldo', $row->harga);
                $count++;
            }
            
            DB::commit();
            return response()->json(['status' => 'warning', 'log' => "MASS CANCEL: {$count} antrian dibatalkan & direfund!"]); 
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'log' => "ERROR DB: Gagal eksekusi Mass Cancel."]);
        }
    }

    public function skip(Request $request)
    {
        $kode_skip = $request->input('kode');
        try {
            DB::beginTransaction();
            $trxList = DB::table('antrian_po')->where('kode_produk', $kode_skip)->whereIn('status', ['Menunggu', 'Proses_API'])->lockForUpdate()->get();
            
            foreach ($trxList as $row) {
                DB::table('users')->where('name', $row->username)->increment('saldo', $row->harga);
                // 🔄 SYNC KE RIWAYAT UTAMA
                DB::table('transaksi')->where('ref_id', $row->ref_id)->update(['status' => 'Gagal', 'keterangan' => 'Stok Habis (Skipped)']);
            }
            
            DB::table('antrian_po')->where('kode_produk', $kode_skip)->whereIn('status', ['Menunggu', 'Proses_API'])->update(['status' => 'Skipped']);
            DB::commit();
            
            return response()->json(['status' => 'info', 'log' => "SKIPPED: Antrian {$kode_skip} dilewati & direfund."]); 
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'log' => "ERROR DB: Gagal melakukan Skip."]);
        }
    }

    public function executeWar()
    {
        $target_prio = DB::table('antrian_po')->whereIn('status', ['Menunggu', 'Proses_API'])->min('prioritas');

        if (!$target_prio) {
            return response()->json(['status' => 'idle', 'log' => "IDLE: Semua antrian PO telah selesai."]);
        }

        // --- A. FAST POLLING (BLIND SCANNER) ---
        $dataPending = DB::table('antrian_po')->where('status', 'Proses_API')->get();
        $jumlahPending = $dataPending->count();

        if ($jumlahPending > 0) {
            foreach ($dataPending as $pending) {
                try {
                    $url_cek = "{$this->baseUrl}/history?api_key={$this->apiKey}&refid={$pending->ref_id}";
                    $response = Http::timeout(3)->withoutVerifying()->get($url_cek);
                    $resCek = $response->body();
                    $resCekLower = strtolower($resCek);
                    $is_valid_json = $response->json() !== null; 
                    
                    if ($is_valid_json && (strpos($resCekLower, 'sukses') !== false || strpos($resCekLower, 'success') !== false)) {
                        DB::table('antrian_po')->where('id', $pending->id)->update(['status' => 'Sukses']);
                        // 🔄 SYNC KE RIWAYAT UTAMA
                        DB::table('transaksi')->where('ref_id', $pending->ref_id)->update(['status' => 'Sukses', 'sn' => 'PO Sukses Ditembak']);
                        return response()->json(['status' => 'success', 'log' => "SLOT KOSONG: {$pending->ref_id} SUKSES! Lanjut Tembak!"]);
                    } 
                    elseif ($is_valid_json && (strpos($resCekLower, 'akrab') !== false || strpos($resCekLower, 'terdaftar') !== false)) {
                        DB::table('antrian_po')->where('id', $pending->id)->update(['status' => 'Gagal']);
                        // 🔄 SYNC KE RIWAYAT UTAMA
                        DB::table('transaksi')->where('ref_id', $pending->ref_id)->update(['status' => 'Gagal', 'keterangan' => 'Nomor Cacat/Akrab']);
                        DB::table('users')->where('name', $pending->username)->increment('saldo', $pending->harga);
                        return response()->json(['status' => 'warning', 'log' => "NOMOR CACAT (AKRAB): {$pending->tujuan} refund. NEXT!"]);
                    }
                    elseif ($is_valid_json && (strpos($resCekLower, 'gagal') !== false || strpos($resCekLower, 'batal') !== false || strpos($resCekLower, 'failed') !== false)) {
                        $new_ref = "PO" . time() . rand(10,99);
                        DB::table('antrian_po')->where('id', $pending->id)->update(['status' => 'Menunggu', 'ref_id' => $new_ref]);
                        // 🔄 SYNC KE RIWAYAT UTAMA (Ubah Ref ID juga)
                        DB::table('transaksi')->where('ref_id', $pending->ref_id)->update(['ref_id' => $new_ref]);
                        return response()->json(['status' => 'warning', 'log' => "GAGAL PUSAT ({$pending->kode_produk}). RESTART SPAM!"]);
                    }
                    elseif ($is_valid_json && (strpos($resCekLower, 'pending') !== false || strpos($resCekLower, 'menunggu') !== false)) {
                        // Biarkan saja, masih diproses pusat
                    }
                    else {
                        $new_ref = "PO" . time() . rand(10,99);
                        DB::table('antrian_po')->where('id', $pending->id)->update(['status' => 'Menunggu', 'ref_id' => $new_ref]);
                        // 🔄 SYNC KE RIWAYAT UTAMA
                        DB::table('transaksi')->where('ref_id', $pending->ref_id)->update(['ref_id' => $new_ref]);
                        return response()->json(['status' => 'warning', 'log' => "RESPON API ANEH. MENARIK PAKSA {$pending->kode_produk} UNTUK DIHAJAR ULANG!"]);
                    }
                } catch (\Exception $e) {}
            }
        }

        if ($jumlahPending >= 2) {
            return response()->json(['status' => 'wait', 'log' => "[PRIORITAS {$target_prio}] LIMIT PENUH. Pantau Provider..."]);
        }

        // --- B. AMBIL ANTRIAN BARU DENGAN LOCK (ANTI DOBEL) ---
        try {
            DB::beginTransaction();
            $trx = DB::table('antrian_po')->where('status', 'Menunggu')->where('prioritas', $target_prio)->orderBy('tanggal', 'asc')->lockForUpdate()->first();

            if (!$trx) {
                DB::commit();
                return response()->json(['status' => 'wait', 'log' => "[PRIORITAS {$target_prio}] Menunggu 1 TRX di provider selesai..."]);
            }

            DB::table('antrian_po')->where('id', $trx->id)->update(['status' => 'Proses_API']);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'log' => "ERROR DB: Gagal mengambil antrian."]);
        }

        // --- C. BRUTE FORCE SPAM API ---
        $url_trx = "{$this->baseUrl}/trx?produk={$trx->kode_produk}&tujuan={$trx->tujuan}&reff_id={$trx->ref_id}&api_key={$this->apiKey}";
        $spam_attempt = 0;
        $berhasil_masuk_antrian = false;
        $respon_terakhir = "";

        do {
            $spam_attempt++;
            try {
                $response = Http::timeout(5)->withoutVerifying()->withHeaders(['User-Agent' => 'Mozilla/5.0'])->get($url_trx);
                $res_json = $response->json();
                $respon_lower = strtolower($response->body() ?: "");
                
                if (strpos($respon_lower, 'akrab') !== false || strpos($respon_lower, 'terdaftar') !== false) {
                    DB::table('antrian_po')->where('id', $trx->id)->update(['status' => 'Gagal']);
                    // 🔄 SYNC KE RIWAYAT UTAMA
                    DB::table('transaksi')->where('ref_id', $trx->ref_id)->update(['status' => 'Gagal', 'keterangan' => 'Nomor Cacat/Akrab']);
                    DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
                    return response()->json(['status' => 'warning', 'log' => "NOMOR CACAT (AKRAB): {$trx->tujuan}. Digagalkan & direfund. NEXT!"]);
                }

                if ((isset($res_json['ok']) && $res_json['ok'] == true) || (isset($res_json['status']) && $res_json['status'] == true) || isset($res_json['trxid'])) {
                    $berhasil_masuk_antrian = true; break;
                }
                
                if (isset($res_json['error']) && strpos(strtolower($res_json['error']), 'rate_limit') !== false) {
                    sleep(1); break; 
                }
                usleep(250000); 
            } catch (\Exception $e) { $respon_terakhir = "Connection Error"; }
        } while ($spam_attempt < 10);

        // --- D. HASIL TEMBAKAN ---
        if ($berhasil_masuk_antrian) {
            return response()->json(['status' => 'shoot', 'log' => "[PRIORITAS {$trx->prioritas}] {$trx->kode_produk} -> {$trx->tujuan} DITEMBAKKAN!"]);
        } else {
            DB::table('antrian_po')->where('id', $trx->id)->update(['status' => 'Menunggu']);
            return response()->json(['status' => 'spamming', 'log' => "[PRIORITAS {$trx->prioritas}] {$trx->kode_produk} Gagal. SPAM ULANG!"]);
        }
    }
}
