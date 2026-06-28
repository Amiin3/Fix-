<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Query yang sudah diperbaiki: 'tanggal' (dobel g)
        $recentTransactions = DB::table('transaksi')
            ->where('username', $user->username ?? $user->name)
            ->orderBy('tanggal', 'desc') 
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'recentTransactions' => $recentTransactions,
            'userBalance' => $user->saldo ?? 0
        ]);
    }
}
