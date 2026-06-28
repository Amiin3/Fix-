<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

$new_execute = 'public function warExecute(\Illuminate\Http\Request $request) {
    // 1. TAHAN BANTING: Waktu eksekusi script dilonggarkan agar tidak mati di tengah jalan
    set_time_limit(120);
    $db = \Illuminate\Support\Facades\DB::connection();
    
    $status = $db->table("settings")->where("key", "war_status")->value("value");
    if ($status !== "Mulai") return response()->json(["status" => "stopped", "log" => "🔴 SISTEM MATI."]);

    $khfy_url = env("KHFY_URL", "https://panel.khfy-store.com/api_v2");
    $api_key = env("KHFY_API_KEY");
    $logs = [];

    // --- PHASE 1: SCANNER KILAT (PEMBERSIH JALUR) ---
    $nyangkut = $db->table("antrian_po")->whereIn("status", ["Proses_API", "Butuh_Review"])->limit(3)->get();
    foreach ($nyangkut as $item) {
        try {
            // connectTimeout(3) = Kalau 3 detik provider gak respon, tinggalin!
            $res_cek = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->connectTimeout(3)->timeout(10)
                ->get("{$khfy_url}/history?api_key={$api_key}&refid={$item->ref_id}");
            
            if ($res_cek->successful()) {
                $data_cek = $res_cek->json();
                if (isset($data_cek["status"]) && $data_cek["status"] == 1) { 
                    $db->table("antrian_po")->where("id", $item->id)->update(["status" => "Sukses", "error_count" => 0]);
                    $db->table("transaksi")->where("ref_id", $item->ref_id)->update(["status" => "Sukses", "sn" => $data_cek["sn"] ?? "OK_SCAN"]);
                    $logs[] = "🔍 [FIX] {$item->tujuan} DONE!";
                }
            }
        } catch (\Exception $e) { } // Abaikan error agar tidak ganggu proses utama
    }

    // --- PHASE 2: LIMIT SLOT (MAKS 2 PENDING DI PROVIDER) ---
    $current_pending = $db->table("antrian_po")->where("status", "Proses_API")->count();
    if ($current_pending >= 2) return response()->json(["status" => "success", "log" => "⏳ SLOT FULL (2/2)"]);

    // --- PHASE 3: THE SHOOTER (ANTI-CRASH LOGIC) ---
    $target_prio = $db->table("antrian_po")->where("status", "Menunggu")->min("prioritas");
    if ($target_prio === null && count($logs) == 0) return response()->json(["status" => "success", "log" => "📡 RADAR BERSIH."]);

    $antrean_target = $db->table("antrian_po")->where("status", "Menunggu")->where("prioritas", $target_prio)->limit(2 - $current_pending)->get();

    foreach ($antrean_target as $target) {
        usleep(1000000); // 1 Detik akselerasi aman
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            $final_url = "{$khfy_url}/trx?produk={$target->kode_produk}&tujuan={$target->tujuan}&reff_id={$target->ref_id}&api_key={$api_key}";
            
            // 🔥 LOGIKA FAIL-FAST: 
            // connectTimeout(5): Jika dalam 5 detik koneksi gagal (Server Down), batalkan!
            // timeout(25): Maksimal nunggu jawaban loading 25 detik.
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()
                ->connectTimeout(5)->timeout(25)
                ->get($final_url);

            // Jika provider mengembalikan halaman Error (502 Bad Gateway / 500)
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
                        $logs[] = "⚠️ {$target->tujuan} STRIKE 3! Butuh Review.";
                    } else {
                        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu", "error_count" => $new_count]);
                        $logs[] = "♻️ {$target->tujuan} ERR ({$new_count}/3). Antre ulang.";
                    }
                } 
                // 🎯 KATEGORI 2: STOK HABIS / LIMIT SIBUK (R) / Timeout Respon
                elseif (str_contains(strtolower($msg), "stock") || $msg === "R" || str_contains(strtolower($msg), "timeout")) {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "♻️ {$target->tujuan} LIMIT/STOK. GAS TERUS!";
                } 
                // 🎯 KATEGORI 3: GAGAL PERMANEN
                elseif (str_contains(strtolower($msg), "masih terdaftar") || str_contains(strtolower($msg), "salah")) {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Gagal", "sn" => $msg]);
                    $logs[] = "❌ {$target->tujuan} GAGAL.";
                } else {
                    $logs[] = "⏳ {$target->tujuan} PENDING...";
                }
            }
        } catch (\Exception $e) {
            // 🚨 KATEGORI 4: PROVIDER MATI TOTAL / KONEKSI PUTUS 🚨
            // JANGAN STRIKE. JANGAN GAGAL. Kembalikan ke antrean dan amankan server web Bos.
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "🚨 SERVER PROVIDER DOWN! Mengamankan server kita...";
            sleep(4); // CIRCUIT BREAKER: Istirahatkan server Bos 4 detik biar gak ikut jebol
            break; // STOP loop seketika biar request lain gak ikut numpuk!
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ OTAK V10 FULL VERSION (THE JUGGERNAUT) SIAP RILIS!\n";
