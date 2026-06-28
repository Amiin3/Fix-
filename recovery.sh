#!/bin/bash
# AMIFI STORE - EMERGENCY RECOVERY SCRIPT
echo "🚀 MEMULAI PROSES PEMBANGKITAN SISTEM..."

# 1. Install Dependensi PHP
composer install --optimize-autoloader --no-dev

# 2. Install Dependensi JS & Build UI
npm install
npm run build

# 3. Optimasi Cache Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ SISTEM BERHASIL DIBANGKITKAN! SIAP TEMPUR!"
