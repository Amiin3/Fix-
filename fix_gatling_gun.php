<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// 1. Perbaiki Logika Prioritas 0 (Agar tidak dianggap kosong)
$content = str_replace('if (!$target_prio) {', 'if ($target_prio === null) {', $content);

// 2. Tambahkan Jeda Antar Tembakan (Peredam Suara)
// Kita cari bagian Loop penembakan (biasanya setelah ambil data antrean)
// Kita sisipkan usleep(500000); // Jeda 0.5 detik tiap tembakan agar provider tidak kaget
if (strpos($content, 'foreach ($antrean_target as $target)') !== false) {
    $content = str_replace(
        'foreach ($antrean_target as $target) {',
        'foreach ($antrean_target as $target) { usleep(500000); // Cooling System 0.5s',
        $content
    );
}

// 3. Tangani Respon "R" (Rate Limit) dengan Elegan
// Jika dapet "R", jangan SPAM ULANG instan, tapi tidur dulu 2 detik!
$content = str_replace(
    'return response()->json([\'status\' => \'error\', \'log\' => "[P{$target_prio}] Gagal ($body). SPAM ULANG!"]);',
    'sleep(2); return response()->json([\'status\' => \'error\', \'log\' => "⚠️ RATE LIMIT! Cooling Down 2s..."]);',
    $content
);

file_put_contents($file, $content);
echo "✔️ Gatling Gun Berhasil Dipasang Peredam & Cooling System!\n";
