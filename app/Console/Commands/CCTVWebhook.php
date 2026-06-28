<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CCTVWebhook extends Command {
    protected $signature = 'mila:cctv';
    protected $description = 'CCTV Pintar V12: Pantau Database & Tembak Webhook Otomatis (Hanya Data Baru)';

    public function handle() {
        $this->info("🦅 [CCTV MILAPAY V12] ONLINE... Memantau Data Baru 24 Jam Terakhir.");

        while (true) {
            try {
                DB::transaction(function () {
                    $trx = DB::table('deposits')
                        ->whereIn('status', ['Sukses', 'BERHASIL', 'LUNAS', 'success'])
                        ->where('keterangan', 'LIKE', '%WEBHOOK:%')
                        // ⏱️ KUNCI UTAMA: HANYA BACA DATA YANG DIUPDATE 24 JAM TERAKHIR!
                        ->where('updated_at', '>=', now()->subHours(24))
                        ->lockForUpdate()
                        ->first();

                    if ($trx) {
                        $this->info("🎯 Target Terdeteksi: TRX ID {$trx->id}");

                        $isFired = \App\Services\MilaPayWebhookEngine::fire($trx->id);

                        if ($isFired) {
                            $newKeterangan = str_replace('WEBHOOK:', 'FIRED:', $trx->keterangan);
                            $this->info("✅ TRX {$trx->id} Sukses Terkirim & Ditandai FIRED.");
                        } else {
                            $newKeterangan = str_replace('WEBHOOK:', 'FAILED:', $trx->keterangan);
                            $this->error("❌ TRX {$trx->id} Gagal Ditembak! Ditandai FAILED.");
                        }

                        DB::table('deposits')->where('id', $trx->id)->update([
                            'keterangan' => $newKeterangan,
                            'updated_at' => now()
                        ]);
                    }
                });
            } catch (\Exception $e) {
                Log::error("🔥 [CCTV V12 CRASH]: " . $e->getMessage());
            }

            sleep(3);
        }
    }
}
