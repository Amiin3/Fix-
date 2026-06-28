<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiAkrabController extends Controller
{
    private $pythonUrl = 'http://138.197.120.9:8888';

    private function executePython($endpoint, $params = []) {
        set_time_limit(120);
        try {
            $response = Http::timeout(45)->get($this->pythonUrl . $endpoint, $params);
            return $response->json();
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => 'Engine Python RTO/Offline: ' . $e->getMessage()];
        }
    }

    public function listSessions(Request $request)
    {
        $reseller = $request->get('reseller');
        $allSessions = $this->executePython('/list_sessions');
        if (!($allSessions['success'] ?? false)) return response()->json($allSessions);

        // Isolasi data: Ambil nomor pengelola khusus milik penyewa API ini
        // (Pastikan tabel 'pengelola_reseller' atau logika relasinya sesuai dengan DB Anda)
        $myManagedNumbers = \DB::table('pengelola_reseller')
            ->where('reseller_id', $reseller->id)
            ->pluck('msisdn')
            ->toArray();

        $allowedSessions = array_values(array_intersect($allSessions['data'], $myManagedNumbers));

        return response()->json([
            'success' => true,
            'reseller_name' => $reseller->name,
            'active_managed_sessions' => $allowedSessions
        ]);
    }

    public function executeInvite(Request $request)
    {
        Log::info("🚀 [API AKRAB] Order Masuk dari Reseller ID: " . $request->get('reseller')->id);
        
        $request->validate([
            'manager_msisdn' => 'required',
            'target_msisdn' => 'required',
            'slot_id' => 'required|integer'
        ]);

        $reseller = $request->get('reseller');
        $manager = $request->manager_msisdn;
        $target = $request->target_msisdn;
        $slotId = $request->slot_id;

        // Validasi Kepemilikan Nomor
        $checkOwnership = \DB::table('pengelola_reseller')
            ->where('reseller_id', $reseller->id)
            ->where('msisdn', $manager)
            ->exists();

        if (!$checkOwnership) {
            return response()->json(['success' => false, 'error' => 'Akses ditolak. Nomor manajer bukan hak sewa Anda.'], 403);
        }

        // AUTO-RECOVERY TOKEN ENGINE
        $liveInfo = $this->executePython('/akrab_member_info', ['active_msisdn' => $manager]);
        if (!($liveInfo['success'] ?? false) || (isset($liveInfo['error']) && str_contains(json_encode($liveInfo['error']), 'BEARER'))) {
            Log::info("🔄 [API AKRAB] Token Mati! Auto-Sync berjalan...");
            $sync = $this->executePython('/sync_session', ['active_msisdn' => $manager]);
            if (!($sync['success'] ?? false)) {
                return response()->json(['success' => false, 'error' => 'Sesi Pengelola Mati & Gagal Diperbarui Otomatis.'], 412);
            }
            $liveInfo = $this->executePython('/akrab_member_info', ['active_msisdn' => $manager]);
        }

        // CARI FMID OTOMATIS
        $slots = [];
        $rawData = $liveInfo['data']['data'] ?? $liveInfo['data'] ?? [];
        $mInfo = $rawData['member_info'] ?? $rawData ?? [];
        if (isset($mInfo['members_slot_data'])) $slots = array_merge($slots, $mInfo['members_slot_data']);
        if (isset($mInfo['additional_members'])) $slots = array_merge($slots, $mInfo['additional_members']);

        $fmid = null;
        foreach ($slots as $s) {
            if (intval($s['slot_id'] ?? 0) === intval($slotId)) {
                $fmid = $s['family_member_id_empty'] ?? $s['family_member_id'] ?? null;
                break;
            }
        }

        if (!$fmid) return response()->json(['success' => false, 'error' => "Slot ID {$slotId} tidak ditemukan."], 404);

        // TEMBAK XL
        $res = $this->executePython('/akrab_change_member', [
            'active_msisdn' => $manager, 'msisdn' => $target, 'slot_id' => $slotId, 'family_member_id' => $fmid
        ]);

        if ($res['success'] ?? false) {
            return response()->json([
                'success' => true,
                'code' => $res['data']['code'] ?? '000',
                'status' => $res['data']['status'] ?? 'SUCCESS',
                'message' => "Nomor {$target} Berhasil Di-invite ke Slot {$slotId}.",
                'raw_xl' => $res['data']
            ]);
        }

        return response()->json(['success' => false, 'error' => $res['error'] ?? 'Gagal dieksekusi XL.'], 400);
    }
}
