<?php
use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "🕵️‍♂️ ANALISIS RIWAYAT AMIFISTORE\n";
echo "========================================\n";

// 1. Cek Statistik Status
echo "📊 RINGKASAN STATUS:\n";
$stats = DB::table('transaksi')
    ->select('status', DB::raw('count(*) as total'))
    ->groupBy('status')
    ->get();

foreach ($stats as $s) {
    $icon = $s->status == 'Sukses' ? '✅' : ($s->status == 'Gagal' ? '❌' : '⏳');
    echo "$icon {$s->status}: {$s->total} Transaksi\n";
}

// 2. Cek Kebocoran Nama Provider (White-Label Check)
echo "\n🕵️‍♂️ CEK KEBOCORAN NAMA (WHITE-LABEL):\n";
$terlarang = ['khfy', 'kaje', 'digiflazz'];
$bocor = false;

foreach ($terlarang as $kata) {
    $check = DB::table('transaksi')
        ->where('provider', 'LIKE', "%$kata%")
        ->orWhere('sn', 'LIKE', "%$kata%")
        ->count();
    
    if ($check > 0) {
        echo "⚠️  WASPADA: Masih ada $check baris mengandung kata '$kata'!\n";
        $bocor = true;
    }
}
if (!$bocor) echo "✨ BERSIH: Tidak ada nama provider yang bocor ke database.\n";

// 3. Tampilkan 5 Transaksi Terakhir
echo "\n📝 5 TRANSAKSI TERAKHIR:\n";
$recent = DB::table('transaksi')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get();

echo str_pad("TANGGAL", 20) . " | " . str_pad("PRODUK", 15) . " | " . str_pad("STATUS", 10) . " | SN\n";
echo str_repeat("-", 70) . "\n";

foreach ($recent as $r) {
    $tgl = date('d/m/Y H:i', strtotime($r->created_at ?? $r->tanggal));
    $produk = substr($r->kode_layanan, 0, 15);
    $status = str_pad($r->status, 10);
    $sn = substr($r->sn, 0, 20);
    echo str_pad($tgl, 20) . " | " . str_pad($produk, 15) . " | " . $status . " | $sn...\n";
}

echo "========================================\n";
