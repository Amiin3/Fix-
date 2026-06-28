import os, re

file_path = 'routes/web.php'
with open(file_path, 'r') as f:
    content = f.read()

# Hapus route statistik lama agar tidak duplikat
content = re.sub(r"// Route Portofolio VVIP SULTAN.*?\}\);", "", content, flags=re.DOTALL)
content = re.sub(r"// Route Portofolio Modern.*?\}\);", "", content, flags=re.DOTALL)
content = re.sub(r"// Route Portofolio / Statistik.*?\}\);", "", content, flags=re.DOTALL)

new_route = """
// ROUTE PORTOFOLIO PREMIER SULTAN - FINAL SYNC
Route::middleware(['auth'])->get('/statistik', function () {
    // FORCE SYNC: Ambil data user terbaru dari DB
    $user = \\App\\Models\\User::where('id', auth()->id())->first();
    
    // Hitung Total Masuk (Deposits) - Sesuai kolom Abang: 'amount'
    $total_in = \\Illuminate\\Support\\Facades\\DB::table('deposits')
        ->where('user_id', $user->id)
        ->whereIn('status', ['success', 'sukses', 'paid', 'Success', 'Sukses'])
        ->sum('amount');
        
    // Hitung Total Keluar (Transaksi) - Sesuai kolom Abang: 'username' & 'harga'
    $total_out = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
        ->where('username', $user->username)
        ->whereIn('status', ['success', 'sukses', 'Success', 'Sukses', 'sukses_manual'])
        ->sum('harga');

    // Ambil Data History Gabungan (Table Columns Fix)
    $depo_hist = \\Illuminate\\Support\\Facades\\DB::table('deposits')
        ->where('user_id', $user->id)
        ->select('id', 'amount as amt', 'metode as title', 'status', 'created_at')
        ->selectRaw("'in' as type")
        ->orderBy('created_at', 'desc')->limit(10)->get();

    $trans_hist = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
        ->where('username', $user->username)
        ->select('id', 'harga as amt', 'kode_layanan as title', 'status', 'created_at')
        ->selectRaw("'out' as type")
        ->orderBy('created_at', 'desc')->limit(10)->get();

    // Gabung dan Urutkan
    $merged = $depo_hist->concat($trans_hist)->sortByDesc('created_at')->values()->take(15);

    return inertia('Statistik', [
        'sync_balance' => (float) $user->balance,
        'inflow' => (float) $total_in,
        'outflow' => (float) $total_out,
        'activities' => $merged
    ]);
})->name('statistik');
"""

with open(file_path, 'w') as f:
    f.write(content.strip() + "\n" + new_route)

print("✅ Backend Statistik Final Berhasil Dipasang!")
