<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// Ganti logika pengecekan prioritas dari "if (!$target_prio)" menjadi "if ($target_prio === null)"
if (strpos($content, 'if (!$target_prio)') !== false) {
    $content = str_replace(
        'if (!$target_prio) {', 
        'if ($target_prio === null) {', 
        $content
    );
    file_put_contents($file, $content);
    echo "✔️ Otak Bot Berhasil Dioperasi! Angka 0 sekarang terbaca sebagai VIP!\n";
} else {
    echo "⚠️ Kodingan sudah diganti sebelumnya atau tidak ditemukan.\n";
}
