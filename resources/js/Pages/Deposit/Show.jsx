import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function DepositShow({ trx, payInfo, qrUrl }) {
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
    const [liveStatus, setLiveStatus] = useState(trx.status);
    const [pingCount, setPingCount] = useState(0);
    const [debugMsg, setDebugMsg] = useState('Standby...');

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
        return () => clearInterval(timer);
    }, []);

    // 🚀 SMART POLLING DENGAN AXIOS (CCTV AKTIF)
    useEffect(() => {
        if (liveStatus.toLowerCase() === 'sukses') return;

        const interval = setInterval(async () => {
            try {
                setPingCount(prev => prev + 1);
                setDebugMsg('Tanya ke server...');
                
                const res = await axios.get(`/deposit/${trx.id}/status?_t=${new Date().getTime()}`);
                
                if (res.data && res.data.status) {
                    setDebugMsg(`Jawab: ${res.data.status}`);
                    if (res.data.status.toLowerCase() === 'sukses') {
                        setLiveStatus('sukses');
                    }
                } else {
                    setDebugMsg('Jawaban server kosong');
                }
            } catch (e) {
                setDebugMsg(`Error: ${e.response?.status || e.message}`);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [liveStatus, trx.id]);

    const copy = (txt, label) => {
        navigator.clipboard.writeText(txt);
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: `${label} disalin!`, showConfirmButton: false, timer: 1500 });
    };

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // ✨ TAMPILAN JIKA SUKSES
    if (liveStatus.toLowerCase() === 'sukses') {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6 text-center font-sans">
                <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-sm w-full border border-white relative overflow-hidden">
                    <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50"></div>
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 relative z-10 shadow-inner">
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter relative z-10">Pembayaran Sukses!</h2>
                    <p className="text-slate-500 mb-8 text-sm font-bold relative z-10">Saldo Rp {formatRp(trx.total_bayar)} berhasil masuk.</p>
                    <Link href="/deposit" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-2xl font-black uppercase tracking-widest text-xs relative z-10 shadow-lg shadow-emerald-200">
                        Kembali ke Deposit
                    </Link>
                </div>
            </div>
        );
    }

    // ⏳ TAMPILAN JIKA PENDING (QRIS)
    return (
        <div className="mx-auto min-h-screen pb-24 bg-[#F8F9FA] font-sans relative" style={{ maxWidth: '480px' }}>
            <Head title={`Bayar #${trx.id}`} />
            
            {/* BOX CCTV DI BAWAH LAYAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-emerald-400 text-[10px] p-2 font-mono flex justify-between z-[100] border-t border-slate-700">
                <span><i className="fa-solid fa-satellite-dish animate-pulse mr-1"></i> Ping: {pingCount}x</span>
                <span>{debugMsg}</span>
            </div>

            <div className="bg-indigo-600 pt-12 pb-32 px-6 rounded-b-[40px] shadow-xl text-center text-white relative">
                <h3 className="text-lg font-black tracking-tight italic">Selesaikan Pembayaran</h3>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">ID Transaksi #{trx.id}</p>
            </div>

            <div className="px-5 mt-[-100px] relative z-10">
                <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 overflow-hidden border border-white p-8">
                    <div className="text-center mb-6">
                        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-black inline-flex items-center gap-2 mb-8 border border-amber-100/50">
                            <i className="fa-regular fa-clock"></i> {formatTime(timeLeft)}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">TOTAL TRANSFER (WAJIB SAMA PERSIS)</p>
                        <h1 className="text-4xl font-black text-slate-800 mb-6 tracking-tighter">Rp {formatRp(trx.total_bayar)}</h1>
                        
                        <button onClick={() => copy(trx.total_bayar, 'Nominal')} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-6 py-2.5 rounded-full uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                            <i className="fa-regular fa-copy mr-1"></i> SALIN NOMINAL
                        </button>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-100 w-full mb-8"></div>

                    {trx.metode === 'QRIS' ? (
                        <div className="text-center">
                            <div className="bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm inline-block mb-4">
                                <img src={qrUrl} className="rounded-2xl" width="220" alt="QRIS" />
                            </div>
                            <p className="text-[11px] font-black text-slate-500 tracking-wide mt-2">
                                <i className="fa-solid fa-qrcode text-indigo-500 mr-1.5"></i> Scan dengan E-Wallet apa saja
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">No. Rekening {trx.metode}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-lg font-black text-slate-700 font-mono tracking-widest">{payInfo?.nomor}</p>
                                <button onClick={() => copy(payInfo?.nomor, 'Rekening')} className="text-indigo-600 hover:text-indigo-800"><i className="fa-regular fa-copy text-lg"></i></button>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-1">A/N {payInfo?.atas_nama}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={() => router.post(`/deposit/${trx.id}/cancel`)} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-colors">Batalkan</button>
                    <Link href="/deposit" className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center border border-slate-100 hover:bg-slate-100 transition-colors">Tutup</Link>
                </div>
            </div>
        </div>
    );
}
