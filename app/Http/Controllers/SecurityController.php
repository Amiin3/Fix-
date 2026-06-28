<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SecurityController extends Controller
{
    // Fitur 1: Buat Lock Screen
    public function verifyPin(Request $request)
    {
        try {
            $request->validate(['pin' => 'required|digits:6']);
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => 'Sesi habis'], 401);

            $currentDbPin = DB::table('users')->where('id', $user->id)->value('pin_transaksi');

            if (empty($currentDbPin)) {
                DB::table('users')->where('id', $user->id)->update(['pin_transaksi' => $request->pin]);
                return response()->json(['success' => true, 'message' => 'PIN berhasil dibuat!']);
            }

            if ((string)$currentDbPin === (string)$request->pin) {
                return response()->json(['success' => true]);
            }
            return response()->json(['success' => false, 'message' => 'PIN salah!'], 403);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Server Error'], 500);
        }
    }

    // Fitur 2: Buat Halaman Profil (Ubah PIN)
    public function updatePin(Request $request)
    {
        $user = Auth::user();
        $currentDbPin = DB::table('users')->where('id', $user->id)->value('pin_transaksi');
        
        $rules = [
            'new_pin' => 'required|digits:6|confirmed',
        ];
        
        // Kalau user udah punya PIN, dia wajib masukin PIN lama dulu
        if (!empty($currentDbPin)) {
            $rules['current_pin'] = 'required|digits:6';
        }
        
        $request->validate($rules, [
            'new_pin.confirmed' => 'Konfirmasi PIN baru tidak cocok.',
            'new_pin.digits' => 'PIN harus 6 angka.',
            'current_pin.required' => 'PIN saat ini harus diisi.'
        ]);

        if (!empty($currentDbPin) && (string)$currentDbPin !== (string)$request->current_pin) {
            return back()->withErrors(['current_pin' => 'PIN saat ini salah.']);
        }

        DB::table('users')->where('id', $user->id)->update(['pin_transaksi' => $request->new_pin]);

        return back()->with('status', 'pin-updated');
    }
}
