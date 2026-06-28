<?php
$file = 'app/Http/Controllers/AdminKhfyController.php';
$content = file_get_contents($file);

$new_execute = 'public function warExecute(\Illuminate\Http\Request $request) {
    set_time_limit(120);
    $db = \Illuminate\Support\Facades\DB::connection();
    
    // 1. CEK STATUS (WAJIB "MULAI")
    $status = $db->table("settings")->where("key", "war_status")->value("value");
    if ($status !== "Mulai") return response()->json(["status" => "stopped", "log" => "🔴 SISTEM MATI."]);

    $khfy_url = env("KHFY_URL", "https://panel.khfy-store.com/api_v2");
    $api_key = env("KHFY_API_KEY");
    
    // AMBIL TARGET (UTAMAKAN PRIORITAS 0/CFMX)
    $target_prio = $db->table("antrian_po")->where("status", "Menunggu")->min("prioritas");
    if ($target_prio === null) return response()->json(["status" => "success", "log" => "📡 RADAR BERSIH."]);

    $antrean_target = $db->table("antrian_po")
        ->where("status", "Menunggu")
        ->where("prioritas", $target_prio)
        ->limit(2) 
        ->get();

    $logs = [];
    foreach ($antrean_target as $target) {
        // CEK STOP DI TENGAH JALAN
        if ($db->table("settings")->where("key", "war_status")->value("value") !== "Mulai") break;

        usleep(2000000); // JEDA 2 DETIK (BIAR AMAN DARI DDOS PROVIDER)
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);

        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(15)
                ->get("{$khfy_url}/order?api_key={$api_key}&service={$target->kode_produk}&target={$target->tujuan}&refid={$target->ref_id}");
            
            $body = $response->body();
            $res = json_decode($body, true);
            $msg = $res["msg"] ?? "Timeout";

            // --- LOGIKA EMAS: JANGAN PERNAH BATALKAN JIKA ADA HARAPAN ---
            if (isset($res["status"]) && $res["status"] == true) {
                // BERHASIL TOTAL!
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Sukses", "sn" => "WAR SUCCESS"]);
                $logs[] = "🚀 [P{$target_prio}] {$target->tujuan} SUKSES!";
            } else {
                // CEK APAKAH ERRORNYA BISA DICOBA LAGI?
                $is_retryable = (
                    $msg == "R" || 
                    $msg == "t" || 
                    str_contains(strtolower($msg), "limit") || 
                    str_contains(strtolower($msg), "busy") || 
                    str_contains(strtolower($msg), "timeout") ||
                    str_contains(strtolower($msg), "throttle")
                );

                if ($is_retryable) {
                    // BALIKIN KE ANTRIAN (JANGAN DIBATALKAN!)
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $logs[] = "⚠️ PROVIDER LIMIT ($msg). ORDER DISIMPAN & COBA LAGI NANTI...";
                    sleep(10); // ISTIRAHAT TOTAL BIAR IP BERSIH LAGI
                    break; // STOP SIKLUS INI BIAR GAK MAKIN PARAH
                } else {
                    // HANYA JIKA ERROR PERMANEN (Misal: Nomor Salah / Saldo Admin Khfy Habis)
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["status" => "Gagal", "sn" => "GAGAL: $msg"]);
                    $logs[] = "❌ GAGAL PERMANEN: $msg";
                }
            }
        } catch (\Exception $e) {
            // JIKA KONEKSI PUTUS, WAJIB COBA LAGI!
            $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
            $logs[] = "📡 SINYAL LEMAH. COBA LAGI...";
            sleep(5);
            break;
        }
    }
    return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
}';

$content = preg_replace('/public function warExecute\(.*\)[\s\n]*\{[\s\S]*?\}\n/U', $new_execute . "\n", $content);
file_put_contents($file, $content);
echo "✔️ BOT SNIPER SABAR TELAH AKTIF! ANTI-CANCEL AKTIF!\n";
