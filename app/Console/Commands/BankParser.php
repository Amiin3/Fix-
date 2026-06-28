<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BankParser extends Command {
    protected $signature = 'parse:mutasi';
    protected $description = 'MASTER OMNI-PARSER: Satu-satunya Penguasa Mutasi CY STORE';

    public function handle() {
        $this->info("==========================================");
        $this->info(" 🚀 MASTER OMNI-PARSER (IMAP) AKTIF... 🚀 ");
        $this->info("==========================================");
        
        $email = env('BANK_EMAIL');
        $pass = env('BANK_APP_PASSWORD');
        $mailbox = "{imap.gmail.com:993/imap/ssl}INBOX";
        
        if (empty($email) || empty($pass)) {
            $this->error("❌ FATAL: Email atau App Password di .env KOSONG!");
            return;
        }

        $start = time();
        while (time() - $start < 55) {
            // Hilangkan tanda @ agar error IMAP bisa ditangkap
            $imap = imap_open($mailbox, $email, $pass, 0, 1, ['DISABLE_AUTHENTICATOR' => 'PLAIN']);
            
            if ($imap) {
                // Tampilkan log sukses HANYA di detik pertama (biar terminal gak spam)
                if (time() - $start < 2) {
                    $this->info("✅ [" . date('H:i:s') . "] LOGIN GMAIL BERHASIL! Menunggu mutasi masuk...");
                }
                
                $this->scan($imap, 'alerts@seabank.co.id', 'SEABANK');
                $this->scan($imap, 'noreply@jago.com', 'JAGO');
                
                imap_close($imap);
            } else {
                $error_msg = imap_last_error();
                $this->error("❌ [" . date('H:i:s') . "] GAGAL LOGIN IMAP: " . $error_msg);
                imap_errors(); // Bersihkan stack error
                sleep(5); // Kasih jeda kalau error biar IP gak dilimit Google
            }
            sleep(10);
        }
    }

    private function scan($imap, $sender, $metode) {
        $emails = imap_search($imap, 'FROM "'.$sender.'" UNSEEN');
        if (!$emails) return;
        
        foreach ($emails as $id) {
            $body = imap_fetchbody($imap, $id, 1);
            if (strpos($body, 'base64') !== false) $body = base64_decode($body);
            $text = preg_replace('/\s+/', ' ', strip_tags($body));
            
            if (preg_match('/Rp\s?\.?\s?([0-9\.]+)/i', $text, $matches)) {
                $amount = (int) str_replace(['.', ','], '', $matches[1]);
                if ($amount > 0) $this->eksekusi($amount, $metode);
            }
            imap_setflag_full($imap, $id, "\\Seen");
        }
    }

    private function eksekusi($amount, $metode) {
        DB::transaction(function () use ($amount, $metode) {
            $trx = DB::table('deposits')->where('total_bayar', $amount)->where('status', 'Pending')->where('metode', $metode)->lockForUpdate()->first();
            if ($trx) {
                DB::table('users')->where('id', $trx->user_id)->increment('saldo', $amount);
                DB::table('deposits')->where('id', $trx->id)->update(['status' => 'Sukses', 'updated_at' => now()]);
                $this->info("✅ [{$metode}] SUKSES DEPOSIT: Rp $amount masuk ke User ID: $trx->user_id");
            }
        });
    }
}
