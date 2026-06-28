import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

const CodeBlock = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative bg-[#111827] rounded-lg overflow-hidden border border-gray-800 my-4 shadow-sm group">
            <button
                onClick={copyToClipboard}
                className={`absolute top-3 right-3 text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1 font-bold ${copied ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200 opacity-0 group-hover:opacity-100'}`}
            >
                {copied ? '✅ Tersalin!' : '📋 Salin Kode'}
            </button>
            <div className="p-4 overflow-x-auto pt-10 sm:pt-4">
                <pre className="text-[13px] font-mono text-gray-300 leading-relaxed">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};

const EndpointHeader = ({ method, path, title, description, badge }) => (
    <div className="mb-6 border-b border-gray-100 pb-6 mt-12">
        <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {badge && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200">
                    {badge}
                </span>
            )}
        </div>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center gap-3 font-mono text-sm">
            <span className={`px-2 py-0.5 rounded font-semibold border ${method === 'POST' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {method}
            </span>
            <span className="text-gray-700 bg-gray-50 px-3 py-0.5 rounded border border-gray-200 select-all">
                {path}
            </span>
        </div>
    </div>
);

export default function ApiDocs({ auth }) {
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [customUrl, setCustomUrl] = useState('');
    const [testStatus, setTestStatus] = useState('Sukses');

    const testWebhook = async () => {
        if (!customUrl) {
            setTestResult({ success: false, message: 'URL Webhook tidak boleh kosong!' });
            return;
        }
        setTestLoading(true);
        setTestResult(null);
        try {
            const response = await axios.post('/user/test-webhook', {
                custom_url: customUrl,
                status: testStatus
            });
            setTestResult(response.data);
        } catch (error) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'Gagal terhubung ke server target. Pastikan URL Valid dan Server Hidup.'
            });
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="API Reference V12 - MilaStore" />
            <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row bg-white shadow-xl rounded-xl mt-6 overflow-hidden">
                    {/* SIDEBAR NAVIGATION */}
                    <div className="w-full md:w-72 bg-gray-50 border-r border-gray-200 pt-8 pb-12 px-6 hidden md:block">
                        <div className="sticky top-8">
                            <Link href={route('dashboard')} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-8 transition-colors font-semibold">
                                &larr; Kembali ke Dashboard
                            </Link>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">MilaStore H2H API V12</h3>
                            <ul className="space-y-4 text-sm font-medium text-gray-600">
                                <li><a href="#auth" className="flex items-center hover:text-blue-600 transition-colors"><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Autentikasi</a></li>
                                <li><a href="#profile" className="flex items-center hover:text-blue-600 transition-colors"><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Cek Profil & Saldo</a></li>
                                <li><a href="#pricelist" className="flex items-center hover:text-blue-600 transition-colors"><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Katalog Produk</a></li>
                                <li><a href="#check-stock" className="flex items-center text-red-600 hover:text-red-800 font-bold transition-colors"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Stok Real-Time (VIP)</a></li>
                                <li><a href="#transaction" className="flex items-center hover:text-blue-600 transition-colors"><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Buat Transaksi</a></li>
                                <li><a href="#status" className="flex items-center hover:text-blue-600 transition-colors"><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Status Transaksi</a></li>
                                <li><a href="#webhook" className="flex items-center text-blue-600 font-bold transition-colors"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Smart Webhook</a></li>
                                <li className="pt-4 border-t border-gray-200"><a href="#errors" className="flex items-center text-orange-600 hover:text-orange-800 font-bold transition-colors"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>Kamus Error</a></li>
                            </ul>
                        </div>
                    </div>
                    {/* MAIN CONTENT */}
                    <div className="flex-1 pt-10 pb-32 md:px-12 px-6 bg-white">
                        {/* HERO SECTION */}
                        <div className="mb-14 pb-8 border-b border-gray-100">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">MilaStore <span className="text-blue-600">H2H API V12</span></h1>
                            <p className="text-gray-600 leading-relaxed text-lg font-medium">
                                Official Developer Documentation
                            </p>
                            <p className="text-gray-600 leading-relaxed mt-2 text-sm md:text-base">
                                Selamat datang di dokumentasi resmi MilaStore V12. Kami merancang API ini semudah dan sejelas mungkin agar Anda bisa mengintegrasikannya ke Bot WhatsApp atau Panel Anda dalam hitungan menit. Dilengkapi dengan sistem proteksi Anti-Bocor Saldo dan Smart Webhook.
                            </p>
                            <div className="mt-6 flex flex-col md:flex-row items-start md:items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700 w-fit">
                                <span className="text-gray-500 mr-2">Base URL:</span>
                                {/* INI DIA PERUBAHAN UTAMANYA BOSKU! */}
                                <span className="font-bold text-gray-900 select-all">https://milastore.cloud/api/v1</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">*Catatan: Harap tidak menambahkan tanda garis miring (/) di akhir Base URL.</p>
                        </div>
                        {/* SECTION: AUTH */}
                        <div id="auth" className="pt-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Autentikasi API</h2>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                Untuk menggunakan layanan API ini, Anda diwajibkan menyertakan <strong>API Key</strong> Anda di setiap permintaan (request). API Key ini bersifat rahasia, jangan dibagikan kepada siapapun.
                            </p>
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-r">
                                <p className="text-sm text-red-800 font-medium">
                                    <strong>⚠️ PENTING:</strong> Pastikan Alamat IP Server/Hosting Anda telah didaftarkan pada <strong>Whitelist</strong>. Hubungi Admin jika Anda mendapatkan error 403 Forbidden.
                                </p>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Format Header Wajib</h4>
                                <ul className="text-sm font-mono text-gray-800 space-y-3">
                                    <li className="flex flex-col sm:flex-row sm:items-center"><span className="w-32 text-gray-500 mb-1 sm:mb-0">X-MILA-KEY:</span> <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded select-all border border-blue-100">API_KEY_ANDA_DI_SINI</span></li>
                                    <li className="flex flex-col sm:flex-row sm:items-center"><span className="w-32 text-gray-500 mb-1 sm:mb-0">Accept:</span> <span>application/json</span></li>
                                    <li className="flex flex-col sm:flex-row sm:items-center"><span className="w-32 text-gray-500 mb-1 sm:mb-0">Content-Type:</span> <span>application/json</span></li>
                                </ul>
                            </div>
                        </div>
                        {/* SECTION: PROFILE */}
                        <div id="profile">
                            <EndpointHeader title="1. Cek Profil & Saldo" description="Gunakan endpoint ini untuk mengecek apakah API Key Anda sudah terhubung dengan benar sekaligus melihat sisa saldo terkini." method="POST" path="/profile" />
                            <CodeBlock code={`// Payload (Body) cukup dikosongkan:\n{}`} />
                            <p className="text-sm text-gray-600 font-bold mb-2 mt-4">Contoh Balasan (Sukses):</p>
                            <CodeBlock code={`{\n  "status": true,\n  "message": "Koneksi Berhasil",\n  "data": {\n    "username": "NamaMitraAnda",\n    "level": "reseller",\n    "saldo": 150000\n  }\n}`} />
                        </div>
                        {/* SECTION: PRICELIST */}
                        <div id="pricelist">
                            <EndpointHeader title="2. Katalog Produk" description="Menarik daftar layanan dan harga. Jika akun Anda berada di level Reseller, harga yang tampil sudah otomatis terpotong Harga Diskon." method="POST" path="/pricelist" />
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">Anda bisa menarik seluruh daftar produk sekaligus, atau menggunakan filter <strong>kategori</strong> jika hanya ingin menampilkan kelompok produk tertentu saja.</p>
                            <CodeBlock code={`// OPSI 1: Tarik SEMUA Layanan (Kirim body kosong)\n{}\n\n// OPSI 2: Tarik Kategori Spesifik (Gunakan salah satu pilihan di bawah):\n{\n  // "kategori": "PRODUK XLA"      // Menampilkan semua layanan Paket XLA\n  // "kategori": "AKRAB XDA"    // Menampilkan semua layanan Paket Akrab XDA\n  // "kategori": "XDA_V2"       // Menampilkan semua layanan Paket XDA V2\n  // "kategori": "PPOB REGULER" // Menampilkan layanan Reguler (Pulsa, Token, dll)\n\n  "kategori": "PRODUK XLA" // Contoh Penggunaan\n}`} />
                        </div>
                        {/* SECTION: STOK REALTIME */}
                        <div id="check-stock">
                            <EndpointHeader title="3. Stok Real-Time" description="Menarik data ketersediaan stok fisik secara langsung dari server pusat dengan akurasi 100%. Sangat berguna bagi Anda yang ingin memastikan stok ada sebelum menembak transaksi." method="POST" path="/check-stock" badge="FITUR VIP 🔥" />
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-r">
                                <p className="text-sm text-red-800 font-medium">
                                    <strong>⚠️ Batasan Kecepatan (Rate Limit):</strong> Maksimal 4 permintaan per detik. Jangan melakukan <i>looping/spam</i> tanpa jeda agar IP Anda tidak diblokir otomatis oleh sistem keamanan kami.
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-5">
                                <h4 className="font-bold text-blue-900 mb-2">Panduan Pengisian Kategori Stok:</h4>
                                <p className="text-sm text-blue-800 mb-2">Tidak semua layanan memiliki stok fisik (misalnya Pulsa Reguler tidak ada batas stok fisik). Fitur Cek Stok ini <strong>HANYA</strong> berlaku untuk kategori produk injeksi kuota di bawah ini. Anda wajib mengirimkan parameter <code className="bg-white px-1 text-blue-700 rounded font-mono">kategori</code>:</p>
                                <ul className="list-disc ml-5 text-sm text-blue-800 space-y-1 font-mono mt-3">
                                    <li><code className="font-bold">PRODUK XLA</code> : Untuk mengecek sisa stok layanan Paket XLA</li>
                                    <li><code className="font-bold">AKRAB XDA</code> : Untuk mengecek sisa stok layanan Paket Akrab XDA</li>
                                    <li><code className="font-bold">XDA_V2</code> : Untuk mengecek sisa stok layanan Paket XDA V2</li>
                                </ul>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Contoh Penggunaan Step-by-Step:</p>
                            <CodeBlock code={`// LANGKAH 1: Jika ingin mengecek Stok XLA\n{\n  "kategori": "PRODUK XLA"\n}\n\n// LANGKAH 1 (Alternatif): Jika ingin mengecek Stok XDA\n{\n  "kategori": "AKRAB XDA"\n}\n\n// LANGKAH 2: Server akan merespon dengan data ketersediaan stok.\n// Contoh Balasan (Sukses):\n{\n  "status": true,\n  "message": "Berhasil mengambil stok murni",\n  "kategori": "AKRAB XDA",\n  "data": [\n    { "kode": "XDA13", "stok": 25 },\n    { "kode": "XDA25", "stok": 0 }\n  ]\n}`} />
                        </div>
                        {/* SECTION: TRANSACTION */}
                        <div id="transaction">
                            <EndpointHeader title="4. Buat Transaksi" description="Endpoint utama untuk mengeksekusi pesanan. Pastikan saldo Anda mencukupi sebelum melakukan pemesanan." method="POST" path="/transaction" />
                            <CodeBlock code={`// Format Body yang Wajib Dikirim:\n{\n  "kode_produk": "XDA55",\n  "tujuan": "081234567890",\n  "ref_id": "ORDER-001" // ID Unik/Order ID dari sistem Anda (Maksimal 50 Karakter)\n}`} />
                            <p className="text-sm text-gray-600 font-bold mb-2 mt-4">Contoh Balasan Transaksi Diterima:</p>
                            <CodeBlock code={`{\n  "status": true,\n  "message": "Transaksi Diterima",\n  "data": {\n    "ref_id": "ORDER-001",\n  "status": "Pending",\n    "sn": "Diproses"\n  }\n}`} />
                        </div>
                        {/* SECTION: STATUS */}
                        <div id="status">
                            <EndpointHeader title="5. Cek Status Manual" description="Mengecek status transaksi terakhir berdasarkan ref_id yang pernah Anda pesan sebelumnya." method="POST" path="/transaction/status" />
                            <CodeBlock code={`{\n  "ref_id": "ORDER-001"\n}\n\n// Contoh Balasan:\n{\n  "status": true,\n  "data": {\n    "status": "Sukses",\n    "sn": "1234567890123456"\n  }\n}`} />
                        </div>
                        {/* SECTION: WEBHOOK */}
                        <div id="webhook">
                            <EndpointHeader title="6. Smart Webhook (Callback Otomatis)" description="Lebih efisien! Anda tidak perlu mengecek status secara manual terus-menerus. Cukup isi URL Webhook di menu Profil, dan server kami akan memberi tahu server Anda jika pesanan telah Sukses/Gagal." method="POST" path="[URL_WEBHOOK_ANDA]" badge="REKOMENDASI" />
                            <p className="text-sm font-semibold text-gray-900 mb-3">📦 Data Payload yang akan kami kirim ke server Anda:</p>
                            <CodeBlock code={`// Data ini dikirim otomatis dalam format RAW JSON ke URL Webhook Anda\n{\n  "ref_id": "ORDER-001",\n  "status": "Sukses",\n  "sn": "0987654321",\n  "harga": 25000,\n  "tujuan": "081234567890"\n}`} />
                            <div className="bg-white border-2 border-blue-500 rounded-xl overflow-hidden mt-8 shadow-sm">
                                <div className="bg-blue-600 px-5 py-3 flex items-center gap-2">
                                    <h3 className="text-white font-bold text-lg">🛡️ Sistem Validasi Keamanan Webhook</h3>
                                </div>
                                <div className="p-5">
                                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                                        Untuk mencegah tindak penipuan (injeksi saldo palsu), kami membekali setiap notifikasi dengan "Kunci Rahasia" di bagian HTTP Header. <strong>Silakan pilih salah satu dari dua metode validasi di bawah ini yang paling cocok dengan kemampuan Anda:</strong>
                                    </p>
                                    {/* Jalur Pemula */}
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">METODE 1</span>
                                            <h4 className="font-bold text-green-900">Jalur Pemula (Paling Disarankan & Termudah)</h4>
                                        </div>
                                        <p className="text-sm text-green-800 mb-2 leading-relaxed">Anda tidak perlu repot meracik kode MD5. Cukup tangkap Header <code className="bg-green-100 px-1">Authorization</code> yang masuk, dan pastikan isinya sama persis dengan API Key milik Anda.</p>
                                        <code className="text-xs bg-white px-3 py-2 rounded border border-green-300 block font-mono">Authorization: Bearer API_KEY_ANDA_DI_SINI</code>
                                    </div>
                                    {/* Jalur Pro */}
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">METODE 2</span>
                                            <h4 className="font-bold text-gray-900">Jalur MD5 (Untuk Panel / Bot Profesional)</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">Jika skrip Anda (misalnya Bot Baileys) mewajibkan validasi MD5 Signature, kami menyediakan 4 jenis format *Header* sekaligus agar sesuai dengan standar kodingan Anda:</p>
                                        <ul className="space-y-2 text-sm font-mono text-gray-800 bg-white p-3 border border-gray-200 rounded">
                                            <li><span className="font-bold text-blue-600 w-28 inline-block">signature</span> : md5( API_KEY + REF_ID )</li>
                                            <li><span className="font-bold text-blue-600 w-28 inline-block">x-signature</span> : md5( REF_ID + API_KEY )</li>
                                            <li><span className="font-bold text-blue-600 w-28 inline-block">x-upper-sign</span> : MD5( REF_ID + API_KEY ) huruf besar</li>
                                            <li><span className="font-bold text-blue-600 w-28 inline-block">x-mila-sign</span> : md5( API_KEY + REF_ID + STATUS )</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* SECTION: ERROR DICTIONARY */}
                        <div id="errors" className="mt-16 pt-10 border-t-2 border-dashed border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚨 Kamus Error</h2>
                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                Apabila permintaan (request) Anda gagal diproses, perhatikan pesan error berikut untuk menemukan solusinya:
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="bg-white border-l-4 border-red-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100">
                                    <h5 className="font-bold text-gray-900 text-sm mb-1">HTTP 403 Forbidden</h5>
                                    <p className="text-xs text-gray-600">API Key salah atau IP Server Anda belum didaftarkan (Whitelist) oleh Admin.</p>
                                </div>
                                <div className="bg-white border-l-4 border-purple-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100">
                                    <h5 className="font-bold text-gray-900 text-sm mb-1">HTTP 429 Too Many Requests</h5>
                                    <p className="text-xs text-gray-600">Terlalu banyak permintaan dalam 1 detik. Harap beri jeda pada skrip Anda.</p>
                                </div>
                                <div className="bg-white border-l-4 border-yellow-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100">
                                    <h5 className="font-bold text-gray-900 text-sm mb-1">Saldo tidak cukup</h5>
                                    <p className="text-xs text-gray-600">Sistem otomatis menolak transaksi karena sisa saldo Anda tidak mencukupi untuk pesanan tersebut.</p>
                                </div>
                                <div className="bg-white border-l-4 border-orange-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100">
                                    <h5 className="font-bold text-gray-900 text-sm mb-1">Produk tidak ditemukan</h5>
                                    <p className="text-xs text-gray-600">Pastikan <code className="bg-gray-100 px-1">kode_produk</code> yang dikirim sama persis dengan yang ada di Katalog (Pricelist).</p>
                                </div>
                            </div>
                        </div>
                        {/* MESIN TESTER WEBHOOK */}
                        <div className="mt-16 p-6 bg-white shadow-md border border-gray-200 rounded-xl border-l-4 border-l-blue-600">
                            <div className="flex items-center gap-3 mb-3">                                <h3 className="text-xl font-bold text-gray-900">🛠️ Alat Uji Coba Webhook</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-6">
                                Gunakan fitur ini untuk melakukan simulasi pengiriman notifikasi ke server Anda sebelum mulai beroperasi secara nyata.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">URL Target Uji Coba</label>
                                    <input type="url" placeholder="https://domain-anda.com/callback" className="w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-2" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Simulasi Status</label>
                                    <select className="w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-2 font-medium" value={testStatus} onChange={(e) => setTestStatus(e.target.value)}>
                                        <option value="Sukses" className="text-green-600">✅ Sukses</option>
                                        <option value="Pending" className="text-yellow-600">⏳ Pending</option>
                                        <option value="Gagal" className="text-red-600">❌ Gagal</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={testWebhook} disabled={testLoading} className={`px-6 py-2.5 font-bold text-white text-sm rounded-lg shadow transition-all ${testLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {testLoading ? 'Memproses Pengujian...' : 'Kirim Uji Coba Webhook'}
                            </button>
                            {testResult && (
                                <div className={`mt-5 p-4 rounded-lg text-sm border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    {testResult.success ? (
                                        <>
                                            <div className="font-bold text-green-700 mb-1">✅ Berhasil Terkirim ke Server Anda!</div>
                                            <div className="text-gray-700 text-xs mt-2 bg-white p-2 rounded border border-green-100">{testResult.response_body || 'Tidak ada response body (balasan teks) dari server Anda'}</div>
                                        </>
                                    ) : (
                                        <div className="font-bold text-red-700">❌ Gagal Terkirim: {testResult.message}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
