<?php
// === KONFIGURASI SULTAN ===
$email    = 'amifiabadan@gmail.com';
$password = '1Hendrawati';
$apikey   = 'pFRsGQMAA94iMpH5wd';
$baseUrl  = 'https://api.hesda-store.com/v2';

// === HELPER CURL ===
function tembak($url, $method = 'GET', $data = [], $email, $password) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    curl_setopt($ch, CURLOPT_USERPWD, "$email:$password");

    if ($method == 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        // Hesda pake Form Data sesuai Postman Lu
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    }

    $res = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $http, 'body' => json_decode($res, true) ?: $res];
}

echo "\n🚀 === HESDA TERMINAL COMMANDER READY === 🚀\n";

// 1. CEK SALDO
echo "\n[1] MENGUJI SALDO...";
$test1 = tembak("$baseUrl/saldo?hesdastore=$apikey", 'GET', [], $email, $password);
if($test1['code'] == 200 && @$test1['body']['status']) {
    echo " ✅ SUKSES! Saldo: Rp " . number_format($test1['body']['data']['saldo']);
} else {
    echo " ❌ GAGAL! Respon: " . json_encode($test1['body']);
}

// 2. CEK STOK
echo "\n[2] MENGUJI STOK AKRAB...";
$test2 = tembak("$baseUrl/cek_stok_akrab?hesdastore=$apikey", 'GET', [], $email, $password);
if($test2['code'] == 200 && @$test2['body']['status']) {
    echo " ✅ SUKSES! Ditemukan " . count($test2['body']['data']) . " Produk Stok.";
} else {
    echo " ❌ GAGAL!";
}

// 3. LIST PAKET NON-OTP (Akrab)
echo "\n[3] MENGUJI LIST PAKET NON-OTP...";
$test3 = tembak("$baseUrl/list_paket?hesdastore=$apikey&jenis=nonotp", 'GET', [], $email, $password);
if($test3['code'] == 200 && @$test3['body']['status']) {
    echo " ✅ SUKSES! Ditemukan " . count($test3['body']['data']) . " Paket.";
} else {
    echo " ❌ GAGAL!";
}

// 4. TES MINTA OTP (Cuma simulasi ke nomor dummy)
$no_tes = '087883231313';
echo "\n[4] MENCOBA MINTA OTP KE $no_tes...";
$test4 = tembak("$baseUrl/get_otp", 'POST', [
    'hesdastore' => $apikey,
    'no_hp' => $no_tes,
    'metode' => 'OTP'
], $email, $password);
echo ($test4['code'] == 200) ? " ✅ RESPON OK!" : " ❌ GAGAL!";

echo "\n\n=== SEMUA PENGUJIAN SELESAI ===\n\n";
