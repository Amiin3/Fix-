#!/bin/bash
echo "🧹 Membersihkan sisa debu log lama agar tidak bingung..."
> /www/wwwroot/amifistore.web.id/storage/logs/laravel.log

echo "📡 RADAR LIVE AMIFI AKTIF! STANDBY MENGINTIP MESIN..."
echo "======================================================"
echo "🔥 INSTRUKSI UNTUK KOMANDAN:"
echo "1. Biarkan layar terminal ini menyala & jangan ditutup."
echo "2. Buka web Amifi Store di HP/Laptop (Refresh dulu halamannya)."
echo "3. Lakukan proses ORDER (Akrab/XLA/XDA) seperti biasa."
echo "4. Begitu di layar web muncul 'Terjadi Kesalahan'..."
echo "5. ...Radar ini akan langsung mencetak biang keroknya di bawah!"
echo "======================================================"
echo "Menunggu pergerakan..."

# Memantau log secara live
tail -f /www/wwwroot/amifistore.web.id/storage/logs/laravel.log
