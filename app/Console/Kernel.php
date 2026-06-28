<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Helpers\OneSignalHelper;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
        $schedule->command('milastore:backup')->dailyAt('01:00');
    {
        // 🤖 MESIN AUTOPILOT MILASTORE (Berjalan Tiap Menit Buat Ngecek Jadwal)
        $schedule->call(function () {
            $file = storage_path('app/autopilot_broadcast.json');
            if (!file_exists($file)) return;
            
            $setting = json_decode(file_get_contents($file), true);
            if (!$setting || empty($setting['is_active'])) return;

            // Cek apakah jam saat ini (WIB) sama dengan jam target Autopilot
            $currentTime = date('H:i');
            if ($currentTime !== $setting['time']) return;

            $title = $setting['title'];
            $body = $setting['message'];

            // 1. Blast OneSignal (Jika ada)
            try {
                if (class_exists('App\Helpers\OneSignalHelper')) {
                    OneSignalHelper::send($title, $body);
                }
            } catch (\Exception $e) {}

            // 2. Blast Web Notifications
            $users = DB::table('users')->select('id')->get();
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
                        'icon' => 'fa-robot',
                        'type' => $setting['type'] ?? 'promo',
                        'url' => '/notifikasi'
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            foreach (array_chunk($notificationsData, 500) as $chunk) {
                DB::table('notifications')->insert($chunk);
            }
            
        })->everyMinute(); // Cek tiap menit, eksekusi jika jam cocok
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
