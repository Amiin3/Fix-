<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Deposit;
use App\Observers\DepositObserver;
use Inertia\Inertia;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot() {
        // --- SOLUSI DEWA: AUTO-WA TRIGGER ---
        try {
            // Memantau Tabel Transaksi dan Deposit
            $models = ['App\Models\Transaksi', 'App\Transaksi', 'App\Models\Deposit', 'App\Deposit'];
            foreach ($models as $modelClass) {
                if (class_exists($modelClass)) {
                    $modelClass::updated(function ($model) {
                        // HANYA TEMBAK WA JIKA KOLOM "STATUS" MENGALAMI PERUBAHAN
                        if ($model->isDirty('status')) {
                            $type = stripos(class_basename($model), 'Deposit') !== false ? 'deposit' : 'transaksi';
                            $status = strtoupper($model->status);
                            
                            // Cari nomor WA User
                            $uname = $model->username ?? $model->user_id ?? null;
                            $user = \Illuminate\Support\Facades\DB::table('users')->where('name', $uname)->orWhere('username', $uname)->first();
                            
                            if ($user && !empty($user->whatsapp ?? $user->phone)) {
                                $wa = preg_replace('/[^0-9]/', '', $user->whatsapp ?? $user->phone);
                                if (substr($wa, 0, 1) == '0') $wa = '62' . substr($wa, 1);
                                
                                // RAKIT STRUK OTOMATIS
                                if ($type == 'transaksi') {
                                    $msg = "🔄 *UPDATE TRANSAKSI* 🔄\n\n";
                                    $msg .= "📦 Produk: *" . ($model->produk ?? '-') . "*\n";
                                    $msg .= "🎯 Tujuan: " . ($model->tujuan ?? '-') . "\n";
                                    $msg .= "🧾 SN: " . ($model->sn ?? $model->keterangan ?? '-') . "\n";
                                    $msg .= "📊 Status: *" . $status . "*\n";
                                    if ($status == 'GAGAL' || $status == 'ERROR') $msg .= "\n💳 *Saldo Anda telah dikembalikan.*";
                                } else {
                                    $msg = "💳 *UPDATE DEPOSIT* 💳\n\n";
                                    $msg .= "💰 Jumlah: *Rp " . number_format($model->jumlah ?? $model->amount ?? 0, 0, ',', '.') . "*\n";
                                    $msg .= "📊 Status: *" . $status . "*\n";
                                }
                                
                                // TEMBAK LANGSUNG KE BOT WA
                                \Illuminate\Support\Facades\Http::timeout(3)->post('http://127.0.0.1:3333/send-notif', [
                                    'target' => $wa,
                                    'message' => $msg,
                                    'key' => 'SULTAN_MILA_2026'
                                ]);
                            }
                        }
                    });
                }
            }
        } catch (\Exception $e) {}
        // --- END SOLUSI DEWA ---
        \Illuminate\Support\Facades\URL::forceScheme('https');
        // 1. Anti Multi-Login
        Event::listen(Login::class, function ($event) {
            DB::table("sessions")->where("user_id", $event->user->id)->where("id", "!=", Session::getId())->delete();
        });

        // 2. Data untuk React Profil (Anti Blank)
        Inertia::share('auth', function () {
            $user = auth()->user();
            return [
                'user' => $user ? [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'email'         => $user->email,
                    'whatsapp'      => $user->whatsapp,
                    'avatar'        => $user->avatar,
                    'level'         => strtolower($user->level ?? 'member'),
                    'saldo'         => (int) $user->saldo,
                    'balance'       => (int) $user->saldo,
                    'created_at'    => $user->created_at,
                ] : null,
            ];
        });

        // 3. 🔥 KEMBALIKAN SATPAM H2H YANG HILANG 🔥
        RateLimiter::for('h2h-normal', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('check-stock-limit', function (Request $request) {
            return Limit::perSecond(4)->by($request->ip())->response(function () {
                return response()->json([
                    'status' => false, 
                    'message' => 'Rate limit! Maksimal 4x per detik.'
                ], 429);
            });
        });
    }
}
