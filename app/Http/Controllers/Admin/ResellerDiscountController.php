<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ResellerDiscountController extends Controller
{
    public function index()
    {
        $discounts = DB::table('reseller_discounts')->pluck('potongan', 'provider')->toArray();
        return Inertia::render('Admin/ResellerDiscount', [
            'khfy' => $discounts['khfy'] ?? 0,
            'adam' => $discounts['adam'] ?? 0,
            'kaje' => $discounts['kaje'] ?? 0,
        ]);
    }

    public function update(Request $request)
    {
        $providers = ['khfy', 'adam', 'kaje'];
        foreach ($providers as $prov) {
            DB::table('reseller_discounts')->updateOrInsert(
                ['provider' => $prov],
                ['potongan' => $request->$prov ?? 0, 'updated_at' => now()]
            );
            Cache::forget('diskon_reseller_'.$prov); // Clear cache seketika
        }
        return back()->with('success', '✅ Boom! Diskon Reseller Berhasil Diterapkan!');
    }
}
