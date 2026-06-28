<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessH2HOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $trx_id, $supplier, $kode, $tujuan, $ref_id;

    public function __construct($trx_id, $supplier, $kode, $tujuan, $ref_id) {
        $this->trx_id = $trx_id; $this->supplier = $supplier;
        $this->kode = $kode; $this->tujuan = $tujuan; $this->ref_id = $ref_id;
    }

    public function handle() {
        Log::info("🚀 [KURIR-H2H] Memulai Tugas: {$this->ref_id} | Supplier: {$this->supplier}");
        
        $trx = DB::table('transaksi')->where('id', $this->trx_id)->first();
        if (!$trx) return;

        $res = ['status' => 'Pending', 'sn' => 'PROSES'];
        
        try {
            // 🚪 MASUK KE KAMAR MASING-MASING (ANTI BENTROK)
            if ($this->supplier === 'DIGI') {
                $res = \App\Processors\DigiProcessor::order($this->ref_id, $this->tujuan, $this->kode);
            } elseif ($this->supplier === 'KHFY') {
                $res = \App\Processors\KhfyProcessor::order($this->ref_id, $this->tujuan, $this->kode);
            } elseif ($this->supplier === 'ADAM') {
                $res = \App\Processors\AdamProcessor::order($this->ref_id, $this->tujuan, $this->kode);
            } elseif ($this->supplier === 'KAJE') {
                $res = \App\Processors\KajeProcessor::order($this->ref_id, $this->tujuan, $this->kode);
            }
        } catch (\Throwable $e) {
            Log::error("❌ [KURIR-H2H] ERROR KAMAR {$this->supplier}: " . $e->getMessage());
            return;
        }

        // 🔄 REFUND JIKA GAGAL
        if ($res['status'] === 'Gagal' && $trx->status !== 'Gagal') {
            DB::table('users')->where('name', $trx->username)->increment('saldo', $trx->harga);
            Log::info("🔄 [KURIR-H2H] Saldo User " . $trx->username . " Di-Refund");
        }

        // 💾 UPDATE DATABASE
        DB::table('transaksi')->where('id', $this->trx_id)->update([
            'status' => $res['status'],
            'sn' => $res['sn'],
            'updated_at' => now()
        ]);

        // 🎯 TEMBAK WEBHOOK
        if (in_array($res['status'], ['Sukses', 'Gagal'])) {
            try {
                \App\Http\Controllers\Api\H2HController::sendWebhook($this->ref_id);
            } catch (\Exception $e) {}
        }
        
        Log::info("✅ [KURIR-H2H] Selesai: {$this->ref_id} -> Status: {$res['status']}");
    }
}
