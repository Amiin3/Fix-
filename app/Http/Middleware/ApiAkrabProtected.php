<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class ApiAkrabProtected
{
    public function handle(Request $request, Closure $closure)
    {
        $apiKey = $request->header('X-AKRAB-KEY') ?? $request->input('api_key');
        if (!$apiKey) {
            return response()->json(['success' => false, 'error' => 'API Key Akrab tidak ditemukan.'], 401);
        }

        $reseller = User::where('api_key', $apiKey)->first(); 
        if (!$reseller) {
            return response()->json(['success' => false, 'error' => 'API Key tidak valid atau dinonaktifkan.'], 401);
        }

        $clientIp = $request->ip();
        
        // FIX: Cocokkan dengan nama kolom asli
        if (!empty($reseller->ip_whitelist)) {
            $allowedIps = array_map('trim', explode(',', $reseller->ip_whitelist));
            if (!in_array($clientIp, $allowedIps)) {
                return response()->json(['success' => false, 'error' => "IP Anda ({$clientIp}) diblokir! Masukkan IP ke Whitelist API AKRAB."], 403);
            }
        }

        $request->attributes->set('reseller', $reseller);
        return $closure($request);
    }
}
