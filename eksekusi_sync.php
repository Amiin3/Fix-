<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "\n========================================\n";
echo "🚀 EKSEKUSI SYNC SULTAN V3 (FIX .ENV)\n";
echo "========================================\n\n";

$digi = app(\App\Services\DigiflazzService::class);
$items = [];

// --- 1. PRABAYAR ---
echo "📡 Mengontak API Digiflazz (Prabayar)...\n";
$resPrepaid = $digi->priceList(); 
if (isset($resPrepaid['data']) && is_array($resPrepaid['data'])) {
    $items = array_merge($items, $resPrepaid['data']);
    echo "✔️ Dapat " . count($resPrepaid['data']) . " produk Prabayar.\n";
} else {
    echo "⚠️ Gagal Prabayar (Atau Kena Limit). Respon: " . json_encode($resPrepaid) . "\n";
}

// --- 2. PASCABAYAR ---
echo "📡 Mengontak API Digiflazz (Pascabayar)...\n";
// 🔥 INI FIX-NYA: Sesuaikan dengan nama di .env Bos
$username = env('DIGI_USERNAME');
$key = env('DIGI_APIKEY');

if ($username && $key) {
    $sign = md5($username . $key . "pricelist");
    $resPasca = Http::post('https://api.digiflazz.com/v1/price-list', [
        'cmd' => 'pasca',
        'username' => $username,
        'sign' => $sign
    ])->json();
    
    if (isset($resPasca['data']) && is_array($resPasca['data'])) {
        $items = array_merge($items, $resPasca['data']);
        echo "✔️ Dapat " . count($resPasca['data']) . " produk Pascabayar.\n";
    } else {
        echo "⚠️ Gagal Pascabayar (Atau Kena Limit). Respon: " . json_encode($resPasca) . "\n";
    }
} else {
    echo "❌ Kredensial .env masih tidak terbaca!\n";
}

if (empty($items)) {
    die("\n❌ GAGAL TOTAL: Tidak ada data yang berhasil ditarik. (Tunggu Cooldown Limit API 15 menit).\n");
}

// --- 3. INSERT DATABASE ---
echo "📦 Memasukkan " . count($items) . " produk ke tabel layanan...\n";
DB::beginTransaction();
$count = 0;

foreach ($items as $item) {
    if (!isset($item['buyer_sku_code'])) continue;

    $sku = $item['buyer_sku_code'];
    $isPasca = !isset($item['price']);
    
    $price = $isPasca ? (int)($item['admin'] ?? 0) : (int)($item['price'] ?? 0);
    $status = (isset($item['buyer_product_status']) && $item['buyer_product_status'] == 1 && isset($item['seller_product_status']) && $item['seller_product_status'] == 1) ? 'active' : 'inactive';

    $exist = DB::table('layanan')->where('kode_layanan', $sku)->first();
    $defaultProfit = $isPasca ? 2500 : 1000;
    $profit = $exist ? ((int)$exist->harga_jual - (int)$exist->harga_beli) : $defaultProfit;
    if ($profit < 0) $profit = $defaultProfit;

    DB::table('layanan')->updateOrInsert(
        ['kode_layanan' => $sku],
        [
            'nama_layanan' => substr($item['product_name'] ?? 'Produk', 0, 200),
            'provider'     => substr($item['brand'] ?? 'Lainnya', 0, 100),
            'harga_beli'   => $price,
            'harga_jual'   => $price + $profit,
            'tipe'         => substr($item['category'] ?? 'Umum', 0, 100),
            'status'       => $status,
            'kelompok_id'  => $exist ? $exist->kelompok_id : null,
            'updated_at'   => now()
        ]
    );
    $count++;
}

DB::commit();
echo "\n✅ SULTAN BERHASIL! $count produk telah mendarat di tabel 'layanan'.\n";
