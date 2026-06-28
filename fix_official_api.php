<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

$new_execute = 'public function warExecute(\Illuminate\Http\Request $request) {
    set_time_limit(120);
    $db = \Illuminate\Support\Facades\DB::connection();
    
    $status = $db->table("settings")->where("key", "war_status")->value("value");
    if ($status !== "Mulai") return response()->json(["status" => "stopped", "log" => "🔴 SISTEM MATI."]);

    $khfy_url = env("KHFY_URL", "https://panel.khfy-store.com/api_v2");
    $api_key = env("KHFY_API_KEY");
    
    $target_prio = $db->table("antrian_po")->where("status", "Menunggu")->min("prioritas");
    if ($target_prio === null) return response()->json(["status" => "success", "log" => "📡 RADAR BERSIH."]);

    $antrean_target = $db->table("antrian_po")
        ->where("status", "Menunggu")
        ->where("prioritas", $target_prio)
        ->limit(2) 
        ->get();

    $logs = [];
    foreach ($antrean_target as $target) {
        if ($db->table("settings")->where("key", "war_status")->value("value") !== "Mulai") break;

        usleep(1500000); // Jeda 1.5 detik
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            // --- FIX PARAMETER SESUAI DOKUMENTASI RESMI ---
            // Endpoint: /trx
            // Parameter: produk, tujuan, reff_id (double f)
            $final_url = "{$khfy_url}/trx?produk={$target->kode_produk}&tujuan={$target->tujuan}&reff_id={$target->ref_id}&api_key={$api_key}";
            
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->timeout(30) // Tambah timeout jadi 30 detik agar tidak "Timeout" lagi
                ->get($final_url);
            
            $res = $response->json(); // Khfy membalas JSON

            if (isset($res["status"]) && $res["status"] == true) {
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update([
                    "status" => "Sukses", 
                    "sn" => $res["sn"] ?? "OK-" . ($res["trxid"] ?? "WAR"),
                    "updated_at" => now()
                ]);
                $logs[] = "🚀 [P{$target_prio}] {$target->tujuan} SUKSES!";
            } else {
                $msg = $res["msg"] ?? "Timeout/No Response";
                // Jika Provider membalas limit (R) atau sibuk
                if ($msg == "R" || str_contains(strtolower($msg), "limit") || str_contains(strtolower($msg), "busy")) {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "⚠️ PROVIDER LIMIT ($msg). ANTRI ULANG...";
                    sleep(10); break;
                } else {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Gagal", "sn" => $msg]);
                    $logs[] = "❌ GAGAL: $msg";
                }
            }
        } catch (\Exception $e) {
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "📡 KONEKSI PROVIDER TIMEOUT!";
            sleep(5); break;
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ OTAK BOT SUDAH DISINKRONKAN DENGAN DOKUMENTASI RESMI KHFYPAY!\n";
