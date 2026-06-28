#!/bin/bash

echo "--------------------------------------------------"
echo "🚀 AMIFI STORE - ROBOT DETEKTIF BUG SEDANG BEKERJA"
echo "--------------------------------------------------"

# 1. CEK RUTE (Mencari siapa pencuri rute /riwayat)
echo "🔎 1. MEMERIKSA PETA RUTE (/riwayat)..."
php artisan route:list | grep -E "riwayat|history"
echo ""

# 2. CEK CONTROLLER (Apakah file-nya ada dan sehat?)
echo "📂 2. MEMERIKSA KESEHATAN CONTROLLER..."
if [ -f "app/Http/Controllers/TransactionHistoryController.php" ]; then
    echo "✅ Controller ditemukan."
    php -l app/Http/Controllers/TransactionHistoryController.php
else
    echo "❌ Controller TIDAK DITEMUKAN!"
fi
echo ""

# 3. CEK DATABASE (Koneksi & Data)
echo "💾 3. MEMERIKSA ISI GUDANG (DATABASE)..."
php artisan tinker --execute="
    \$count = DB::table('transaksi')->count();
    \$muhammad = DB::table('transaksi')->where('username', 'Muhammad')->count();
    \$latest = DB::table('transaksi')->orderBy('id', 'desc')->first();
    dump([
        'Total_Semua_Trx' => \$count,
        'Trx_Atas_Nama_Muhammad' => \$muhammad,
        'Trx_Terakhir' => \$latest ? \$latest->ref_id : 'Kosong'
    ]);
"
echo ""

# 4. CEK LOG TERAKHIR
echo "📜 4. MENGINTIP CATATAN ERROR TERAKHIR..."
tail -n 5 storage/logs/laravel.log
echo ""

echo "--------------------------------------------------"
echo "✅ TUGAS SELESAI! SILAKAN COPY HASIL DI ATAS KE CHAT"
echo "--------------------------------------------------"
