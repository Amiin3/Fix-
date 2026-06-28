<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// 1. PERBAIKI LOGIKA PRIORITAS (Fix Bug Angka 0)
$content = str_replace('if (!$target_prio) {', 'if ($target_prio === null) {', $content);

// 2. PASANG "COOLING SYSTEM" PADA LOOP PENEMBAKAN
// Kita cari bagian foreach yang menembak ke API Khfy
if (strpos($content, 'foreach ($antrean_target as $target)') !== false) {
    // Tambahkan jeda 1 detik (1000000 microsecond) di tiap awal loop
    $content = str_replace(
        'foreach ($antrean_target as $target) {',
        'foreach ($antrean_target as $target) { usleep(1000000); // Jeda 1 detik agar tidak kedetek DDoS',
        $content
    );
}

// 3. FIX LOGIKA "R" (RATE LIMIT) - JANGAN SPAM, TAPI ISTIRAHAT
// Kita cari bagian return error yang tadi bikin bot "stuck"
$content = preg_replace(
    '/return response\(\)->json\(\[\'status\' => \'error\', \'log\' => "\[P(.*)\] Gagal \(\$body\)\. SPAM ULANG!"\]\);/',
    'sleep(3); return response()->json([\'status\' => \'error\', \'log\' => "⚠️ RATE LIMIT DETECTED! Tiarap 3 detik biar aman..."]);',
    $content
);

// 4. PREVENT TIMEOUT (PENTING!)
// Pastikan script punya waktu lebih lama untuk bernapas
if (strpos($content, 'public function warExecute') !== false) {
    $content = str_replace(
        'public function warExecute(\Illuminate\Http\Request $request)',
        'public function warExecute(\Illuminate\Http\Request $request) { set_time_limit(60); // Kasih waktu 1 menit per siklus',
        $content
    );
}

file_put_contents($file, $content);
echo "✔️ MESIN GATLING GUN SUDAH DI-UPGRADE KE VERSI STABIL (V2)!\n";
