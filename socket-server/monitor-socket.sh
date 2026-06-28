#!/bin/bash

# Koordinat Menara
PORT=3000
NAME="menara-mila"
LOG_FILE="/www/wwwroot/milastore.web.id/socket-server/watchdog.log"

# Cek apakah Port 3000 lagi dengerin (listening)
if ! lsof -i:$PORT > /dev/null
then
    echo "[$(date)] ⚠️ MENARA MATI! Membangunkan paksa..." >> $LOG_FILE
    # Coba restart lewat PM2
    /usr/local/bin/pm2 restart $NAME >> $LOG_FILE 2>&1
    
    # Kalau PM2-nya sendiri mati, kita start manual
    if [ $? -ne 0 ]; then
        echo "[$(date)] 🚨 PM2 Bermasalah! Start manual pakai Node..." >> $LOG_FILE
        /usr/local/bin/pm2 start server.js --name "$NAME"
    fi
else
    # Opsi: Aktifkan baris di bawah kalau mau log setiap menit (tapi bikin file log bengkak)
    # echo "[$(date)] ✅ Menara Aman Sentosa." >> $LOG_FILE
    exit 0
fi
