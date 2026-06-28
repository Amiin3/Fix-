<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $user = Socialite::driver('google')->stateless()->user();
            if (!$user->email) return redirect('/login');
            
            $dbUser = User::where('email', $user->email)->first();
            if($dbUser){
                Auth::login($dbUser, true);
                return redirect()->to('/dashboard');
            } else {
                $newUser = User::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'google_id'=> $user->id,
                    'password' => Hash::make(Str::random(16)),
                    'saldo' => 0,
                    'email_verified_at' => now(),
                    'status' => 'aktif'
                ]);
                Auth::login($newUser, true);
                return redirect()->to('/dashboard');
            }
        } catch (\Exception $e) {
            return redirect('/login');
        }
    }
}
