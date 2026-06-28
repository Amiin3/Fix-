<?php
namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DepositController extends Controller
{
    public function index()
    {
        $user_id = Auth::id();
        $history = DB::table("deposits")->where("user_id", $user_id)->orderBy("id", "desc")->get();
        $paymentSettings = DB::table("payment_settings")->get();
        return Inertia::render("User/Deposit", ["history" => $history, "paymentSettings" => $paymentSettings]);
    }

    public function store(Request $request)
    {
        $request->validate([
            "jumlah" => "required|numeric|min:1000",
            "metode" => "required|string|in:JAGO,SEABANK,QRIS_GOPAY,QRIS_SHOPEE"
        ]);

        $jumlah_input = (int)$request->jumlah;
        $user_id = Auth::id();

        if (!$user_id) return response()->json(["status" => "error", "message" => "Sesi habis."]);

        if (DB::table("deposits")->where("user_id", $user_id)->where("status", "Pending")->first()) {
            return response()->json(["status" => "error", "message" => "Ada tiket Pending. Selesaikan atau batalkan dulu!"]);
        }

        // 🛑 FITUR SULTAN: ANTI BENTROKAN KODE UNIK (RACE CONDITION FIX)
        do {
            $kode_unik = rand(10, 999);
            $total_bayar = $jumlah_input + $kode_unik;
            
            // Cek di database, apakah ada tiket PENDING yang total bayarnya sama?
            $cek_dobel = DB::table("deposits")
                ->where("status", "Pending")
                ->where("total_bayar", $total_bayar)
                ->exists();
                
        } while ($cek_dobel); // Kalau ada yang sama, ulang terus putar dadunya sampai dapat angka unik!

        DB::table("deposits")->insert([
            "user_id"     => $user_id,
            "metode"      => $request->metode,
            "amount"      => $jumlah_input,
            "kode_unik"   => $kode_unik,
            "total_bayar" => $total_bayar,
            "status"      => "Pending",
            "created_at"  => now(),
            "updated_at"  => now()
        ]);

        return response()->json(["status" => "success", "message" => "Tiket berhasil dibuat!"]);
    }

    public function cancel(Request $request) {
        DB::table("deposits")->where("id", $request->id)->where("user_id", auth()->id())->where("status", "Pending")->update(["status" => "Gagal", "updated_at" => now()]);
        return response()->json(["status" => "success", "message" => "Dibatalkan."]);
    }

    public function status($id) {
        $deposit = DB::table("deposits")->where("id", $id)->where("user_id", auth()->id())->first();
        return response()->json(["status" => $deposit ? $deposit->status : "Unknown"]);
    }
}
