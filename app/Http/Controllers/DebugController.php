<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\{DB, Schema, File, Artisan};
use Inertia\Inertia;

class DebugController extends Controller
{
    public function index()
    {
        // 1. SCAN KESEHATAN TABEL & KOLOM
        $tableStatus = [];
        $tables = ['users', 'layanan', 'layanan_khfy', 'layanan_kaje', 'orders'];
        foreach ($tables as $t) {
            $exists = Schema::hasTable($t);
            $tableStatus[$t] = [
                'exists' => $exists,
                'count' => $exists ? DB::table($t)->count() : 0,
                // Cek kolom krusial yang sering bikin blank putih
                'has_provider' => $exists ? Schema::hasColumn($t, 'provider') : false,
                'has_sumber' => $exists ? Schema::hasColumn($t, 'sumber') : false,
            ];
        }

        // 2. DETEKSI PRODUK RUSAK (Biang Kerok Blank Putih)
        $badProducts = [];
        if (Schema::hasTable('layanan')) {
            $badProducts = DB::table('layanan')
                ->whereNull('provider')
                ->orWhere('provider', '')
                ->orWhereNull('tipe')
                ->select('id', 'nama_layanan', 'kode_layanan')
                ->limit(10)->get();
        }

        // 3. ULTIMATE LOG PARSER (Cari Kepala Error)
        $logPath = storage_path('logs/laravel.log');
        $parsedLogs = [];
        if (File::exists($logPath)) {
            $content = File::get($logPath);
            // Ambil blok error menggunakan regex agar dapet pesan utamanya
            preg_match_all('/\[\d{4}-\d{2}-\d{2}.*?\].*?\.ERROR: (.*?) \{/s', $content, $matches);
            if (!empty($matches[1])) {
                $parsedLogs = array_slice(array_reverse($matches[1]), 0, 15);
            }
        }

        return Inertia::render('Admin/Debug', [
            'tables' => $tableStatus,
            'badProducts' => $badProducts,
            'logs' => $parsedLogs,
            'env' => [
                'php' => PHP_VERSION,
                'laravel' => app()->version(),
                'debug_mode' => config('app.debug') ? 'ON (Rawan)' : 'OFF (Aman)',
                'url' => config('app.url'),
            ]
        ]);
    }

    public function clearAll()
    {
        Artisan::call('optimize:clear');
        Artisan::call('view:clear');
        return back()->with('success', 'Sistem Segar Kembali!');
    }
}
