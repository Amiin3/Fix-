import os, re

file_path = 'routes/web.php'
with open(file_path, 'r') as f:
    content = f.read()

# Bersihkan route statistik yang lama (kalau ada) biar gak bentrok
content = re.sub(r"// Route Portofolio / Statistik.*?\}\);", "", content, flags=re.DOTALL)

# Route API Portofolio Sultan yang baru
new_route = """
// Route Portofolio / Statistik
Route::middleware(['auth'])->get('/statistik', function () {
    $user = auth()->user();
    
    // 1. Hitung Total Pemasukan (Deposit Sukses)
    $total_deposit = \\Illuminate\\Support\\Facades\\DB::table('deposits')
        ->where('user_id', $user->id)
        ->whereIn('status', ['success', 'sukses', 'paid', 'Success', 'Sukses'])
        ->sum('amount');
        
    // 2. Hitung Total Pengeluaran (Transaksi Sukses)
    // Berdasarkan tabel transaksi Abang yang pakai kolom username dan harga
    $total_pengeluaran = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
        ->where('username', $user->username)
        ->whereIn('status', ['success', 'sukses', 'Success', 'Sukses', 'sukses_manual'])
        ->sum('harga');
        
    return inertia('Statistik', [
        'total_deposit' => (float) $total_deposit,
        'total_pengeluaran' => (float) $total_pengeluaran
    ]);
})->name('statistik');
"""

with open(file_path, 'w') as f:
    f.write(content.strip() + "\n" + new_route)

print("✅ Route Portofolio berhasil dipasang!")
