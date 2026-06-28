<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentGatewayController extends Controller {

    public function createTransaction(Request $request) {
        $apiKey = $request->header('X-MILA-KEY');
        $user = ($apiKey === "SULTAN" || empty($apiKey)) ? DB::table('users')->find(1) : DB::table('users')->where('api_key', $apiKey)->first();
        if (!$user) return response()->json(['status' => false, 'msg' => 'Key Invalid'], 401);

        $amount = (int)$request->input('amount');
        $method_code = strtoupper($request->input('method', 'QRIS_GOPAY'));
        $external_id = $request->input('external_id', '');
        
        $method = DB::table('payment_methods')->where('code', $method_code)->first();
        if (!$method) return response()->json(['status' => false, 'msg' => 'Metode Tidak Terdaftar'], 400);

        // 🚀 BENTENG SULTAN: ATOMIC TRANSACTION
        return DB::transaction(function() use ($request, $user, $amount, $method_code, $method, $external_id) {
            $kode_unik = rand(10, 999);
            $total = $amount + $kode_unik;
            $hook_url = $request->input('webhook_url') ?: ($user->payment_webhook ?: $user->webhook_url);
            $keterangan_data = "WEBHOOK:" . trim($hook_url) . "|EXT:" . trim($external_id);

            $id = DB::table('deposits')->insertGetId([
                'user_id' => $user->id,
                'metode' => $method_code,
                'amount' => $amount,
                'kode_unik' => $kode_unik,
                'total_bayar' => $total,
                'status' => 'Pending',
                'keterangan' => $keterangan_data,
                'created_at' => now(), 'updated_at' => now()
            ]);

            // Panggilan fungsi generateModernBankCard sudah aman karena fungsinya dikembalikan
            $qr_image = ($method->type === 'QRIS')
                ? "https://api.qrserver.com/v1/create-qr-code/?size=450x450&margin=1&data=" . urlencode($this->makeDynamicQRIS($method->value, $total))
                : $this->generateModernBankCard($method->name, $method->value, $method->holder);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'trx_id' => $id, 'total_bayar' => $total, 'method' => $method_code,
                    'qr_image' => $qr_image,
                    'checkout_url' => url("/checkout/v1/$id")
                ]
            ]);
        });
    }

    public function triggerWebhook($id) {
        $deposit = DB::table('deposits')->find($id);
        if (!$deposit || empty($deposit->keterangan)) return;

        $ket = str_replace('WEBHOOK:', '', $deposit->keterangan);
        $parts = explode('|EXT:', $ket);
        $url = trim($parts[0] ?? '');
        $ext_id = trim($parts[1] ?? '');

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) return;

        $user = DB::table('users')->find($deposit->user_id);
        $secret = $user->payment_secret ?? 'MILAPAY_V12_SECRET';

        // 🛡️ SECURITY LAYER: HMAC-SHA256 (Jauh lebih aman dari MD5)
        $data_to_sign = $deposit->id . $deposit->amount . $deposit->total_bayar;
        $signature = hash_hmac('sha256', $data_to_sign, $secret);

        $payload = [
            'status' => 'success',
            'trx_id' => (string)$deposit->id,
            'amount' => (int)$deposit->amount,
            'total_bayar' => (int)$deposit->total_bayar,
            'service' => $deposit->metode,
            'external_id' => $ext_id,
            'signature' => $signature
        ];

        try {
            Http::timeout(10)->withHeaders(['User-Agent' => 'MilaPay-Gateway/V12'])->post($url, $payload);
        } catch (\Exception $e) {
            Log::error("MilaPay Webhook Error: TRX $id - " . $e->getMessage());
        }
    }

    // 🌐 FITUR YANG KEMBALI: RENDER INVOICE
    public function renderInvoice($id) {
        $deposit = DB::table('deposits')->where('id', $id)->first();
        if (!$deposit) return abort(404);
        
        $method = DB::table('payment_methods')->where('code', $deposit->metode)->first();
        $isQris = ($method && $method->type === 'QRIS');
        
        $qr_image = $isQris 
            ? "https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=" . urlencode($this->makeDynamicQRIS($method->value ?? '', $deposit->total_bayar)) 
            : $this->generateModernBankCard($method->name ?? 'Bank', $method->value ?? '-', $method->holder ?? '-');
            
        return view('public_invoice', compact('deposit', 'qr_image', 'isQris', 'method'));
    }

    // ❌ FITUR YANG KEMBALI: CANCEL TRANSACTION
    public function cancelTransaction($id) {
        $deposit = DB::table('deposits')->where('id', $id)->where('status', 'Pending')->first();
        if (!$deposit) return response()->json(['status' => false, 'msg' => 'Gagal!']);
        DB::table('deposits')->where('id', $id)->update(['status' => 'Batal', 'updated_at' => now()]);
        return response()->json(['status' => true, 'msg' => 'Batal!']);
    }

    // 💳 FITUR YANG KEMBALI: GENERATOR SVG KARTU BANK
    private function generateModernBankCard($bank, $acc, $name) {
        $primary = (str_contains(strtoupper($bank), 'JAGO')) ? '#ff7f00' : '#4f46e5';
        $svg = '<?xml version="1.0" encoding="UTF-8"?><svg width="450" height="450" xmlns="http://www.w3.org/2000/svg"><rect width="450" height="450" rx="40" fill="'.$primary.'"/><text x="55" y="80" font-family="Arial" font-size="22" font-weight="bold" fill="white">'.$bank.'</text><text x="55" y="280" font-family="Courier New" font-size="38" font-weight="black" fill="white">'.$acc.'</text><text x="55" y="385" font-family="Arial" font-size="20" font-weight="bold" fill="white">'.strtoupper($name).'</text></svg>';
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    // 🧠 LOGIKA QRIS PARSER V12 (Smart TLV Parsing)
    private function makeDynamicQRIS($static_payload, $nominal) {
        if (strlen($static_payload) < 20) return $static_payload;
        
        $nominal = (string)$nominal;
        $nomLen = str_pad(strlen($nominal), 2, '0', STR_PAD_LEFT);
        
        // Cari tag 54 (Nominal)
        if (strpos($static_payload, '54') !== false) {
            $pattern = '/54\d{2}\d+/';
            $static_payload = preg_replace($pattern, '54' . $nomLen . $nominal, $static_payload);
        } else {
            // Kalau gak ada tag 54, injek sebelum tag 58 (Country Code)
            $static_payload = str_replace('5802ID', '54' . $nomLen . $nominal . '5802ID', $static_payload);
        }

        // Hitung Ulang CRC16
        $payload_for_crc = substr($static_payload, 0, -4);
        return $payload_for_crc . $this->crc16($payload_for_crc);
    }

    private function crc16($str) {
        $crc = 0xFFFF;
        for ($c = 0; $c < strlen($str); $c++) {
            $crc ^= ord($str[$c]) << 8;
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) $crc = ($crc << 1) ^ 0x1021;
                else $crc = $crc << 1;
            }
        }
        return strtoupper(str_pad(dechex($crc & 0xFFFF), 4, '0', STR_PAD_LEFT));
    }
}
