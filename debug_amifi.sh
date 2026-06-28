#!/bin/bash
echo "📡 MEMULAI SCANNING RADAR AMIFI..."
echo "-----------------------------------"

echo "🔎 1. MENGECEK SYNTAX ERROR (PHP CHECK)..."
php -l /www/wwwroot/amifistore.web.id/routes/web.php
php -l /www/wwwroot/amifistore.web.id/app/Http/Controllers/DashboardController.php
php -l /www/wwwroot/amifistore.web.id/app/Http/Controllers/RiwayatController.php

echo -e "\n📝 2. MENGAMBIL 5 ERROR TERAKHIR DARI LOG PUSAT..."
grep -i "error" /www/wwwroot/amifistore.web.id/storage/logs/laravel.log | tail -n 5

echo -e "\n🛤️ 3. MENGECEK KONFLIK JALUR (ROUTE LIST)..."
php artisan route:list --except-vendor | grep -E "riwayat|dashboard|order"

echo -e "\n🧹 4. MEMBERSIHKAN SISA RADIASI (CACHE CLEAR)..."
php artisan optimize:clear

echo "-----------------------------------"
echo "✅ SCAN SELESAI! JIKA ADA ERROR DI ATAS, COPY DAN KIRIM KE SAYA!"
