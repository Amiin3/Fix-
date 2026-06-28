<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\HesdaService;

class HesdaController extends Controller {
    
    public function index() {
        return Inertia::render('Admin/Hesda/Index');
    }

    // API Internal buat dipanggil React
    public function fetchBalance(HesdaService $hesda) {
        return response()->json($hesda->getBalance());
    }

    public function fetchPackages(Request $request, HesdaService $hesda) {
        $jenis = $request->jenis ?? 'pa';
        return response()->json($hesda->getPackages($jenis));
    }

    // 🚀 API INTERNAL UNTUK CEK STOK
    public function fetchStock(Request $request, HesdaService $hesda) {
        $type = $request->type;
        return response()->json($hesda->cekStok($type));
    }
}