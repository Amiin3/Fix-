<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AdminDepositController;

class CheckMutation extends Command {
    protected $signature = 'mila:mutasi';
    protected $description = 'Scan Gmail untuk mutasi otomatis';

    public function handle() {
        $site = DB::table('site_settings')->first();
        if (!$site || !$site->bank_email || !$site->bank_password) return;

        $hostname = '{imap.gmail.com:993/imap/ssl}INBOX';
        $inbox = @imap_open($hostname, $site->bank_email, $site->bank_password);

        if (!$inbox) {
            imap_errors(); imap_alerts();
            $this->error("Gagal Login Gmail Sultan!");
            return;
        }

        $emails = imap_search($inbox, 'UNSEEN');
        if ($emails) {
            foreach ($emails as $email_number) {
                $message = imap_fetchbody($inbox, $email_number, 1);
                $body = strtolower($message);

                $pendingDeposits = DB::table('deposits')->where('status', 'Pending')->get();
                foreach ($pendingDeposits as $deposit) {
                    $nominal = (int)$deposit->total_bayar;
                    if (strpos($body, (string)$nominal) !== false) {
                        app(AdminDepositController::class)->handleAction($deposit->id, new \Illuminate\Http\Request(['status' => 'Sukses']));
                        
                        // ❌ PELATUK WEBHOOK SUDAH DICABUT DARI SINI ❌

                        imap_setflag_full($inbox, $email_number, "\\Seen");
                        $this->info("Berhasil ACC Otomatis: Rp " . $nominal);
                    }
                }
            }
        }
        imap_errors(); imap_alerts(); imap_close($inbox);
    }
}
