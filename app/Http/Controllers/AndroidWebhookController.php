<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AndroidWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // 🚨 1. VALIDASI KEAMANAN TINGKAT DEWA (API V12)
        $admin = DB::table('users')->where('email', 'amifiabadan@gmail.com')->first();
        $validSecret = $admin ? ($admin->payment_secret ?? 'MILAPAY_V12_SECRET') : 'MILAPAY_V12_SECRET';

        $secretKey = $request->header('X-Tuyul-Secret');
        if ($secretKey !== $validSecret) {
            Log::warning("[❌ HACKER BLOCKED] Akses ilegal ke Webhook dari IP: " . $request->ip());
            return response()->json(['status' => 'error', 'msg' => 'Akses Ditolak! API V12 Secured.'], 401);
        }

        // 2. TANGKAP DATA DARI TUYUL
        $app   = $request->input('app_name', 'UNKNOWN');
        $text  = $request->input('text', '');

        // 3. FILTER SAMPAH (Anti-Spam & Notif Kosong)
        if (empty($text) || str_contains(strtolower($text), 'pesan baru') || $text == 'No Content' || str_contains(strtolower($text), 'memeriksa')) {
            return response()->json(['status' => 'ignored', 'msg' => 'Pesan diabaikan.']);
        }

        // 4. MESIN PENCARI NOMINAL (Regex Akurat)
        if (preg_match('/Rp\s*\.?\s*([\d\.]+)/i', $text, $matches)) {
            $nominal_terdeteksi = (int) str_replace('.', '', $matches[1]);
            Log::info("[💰 NOTIF V12 MASUK] Rp $nominal_terdeteksi via $app");

            // 5. CARI TIKET DEPOSIT (Otomatis cocokkan nominal & status pending)
            $deposit = DB::table('deposits')
                        ->where('total_bayar', $nominal_terdeteksi)
                        ->whereRaw('LOWER(status) = ?', ['pending'])
                        ->orderBy('created_at', 'desc')
                        ->first();

            if ($deposit) {
                try {
                    DB::beginTransaction();
                    // A. Ubah Status
                    DB::table('deposits')->where('id', $deposit->id)->update([
                        'status' => 'Sukses',
                        'updated_at' => now()
                    ]);
                    // B. Tambah Saldo
                    DB::table('users')->where('id', $deposit->user_id)->increment('saldo', $deposit->amount);
                    DB::commit();
                    
                    Log::info("[✅ V12 AUTO-SUCCESS] Saldo Rp $deposit->amount mendarat di User ID: $deposit->user_id");
                    return response()->json(['status' => 'success', 'msg' => 'Saldo otomatis masuk via V12!']);
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error("[❌ V12 DB ERROR] Gagal proses: " . $e->getMessage());
                    return response()->json(['status' => 'error', 'msg' => 'Database Error'], 500);
                }
            } else {
                Log::warning("[⚠️ V12 TIKET LOST] Dana masuk Rp $nominal_terdeteksi, tapi tiket tidak ditemukan.");
            }
        }
        return response()->json(['status' => 'processed']);
    }
}
