<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Mengecek apakah user login dan memiliki level admin
        if (Auth::check() && Auth::user()->level === 'admin') {
            return $next($request);
        }

        // Jika bukan admin, lempar kembali ke dashboard utama
        return redirect('/dashboard')->with('error', 'Akses ditolak! Anda bukan Admin.');
    }
}
