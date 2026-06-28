<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class EnterpriseWAF
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is("api/telegram/*")) return $next($request);
        // 1. BLOKIR BOT & SCANNER JAHAT
        $badAgents = ['sqlmap', 'nikto', 'nmap', 'zgrab', 'masscan', 'dirbuster', 'scan', 'hack'];
        $userAgent = strtolower($request->header('User-Agent'));
        foreach ($badAgents as $agent) {
            if (strpos($userAgent, $agent) !== false) {
                Log::warning('🔥 WAF BLOCK: Bot Jahat Terdeteksi -> IP: ' . $request->ip());
                abort(403, 'Akses Ditolak: Deteksi Aktivitas Bot Berbahaya (WAF-01)');
            }
        }

        // 2. POLA SERANGAN YANG DIBLOKIR (SQLi, XSS, LFI)
        $dangerousPatterns = [
            '/<script\b[^>]*>(.*?)<\/script>/is', // XSS (Script Injection)
            '/UNION.+?SELECT/is',                // SQL Injection (Maling Data)
            '/DROP\s+TABLE/is',                  // SQL Injection (Hapus Tabel)
            '/OR\s+1\s*=\s*1/i',                 // SQL Injection (Bypass Login)
            '/(\.\.\/|\.\.\\\\)/',               // Path Traversal (Ngintip Folder Root)
            '/\/etc\/passwd/i',                  // LFI (Ngintip Password Server)
            '/javascript:/i',                    // XSS URL
            '/onload=/i',                        // XSS Event
            '/onerror=/i',                       // XSS Event
            '/<iframe\b[^>]*>(.*?)<\/iframe>/is' // Clickjacking/XSS
        ];

        // 3. SCAN SEMUA INPUT FORM & JSON
        $inputs = $request->all();
        array_walk_recursive($inputs, function ($value) use ($dangerousPatterns, $request) {
            if (is_string($value)) {
                foreach ($dangerousPatterns as $pattern) {
                    if (preg_match($pattern, $value)) {
                        Log::warning('🔥 WAF BLOCK: Input Berbahaya -> IP: ' . $request->ip() . ' | Payload: ' . $value);
                        abort(403, 'Akses Ditolak: Deteksi Anomali Data/Injeksi (WAF-02)');
                    }
                }
            }
        });

        // 4. SCAN URL QUERY (Misal: ?id=1' OR '1'='1)
        $queryString = urldecode($request->getQueryString());
        if ($queryString) {
             foreach ($dangerousPatterns as $pattern) {
                if (preg_match($pattern, $queryString)) {
                    Log::warning('🔥 WAF BLOCK: URL Berbahaya -> IP: ' . $request->ip() . ' | Query: ' . $queryString);
                    abort(403, 'Akses Ditolak: Deteksi URL Mencurigakan (WAF-03)');
                }
            }
        }

        // Jika aman, izinkan masuk ke web
        return $next($request);
    }
}
