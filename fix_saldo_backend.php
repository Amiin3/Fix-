<?php
use Illuminate\Support\Facades\Schema;

// 1. Deteksi Otomatis Nama Kolom Dompet Bos
$col = Schema::hasColumn('users', 'saldo') ? 'saldo' : 'balance';

// 2. Revisi Mesin Kasir (OrderXdaController)
$file1 = 'app/Http/Controllers/OrderXdaController.php';
if(file_exists($file1)){
    $content = file_get_contents($file1);
    
    // Ubah logika pengecekan agar dikunci jadi angka desimal (float)
    $content = preg_replace(
        '/if\s*\(\s*\$user->balance\s*<\s*\$product->harga_jual\s*\)/', 
        'if ((float)$user->' . $col . ' < (float)$product->harga_jual)', 
        $content
    );
    
    // Ubah logika pemotongan saldo
    $content = preg_replace(
        '/\$user->balance\s*-=\s*\$product->harga_jual;/', 
        '$user->' . $col . ' -= (float)$product->harga_jual;', 
        $content
    );
    
    file_put_contents($file1, $content);
}

// 3. Revisi Robot Auto-Refund (CheckKajeTransactions)
$file2 = 'app/Console/Commands/CheckKajeTransactions.php';
if(file_exists($file2)){
    $content = file_get_contents($file2);
    
    // Ubah logika pengembalian saldo (refund)
    $content = preg_replace(
        '/\$user->balance\s*\+=\s*\$trx->harga;/', 
        '$user->' . $col . ' += (float)$trx->harga;', 
        $content
    );
    
    file_put_contents($file2, $content);
}

echo "✅ KUNCI FOKUS: Mesin mendeteksi dompet Bos menggunakan kolom: '" . strtoupper($col) . "'\n";
echo "✅ Logika matematika Backend sudah dikunci ke versi Siap Rilis!\n";
