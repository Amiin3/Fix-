#!/bin/bash

# 1. SETUP LOKASI & WAKTU
DIR="/www/wwwroot/milastore.web.id"
cd $DIR
WAKTU=$(date +"%d-%m-%Y_%H-%M")
FILE_NAME="Backup_MilaStore_${WAKTU}.sql"
PUBLIC_PATH="public/backup_otomatis_milastore.sql"

# 2. TARIK KREDENSIAL DARI .ENV
DB_NAME=$(grep ^DB_DATABASE= .env | cut -d '=' -f2 | tr -d '\r')
DB_USER=$(grep ^DB_USERNAME= .env | cut -d '=' -f2 | tr -d '\r')
DB_PASS=$(grep ^DB_PASSWORD= .env | cut -d '=' -f2 | tr -d '\r')

# 3. PROSES DUMP DATABASE
mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > $PUBLIC_PATH
chmod 644 $PUBLIC_PATH

# 4. KIRIM NOTIFIKASI KE WA (JALUR OTP/GATEWAY)
# Kita pakai rute setup-whatsapp yang tadi ada di route:list Lu
MESSAGE="🚀 *AUTO-BACKUP MILASTORE READY*\n\nSultan Firlianda, database periode ini sudah berhasil diamankan.\n\n📅 Waktu: ${WAKTU}\n🔗 Link: https://milastore.cloud/backup_otomatis_milastore.sql\n\n_Segera download! File ini akan tertimpa otomatis pada periode berikutnya._"

curl -X POST https://milastore.cloud/setup-whatsapp \
-H "Content-Type: application/json" \
-d "{
    \"phone\": \"0859106609838\",
    \"message\": \"$MESSAGE\"
}"

echo "✅ Backup Selesai & Link Terkirim ke WA!"
