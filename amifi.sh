#!/bin/bash

# Warna-warni biar keren
HIJAU='\033[0;32m'
BIRU='\033[0;34m'
KUNING='\033[1;33m'
NORMAL='\033[0m'

echo -e "${BIRU}=========================================${NORMAL}"
echo -e "${HIJAU}   AMIFI STORE - COMMAND CENTER VVIP     ${NORMAL}"
echo -e "${BIRU}=========================================${NORMAL}"

# 1. Export Database
echo -e "${KUNING}[1/4] Mencadangkan Database...${NORMAL}"
export DB_NAME=$(grep DB_DATABASE .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
export DB_USER=$(grep DB_USERNAME .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
export DB_PASS=$(grep DB_PASSWORD .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
mysqldump --no-tablespaces -u$DB_USER -p$DB_PASS $DB_NAME > backup_amifi_db.sql

# 2. Compile Frontend
echo -e "${KUNING}[2/4] Merakit Ulang UI Sultan (NPM Build)...${NORMAL}"
npm run build

# 3. Optimasi Laravel
echo -e "${KUNING}[3/4] Membersihkan Cache & Optimasi...${NORMAL}"
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Push ke GitHub
echo -e "${KUNING}[4/4] Menerbangkan Data ke GitHub...${NORMAL}"
git add .
git commit -m "🚀 Auto-Update: $(date +'%Y-%m-%d %H:%M:%S') - All Systems Ready"
git push origin main

echo -e "${BIRU}=========================================${NORMAL}"
echo -e "${HIJAU}  BERHASIL! SEMUA DATA SUDAH AMAN! 😎🔥  ${NORMAL}"
echo -e "${BIRU}=========================================${NORMAL}"
