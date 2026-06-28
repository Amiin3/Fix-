<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\AdminKhfyController;
use Illuminate\Http\Request;

class WarKhfyDaemon extends Command
{
    protected $signature = 'khfy:war';
    protected $description = 'Daemon Sniper War PO Khfy 24/7';

    public function handle()
    {
        $controller = new AdminKhfyController();
        $this->info("========================================");
        $this->info(" 🚀 MESIN SNIPER WAR KHFY AKTIF 24/7! 🚀");
        $this->info("========================================");
        
        while(true) {
            try {
                $response = $controller->warExecute(new Request());
                $data = json_decode($response->getContent(), true);
                $log = $data['log'] ?? 'Menunggu...';
                
                if (!str_contains($log, 'RADAR BERSIH') && !str_contains($log, 'LIMIT 2/2 PENUH')) {
                    $this->info("[" . date('H:i:s') . "] " . $log);
                }
            } catch (\Exception $e) {
                $this->error("[" . date('H:i:s') . "] ERROR ENGINE: " . $e->getMessage());
            }
            sleep(2);
        }
    }
}
