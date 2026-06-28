<?php
// ==========================================
// TESTER API MILA STORE v4.0 (AUTO ENV)
// ==========================================
$envPath = __DIR__ . '/.env';
$apiKey = '';

// 1. Ambil API Key langsung dari .env
if (file_exists($envPath)) {
    $env = file_get_contents($envPath);
    if (preg_match('/MILA_STORE_API_KEY=(.*)/', $env, $matches)) {
        // Bersihkan dari spasi atau tanda kutip ganda/tunggal jika ada
        $apiKey = trim(str_replace(['"', "'"], '', $matches[1]));
    }
}

if (empty($apiKey)) {
    echo "\n\e[1;31m[ERROR] MILA_STORE_API_KEY tidak ditemukan di file .env kamu!\e[0m\n";
    exit;
}

$baseUrl = "http://138.197.120.9:8888/api/v1/member_info";
$msisdn  = "6281916526445"; // Menggunakan nomor pengelola kamu

// 2. Bangun URL Query
$targetUrl = $baseUrl . "?" . http_build_query([
    'active_msisdn' => $msisdn,
    'api_key'       => $apiKey
]);

echo "\n\e[1;34m==================================================\e[0m\n";
echo "\e[1;33m MENGUJI KONEKSI SERVER XL VIA MILA STORE API... \e[0m\n";
echo "\e[1;34m==================================================\e[0m\n";
echo " MSISDN    : " . $msisdn . "\n";
echo " API KEY   : " . substr($apiKey, 0, 8) . "********\n";
echo " TARGET URL: " . $targetUrl . "\n\n";

// 3. Eksekusi cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "\e[1;31m[ERROR cURL]:\e[0m " . curl_error($ch) . "\n";
    curl_close($ch);
    exit;
}
curl_close($ch);

echo " HTTP Status: " . ($httpCode == 200 ? "\e[1;32m200 OK\e[0m" : "\e[1;31m$httpCode\e[0m") . "\n\n";

echo "\e[1;35m[RAW DATA RESPOND DARI SERVER XL]:\e[0m\n";
if (empty($response)) {
    echo "\e[1;31m Server mengembalikan respons kosong.\e[0m\n";
} else {
    // Tampilkan JSON dalam format array yang mudah dibaca
    $jsonData = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        print_r($jsonData);
    } else {
        echo $response . "\n";
    }
}
echo "\n\e[1;34m==================================================\e[0m\n";
