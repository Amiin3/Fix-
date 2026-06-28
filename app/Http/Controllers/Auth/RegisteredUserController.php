<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class RegisteredUserController extends Controller {
    public function create() {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request) {
        // 🔥 JURUS VALIDASI MANUAL (MEMAKSA ERROR KELUAR)
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'whatsapp' => ['required', 'numeric', 'digits_between:10,15', 'unique:users', 'regex:/^(08|62)/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'referral_code' => ['nullable', 'string', 'exists:users,kode_referral'],
        ], [
            'email.unique' => 'Email ini sudah terdaftar Bosku!',
            'whatsapp.unique' => 'Nomor WhatsApp ini sudah dipakai!',
            'whatsapp.regex' => 'Gunakan format nomor Indonesia (08xxx)!',
            'password.confirmed' => 'Konfirmasi password tidak cocok!',
            'referral_code.exists' => 'Kode Referral tidak ditemukan!',
        ]);

        // KALAU GAGAL, TENDANG BALIK BAWA PESAN ERROR PAKSA!
        if ($validator->fails()) {
            $pesanError = $validator->errors()->first();
            Log::warning("VALIDASI DITOLAK: " . $pesanError);
            return back()->with('error', $pesanError);
        }

        try {
            DB::beginTransaction();
            $otp = rand(100000, 999999);
            
            $user = new User();
            $user->name = $request->name;
            $user->email = $request->email;
            $user->whatsapp = $request->whatsapp;
            
            if ($request->referral_code) {
                $uplink = User::where('kode_referral', $request->referral_code)->first();
                if ($uplink) $user->uplink_id = $uplink->id;
            }
            
            $user->password = Hash::make($request->password);
            $user->otp_code = $otp;
            $user->saldo = 0;
            $user->level = 'Member';
            $user->status = 'pending';
            $user->save();

            // Kirim WA
            $token = config('services.fonnte.token');
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => $token
            ])->post('https://api.fonnte.com/send', [
                'target' => $request->whatsapp,
                'message' => "Halo *{$request->name}*! 👋\n\nKode OTP Anda: *{$otp}*\n\nJangan bagikan kode ini ke siapapun.",
            ]);

            DB::commit();
            session(['otp_email' => $user->email]);
            return redirect()->route('otp.verify');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("ERROR SISTEM: " . $e->getMessage());
            return back()->with('error', 'Gagal mendaftar, coba lagi nanti!');
        }
    }
}
