<?php
$file = 'app/Http/Controllers/RiwayatController.php';
$content = file_get_contents($file);

// Kita cari baris tempat return Inertia::render berada
$search = "return Inertia::render('Riwayat/Index'";

$filter_code = <<<CODE
// --- FILTER WHITE-LABEL AMIFISTORE ---
        if (isset(\$transactions)) {
            \$transactions->getCollection()->transform(function (\$trx) {
                \$terlarang = ['KHFYPAY', 'Khfypay', 'khfypay', 'KHFY', 'khfy', 'KAJE', 'kaje', 'DIGIFLAZZ', 'digiflazz'];
                
                // Sensor semua kolom yang berpotensi memunculkan nama provider
                if(isset(\$trx->provider)) \$trx->provider = str_ireplace(\$terlarang, 'SISTEM', \$trx->provider);
                if(isset(\$trx->provider_name)) \$trx->provider_name = str_ireplace(\$terlarang, 'SISTEM', \$trx->provider_name);
                if(isset(\$trx->nama_layanan)) \$trx->nama_layanan = str_ireplace(\$terlarang, 'SISTEM', \$trx->nama_layanan);
                if(isset(\$trx->tipe)) \$trx->tipe = str_ireplace(\$terlarang, 'SISTEM', \$trx->tipe);
                if(isset(\$trx->sn)) \$trx->sn = str_ireplace(\$terlarang, 'SISTEM', \$trx->sn);
                
                return \$trx;
            });
        }
        // -------------------------------------

        return Inertia::render('Riwayat/Index'
CODE;

// Suntikkan kodenya jika belum ada
if (strpos($content, '// --- FILTER WHITE-LABEL AMIFISTORE ---') === false) {
    $new_content = str_replace($search, $filter_code, $content);
    file_put_contents($file, $new_content);
    echo "✅ Filter berhasil disuntikkan ke RiwayatController!\n";
} else {
    echo "⚠️ Filter sudah terpasang sebelumnya.\n";
}
