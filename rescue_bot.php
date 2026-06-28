<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// 1. Hapus double kurung yang bikin error 500
$content = str_replace(
    ") { set_time_limit(60); // Kasih waktu 1 menit per siklus\n    {", 
    ") { set_time_limit(60);", 
    $content
);

// 2. Jika masih ada sisa-sisa double { dari percobaan sebelumnya
$content = preg_replace('/\) \{ set_time_limit\(60\); \/\/.*\n\s*\{/', ') { set_time_limit(60);', $content);

file_put_contents($file, $content);
echo "✔️ SYNTAX ERROR FIXED! Pintu Markas Admin Terbuka Lagi!\n";
