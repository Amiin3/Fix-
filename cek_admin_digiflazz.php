<?php
echo "\n🔍 --- X-RAY: JALUR ADMIN DIGIFLAZZ --- 🔍\n\n";

$controllers = [
    'AdminController' => 'app/Http/Controllers/AdminController.php',
    'AdminDigiflazzController' => 'app/Http/Controllers/AdminDigiflazzController.php',
];

foreach($controllers as $name => $path) {
    if(file_exists($path)) {
        echo "✅ [$name] DITEMUKAN!\n";
        $content = file_get_contents($path);
        
        // Cari arah tabelnya
        if(preg_match_all('/DB::table\([\'"]([^\'"]+)[\'"]\)/', $content, $matches)) {
            $tables = array_unique($matches[1]);
            echo "   👉 Menyimpan/Mengambil data dari tabel: [" . implode(', ', $tables) . "]\n";
        } else {
            echo "   👉 Tidak ada pemanggilan DB::table langsung di sini.\n";
        }
    } else {
        echo "❌ [$name] TIDAK DITEMUKAN! (Mungkin ini penyebab error Target class does not exist)\n";
    }
}

echo "\n🔍 --- CEK TOMBOL & API DI REACT (DigiflazzManager.jsx) --- 🔍\n";
$jsxPath = 'resources/js/Pages/Admin/DigiflazzManager.jsx';
if(file_exists($jsxPath)) {
    $jsx = file_get_contents($jsxPath);
    
    // Cari URL yang dipanggil saat Bos klik tombol Sync/Simpan
    preg_match_all('/(?:axios\.(?:get|post|put|delete)|Inertia\.(?:get|post|put|delete|visit)|route\()[\'"`]([^\'"`\)]+)[\'"`]/', $jsx, $apiMatches);
    
    if(!empty($apiMatches[1])) {
        echo "✅ Ditemukan pemanggilan URL/Route dari React ke Server:\n";
        foreach(array_unique($apiMatches[1]) as $url) {
            echo "   🎯 Mengarah ke 👉 $url\n";
        }
    } else {
        echo "⚠️ Tidak ada pemanggilan API/Rute yang terdeteksi.\n";
    }
} else {
    echo "❌ File React Admin/DigiflazzManager.jsx TIDAK DITEMUKAN!\n";
}
echo "\n======================================================\n";
