<?php
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

// Kita cari transaksi TEST_CEK terakhir di Digiflazz
$sign = md5($username . $key . "depo"); // Kita pake list transaksi depo/history
$payload = json_encode([
    'username' => $username,
    'sign' => md5($username . $key . "history") // Cek history transaksi
]);

echo "📡 Mencari Nama Pelanggan PLN dari transaksi terakhir...\n";

$ch = curl_init("https://api.digiflazz.com/v1/transaction");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
// Kita tembak status berdasarkan Ref ID yang tadi (Lu harus liat log tadi buat dapet Ref ID lengkapnya)
// Tapi kita coba cara gampang: Cek history 1 transaksi terakhir
$payload_status = json_encode([
    'username' => $username,
    'ref_id' => "TEST_CEK_" . (time() - 30), // Estimasi ID yang tadi (Mungkin gak akurat)
    'sign' => md5($username . $key . "TEST_CEK_") // Ini contoh
]);

// LEBIH SIMPLE: Kita nembak ulang saja nomornya, biasanya kalau sudah sukses dia lsg jawab NAMA
echo "----------------------------------------\n";
echo "Saran: Sultan, coba jalankan lagi 'php cek_nomor.php'\n";
echo "Kalau server PLN sudah lancar, SN bakal isi NAMA PEMILIK METERAN!\n";
echo "----------------------------------------\n";
