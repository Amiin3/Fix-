#!/bin/bash
echo "🚀 MEMULAI PERAKITAN AUTO-RESTORE..."

echo "📦 1. Menginstall Onderdil Backend (Composer)..."
composer install --optimize-autoloader --no-dev

echo "📦 2. Menginstall Onderdil Frontend (NPM)..."
npm install

echo "🏗️ 3. Membangun Tampilan React (Build)..."
npm run build

echo "🔗 4. Menghubungkan Folder Storage..."
php artisan storage:link

echo "🧹 5. Membersihkan Cache Lama & Refresh Mesin..."
php artisan optimize:clear
php artisan optimize

echo "🔐 6. Mengatur Hak Akses Keamanan aaPanel..."
chown -R www:www .
chmod -R 775 storage bootstrap/cache

echo "✅ AUTO-RESTORE SELESAI BOSKU! TINGGAL UPLOAD .env DAN DATABASE!"
