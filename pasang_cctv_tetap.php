<?php
$path = 'resources/views/app.blade.php';
if (file_exists($path)) {
    $content = file_get_contents($path);
    
    $cctv = <<<HTML
    <script>
    // CCTV RADAR AMIFI - JANGAN DIHAPUS
    window.addEventListener('error', function(e) {
        if (e.message.includes('ResizeObserver') || e.message.includes('Extension')) return; // Abaikan error sampah browser
        document.body.innerHTML = '<div style="background:#0f172a; color:#f87171; padding:2rem; min-height:100vh; font-family:monospace; z-index:9999999; position:fixed; top:0; left:0; width:100%; overflow:auto; border: 5px solid #ef4444;">' +
            '<h2 style="color:#ef4444; border-bottom:1px solid #334155; pb:10px;">📡 RADAR ERROR AMIFI STORE</h2>' +
            '<p style="font-size:1.1rem; color:white; background:#1e293b; padding:10px; border-radius:8px;"><b>PESAN ERROR:</b> ' + e.message + '</p>' +
            '<div style="margin-top:20px;">' +
                '<b style="color:#94a3b8;">LOKASI FILE:</b><br><code style="color:#38bdf8;">' + e.filename + ' : Line ' + e.lineno + '</code>' +
            '</div>' +
            '<pre style="margin-top:20px; color:#64748b; background:#000; padding:15px; border-radius:8px; white-space:pre-wrap; font-size:0.8rem;">' + (e.error ? e.error.stack : 'Stack trace tidak tersedia') + '</pre>' +
            '<div style="margin-top:30px; background:#450a0a; padding:15px; border-radius:8px; border:1px solid #991b1b;">' +
                '<h3 style="color:#fca5a5; margin:0;">💡 INSTRUKSI UNTUK BOS AMIFI:</h3>' +
                '<p style="color:#fecaca; margin-top:5px;">Copy seluruh teks di atas (terutama bagian PESAN ERROR dan LOKASI FILE) lalu kirim ke AI untuk difix!</p>' +
            '</div>' +
        '</div>';
    });
    </script>
HTML;

    if (!str_contains($content, 'RADAR ERROR AMIFI')) {
        $content = str_replace('</head>', $cctv . "\n</head>", $content);
        file_put_contents($path, $content);
        echo "✅ CCTV Radar Berhasil Dipasang Kembali!\n";
    } else {
        echo "✅ CCTV Radar Sudah Aktif!\n";
    }
}
