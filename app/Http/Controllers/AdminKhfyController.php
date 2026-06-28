<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Services\KhfyService;
use App\Services\TelegramService; // 🚨 IMPORT SERVICE TELEGRAM

class AdminKhfyController extends Controller
{
    public function index(Request $request) {
        $filter_cat = $request->cat;
        $query = DB::table('layanan_khfy');
        if ($filter_cat) $query->where('kategori', $filter_cat);
        return Inertia::render('Admin/KhfyManager', [
            'layanan' => $query->orderBy('kategori', 'asc')->orderBy('harga_jual', 'asc')->get(),
            'categories' => DB::table('layanan_khfy')->distinct()->pluck('kategori'),
            'filter_cat' => $filter_cat
        ]);
    }

    public function sync(Request $request, KhfyService $khfy) {
        set_time_limit(0);
        $res = $khfy->request('/list_product');
        $data = $res['data'] ?? $res ?? [];
        if (empty($data) || !is_array($data)) return back()->with('error', 'Gagal: Data Kosong');
        try {
            DB::transaction(function() use ($data, $request) {
                foreach ($data as $p) {
                    $kode = $p['kode_produk'] ?? $p['code'] ?? null;
                    if (!$kode) continue;
                    $harga_beli = (float)($p['harga_final'] ?? $p['price'] ?? 0);
                    $status = (($p['gangguan'] ?? 0) == 0 && ($p['kosong'] ?? 0) == 0) ? 'active' : 'inactive';
                    $nama = $p['nama_produk'] ?? $p['name'] ?? 'Tanpa Nama';
                    $kategori = str_contains(strtolower($nama), 'akrab') || str_starts_with($kode, 'XLA') || str_starts_with($kode, 'XDA') ? 'XL Akrab' : (str_contains(strtolower($nama), 'axis') ? 'Axis' : (str_contains(strtolower($nama), 'pln') || str_starts_with($kode, 'PLN') ? 'PLN' : 'Umum'));
                    $raw_desc = $p['deskripsi'] ?? $p['description'] ?? $p['keterangan'] ?? "• Layanan $nama\n• Proses Instan";
                    (float)$harga_jual = ceil(($harga_beli + (float)$request->markup_value) / 100) * 100;
                    DB::table('layanan_khfy')->updateOrInsert(
                        ['kode_layanan' => $kode],
                        ['nama_layanan' => $nama, 'deskripsi' => $raw_desc, 'kategori' => $kategori, 'brand' => $kategori, 'harga_beli' => $harga_beli, 'status' => $status, 'tipe' => 'general', 'harga_jual' => $request->reset_harga ? $harga_jual : DB::raw("IFNULL(harga_jual, $harga_jual)"), 'updated_at' => now()]
                    );
                }
            });
            return back()->with('success', 'Sync Khfy Berhasil!');
        } catch (\Exception $e) { return back()->with('error', 'Error Database Sync'); }
    }

        public function bulk(Request $request) {
        $request->validate(['action_type' => 'required', 'ids' => 'required|array']);
        $action = $request->action_type;
        $ids = $request->ids;
        
        try {
            \Illuminate\Support\Facades\DB::beginTransaction();
            
            if ($action === 'active') {
                \Illuminate\Support\Facades\DB::table('layanan_khfy')->whereIn('id', $ids)->update(['status' => 'active', 'updated_at' => now()]);
                $msg = 'Produk berhasil diaktifkan!';
            } elseif ($action === 'inactive') {
                \Illuminate\Support\Facades\DB::table('layanan_khfy')->whereIn('id', $ids)->update(['status' => 'inactive', 'updated_at' => now()]);
                $msg = 'Produk berhasil dimatikan!';
            } elseif ($action === 'delete') {
                \Illuminate\Support\Facades\DB::table('layanan_khfy')->whereIn('id', $ids)->delete();
                $msg = 'Produk berhasil dihapus!';
            } elseif ($action === 'markup') {
                $val = (float) $request->bulk_val;
                $mode = $request->bulk_mode; // 'flat' atau 'percent'
                
                $products = \Illuminate\Support\Facades\DB::table('layanan_khfy')->whereIn('id', $ids)->get();
                foreach ($products as $p) {
                    if ($mode === 'percent') {
                        // Jika persen: Harga Beli + (Persen dari Harga Beli) -> Bulatkan ke atas kelipatan 100
                        $newPrice = ceil(($p->harga_beli + ($p->harga_beli * ($val / 100))) / 100) * 100;
                    } else {
                        // Jika flat (Rp): Harga Beli + Nominal -> Bulatkan ke atas kelipatan 100
                        $newPrice = ceil(($p->harga_beli + $val) / 100) * 100;
                    }
                    \Illuminate\Support\Facades\DB::table('layanan_khfy')->where('id', $p->id)->update(['harga_jual' => $newPrice, 'updated_at' => now()]);
                }
                $msg = 'Markup harga massal berhasil diterapkan!';
            } else {
                \Illuminate\Support\Facades\DB::rollBack();
                return back()->with('error', 'Aksi tidak dikenali.');
            }
            
            \Illuminate\Support\Facades\DB::commit();
            return back()->with('success', $msg);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return back()->with('error', 'Gagal memproses aksi: ' . $e->getMessage());
        }
    }
    public function warIndex() { return Inertia::render('Admin/Khfy/War', ['stockData' => []]); }
    public function warPoIndex() { return Inertia::render('Admin/Khfy/WarPo'); }
    
    public function warList(Request $request) {
        $data = DB::table('antrian_po')->orderBy('id', 'desc')->limit(100)->get();
        $formatted = $data->map(function($row) {
            return [
                'waktu' => date('H:i:s', strtotime($row->tanggal ?? $row->created_at ?? date('Y-m-d H:i:s'))),
                'ref' => $row->ref_id, 'user' => $row->username, 'produk' => $row->kode_produk . " (P" . ($row->prioritas ?? 0) . ")",
                'tujuan' => $row->tujuan, 'harga' => 'Rp ' . number_format($row->harga, 0, ',', '.'), 'status' => $row->status
            ];
        });
        return response()->json(['data' => $formatted]);
    }

    public function warAction(Request $request) {
        $aksi = $request->action;
        if ($aksi == 'kalibrasi') {
            set_time_limit(0);
            $khfy_url = rtrim(env("KHFY_URL", "https://panel.khfy-store.com/api_v2"), '/');
            $api_key = trim(env("KHFY_API_KEY"));
            $ghosts = DB::table("antrian_po")->whereIn("status", ["Proses_API", "Pending"])->where("updated_at", ">=", now()->subHours(1))->get();
            if ($ghosts->isEmpty()) return response()->json(['status' => 'info', 'log' => "🧹 KALIBRASI: Radar bersih."]);
            $c_sukses = 0; $c_gagal = 0; $c_retry = 0;
            foreach ($ghosts as $ghost) {
                try {
                    $res_sweep = Http::withoutVerifying()->connectTimeout(3)->timeout(5)->get("{$khfy_url}/history", ['api_key' => $api_key, 'refid' => $ghost->ref_id]);
                    if ($res_sweep->successful()) {
                        $dt = $res_sweep->json();
                        if (isset($dt["ok"]) && $dt["ok"] == true && isset($dt["count"]) && $dt["count"] > 0 && isset($dt["data"][0])) {
                            $data_api = $dt["data"][0];
                            $status_api = strtoupper($data_api["status_text"] ?? '');
                            $ket = strtolower($data_api["keterangan"] ?? '');
                            $sn = $data_api["sn"] ?: ($data_api["keterangan"] ?? "OK_SWEEP");
                            
                            if ($status_api == 'SUKSES') {
                                DB::table("antrian_po")->where("id", $ghost->id)->update(["status" => "Sukses", "updated_at" => now()]);
                                DB::table("transaksi")->where("ref_id", $ghost->ref_id)->update(["status" => "Sukses", "sn" => $sn]);
                                $c_sukses++;
                                // 🚨 PELATUK NOTIFIKASI SUKSES (KALIBRASI)
                                $msg = "✅ *TRANSAKSI SUKSES (Sweep)*\n\n👤 User: {$ghost->username}\n📦 Produk: {$ghost->kode_produk}\n📱 Tujuan: `{$ghost->tujuan}`\n🔑 SN: `{$sn}`\n💸 Harga: Rp " . number_format($ghost->harga, 0, ',', '.');
                                TelegramService::sendMessage($msg);
                            } elseif ($status_api == 'GAGAL' || $status_api == 'BATAL') {
                                $is_fatal = str_contains($ket, "salah") || str_contains($ket, "tidak terdaftar") || str_contains($ket, "invalid") || str_contains($ket, "not_allowed");
                                if (!$is_fatal) {
                                    $fresh_ref = "WAR-" . date("YmdHis") . "-" . rand(100, 999);
                                    DB::table("transaksi")->where("ref_id", $ghost->ref_id)->update(["ref_id" => $fresh_ref, "status" => "Pending", "sn" => "Menunggu Stok (Sweep)"]);
                                    DB::table("antrian_po")->where("id", $ghost->id)->update(["ref_id" => $fresh_ref, "status" => "Menunggu", "updated_at" => now()]);
                                    $c_retry++;
                                } else {
                                    DB::beginTransaction();
                                    try {
                                        DB::table("antrian_po")->where("id", $ghost->id)->update(["status" => "Gagal", "updated_at" => now()]);
                                        DB::table("transaksi")->where("ref_id", $ghost->ref_id)->update(["status" => "Gagal", "sn" => $sn]);
                                        DB::table("users")->where("name", $ghost->username)->increment("saldo", $ghost->harga);
                                        DB::commit();
                                        $c_gagal++;
                                        // 🚨 PELATUK NOTIFIKASI GAGAL (KALIBRASI)
                                        $msg = "❌ *TRANSAKSI GAGAL (Refunded)*\n\n👤 User: {$ghost->username}\n📦 Produk: {$ghost->kode_produk}\n📱 Tujuan: `{$ghost->tujuan}`\n💬 Alasan: {$ket}";
                                        TelegramService::sendMessage($msg);
                                    } catch (\Exception $e) { DB::rollBack(); }
                                }
                            }
                        }
                    }
                } catch (\Exception $e) {}
            }
            return response()->json(['status' => 'success', 'log' => "🧹 KALIBRASI SELESAI: $c_sukses Sukses | $c_gagal Direfund | $c_retry Di-Retry."]);
        }
        return response()->json(['status' => 'error', 'log' => 'Aksi tidak dikenal.']);
    }

    public function warExecute(Request $request) {
        if (Cache::get('khfy_sniper_mode', 'on') === 'off') {
            return response()->json(["status" => "idle", "log" => "💤 RADAR NONAKTIF: Dimatikan via Bot Telegram Admin."]);
        }

        set_time_limit(60);
        $db = DB::connection();
        $khfy_url = rtrim(env("KHFY_URL", "https://panel.khfy-store.com/api_v2"), '/');
        $api_key = trim(env("KHFY_API_KEY"));
        $logs = [];

        $pending_trx = $db->table("antrian_po")
            ->join('users', 'antrian_po.username', '=', 'users.name')
            ->where("antrian_po.status", "Proses_API")
            ->select('antrian_po.*', 'users.email')
            ->limit(2)->get();
            
        $active_count = $pending_trx->count();
        
        foreach ($pending_trx as $item) {
            try {
                $res_cek = Http::withoutVerifying()->withUserAgent('Mozilla/5.0')->connectTimeout(3)->timeout(5)
                    ->get("{$khfy_url}/history", ['api_key' => $api_key, 'refid' => $item->ref_id]);
                    
                if ($res_cek->successful()) {
                    $dt = $res_cek->json();
                    if (isset($dt["ok"]) && $dt["ok"] == true && isset($dt["count"]) && $dt["count"] > 0 && isset($dt["data"][0])) {
                        $data_api = $dt["data"][0];
                        $status_api = strtoupper($data_api["status_text"] ?? '');
                        $ket = strtolower($data_api["keterangan"] ?? '');
                        $sn = $data_api["sn"] ?: ($data_api["keterangan"] ?? "OK");
                        
                        if ($status_api == 'SUKSES') {
                            $db->table("antrian_po")->where("id", $item->id)->update(["status" => "Sukses", "error_count" => 0, "updated_at" => now()]);
                            $db->table("transaksi")->where("ref_id", $item->ref_id)->update(["status" => "Sukses", "sn" => $sn]);
                            $active_count--;
                            $logs[] = "✅ [SCANNER] {$item->tujuan} SUKSES!";
                            
                            // 🚨 PELATUK NOTIFIKASI SUKSES (WAR ENGINE)
                            $msg = "✅ *TRANSAKSI SUKSES (Sniper)*\n\n👤 User: {$item->username}\n📦 Produk: {$item->kode_produk}\n📱 Tujuan: `{$item->tujuan}`\n🔑 SN: `{$sn}`\n💸 Harga: Rp " . number_format($item->harga, 0, ',', '.');
                            TelegramService::sendMessage($msg);

                        } elseif ($status_api == 'GAGAL' || $status_api == 'BATAL') {
                            $is_fatal = str_contains($ket, "salah") || str_contains($ket, "tidak terdaftar") || str_contains($ket, "invalid") || str_contains($ket, "not_allowed");
                            if (!$is_fatal) {
                                $fresh_ref = "WAR-" . date("YmdHis") . "-" . rand(100, 999);
                                $db->table("transaksi")->where("ref_id", $item->ref_id)->update(["ref_id" => $fresh_ref, "status" => "Pending"]);
                                $db->table("antrian_po")->where("id", $item->id)->update(["ref_id" => $fresh_ref, "status" => "Menunggu", "updated_at" => now()]);
                                $active_count--;
                                $logs[] = "🎯 [STANDBY] {$item->tujuan} Siaga 1 Tunggu Restok!";
                            } else {
                                DB::beginTransaction();
                                try {
                                    $lock = $db->table("transaksi")->where("ref_id", $item->ref_id)->lockForUpdate()->first();
                                    if ($lock && !in_array($lock->status, ['Sukses', 'Gagal', 'Dibatalkan'])) {
                                        $db->table("antrian_po")->where("id", $item->id)->update(["status" => "Gagal", "updated_at" => now()]);
                                        $db->table("transaksi")->where("ref_id", $item->ref_id)->update(["status" => "Gagal", "sn" => $sn]);
                                        $db->table("users")->where("name", $item->username)->increment("saldo", $item->harga);
                                        $logs[] = "❌ [SCANNER] {$item->tujuan} NOMOR INVALID (Refund).";
                                        
                                        // 🚨 PELATUK NOTIFIKASI GAGAL (WAR ENGINE)
                                        $msg = "❌ *TRANSAKSI GAGAL (Refunded)*\n\n👤 User: {$item->username}\n📦 Produk: {$item->kode_produk}\n📱 Tujuan: `{$item->tujuan}`\n💬 Alasan: {$ket}";
                                        TelegramService::sendMessage($msg);
                                    }
                                    DB::commit();
                                    $active_count--;
                                } catch (\Exception $e) { DB::rollBack(); }
                            }
                        }
                    }
                }
            } catch (\Exception $e) {}
        }

        $slot_tersedia = 2 - $active_count;
        if ($slot_tersedia <= 0) return response()->json(["status" => "warning", "log" => "⏳ LIMIT 2/2 PENUH! Mesin fokus Scanner..."]);
        
        $antrean_tunggu = $db->table("antrian_po")->where("status", "Menunggu")->orderBy("prioritas", "asc")->orderBy("id", "asc")->get();
        if ($antrean_tunggu->isEmpty()) return response()->json(["status" => "success", "log" => "📡 RADAR BERSIH. Tidak ada antrean PO."]);

        $kode_dicari = $antrean_tunggu->pluck('kode_produk')->unique()->toArray();
        $produk_ready = [];

        try {
            $res_v3 = Http::withoutVerifying()->withUserAgent('Mozilla/5.0')->connectTimeout(5)->timeout(10)->get("https://panel.khfy-store.com/api_v3/cek_stock_akrab");
            if ($res_v3->successful()) {
                $data_v3 = $res_v3->json()['data'] ?? [];
                foreach ($data_v3 as $p) {
                    $k = $p['type'] ?? '';
                    $stok = $p['sisa_slot'] ?? 0;
                    if (in_array($k, $kode_dicari) && (int)$stok > 0) { $produk_ready[] = $k; }
                }
            }
        } catch (\Exception $e) {}

        if (empty($produk_ready)) return response()->json(["status" => "info", "log" => "💤 [RADAR] Stok pusat kosong. Wait..."]);

        DB::beginTransaction();
        try {
            $antrean_target = $db->table("antrian_po")->where("status", "Menunggu")->whereIn("kode_produk", $produk_ready)->orderBy("prioritas", "asc")->orderBy("id", "asc")->limit($slot_tersedia)->lockForUpdate()->get();
            if ($antrean_target->isEmpty()) { DB::rollBack(); return response()->json(["status" => "info", "log" => "Wait..."]); }
            $db->table("antrian_po")->whereIn("id", $antrean_target->pluck('id'))->update(["status" => "Proses_API", "updated_at" => now()]);
            DB::commit();
        } catch (\Exception $e) { DB::rollBack(); return response()->json(["status" => "warning", "log" => "Lock DB..."]); }
        
        foreach ($antrean_target as $target) {
            try {
                $response = Http::withoutVerifying()->withUserAgent('Mozilla/5.0')->connectTimeout(5)->timeout(15)->get("{$khfy_url}/trx", ['produk' => $target->kode_produk, 'tujuan' => $target->tujuan, 'reff_id' => $target->ref_id, 'api_key' => $api_key]);
                $res = $response->json();
                if ((isset($res["status"]) && $res["status"] == true) || (isset($res["ok"]) && $res["ok"] == true)) {
                    $logs[] = "🚀 [SHOOTER] {$target->tujuan} DOR!";
                } else {
                    $fresh_ref = "WAR-" . date("YmdHis") . "-" . rand(100, 999);
                    $db->table("transaksi")->where("ref_id", $target->ref_id)->update(["ref_id" => $fresh_ref]);
                    $db->table("antrian_po")->where("id", $target->id)->update(["ref_id" => $fresh_ref, "status" => "Menunggu", "updated_at" => now()]);
                }
            } catch (\Exception $e) {
                $db->table("antrian_po")->where("id", $target->id)->update(["status" => "Menunggu", "updated_at" => now()]);
            }
        }
        return response()->json(["status" => "success", "log" => implode(" | ", $logs)]);
    }

    public function updateSingle(\Illuminate\Http\Request $request) {
        $request->validate(['id' => 'required', 'nama_layanan' => 'required', 'harga_jual' => 'required|numeric']);
        \Illuminate\Support\Facades\DB::table('layanan_khfy')->where('id', $request->id)->update([
            'nama_layanan' => $request->nama_layanan,
            'deskripsi' => $request->deskripsi,
            'harga_jual' => $request->harga_jual,
            'updated_at' => now()
        ]);
        return back()->with('success', 'Produk berhasil diupdate secara presisi!');
    }
}
