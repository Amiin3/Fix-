import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DocAkrab({ auth }) {
    const scrollTo = (id) => {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="MILASTORE H2H API - Dokumentasi" />
            
            <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-screen text-slate-800 pb-32">
                
                {/* HEADER */}
                <div className="mb-8 border-b border-slate-200 pb-5 text-center md:text-left">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 mb-1">
                        <i className="fa-solid fa-book-open mr-2 text-blue-600"></i> MILASTORE H2H API V12
                    </h2>
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
                        Official Developer & Integration Guide
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    
                    {/* SIDEBAR: TABLE OF CONTENTS */}
                    <div className="xl:col-span-1 hidden xl:block">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-bars-staggered mr-2"></i> Daftar Isi</h3>
                            <ul className="space-y-3 text-sm font-bold text-slate-600">
                                <li><button onClick={() => scrollTo('auth')} className="hover:text-blue-600 transition-colors text-left">1. Otentikasi & Header</button></li>
                                <li><button onClick={() => scrollTo('baca-json')} className="hover:text-blue-600 transition-colors text-left">2. Cara Membaca JSON XL</button></li>
                                <li><button onClick={() => scrollTo('endpoints')} className="hover:text-blue-600 transition-colors text-left">3. Daftar API & Payload</button></li>
                                <li><button onClick={() => scrollTo('contoh-backend')} className="hover:text-blue-600 transition-colors text-left">4. Contoh Code Backend (PHP)</button></li>
                                <li><button onClick={() => scrollTo('contoh-frontend')} className="hover:text-blue-600 transition-colors text-left">5. Contoh Code Frontend (JS)</button></li>
                            </ul>
                        </div>
                    </div>

                    {/* KONTEN DOKUMENTASI UTAMA */}
                    <div className="xl:col-span-3 space-y-8">
                        
                        {/* 1. OTENTIKASI */}
                        <section id="auth" className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-4 border-b border-slate-100 pb-3"><i className="fa-solid fa-shield-halved text-emerald-500 mr-2"></i> 1. Otentikasi & Base URL</h3>
                            <p className="text-sm text-slate-600 mb-4">Semua request harus mengarah ke Base URL dan wajib menyertakan API Key di dalam Header request Anda.</p>
                            
                            <div className="mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base URL:</span>
                                <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm font-bold text-blue-600 border border-slate-200 select-all">https://milastore.cloud/api/h2h/v12/</div>
                            </div>

                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Headers Wajib:</span>
                            <div className="bg-slate-900 text-blue-200 p-5 rounded-2xl font-mono text-sm overflow-x-auto shadow-inner">
                                Accept: application/json<br/>
                                Content-Type: application/json<br/>
                                <span className="text-yellow-400">X-AKRAB-KEY: MILA-AKRAB-XXXXXXXX</span>
                            </div>
                        </section>

                        {/* 2. CARA BACA JSON XL */}
                        <section id="baca-json" className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-4 border-b border-slate-100 pb-3"><i className="fa-solid fa-magnifying-glass-chart text-purple-500 mr-2"></i> 2. Cara Membaca JSON XL (Penting!)</h3>
                            <p className="text-sm text-slate-600 mb-4">Data dari server XL mentah menggunakan satuan <b>Bytes</b> dan waktu format <b>UNIX Timestamp</b>. Berikut rumus konversinya:</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                    <h4 className="font-black text-blue-800 text-sm mb-2">A. Konversi Kuota (Bytes ke GB)</h4>
                                    <p className="text-xs text-blue-600 font-mono mb-2">Rumus: Bytes / (1024 * 1024 * 1024)</p>
                                    <div className="bg-white p-2 rounded text-xs font-mono border text-slate-700">
                                        Data Asli: 80530636800<br/>
                                        Hasil: 75.00 GB
                                    </div>
                                </div>
                                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                    <h4 className="font-black text-orange-800 text-sm mb-2">B. Konversi Waktu (Timestamp)</h4>
                                    <p className="text-xs text-orange-600 font-mono mb-2">Rumus: Timestamp * 1000</p>
                                    <div className="bg-white p-2 rounded text-xs font-mono border text-slate-700">
                                        Data Asli: 1783011600<br/>
                                        Hasil: 01 Jul 2026, 12:00
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. ENDPOINTS */}
                        <section id="endpoints" className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-3"><i className="fa-solid fa-server text-orange-500 mr-2"></i> 3. Daftar API & Payload</h3>
                            
                            <div className="space-y-6">
                                {/* INFO PENGELOLA */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center gap-3">
                                        <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-[10px]">POST</span>
                                        <span className="font-mono text-sm font-bold text-slate-700">/akrab/info</span>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-slate-600 mb-2"><b>Fungsi:</b> Cek sisa kuota pengelola dan daftar member di dalam paket.</p>
                                        <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400">
                                            {`{ "msisdn": "62819xxx" }`}
                                        </div>
                                    </div>
                                </div>

                                {/* INVITE */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center gap-3">
                                        <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-[10px]">POST</span>
                                        <span className="font-mono text-sm font-bold text-slate-700">/akrab/invite</span>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-slate-600 mb-2"><b>Fungsi:</b> Memasukkan nomor pelanggan ke dalam paket Akrab.</p>
                                        <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400">
                                            {`{ "msisdn": "62819xxx_PENGELOLA", "target_msisdn": "628xxx_PELANGGAN", "slot_id": 1 }`}
                                        </div>
                                    </div>
                                </div>

                                {/* KICK */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center gap-3">
                                        <span className="bg-red-100 text-red-700 font-black px-2 py-1 rounded text-[10px]">POST</span>
                                        <span className="font-mono text-sm font-bold text-slate-700">/akrab/kick</span>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-slate-600 mb-2"><b>Fungsi:</b> Menendang (menghapus) nomor pelanggan dari paket Akrab.</p>
                                        <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400">
                                            {`{ "msisdn": "62819xxx_PENGELOLA", "target_msisdn": "628xxx_PELANGGAN" }`}
                                        </div>
                                    </div>
                                </div>

                                {/* SET KUBER / LIMIT */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 px-5 py-3 border-b flex items-center gap-3">
                                        <span className="bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-[10px]">POST</span>
                                        <span className="font-mono text-sm font-bold text-slate-700">/akrab/set-quota</span>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-slate-600 mb-2"><b>Fungsi:</b> Set Limit Kuber (Kuota Bersama). Isi 0 untuk Unlimited.</p>
                                        <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400">
                                            {`{ "msisdn": "62819xxx_PENGELOLA", "target_msisdn": "628xxx_PELANGGAN", "limit_gb": 5.5 }`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. CONTOH BACKEND PHP */}
                        <section id="contoh-backend" className="bg-slate-900 rounded-3xl border border-slate-700 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-white mb-4 border-b border-slate-700 pb-3"><i className="fa-brands fa-php text-indigo-400 mr-2"></i> 4. Contoh Integrasi Backend (PHP / Laravel)</h3>
                            <p className="text-sm text-slate-400 mb-4">Gunakan script ini di controller web Anda untuk menembak API MILASTORE secara aman (tanpa mengekspos API Key ke user).</p>
                            
                            <div className="bg-black p-5 rounded-xl font-mono text-xs overflow-x-auto text-slate-300">
<pre>{`// Contoh Fungsi Ambil Info Akrab menggunakan Laravel Http Client
use Illuminate\\Support\\Facades\\Http;

public function getInfoAkrab(\$msisdn_pengelola) {
    \$response = Http::withHeaders([
        'X-AKRAB-KEY'  => 'MILA-AKRAB-XXXXXXXX',
        'Content-Type' => 'application/json'
    ])->post('https://milastore.cloud/api/h2h/v12/info', [
        'msisdn' => \$msisdn_pengelola
    ]);

    if (\$response->successful()) {
        \$data = \$response->json();
        return response()->json(\$data);
    }

    return response()->json(['success' => false, 'error' => 'Gagal konek API MILASTORE']);
}`}</pre>
                            </div>
                        </section>

                        {/* 5. CONTOH FRONTEND REACT */}
                        <section id="contoh-frontend" className="bg-slate-900 rounded-3xl border border-slate-700 p-8 shadow-sm">
                            <h3 className="text-xl font-black text-white mb-4 border-b border-slate-700 pb-3"><i className="fa-brands fa-react text-cyan-400 mr-2"></i> 5. Contoh Render Frontend (Menampilkan Kuota)</h3>
                            <p className="text-sm text-slate-400 mb-4">Setelah mendapat response JSON di frontend Anda, gunakan kode ini agar Kuota Bytes berubah menjadi tampilan GB yang rapi.</p>
                            
                            <div className="bg-black p-5 rounded-xl font-mono text-xs overflow-x-auto text-slate-300">
<pre>{`import React, { useState, useEffect } from 'react';

export default function AkrabDashboard() {
    const [dataAkrab, setDataAkrab] = useState(null);

    // Rumus Wajib MILASTORE: Ubah Bytes jadi GB
    const formatGB = (bytes) => {
        if (!bytes || bytes <= 0) return "0 GB";
        return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
    };

    // Fungsi Fetch ke Backend Anda sendiri
    const fetchData = async () => {
        const res = await fetch('/api/backend-anda/info-akrab');
        const json = await res.json();
        if (json.success) setDataAkrab(json.data);
    };

    useEffect(() => { fetchData(); }, []);

    if (!dataAkrab) return <div>Loading...</div>;

    return (
        <div className="card">
            <h3>Sisa Kuota Utama: {formatGB(dataAkrab.remaining_quota)}</h3>
            
            <h4>Daftar Member:</h4>
            <ul>
                {dataAkrab.members.map((member, i) => (
                    <li key={i}>
                        Nomor: {member.msisdn} | Limit: {formatGB(member.usage?.quota_allocated)}
                    </li>
                ))}
            </ul>
        </div>
    );
}`}</pre>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
