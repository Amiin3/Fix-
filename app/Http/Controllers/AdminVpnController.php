<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\VpnProduct;
use Inertia\Inertia;

class AdminVpnController extends Controller
{
    public function index() {
        return Inertia::render('Admin/VpnManager', [
            'products' => VpnProduct::all()
        ]);
    }
    public function update(Request $request) {
        $request->validate([
            'id' => 'required|integer',
            'price_per_day' => 'required|numeric',
            'price_per_gb' => 'required|numeric',
            'price_per_ip' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean'
        ]);
        VpnProduct::where('id', $request->id)->update([
            'price_per_day' => $request->price_per_day,
            'price_per_gb' => $request->price_per_gb,
            'price_per_ip' => $request->price_per_ip,
            'description' => $request->description,
            'is_active' => $request->is_active
        ]);
        return redirect()->back()->with('success', 'Harga, Kuota & Limit IP berhasil diperbarui!');
    }
}
