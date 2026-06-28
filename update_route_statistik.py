import os, re

file_path = 'routes/web.php'
with open(file_path, 'r') as f:
    content = f.read()

# Bersihkan route lama
content = re.sub(r"// Route Portofolio / Statistik.*?\}\);", "", content, flags=re.DOTALL)

new_route = """
// Route Portofolio Modern (Fintech Style)
Route::middleware(['auth'])->get('/statistik', function () {
    $user = \\App\\Models\\User::find(auth()->id()); // Tarik data user terbaru agar saldo sinkron
    
    // 1. Total Pemasukan (Deposit Sukses)
    $total_in = \\Illuminate\\Support\\Facades\\DB::table('deposits')
        ->where('user_id', $user->id)
        ->whereIn('status', ['success', 'sukses', 'paid', 'Success'])
        ->sum('amount');
        
    // 2. Total Pengeluaran (Transaksi Sukses)
    $total_out = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
        ->where('username', $user->username)
        ->whereIn('status', ['success', 'sukses', 'Success'])
        ->sum('harga');

    // 3. Data Grafik (Aktivitas 7 Hari Terakhir)
    $chart_data = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = now()->subDays($i)->format('Y-m-d');
        $day_name = now()->subDays($i)->format('D');
        
        $in = \\Illuminate\\Support\\Facades\\DB::table('deposits')
            ->where('user_id', $user->id)
            ->whereDate('created_at', $date)
            ->whereIn('status', ['success', 'sukses'])
            ->sum('amount');
            
        $out = \\Illuminate\\Support\\Facades\\DB::table('transaksi')
            ->where('username', $user->username)
            ->whereDate('created_at', $date)
            ->whereIn('status', ['success', 'sukses'])
            ->sum('harga');
            
        $chart_data[] = ['day' => $day_name, 'value' => (float)($in - $out)];
    }

    return inertia('Statistik', [
        'user_balance' => (float) $user->balance,
        'total_in' => (float) $total_in,
        'total_out' => (float) $total_out,
        'chart_history' => $chart_data
    ]);
})->name('statistik');
"""

with open(file_path, 'w') as f:
    f.write(content.strip() + "\n" + new_route)

print("✅ Backend Statistik disinkronkan!")
