<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function base64url_encode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

$users = \App\Models\User::whereNotNull('push_token')->where('push_token', '!=', '')->get();
if($users->isEmpty()) {
    echo "\n[❌] TARGET KOSONG: Tidak ada satupun 'Alamat HP' (Token) di database!\n";
    echo "-> Ini bukti bahwa konsletnya ada di 'Pintu Masuk' server. HP Bos tidak bisa menyimpan token ke database.\n\n";
    exit;
}

$file = storage_path('app/firebase-auth.json');
$auth = json_decode(file_get_contents($file), true);

$header = base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
$payload = base64url_encode(json_encode(['iss' => $auth['client_email'], 'scope' => 'https://www.googleapis.com/auth/cloud-platform', 'aud' => 'https://oauth2.googleapis.com/token', 'exp' => time() + 3600, 'iat' => time()]));
openssl_sign("$header.$payload", $signature, $auth['private_key'], OPENSSL_ALGO_SHA256);
$jwt = "$header.$payload." . base64url_encode($signature);

$res = Illuminate\Support\Facades\Http::asForm()->post('https://oauth2.googleapis.com/token', ['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $jwt]);
$accessToken = $res->json()['access_token'];

foreach($users as $user) {
    $tokenData = json_decode($user->push_token, true);
    $target = $tokenData['token'] ?? $tokenData['endpoint'] ?? $user->push_token;
    
    $response = Illuminate\Support\Facades\Http::withToken($accessToken)
        ->post("https://fcm.googleapis.com/v1/projects/{$auth['project_id']}/messages:send", [
            'message' => [
                'token' => $target,
                'notification' => ['title' => 'TES TERMINAL SULTAN', 'body' => 'Sinyal langsung dari mesin server!']
            ]
        ]);
        
    if($response->successful()) { echo "[✅] BERHASIL: Sinyal terkirim paksa ke HP {$user->name}!\n"; } 
    else { echo "[❌] GAGAL KIRIM ke {$user->name}: " . $response->body() . "\n"; }
}
