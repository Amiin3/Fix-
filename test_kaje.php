<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = env('KAJE_API_KEY');
echo "1. CEK API KEY: " . (empty($apiKey) ? "❌ KOSONG (Belum disetting di .env)!\n" : "✅ ADA (" . substr($apiKey, 0, 8) . "...)\n");

echo "2. MENGHUBUNGI SERVER KAJE...\n";
try {
    $response = Illuminate\Support\Facades\Http::timeout(15)->withHeaders([
        'x-api-key' => $apiKey,
        'accept' => 'application/json',
        'Content-Type' => 'application/json'
    ])->post('https://end.kaje-store.com/api/service/list-package-otp', new \stdClass());

    echo "3. STATUS HTTP: " . $response->status() . "\n";
    echo "4. JAWABAN KAJE:\n" . $response->body() . "\n";
} catch (\Exception $e) {
    echo "❌ ERROR FATAL: " . $e->getMessage() . "\n";
}
