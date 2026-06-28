<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentSettingController extends Controller {
    public function index() {
        return Inertia::render('Admin/PaymentSetting', [
            'methods' => DB::table('payment_methods')->get()
        ]);
    }

    public function store(Request $request) {
        foreach ($request->methods as $m) {
            DB::table('payment_methods')->where('id', $m['id'])->update([
                'name' => $m['name'],
                'value' => $m['value'],
                'holder' => $m['holder'],
            ]);
        }
        return back()->with('success', 'Konfigurasi MilaPay Berhasil Diperbarui!');
    }
}
