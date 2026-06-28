<?php
namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            // 🔥 INI JALUR VIP-NYA! KITA KIRIM DATA FULL TANPA SENSOR 🔥
            'full_user' => $request->user(), 
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // Fungsi update bawaan
        $user = $request->user();
        $user->fill($request->validated());
        if ($user->isDirty('email')) { $user->email_verified_at = null; }
        $user->save();
        return Redirect::route('profile.edit');
    }

    public function updateMurni(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'whatsapp' => 'nullable|string|max:20|unique:users,whatsapp,'.$user->id,
            'avatar' => 'nullable|image|max:5120', // Terima file foto biasa
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->whatsapp = $request->whatsapp;

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // SIMPAN FILE KE STORAGE SECARA NATIVE
        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();
        return Redirect::route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return Redirect::to('/');
    }

    public function updateH2H(\Illuminate\Http\Request $request) {
        $user = auth()->user();
        if ($request->action === "generate") {
            $user->api_key = \Illuminate\Support\Str::random(32);
        } else {
            $user->webhook_url = $request->webhook_url;
            $user->ip_whitelist = $request->ip_whitelist;
        }
        $user->save();
        return response()->json(["status" => true, "message" => "Konfigurasi H2H & Webhook Tersimpan!"]);
    }
}