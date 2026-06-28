<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// Ganti fungsi warExecute agar benar-benar sakti
$new_execute = 'public function warExecute(\Illuminate\Http\Request $request) {
    set_time_limit(120);
    $db = \Illuminate\Support\Facades\DB::connection();
    
    // CEK STATUS (Sekarang tabel settings sudah ada!)
    $status = $db->table("settings")->where("key", "war_status")->value("value");
    if ($status !== "Mulai") {
        return response()->json(["status" => "stopped", "log" => "🔴 SISTEM MATI."]);
    }

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
        // CEK STOP TIAP LOOP
        if ($db->table("settings")->where("key", "war_status")->value("value") !== "Mulai") break;

        usleep(1500000); // Jeda 1.5 detik
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(10)
                ->get("{$khfy_url}/order?api_key={$api_key}&service={$target->kode_produk}&target={$target->tujuan}&refid={$target->ref_id}");
            
            $res = json_decode($response->body(), true);
            if (isset($res["status"]) && $res["status"] == true) {
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Sukses", "sn" => "WAR SUCCESS"]);
                $logs[] = "🚀 {$target->tujuan} OK!";
            } else {
                $msg = $res["msg"] ?? "Error";
                if ($msg == "R" || $msg == "t") {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "⚠️ LIMIT/TIMEOUT ($msg). TIARAP!";
                    sleep(10); break;
                } else {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $logs[] = "❌ $msg";
                }
            }
        } catch (\Exception $e) {
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "📡 KONEKSI PUTUS!";
            sleep(5); break;
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ CONTROLLER BERHASIL DI-FIX!";
