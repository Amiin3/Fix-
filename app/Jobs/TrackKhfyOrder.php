<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrackKhfyOrder implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $refId;
    public $tries = 30; // Coba nanya sampe 30 kali (total ~2.5 menit)
    public $backoff = 5; // Jeda cuma 5 detik (Sangat Agresif!)

    public function __construct($refId) {
        $this->refId = $refId;
    }

    public function handle() {
        $trx = DB::table('transaksi')->where('ref_id', $this->refId)->first();
        
        // Kalau sudah Sukses/Gagal (mungkin kena Webhook dulu), Berhenti nanya!
        if (!$trx || $trx->status !== 'Pending') return;

        $apiKey = env('KHFY_API_KEY');
        try {
            $url = "https://panel.khfy-store.com/api_v2/history?api_key=$apiKey&refid=$this->refId";
            $res = Http::timeout(10)->get($url);
            $data = $res->json();

            if ($res->successful() && isset($data['data'][0])) {
                $prov = $data['data'][0];
                $statusProv = strtoupper($prov['status_text']);

                if ($statusProv === 'SUKSES' || $statusProv === 'GAGAL') {
                    DB::beginTransaction();
                    $finalStatus = ($statusProv === 'SUKSES') ? 'Sukses' : 'Gagal';
                    
                    DB::table('transaksi')->where('id', $trx->id)->update([
                        'status' => $finalStatus,
                        'sn' => $prov['sn'] ?? $prov['keterangan'] ?? 'Updated by Bodyguard',
                        'updated_at' => now()
                    ]);

                    if ($finalStatus === 'Gagal') {
                        if ($trx->status !== 'Gagal' && $trx->status !== 'GAGAL') { DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga); }
                        Log::info("🔄 [BODYGUARD] REFUND BERHASIL: $this->refId");
                    }
                    DB::commit();
                    Log::info("🎯 [BODYGUARD] SELESAI: $this->refId jadi $finalStatus");
                    return; 
                }
            }
        } catch (\Exception $e) {
            Log::error("⚠️ [BODYGUARD] Error nanya status: " . $e->getMessage());
        }

        // Kalau masih Pending di KHFY, nanya lagi 5 detik kemudian
        $this->release(5);
    }
}
