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
    $logs = [];

    // --- PHASE 1: SCANNER KILAT (TETAP JALAN BUAT BERESIN STATUS GANTUNG) ---
    $nyangkut = $db->table("antrian_po")->whereIn("status", ["Proses_API", "Butuh_Review"])->limit(3)->get();
    foreach ($nyangkut as $item) {
        try {
            $res_cek = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->connectTimeout(3)->timeout(5)
                ->get("{$khfy_url}/history?api_key={$api_key}&refid={$item->ref_id}");
            
            if ($res_cek->successful()) {
                $data_cek = $res_cek->json();
                if (isset($data_cek["status"]) && $data_cek["status"] == 1) { 
                    $db->table("antrian_po")->where("id", $item->id)->update(["status" => "Sukses", "error_count" => 0]);
                    $db->table("transaksi")->where("ref_id", $item->ref_id)->update(["status" => "Sukses", "sn" => $data_cek["sn"] ?? "OK_SCAN"]);
                    $logs[] = "🔍 [FIX] {$item->tujuan} DONE!";
                }
            }
        } catch (\Exception $e) { } 
    }

    // --- REM LIMIT SUDAH DICABUT! BOT LANGSUNG TEMBAK MEMBABI BUTA! ---

    // --- PHASE 2: THE BERSERKER SHOOTER ---
    $target_prio = $db->table("antrian_po")->where("status", "Menunggu")->min("prioritas");
    if ($target_prio === null && count($logs) == 0) return response()->json(["status" => "success", "log" => "📡 RADAR BERSIH."]);

    // Hajar 2 request sekaligus per putaran tanpa peduli slot pending!
    $antrean_target = $db->table("antrian_po")->where("status", "Menunggu")->where("prioritas", $target_prio)->limit(2)->get();

    foreach ($antrean_target as $target) {
        usleep(500000); // Jeda ngebut 0.5 detik biar rapat tembakannya
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            $final_url = "{$khfy_url}/trx?produk={$target->kode_produk}&tujuan={$target->tujuan}&reff_id={$target->ref_id}&api_key={$api_key}";
            
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->connectTimeout(5)->timeout(25)
                ->get($final_url);

            if ($response->serverError()) {
                throw new \Exception("502_BAD_GATEWAY");
            }

            $res = $response->json();
            $msg = $res["msg"] ?? "Unknown";

            if (isset($res["status"]) && $res["status"] == true) {
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses", "error_count" => 0]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Sukses", "sn" => $res["sn"] ?? "SUCCESS"]);
                $logs[] = "🚀 {$target->tujuan} OK!";
            } else {
                // 🎯 KATEGORI 1: BODY ERROR (3-STRIKE LOGIC)
                if ($msg === "HTTP_CLIENT_RESPONSE_BODY_ERR") {
                    $new_count = $target->error_count + 1;
                    if ($new_count >= 3) {
                        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Butuh_Review", "error_count" => $new_count]);
                        $logs[] = "⚠️ {$target->tujuan} STRIKE 3! Geser ke Review.";
                    } else {
                        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu", "error_count" => $new_count]);
                        $logs[] = "♻️ {$target->tujuan} ERR ({$new_count}/3). Re-queue.";
                    }
                } 
                // 🎯 KATEGORI 2: LIMIT PENDING / STOK HABIS / R / Timeout
                // Jika Khfy teriak "Limit TRX pending", bot tangkap di sini dan langsung ulang!
                elseif (str_contains(strtolower($msg), "stock") || str_contains(strtolower($msg), "pending") || str_contains(strtolower($msg), "limit") || $msg === "R" || str_contains(strtolower($msg), "timeout")) {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "🔥 {$target->tujuan} TERBENTUR ($msg). HAJAR LAGI!";
                } 
                // 🎯 KATEGORI 3: GAGAL PERMANEN
                elseif (str_contains(strtolower($msg), "masih terdaftar") || str_contains(strtolower($msg), "salah")) {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Gagal", "sn" => $msg]);
                    $logs[] = "❌ {$target->tujuan} GAGAL.";
                } else {
                    $logs[] = "⏳ {$target->tujuan} PENDING... (Digedor terus)";
                }
            }
        } catch (\Exception $e) {
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "🚨 SERVER DOWN! Re-queue kilat...";
            sleep(2); // Istirahat tipis 2 detik aja biar cepet balik nyerang
            break; 
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ OTAK V11 BERSERKER (TANPA REM LIMIT) SIAP MEMBANTAI!\n";
