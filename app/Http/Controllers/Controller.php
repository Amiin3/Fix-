<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

abstract class Controller
{
    protected function kirimNotifSultan($email, $judul, $pesan)
    {
        try {
            $url = 'http://localhost:3003/push-notif';
            $data = json_encode(['email' => $email, 'judul' => $judul, 'pesan' => $pesan]);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 2);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
            curl_exec($ch);
            curl_close($ch);
        } catch (\Exception $e) {}
    }

    /**
     * 🛡️ MESIN DISKON RESELLER V2 (BYPASS CACHE)
     */
    protected function hitungHargaReseller($hargaTabel, $hargaModal, $provider, $userLevel)
    {
        // Debug: Log ke storage/logs/laravel.log untuk intip prosesnya
        // Log::info("Cek Harga: Prov $provider, Level $userLevel, Harga $hargaTabel");

        if ($userLevel !== 'reseller' && $userLevel !== 'admin') {
            return $hargaTabel;
        }

        // AMBIL LANGSUNG DARI DB (No Cache biar gak error)
        $diskon = DB::table('reseller_discounts')->where('provider', $provider)->value('potongan') ?? 0;

        $hargaAkhir = $hargaTabel - $diskon;

        // Safety Net: Gak boleh lebih murah dari modal
        return max($hargaAkhir, $hargaModal);
    }
}
