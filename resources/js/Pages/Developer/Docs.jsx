import React from 'react';
import { Head } from '@inertiajs/react';

export default function Docs() {
    return (
        <div className="bg-[#0b0f1a] min-h-screen text-slate-300 font-sans antialiased">
            <Head title="MilaPay V12 - Official Developer Documentation" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0b0f1a]/90 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-400 text-black px-2 py-0.5 rounded font-black text-xs italic">MILA</div>
                        <span className="text-white font-black tracking-tighter text-xl uppercase italic">PAY <span className="text-indigo-500">V12</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Status:</span>
                        <span className="text-emerald-400 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Production Ready
                        </span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                
                {/* Hero Section */}
                <div className="mb-16">
                    <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-none">
                        White-Label<br />
                        <span className="text-indigo-500">Core API Integration</span>
                    </h1>
                    <div className="p-6 bg-slate-800/30 rounded-3xl border border-white/5 border-l-4 border-l-yellow-400 max-w-3xl">
                        <p className="text-sm leading-relaxed">
                            <span className="text-yellow-400 font-bold uppercase tracking-tighter">Integrasi Tanpa Redirect:</span> MilaPay V12 memberikan keleluasaan bagi Developer untuk mengambil <strong>Raw Data</strong> pembayaran. Tampilkan QRIS atau instruksi bank di UI Anda sendiri secara profesional.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-20">

                        {/* 01. Create Transaction */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-black text-white/10 italic">01</span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create Transaction</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
                                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 uppercase mb-1">Header Auth</p>
                                        <span className="text-yellow-400">X-MILA-KEY: YOUR_KEY</span>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/5">
                                        <p className="text-slate-500 uppercase mb-1">Endpoint (POST)</p>
                                        <span className="text-emerald-400">/api/gateway/pay</span>
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-3xl overflow-hidden border border-white/5">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-white/5 text-slate-400 font-bold uppercase">
                                            <tr><th className="p-4">Parameter</th><th className="p-4">Description</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            <tr><td className="p-4 font-mono text-indigo-400">amount</td><td className="p-4 text-slate-400">Nominal dasar (Int)</td></tr>
                                            <tr><td className="p-4 font-mono text-indigo-400">method</td><td className="p-4 text-slate-400">QRIS_GOPAY, QRIS_SHOPEE, JAGO, SEABANK</td></tr>
                                            <tr><td className="p-4 font-mono text-indigo-400">external_id</td><td className="p-4 text-slate-400">ID Transaksi sistem Anda</td></tr>
                                            <tr><td className="p-4 font-mono text-indigo-400">webhook_url</td><td className="p-4 text-slate-400">URL Callback spesifik (Opsional)</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 02. Webhook (THE CORE FEATURE) */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-black text-white/10 italic">02</span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Webhook (Automated Report)</h2>
                            </div>
                            <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-indigo-500/20 space-y-6">
                                <p className="text-sm">MilaPay akan mengirimkan <strong>Callback JSON</strong> secara otomatis segera setelah sistem kami mendeteksi mutasi lunas.</p>
                                
                                <div className="bg-black/80 p-6 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Payload Callback (POST):</p>
                                    <pre className="text-xs text-blue-400 font-mono leading-relaxed overflow-x-auto">
{`{
  "trx_id": 437,
  "external_id": "ORDER-001",
  "status": "SUKSES",
  "amount": 10000,
  "total_bayar": 10567,
  "signature": "8d7f87f7d6a9b8c7e6d5..."
}`}
                                    </pre>
                                </div>

                                <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/30">
                                    <h4 className="text-xs font-black text-white uppercase mb-2">Signature Security:</h4>
                                    <p className="text-xs text-slate-400 mb-3">Untuk memvalidasi bahwa data benar dari MilaStore, gunakan rumus MD5 berikut:</p>
                                    <div className="bg-black/40 p-3 rounded-lg text-center font-mono text-indigo-300 text-xs">
                                        md5(trx_id + total_bayar + "MILAPAY_SECRET_V12")
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 03. Response JSON & Polling */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-black text-white/10 italic">03</span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Response & Polling</h2>
                            </div>
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 relative">
                                <div className="absolute top-6 right-8 text-[10px] font-bold text-slate-600 font-mono uppercase">JSON Output</div>
                                <pre className="text-xs md:text-sm text-green-400 overflow-x-auto leading-relaxed font-mono mt-4">
{`{
  "status": "success",
  "data": {
    "trx_id": 419,
    "total_bayar": 10882,
    "qr_image": "https://api.qrserver.com/v1/create-qr-code/...",
    "status_url": "https://milastore.web.id/api/gateway/status/419",
    "checkout_url": "https://milastore.web.id/checkout/v1/419"
  }
}`}
                                </pre>
                            </div>
                        </section>

                        {/* 04. Status & Management */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-black text-white/10 italic">04</span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Status & Cancellation</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-6 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Check Status (GET)</p>
                                    <code className="text-sm text-white">/status/{`{id}`}</code>
                                    <p className="text-[11px] text-slate-500 mt-2">Dapatkan info detail transaksi secara realtime.</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Cancel (POST)</p>
                                    <code className="text-sm text-white">/cancel/{`{id}`}</code>
                                    <p className="text-[11px] text-slate-500 mt-2">Batalkan tiket pembayaran yang belum dibayar.</p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Sidebar Tips */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 sticky top-28 border border-indigo-400/30">
                            <h3 className="text-white font-black italic mb-6 text-xl flex items-center gap-2">
                                <i className="fas fa-shield-alt text-yellow-400"></i> SULTAN GUIDE
                            </h3>
                            <ul className="space-y-6 text-indigo-100 text-[11px] font-bold leading-relaxed">
                                <li className="flex gap-4 border-b border-white/10 pb-4">
                                    <span className="text-yellow-400 text-lg italic">01</span>
                                    <span>Tampilkan <code className="bg-black/30 px-1.5 py-0.5 rounded text-white">qr_image</code> langsung via <code className="bg-black/30 px-1.5 py-0.5 rounded text-white">&lt;img&gt;</code> untuk kemudahan user.</span>
                                </li>
                                <li className="flex gap-4 border-b border-white/10 pb-4">
                                    <span className="text-yellow-400 text-lg italic">02</span>
                                    <span>Gunakan <code className="bg-black/30 px-1.5 py-0.5 rounded text-white">status_url</code> untuk polling status otomatis di sistem Anda.</span>
                                </li>
                                <li className="flex gap-4 border-b border-white/10 pb-4">
                                    <span className="text-yellow-400 text-lg italic">03</span>
                                    <span>Endpoint Webhook wajib merespon <b>200 OK</b> agar laporan tidak dikirim berulang kali.</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-yellow-400 text-lg italic">04</span>
                                    <span>Jangan pernah mengabaikan pengecekan <b>Signature</b> di sisi backend Reseller!</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-white/5 text-center mt-12 bg-black/40">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">MilaPay Secure Engine &copy; 2026</p>
            </footer>
        </div>
    );
}
