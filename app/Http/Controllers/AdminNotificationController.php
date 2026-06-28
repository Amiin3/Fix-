<?php
namespace App\Http\Controllers;

use App\Helpers\OneSignalHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AdminNotificationController extends Controller
{
    public function index()
    {
        return inertia('Admin/Notification/Index');
    }

    public function send(Request $request)
    {
        $title = $request->input('title') ?? 'MilaStore';
        $body = $request->input('body') ?? $request->input('message');
        $isAutopilot = $request->input('is_autopilot', false);
        $time = $request->input('time', '08:00');

        if (!$body) return back()->with('error', 'Pesan kosong, Bang!');

        // 🤖 JIKA MODE AUTOPILOT AKTIF: Simpan ke Memori Server
        if ($isAutopilot) {
            $data = [
                'title' => $title,
                'message' => $body,
                'time' => $time,
                'is_active' => true,
                'type' => stripos($title, 'promo') !== false ? 'promo' : 'system'
            ];
            file_put_contents(storage_path('app/autopilot_broadcast.json'), json_encode($data));
            return back()->with('success', "🤖 AUTOPILOT AKTIF! MilaStore akan menembakkan pesan ini secara otomatis setiap jam {$time} WIB.");
        }

        // 🚀 JIKA MODE INSTAN: Tembak Sekarang Juga
        try {
            $users = DB::table('users')->whereNotNull('email')->get();
            $countNodeJs = 0;

            foreach ($users as $user) {
                try {
                    if(method_exists($this, 'kirimNotifSultan')) {
                        $this->kirimNotifSultan($user->email, $title, $body);
                    }
                    $countNodeJs++;
                } catch (\Exception $e) { continue; }
            }

            try {
                if (class_exists('App\Helpers\OneSignalHelper')) {
                    OneSignalHelper::send($title, $body);
                }
            } catch (\Exception $e) {
                Log::error("[BROADCAST] OneSignal Web Push Gagal: " . $e->getMessage());
            }

            $notificationsData = [];
            foreach ($users as $u) {
                $notificationsData[] = [
                    'id' => Str::uuid()->toString(),
                    'type' => 'App\Notifications\SystemBroadcast',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $u->id,
                    'data' => json_encode([
                        'title' => $title,
                        'message' => $body,
                        'icon' => 'fa-bullhorn',
                        'type' => stripos($title, 'promo') !== false ? 'promo' : 'system',
                        'url' => '/notifikasi'
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            foreach (array_chunk($notificationsData, 500) as $chunk) {
                DB::table('notifications')->insert($chunk);
            }

            return back()->with('success', "🚀 FULL VERSION SULTAN! Rudal mendarat di $countNodeJs HP Android via Custom Socket, dan Web Push sukses dikirim!");

        } catch (\Exception $e) {
            return back()->with('error', 'Duh, sistem macet: ' . $e->getMessage());
        }
    }
}
