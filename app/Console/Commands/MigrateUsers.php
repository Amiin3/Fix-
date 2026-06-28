<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateUsers extends Command
{
    protected $signature = 'migrate:users {file : Path file CSV-nya}';
    protected $description = 'Migrasi data user lama ke database baru';

    public function handle()
    {
        $file = $this->argument('file');
        if (!file_exists($file)) {
            $this->error("❌ Gagal: File $file tidak ditemukan di server!");
            return;
        }

        $handle = fopen($file, "r");
        // Deteksi pemisah (koma atau titik koma)
        $firstLine = fgets($handle);
        $delimiter = strpos($firstLine, ';') !== false ? ';' : ',';
        rewind($handle);

        $header = fgetcsv($handle, 1000, $delimiter); 
        if (!$header) {
            $this->error("❌ Gagal membaca header kolom CSV.");
            return;
        }

        // Bersihkan nama kolom dari spasi atau tanda kutip sisa
        $header = array_map(function($val) {
            return trim(str_replace('"', '', $val));
        }, $header);

        $col = array_flip($header);
        $count = 0;
        $skipped = 0;

        $this->info("🚀 Memulai Migrasi Data User...");

        while (($data = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
            // Pastikan tidak ada array undefined
            $email = isset($col['email']) && isset($data[$col['email']]) ? trim($data[$col['email']]) : null;
            if (!$email) continue;

            $exists = DB::table('users')->where('email', $email)->first();

            if (!$exists) {
                DB::table('users')->insert([
                    'name' => isset($col['name']) ? $data[$col['name']] : (isset($col['username']) ? $data[$col['username']] : 'User'),
                    'email' => $email,
                    'password' => isset($col['password']) ? $data[$col['password']] : bcrypt('12345678'),
                    // SULAP BALANCE JADI SALDO
                    'saldo' => isset($col['balance']) ? (float)$data[$col['balance']] : 0, 
                    'level' => isset($col['level']) ? $data[$col['level']] : 'Member',
                    'status' => 'aktif',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $count++;
                $this->line("✅ Berhasil: $email (Saldo: " . (isset($col['balance']) ? $data[$col['balance']] : 0) . ")");
            } else {
                $skipped++;
            }
        }
        fclose($handle);
        $this->info("🎉 MIGRASI SELESAI!");
        $this->info("Total Berhasil: $count user.");
        $this->info("Total Dilewati (Sudah ada): $skipped user.");
    }
}
