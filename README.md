# 🚀 AMIFI STORE VVIP (MILASTORE) - Full Auto-Pilot System

![Status](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.3.0--Sultan-indigo?style=for-the-badge)

Platform PPOB modern dengan ekosistem **Bot WA Auto-Pilot** (OTP, Notif Orderan, Notif Deposit, & Smart Deposit D1-D4).

---

## 🛑 SYARAT WAJIB MIGRASI (BACKUP MANUAL)
Dua hal ini **TIDAK ADA** di GitHub. Simpan di tempat aman:
1. **File .env Web:** (Isi API Key Digiflazz, Khfy, Kaje, & Password DB).
2. **File Database:** (.sql atau .sql.gz) yang dikirim ke WA Admin tiap jam 02:00.

---

## ⚙️ FASE 1: PERSIAPAN SERVER BARU (aaPanel)
1. Install **Nginx**, **MySQL 8.0**, **PHP 8.2/8.3**, dan **PM2 Manager**.
2. Buat Database baru di aaPanel.
3. Tambahkan Website `milastore.web.id`, arahkan ke `/www/wwwroot/milastore.web.id`.
4. Di aaPanel, setel *Running Directory* ke `/public`.

---

## 🗄️ FASE 2: RESTORE DATABASE
Upload file backup ke server (misal folder `/tmp/`), lalu jalankan:
```bash
mysql -u USER_DB -p NAMA_DB < /tmp/backup_milastore.sql
```

---

## 🌐 FASE 3: DEPLOY WEB (LARAVEL & REACT)
```bash
cd /www/wwwroot/milastore.web.id

# 1. Tarik Code Web
git clone https://github.com/Amiin3/amifistore-web.git .

# 2. Setup Library & Build UI
composer install --optimize-autoloader --no-dev
npm install && npm run build

# 3. Upload File .env milik Anda ke folder ini

# 4. Atur Perizinan Folder (Sangat Penting)
chmod -R 775 storage bootstrap/cache
chown -R www:www /www/wwwroot/milastore.web.id
php artisan optimize:clear
```

---

## 🤖 FASE 4: DEPLOY BOT WHATSAPP (NODE.JS)
```bash
mkdir -p /www/wwwroot/milabot_wa
cd /www/wwwroot/milabot_wa

# 1. Tarik Code Bot
git clone https://github.com/Amiin3/milastore-bot.git .

# 2. Install Library & Jalankan
npm install
pm2 start index.js --name milabot
# Scan QR Code di: pm2 logs milabot
```

---

## ⏱️ FASE 5: DAFTAR CRONJOB AKTIF (REAL-TIME)
Daftar jadwal otomatis yang **SEDANG JALAN** di server ini:

```cron
53 21 * * * /www/server/cron/a50afd8f7d0e95dc2fd7bbbcfdcccd82 >> /www/server/cron/a50afd8f7d0e95dc2fd7bbbcfdcccd82.log 2>&1
*/3 * * * * /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan provider:sync-status >> /www/wwwroot/milastore.web.id/storage/logs/bot-pembersih.log 2>&1
* * * * * /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:seabank >> /dev/null 2>&1
* * * * * sleep 15 && /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:seabank >> /dev/null 2>&1
* * * * * sleep 30 && /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:seabank >> /dev/null 2>&1
* * * * * sleep 45 && /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:seabank >> /dev/null 2>&1
* * * * * /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:jago >> /dev/null 2>&1
* * * * * sleep 15 && /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:jago >> /dev/null 2>&1
* * * * * sleep 30 && /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:jago >> /dev/null 2>&1
* * * * * sleep 45 && /www/server/php/83/bin/php /www/wwwroot/milastore.web.id/artisan bank:jago >> /dev/null 2>&1
* * * * * /bin/bash /www/wwwroot/milastore.web.id/socket-server/monitor-socket.sh
0 */2 * * * /www/wwwroot/milastore.web.id/daily_backup_wa.sh > /dev/null 2>&1
```

---

## 🤝 Amifi Store Team
**Salam Cuan, Sukses Selalu! 😎🔥**
