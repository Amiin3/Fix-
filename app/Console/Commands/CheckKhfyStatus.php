<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Services\KhfyService;
use Carbon\Carbon;

class CheckKhfyStatus extends Command
{
    protected $signature = 'khfy:sweeper';
    protected $description = 'Menjemput bola: Cek transaksi Pending yang usianya lebih dari 3 menit';

    public function handle(KhfyService $khfy)
    {
        // Cari transaksi Pending yang dibuat LEBIH DARI 3 MENIT yang lalu
        $waktuBatas = Carbon::now()->subMinutes(3);

        $pendingTrx = DB::table('transaksi')
            ->where('status', 'Pending')
            ->whereNotNull('ref_id')
            ->where('created_at', '<=', $waktuBatas)
            ->where(function($q) {
                $q->where('kode_layanan', 'LIKE', 'XLA%')
                  ->orWhere('kode_layanan', 'LIKE', 'XDA%')
                  ->orWhere('kode_layanan', 'LIKE', 'FMX%')
                  ->orWhere('kode_layanan', 'LIKE', 'CFMX%')
                  ->orWhere('kode_layanan', 'LIKE', 'CEKPLN%');
            })
            ->limit(30) // Maksimal 30 trx per menit biar server gak ngos-ngosan
            ->get();

        foreach ($pendingTrx as $trx) {
            try {
                $res = $khfy->request('/history', ['refid' => $trx->ref_id]);
                
                $statusText = strtolower($res['data']['status'] ?? $res['status_text'] ?? '');
                if (empty($statusText)) continue;

                if (str_contains($statusText, 'sukses') || str_contains($statusText, 'success')) {
                    DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Sukses', 'keterangan' => 'Sukses (Auto Sweeper)', 'updated_at' => now()]);
                } elseif (str_contains($statusText, 'gagal') || str_contains($statusText, 'batal')) {
                    DB::transaction(function() use ($trx) {
                        DB::table('transaksi')->where('id', $trx->id)->update(['status' => 'Gagal', 'keterangan' => 'Gagal Server (Auto Refunded)', 'updated_at' => now()]);
                        $user = DB::table('users')->where('username', $trx->username)->first();
                        if ($user && $trx->status !== 'Gagal' && $trx->status !== 'GAGAL') DB::table('users')->where('id', $user->id)->increment('saldo', $trx->harga);
                    });
                }
            } catch (\Exception $e) {}
            sleep(1); // Jeda 1 detik antar request anti banned
        }
    }
}
