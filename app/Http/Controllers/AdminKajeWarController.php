<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Throwable;

class AdminKajeWarController extends Controller
{
    public function index()
    {
        $antrean = DB::table('antrian_kaje')
            ->leftJoin('transaksi', 'antrian_kaje.ref_id', '=', 'transaksi.ref_id')
            ->select('antrian_kaje.*', 'transaksi.sn as cctv_log', 'transaksi.harga', 'transaksi.kode_layanan as sku')
            ->orderBy('antrian_kaje.id', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('Admin/KajeWar', [
            'initialQueue' => $antrean,
            'stats' => [
                'pending' => $antrean->where('status', 'Menunggu')->count(),
                'processing' => $antrean->where('status', 'Proses_API')->count(),
                'success' => $antrean->where('status', 'Sukses')->count(),
            ]
        ]);
    }

    public function getLogs()
    {
        try {
            $logPath = storage_path('logs/laravel.log');
            if (!File::exists($logPath)) return response()->json(['logs' => 'File log belum ada.']);
            
            // Ambil 30 baris terakhir yang relevan
            $command = "tail -n 100 $logPath | grep -E 'WAR|WEBHOOK|KAJE|DIGIFLAZZ' | tail -n 30";
            $logs = shell_exec($command);
            return response()->json(['logs' => $logs ?: "System Standby..."]);
        } catch (Throwable $e) {
            return response()->json(['logs' => 'Gagal memuat log.']);
        }
    }

    public function pollStatus()
    {
        Artisan::call('war:kaje');
        return back()->with('success', 'Bot Berhasil Dijalankan!');
    }

    public function updateStatus(Request $request)
    {
        $id = $request->id;
        $action = $request->action;
        $antrean = DB::table('antrian_kaje')->where('id', $id)->first();

        if (!$antrean) return back();

        DB::beginTransaction();
        try {
            if ($action === 'retry') {
                DB::table('antrian_kaje')->where('id', $id)->update(['status' => 'Menunggu', 'updated_at' => now()]);
                DB::table('transaksi')->where('ref_id', $antrean->ref_id)->update(['status' => 'Pending', 'sn' => 'RETRY-ADMIN']);
            } elseif ($action === 'success') {
                DB::table('antrian_kaje')->where('id', $id)->update(['status' => 'Sukses']);
                DB::table('transaksi')->where('ref_id', $antrean->ref_id)->update(['status' => 'Sukses']);
            } elseif ($action === 'failed') {
                $trx = DB::table('transaksi')->where('ref_id', $antrean->ref_id)->first();
                if ($trx && !in_array($trx->status, ['Sukses', 'Gagal', 'Batal'])) {
                    DB::table('users')->where('name', $antrean->username)->increment('saldo', $trx->harga);
                }
                DB::table('antrian_kaje')->where('id', $id)->update(['status' => 'Gagal']);
                DB::table('transaksi')->where('ref_id', $antrean->ref_id)->update(['status' => 'Gagal']);
            }
            DB::commit();
            return back();
        } catch (Throwable $e) {
            DB::rollBack();
            return back();
        }
    }
}
