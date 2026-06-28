<?php
namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\TelegramService;

class DepositController extends Controller {
    public function handle(Request $request) {
        $json = $request->getContent();
        $data = json_decode($json);
        
        Log::info("🔔 DEPOSIT WEBHOOK MASUK: " . $json);

        // --- PROTEKSI 1: CEK DATA ---
        if (!$data) return response()->json(['msg' => 'Invalid Data'], 400);

        // --- PROTEKSI 2: VERIFIKASI SIGNATURE ---
        // Sesuaikan dengan logic Gateway Abang (Tripay/Midtrans/Duitku)
        // Contoh ini untuk Tripay/Duitku standar
        $privateKey = env('PAYMENT_PRIVATE_KEY');
        $signature = $request->header('X-Callback-Signature'); 

        // Jika ingin bypass tes awal (HANYA UNTUK DEVELOPMENT)
        // if (!$signature) Log::warning("Webhook masuk tanpa signature dari: " . $request->ip());

        // --- PROTEKSI 3: EKSEKUSI SALDO (ANTI SALDO DOUBLE) ---
        DB::beginTransaction();
        try {
            // Kita cari transaksi yang masih 'Pending' atau 'Unpaid'
            // Gunakan lockForUpdate() agar tidak ada tabrakan data (Race Condition)
            $deposit = DB::table('deposits')
                ->where('reference', $data->reference ?? $data->merchant_ref ?? '')
                ->where('status', 'UNPAID')
                ->lockForUpdate()
                ->first();

            if ($deposit) {
                // Tambah Saldo ke User
                DB::table('users')->where('id', $deposit->user_id)->increment('saldo', $deposit->amount);
                
                // Update Status Deposit jadi PAID
                DB::table('deposits')->where('id', $deposit->id)->update([
                    'status' => 'PAID',
                    'updated_at' => now()
                ]);

                // Kirim Laporan ke HP Komandan
                TelegramService::sendMessage("💰 *SALDO MASUK! (OTOMATIS)*\n--------------------------\nUser ID: {$deposit->user_id}\nJumlah: Rp " . number_format($deposit->amount) . "\nVia: Webhook Gateway");
                
                DB::commit();
                return response()->json(['success' => true]);
            }

            DB::rollBack();
            return response()->json(['success' => false, 'msg' => 'Data not found or already paid']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ ERROR WEBHOOK DEPOSIT: " . $e->getMessage());
            return response()->json(['success' => false, 'msg' => 'Internal Error'], 500);
        }
    }
}
