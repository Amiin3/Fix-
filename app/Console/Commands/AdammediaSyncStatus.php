<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Models\PpobTransaction;
use App\Models\User;
use App\Services\AdammediaService;

class AdammediaSyncStatus extends Command {
    protected $signature = 'adammedia:sync';
    protected $description = 'Sync Status IRS Presisi';

    public function handle() {
        $pending = PpobTransaction::where('status', 'PROSES')->get();
        $srv = app(AdammediaService::class);

        foreach ($pending as $trx) {
            $this->info("📡 Cek RefID: {$trx->ref_id}");
            $res = $srv->checkStatus($trx->ref_id, $trx->product_code, $trx->target);
            
            if ($res['status'] !== 'PROSES') {
                if ($res['status'] == 'GAGAL' && $trx->status === 'PROSES') {
                    $user = User::where('name', $trx->username)->first();
                    if ($user) { $user->increment('saldo', $trx->price); }
                }
                $trx->update(['status' => $res['status'], 'sn' => $res['sn'], 'message' => $res['msg']]);
                $this->info("✅ Updated to {$res['status']}");
            }
        }
    }
}
