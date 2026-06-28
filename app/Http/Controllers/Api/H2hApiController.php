<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class H2hApiController extends Controller
{
    private $pythonUrl = 'http://138.197.120.9:8888';

    private function executePython($endpoint, $params = []) {
        set_time_limit(120);
        try {
            $response = Http::timeout(45)->get($this->pythonUrl . $endpoint, $params);
            return $response->json();
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => 'Engine RTO/Offline: ' . $e->getMessage()];
        }
    }

    // 1. ENDPOINT CHECK SLOT & SESSIONS UNTUK RESELLER
    public function listSessions(Request $request)
    {
        $reseller = $request->get('reseller');
        
        // Ambil nomor pengelola dari Python
        $allSessions = $this->executePython('/list_sessions');
        if (!($allSessions['success'] ?? false)) return response()->json($allSessions);

        // Ambil data binding nomor pengelola khusus milik Reseller ini di DB Laravel
        // Fokus Kunci: Isolasi data antar penyewa API
        $myManagedNumbers = \DB::table('pengelola_reseller')
            ->where('reseller_id', $reseller->id)
            ->pluck('msisdn')
            ->toArray();

        $allowedSessions = array_values(array_intersect($allSessions['data'], $myManagedNumbers));

        return response()->json([
            'success' => true,
            'reseller_name' => $reseller->name,
            'balance' => $reseller->balance,
            'active_managed_sessions' => $allowedSessions
        ]);
    }

    // 2. ENDPOINT UTAMA EKSEKUSI INVITE H2H (BRUTAL SAT-SET)
    public function executeInvite(Request $request)
    {
        Log::info("🚀 [H2H INCOMING ORDER] Tembakan Masuk dari Reseller ID: " . $request->get('reseller')->id);
        
        $request->validate([
            'manager_msisdn' => 'required',
            'target_msisdn' => 'required',
            'slot_id' => 'required|integer'
        ]);

        $reseller = $request->get('reseller');
        $manager = $request->manager_msisdn;
        $target = $request->target_msisdn;
        $slotId = $request->slot_id;

        // PROTEKSI 1: Pastikan nomor pengelola tersebut memang hak sewa reseller ini
        $checkOwnership = \DB::table('pengelola_reseller')
            ->where('reseller_id', $reseller->id)
            ->where('msisdn', $manager)
            ->exists();

        if (!$checkOwnership) {
            return response()->json(['success' => false, 'error' => 'Akses ditolak. Nomor pengelola bukan hak sewa Anda.'], 403);
        }

        // AUTOPILOT ENGINE: Tarik data slot terbaru secara live dari XL sebelum menembak
        $liveInfo = $this->executePython('/akrab_member_info', ['active_msisdn' => $manager]);
        
        // JIKA TOKEN MATI (REQUEST_MISSING_BEARER / EXPIRED): Eksekusi Auto-Sync Instan!
        if (!($liveInfo['success'] ?? false) || (isset($liveInfo['error']) && str_contains(json_encode($liveInfo['error']), 'BEARER'))) {
            Log::info("🔄 [AUTOPILOT] Mendeteksi Token Mati pada Pengelola {$manager}. Meluncurkan Auto-Sync Siluman...");
            $sync = $this->executePython('/sync_session', ['active_msisdn' => $manager]);
            if (!($sync['success'] ?? false)) {
                return response()->json(['success' => false, 'error' => 'Sesi Pengelola Mati & Gagal Auto-Recovery.'], 412);
            }
            // Muat ulang data slot setelah sync berhasil
            $liveInfo = $this->executePython('/akrab_member_info', ['active_msisdn' => $manager]);
        }

        // Cari family_member_id_empty otomatis dari data live agar reseller tidak pusing nyari ID FMID
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

        if (!$fmid) {
            return response()->json(['success' => false, 'error' => "Slot ID {$slotId} tidak ditemukan pada paket XL pengelola."], 404);
        }

        // EKSEKUSI INTI KE MESIN MULTI-THREADED PYTHON
        $res = $this->executePython('/akrab_change_member', [
            'active_msisdn' => $manager,
            'msisdn' => $target,
            'slot_id' => $slotId,
            'family_member_id' => $fmid
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
