<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleKhfy(Request $request)
    {
        // 1. Ambil data message sesuai dokumentasi
        $message = $request->query('message') ?? $request->input('message') ?? json_decode($request->getContent(), true)['message'] ?? null;

        if (empty($message)) {
            Log::warning('[WEBHOOK KHFY] Message Kosong');
            return response()->json(['ok' => false, 'error' => 'message kosong'], 400);
        }

        // 2. Regex Khfy Sesuai Dokumentasi
        $pattern = '~RC=(?P<reffid>[a-f0-9-]+)\s+TrxID=(?P<trxid>\d+)\s+(?P<produk>[A-Z0-9]+)\.(?P<tujuan>\d+)\s+(?P<status_text>[A-Za-z]+)\s*(?P<keterangan>.+?)(?:\s+Saldo[\s\S]*?)?(?:\bresult=(?P<status_code>\d+))?\s*>?$~is';

        if (!preg_match($pattern, $message, $m)) {
            Log::error('[WEBHOOK KHFY] Format Tidak Dikenali: ' . $message);
            return response()->json(['ok' => false, 'error' => 'format tidak dikenali']);
        }

        // 3. Ekstrak Data
        $trxid       = $m['trxid'] ?? '';
        $reffid      = $m['reffid'] ?? '';
        $status_text = $m['status_text'] ?? '';
        $keterangan  = trim($m['keterangan'] ?? '');
        $status_code = isset($m['status_code']) ? (int)$m['status_code'] : null;

        if ($status_code === null) {
            if (preg_match('~sukses~i', $status_text)) $status_code = 0;
            elseif (preg_match('~gagal|batal~i', $status_text)) $status_code = 1;
        }

        // 4. Update Database Transaksi
        $transaksi = DB::table('transaksi')->where('ref_id', $reffid)->first();
        
        if ($transaksi) {
            if ($status_code === 0 && $transaksi->status !== 'Sukses') {
                // SUKSES
                DB::table('transaksi')->where('ref_id', $reffid)->update([
                    'status' => 'Sukses',
                    'ref_id_provider' => $trxid,
                    'keterangan' => 'Sukses | ' . $keterangan,
                    'updated_at' => now()
                ]);
            } elseif ($status_code === 1 && $transaksi->status !== 'Gagal') {
                // GAGAL -> Lakukan Refund
                DB::transaction(function() use ($transaksi, $reffid, $trxid, $keterangan) {
                    // Update Status Transaksi
                    DB::table('transaksi')->where('ref_id', $reffid)->update([
                        'status' => 'Gagal',
                        'ref_id_provider' => $trxid,
                        'keterangan' => 'Refund | ' . $keterangan,
                        'updated_at' => now()
                    ]);

                    // Kembalikan Saldo User (cari username/id berdasar ref_id)
                    DB::table('users')->where('name', $transaksi->username)
                        ->increment('saldo', $transaksi->harga);
                });
            }
        }

        // 5. Response Minimal
        return response()->json([
            'ok' => true,
            'parsed' => ['trxid' => $trxid, 'reffid' => $reffid, 'status_code' => $status_code]
        ]);
    }
}
