<?php
use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "🧼 MESIN CUCI DATABASE (WHITE-LABEL)\n";
echo "========================================\n";

$kata_terlarang = ['KHFYPAY', 'Khfypay', 'khfypay', 'KHFY', 'Khfy', 'khfy', 'KAJE', 'Kaje', 'kaje', 'DIGIFLAZZ', 'Digiflazz', 'digiflazz', 'MILASTORE', 'Milastore', 'milastore'];

// 1. Bersihkan Tabel Transaksi (Riwayat)
echo "🔍 Membersihkan tabel 'transaksi'...\n";
$transaksi = DB::table('transaksi')->get();
$countTrx = 0;

foreach ($transaksi as $trx) {
    $nama_baru = $trx->kode_layanan ?? ''; // Beberapa sistem simpan nama di kolom ini
    $sn_baru = $trx->sn ?? '';
    
    // Asumsi ada kolom nama_layanan di transaksi (opsional)
    $updateData = [];
    
    foreach ($kata_terlarang as $kata) {
        $sn_baru = str_ireplace($kata, 'Sistem', $sn_baru);
        // Jika ada nama provider nyangkut di SN
    }

    if ($sn_baru !== ($trx->sn ?? '')) {
        $updateData['sn'] = $sn_baru;
    }
    
    // Ganti nama provider di kolom manapun yang nyangkut (opsional jika bos punya kolom provider di tabel transaksi)
    if (isset($trx->provider)) {
        $provider_baru = $trx->provider;
        foreach ($kata_terlarang as $kata) {
            $provider_baru = str_ireplace($kata, 'Sistem', $provider_baru);
        }
        if ($provider_baru !== $trx->provider) {
            $updateData['provider'] = $provider_baru;
        }
    }

    if (!empty($updateData)) {
        DB::table('transaksi')->where('id', $trx->id)->update($updateData);
        $countTrx++;
    }
}
echo "✔️ Berhasil mencuci $countTrx baris riwayat transaksi.\n";

// 2. Bersihkan Tabel Layanan (Produk)
echo "🔍 Membersihkan tabel 'layanan' (Produk)...\n";
$layanan = DB::table('layanan')->get();
$countLayanan = 0;

foreach ($layanan as $item) {
    $nama_baru = $item->nama_layanan;
    $provider_baru = $item->provider;

    foreach ($kata_terlarang as $kata) {
        $nama_baru = str_ireplace($kata, 'Sistem', $nama_baru);
        $provider_baru = str_ireplace($kata, 'Sistem', $provider_baru);
    }

    if ($nama_baru !== $item->nama_layanan || $provider_baru !== $item->provider) {
        DB::table('layanan')->where('id', $item->id)->update([
            'nama_layanan' => $nama_baru,
            'provider' => $provider_baru
        ]);
        $countLayanan++;
    }
}
echo "✔️ Berhasil mencuci $countLayanan produk layanan.\n";

echo "========================================\n";
echo "✨ SELESAI! SEMUA RAHASIA DAPUR AMAN.\n";
echo "========================================\n";
