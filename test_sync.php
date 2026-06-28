<?php
try {
    echo "⏳ Mengontak API Digiflazz...\n";
    $digi = app(\App\Services\DigiflazzService::class);
    $res = $digi->priceList();
    
    if(!isset($res['success']) || !$res['success']) {
        echo "❌ GAGAL API: " . json_encode($res) . "\n";
    } else {
        $items = $res['data'];
        echo "📦 Dapat " . count($items) . " produk dari API. Mencoba insert ke DB...\n";
        
        $count = 0;
        foreach ($items as $item) {
            if (!isset($item['buyer_sku_code'])) continue;
            
            $sku = $item['buyer_sku_code'];
            $price = (int)($item['price'] ?? 0);
            $status = ($item['buyer_product_status'] == 1 && $item['seller_product_status'] == 1) ? 'active' : 'inactive';
            
            $exist = DB::table('layanan')->where('kode_layanan', $sku)->first();
            $profit = $exist ? ((int)$exist->harga_jual - (int)$exist->harga_beli) : 500;
            if ($profit < 0) $profit = 500;

            DB::table('layanan')->updateOrInsert(
                ['kode_layanan' => $sku],
                [
                    'nama_layanan' => substr($item['product_name'] ?? 'Produk Digiflazz', 0, 200),
                    'provider'     => substr($item['brand'] ?? 'Lainnya', 0, 100),
                    'harga_beli'   => $price,
                    'harga_jual'   => $price + $profit,
                    'tipe'         => substr($item['category'] ?? 'Umum', 0, 100),
                    'status'       => $status,
                    'kelompok_id'  => $exist ? $exist->kelompok_id : 0,
                    'updated_at'   => now()
                ]
            );
            $count++;
        }
        echo "✅ SUKSES! " . $count . " produk berhasil di-sync ke tabel layanan.\n";
    }
} catch (\Exception $e) {
    echo "\n🚨 ERROR FATAL DITEMUKAN:\n";
    echo "Pesan: " . $e->getMessage() . "\n";
    echo "Baris: " . $e->getLine() . "\n";
}
