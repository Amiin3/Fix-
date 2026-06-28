<?php
$file = 'app/Http/Controllers/WebhookKhfyController.php';
$content = file_get_contents($file);

// Kita cari bagian update transaksi dan selipkan update antrian_po tepat di bawahnya
$search = "DB::table('transaksi')->where('id', \$trx->id)->update([";
$replace = "
                // 🔥 UPDATE RADAR PO ADMIN (SINKRONISASI)
                DB::table('antrian_po')->where('ref_id', \$ref_id)->update([
                    'status' => \$final_status,
                    'updated_at' => now()
                ]);

                DB::table('transaksi')->where('id', \$trx->id)->update([";

$content = str_replace($search, $replace, $content);

file_put_contents($file, $content);
echo "✔️ WEBHOOK ASLI BERHASIL DISINKRONKAN KE RADAR PO!\n";
