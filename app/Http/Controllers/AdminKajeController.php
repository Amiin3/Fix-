<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\KajeService;

class AdminKajeController extends Controller
{
    public function index()
    {
        $products = \DB::table('layanan_kaje')->orderByRaw("FIELD(status, 'active', 'inactive', '1', '0')")->orderBy('kategori', 'asc')->orderBy('harga_jual', 'asc')->get();
        $categories = \DB::table('layanan_kaje')->whereNotNull('kategori')->distinct()->pluck('kategori');
        
        return Inertia::render('Admin/KajeManager', [
            'layanan' => $products, // Sudah pakai nama 'layanan' sesuai React
            'categories' => $categories
        ]);
    }

    // A. EDIT SATUAN
    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'harga_jual' => 'required|numeric',
            'status' => 'required|string'
        ]);

        \DB::table('layanan_kaje')->where('id', $request->id)->update([
            'harga_jual' => $request->harga_jual,
            'status' => $request->status,
            'deskripsi' => $request->deskripsi
        ]);

        return back()->with('success', 'Data produk berhasil disimpan.');
    }

    // B. MASS UPDATE PROFIT (MARKUP MASSAL)
    public function massUpdate(Request $request)
    {
        $request->validate([
            'profit_amount' => 'required|numeric',
            'kategori_target' => 'required|string'
        ]);

        $profit = (float) $request->profit_amount;
        $query = \DB::table('layanan_kaje');

        if ($request->kategori_target !== 'all') {
            $query->where('kategori', $request->kategori_target);
        }

        $query->update(['harga_jual' => DB::raw("harga_beli + " . $profit)]);

        return back()->with('success', "Berhasil update margin keuntungan Rp " . number_format($profit) . " untuk kategori: " . strtoupper($request->kategori_target));
    }

    // C. SYNC PROVIDER (VERSI SMART OVERWRITE)
                            public function sync(KajeService $kaje)
    {
        set_time_limit(600);
        $res = $kaje->fetchKajeProducts();
        
        if (isset($res["success"]) && $res["success"] == true) {
            $products = isset($res["data"]["products"]) ? $res["data"]["products"] : (is_array($res["data"]) ? $res["data"] : []);
            
            if (count($products) > 0) {
                $updated = 0; $new = 0; $failed = 0; $last_error = "";
                
                foreach ($products as $p) {
                    try {
                        $code = trim($p["code"] ?? "");
                        if (empty($code)) continue;

                        $price_api = (int)($p["price"] ?? 0);
                        $stock_api = (int)($p["stock"] ?? 0);
                        $status_api = strtolower($p["status"] ?? "open");
                        
                        // Rangkai Deskripsi
                        $desc_text = "";
                        if (isset($p["description"]) && is_array($p["description"])) {
                            $desc_text = implode("\n", $p["description"]);
                        }

                        $exist = DB::table("layanan_kaje")->where("kode_layanan", $code)->first();

                        if ($exist) {
                            $current_margin = $exist->harga_jual - $exist->harga_beli;
                            $margin = ($current_margin > 0) ? $current_margin : 1000;

                            // Update Sesuai Kolom Rontgen
                            DB::table("layanan_kaje")->where("id", $exist->id)->update([
                                "harga_beli"  => $price_api,
                                "harga_asli"  => $price_api,
                                "harga_jual"  => $price_api + $margin,
                                "stok"        => $stock_api,
                                "status"      => in_array($status_api, ["open", "kosong", "active", "1"]) ? "active" : "inactive",
                                "last_update" => now(),
                                "updated_at"  => now()
                            ]);
                            $updated++;
                        } else {
                            // Insert Sesuai Kolom Rontgen (Tanpa kolom "tanggal" siluman)
                            DB::table("layanan_kaje")->insert([
                                "kode_layanan" => $code,
                                "nama_layanan" => $p["name"] ?? "Produk Baru",
                                "kategori"     => $p["category"] ?? "Umum",
                                "harga_beli"   => $price_api,
                                "harga_asli"   => $price_api,
                                "harga_jual"   => $price_api + 1000,
                                "stok"         => $stock_api,
                                "status"       => in_array($status_api, ["open", "kosong", "active", "1"]) ? "active" : "inactive",
                                "deskripsi"    => $desc_text,
                                "last_update"  => now(),
                                "created_at"   => now(),
                                "updated_at"   => now()
                            ]);
                            $new++;
                        }
                    } catch (\Exception $e) {
                        $failed++;
                        $last_error = $e->getMessage();
                        continue;
                    }
                }
                
                $msg = "Sync Selesai! Update: $updated, Baru: $new.";
                if ($failed > 0) $msg .= " Gagal: $failed (Error: " . substr($last_error, 0, 100) . ")";
                return back()->with("success", $msg);
            }
        }
        return back()->withErrors(["message" => "Gagal mengambil data atau data kosong."]);
    }

    public function destroy($id)
    {
        \DB::table('layanan_kaje')->where('id', $id)->delete();
        return back()->with('success', 'Produk berhasil dihapus.');
    }
}
