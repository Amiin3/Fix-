<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\TelegramService;

class WebhookDigiflazzController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $headerSignature = $request->header('X-Hub-Signature');
        
        // 1. VERIFIKASI SIGNATURE (Anti Hacker)
        $secret = env('DIGIFLAZZ_WEBHOOK_SECRET', 'KOSONG');
        $expectedSignature = 'sha1=' . hash_hmac('sha1', $payload, $secret);
        
        if ($secret !== 'KOSONG' && $headerSignature !== $expectedSignature) {
            Log::warning("🚨 [HACKER ATTACK] Fake Digiflazz Webhook dari IP: " . $request->ip());
            return response()->json(['error' => 'Invalid Signature'], 403);
        }
        
        $data = json_decode($payload, true);
        if (!isset($data['data']['ref_id'])) return response()->json(['error' => 'Bad Request'], 400);
        
        $ref_id = $data['data']['ref_id'];
        $status = $data['data']['status']; // 'Gagal', 'Sukses', 'Pending'
        $sn = $data['data']['sn'] ?? '';
        
        // 2. ATOMIC LOCK (Anti Double Refund / Saldo Bocor)
        DB::beginTransaction();
        try {
            $trx = DB::table('transaksi')
                ->where('ref_id', $ref_id)
                ->whereIn('status', ['Pending', 'Proses', 'Menunggu'])
                ->lockForUpdate()
                ->first();
                
            if (!$trx) {
                DB::rollBack();
                return response()->json(['message' => 'Transaksi sudah selesai atau tidak ditemukan.']);
            }
            
            if ($status === 'Gagal') {
                DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
                DB::table('transaksi')->where('ref_id', $ref_id)->update(['status' => 'Gagal', 'sn' => $sn, 'updated_at' => now()]);
                TelegramService::sendMessage("🔄 *REFUND DIGIFLAZZ*\nTrx: $ref_id\nUser: {$trx->username}\nSaldo kembali: Rp " . number_format($trx->harga));
            
            } elseif ($status === 'Sukses') {
                DB::table('transaksi')->where('ref_id', $ref_id)->update(['status' => 'Sukses', 'sn' => $sn, 'updated_at' => now()]);
                
                // 🚀 INI DIA OBATNYA: Suntikan Notif Sukses ke Telegram!
                TelegramService::sendMessage("✅ *TRANSAKSI SUKSES*\nTrx: $ref_id\nUser: {$trx->username}\nSN: $sn");
            }

            // ==========================================================
            // 🚀 ALARM PINTU BELAKANG SULTAN (DIGIFLAZZ) 🚀
            // ==========================================================
            if (in_array($status, ['Sukses', 'Gagal'])) {
                $userEmail = DB::table('users')->where('name', $trx->username)->value('email');
                if ($userEmail) {
                    $judul = ($status === 'Sukses') ? "Order Berhasil! ✅ " : "Order Gagal ❌ ";
                    $pesan = ($status === 'Sukses')
                        ? "Mantap! Pesanan " . $trx->kode_layanan . " ke " . $trx->tujuan . " SUKSES. SN: " . $sn
                        : "Waduh sori Bosku, pesanan " . $trx->kode_layanan . " GAGAL. Saldo otomatis balik!";
                    $this->kirimNotifSultan($userEmail, $judul, $pesan);
                }
            }
            // ==========================================================
            
            DB::commit();
            return response()->json(['success' => true]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("[WEBHOOK DIGI ERROR] " . $e->getMessage());
            return response()->json(['error' => 'Server Error'], 500);
        }
    }
}
