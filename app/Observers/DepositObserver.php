<?php

namespace App\Observers;

use App\Models\Deposit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DepositObserver
{
    public function updated(Deposit $deposit)
    {
        // Cek jika status berubah jadi sukses
        if ($deposit->isDirty('status') && strtolower($deposit->status) === 'sukses') {
            if ($deposit->type === 'payment_gateway') {
                $user = DB::table('users')->where('id', $deposit->user_id)->first();
                if ($user && !empty($user->webhook_url)) {
                    $this->sendWebhookToReseller($user, $deposit);
                }
            }
        }
    }

    private function sendWebhookToReseller($user, $deposit)
    {
        try {
            $payload = [
                'external_id' => $deposit->external_id,
                'status'      => 'sukses',
                'amount'      => $deposit->amount,
                'total_bayar' => $deposit->total_bayar,
                'metode'      => $deposit->metode,
                'signature'   => md5($user->api_key . $deposit->external_id . 'sukses')
            ];

            Http::timeout(5)->post($user->webhook_url, $payload);
            Log::info("[WEBHOOK_VVIP_SENT] Berhasil kirim callback: " . $deposit->external_id);
        } catch (\Exception $e) {
            Log::error("[WEBHOOK_VVIP_FAILED] Gagal kirim callback: " . $e->getMessage());
        }
    }
}
