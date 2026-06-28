<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\{DB, Auth};
use Inertia\Inertia;

class OrderPerdanaController extends Controller {
    public function index() {
        // Tembak tipe 'aktivasi perdana' dari database
        $items = DB::table('layanan')->where('status', 'active')->where('tipe', 'aktivasi perdana')->orderBy('harga_jual', 'asc')->get();
        $grouped = [];
        foreach ($items as $p) { $grouped[strtoupper($p->provider ?? 'UMUM')][] = $p; }
        return Inertia::render('Order/Perdana', [
            'products' => $items, 'groupedProducts' => (object)$grouped, 'userBalance' => Auth::user()->saldo ?? 0
        ]);
    }
}
