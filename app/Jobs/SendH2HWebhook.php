<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendH2HWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $ref_id;

    public function __construct($ref_id) {
        $this->ref_id = $ref_id;
    }

    public function handle() {
        $trx = DB::table('transaksi')->where('ref_id', $this->ref_id)->first();
        if (!$trx) return;

        $user = DB::table('users')->where('name', $trx->username)->first();
        if (!$user || empty($user->webhook_url)) return;

        $payload = [
            'status'      => $trx->status,
            'trx_id'      => $trx->ref_id,
            'ref_id'      => $trx->ref_id,
            'kode_produk' => $trx->kode_layanan,
            'tujuan'      => $trx->tujuan,
            'sn'          => $trx->sn ?? '',
            'message'     => 'Transaksi ' . $trx->status,
            'signature'   => md5($user->api_key . $trx->ref_id)
        ];

        try {
            $response = Http::timeout(15)->withoutVerifying()->post($user->webhook_url, $payload);
            
            // 📝 CATAT KE FILE LOG KHUSUS
            $logMsg = "[" . date('Y-m-d H:i:s') . "] SUCCESS | User: {$user->name} | Trx: {$trx->ref_id} | HTTP: " . $response->status() . " | URL: {$user->webhook_url}";
            file_put_contents(storage_path('logs/webhook_h2h.log'), $logMsg . PHP_EOL, FILE_APPEND);
            
        } catch (\Exception $e) {
            $logMsg = "[" . date('Y-m-d H:i:s') . "] FAILED | User: {$user->name} | Trx: {$trx->ref_id} | Error: " . $e->getMessage();
            file_put_contents(storage_path('logs/webhook_h2h.log'), $logMsg . PHP_EOL, FILE_APPEND);
        }
    }
}
