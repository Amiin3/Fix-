<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class AntiMalingSession
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // 👑 JALUR VVIP SULTAN: Kalau yang login Admin, bebas gonta-ganti device!
            if ($user->level === 'admin' || $user->level === 'Admin' || $user->level === 'ADMIN') {
                return $next($request);
            }

            $currentUserAgent = $request->header('User-Agent');

            if (!Session::has('maling_sensor_ua')) {
                Session::put('maling_sensor_ua', $currentUserAgent);
            }

            $savedUa = Session::get('maling_sensor_ua');

            // 🚀 REVISI SULTAN: Cek IP dihapus biar HP gak ketendang pas pindah jaringan.
            // Kita cuma ngecek Merek HP/Browser aja biar Cookies gak dibajak ke PC lain.
            if ($savedUa !== $currentUserAgent && $savedUa !== null) {
                Auth::logout();
                Session::flush();
                return redirect()->route('login')->with('error', 'Sesi kadaluarsa karena perangkat berubah. Silakan login ulang.');
            }
        }

        return $next($request);
    }
}
