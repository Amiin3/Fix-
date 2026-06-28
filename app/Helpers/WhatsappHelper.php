<?php
namespace App\Helpers;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappHelper
{
    public static function send($target, $message)
    {
        try {
            // BERSIHKAN TOKEN DARI SPASI GAIB SEPERTI KASUS DIGIFLAZZ
            $token = trim(config('services.fonnte.token'));

            if (empty($token)) {
                Log::warning("WHATSAPP GAGAL: Token Fonnte KOSONG di file .env!");
                return false; // Jangan bikin error, kembalikan false saja
            }

            // TEMBAK API DENGAN BATAS WAKTU 10 DETIK MAKSIMAL
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->timeout(10)->post('https://api.fonnte.com/send', [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62',
            ]);

            $res = $response->json();
            
            // CCTV AKTIF: CATAT STATUS PENGIRIMAN KE LOG
            Log::info("WHATSAPP INFO (Target: $target): ", $res ?? []);

            return $res;

        } catch (\Exception $e) {
            // KALAU SERVER WA DOWN, JANGAN BIKIN WEB ERROR!
            // Catat saja diam-diam di buku catatan (Log)
            Log::error("WHATSAPP CRITICAL ERROR: " . $e->getMessage());
            return false;
        }
    }
}
