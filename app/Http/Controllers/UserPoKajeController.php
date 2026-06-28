<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserPoKajeController extends Controller {
    public function index() {
        // 1. Ambil KDA dan PDAP dari database
        $rawProducts = DB::table('layanan_kaje')
            ->where(function($q) {
                $q->where('kode_layanan', 'LIKE', 'KDA%')
                  ->orWhere('kode_layanan', 'LIKE', 'PDAP%');
            })
            ->orderBy('harga_jual', 'asc')
            ->get();
        
        // 2. 🚫 FILTER BLACKLIST: Buang produk yang sudah tidak aktif
        $products = $rawProducts->filter(function ($item) {
            $nama = $item->nama_layanan ?? $item->nama ?? '';
            
            // 📝 Tulis nama produk yang mau disembunyikan di sini:
            $blacklist = [
                '11GB + Lokal (3hr)',
                '14GB + Lokal (5hr)',
                '28GB + Lokal (7hr)'
            ];

            foreach ($blacklist as $mati) {
                // Jika nama produk mengandung kata di blacklist, JANGAN DITAMPILKAN!
                if (stripos($nama, $mati) !== false) {
                    return false; 
                }
            }
            return true; // Selain yang diblacklist, boleh tampil
        })->values(); // Susun ulang antrian data

        // 3. Kirim ke React/Inertia Frontend
        return inertia('Order/PoKaje', [
            'products' => $products
        ]);
    }
}
