<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Services\TelegramService;

class TestTelegram extends Command {
    protected $signature = 'telegram:test';
    public function handle() {
        TelegramService::sendMessage("✅ *Koneksi Berhasil!* \nSistem MilaStore sudah terhubung ke HP Komandan.");
        $this->info('Pesan tes dikirim! Cek Telegram Abang.');
    }
}
