<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public static function sendMessage($target, $message)
    {
        // Jalur VIP Fonnte
        $token = env('FONNTE_TOKEN', 'eT1gt5wRDZtjbcijtUqd');
        
        try {
            $response = Http::withHeaders([
                'Authorization' => $token
            ])->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62', // Otomatis ubah 08 jadi 628
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Fonnte System Error: " . $e->getMessage());
            return false;
        }
    }
}
