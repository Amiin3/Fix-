import React from 'react';
import { Head } from '@inertiajs/react';

export default function PaymentDocs() {
    return (
        <div className="bg-[#0b0f1a] min-h-screen text-slate-300 font-sans antialiased pb-20">
            <Head title="MilaPay V12 - Official Technical Documentation" />
            
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-[#0b0f1a]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded font-black text-xs italic shadow-[0_0_15px_rgba(250,204,21,0.4)]">MILA</div>
                        <span className="text-white font-black tracking-tighter text-2xl uppercase italic drop-shadow-md">PAY <span className="text-indigo-500">V12</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Production API
                        </span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-12 max-w-5xl">
                {/* HERO */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter italic drop-shadow-xl">
                        API GATEWAY <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-600">INTEGRATION DOCS</span>
                    </h1>
                    <div className="p-6 md:p-8 bg-slate-800/40 rounded-[2rem] border border-white/5 border-l-4 border-l-yellow-400 shadow-xl shadow-black/40">
                        <p className="text-sm md:text-base leading-relaxed text-slate-300">
                            <span className="text-yellow-400 font-black uppercase italic mr-2">Enterprise Edition:</span> 
                            Ini adalah dokumentasi resmi untuk mengintegrasikan MilaPay V12 ke dalam sistem/website Anda. 
                            Pastikan Anda menggunakan <b>API KEY</b> untuk Request, dan <b>SECRET KEY</b> untuk memvalidasi Webhook (Callback).
                        </p>
                    </div>
                </div>

                {/* 01. AUTH & ENDPOINT */}
                <section className="mb-16 scroll-mt-24">
                    <h2 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic">01</span> Endpoint & Otentikasi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#111827] p-6 rounded-[1.5rem] border border-slate-700/50 shadow-inner">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3"><i className="fa-solid fa-link mr-1"></i> Production URL (POST)</p>
                            <code className="text-emerald-400 text-sm font-mono select-all bg-emerald-400/10 px-3 py-2 rounded-lg block border border-emerald-500/20">
                                https://milastore.cloud/api/gateway/pay
                            </code>
                        </div>
                        <div className="bg-[#111827] p-6 rounded-[1.5rem] border border-slate-700/50 shadow-inner">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3"><i className="fa-solid fa-key mr-1"></i> Header Authentication</p>
                            <code className="text-yellow-400 text-sm font-mono select-all bg-yellow-400/10 px-3 py-2 rounded-lg block border border-yellow-500/20">
                                X-MILA-KEY: [API_KEY_ANDA]
                            </code>
                        </div>
                    </div>
                </section>

                {/* 02. REQUEST BODY */}
                <section className="mb-16 scroll-mt-24">
                    <h2 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic">02</span> Parameter Request (Body)
                    </h2>
                    <div className="bg-[#111827] rounded-[1.5rem] border border-slate-700/50 overflow-hidden mb-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 text-[10px] uppercase tracking-widest text-slate-400">
                                    <th className="p-4 border-b border-slate-700/50">Parameter</th>
                                    <th className="p-4 border-b border-slate-700/50">Tipe</th>
                                    <th className="p-4 border-b border-slate-700/50">Wajib</th>
                                    <th className="p-4 border-b border-slate-700/50">Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                <tr className="border-b border-slate-800">
                                    <td className="p-4 font-mono text-blue-400">amount</td>
                                    <td className="p-4">Integer</td>
                                    <td className="p-4 text-emerald-400 font-bold">Ya</td>
                                    <td className="p-4">Nominal deposit/pembayaran (contoh: 100000).</td>
                                </tr>
                                <tr className="border-b border-slate-800">
                                    <td className="p-4 font-mono text-blue-400">method</td>
                                    <td className="p-4">String</td>
                                    <td className="p-4 text-emerald-400 font-bold">Ya</td>
                                    <td className="p-4">Kode metode pembayaran (contoh: <code className="text-xs bg-slate-800 px-1 rounded">QRIS_GOPAY</code>, <code className="text-xs bg-slate-800 px-1 rounded">SEABANK</code>).</td>
                                </tr>
                                <tr className="border-b border-slate-800">
                                    <td className="p-4 font-mono text-blue-400">external_id</td>
                                    <td className="p-4">String</td>
                                    <td className="p-4 text-slate-500">Opsional</td>
                                    <td className="p-4">ID Transaksi dari sistem Anda sendiri untuk mempermudah pelacakan.</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-mono text-blue-400">webhook_url</td>
                                    <td className="p-4">String</td>
                                    <td className="p-4 text-slate-500">Opsional</td>
                                    <td className="p-4">URL Callback khusus untuk transaksi ini. Jika kosong, sistem menggunakan URL Webhook di Profil Anda.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 03. RESPONSE */}
                <section className="mb-16 scroll-mt-24">
                    <h2 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic">03</span> Contoh Response API
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Success Response */}
                        <div className="bg-[#011627] p-6 rounded-[1.5rem] border border-emerald-500/30 relative shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                            <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">200 OK (SUCCESS)</div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Berhasil Membuat Tagihan</h4>
                            <pre className="text-xs text-emerald-300 font-mono overflow-x-auto">
{`{
  "status": "success",
  "data": {
    "trx_id": 1450,
    "total_bayar": 100451,
    "method": "QRIS_GOPAY",
    "qr_image": "https://api.qrserver.com/...",
    "checkout_url": "https://milastore.cloud/checkout/v1/1450"
  }
}`}
                            </pre>
                        </div>
                        {/* Error Response */}
                        <div className="bg-[#1a0f14] p-6 rounded-[1.5rem] border border-rose-500/30 relative shadow-[0_0_20px_rgba(244,63,94,0.05)]">
                            <div className="absolute top-4 right-4 bg-rose-500/20 text-rose-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">400 / 401 (FAILED)</div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Contoh Response Gagal</h4>
                            <pre className="text-xs text-rose-300 font-mono overflow-x-auto">
{`// Jika API Key Salah / Kosong
{
  "status": false,
  "msg": "Key Invalid"
}

// Jika Metode Pembayaran Salah
{
  "status": false,
  "msg": "Metode Tidak Terdaftar"
}`}
                            </pre>
                        </div>
                    </div>
                </section>

                {/* 04. SIGNATURE & WEBHOOK */}
                <section className="mb-16 scroll-mt-24">
                    <h2 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic">04</span> Webhook Callback & Keamanan (HMAC)
                    </h2>
                    
                    <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/30 mb-8">
                        <p className="text-sm text-blue-200 leading-relaxed mb-4">
                            Saat pelanggan membayar sejumlah <b>total_bayar</b>, server MilaStore akan mengirim data POST (JSON) ke URL Webhook Anda.
                            Untuk memastikan data ini asli dari kami, lakukan validasi <b>Signature</b> menggunakan algoritma <b>HMAC-SHA256</b>.
                        </p>
                        <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-blue-300 border border-black inline-block">
                            hash_hmac('sha256', trx_id + amount + total_bayar, SECRET_KEY)
                        </div>
                    </div>

                    <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-700/50">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Payload Webhook yang dikirim MilaStore:</h4>
                        <pre className="bg-black/40 p-6 rounded-xl text-xs text-orange-300 font-mono overflow-x-auto">
{`{
  "status": "success",
  "trx_id": "1450",
  "amount": 100000,
  "total_bayar": 100451,
  "service": "QRIS_GOPAY",
  "external_id": "ORDER-9999",
  "signature": "a8f5f167f44f4964e6c998dee827110c"
}`}
                        </pre>
                    </div>
                </section>

                {/* 05. SCRIPT PHP */}
                <section className="scroll-mt-24">
                    <h2 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
                        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm italic">05</span> Script Penerima (Copy & Paste)
                    </h2>
                    <p className="text-slate-400 mb-6 text-sm">
                        Buat file PHP (contoh: <code className="bg-slate-800 px-2 py-0.5 rounded text-white">callback.php</code>) di hosting Anda. Script ini otomatis memvalidasi HMAC-SHA256 dan memproses saldo.
                    </p>
                    
                    <div className="bg-[#011627] rounded-[2rem] border border-emerald-500/30 overflow-hidden relative shadow-[0_15px_30px_rgba(16,185,129,0.1)]">
                        <div className="bg-[#0a2540] px-6 py-3 border-b border-emerald-500/20 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-emerald-400/70">callback.php</span>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                        </div>
                        <div className="p-6 overflow-x-auto">
<pre className="text-xs font-mono leading-relaxed text-emerald-300">
{`<?php
// 1. Tangkap Payload JSON dari MilaStore
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

if ($data) {
    // ⚠️ MASUKKAN SECRET KEY ANDA (Bukan API KEY)
    // Awalan Secret Key wajib "SK-"
    $secret = "SK-MASUKKAN_SECRET_KEY_ANDA_DISINI";

    // 2. Format Data untuk Signature
    // Format: trx_id + amount + total_bayar
    $data_to_sign = $data['trx_id'] . $data['amount'] . $data['total_bayar'];

    // 3. Hitung Signature Lokal dengan HMAC-SHA256
    $signature_lokal = hash_hmac('sha256', $data_to_sign, $secret);

    // 4. Validasi Keamanan
    if ($data['signature'] === $signature_lokal && $data['status'] === 'success') {
        
        $trx_id      = $data['trx_id'];
        $external_id = $data['external_id'];
        $total_bayar = $data['total_bayar']; // Duit yang benar-benar masuk
        $amount      = $data['amount'];      // Duit bersih

        // 🚀 PROSES PENAMBAHAN SALDO ATAU UPDATE ORDER DI SINI
        // Contoh Eksekusi Database Anda:
        // $db->query("UPDATE users SET balance = balance + $amount WHERE ...");
        // $db->query("UPDATE orders SET status = 'PAID' WHERE ref = '$external_id'");

        // WAJIB KEMBALIKAN HTTP 200 OK AGAR SISTEM MILASTORE TAHU SUKSES
        http_response_code(200);
        echo json_encode(["status" => true, "message" => "Callback Diterima & Saldo Ditambahkan"]);
        exit;
    }
}

// Respon Jika Ditolak (Hacker / Salah Kunci)
http_response_code(403);
echo json_encode(["status" => false, "message" => "Akses Ditolak! Signature Tidak Valid."]);
?>`}
</pre>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
