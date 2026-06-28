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

// BUNDLE FITUR ENTERPRISE LENGKAP SIAP RILIS
$newFunctions = <<<'FUNC'
public function ajaxSyncSlot(Request $request)
    {
        $msisdn = $request->msisdn;
        $res = $this->akrabService->getMemberInfo($msisdn);
        $memberInfo = $res['data']['data']['member_info'] ?? null;
        
        if (isset($res['success']) && $res['success'] === true && $memberInfo) {
            
            // Ekstrak angka hari reset (Contoh: 27)
            $parentEndDate = $memberInfo['end_date'] ?? 0;
            $resetDay = $parentEndDate > 0 ? date('j', $parentEndDate) : null; 

            $regularSlots = $memberInfo['members'] ?? [];
            $additionalSlots = $memberInfo['additional_members'] ?? [];
            $allSlots = array_merge($regularSlots, $additionalSlots);
            
            $activeSlotIds = [];
            
            foreach ($allSlots as $s) {
                if (isset($s['slot_id']) && $s['slot_id'] == 0) continue; 
                
                $slotId = $s['slot_id'];
                $activeSlotIds[] = $slotId;
                
                $memberHp = $s['msisdn'] ?? null;
                
                // Pertahankan status 'closed' jika admin sengaja menutup slot ini secara lokal
                $currentSlot = \Illuminate\Support\Facades\DB::table('akrab_slots')
                    ->where('slot_id', $slotId)
                    ->where('parent_msisdn', $msisdn)
                    ->first();
                
                if ($currentSlot && $currentSlot->status_slot === 'closed' && empty($memberHp)) {
                    $isEmpty = 'closed';
                } else {
                    $isEmpty = empty($memberHp) ? 'empty' : 'filled';
                }
                
                $fid = $s['family_member_id'] ?? null;

                // Konversi Bytes ke GB
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
            
            if (!empty($activeSlotIds)) {
                \Illuminate\Support\Facades\DB::table('akrab_slots')
                    ->where('parent_msisdn', $msisdn)
                    ->whereNotIn('slot_id', $activeSlotIds)
                    ->delete();
            }
            
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

    /**
     * FEATURE 1: BULK SYNC BY DATE FILTER (Anti Server Overload)
     * Mengamankan resource server dengan hanya mensinkronisasi akun yang reset hari ini / tanggal tertentu
     */
    public function ajaxBulkSyncByDate(Request $request)
    {
        // Jika parameter tanggal_restok kosong, otomatis ambil tanggal hari ini (1-31)
        $targetDate = $request->get('tanggal_restok', date('j'));
        
        $pengelolaList = \Illuminate\Support\Facades\DB::table('akrab_pengelola')
            ->where('tanggal_restok', $targetDate)
            ->get();
            
        if ($pengelolaList->isEmpty()) {
            return response()->json(['status' => true, 'message' => "Tidak ada akun pengelola dengan jadwal restok tanggal {$targetDate}."]);
        }
        
        $success = 0;
        $failed = 0;
        
        foreach ($pengelolaList as $p) {
            // Jalankan internal request sync
            $fakeRequest = new Request(['msisdn' => $p->msisdn]);
            $sync = $this->ajaxSyncSlot($fakeRequest);
            $resData = json_decode($sync->getContent(), true);
            
            if ($resData['status'] ?? false) {
                $success++;
            } else {
                $failed++;
            }
            
            // Jeda 1 detik antar hit akun agar terhindar dari rate limiting API pusat
            sleep(1);
        }
        
        return response()->json([
            'status' => true,
            'message' => "Bulk Sync Tanggal {$targetDate} Selesai!",
            'summary' => ['total_diproses' => $pengelolaList->count(), 'sukses' => $success, 'gagal' => $failed]
        ]);
    }

    /**
     * FEATURE 2: CLOSE ALL EMPTY SLOTS
     * Mengunci semua slot kosong pada satu pengelola agar tidak bisa dibeli sementara waktu
     */
    public function ajaxCloseEmptySlots(Request $request)
    {
        $msisdn = $request->msisdn;
        
        $affected = \Illuminate\Support\Facades\DB::table('akrab_slots')
            ->where('parent_msisdn', $msisdn)
            ->where('status_slot', 'empty')
            ->update([
                'status_slot' => 'closed',
                'updated_at' => now()
            ]);
            
        return response()->json(['status' => true, 'message' => "Berhasil menutup {$affected} slot kosong."]);
    }

    /**
     * FEATURE 3: OPEN ALL CLOSED SLOTS
     * Membuka kembali slot yang tadinya di-close/dikunci agar berstatus 'empty' dan siap dijual
     */
    public function ajaxOpenEmptySlots(Request $request)
    {
        $msisdn = $request->msisdn;
        
        $affected = \Illuminate\Support\Facades\DB::table('akrab_slots')
            ->where('parent_msisdn', $msisdn)
            ->where('status_slot', 'closed')
            ->update([
                'status_slot' => 'empty',
                'updated_at' => now()
            ]);
            
        return response()->json(['status' => true, 'message' => "Berhasil membuka kembali {$affected} slot kosong untuk dijual."]);
    }

    /**
     * FEATURE 4: FORCE RELEASE SINGLE SLOT (Local Emergency Fix)
     * Mengosongkan paksa slot di database lokal jika terjadi stuck data tanpa ganggu server pusat
     */
    public function ajaxForceReleaseSlot(Request $request)
    {
        $slotId = $request->slot_id;
        $parentMsisdn = $request->parent_msisdn;
        
        \Illuminate\Support\Facades\DB::table('akrab_slots')
            ->where('slot_id', $slotId)
            ->where('parent_msisdn', $parentMsisdn)
            ->update([
                'status_slot' => 'empty',
                'member_msisdn' => null,
                'family_id_empty' => null,
                'family_id_filled' => null,
                'updated_at' => now()
            ]);
            
        return response()->json(['status' => true, 'message' => "Slot ID {$slotId} berhasil di-release paksa secara lokal."]);
    }

FUNC;

file_put_contents($path, $before . $newFunctions . "\n" . ltrim($after));
echo "\n\033[1;42;37m [SUKSES VERSI ENTERPRISE] Controller Berhasil Dipatch Secara Sempurna! \033[0m\n";
echo "\033[1;32mFitur Filter Tanggal Bulk Sync, Close All, Open All, dan Emergency Release Aktif.\033[0m\n\n";
?>
