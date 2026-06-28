<?php
echo "\n🔍 --- X-RAY: ARAH TABEL MENU DIGIFLAZZ --- 🔍\n\n";

$files = [
    'Menu Pulsa'      => 'app/Http/Controllers/OrderPulsaController.php',
    'Menu Paket Data' => 'app/Http/Controllers/OrderController.php',
    'Menu Token PLN'  => 'app/Http/Controllers/OrderPlnController.php',
    'Menu E-Wallet'   => 'app/Http/Controllers/OrderEwalletController.php',
    'Menu Masa Aktif' => 'app/Http/Controllers/OrderMasaAktifController.php',
];

foreach($files as $menu => $path) {
    if(file_exists($path)) {
        $content = file_get_contents($path);
        
        // Cari pola DB::table('nama_tabel')
        if(preg_match_all('/DB::table\([\'"]([^\'"]+)[\'"]\)/', $content, $matches)) {
            // Ambil nama tabel unik yang ditemukan di controller tersebut
            $tables = array_unique($matches[1]);
            echo "✅ $menu \t👉 mengambil data dari tabel: [" . implode(', ', $tables) . "]\n";
        } else {
            echo "⚠️  $menu \t👉 TIDAK DITEMUKAN kueri database!\n";
        }
    } else {
        echo "❌ $menu \t👉 Controller tidak ditemukan!\n";
    }
}
echo "\n======================================================\n";
