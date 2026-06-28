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

    $antrean_target = $db->table("antrian_po")->where("status", "Menunggu")->where("prioritas", $target_prio)->limit(2)->get();

    $logs = [];
    foreach ($antrean_target as $target) {
        if ($db->table("settings")->where("key", "war_status")->value("value") !== "Mulai") break;

        usleep(2000000); 
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);
        $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["sn" => "Sedang diproses sistem..."]);

        try {
            $final_url = "{$khfy_url}/trx?produk={$target->kode_produk}&tujuan={$target->tujuan}&reff_id={$target->ref_id}&api_key={$api_key}";
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(30)->get($final_url);
            $res = $response->json();

            if (isset($res["status"]) && $res["status"] == true) {
                // JIKA LANGSUNG SUKSES
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Sukses", "sn" => $res["sn"] ?? "SUCCESS", "updated_at" => now()]);
                $logs[] = "🚀 {$target->tujuan} SUKSES!";
            } else {
                $msg = $res["msg"] ?? "Pending";
                // --- LOGIKA ANTI-RUGI ---
                // Jika pesan mengandung kata "Nomor Salah" atau "Produk Tidak Ada", baru Gagal.
                // Selain itu, biarkan statusnya "Proses_API" (Menunggu Webhook).
                $gagal_permanen = ["salah", "tidak tersedia", "kosong", "gangguan", "bukan"];
                $is_gagal = false;
                foreach ($gagal_permanen as $kata) {
                    if (str_contains(strtolower($msg), $kata)) { $is_gagal = true; break; }
                }

                if ($is_gagal) {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Gagal", "sn" => "GAGAL: $msg"]);
                    $logs[] = "❌ GAGAL PERMANEN: $msg";
                } else {
                    // JANGAN DITEBAS GAGAL! Biarkan Proses_API biar Webhook yang selesaikan.
                    $logs[] = "⏳ {$target->tujuan} PENDING (Menunggu Webhook)...";
                }
            }
        } catch (\Exception $e) {
            // JIKA TIMEOUT, biarkan tetap Proses_API atau balikkan ke Menunggu
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "📡 TIMEOUT/KONEKSI LEMAH.";
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ SISTEM ANTI-RUGI AKTIF! Bot tidak akan asal tebas Gagal lagi!\n";
