import React, { useState, useMemo, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

const modernStyles = `
    .main-wrapper { background: #fcfcfd; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .balance-card { 
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
        border-radius: 28px; 
        box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.2);
        transition: all 0.5s ease-in-out;
    }
    .order-card { background: #ffffff; border-radius: 32px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .input-group { background: #f8fafc; border: 2px solid #f1f5f9; border-radius: 18px; transition: 0.3s; }
    .input-group:focus-within { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
    .btn-protocol { border: 2px solid #f1f5f9; border-radius: 20px; transition: 0.2s; background: #fff; color: #64748b; font-weight: 700; font-size: 13px; }
    .btn-protocol.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
    .btn-primary { background: #2563eb; border-radius: 20px; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
    .result-box { 
        background: #f8fafc; border-radius: 20px; border: 1px dashed #cbd5e1; 
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
        line-height: 1.6; white-space: pre-wrap; word-break: break-all; overflow-wrap: break-word; padding: 16px;
    }
`;

export default function VpnOrder({ products, userBalance }) {
    // 🛡️ State Saldo dipisah agar bisa diperbarui secara Live tanpa reload halaman!
    const [currentBalance, setCurrentBalance] = useState(userBalance || 0); 
    
    const [protocol, setProtocol] = useState('');
    const [duration, setDuration] = useState(30);
    const [kuota, setKuota] = useState(10);
    const [username, setUsername] = useState('');
    const [credential, setCredential] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const resultRef = useRef(null);

    const activeProd = useMemo(() => products.find(p => p.protocol === protocol), [protocol, products]);
    const price = activeProd ? activeProd.price_per_day * duration : 0;
    
    const isXray = protocol === 'vmess' || protocol === 'vless' || protocol === 'trojan';
    const isSshOrVpn = protocol === 'ssh' || protocol === 'zivpn';

    const onOrder = async () => {
        if (!protocol || !username) return Swal.fire('Oops!', 'Lengkapi Username Kak.', 'warning');
        if (isSshOrVpn && !credential) return Swal.fire('Oops!', 'Lengkapi Password Kak.', 'warning');
        
        setLoading(true);
        try {
            const payload = { protocol, duration, username };
            if (isXray) payload.kuota = kuota;
            if (isSshOrVpn) payload.credential = credential;

            const res = await axios.post('/order/vpn/proses', payload);
            if (res.data.status) {
                setResult(res.data.data);
                setCurrentBalance(res.data.new_balance); // <-- Update Saldo Real-time UI!
                Swal.fire('Sukses!', 'Akun VPN V12 berhasil dibuat.', 'success');
            } else {
                Swal.fire('Gagal', res.data.message, 'error');
            }
        } catch (e) {
            Swal.fire('Sistem Error', e.response?.data?.message || e.message, 'error');
        } finally { setLoading(false); }
    };

    return (
        <div className="main-wrapper pb-10">
            <Head title="Order VPN - MilaStore" />
            <style>{modernStyles}</style>

            <div className="max-w-md mx-auto p-5 flex items-center justify-between">
                <Link href="/" className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-600 border border-slate-100">
                    <i className="fa-solid fa-chevron-left"></i>
                </Link>
                <span className="font-extrabold text-slate-800 text-lg">MilaStore VPN</span>
                <div className="w-10"></div>
            </div>

            <div className="max-w-md mx-auto px-5">
                {/* 💳 Saldo sekarang bereaksi secara Live! */}
                <div className="balance-card p-6 mb-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Saldo Tersedia</p>
                        <h2 className="text-3xl font-black">Rp {currentBalance.toLocaleString('id-ID')}</h2>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                </div>

                <div className="order-card p-6 mb-6">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Pilih Layanan</label>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {products.map(p => (
                            <button key={p.id} onClick={() => { setProtocol(p.protocol); setResult(null); }} className={`btn-protocol p-4 flex flex-col items-center gap-2 ${protocol === p.protocol ? 'active' : ''}`}>
                                <i className={`fa-solid ${p.protocol === 'zivpn' ? 'fa-gamepad' : 'fa-server'} text-xl`}></i>
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {protocol && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Durasi Sewa</label>
                                    <span className="text-blue-600 font-black">{duration} Hari</span>
                                </div>
                                <input type="range" min="1" max="60" value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>

                            {isXray && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Batas Kuota</label>
                                        <span className="text-emerald-600 font-black">{kuota} GB</span>
                                    </div>
                                    <input type="range" min="1" max="100" value={kuota} onChange={e => setKuota(e.target.value)} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                                </div>
                            )}

                            <div className="input-group flex items-center p-1 mb-4">
                                <div className="px-4 text-slate-400"><i className="fa-solid fa-user"></i></div>
                                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))} className="w-full bg-transparent border-none focus:ring-0 font-bold py-3 text-slate-700" />
                            </div>

                            {/* 🛡️ Form Input Bug Resmi DIHAPUS. Hanya Password untuk SSH/ziVPN */}
                            {isSshOrVpn && (
                                <div className="input-group flex items-center p-1 mb-8">
                                    <div className="px-4 text-slate-400"><i className="fa-solid fa-key"></i></div>
                                    <input type="text" placeholder="Password Akun" value={credential} onChange={e => setCredential(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-bold py-3 text-slate-700" />
                                </div>
                            )}

                            <button onClick={onOrder} disabled={loading} className="btn-primary w-full py-4 text-white text-sm font-black flex justify-between px-6 items-center disabled:opacity-50 mt-4">
                                {loading ? <span>MEMPROSES...</span> : (
                                    <>
                                        <span>BELI SEKARANG</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-lg">Rp {price.toLocaleString('id-ID')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {result && (
                    <div className="order-card p-5 border-2 border-blue-100 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Akun Ready 🐾</h3>
                            <button onClick={() => { navigator.clipboard.writeText(resultRef.current.innerText); Swal.fire('Tersalin!', '', 'success'); }} className="text-blue-600 font-bold text-xs uppercase tracking-widest">Salin Data</button>
                        </div>
                        <div ref={resultRef} className="result-box" dangerouslySetInnerHTML={{ __html: result }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}
