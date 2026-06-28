<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PromoController extends Controller
{
    public function index()
    {
        $promos = DB::table('promos')->orderBy('id', 'desc')->get();
        return Inertia::render('Admin/PromoManager', [
            'promos' => $promos
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required',
            'theme' => 'required',
        ]);

        try {
            DB::table('promos')->insert([
                'title' => $request->title,
                'description' => $request->description,
                'theme' => $request->theme, // indigo atau rose
                'icon' => $request->icon ?? 'fa-star',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', 'Promo berhasil diterbitkan! 🔥');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Gagal simpan: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        DB::table('promos')->where('id', $id)->delete();
        return back()->with('success', 'Promo berhasil dihapus!');
    }
}
