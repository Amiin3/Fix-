<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AkrabApiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AkrabOrderController extends Controller
{
    protected $akrabService;
    protected $apiKey;

    public function __construct(AkrabApiService $akrabService) {
        $this->akrabService = $akrabService;
        $this->apiKey = env('MILA_STORE_API_KEY', 'MILA_SECRET_MANAGEMENT_123');
    }

    public function index() {
        // Ambil produk dan hitung stok (slot kosong yang ter-mapping)
        $products = DB::table('akrab_products')->get()->map(function($prod) {
            $stock = DB::table('akrab_slots')->where('mapped_product_id', $prod->id)->where('status_slot', 'empty')->count();
            $prod->stok_tersedia = $stock;
            return $prod;
        });

        return Inertia::render('Admin/AkrabOrder', [
            'products' => $products
        ]);
    }

    public function getQueues() {
        $queues = DB::table('akrab_kuber_queue')->orderBy('created_at', 'desc')->limit(20)->get();
        return response()->json(['status' => true, 'data' => $queues]);
    }

    public function submitOrder(Request $request) {
        $request->validate([
            'target_msisdn' => 'required',
            'product_id' => 'required'
        ]);

        $targetMsisdn = $request->target_msisdn;
        $product = DB::table('akrab_products')->where('id', $request->product_id)->first();

        if (!$product) return response()->json(['status' => false, 'message' => 'Produk tidak valid.']);

        // 1. CARI SLOT KOSONG SECARA OTOMATIS
        $slot = DB::table('akrab_slots')
            ->where('mapped_product_id', $product->id)
            ->where('status_slot', 'empty')
            ->first();

        if (!$slot) return response()->json(['status' => false, 'message' => 'STOK HABIS! Tidak ada slot kosong untuk produk ini.']);

        // 2. EKSEKUSI INVITE KE SERVER XL
        $res = $this->akrabService->inviteMember($slot->parent_msisdn, $slot->slot_id, $slot->family_id_empty, $targetMsisdn, $this->apiKey);

        if ($res['status'] ?? $res['success'] ?? false) {
            // 3. UPDATE DB LOKAL & MASUKKAN KE ANTREAN KUBER (DELAY 2 MENIT)
            DB::table('akrab_slots')->where('slot_id', $slot->slot_id)->update([
                'status_slot' => 'filled',
                'member_msisdn' => $targetMsisdn,
                'member_name' => 'Menunggu Kuber...',
                'updated_at' => now()
            ]);

            DB::table('akrab_kuber_queue')->insert([
                'parent_msisdn' => $slot->parent_msisdn,
                'member_msisdn' => $targetMsisdn,
                'slot_id' => $slot->slot_id,
                'family_id' => $slot->family_id_empty, // Gunakan ID ini untuk eksekusi kuber
                'kuber_gb' => $product->kuber_gb,
                'process_at' => now()->addMinutes(2), // DELAY 2 MENIT SULTAN!
                'status_queue' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['status' => true, 'message' => "Order Sukses! Nomor $targetMsisdn berhasil di-invite. Kuber akan ditembak otomatis dalam 2 menit."]);
        }

        return response()->json(['status' => false, 'message' => 'Gagal Invite: ' . ($res['message'] ?? 'Error Server XL')]);
    }

    // ==========================================
    // CRON JOB WORKER: EKSEKUTOR KUBER DELAYED
    // ==========================================
    public function processQueue() {
        // Cari antrean yang sudah lewat 2 menit dan masih pending
        $queues = DB::table('akrab_kuber_queue')
            ->where('status_queue', 'pending')
            ->where('process_at', '<=', now())
            ->get();

        if ($queues->isEmpty()) return response()->json(['status' => true, 'message' => 'Tidak ada antrean Kuber yang siap dieksekusi.']);

        $success = 0; $failed = 0;

        foreach ($queues as $q) {
            // EKSEKUSI TEMBAK KUBER
            $res = $this->akrabService->setQuota($q->parent_msisdn, $q->family_id, $q->kuber_gb, 53687091200, $this->apiKey);

            if ($res['status'] ?? $res['success'] ?? false) {
                DB::table('akrab_kuber_queue')->where('id', $q->id)->update(['status_queue' => 'success', 'log' => 'Sukses tembak ' . $q->kuber_gb . 'GB', 'updated_at' => now()]);
                
                // Update Slot Lokal
                DB::table('akrab_slots')->where('slot_id', $q->slot_id)->update(['quota_limit' => $q->kuber_gb]);
                $success++;
            } else {
                DB::table('akrab_kuber_queue')->where('id', $q->id)->update(['status_queue' => 'failed', 'log' => $res['message'] ?? 'Gagal tembak XL', 'updated_at' => now()]);
                $failed++;
            }
            sleep(1); // Jeda anti-banned
        }

        return response()->json(['status' => true, 'message' => "Worker Berjalan: $success Sukses, $failed Gagal."]);
    }
}
