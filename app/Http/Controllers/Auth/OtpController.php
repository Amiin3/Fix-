<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OtpController extends Controller
{
    // Halaman Minta Nomor WA
    public function setup() {
        if (!session('otp_email')) return redirect('/login');
        return Inertia::render('Auth/SetupWhatsapp', ['email' => session('otp_email')]);
    }

    // Proses Kirim OTP Fonnte
    public function sendOtp(Request $request) {
        $request->validate(['whatsapp' => 'required|string|max:20', 'email' => 'required']);
        $user = User::where('email', $request->email)->first();

        // Cek jangan sampai WA dobel
        $waExists = User::where('whatsapp', $request->whatsapp)->where('id', '!=', $user->id)->first();
        if($waExists) {
            return back()->withErrors(['whatsapp' => 'Nomor WA ini sudah dipakai akun lain!']);
        }

        $otp = rand(100000, 999999);
        $user->whatsapp = $request->whatsapp;
        $user->otp_code = $otp;
        $user->save();

        // Tembak OTP Fonnte
        $curl = curl_init();
        curl_setopt_array($curl, array(
          CURLOPT_URL => 'https://api.fonnte.com/send',
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_CUSTOMREQUEST => 'POST',
          CURLOPT_POSTFIELDS => array(
            'target' => $request->whatsapp,
            'message' => "Halo *{$user->name}*! 👋\n\nKode verifikasi Mila Store Anda adalah: *{$otp}*\n\nJangan berikan kode ini ke siapapun.",
          ),
          CURLOPT_HTTPHEADER => array('Authorization: ' . config('services.fonnte.token')),
        ));
        curl_exec($curl);
        curl_close($curl);

        return redirect()->route('otp.verify');
    }

    // Halaman Input OTP
    public function show() {
        if (!session('otp_email')) return redirect('/login');
        return Inertia::render('Auth/VerifyOtp', ['email' => session('otp_email')]);
    }

    // Proses Cek OTP
    public function verify(Request $request) {
        $request->validate(['otp' => 'required', 'email' => 'required']);
        $user = User::where('email', $request->email)->first();

        if ($user && $user->otp_code == $request->otp) {
            $user->wa_verified_at = now();
            $user->otp_code = null;
            $user->status = 'aktif';
            $user->save();
            
            Auth::login($user);
            session()->forget('otp_email');
            
            return redirect('/')->with('success', 'Verifikasi WhatsApp Berhasil!');
        }
        
        return back()->withErrors(['otp' => 'Kode OTP salah atau tidak ditemukan!']);
    }
}
