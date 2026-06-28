const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Setup Socket.io dengan CORS yang terbuka lebar (Anti-Blokir Browser/Android)
const io = socketIo(server, { 
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// 🚀 API ENDPOINT: PENERIMA TEMBAKAN LARAVEL
// ==========================================
app.post('/push-notif', (req, res) => {
    try {
        // Pengaman 1: Cek apakah request bawa data (Mencegah error destructure)
        if (!req.body) {
            console.log('⚠️ [DITOLAK] Request tanpa body!');
            return res.status(400).json({ success: false, message: 'Body is empty' });
        }

        const email = req.body.email;
        const judul = req.body.judul || 'MilaStore V12';
        const pesan = req.body.pesan || '';

        // Pengaman 2: Wajib ada email target
        if (!email) {
            console.log('⚠️ [DITOLAK] Target Email kosong!');
            return res.status(400).json({ success: false, message: 'Email target required' });
        }

        console.log(`🚀 [MENGUDARA] Rudal Notif ke: ${email} | Judul: ${judul}`);
        
        // Tembak ke Android APK yang sedang mantau channel email ini
        io.emit(`notif_${email}`, { judul, pesan });
        
        return res.json({ success: true });

    } catch (error) {
        // Pengaman 3: Kalau ada error kode, server gak bakal mati!
        console.error('🔥 [SYSTEM RESCUED] Terjadi error saat memproses notif:', error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// 📡 SOCKET LISTENER: PANTAUAN HP MEMBER
// ==========================================
io.on('connection', (socket) => {
    console.log(`[🟢] HP Member Nempel di Radar (ID: ${socket.id})`);

    socket.on('disconnect', () => {
        console.log(`[🔴] HP Member Lepas dari Radar (ID: ${socket.id})`);
    });
});

// ==========================================
// 🔥 START ENGINE MENARA
// ==========================================
const PORT = 3003;
server.listen(PORT, '0.0.0.0', () => {
    console.log('======================================');
    console.log('🔥 MENARA MILASTORE V12 SECURE READY! 🔥');
    console.log(`📍 Berdiri kokoh di Port: ${PORT}`);
    console.log('🛡️  Sistem Baju Besi (Anti-Crash): AKTIF');
    console.log('======================================');
});
