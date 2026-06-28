<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TelegramService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class TelegramBotController extends Controller
{
    public function webhook(Request $request)
    {
        $update = $request->all();
        $adminId = TelegramService::getSecret('TELEGRAM_CHAT_ID');

        // 1. MENU KLIK (INLINE BUTTON)
        if (isset($update['callback_query'])) {
            $chatId = $update['callback_query']['message']['chat']['id'];
            $data = $update['callback_query']['data'];
            
            if ($chatId != $adminId) return response()->json(['status' => 'unauthorized']);

            // 🚀 ANTI-TIMEOUT: Tutup koneksi ke Telegram detik ini juga agar bot tidak loading lama
            if (function_exists('fastcgi_finish_request')) {
                response()->json(['status' => 'success'])->send();
                fastcgi_finish_request();
            }

            // Eksekusi Background dimulai
            try {
                if ($data == 'menu_backup_full') {
                    Artisan::call('milastore:backup_full');
                }
                else
                if ($data == 'menu_backup') {
                    Artisan::call('milastore:backup');
                } 
                elseif ($data == 'menu_maint_on') {
                    Artisan::call('down', ['--secret' => 'milastore-admin-bypass']);
                    TelegramService::sendMessage("🚨 *PANIC MODE AKTIF!*\nWebsite MilaStore dilockdown total.\nBypass Link: `https://milastore.cloud/milastore-admin-bypass`");
                } 
                elseif ($data == 'menu_maint_off') {
                    Artisan::call('up');
                    TelegramService::sendMessage("✅ *PANIC MODE MATI!*\nWebsite MilaStore kembali online normal.");
                }
                elseif ($data == 'menu_server') {
                    $load = sys_getloadavg();
                    $disk = @disk_free_space("/") ? round(100 - (disk_free_space("/") / disk_total_space("/") * 100), 2) : 0;
                    $msg = "📊 *STATUS INFRASTRUKTUR SERVER*\n\n🖥️ *CPU Load*: " . $load[0] . "\n💾 *Sisa Disk*: " . $disk . "%\n⚡ *Status Web*: " . (app()->isDownForMaintenance() ? '🔴 OFFLINE' : '🟢 ONLINE');
                    TelegramService::sendMessage($msg);
                }
                elseif ($data == 'menu_keuangan') {
                    $saldoTotal = DB::table('users')->sum('saldo') ?? 0;
                    $trxPending = DB::table('transaksi')->where('status', 'Pending')->count() ?? 0;
                    $trxSuksesHariIni = DB::table('transaksi')->where('status', 'Sukses')->whereDate('updated_at', today())->count() ?? 0;
                    $omzetHariIni = DB::table('transaksi')->where('status', 'Sukses')->whereDate('updated_at', today())->sum('harga') ?? 0;
                    
                    $msg = "💰 *DASHBOARD FINANSIAL MILASTORE*\n\n";
                    $msg .= "💸 *Total Dana Member*: Rp " . number_format($saldoTotal, 0, ',', '.') . "\n";
                    $msg .= "📈 *Omzet Hari Ini*: Rp " . number_format($omzetHariIni, 0, ',', '.') . "\n";
                    $msg .= "✅ *Sukses Hari Ini*: " . $trxSuksesHariIni . " Trx\n";
                    $msg .= "⏳ *Antrean Pending*: " . $trxPending . " Trx\n";
                    TelegramService::sendMessage($msg);
                }
                elseif ($data == 'menu_sniper_on') {
                    Cache::put('khfy_sniper_mode', 'on');
                    TelegramService::sendMessage("🔥 *RADAR SNIPER KHFY: ON!*\nMesin otomatis aktif memindai sisa_slot!");
                }
                elseif ($data == 'menu_sniper_off') {
                    Cache::put('khfy_sniper_mode', 'off');
                    TelegramService::sendMessage("💤 *RADAR SNIPER KHFY: OFF!*\nMesin ditidurkan. Tidak ada tembakan PO.");
                }
            } catch (\Exception $e) {
                TelegramService::sendMessage("⚠️ *CRASH EXECUTION*:\n`" . $e->getMessage() . "`");
            }
            
            // Fallback response jika fastcgi_finish_request tidak jalan
            return response()->json(['status' => 'success']);
        }

        // 2. MENU TEXT (/admin atau /start)
        if (isset($update['message'])) {
            $chatId = $update['message']['chat']['id'];
            $text = $update['message']['text'] ?? '';

            if ($chatId == $adminId && ($text == '/start' || $text == '/admin')) {
                $keyboard = [
                    [
                        ['text' => '💰 Keuangan', 'callback_data' => 'menu_keuangan'],
                        ['text' => '🗄️ Backup DB', 'callback_data' => 'menu_backup'], ['text' => '📦 Backup Full Code', 'callback_data' => 'menu_backup_full']
                    ],
                    [
                        ['text' => '🔥 Sniper ON', 'callback_data' => 'menu_sniper_on'],
                        ['text' => '💤 Sniper OFF', 'callback_data' => 'menu_sniper_off']
                    ],
                    [
                        ['text' => '📊 Status Server', 'callback_data' => 'menu_server'],
                        ['text' => '🚨 PANIC MODE', 'callback_data' => 'menu_maint_on']
                    ],
                    [
                        ['text' => '✅ MATIKAN PANIC MODE', 'callback_data' => 'menu_maint_off']
                    ]
                ];
                $msg = "🦅 *MILASTORE COMMAND CENTER V12 (FINAL)* 🦅\n\nSelamat datang, Sultan. Semua sistem telah bersih dan online. Silakan berikan instruksi:";
                TelegramService::sendMessage($msg, $keyboard, true);
            }
        }
        return response()->json(['status' => 'ok']);
    }
}
