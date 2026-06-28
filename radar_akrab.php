<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "========================================\n";
echo "📡 RADAR AMIFI - CEK JALUR AKRAB XLA\n";
echo "========================================\n";

// 1. Cek Controller mana yang sebenarnya dipakai
$route = collect(\Route::getRoutes())->filter(function($r) { 
    return $r->getName() == 'order.akrab.store'; 
})->first();

echo "[1] CONTROLLER TARGET : " . ($route ? $route->getActionName() : "TIDAK DITEMUKAN!") . "\n";

// 2. Cek Kolom Asli di Tabel Transaksi
$kolom = \Illuminate\Support\Facades\Schema::getColumnListing('transaksi');
echo "[2] KOLOM DATABASE    : " . implode(", ", $kolom) . "\n";

// 3. Cek Koneksi API Khfy
$apiKey = env('KHFY_API_KEY');
echo "[3] KHFY API KEY      : " . ($apiKey ? "TERISI (" . substr($apiKey, 0, 5) . "***)" : "KOSONG!") . "\n";

echo "========================================\n";
