<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SentinelFirewall {
    public function handle(Request $request, Closure $next) {
        if ($request->is('api/telegram/*')) return $next($request);

        $ip = $request->ip();
        if (Cache::has("blocked_$ip")) return response()->json(['msg' => 'Banned'], 403);
        
        $input = json_encode($request->all());
        if (preg_match('/(union|select|insert|update|drop|script)/i', $input)) {
            // Simpan ke daftar list untuk ditampilkan di Telegram
            $list = Cache::get('sentinel_block_list', []);
            if(!in_array($ip, $list)) {
                $list[] = $ip;
                Cache::put('sentinel_block_list', $list, now()->addDays(7));
            }
            
            Cache::put("blocked_$ip", true, now()->addDays(1));
            return response()->json(['msg' => 'Blocked'], 403);
        }
        return $next($request);
    }
}
