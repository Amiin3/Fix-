<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

// 1. TAMBAHKAN CEK STATUS "MULAI/STOP" DI DALAM LOOP (BIAR BISA DIMATIKAN INSTAN)
$new_execute = 'public function warExecute(\Illuminate\Http\Request $request) {
    set_time_limit(120);
    $db = \Illuminate\Support\Facades\DB::connection();
    
    // CEK APAKAH TOMBOL STOP DITEKAN (Pakai Cache/Setting agar Instan)
    $is_running = $db->table("settings")->where("key", "war_status")->value("value");
    if ($is_running !== "Mulai") {
        return response()->json(["status" => "stopped", "log" => "🔴 SISTEM DIHENTIKAN MANUAL."]);
    }

    $khfy_url = env("KHFY_URL", "https://panel.khfy-store.com/api_v2");
    $api_key = env("KHFY_API_KEY");
    if (empty($api_key)) return response()->json(["status" => "error", "log" => "☠️ API_KEY KOSONG!"]);

    $target_prio = $db->table("antrian_po")->where("status", "Menunggu")->min("prioritas");
    if ($target_prio === null) return response()->json(["status" => "success", "log" => "📡 RADAR BERSIH."]);

    $antrean_target = $db->table("antrian_po")
        ->where("status", "Menunggu")
        ->where("prioritas", $target_prio)
        ->limit(3) // Kurangi jumlah serentak biar provider nggak muntah
        ->get();

    $logs = [];
    foreach ($antrean_target as $target) {
        // --- REM DARURAT: CEK STATUS LAGI TIAP MAU NEMBAK ---
        $cek_ulang = $db->table("settings")->where("key", "war_status")->value("value");
        if ($cek_ulang !== "Mulai") break;

        usleep(1000000); // Jeda 1 detik per nomor (WAJIB!)
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(5)
                ->get("{$khfy_url}/order?api_key={$api_key}&service={$target->kode_produk}&target={$target->tujuan}&refid={$target->ref_id}");
            
            $body = $response->body();
            $data = json_decode($body, true);

            if (isset($data["status"]) && $data["status"] == true) {
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Sukses", "sn" => "PROSES WAR"]);
                $logs[] = "🚀 [P{$target_prio}] {$target->tujuan} SUKSES!";
            } else {
                $msg = $data["msg"] ?? "Error";
                // JIKA KENA RATE LIMIT (R) ATAU TIMEOUT (t)
                if ($msg == "R" || $msg == "t") {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "⚠️ RATE LIMIT! Tiarap 5 detik...";
                    sleep(5); // ISTIRAHAT TOTAL JANGAN SPAM!
                    break; // Berhenti dulu siklus ini biar nggak kena banned IP
                } else {
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $logs[] = "❌ GAGAL: $msg";
                }
            }
        } catch (\Exception $e) {
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "📡 KONEKSI TIMEOUT!";
            sleep(3);
        }
    }

    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

// Ganti fungsinya dengan yang baru
$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);

file_put_contents($file, $content);
echo "✔️ BOT SUDAH JADI SNIPER ELITE! Anti-Zombie & Anti-Spam Gila!\n";
