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

        usleep(2000000); // Jeda 2 detik (Cooling System)
        $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Proses_API"]);
        
        // --- UPDATE STATUS KE MEMBER: SEDANG DIPROSES ---
        $db->table("transaksi")->where("ref_id", $target->ref_id)->update([
            "status" => "Pending", 
            "sn" => "Sedang Ditembak ke Provider..."
        ]);

        try {
            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(15)
                ->get("{$khfy_url}/order?api_key={$api_key}&service={$target->kode_produk}&target={$target->tujuan}&refid={$target->ref_id}");
            
            $res = json_decode($response->body(), true);
            $msg = $res["msg"] ?? "Timeout";

            if (isset($res["status"]) && $res["status"] == true) {
                // ✅ 1. UPDATE TABEL ANTRIAN
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Sukses"]);
                
                // ✅ 2. UPDATE TABEL TRANSAKSI (SINKRON OTOMATIS)
                $db->table("transaksi")->where("ref_id", $target->ref_id)->update([
                    "status" => "Sukses", 
                    "sn" => $res["sn"] ?? "SUKSES WAR",
                    "updated_at" => now()
                ]);
                
                $logs[] = "🚀 [P{$target_prio}] {$target->tujuan} SUKSES!";
            } else {
                $is_retryable = ($msg == "R" || $msg == "t" || str_contains(strtolower($msg), "limit") || str_contains(strtolower($msg), "timeout"));

                if ($is_retryable) {
                    // ⚠️ BALIKIN KE ANTREAN (STATUS MEMBER TETEP PENDING)
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu"]);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["sn" => "Provider Sibuk (Antre Ulang)"]);
                    
                    $logs[] = "⚠️ PROVIDER LIMIT ($msg). ORDER DISIMPAN...";
                    sleep(10); break;
                } else {
                    // ❌ GAGAL PERMANEN
                    $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Gagal"]);
                    
                    // ❌ UPDATE TRANSAKSI JADI GAGAL (BIAR MEMBER TAHU)
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update([
                        "status" => "Gagal", 
                        "sn" => "GAGAL: $msg",
                        "updated_at" => now()
                    ]);
                    
                    $logs[] = "❌ GAGAL: $msg";
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
echo "✔️ BOT SEKARANG SUDAH SINKRON DENGAN RIWAYAT MEMBER!\n";
