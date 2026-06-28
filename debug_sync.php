<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "\n========================================\n";
echo "🕵️‍♂️ DEBUGGER API DIGIFLAZZ (X-RAY)\n";
echo "========================================\n\n";

$username = env('DIGIFLAZZ_USERNAME');
$key = env('DIGIFLAZZ_KEY');

echo "🔍 1. CEK KREDENSIAL (.env)\n";
echo "Username : " . ($username ? "TERISI ($username)" : "❌ KOSONG") . "\n";
echo "API Key  : " . ($key ? "TERISI (***" . substr($key, -4) . ")" : "❌ KOSONG") . "\n\n";

if (!$username || !$key) {
    die("🚨 HENTIKAN: Username atau Key belum diisi dengan benar di file .env!\n");
}

// --- TEST PRABAYAR ---
echo "🔍 2. TEST KONEKSI PRABAYAR (PREPAID)\n";
$signPrepaid = md5($username . $key . "pricelist");
$responsePrepaid = Http::post('https://api.digiflazz.com/v1/price-list', [
    'cmd' => 'prepaid',
    'username' => $username,
    'sign' => $signPrepaid
]);

$dataPrepaid = $responsePrepaid->json();
if (isset($dataPrepaid['data']) && is_array($dataPrepaid['data'])) {
    echo "✅ SUKSES: Dapat " . count($dataPrepaid['data']) . " produk Prabayar.\n";
    echo "   Contoh 1 Produk: " . $dataPrepaid['data'][0]['product_name'] . " - Rp " . ($dataPrepaid['data'][0]['price'] ?? 0) . "\n";
} else {
    echo "❌ GAGAL/LIMIT (Respon Mentah):\n";
    print_r($dataPrepaid);
}
echo "\n";

// --- TEST PASCABAYAR ---
echo "🔍 3. TEST KONEKSI PASCABAYAR (POSTPAID)\n";
$signPasca = md5($username . $key . "pricelist");
$responsePasca = Http::post('https://api.digiflazz.com/v1/price-list', [
    'cmd' => 'pasca',
    'username' => $username,
    'sign' => $signPasca
]);

$dataPasca = $responsePasca->json();
if (isset($dataPasca['data']) && is_array($dataPasca['data'])) {
    echo "✅ SUKSES: Dapat " . count($dataPasca['data']) . " produk Pascabayar.\n";
    echo "   Contoh 1 Produk: " . $dataPasca['data'][0]['product_name'] . " - Admin: Rp " . ($dataPasca['data'][0]['admin'] ?? 0) . "\n";
} else {
    echo "❌ GAGAL/LIMIT (Respon Mentah):\n";
    print_r($dataPasca);
}
echo "\n";

// --- TEST INSERT DATABASE ---
echo "🔍 4. TEST SIMPAN KE DATABASE (Sample 1 Data)\n";
$sampleData = null;
$isPasca = false;

if (isset($dataPrepaid['data']) && is_array($dataPrepaid['data']) && count($dataPrepaid['data']) > 0) {
    $sampleData = $dataPrepaid['data'][0];
} elseif (isset($dataPasca['data']) && is_array($dataPasca['data']) && count($dataPasca['data']) > 0) {
    $sampleData = $dataPasca['data'][0];
    $isPasca = true;
}

if ($sampleData) {
    try {
        DB::beginTransaction();
        $sku = $sampleData['buyer_sku_code'];
        $price = $isPasca ? (int)($sampleData['admin'] ?? 0) : (int)($sampleData['price'] ?? 0);
        
        DB::table('layanan')->updateOrInsert(
            ['kode_layanan' => $sku],
            [
                'nama_layanan' => substr($sampleData['product_name'] ?? 'Test', 0, 200),
                'provider'     => substr($sampleData['brand'] ?? 'Test', 0, 100),
                'harga_beli'   => $price,
                'harga_jual'   => $price + 1000,
                'tipe'         => substr($sampleData['category'] ?? 'Test', 0, 100),
                'status'       => 'active',
                'kelompok_id'  => null,
                'updated_at'   => now()
            ]
        );
        DB::rollBack(); // Dibatalkan langsung supaya tidak mengotori DB
        echo "✅ SUKSES: Jalur Database Aman! Tidak ada error kolom atau foreign key.\n";
    } catch (\Exception $e) {
        DB::rollBack();
        echo "🚨 ERROR DATABASE DETECTED:\n" . $e->getMessage() . "\n";
    }
} else {
    echo "⚠️ Lewati test database karena API sedang melimit (tidak ada data).\n";
}

echo "\n========================================\n";
echo "Selesai Debugging.\n";
echo "========================================\n";
