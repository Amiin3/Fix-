<?php
// 1. Baca .env secara manual (Metode Badak V12)
$envContent = file_get_contents('.env');
$lines = explode("\n", $envContent);
$conf = [];
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0 || empty(trim($line))) continue;
    $parts = explode('=', $line, 2);
    if (count($parts) == 2) { $conf[trim($parts[0])] = trim(trim($parts[1]), '"\''); }
}

$username = $conf['DIGI_USERNAME'] ?? '';
$key = $conf['DIGI_APIKEY'] ?? '';
$tujuan = "32014199858";
$sku = "Token1"; // SKU Cek Nama PLN

if (!$username || !$key) { die("❌ Error: DIGI_USERNAME/KEY di .env GAK ADA!\n"); }

// Kita pake Ref ID yang unik biar gak dianggap duplikat oleh Digiflazz
$ref_id = "CEK_" . date('His'); 
$sign = md5($username . $key . $ref_id);

$payload = json_encode([
    'username' => $username,
    'buyer_sku_code' => $sku,
    'customer_no' => $tujuan,
    'ref_id' => $ref_id,
    'sign' => $sign
]);

echo "🚀 Menghubungi Digiflazz (User: $username)...\n";
echo "🎯 Menembak ID: $tujuan | SKU: $sku\n";
echo "----------------------------------------\n";

$ch = curl_init("https://api.digiflazz.com/v1/transaction");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res = curl_exec($ch);
$data = json_decode($res, true);

if (isset($data['data'])) {
    $d = $data['data'];
    echo "STATUS : " . ($d['status'] ?? '-') . "\n";
    echo "PESAN  : " . ($d['message'] ?? '-') . "\n";
    echo "SN/NAMA: " . ($d['sn'] ?? 'MASIH PENDING/KOSONG') . "\n";
    echo "HARGA  : " . ($d['price'] ?? '-') . "\n";
    echo "----------------------------------------\n";
    
    if (($d['status'] ?? '') == 'Gagal') {
        echo "⚠️  Analisa: Digiflazz nolak karena nomor salah atau produk tutup.\n";
    } elseif (($d['status'] ?? '') == 'Pending') {
        echo "⏳  Analisa: Server PLN lagi padat, tunggu 1-2 menit terus jalanin lagi skrip ini.\n";
    } else {
        echo "✅  MANTAP! Cek Nama Berhasil Sultan!\n";
    }
} else {
    echo "❌ Gagal Respon: " . $res . "\n";
}
