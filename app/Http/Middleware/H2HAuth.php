<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class H2HAuth
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-MILA-KEY') ?? $request->api_key;

        if (!$apiKey) {
            return response()->json(['status' => false, 'message' => '❌ AKSES DITOLAK: API Key tidak ditemukan!'], 401);
        }

        $user = User::where('api_key', $apiKey)->first();

        if (!$user) {
            return response()->json(['status' => false, 'message' => '❌ AKSES DITOLAK: API Key tidak valid!'], 401);
        }

        // 🛡️ DETEKSI REAL IP (TEMBUS CLOUDFLARE)
        $realIp = $request->header('Cf-Connecting-Ip') 
                  ?? $request->header('X-Forwarded-For') 
                  ?? $request->ip();
        
        // Jika X-Forwarded-For berisi banyak IP, ambil yang pertama
        if (strpos($realIp, ',') !== false) {
            $realIp = trim(explode(',', $realIp)[0]);
        }

        if (!empty($user->ip_whitelist)) {
            $allowedIps = array_map('trim', explode(',', $user->ip_whitelist));
            
            // Tambahkan IP server sendiri ke whitelist otomatis buat testing
            $serverIp = "139.59.238.148"; 

            if (!in_array($realIp, $allowedIps) && $realIp !== '127.0.0.1' && $realIp !== $serverIp) {
                return response()->json([
                    'status' => false, 
                    'message' => '❌ AKSES DITOLAK: IP Address ('.$realIp.') belum terdaftar di MilaStore!'
                ], 403);
            }
        }

        $request->merge(['h2h_user' => $user, 'real_client_ip' => $realIp]);
        return $next($request);
    }
}
