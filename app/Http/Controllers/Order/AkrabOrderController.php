<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\AkrabApiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
        if (!Schema::hasTable('riwayat_transaksi')) {
            Schema::create('riwayat_transaksi', function ($t) {
                $t->id();
                $t->integer('user_id');
                $t->string('nomor_target', 30);
                $t->string('produk_nama', 100);
                $t->integer('harga');
                $t->string('sn', 100)->nullable();
                $t->string('status', 20);
                $t->timestamps();
            });
        }

        $products = DB::table('akrab_products')->get()->map(function($prod) {
            $prod->stok_tersedia = DB::table('akrab_slots')
                ->where('mapped_product_id', $prod->id)
                ->where('status_slot', 'empty')
                ->count();
            return $prod;
        });

        return Inertia::render('Order/AkrabNew', [
            'products' => $products,
            'userSaldo' => DB::table('users')->where('id', auth()->id())->value('saldo') ?? 0
        ]);
    }

    public function submitOrder(Request $request) {
        $request->validate([
            'target_msisdn' => 'required|numeric',
            'product_id' => 'required'
        ]);

        $targetMsisdn = $request->target_msisdn;
        $productId = $request->product_id;

        $product = DB::table('akrab_products')->where('id', $productId)->first();
        if (!$product) { return response()->json(['status' => false, 'message' => 'Varian produk tidak valid.']); }

        DB::beginTransaction();
        try {
            $user = DB::table('users')->where('id', auth()->id())->lockForUpdate()->first();
            if (!$user || $user->saldo < $product->harga_jual) {
                DB::rollBack();
                return response()->json(['status' => false, 'message' => 'Saldo Anda tidak mencukupi!']);
            }

            $slot = DB::table('akrab_slots')->where('mapped_product_id', $product->id)->where('status_slot', 'empty')->lockForUpdate()->first();

            if (!$slot) {
                DB::rollBack();
                return response()->json(['status' => false, 'message' => 'Maaf, stok varian ini baru saja habis.']);
            }

            // POTONG SALDO SEMENTARA
            DB::table('users')->where('id', $user->id)->decrement('saldo', $product->harga_jual);

            // HIT XL PUSAT
            $res = $this->akrabService->inviteMember($slot->parent_msisdn, $slot->slot_id, $slot->family_id_empty, $targetMsisdn, $this->apiKey);

            // 🔍 X-RAY SCANNER (Deteksi Kelicikan JSON XL)
            $reqSuccess = $res['success'] ?? $res['status'] ?? false;
            $trxStatus = strtoupper($res['data']['status'] ?? 'FAILED');
            $trxCode = $res['data']['code'] ?? '999';
            
            // Sukses MURNI hanya jika XL beneran bilang 'SUCCESS' atau kodenya '000'
            $isSuccess = ($reqSuccess && ($trxStatus === 'SUCCESS' || $trxCode === '000'));
            
            $errMsg = $res['data']['message'] ?? $res['message'] ?? 'Nomor salah atau diblokir oleh jaringan XL.';

            if ($isSuccess) {
                DB::table('akrab_slots')->where('slot_id', $slot->slot_id)->update([
                    'status_slot' => 'filled', 'member_msisdn' => $targetMsisdn, 'member_name' => 'Menunggu Kuber...', 'updated_at' => now()
                ]);

                $snSakti = substr($slot->parent_msisdn, -4) . $targetMsisdn;

                DB::table('riwayat_transaksi')->insert([
                    'user_id' => $user->id, 'nomor_target' => $targetMsisdn, 'produk_nama' => $product->nama_produk, 'harga' => $product->harga_jual, 'sn' => $snSakti, 'status' => 'SUCCESS', 'created_at' => now(), 'updated_at' => now()
                ]);

                // HANYA MASUK ANTREAN JIKA BENAR-BENAR SUKSES
                DB::table('akrab_kuber_queue')->insert([
                    'parent_msisdn' => $slot->parent_msisdn, 'member_msisdn' => $targetMsisdn, 'slot_id' => $slot->slot_id, 'family_id' => $slot->family_id_empty, 'kuber_gb' => $product->kuber_gb, 'process_at' => now()->addMinutes(2), 'status_queue' => 'pending', 'created_at' => now(), 'updated_at' => now()
                ]);

                DB::commit();
                return response()->json(['status' => true, 'message' => "BERHASIL INVITE! SN: " . $snSakti]);
            } else {
                // JIKA GAGAL, SALDO DIKEMBALIKAN (ANTI RUGI)
                DB::rollBack();
                return response()->json(['status' => false, 'message' => "GAGAL DARI PUSAT XL! [Kode: " . $trxCode . "] Detail: " . $errMsg]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("FATAL ORDER EXCEPTION: " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Terjadi kendala koneksi server internal.']);
        }
    }
}
