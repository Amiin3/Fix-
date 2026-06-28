<?php
$path = '/www/wwwroot/milastore.web.id/app/Http/Controllers/Admin/AkrabManagerController.php';

if (!file_exists($path)) {
    die("\n\033[1;31m[ERROR] File AkrabManagerController.php tidak ditemukan!\033[0m\n");
}

$code = file_get_contents($path);

$startToken = "public function ajaxSyncSlot";
$startPos = strpos($code, $startToken);

if ($startPos === false) {
    $insertPos = strrpos($code, '}');
    $before = substr($code, 0, $insertPos);
    $after = substr($code, $insertPos);
} else {
    $before = substr($code, 0, $startPos);
    $nextFunctionPos = strpos($code, "public function", $startPos + 20);
    $endOfClassPos = strrpos($code, "}");
    $endPos = $nextFunctionPos !== false ? $nextFunctionPos : $endOfClassPos;
    $after = substr($code, $endPos);
}

$newFunction = <<<'FUNC'
public function ajaxSyncSlot(Request $request)
    {
        $msisdn = $request->msisdn;
        
        // Tarik data dari API Utama Mila Store
        $res = $this->akrabService->getMemberInfo($msisdn);
        
        $memberInfo = $res['data']['data']['member_info'] ?? null;
        
        if (isset($res['success']) && $res['success'] === true && $memberInfo) {
            
            // Ekstrak timestamp end_date XL menjadi angka hari (Tanpa angka 0 di depan, misal: 1, 29)
            $parentEndDate = $memberInfo['end_date'] ?? 0;
            $resetDay = $parentEndDate > 0 ? date('j', $parentEndDate) : null; 

            // Gabungkan slot reguler dan berbayar (additional)
            $regularSlots = $memberInfo['members'] ?? [];
            $additionalSlots = $memberInfo['additional_members'] ?? [];
            $allSlots = array_merge($regularSlots, $additionalSlots);
            
            $activeSlotIds = [];
            
            foreach ($allSlots as $s) {
                // Lewati slot 0 karena itu nomor induk/parent
                if (isset($s['slot_id']) && $s['slot_id'] == 0) continue; 
                
                $slotId = $s['slot_id'];
                $activeSlotIds[] = $slotId;
                
                $memberHp = $s['msisdn'] ?? null;
                $isEmpty = empty($memberHp) ? 'empty' : 'filled';
                $fid = $s['family_member_id'] ?? null;

                // Konversi sisa kuota kuber dari bytes ke Gigabytes (GB)
                $quotaBytes = $s['usage']['quota_allocated'] ?? 0;
                $quotaGb = $quotaBytes > 0 ? round($quotaBytes / 1073741824, 2) . ' GB' : '0 GB';

                // Update data per slot ke database
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
            
            // Hapus slot di DB lokal yang sudah tidak ada di server XL pusat
            if (!empty($activeSlotIds)) {
                \Illuminate\Support\Facades\DB::table('akrab_slots')
                    ->where('parent_msisdn', $msisdn)
                    ->whereNotIn('slot_id', $activeSlotIds)
                    ->delete();
            }
            
            // Update timestamp sync dan tanggal restok otomatis di tabel pengelola
            \Illuminate\Support\Facades\DB::table('akrab_pengelola')
                ->where('msisdn', $msisdn)
                ->update([
                    'last_sync' => now(),
                    'tanggal_restok' => $resetDay
                ]);
            
            return response()->json(['status' => true, 'message' => 'Sync Berhasil']);
        }
        
        return response()->json(['status' => false, 'message' => 'Gagal membaca data dari server pusat']);
    }

FUNC;

file_put_contents($path, $before . $newFunction . "\n" . ltrim($after));
echo "\n\033[1;42;37m [PROSES SELESAI] Controller v4.2 Selesai Dipasang! \033[0m\n";
echo "\033[1;32mKolom 'tanggal_restok' & Sinkronisasi Multi-Array Slot kini telah aktif.\033[0m\n\n";
?>
