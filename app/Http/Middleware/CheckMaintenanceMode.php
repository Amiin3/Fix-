<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckMaintenanceMode {
    public function handle(Request $request, Closure $next) {
        $file = storage_path('framework/maintenance_config.json');
        
        if (file_exists($file)) {
            $config = json_decode(file_get_contents($file), true);
            $isManual = filter_var($config['manual'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $mode = $config['mode'] ?? 'total';

            if ($isManual) {
                // 🛡️ PERISAI ANTI-LOOP & AKSES VIP
                if (
                    $request->is('maintenance*') || 
                    $request->is('admin*') || 
                    $request->is('login') || 
                    $request->is('logout') || 
                    $request->is('api/webhook*') ||
                    $request->is('build/*') ||
                    $request->is('vendor/*')
                ) {
                    return $next($request);
                }

                // 🛡️ VIP PASS: Jika user adalah ADMIN (Sultan Bebas Masuk)
                if (Auth::check() && (Auth::user()->role === 'admin' || Auth::user()->level === 'admin')) {
                    return $next($request);
                }

                // 🛡️ VIP PASS: Whitelist IP
                $whitelist = array_filter(array_map('trim', explode(',', $config['whitelist'] ?? '')));
                if (!empty($whitelist) && in_array($request->ip(), $whitelist)) {
                    return $next($request);
                }

                // 🛑 LOGIKA LOCKDOWN TOTAL
                if ($mode === 'total') {
                    // Pastikan route ini ada di web.php
                    return redirect()->route('maintenance.index');
                } 
                
                // 🛑 LOGIKA LOCKDOWN TRANSAKSI SAJA
                elseif ($mode === 'transaksi') {
                    if ($request->isMethod('post') && ($request->is('order/*') || $request->is('deposit/*') || $request->is('checkout/*') || $request->is('beli/*'))) {
                        $pesan = $config['message'] ?? 'Transaksi sedang ditutup sementara.';
                        if ($request->wantsJson() || $request->ajax()) {
                            return response()->json(['success' => false, 'message' => $pesan], 403);
                        }
                        return back()->with('error', $pesan);
                    }
                }
            }
        }
        
        return $next($request);
    }
}
