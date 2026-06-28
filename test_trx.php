<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = env('DIGI_USERNAME');
$key = env('DIGI_APIKEY');

// Ambil 1 produk asli dari database Bos
$produk = DB::table('layanan')->where('status', 'active')->whereIn('tipe', ['PULSA', 'pulsa'])->first();
$sku = $produk ? $produk->kode_layanan : 'xld10';

$tujuan = '081234567890';
$refId = 'TEST' . time();
$sign = md5($user . $key . $refId);

$payload = [
    'username' => $user,
    'buyer_sku_code' => $sku,
    'customer_no' => $tujuan,
    'ref_id' => $refId,
    'sign' => $sign,
    'testing' => true // MODE AMAN, SALDO TIDAK AKAN BERKURANG
];

echo "---> PRODUK TEST : " . $sku . "\n";
echo "---> PAYLOAD TRX : " . json_encode($payload) . "\n";
$res = Illuminate\Support\Facades\Http::post('https://api.digiflazz.com/v1/transaction', $payload);
echo "---> JAWABAN DIGIFLAZZ : " . $res->body() . "\n\n";
