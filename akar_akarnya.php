<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n=======================================================\n";
echo "🕵️‍♂️ OPERASI CABUT AKAR: MENCARI LOKASI ASLI PROVIDER\n";
echo "=======================================================\n";

// Kita geledah semua tabel yang mungkin menyimpan nama ini
$tables_to_check = ['layanan', 'transaksi', 'kategori', 'kategori_layanan', 'tipe', 'sub_kategori'];
$targets = ['KHFYPAY', 'khfypay', 'KHFY', 'khfy', 'DIGIFLAZZ', 'digiflazz', 'KAJE', 'kaje'];

$found_something = false;

foreach ($tables_to_check as $table) {
    if (!Schema::hasTable($table)) continue; // Skip kalau tabel gak ada
    
    $columns = Schema::getColumnListing($table);
    
    foreach ($columns as $column) {
        foreach ($targets as $target) {
            try {
                // Cari apakah kata tersebut ada di kolom ini
                $count = DB::table($table)->where($column, 'LIKE', "%$target%")->count();
                
                if ($count > 0) {
                    $found_something = true;
                    echo "🚨 TERTANGKAP! '$target' sembunyi di Tabel: [$table] -> Kolom: [$column] ($count baris)\n";
                    
                    // LANGSUNG SIKAT! Ganti jadi 'SISTEM'
                    DB::statement("UPDATE `$table` SET `$column` = REPLACE(`$column`, '$target', 'SISTEM') WHERE `$column` LIKE '%$target%'");
                    
                    echo "✔️  Berhasil dicabut dan diganti jadi SISTEM!\n";
                }
            } catch (\Exception $e) {
                // Abaikan error jika kolom bukan teks
            }
        }
    }
}

if (!$found_something) {
    echo "🔍 Database bersih! Tidak ada satupun kata tersebut yang tersisa di database.\n";
}

echo "=======================================================\n";
echo "✨ OPERASI SELESAI!\n";
echo "=======================================================\n";
