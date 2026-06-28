<?php
use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "🧼 PROSES LAUNDRY WHITE-LABEL (FULL VERSION)\n";
echo "========================================\n";

$terlarang = ['KHFYPAY', 'Khfypay', 'khfypay', 'KHFY', 'Khfy', 'khfy', 'KAJE', 'Kaje', 'kaje', 'DIGIFLAZZ', 'Digiflazz', 'digiflazz', 'MILASTORE', 'Milastore', 'milastore'];

// 1. Bersihkan Tabel Layanan (Sumber utama badge biru)
$layanans = DB::table('layanan')->get();
$countLayanan = 0;
foreach($layanans as $l) {
    $prov_baru = $l->provider;
    $nama_baru = $l->nama_layanan;
    foreach ($terlarang as $kata) {
        $prov_baru = str_replace($kata, 'Sistem', $prov_baru);
        $nama_baru = str_replace($kata, 'Sistem', $nama_baru);
    }
    if($prov_baru !== $l->provider || $nama_baru !== $l->nama_layanan) {
        DB::table('layanan')->where('id', $l->id)->update([
            'provider' => $prov_baru, 
            'nama_layanan' => $nama_baru
        ]);
        $countLayanan++;
    }
}
echo "✔️ $countLayanan Produk layanan berhasil disensor.\n";

// 2. Bersihkan Tabel Transaksi (Hanya kolom SN/Keterangan)
$transaksis = DB::table('transaksi')->get();
$countTrx = 0;
foreach($transaksis as $t) {
    $sn_baru = $t->sn;
    foreach ($terlarang as $kata) {
        $sn_baru = str_replace($kata, 'Sistem', $sn_baru);
    }
    if($sn_baru !== $t->sn) {
        DB::table('transaksi')->where('id', $t->id)->update(['sn' => $sn_baru]);
        $countTrx++;
    }
}
echo "✔️ $countTrx Riwayat transaksi berhasil disensor.\n";

echo "========================================\n";
echo "✨ BERSIH TOTAL! SIAP RILIS!\n";
echo "========================================\n";
