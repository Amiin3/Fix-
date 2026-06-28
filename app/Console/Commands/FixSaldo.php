<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixSaldo extends Command
{
    protected $signature = 'fix:saldo {file : Path file CSV-nya}';
    protected $description = 'Memperbaiki saldo user yang gagal masuk saat migrasi';

    public function handle()
    {
        $file = $this->argument('file');
        if (!file_exists($file)) {
            $this->error("❌ Gagal: File $file tidak ditemukan!");
            return;
        }

        $handle = fopen($file, "r");
        
        // Deteksi pemisah
        $firstLine = fgets($handle);
        $delimiter = strpos($firstLine, ';') !== false ? ';' : ',';
        rewind($handle);

        $header = fgetcsv($handle, 1000, $delimiter); 
        
        // Bersihkan nama kolom jadi huruf KECIL semua biar gampang dicari
        $header = array_map(function($val) {
            return strtolower(trim(str_replace('"', '', $val)));
        }, $header);

        $col = array_flip($header);
        $count = 0;

        $this->info("🚀 Memulai Perbaikan Saldo...");

        // Cek apakah ada kolom balance (dengan berbagai variasi ejaan)
        $balanceKey = null;
        if (isset($col['balance'])) $balanceKey = 'balance';
        elseif (isset($col['saldo'])) $balanceKey = 'saldo';
        elseif (isset($col['amount'])) $balanceKey = 'amount';

        if (!$balanceKey) {
            $this->error("❌ GAGAL: Tidak menemukan kolom 'balance' di file CSV Abang. Coba cek lagi nama kolom di baris pertama CSV-nya.");
            return;
        }

        while (($data = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
            $email = isset($col['email']) && isset($data[$col['email']]) ? trim($data[$col['email']]) : null;
            if (!$email) continue;

            // Ambil angka saldo dan bersihkan dari koma/titik ribuan (misal: "1.000.000" jadi "1000000")
            $rawBalance = isset($data[$col[$balanceKey]]) ? $data[$col[$balanceKey]] : 0;
            $cleanBalance = (float) preg_replace('/[^0-9.]/', '', $rawBalance);

            // Update saldo user yang emailnya cocok
            $updated = DB::table('users')
                ->where('email', $email)
                ->update(['saldo' => $cleanBalance]);

            if ($updated) {
                $count++;
                $this->line("✅ Saldo $email diperbarui menjadi: " . number_format($cleanBalance, 0, ',', '.'));
            }
        }
        fclose($handle);
        $this->info("🎉 PERBAIKAN SELESAI! Total $count saldo user berhasil diupdate.");
    }
}
