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
        $res = $this->akrabService->getMemberInfo($msisdn);
        
        $memberInfo = $res['data']['data']['member_info'] ?? null;
        
        if (isset($res['success']) && $res['success'] === true && $memberInfo) {
            
            // 1. EKSTRAK TANGGAL RESET DARI INDUK (PARENT)
            $parentEndDate = $memberInfo['end_date'] ?? 0;
            // Format Y-m-d H:i:s (Contoh: 2026-05-29 00:00:00)
            $fullResetDate = $parentEndDate > 0 ? date('Y-m-d H:i:s', $parentEndDate) : null;
            // Format Tanggal saja (Contoh: 29)
            $resetDay = $parentEndDate > 0 ? date('d', $parentEndDate) : null; 

            $regularSlots = $memberInfo['members'] ?? [];
            $additionalSlots = $memberInfo['additional_members'] ?? [];
            $allSlots = array_merge($regularSlots, $additionalSlots);
            
            $activeSlotIds = [];
            
            foreach ($allSlots as $s) {
                if (isset($s['slot_id']) && $s['slot_id'] == 0) continue; 
                
                $slotId = $s['slot_id'];
                $activeSlotIds[] = $slotId;
                
                $memberHp = $s['msisdn'] ?? null;
                $isEmpty = empty($memberHp) ? 'empty' : 'filled';
                $fid = $s['family_member_id'] ?? null;

                // Konversi Sisa Kuota
                $quotaBytes = $s['usage']['quota_allocated'] ?? 0;
                $quotaGb = $quotaBytes > 0 ? round($quotaBytes / 1073741824, 2) . ' GB' : '0 GB';

                // 2. EKSTRAK TANGGAL EXPIRED PER SLOT
                $slotExpRaw = $s['slot_expiration'] ?? 0;
                $slotExpDate = $slotExpRaw > 0 ? date('Y-m-d H:i:s', $slotExpRaw) : null;

                // Siapkan array update slot
                $updateSlotData = [
                    'family_id_empty' => $fid,
                    'family_id_filled' => $fid,
                    'status_slot' => $isEmpty,
                    'member_msisdn' => $memberHp,
                    'quota_limit' => $quotaGb,
                    // 'expired_at' => $slotExpDate, // <-- UNCOMMENT jika tabel akrab_slots punya kolom ini
                    'updated_at' => now()
                ];

                \Illuminate\Support\Facades\DB::table('akrab_slots')->updateOrInsert(
                    ['slot_id' => $slotId, 'parent_msisdn' => $msisdn],
                    $updateSlotData
                );
            }
            
            if (!empty($activeSlotIds)) {
                \Illuminate\Support\Facades\DB::table('akrab_slots')
                    ->where('parent_msisdn', $msisdn)
                    ->whereNotIn('slot_id', $activeSlotIds)
                    ->delete();
            }
            
            // Siapkan array update pengelola (Induk)
            $updatePengelolaData = [
                'last_sync' => now(),
                // 'tanggal_reset' => $resetDay, // <-- UNCOMMENT jika tabel akrab_pengelola punya kolom ini
            ];

            \Illuminate\Support\Facades\DB::table('akrab_pengelola')
                ->where('msisdn', $msisdn)
                ->update($updatePengelolaData);
            
            return response()->json(['status' => true, 'message' => 'Sync Berhasil']);
        }
        
        return response()->json(['status' => false, 'message' => 'Gagal membaca data dari server pusat']);
    }

FUNC;

file_put_contents($path, $before . $newFunction . "\n" . ltrim($after));
echo "\n\033[1;42;37m [SUKSES] Controller V4.1 (Dengan Ekstraksi Tanggal Reset) berhasil ditanam! \033[0m\n\n";
?>
