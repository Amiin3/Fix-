<?php
$path = '/www/wwwroot/milastore.web.id/app/Http/Controllers/Admin/AkrabManagerController.php';

if (!file_exists($path)) {
    die("\n\033[1;31m[ERROR] File AkrabManagerController.php tidak ditemukan di path tersebut!\033[0m\n");
}

$code = file_get_contents($path);

// Ekstrak bagian SEBELUM dan SESUDAH fungsi ajaxSyncSlot
$startToken = "public function ajaxSyncSlot";
$startPos = strpos($code, $startToken);

if ($startPos === false) {
    // Jika fungsi lama belum ada, siapkan untuk diselipkan sebelum penutup class
    $insertPos = strrpos($code, '}');
    $before = substr($code, 0, $insertPos);
    $after = substr($code, $insertPos);
} else {
    $before = substr($code, 0, $startPos);
    // Deteksi batas akhir fungsi berdasarkan keyword public function berikutnya atau penutup class
    $nextFunctionPos = strpos($code, "public function", $startPos + 20);
    $endOfClassPos = strrpos($code, "}");
    $endPos = $nextFunctionPos !== false ? $nextFunctionPos : $endOfClassPos;
    $after = substr($code, $endPos);
}

// Blok kode Fix Full Version
$newFunction = <<<'FUNC'
public function ajaxSyncSlot(Request $request)
    {
        $msisdn = $request->msisdn;
        
        // Memanggil service API
        $res = $this->akrabService->getMemberInfo($msisdn);
        
        // Menyesuaikan dengan struktur JSON bersarang dari pusat
        $memberInfo = $res['data']['data']['member_info'] ?? null;
        
        if (isset($res['success']) && $res['success'] === true && $memberInfo) {
            // Gabungkan slot reguler dan slot tambahan (additional)
            $regularSlots = $memberInfo['members'] ?? [];
            $additionalSlots = $memberInfo['additional_members'] ?? [];
            $allSlots = array_merge($regularSlots, $additionalSlots);
            
            $activeSlotIds = [];
            
            foreach ($allSlots as $s) {
                // Abaikan slot 0 karena itu adalah nomor induk/parent
                if (isset($s['slot_id']) && $s['slot_id'] == 0) continue; 
                
                $slotId = $s['slot_id'];
                $activeSlotIds[] = $slotId;
                
                $memberHp = $s['msisdn'] ?? null;
                $isEmpty = empty($memberHp) ? 'empty' : 'filled';
                
                // Di struktur XL terbaru, ID Invite dan ID Kick digabung dalam family_member_id
                $fid = $s['family_member_id'] ?? null;

                // Konversi sisa kuota kuber dari bytes ke Gigabytes (GB)
                $quotaBytes = $s['usage']['quota_allocated'] ?? 0;
                $quotaGb = $quotaBytes > 0 ? round($quotaBytes / 1073741824, 2) . ' GB' : '0 GB';

                \Illuminate\Support\Facades\DB::table('akrab_slots')->updateOrInsert(
                    ['slot_id' => $slotId, 'parent_msisdn' => $msisdn],
                    [
                        'family_id_empty' => $fid,
                        'family_id_filled' => $fid,
                        'status_slot' => $isEmpty,
                        'member_msisdn' => $memberHp,
                        'quota_limit' => $quotaGb,
                        'updated_at' => now()
                    ]
                );
            }
            
            // Bersihkan slot lama di database yang mungkin sudah dihapus dari server XL
            if (!empty($activeSlotIds)) {
                \Illuminate\Support\Facades\DB::table('akrab_slots')
                    ->where('parent_msisdn', $msisdn)
                    ->whereNotIn('slot_id', $activeSlotIds)
                    ->delete();
            }
            
            // Perbarui timestamp sinkronisasi pengelola
            \Illuminate\Support\Facades\DB::table('akrab_pengelola')->where('msisdn', $msisdn)->update(['last_sync' => now()]);
            
            return response()->json(['status' => true, 'message' => 'Sync Berhasil']);
        }
        
        return response()->json(['status' => false, 'message' => 'Gagal membaca data dari server pusat']);
    }

FUNC;

// Timpa file lama dengan kode yang telah disisipkan perbaikan
file_put_contents($path, $before . $newFunction . "\n" . ltrim($after));
echo "\n\033[1;42;37m [SUKSES] Controller AkrabManagerController.php berhasil ditambal! \033[0m\n";
echo "\033[1;32mSistem Sinkronisasi & Konversi Kuota GB siap rilis.\033[0m\n\n";
?>
