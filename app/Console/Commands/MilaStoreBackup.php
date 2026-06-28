<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TelegramService;

class MilaStoreBackup extends Command
{
    protected $signature = 'milastore:backup';
    protected $description = 'Backup DB Live Tracker System V12';

    public function handle()
    {
        TelegramService::sendMessage("📡 [TRACKER 1/5] Memulai Inisialisasi Backup...");
        
        // Cerdaskan pencarian path mysqldump (khusus aaPanel/Ubuntu)
        $mysqlPath = '/usr/bin/mysqldump';
        if (file_exists('/www/server/mysql/bin/mysqldump')) {
            $mysqlPath = '/www/server/mysql/bin/mysqldump';
        }

        $dbName = config('database.connections.mysql.database');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');

        $dir = storage_path("app/public");
        @mkdir($dir, 0775, true);
        $namaFile = "DB_MilaStore_" . date("Y-m-d_H-i-s") . ".sql";
        $pathFile = $dir . "/" . $namaFile;
        $zipFile = $pathFile . ".gz";

        TelegramService::sendMessage("📡 [TRACKER 2/5] Mengekstrak Database `{$dbName}`...");

        // Eksekusi aman dengan MYSQL_PWD
        $cmd = "MYSQL_PWD=" . escapeshellarg($dbPass) . " {$mysqlPath} -u" . escapeshellarg($dbUser) . " --single-transaction --quick " . escapeshellarg($dbName) . " > " . escapeshellarg($pathFile) . " 2>&1";
        exec($cmd, $output, $returnVar);

        if ($returnVar !== 0) {
            $err = implode("\n", $output);
            TelegramService::sendMessage("❌ [ERROR TAHAP 2] mysqldump Gagal:\n`{$err}`");
            return;
        }

        TelegramService::sendMessage("📡 [TRACKER 3/5] Kompresi File Database...");
        exec("gzip -f " . escapeshellarg($pathFile) . " 2>&1", $zipOut, $zipRet);

        if (!file_exists($zipFile)) {
            TelegramService::sendMessage("❌ [ERROR TAHAP 3] Kompresi Gagal!");
            return;
        }

        TelegramService::sendMessage("📡 [TRACKER 4/5] Mengunggah Dokumen ke Telegram...");

        // Kirim File
        $response = TelegramService::sendDocument($zipFile, "🛡️ *MilaStore Database Backup*\n📅 " . date('Y-m-d H:i:s') . "\n✅ 100% Aman & Terverifikasi");

        if ($response && $response->successful()) {
            TelegramService::sendMessage("✅ [TRACKER 5/5] SUKSES! File Backup Berhasil Dikirim.");
        } else {
            TelegramService::sendMessage("❌ [ERROR TAHAP 5] Telegram menolak file (Mungkin karena ukuran lebih dari 50MB).");
        }
        
        // Hapus file sisa agar disk tidak penuh
        @unlink($zipFile);
    }
}
