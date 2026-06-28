<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Helpers\WhatsappHelper;

class DepositNotifCron extends Command
{
    protected $signature = 'deposit:notif';
    protected $description = 'Mesin Pintar: Pantau deposits.wa_notif dan kirim WA';

    public function handle()
    {
        // 🚀 HANYA CARI YANG STATUS SUKSES DAN WA_NOTIF MASIH 0
        $deposits = DB::table('deposits')
            ->where('status', 'Sukses')
            ->where('wa_notif', 0)
            ->get();

        if ($deposits->isEmpty()) {
            return; // Tidur lagi kalau nggak ada deposit baru
        }

        foreach ($deposits as $depo) {
            $user = DB::table('users')->where('id', $depo->user_id)->first();
            
            if ($user) {
                // PRIORITAS KOLOM PHONE (NOMOR ASLI WEB)
                $target = (!empty($user->phone) && strlen($user->phone) >= 10) ? $user->phone : $user->whatsapp;

                // VALIDASI NOMOR (Bukan ID Alien)
                if (preg_match('/^(0|62|8)/', $target)) {
                    $pesan = "✅ *DEPOSIT BERHASIL*\n\nSaldo sebesar *Rp " . number_format($depo->amount, 0, ',', '.') . "* telah masuk ke akun Anda.\n\nTerima kasih telah menggunakan MilaStore! 💎";
                    
                    // TEMBAK KE BOT WA LOCAL LU
                    $sent = WhatsappHelper::send($target, $pesan);

                    if ($sent) {
                        // 🚩 TANDAI DI DATABASE BIAR GAK KIRIM LAGI
                        DB::table('deposits')->where('id', $depo->id)->update(['wa_notif' => 1]);
                        $this->info("✅ Notif ID {$depo->id} terkirim ke $target");
                    }
                } else {
                    // Jika nomor tidak valid, tetap tandai 1 biar gak nyangkut selamanya di loop
                    DB::table('deposits')->where('id', $depo->id)->update(['wa_notif' => 1]);
                    $this->error("❌ Nomor target tidak valid (Alien ID): $target");
                }
            }
        }
    }
}
