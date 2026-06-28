<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User; // Atau model Reseller Anda

class H2hApiProtected
{
    public function handle(Request $request, Closure $closure)
    {
        $apiKey = $request->header('X-CY-KEY') ?? $request->input('api_key');
        if (!$apiKey) {
            return response()->json(['success' => false, 'error' => 'API Key tidak ditemukan.'], 401);
        }

        // Cari reseller berdasarkan API Key yang aktif
        $reseller = User::where('api_key', $apiKey)->where('status', 'ACTIVE')->first();
        if (!$reseller) {
            return response()->json(['success' => false, 'error' => 'API Key tidak valid atau dinonaktifkan.'], 401);
        }

        // Validasi Whitelist IP Keamanan Ganda
        $clientIp = $request->ip();
        $allowedIps = array_map('trim', explode(',', $reseller->whitelist_ip));
        
        // Jika reseller menyetting IP, dan IP penembak tidak ada di daftar, BLOKIR!
        if (!empty($reseller->whitelist_ip) && !in_array($clientIp, $allowedIps)) {
            return response()->json(['success' => false, 'error' => "IP Anda ({$clientIp}) tidak terdaftar dalam Whitelist."], 403);
        }

        // Simpan data reseller ke dalam request agar bisa diakses di Controller
        $request->attributes->set('reseller', $reseller);

        return $closure($request);
    }
}
