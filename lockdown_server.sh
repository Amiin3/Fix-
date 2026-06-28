#!/bin/bash

echo "🚀 MEMULAI PROSES LOCKDOWN AMIFISTORE..."

# 1. Masuk ke Maintenance Mode (Biar user gak liat proses error)
# Ganti 'amifisultan' jadi password rahasia buat Abang akses webnya nanti
php artisan down --secret="amifisultan"
echo "✅ Maintenance Mode aktif! (Akses: amifistore.web.id/amifisultan)"

# 2. Hardening .env (Matiin Debug Mode & Set Production)
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' .env
sed -i 's/APP_ENV=local/APP_ENV=production/g' .env
echo "✅ Debug Mode: DISABLED | Env: PRODUCTION"

# 3. Update Library yang Bocor (Fixing CVE-2026-30838)
composer update league/commonmark --no-interaction
echo "✅ Security Patch: league/commonmark Updated"

# 4. Kunci Firewall (Hanya buka SSH, HTTP, HTTPS)
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "✅ Firewall Aktif: Port Database (3306) dikunci dari luar!"

# 5. Fix Permissions (Standard Keamanan)
find storage -type d -exec chmod 775 {} \;
find storage -type f -exec chmod 664 {} \;
chmod -R 775 bootstrap/cache
echo "✅ File Permissions: SECURED"

# 6. Bersihkan & Cache Konfigurasi
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
echo "✅ Laravel Optimized & Cached"

echo "--------------------------------------------------"
echo "🛡️  SERVER BERHASIL DI-LOCKDOWN!"
echo "--------------------------------------------------"
echo "👉 Khusus Abang, akses web lewat: amifistore.web.id/amifisultan"
echo "👉 Orang lain akan melihat halaman Maintenance."
echo "--------------------------------------------------"
