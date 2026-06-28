<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// Kita buat satu fungsi toggle yang SANGAT SEDERHANA tapi AMPUH
$final_toggle = 'public function warToggle(\Illuminate\Http\Request $request) {
    $status = $request->status ?? "Stop";
    \Illuminate\Support\Facades\DB::table("settings")
        ->updateOrInsert(["key" => "war_status"], ["value" => $status]);
    return response()->json(["status" => "success", "new_status" => $status]);
}';

// Hapus fungsi toggle lama yang mungkin namanya bentrok
$content = preg_replace('/public function toggle\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', '', $content);
$content = preg_replace('/public function warToggle\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', '', $content);

// Sisipkan fungsi baru di sebelum kurung penutup terakhir
$content = substr($content, 0, strrpos($content, '}')) . "\n" . $final_toggle . "\n}";

file_put_contents($file, $content);
echo "✔️ Tombol Admin sudah disolder ulang secara total!\n";
