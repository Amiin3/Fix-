<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Pool;

class AutoWarKaje extends Command
{
    protected $signature = 'war:kaje';
    public function handle()
    {
        $apiKey = env('KAJE_API_KEY');
        $apiUrl = "https://end.kaje-store.com/api/service/order-product";

        // Ambil yang Menunggu
        $pending = DB::table('antrian_kaje')->where('status', 'Menunggu')->limit(20)->get();
        if ($pending->isEmpty()) return 0;

        $ids = $pending->pluck('id')->toArray();
        DB::table('antrian_kaje')->whereIn('id', $ids)->update(['status' => 'Menembak', 'updated_at' => now()]);

        $responses = Http::pool(function (Pool $pool) use ($pending, $apiKey, $apiUrl) {
            foreach ($pending as $p) {
                $pool->as('req_' . $p->id)->timeout(20)->withHeaders(['x-api-key' => $apiKey])
                     ->post($apiUrl, ['destination' => $p->tujuan, 'ref_id' => $p->ref_id, 'code' => $p->kode_produk]);
            }
        });

        foreach ($pending as $p) {
            $res = $responses['req_' . $p->id] ?? null;
            if (!$res || !$res->successful()) {
                DB::table('antrian_kaje')->where('id', $p->id)->update(['status' => 'Menunggu']);
                continue;
            }

            $resData = $res->json();
            $msg = is_array($resData['message'] ?? '') ? json_encode($resData['message']) : ($resData['message'] ?? 'No Msg');

            if (($resData['success'] ?? false) === true || $res->status() === 201) {
                $trx_id = $resData['data']['trx_id'] ?? 'TRX-P';
                DB::table('antrian_kaje')->where('id', $p->id)->update(['status' => 'Proses_API']);
                DB::table('transaksi')->where('ref_id', $p->ref_id)->update(['status' => 'Proses', 'sn' => $trx_id]);
            } else {
                // CCTV LOG: Simpan alasan gagal di kolom SN
                DB::table('transaksi')->where('ref_id', $p->ref_id)->update(['sn' => "GAGAL: $msg"]);
                
                if (preg_match('/(saldo|limit|aktif|mati)/i', $msg)) {
                    $trx = DB::table('transaksi')->where('ref_id', $p->ref_id)->first();
                    DB::table('users')->where('name', $p->username)->increment('saldo', $trx->harga);
                    DB::table('antrian_kaje')->where('id', $p->id)->update(['status' => 'Gagal']);
                } else {
                    DB::table('antrian_kaje')->where('id', $p->id)->update(['status' => 'Menunggu']); // DOR LAGI!
                }
            }
        }
    }
}
