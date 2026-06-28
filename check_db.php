<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = ['users', 'layanan', 'kelompok', 'orders', 'deposits'];

echo "====================================\n";
echo "    RONTGEN DATABASE AMIFI STORE    \n";
echo "====================================\n\n";

foreach ($tables as $table) {
    echo "=== TABEL: " . strtoupper($table) . " ===\n";
    try {
        // Ambil Struktur Kolom
        $columns = DB::select("SHOW COLUMNS FROM $table");
        echo "Struktur Kolom:\n";
        foreach ($columns as $col) {
            echo " - " . $col->Field . " (" . $col->Type . ")\n";
        }
        
        // Ambil 1 Contoh Data Asli
        echo "\nContoh Data (1 Baris):\n";
        $sample = DB::table($table)->first();
        print_r($sample);
    } catch (\Exception $e) {
        echo "Tabel '$table' tidak ditemukan.\n";
    }
    echo "\n------------------------------------\n\n";
}

echo "=== DAFTAR PROVIDER ASLI DI TABEL LAYANAN ===\n";
try {
    $providers = DB::table('layanan')->select('provider')->distinct()->pluck('provider')->toArray();
    print_r($providers);
} catch (\Exception $e) {
    echo "Gagal mengambil daftar provider.\n";
}
echo "\n====================================\n";
