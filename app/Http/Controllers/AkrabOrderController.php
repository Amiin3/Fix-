<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AkrabOrderController extends Controller {

    public function index() {
        $user = Auth::user();
        
        // 🚀 PAKSA BACA LEVEL DARI DB (Bypass Session Nyangkut)
        $dbUser = DB::table('users')->where('id', $user->id)->first();
        $userLevel = $dbUser->level ?? 'member';

        $products = DB::table('layanan_khfy')
            ->where(function($q) {
                $q->where('kode_layanan', 'like', 'XLA%')
                  ->orWhere('kode_layanan', 'like', 'XDA%')
                  ->orWhere('kode_layanan', 'like', 'FMX%')
                  ->orWhere('kode_layanan', 'like', 'CFMX%')
                  ->orWhere('kode_layanan', 'like', 'CEKPLN%')
                  ->orWhere('kode_layanan', 'like', 'BPA%')
                  ->orWhere('kode_layanan', 'like', 'XLB%');
            })
            ->orderBy('harga_jual', 'asc')
            ->get();

        // 🚀 SUNTIKAN DISKON SULTAN (Untuk Tampilan)
        $products->transform(function($item) use ($userLevel) {
            $item->harga_jual = $this->hitungHargaReseller(
                $item->harga_jual, 
                $item->harga_beli, 
                'khfy', 
                $userLevel
            );
            return $item;
        });

        return Inertia::render('Order/Akrab', [
            'auth' => ['user' => $user],
            'userBalance' => $user->saldo ?? 0,
            'products' => $products
        ]);
    }

                        public function checkStock() {
        $liveStock = [];

        // 1. KHFY V3 (XLA & PROMO XLA)
        try {
            $resXla = \Illuminate\Support\Facades\Http::timeout(5)->get('https://panel.khfy-store.com/api_v3/cek_stock_akrab');
            if ($resXla->successful() && isset($resXla->json()['data'])) {
                foreach ($resXla->json()['data'] as $item) {
                    if (isset($item['type']) && isset($item['sisa_slot'])) {
                        // FIX MUTLAK: Huruf Besar Semua & Hilangkan Spasi Gaib
                        $kode = strtoupper(trim($item['type']));
                        $slot = (int) $item['sisa_slot'];
                        
                        $liveStock[] = ['type' => $kode, 'sisa_slot' => $slot];
                        
                        // Kloning Otomatis ke Versi Promo (XLA -> XLAP)
                        if (str_starts_with($kode, 'XLA')) {
                            $liveStock[] = ['type' => str_replace('XLA', 'XLAP', $kode), 'sisa_slot' => $slot];
                        }
                    }
                }
            }
        } catch (\Exception $e) {}

        // 2. KHFY V2 (XDA & PROMO XDA)
        try {
            $resXda = \Illuminate\Support\Facades\Http::timeout(5)->get('https://panel.khfy-store.com/api_v3/cek_stock_akrab_v2');
            if ($resXda->successful()) {
                $dataXda = $resXda->json();
                if (isset($dataXda['status']) && $dataXda['status'] === true && !empty($dataXda['message'])) {
                    $lines = explode("\n", trim($dataXda['message']));
                    foreach ($lines as $line) {
                        if (strpos($line, '|') !== false) {
                            $parts = explode('|', $line);
                            // FIX MUTLAK: Huruf Besar Semua & Hilangkan Spasi Gaib
                            $kodeXda = strtoupper(trim($parts[0]));
                            $slotXda = (int) filter_var(trim($parts[1]), FILTER_SANITIZE_NUMBER_INT);
                            
                            $liveStock[] = ['type' => $kodeXda, 'sisa_slot' => $slotXda];
                            
                            // Kloning Otomatis ke Versi Promo (XDA -> XDAP)
                            if (str_starts_with($kodeXda, 'XDA')) {
                                $liveStock[] = ['type' => str_replace('XDA', 'XDAP', $kodeXda), 'sisa_slot' => $slotXda];
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {}

        return response()->json(['ok' => true, 'data' => array_values($liveStock)]);
    }

    public function processOrder(Request $request) {
        $request->validate(['no_hp' => 'required', 'kode_layanan' => 'required']);
        $user = Auth::user();
        
        // 🚀 BACA LEVEL REAL-TIME UNTUK TRANSAKSI
        $dbUserSession = DB::table('users')->where('id', $user->id)->first();
        $userLevel = $dbUserSession->level ?? 'member';

        $apiKey = env('KHFY_API_KEY');
        $product = DB::table('layanan_khfy')->where('kode_layanan', $request->kode_layanan)->first();
        if (!$product) return back()->with('error', 'Layanan tidak ditemukan!');

        // 🚀 HITUNG HARGA DISKON (Untuk Potong Saldo)
        $hargaFinal = $this->hitungHargaReseller(
            $product->harga_jual, 
            $product->harga_beli, 
            'khfy', 
            $userLevel
        );

        $numbers = $request->is_multi ? array_filter(preg_split('/[\r\n, ]+/', $request->no_hp)) : [$request->no_hp];
        $totalHarga = $hargaFinal * count($numbers);

        // 🚀 BENTENG SULTAN: LOCK & POTONG SALDO DULUAN
        DB::beginTransaction();
        try {
            $dbUser = \App\Models\User::where("id", $user->id)->lockForUpdate()->first();
            if ($dbUser->saldo < $totalHarga) {
                DB::rollBack();
                return back()->with('error', 'Saldo tidak mencukupi!');
            }
            DB::table('users')->where('id', $user->id)->decrement('saldo', $totalHarga);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses saldo.');
        }

        $lastMsg = "";
        $anyFail = false;

        foreach($numbers as $target) {
            $refId = 'TRX-AKR-' . date('YmdHis') . rand(100,999);

            // Catat awal sebagai Proses/Pending
            DB::table('transaksi')->insert([
                'ref_id' => $refId, 'username' => $user->username ?? $user->name,
                'kode_layanan' => $product->kode_layanan, 'tujuan' => $target,
                'harga' => $hargaFinal, 'status' => 'Pending',
                'sn' => 'Menghubungi Provider...', 'tanggal' => now(),
                'created_at' => now(), 'updated_at' => now()
            ]);

            // 📡 TEMBAK PROVIDER
            try {
                $response = \Illuminate\Support\Facades\Http::timeout(25)->get('https://panel.khfy-store.com/api_v2/trx', [
                    'api_key' => $apiKey, 'produk' => $product->kode_layanan,
                    'tujuan' => $target, 'reff_id' => $refId
                ]);
                
                $res = $response->json();
                $rawMsg = is_array($res) ? ($res['msg'] ?? $res['message'] ?? json_encode($res)) : $response->body();
                
                // SENSOR RAHASIA DAPUR
                $cleanMsg = $rawMsg;
                if (strpos($rawMsg, '#') !== false) {
                    $parts = explode('#', $rawMsg);
                    $cleanMsg = '#' . trim($parts[1]);
                } else {
                    $cleanMsg = preg_replace('/(kodereseller=|password=|pin=)[^&]+&?/i', '***&', $cleanMsg);
                }

                if (stripos($cleanMsg, 'saldo') !== false) $cleanMsg = "Kendala sistem, lapor Admin.";

                // ⚖️ KETUK PALU: GAGAL ATAU LANJUT?
                $isExplicitFail = (stripos($rawMsg, 'gagal') !== false || stripos($rawMsg, 'salah') !== false || stripos($rawMsg, 'wilayah') !== false);

                if ($isExplicitFail) {
                    // 🔴 GAGAL: REFUND REAL-TIME (Sesuai Harga Diskon)
                    DB::transaction(function() use ($user, $hargaFinal, $refId, $cleanMsg) {
                        DB::table('users')->where('id', $user->id)->increment('saldo', $hargaFinal);
                        DB::table('transaksi')->where('ref_id', $refId)->update([
                            'status' => 'Gagal', 'sn' => $cleanMsg, 'updated_at' => now()
                        ]);
                    });
                    $lastMsg = $cleanMsg;
                    $anyFail = true;
                } else {
                    // 🟢 DITERIMA/PENDING: UPDATE SN SAJA
                    $trxid = is_array($res) ? ($res['data']['trxid'] ?? $res['trxid'] ?? 'PROSES') : 'PROSES';
                    DB::table('transaksi')->where('ref_id', $refId)->update([
                        'ref_id_provider' => $trxid, 'sn' => $cleanMsg, 'updated_at' => now()
                    ]);
                    $lastMsg = $cleanMsg;
                }
            } catch (\Exception $e) {
                // TIMEOUT: BIARKAN PENDING (ANTI RUGI)
                Log::error("KHFY TIMEOUT: " . $e->getMessage());
                $lastMsg = "Provider sedang sibuk, cek riwayat berkala.";
            }
        }

        if ($anyFail && count($numbers) == 1) {
            return back()->with('error', $lastMsg);
        }
        return back()->with('success', $lastMsg);
    }
}
