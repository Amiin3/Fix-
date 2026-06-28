<?php
echo "\n🚀 --- MEMULAI OPERASI SINKRONISASI TOTAL --- 🚀\n";

$basePath = '/www/wwwroot/amifistore.web.id/app/Http/Controllers/';
$menus = [
    'OrderPulsaController.php' => ['tipe' => 'pulsa', 'view' => 'Order/Pulsa'],
    'OrderController.php' => ['tipe' => 'data', 'view' => 'Order/Data'],
    'OrderEwalletController.php' => ['tipe' => 'e-money', 'view' => 'Order/Ewallet'],
    'OrderMasaAktifController.php' => ['tipe' => 'masa aktif', 'view' => 'Order/MasaAktif'],
];

foreach ($menus as $file => $config) {
    $path = $basePath . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $tipe = $config['tipe'];
        $view = $config['view'];

        // Kodingan index() yang baru, mengirim 'products' & 'groupedProducts' sekaligus
        $newIndex = "public function index() {
        \$items = \Illuminate\Support\Facades\DB::table('layanan')
            ->where('status', 'active')
            ->where('tipe', '$tipe')
            ->orderBy('harga_jual', 'asc')
            ->get();

        \$grouped = [];
        foreach (\$items as \$p) {
            \$provider = strtoupper(\$p->provider ?? 'UMUM');
            \$grouped[\$provider][] = \$p;
        }

        return \Inertia\Inertia::render('$view', [
            'products' => \$items,
            'groupedProducts' => (object)\$grouped,
            'userBalance' => \Illuminate\Support\Facades\Auth::user()->saldo ?? 0
        ]);
    }";

        // Ganti fungsi index() lama dengan yang baru pakai Regex
        $newContent = preg_replace('/public function index\(\).*?return (?:Inertia\\\Inertia::render|Inertia::render)\([^;]+;/s', $newIndex, $content);
        
        file_put_contents($path, $newContent);
        echo "✅ " . str_replace('.php', '', $file) . " -> Berhasil disinkronisasi (Tipe: $tipe)\n";
    } else {
        echo "❌ File $file tidak ditemukan!\n";
    }
}
echo "\n🎉 OPERASI SELESAI! Semua pintu gudang sudah terbuka.\n\n";
