<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n=============================================\n";
echo "   🚀 ULTRA DEBUGGER DIGIFLAZZ V2 🚀\n";
echo "=============================================\n\n";

// NAMA VARIABEL SUDAH DISESUAIKAN DENGAN .ENV BOS!
$user = env('DIGI_USERNAME');
$key = env('DIGI_APIKEY');

echo "[1] CEK KREDENSIAL (.env):\n";
echo "    USERNAME : [" . $user . "] (Panjang: " . strlen((string)$user) . " karakter)\n";
echo "    API KEY  : [" . substr((string)$key, 0, 5) . "........" . substr((string)$key, -5) . "] (Panjang: " . strlen((string)$key) . " karakter)\n\n";

if (!$user || !$key) {
    echo "❌ ERROR FATAL: Username atau API Key KOSONG!\n";
    exit;
}

echo "[2] CEK KONEKSI (CEK SALDO):\n";
$signDepo = md5($user . $key . "depo");
$payloadDepo = [
    'cmd' => 'deposit',
    'username' => $user,
    'sign' => $signDepo
];
echo "    Payload JSON  : " . json_encode($payloadDepo) . "\n";
$resDepo = Illuminate\Support\Facades\Http::post('https://api.digiflazz.com/v1/cek-saldo', $payloadDepo);
echo "    Response API  : " . $resDepo->body() . "\n\n";

echo "=============================================\n";
echo "   SELESAI - SILAKAN COPY HASILNYA KE SINI\n";
echo "=============================================\n";
