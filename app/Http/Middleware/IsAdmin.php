<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Cek apakah user sudah login dan punya pangkat 'admin'
        if (auth()->check() && strtolower(auth()->user()->level) === 'admin') {
            return $next($request);
        }
        
        // Kalau user biasa nyasar ke sini, tendang dengan pesan ini!
        abort(403, 'BENTENG SENTINEL AKTIF: MAAF, ANDA BUKAN KOMANDAN!');
    }
}
