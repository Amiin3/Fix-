<?php
use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "🧼 PEMBERSIHAN SUMBER DATA (LAYANAN)\n";
echo "========================================\n";

$terlarang = ['khfy', 'khfypay', 'kaje', 'digiflazz', 'milastore'];

// 1. Bersihkan tabel LAYANAN (Ini sumber badge biru itu)
$produk = DB::table('layanan')->get();
$count = 0;

foreach ($produk as $p) {
    $nama_baru = $p->nama_layanan;
    $prov_baru = $p->provider;
    
    foreach ($terlarang as $kata) {
        $nama_baru = str_ireplace($kata, 'Sistem', $nama_baru);
        $prov_baru = str_ireplace($kata, 'Sistem', $prov_baru);
    }

    if ($nama_baru !== $p->nama_layanan || $prov_baru !== $p->provider) {
        DB::table('layanan')->where('id', $p->id)->update([
            'nama_layanan' => $nama_baru,
            'provider'     => $prov_baru
        ]);
        $count++;
    }
}

// 2. Bersihkan tabel TRANSAKSI (Hanya kolom SN)
$trx = DB::table('transaksi')->get();
foreach ($trx as $t) {
    $sn_baru = $t->sn;
    foreach ($terlarang as $kata) {
        $sn_baru = str_ireplace($kata, 'Sistem', $sn_baru);
    }
    if ($sn_baru !== $t->sn) {
        DB::table('transaksi')->where('id', $t->id)->update(['sn' => $sn_baru]);
    }
}

echo "✅ SELESAI! $count Produk & Riwayat sudah di-White-Label.\n";
echo "========================================\n";
