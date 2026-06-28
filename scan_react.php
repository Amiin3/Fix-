<?php
echo "\n🔍 --- X-RAY: KODINGAN REACT (MENCARI BIANG BLANK PUTIH) --- 🔍\n\n";

$files = [
    'Menu Pulsa' => 'resources/js/Pages/Order/Pulsa.jsx',
    'Menu Data'  => 'resources/js/Pages/Order/Data.jsx',
];

foreach ($files as $menu => $path) {
    echo "📂 Mengecek $menu ($path)...\n";
    if (file_exists($path)) {
        $lines = file($path);
        $found = false;
        
        foreach ($lines as $index => $line) {
            // Cari baris yang merender produk (biasanya pakai .map atau groupedProducts)
            if (preg_match('/groupedProducts\[.*?\]/i', $line) || preg_match('/\.map\(/i', $line) && str_contains($line, 'groupedProducts')) {
                echo "   🚨 Baris " . ($index + 1) . ": \t" . trim($line) . "\n";
                $found = true;
            }
        }
        
        if (!$found) {
            echo "   ✅ Aman. Tidak terdeteksi render groupedProducts yang rawan.\n";
        }
    } else {
        echo "   ❌ File tidak ditemukan!\n";
    }
    echo "------------------------------------------------------\n";
}
echo "💡 Analisa: Kalau ada baris seperti `groupedProducts[provider].map`, itu biang keroknya!\n\n";
