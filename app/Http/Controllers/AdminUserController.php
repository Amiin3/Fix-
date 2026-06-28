<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    // 🚀 1. MENAMPILKAN DATA MEMBER (DENGAN PENCARIAN)
    public function index(Request $request) {
        $users = User::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('whatsapp', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();
            
        return inertia('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search'])
        ]);
    }

    // 🚀 2. FITUR EDIT INFO DASAR & WA (FIX LEVEL BUG)
    public function updateInfo(Request $request, $id) {
        $user = User::findOrFail($id);
        
        // 🛡️ PAGAR BETON: Validasi ketat untuk menghindari data kembar
        $request->validate([
            "name"  => "required|string|max:255",
            "email" => "required|email|unique:users,email,".$id,
            "phone" => "required|numeric|digits_between:10,15|unique:users,phone,".$id,
        ], [
            "email.unique" => "⚠️ GAGAL! Email ini sudah dimiliki member lain!",
            "phone.unique" => "⚠️ GAGAL! Nomor WA ini sudah dimiliki member lain!"
        ]);

        // 🚀 JURUS PAKSA UPDATE (Bypass Fillable Model)
        // Memastikan data langsung tertanam di dalam tabel Database detik itu juga!
        DB::table('users')->where('id', $id)->update([
            "name"       => $request->name,
            "email"      => $request->email,
            "phone"      => $request->phone,
            "whatsapp"   => $request->phone, // Sinkronkan WA dengan Phone
            "level"      => $request->level ?? $user->level,
            "saldo"      => $request->saldo ?? $user->saldo,
            "updated_at" => now()
        ]);

        return back()->with("success", "Data Member Berhasil Disinkronkan Permanen!");
    }

    // 🚀 3. FITUR TAMBAH / KURANG SALDO MANUAL
    public function updateBalance(Request $request, $id) {
        $user = User::findOrFail($id);
        $amount = (int)$request->amount;
        
        if ($request->type === 'add') {
            $user->increment('saldo', $amount);
        } else {
            $user->decrement('saldo', $amount);
        }
        
        return response()->json(['success' => true, 'message' => 'Saldo berhasil diubah!']);
    }

    // 🚀 4. FITUR RESET PASSWORD MEMBER
    public function updatePassword(Request $request, $id) {
        User::findOrFail($id); // Pastikan user ada
        DB::table('users')->where('id', $id)->update([
            'password'   => Hash::make($request->password),
            'updated_at' => now()
        ]);
        return response()->json(['success' => true, 'message' => 'Password berhasil direset!']);
    }

    // 🚀 5. FITUR GANTI LEVEL CEPAT (TOMBOL DROPDOWN)
    public function updateLevel(Request $request, $id) {
        User::findOrFail($id); // Pastikan user ada
        DB::table('users')->where('id', $id)->update([
            'level'      => $request->level,
            'updated_at' => now()
        ]);
        return response()->json(['success' => true, 'message' => 'Level berhasil diubah secara permanen!']);
    }

    // 🚀 6. FITUR SUSPEND / BEKUKAN AKUN MEMBER
    public function toggleSuspend($id) {
        $user = User::findOrFail($id);
        $newStatus = ($user->status === 'suspended') ? 'active' : 'suspended';
        
        DB::table('users')->where('id', $id)->update([
            'status'     => $newStatus, 
            'updated_at' => now()
        ]);
        
        return response()->json(['success' => true, 'message' => ($newStatus === 'active' ? 'Blokir dibuka!' : 'Akun dibekukan!')]);
    }

    // 🚀 7. FITUR HAPUS AKUN PERMANEN (DENGAN PROTEKSI SULTAN)
    public function destroy($id) {
        if ($id == 1) {
            return response()->json(['success' => false, 'message' => 'Akun Utama SULTAN tidak bisa dihapus!'], 403);
        }
        User::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Akun musnah permanen dari database!']);
    }
}
