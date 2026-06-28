<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n🔍 --- AMIFI ROUTE SCANNER (ANTI-404) --- 🔍\n\n";

// 1. Geledah semua file React (.jsx)
$jsPath = resource_path('js');
if (!is_dir($jsPath)) {
    die("❌ Folder resources/js tidak ditemukan!\n");
}

$reactFiles = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($jsPath));
$reactLinks = [];

foreach ($reactFiles as $file) {
    if ($file->isFile() && $file->getExtension() === 'jsx') {
        $content = file_get_contents($file->getPathname());
        // Cari pola href="/nama-rute" atau Inertia.get('/nama-rute')
        preg_match_all('/(?:href|url)=["\'](\/[^"\']+)["\']|get\(["\'](\/[^"\']+)["\']\)/', $content, $matches);
        
        $foundLinks = array_filter(array_merge($matches[1], $matches[2]));
        foreach ($foundLinks as $link) {
            // Abaikan link luar atau link statis biasa
            if (!str_starts_with($link, '/#') && strlen($link) > 1) {
                $reactLinks[$link][] = $file->getFilename();
            }
        }
    }
}

echo "📌 LINK YANG DI-KLIK DARI REACT (FRONTEND):\n";
$frontendLinks = [];
foreach ($reactLinks as $link => $files) {
    $frontendLinks[] = $link;
    echo "  👉 $link  (Ditemukan di: " . implode(', ', array_unique($files)) . ")\n";
}

echo "\n======================================================\n";

echo "\n📌 RUTE YANG TERSEDIA DI LARAVEL (BACKEND):\n";
$routes = collect(\Route::getRoutes())->filter(function ($route) {
    return in_array('GET', $route->methods());
});

$backendLinks = [];
foreach ($routes as $route) {
    $uri = '/' . ltrim($route->uri(), '/');
    // Hanya tampilkan rute utama aplikasi
    if (str_starts_with($uri, '/order') || str_starts_with($uri, '/admin') || str_starts_with($uri, '/riwayat') || str_starts_with($uri, '/mutasi') || str_starts_with($uri, '/profile')) {
        $backendLinks[] = $uri;
        
        // Cek apakah rute ini dipanggil oleh React
        if (in_array($uri, $frontendLinks)) {
            echo "  🛣️  $uri  [✅ SINKRON]\n";
        } else {
            // Bisa jadi rute dinamis seperti {type} atau memang tidak dipakai
            echo "  🛣️  $uri  [⚠️ STANDBY / DINAMIS]\n";
        }
    }
}

echo "\n======================================================\n";
echo "🚨 KESIMPULAN (POTENSI 404 NOT FOUND):\n";
$errors = 0;
foreach ($frontendLinks as $link) {
    // Abaikan rute dinamis (yang ada parameter id/type dll)
    $isDynamic = false;
    foreach ($backendLinks as $back) {
        if (str_contains($back, '{') && str_starts_with($link, substr($back, 0, strpos($back, '{')))) {
            $isDynamic = true;
            break;
        }
    }

    if (!in_array($link, $backendLinks) && !$isDynamic && str_starts_with($link, '/order')) {
        echo "  ❌ BIKIN 404: React memanggil '$link', tapi Laravel tidak punya rute itu!\n";
        $errors++;
    }
}

if ($errors === 0) {
    echo "  ✅ AMAN! Semua link statis dari React sudah terdaftar di Laravel.\n";
}

echo "\n";
