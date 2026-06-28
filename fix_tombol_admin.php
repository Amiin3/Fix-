<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// Kita buat fungsi toggle status yang beneran nulis ke tabel settings
$new_toggle = 'public function warToggle(\Illuminate\Http\Request $request) {
    $status = $request->status; // Mulai atau Stop
    \Illuminate\Support\Facades\DB::table("settings")
        ->updateOrInsert(["key" => "war_status"], ["value" => $status, "updated_at" => now()]);
    
    return response()->json(["status" => "success", "new_status" => $status]);
}';

// Ganti fungsi lama (jika ada) atau tambahkan jika belum ada
if (strpos($content, 'public function warToggle') !== false) {
    $content = preg_replace('/public function warToggle\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_toggle . "\n", $content);
}

file_put_contents($file, $content);
echo "✔️ TOMBOL ADMIN SUDAH DISOLDER ULANG KE DATABASE!";
