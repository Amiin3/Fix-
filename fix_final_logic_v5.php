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

        usleep(1500000); // Jeda 1.5 detik agar stabil
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            $final_url = "{$khfy_url}/trx?produk={$target->kode_produk}&tujuan={$target->tujuan}&reff_id={$target->ref_id}&api_key={$api_key}";
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(35)->get($final_url);
            $res = $response->json();

            if (isset($res["status"]) && $res["status"] == true) {
                // ✅ SUKSES TOTAL
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update([
                    "status" => "Sukses", 
                    "sn" => $res["sn"] ?? "SUCCESS", 
                    "updated_at" => now()
                ]);
                $logs[] = "🚀 [P{$target_prio}] {$target->tujuan} SUKSES!";
            } else {
                $msg = $res["msg"] ?? "No Response";

                // 1 & 2: LOGIKA NGOTOT (ORDER ULANG SAMPAI DONE)
                $is_ngotot = (
                    $msg === "HTTP_CLIENT_RESPONSE_BODY_ERR" || 
                    str_contains(strtolower($msg), "stock transaksi habis") ||
                    str_contains(strtolower($msg), "timeout") ||
                    $msg === "R"
                );

                // 3: LOGIKA BATALKAN (GAGAL PERMANEN)
                $is_gagal_permanen = (
                    str_contains(strtolower($msg), "masih terdaftar") ||
                    str_contains(strtolower($msg), "nomor salah") ||
                    str_contains(strtolower($msg), "tidak didukung")
                );

                if ($is_ngotot) {
                    // BALIK KE ANTREAN UNTUK DIULANG TERUS
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "♻️ [P{$target_prio}] {$msg}. ULANGI TERUS!";
                    sleep(2); // Istirahat sebentar biar nggak dianggap DDoS
                } elseif ($is_gagal_permanen) {
                    // GAGAL TOTAL (REFUND KE USER)
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update([
                        "status" => "Gagal", 
                        "sn" => "GAGAL: $msg",
                        "updated_at" => now()
                    ]);
                    $logs[] = "❌ [P{$target_prio}] {$msg}. GAGAL!";
                } else {
                    // JANGAN DITEBAS! Biarkan Proses_API untuk dicek Webhook nanti
                    $logs[] = "⏳ [P{$target_prio}] PENDING: $msg (Menunggu Webhook)";
                }
            }
        } catch (\Exception $e) {
            // KONEKSI ERROR? BALIK KE ANTREAN!
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "📡 KONEKSI TIMEOUT. RE-QUEUE...";
            sleep(3);
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ OTAK SNIPER V5 (ANTI-KECOLONGAN) SUDAH AKTIF!\n";
