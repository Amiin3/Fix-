<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\DB;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // 🚀 SUNTIKAN SULTAN: SELALU AMBIL SALDO LIVE DARI DATABASE!
        if ($user) {
            $live_saldo = DB::table('users')->where('id', $user->id)->value('saldo') ?? 0;
            $user->saldo = $live_saldo; // Timpa ingatan lama dengan saldo baru
        }

        return array_merge(parent::share($request), [
            'auth' => [
            'unread_notifications_count' => $request->user() ? $request->user()->unreadNotifications->count() : 0,
                'user' => $request->user() ? $request->user()->fresh() : null, // Sekarang user ini sudah membawa saldo ter-update
            ],
            'notifikasi' => $request->user() ? $request->user()->unreadNotifications->map(function($n) { 
                return [
            'vapidPublicKey' => config('webpush.vapid.public_key'),
                    'id' => $n->id,
                    'data' => $n->data,
                    'created_at' => $n->created_at->diffForHumans(),
                ];
            }) : [],
            // Pastikan pesan notif juga terdistribusi sempurna
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'android_notif' => $request->session()->get('android_notif'),
            ],
        ]);
    }
}
