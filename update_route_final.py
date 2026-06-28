import os, re

file_path = 'routes/web.php'
with open(file_path, 'r') as f:
    content = f.read()

# Hapus route statistik lama
content = re.sub(r"// Route Portofolio / Statistik.*?\}\);", "", content, flags=re.DOTALL)
content = re.sub(r"// Route Portofolio Modern.*?\}\);", "", content, flags=re.DOTALL)

new_route = """
// Route Portofolio VVIP SULTAN
Route::middleware(['auth'])->get('/statistik', function () {
    $user = \\App\\Models\\User::find(auth()->id());
    
    // Total Pemasukan
    $total_in = \\Illuminate\\Support\\Facades\\DB::table('deposits')
        ->where('user_id', $user->id)
        ->whereIn('status', ['success', 'sukses', 'paid', 'Success'])
        ->sum('amount');
        
    // Total Pengeluaran
    $total_out = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
        ->where('username', $user->username)
        ->whereIn('status', ['success', 'sukses', 'Success'])
        ->sum('harga');

    // Ambil 5 Deposit Terakhir
    $recent_in = \\Illuminate\\Support\\Facades\\DB::table('deposits')
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')->limit(5)->get()
        ->map(function($d) { return ['type' => 'in', 'title' => 'Top Up '. $d->metode, 'amt' => $d->amount, 'status' => $d->status, 'date' => $d->created_at]; });

    // Ambil 5 Transaksi Terakhir
    $recent_out = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
        ->where('username', $user->username)
        ->orderBy('created_at', 'desc')->limit(5)->get()
        ->map(function($t) { return ['type' => 'out', 'title' => $t->kode_layanan, 'amt' => $t->harga, 'status' => $t->status, 'date' => $t->created_at]; });

    $history = $recent_in->concat($recent_out)->sortByDesc('date')->values()->all();

    return inertia('Statistik', [
        'user_balance' => (float) $user->balance,
        'total_in' => (float) $total_in,
        'total_out' => (float) $total_out,
        'history' => $history
    ]);
})->name('statistik');
"""

with open(file_path, 'w') as f:
    f.write(content.strip() + "\n" + new_route)
