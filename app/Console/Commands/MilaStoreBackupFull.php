<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TelegramService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class MilaStoreBackupFull extends Command
{
    protected $signature = 'milastore:backup_full';
    protected $description = 'Disaster Recovery: Link 1x Pakai & Burn After Reading';

    public function handle()
    {
        $chatId = TelegramService::getSecret('TELEGRAM_CHAT_ID');
        $appUrl = rtrim(env('APP_URL', 'https://milastore.cloud'), '/');
        
        $response = TelegramService::sendMessage("🔄 *INITIALIZING VVIP SECURITY BACKUP...*", null, false, $chatId);
        $messageId = $response->json('result.message_id');
        if (!$messageId) return;

        // FRAME 1
        TelegramService::editMessageText($messageId, "⏳ `[██░░░░░░░░] 20%`\n*Mengekstrak Database Utama MilaStore...*");
        
        $dbName = config('database.connections.mysql.database');
        $dbUser = config('database.connections.mysql.username');
        $dbPass = config('database.connections.mysql.password');
        $mysqlPath = file_exists('/www/server/mysql/bin/mysqldump') ? '/www/server/mysql/bin/mysqldump' : '/usr/bin/mysqldump';
        
        $webDir = "/www/wwwroot/milastore.web.id";
        
        // 🔒 Simpan di folder privat yang tidak bisa diakses publik
        $vaultDir = storage_path("app/backup_vault");
        @mkdir($vaultDir, 0755, true);
        $dbFile = $vaultDir . "/Database_Inject.sql";
        
        $cmdDb = "MYSQL_PWD=" . escapeshellarg($dbPass) . " {$mysqlPath} -u" . escapeshellarg($dbUser) . " --single-transaction --quick " . escapeshellarg($dbName) . " > " . escapeshellarg($dbFile) . " 2>&1";
        exec($cmdDb);

        // FRAME 2 & 3
        TelegramService::editMessageText($messageId, "⏳ `[██████░░░░] 60%`\n*Menyatukan Source Code ke Brankas Privat...*");
        
        // Buat nama file dan token unik
        $randomToken = Str::random(40);
        $fileName = "MilaStore_FullSystem_" . date('Ymd_Hi') . "_{$randomToken}.tar.gz";
        $zipFile = $vaultDir . "/" . $fileName;
        
        // Kompresi tanpa menyertakan sampah
        $cmdTar = "cd {$webDir} && tar -czf " . escapeshellarg($zipFile) . " -C {$webDir} --exclude='vendor' --exclude='node_modules' --exclude='.git' --exclude='storage/framework/cache' --exclude='storage/logs' --exclude='storage/app/backup_vault/*' --exclude='*.tar.gz' --exclude='*.sql' --exclude='*.sql.gz' . -C {$vaultDir} Database_Inject.sql 2>&1";
        exec($cmdTar);

        // FRAME 4
        TelegramService::editMessageText($messageId, "⏳ `[████████░░] 80%`\n*Memasang Sistem Hancur Otomatis (Self-Destruct)...*");
        $size = file_exists($zipFile) ? round(filesize($zipFile) / 1024 / 1024, 2) : 0;
        
        // 💣 Simpan Token di Cache, otomatis hangus dalam 1 jam jika tidak diklik
        Cache::put('vault_' . $randomToken, $zipFile, now()->addHours(1));
        
        $downloadLink = $appUrl . "/download-vault/" . $randomToken;

        // FRAME 5
        TelegramService::editMessageText($messageId, "🚀 `[██████████] 100%`\n*Sistem Sukses Diamankan!*");

        // KIRIM PESAN FINAL
        $msg = "🛡️ *DISASTER RECOVERY MILASTORE*\n\n";
        $msg .= "✅ Backup Full System berhasil dikemas!\n";
        $msg .= "💾 Ukuran File: *{$size} MB*\n\n";
        $msg .= "🔗 *LINK DOWNLOAD 1X PAKAI:*\n`{$downloadLink}`\n\n";
        $msg .= "⚠️ *PERINGATAN KEAMANAN TINGKAT TINGGI:*\n";
        $msg .= "_1. Link ini hanya bisa diklik **SATU KALI**.\n2. Begitu diklik, link langsung hangus dan tidak bisa diakses orang lain.\n3. File akan terhapus permanen dari server segera setelah download selesai._";

        TelegramService::sendMessage($msg, null, false, $chatId);

        // Hapus file SQL sementara
        @unlink($dbFile);
    }
}
