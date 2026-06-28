<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Services\DigiflazzService;

class SyncDigiflazzManual extends Command
{
    protected $signature = 'digi:sync';
    protected $description = 'Sync produk Digiflazz anti-error';

    public function handle(DigiflazzService $digi)
    {
        $this->info("Menghubungkan ke Digiflazz...");
        $res = $digi->getPriceList();

        // VALIDASI: Pastikan data adalah array produk, bukan pesan error (string)
        if (!$res || !isset($res['data']) || is_string($res['data'])) {
            $msg = is_string($res['data'] ?? null) ? $res['data'] : 'Respon kosong/API Key Salah';
            $this->error("API ERROR: " . $msg);
            return;
        }

        $this->info("Ditemukan " . count($res['data']) . " produk. Memulai...");
        $upsertData = [];
        $now = now();

        foreach ($res['data'] as $p) {
            // Fix Error 10.12: Pastikan $p adalah array
            if (!is_array($p) || !isset($p['buyer_sku_code'])) continue;

            $upsertData[] = [
                'kode_layanan' => $p['buyer_sku_code'],
                'provider'     => $p['brand'] ?? 'Unknown',
                'nama_layanan' => $p['product_name'] ?? 'Tanpa Nama',
                'harga_beli'   => $p['price'] ?? 0,
                'harga_jual'   => ($p['price'] ?? 0) + 1000,
                'tipe'         => strtolower($p['category'] ?? 'umum'),
                'status'       => ($p['seller_product_status'] ?? false) ? 'active' : 'inactive',
                'sumber_api'   => 'digiflazz',
                'created_at'   => $now,
                'updated_at'   => $now,
            ];
        }

        foreach (array_chunk($upsertData, 200) as $chunk) {
            // Fix Error 10.16: Upsert akan mencocokkan kode_layanan yang sudah UNIQUE
            DB::table('layanan')->upsert(
                $chunk,
                ['kode_layanan'],
                ['harga_beli', 'status', 'nama_layanan', 'updated_at']
            );
        }

        $this->info("Sync Digiflazz Berhasil!");
    }
}
