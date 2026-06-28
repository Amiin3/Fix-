<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AkrabApiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AkrabManagerController extends Controller
{
    protected $akrabService;
    protected $apiKey;

    public function __construct(AkrabApiService $akrabService) {
        $this->akrabService = $akrabService;
        $this->apiKey = env('MILA_STORE_API_KEY', 'MILA_SECRET_MANAGEMENT_123'); 
    }

    public function index() {
        $localManagers = DB::table('akrab_pengelola')->orderBy('created_at', 'desc')->get()->keyBy('msisdn');
        $products = DB::table('akrab_products')->orderBy('harga_jual', 'asc')->get();
        return Inertia::render('Admin/AkrabManager', ['localManagers' => $localManagers, 'masterProducts' => $products]);
    }

    public function memberInfo(Request $request) {
        $slots = DB::table('akrab_slots')->where('parent_msisdn', $request->active_msisdn)->orderBy('is_additional', 'asc')->orderBy('slot_id', 'asc')->get();
        $parent = DB::table('akrab_pengelola')->where('msisdn', $request->active_msisdn)->first();
        return response()->json(['status' => true, 'members' => $slots, 'parent' => $parent]);
    }

    public function ajaxSyncSlot(Request $request) {
        try {
            $msisdn = $request->msisdn;
            $res = $this->akrabService->getMemberInfo($msisdn, $this->apiKey);
            
            $memberInfo = $res['data']['data']['member_info'] ?? $res['data']['member_info'] ?? null;

            if (!$memberInfo) {
                return response()->json(['status' => false, 'message' => 'Data API XL Kosong atau Sesi Terputus.']);
            }

            // Update Kuota Induk MilaStore
            $totalQuotaGb = isset($memberInfo['total_quota']) ? round($memberInfo['total_quota'] / 1073741824, 2) : 0;
            $sisaQuotaGb = isset($memberInfo['remaining_quota']) ? round($memberInfo['remaining_quota'] / 1073741824, 2) : 0;

            DB::table('akrab_pengelola')->where('msisdn', $msisdn)->update([
                'last_sync' => now(), 'total_quota_gb' => $totalQuotaGb, 'sisa_quota_gb' => $sisaQuotaGb
            ]);

            // Ekstraksi Slot Reguler & Tambahan
            $regularSlots = $memberInfo['members'] ?? [];
            $additionalSlots = $memberInfo['additional_members'] ?? [];
            foreach ($regularSlots as &$rs) { $rs['is_additional'] = 0; }
            foreach ($additionalSlots as &$as) { $as['is_additional'] = 1; }
            
            $allSlots = array_merge($regularSlots, $additionalSlots);
            $activeSlotIds = [];

            foreach ($allSlots as $s) {
                if (!isset($s['slot_id']) || $s['slot_id'] == 0) continue; 
                
                $slotId = $s['slot_id'];
                $activeSlotIds[] = $slotId;
                
                $memberHp = !empty($s['msisdn']) ? $s['msisdn'] : null;
                
                // 🛡️ PROTEKSI PHP 8 STRICT: Amankan dari key array yang tidak eksis di JSON XL
                $alias = $s['alias'] ?? '';
                $name = $s['name'] ?? '';
                $contact = $s['contact_name'] ?? '';
                
                $finalName = $alias ?: ($name ?: ($contact ?: ($memberHp ? 'Tanpa Nama' : null)));

                $usage = $s['usage'] ?? [];
                $quotaGb = isset($usage['quota_allocated']) ? round($usage['quota_allocated'] / 1073741824, 2) : 0;
                $usedGb = isset($usage['quota_used']) ? round($usage['quota_used'] / 1073741824, 2) : 0;

                DB::table('akrab_slots')->updateOrInsert(
                    ['slot_id' => $slotId, 'parent_msisdn' => $msisdn],
                    [
                        'family_id_filled' => $s['family_member_id'] ?? null,
                        'family_id_empty' => $s['family_member_id'] ?? null,
                        'status_slot' => empty($memberHp) ? 'empty' : 'filled',
                        'is_additional' => $s['is_additional'] ?? 0,
                        'member_msisdn' => $memberHp,
                        'member_name' => $finalName,
                        'quota_limit' => $quotaGb,
                        'quota_used' => $usedGb,
                        'updated_at' => now()
                    ]
                );
            }

            if (!empty($activeSlotIds)) {
                DB::table('akrab_slots')->where('parent_msisdn', $msisdn)->whereNotIn('slot_id', $activeSlotIds)->delete();
            }

            return response()->json(['status' => true, 'message' => 'Sinkronisasi Berhasil']);
        } catch (\Exception $e) {
            Log::error("SYNC ERROR: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Gagal Sinkronisasi: ' . $e->getMessage()]);
        }
    }

    public function handleAction(Request $request) {
        $action = $request->input('action');
        $activeMsisdn = $request->input('active_msisdn');

        if ($action === 'invite') { 
            $res = $this->akrabService->inviteMember($activeMsisdn, $request->slot_id, $request->family_member_id, $request->target_msisdn, $this->apiKey); 
            if ($res['status'] ?? $res['success'] ?? false) { $this->ajaxSyncSlot(new Request(['msisdn' => $activeMsisdn])); } 
            return response()->json($res); 
        }
        if ($action === 'kick') { 
            $res = $this->akrabService->kickMember($activeMsisdn, $request->family_member_id, $this->apiKey); 
            if ($res['status'] ?? $res['success'] ?? false) { 
                DB::table('akrab_slots')->where('parent_msisdn', $activeMsisdn)->where('family_id_filled', $request->family_member_id)->update(['status_slot' => 'empty', 'member_msisdn' => null, 'member_name' => null, 'mapped_product_id' => null, 'quota_limit' => 0, 'quota_used' => 0]); 
                $this->ajaxSyncSlot(new Request(['msisdn' => $activeMsisdn])); 
            } 
            return response()->json($res); 
        }
        if ($action === 'force_kuber') { 
            $res = $this->akrabService->setQuota($activeMsisdn, $request->family_member_id, $request->gb, 53687091200, $this->apiKey); 
            if ($res['status'] ?? $res['success'] ?? false) { $this->ajaxSyncSlot(new Request(['msisdn' => $activeMsisdn])); } 
            return response()->json($res); 
        }
        if ($action === 'buy_extra_slot') { 
            if (method_exists($this->akrabService, 'buyExtraSlot')) { 
                $res = $this->akrabService->buyExtraSlot($activeMsisdn, $this->apiKey); 
                if ($res['status'] ?? $res['success'] ?? false) { $this->ajaxSyncSlot(new Request(['msisdn' => $activeMsisdn])); } 
                return response()->json($res); 
            } 
            return response()->json(['status' => false, 'message' => 'API Beli Slot tidak didukung.']); 
        }
        return response()->json(['status' => false, 'message' => 'Aksi tidak didukung']);
    }

    public function updatePengelola(Request $request) { DB::table('akrab_pengelola')->where('msisdn', $request->msisdn)->update(['tanggal_restok' => $request->tanggal_restok, 'status_pengelola' => $request->status_pengelola]); return response()->json(['status' => true]); }
    public function storeProduct(Request $request) { $request->validate(['nama_produk' => 'required', 'harga_jual' => 'required|numeric', 'kuber_gb' => 'required|numeric']); $data = ['nama_produk' => $request->nama_produk, 'harga_jual' => $request->harga_jual, 'kuber_gb' => $request->kuber_gb, 'deskripsi' => $request->deskripsi]; if ($request->id) { DB::table('akrab_products')->where('id', $request->id)->update($data); return response()->json(['status' => true]); } $data['created_at'] = now(); DB::table('akrab_products')->insert($data); return response()->json(['status' => true]); }
    public function deleteProduct(Request $request) { DB::table('akrab_products')->where('id', $request->id)->delete(); DB::table('akrab_slots')->where('mapped_product_id', $request->id)->update(['mapped_product_id' => null]); return response()->json(['status' => true]); }
    public function mapSlot(Request $request) { DB::table('akrab_slots')->where('slot_id', $request->slot_id)->update(['mapped_product_id' => $request->mapped_product_id ?: null]); return response()->json(['status' => true]); }
    
    public function listSessions() { return response()->json($this->akrabService->listSessions($this->apiKey)); }
    public function reqOtp(Request $request) { return response()->json($this->akrabService->requestOtp($request->msisdn, $this->apiKey)); }
    public function submitOtp(Request $request) { return response()->json($this->akrabService->submitOtp($request->msisdn, $request->otp, $this->apiKey)); }
}
