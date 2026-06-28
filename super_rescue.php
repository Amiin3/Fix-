<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// 1. Bersihkan sisa-sisa set_time_limit yang bikin double kurung
$content = preg_replace(
    '/public function warExecute\(.*\)[\s\n]*\{[\s\n]*set_time_limit\(60\);[\s\n]*\{/',
    'public function warExecute(\Illuminate\Http\Request $request) { set_time_limit(60);',
    $content
);

// 2. Bersihkan sisa-sisa usleep yang bikin double kurung di foreach
$content = preg_replace(
    '/foreach\s*\(\$antrean_target\s*as\s*\$target\)[\s\n]*\{[\s\n]*usleep\(1000000\);[\s\n]*\{/',
    'foreach ($antrean_target as $target) { usleep(1000000);',
    $content
);

// 3. Pastikan tidak ada kurung penutup yang hilang di akhir script (antisipasi tail error)
$content = rtrim($content);
if (substr($content, -1) !== '}') {
    // Jika tidak diakhiri kurung tutup, jangan dipaksa dulu, takut malah nambah error
}

file_put_contents($file, $content);
echo "✔️ OPERASI BERHASIL! Mencoba cek kesehatan kodingan...\n";
passthru("php -l $file");
