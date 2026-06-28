import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

const generateDynamicQRIS = (qrisStatic, nominal) => {
    if (!qrisStatic) return "";
    let rawQris = qrisStatic.trim();
    const idx = rawQris.lastIndexOf("6304");
    if (idx !== -1) { rawQris = rawQris.substring(0, idx); }
    else { rawQris = rawQris.substring(0, rawQris.length - 4); }
    const nomStr = nominal.toString();
    const nomLen = nomStr.length.toString().padStart(2, '0');
    const qrisNominal = `${rawQris}54${nomLen}${nomStr}6304`;
    let crc = 0xFFFF;
    for (let i = 0; i < qrisNominal.length; i++) {
        crc ^= qrisNominal.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
            else crc = crc << 1;
        }
    }
    return qrisNominal + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

export default function Deposit({ auth, history, paymentSettings = [] }) {
    const [amount, setAmount] = useState('');
    const [metode, setMetode] = useState('QRIS_GOPAY');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const nominalOptions = [10000, 20000, 50000, 100000, 200000, 499000];
    const formatRp = (angka) => angka ? new Intl.NumberFormat('id-ID').format(angka) : '';
    const formatTime = (s) => `${Math.floor(s/3600)}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    const handleAmountChange = (e) => setAmount(e.target.value.replace(/\D/g, ''));
    const isQris = metode.includes('QRIS');
    const isOverLimit = isQris && parseInt(amount) >= 500000;
    
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: `${label} disalin!`, timer: 1500, showConfirmButton: false, background: '#0f172a', color: '#fff' });
    };

    const pendingTicket = (history || []).find(t => t.status === 'Pending');
    
    useEffect(() => {
        if (!pendingTicket) return;
        const expireTime = new Date(pendingTicket.created_at).getTime() + (24 * 60 * 60 * 1000);
        const timerId = setInterval(() => setTimeLeft(Math.max(0, Math.floor((expireTime - new Date().getTime()) / 1000))), 1000);
        return () => clearInterval(timerId);
    }, [pendingTicket]);

    useEffect(() => {
        if (!pendingTicket?.id) return;
        const pollingId = setInterval(async () => {
            try {
                const res = await axios.get(`/deposit/${pendingTicket.id}/status?_t=${new Date().getTime()}`);
                const status = res.data?.status?.toLowerCase();
                if (status === 'sukses') {
                    clearInterval(pollingId);
                    Swal.fire({title: '🎉 Pembayaran Sukses!', text: `Saldo Rp ${formatRp(pendingTicket.total_bayar)} telah masuk.`, icon: 'success', background: '#0f172a', color: '#fff', confirmButtonColor: '#3b82f6'})
                        .then(() => router.reload({ only: ['history'] }));
                } else if (status === 'dibatalkan' || status === 'gagal') {
                    clearInterval(pollingId);
                    Swal.fire({title: '❌ Dibatalkan', text: `Tagihan deposit dibatalkan.`, icon: 'error', background: '#0f172a', color: '#fff', confirmButtonColor: '#e11d48'})
                        .then(() => router.reload({ only: ['history'] }));
                }
            } catch (e) {}
        }, 3000);
        return () => clearInterval(pollingId);
    }, [pendingTicket?.id]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (isOverLimit) return;
        if (!amount || parseInt(amount) < 1000) return Swal.fire({title: 'Oops', text: 'Minimal Rp 1.000', icon: 'warning', background: '#0f172a', color: '#fff'});
        
        setIsLoading(true);
        try {
            const res = await axios.post(route('deposit.store'), { jumlah: amount, metode });
            setIsLoading(false);
            if (res.data.status === 'success') {
                Swal.fire({title: 'Berhasil!', text: res.data.message, icon: 'success', background: '#0f172a', color: '#fff', confirmButtonColor: '#3b82f6'}).then(() => { router.reload({ only: ['history'] }); setAmount(''); });
            } else Swal.fire({title: 'Gagal', text: res.data.message, icon: 'error', background: '#0f172a', color: '#fff'});
        } catch (error) { setIsLoading(false); Swal.fire({title: 'Error', text: 'Sistem error.', icon: 'error', background: '#0f172a', color: '#fff'}); }
    };

    const handleCancel = async (id) => {
        const confirm = await Swal.fire({ title: 'Batalkan Tiket?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', cancelButtonColor: '#334155', confirmButtonText: 'Ya, Batalkan', background: '#0f172a', color: '#fff' });
        if (confirm.isConfirmed) {
            try { await axios.post(route('deposit.cancel'), { id }); router.reload({ only: ['history'] }); }
            catch(e) { Swal.fire({title: 'Error', text: 'Gagal membatalkan.', icon: 'error', background: '#0f172a', color: '#fff'}); }
        }
    };

    const downloadQRIS = async (url) => {
        setIsDownloading(true);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            if (window.AndroidBridge) {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = function() {
                    const base64data = reader.result;
                    window.AndroidBridge.downloadBase64Image(base64data, `QRIS-MilaStore-Rp${pendingTicket.total_bayar}.png`);
                }
            } else {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `QRIS-MilaStore-Rp${pendingTicket.total_bayar}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'QRIS Berhasil Diunduh!', timer: 1500, showConfirmButton: false, background: '#0f172a', color: '#fff' });
            }
        } catch (error) { Swal.fire({title: 'Oops', text: 'Gagal mengunduh QRIS.', icon: 'error', background: '#0f172a', color: '#fff'}); }
        setIsDownloading(false);
    };

    const getBankData = (m) => paymentSettings.find(s => s.metode === m) || {};
    const pendingBankData = pendingTicket ? getBankData(pendingTicket.metode) : {};
    let finalQrisUrl = '';
    
    if (pendingTicket?.metode?.includes('QRIS') && pendingBankData.nomor) {
        const str = generateDynamicQRIS(pendingBankData.nomor, pendingTicket.total_bayar);
        finalQrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(str)}&margin=10`;
    }

    // 🚀 FITUR SULTAN: NAMA METODE BARU & DESAIN ELEGAN
    const paymentOptions = [
        { id: 'QRIS_GOPAY', name: 'QRIS All Payment 1', desc: 'Scan via Dana, OVO, LinkAja', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg', tag: '⚡ AUTO', tagClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' },
        { id: 'QRIS_SHOPEE', name: 'QRIS All Payment 2', desc: 'Scan via ShopeePay, BCA, dll', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', tag: '⚡ AUTO', tagClass: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]' },
        { id: 'SEABANK', name: 'Transfer SeaBank', desc: 'Gratis biaya admin antar bank', isTextLogo: true, textLogo: 'SeaBank', textClass: 'italic font-black text-orange-500 text-xl tracking-tighter', tag: '⚡ AUTO', tagClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]' },
        { id: 'JAGO', name: 'Transfer Bank Jago', desc: 'Otomatis masuk 24 Jam', isTextLogo: true, textLogo: 'jago', textClass: 'font-black text-yellow-500 text-2xl tracking-tighter lowercase', tag: '⚡ AUTO', tagClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' }
    ];
    
    const activeLogo = paymentOptions.find(p => p.id === pendingTicket?.metode);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Isi Saldo - V12 Ultimate" />
            <style>{`
                .cyber-bg { background-color: #0f172a; background-image: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1), transparent 70%); min-height: 100vh; }
                .cyber-card { background: linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(56, 189, 248, 0.15); box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5); }
                .input-cyber { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(51, 65, 85, 0.8); color: #e2e8f0; transition: all 0.3s ease; }
                .input-cyber:focus-within { border-color: #38bdf8; box-shadow: 0 0 15px -2px rgba(56, 189, 248, 0.3); background: rgba(15, 23, 42, 0.9); }
                .glow-text { text-shadow: 0 0 15px rgba(56, 189, 248, 0.6); }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(56,189,248, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(56,189,248, 0); } 100% { box-shadow: 0 0 0 0 rgba(56,189,248, 0); } }
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-pulse-ring { animation: pulse-ring 2s infinite; }
            `}</style>

            <div className="cyber-bg font-['Outfit'] pb-32">
                {/* 🌟 HEADER VIP */}
                <div className="relative pt-10 pb-24 px-6 rounded-b-[45px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-sky-500/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 opacity-90"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="max-w-md mx-auto relative z-10 flex justify-between items-center text-white mb-2">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-sky-500/20 hover:border-sky-500 transition-all backdrop-blur-md">
                            <i className="fa-solid fa-arrow-left-long text-sm text-sky-400"></i>
                        </Link>
                        <h6 className="text-[12px] font-black tracking-widest text-slate-300 m-0 uppercase glow-text">Brankas Deposit</h6>
                        <div className="w-10"></div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-4 -mt-16 relative z-20 space-y-6">
                    {!pendingTicket ? (
                        <div className="cyber-card rounded-[32px] p-6 animate-slide-up">
                            <form onSubmit={handleDeposit}>
                                {/* 💎 INPUT NOMINAL SULTAN */}
                                <div className="input-cyber rounded-[24px] p-6 mb-5 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/5 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <label className="text-[10px] font-black text-slate-400 tracking-widest block mb-3 uppercase relative z-10">Nominal Deposit</label>
                                    <div className="flex items-center justify-center overflow-hidden relative z-10">
                                        <span className="text-2xl font-black text-sky-400 mr-2 glow-text">Rp</span>
                                        <input type="tel" value={formatRp(amount)} onChange={handleAmountChange} placeholder="0" className="w-full border-none bg-transparent text-4xl md:text-5xl font-black text-white tracking-tighter p-0 focus:ring-0 text-center" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3 mb-8">
                                    {nominalOptions.map(nom => (
                                        <button type="button" key={nom} onClick={() => setAmount(nom.toString())} className={`py-3.5 rounded-[16px] text-[11px] font-black transition-all border ${amount === nom.toString() ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] -translate-y-1' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'}`}>
                                            {formatRp(nom)}
                                        </button>
                                    ))}
                                </div>

                                {isOverLimit && (
                                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-[20px] animate-pulse">
                                        <p className="text-[11px] font-black text-rose-400 leading-relaxed text-center">
                                            ⚠️ LIMIT QRIS Rp 499.000!<br/>Gunakan Transfer Bank untuk nominal besar.
                                        </p>
                                    </div>
                                )}

                                <label className="text-[10px] font-black text-slate-400 tracking-widest block mb-3 ml-2 uppercase">Metode Pembayaran</label>
                                <div className="space-y-3 mb-8">
                                    {paymentOptions.map(opt => (
                                        <div key={opt.id} onClick={() => setMetode(opt.id)} className={`relative border rounded-[24px] p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${metode === opt.id ? 'border-sky-500 bg-sky-900/20 shadow-[0_0_20px_rgba(56,189,248,0.15)]' : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2">
                                                    {opt.isTextLogo ? <span className={opt.textClass}>{opt.textLogo}</span> : <img src={opt.logo} alt={opt.name} className="max-h-full max-w-full object-contain" />}
                                                </div>
                                                <div>
                                                    <h6 className="font-black text-white text-sm m-0 mb-1">{opt.name}</h6>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${opt.tagClass}`}>{opt.tag}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">{opt.desc}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${metode === opt.id ? 'border-sky-500 bg-sky-500 text-white shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'border-slate-600'}`}>
                                                {metode === opt.id && <i className="fa-solid fa-check text-[10px]"></i>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" disabled={isLoading || !amount || parseInt(amount) < 1000 || isOverLimit} className={`w-full font-black py-5 rounded-[20px] text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isOverLimit ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_10px_25px_rgba(56,189,248,0.3)] border border-sky-400/50'}`}>
                                    {isLoading ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> MEMPROSES...</> : (isOverLimit ? 'Limit Nominal' : <><i className="fa-solid fa-bolt text-lg text-yellow-300"></i> LANJUTKAN DEPOSIT</>)}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* ⏳ HALAMAN PENDING TICKET (INVOICE SULTAN) */
                        <div className="cyber-card rounded-[32px] p-8 border-t-[8px] border-t-sky-500 relative overflow-hidden animate-slide-up">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center bg-amber-500/10 text-amber-400 px-5 py-2 rounded-full text-xs font-black border border-amber-500/30 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    <i className="fa-regular fa-clock mr-2 animate-pulse"></i> Selesaikan dalam {formatTime(timeLeft)}
                                </div>
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="h-14 bg-white rounded-[16px] shadow-sm flex items-center justify-center px-6 py-2 border border-slate-200">
                                    {activeLogo?.isTextLogo ? <span className={activeLogo.textClass}>{activeLogo.textLogo}</span> : <img src={activeLogo?.logo} alt={activeLogo?.name} className="h-full object-contain" />}
                                </div>
                            </div>

                            <div className="text-center bg-slate-900/50 rounded-[24px] p-6 mb-6 border border-slate-700/50 shadow-inner">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2 glow-text">Transfer Tepat Sesuai Nominal</p>
                                <h1 className="font-black text-white text-[42px] leading-none mb-4 tracking-tighter text-ellipsis overflow-hidden glow-text">Rp {formatRp(pendingTicket.total_bayar)}</h1>
                                <button onClick={() => copyToClipboard(pendingTicket.total_bayar, 'Nominal')} className="bg-sky-500/20 border border-sky-500/50 hover:bg-sky-500 hover:text-white text-sky-400 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                                    <i className="fa-regular fa-copy mr-1.5"></i> SALIN NOMINAL
                                </button>
                            </div>

                            {pendingTicket.metode.includes('QRIS') ? (
                                <div className="text-center mb-6">
                                    {finalQrisUrl ? (
                                        <div className="inline-flex flex-col items-center">
                                            <div className="p-4 border border-sky-500/50 rounded-[24px] bg-white shadow-[0_0_30px_rgba(56,189,248,0.2)] mb-4">
                                                <img src={finalQrisUrl} className="rounded-xl" width="220" alt="QRIS" />
                                            </div>
                                            <button onClick={() => downloadQRIS(finalQrisUrl)} disabled={isDownloading} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border border-emerald-400/50 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-[0_5px_15px_rgba(16,185,129,0.3)]">
                                                <i className={`fa-solid ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'} mr-2 text-sm`}></i>
                                                {isDownloading ? 'MENGUNDUH...' : 'SIMPAN QRIS KE HP'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-2xl font-bold text-xs">QRIS Belum Disetting Admin</div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-800/50 border border-slate-700/50 rounded-[24px] p-5 mb-6 text-left relative overflow-hidden">
                                    <div className="mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Rekening Tujuan</p>
                                        <div className="flex justify-between items-center">
                                            <p className="font-black text-2xl text-white tracking-tight glow-text">{pendingBankData.nomor || 'Belum Disetting'}</p>
                                            <button onClick={() => copyToClipboard(pendingBankData.nomor, 'Rekening')} className="w-10 h-10 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><i className="fa-regular fa-copy text-lg"></i></button>
                                        </div>
                                    </div>
                                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Atas Nama</p><p className="font-black text-sm text-sky-400 glow-text">{pendingBankData.atas_nama || '-'}</p></div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-3 mb-8">
                                <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse-ring"></div>
                                <span className="text-[10px] font-black text-sky-400 tracking-widest uppercase">Menunggu Pembayaran...</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed border-slate-700">
                                <button onClick={() => handleCancel(pendingTicket.id)} className="bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 font-black py-4 rounded-[18px] text-[10px] uppercase tracking-widest active:scale-95 transition-all">BATALKAN</button>
                                <a href={`https://wa.me/6287760390507?text=Halo%20Admin,%20saya%20sudah%20transfer%20deposit%20ID%20${pendingTicket.id}%20via%20${pendingTicket.metode}%20sebesar%20Rp%20${formatRp(pendingTicket.total_bayar)}`} target="_blank" rel="noreferrer" className="bg-slate-800 border border-slate-600 text-white flex items-center justify-center font-black py-4 rounded-[18px] text-[10px] uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all"><i className="fa-brands fa-whatsapp text-sm mr-2 text-emerald-400"></i> BANTUAN</a>
                            </div>
                        </div>
                    )}

                    {/* 📜 RIWAYAT TRANSAKSI */}
                    <div className="pt-4 pb-8 relative z-20">
                        <h6 className="font-black text-slate-400 text-[11px] tracking-widest mb-4 ml-2 uppercase">Riwayat Terakhir</h6>
                        <div className="cyber-card rounded-[24px] p-3">
                            {history.filter(h => h.status !== 'Pending').length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-xs font-bold">Belum ada riwayat deposit.</div>
                            ) : (
                                history.filter(h => h.status !== 'Pending').map((r, index) => {
                                    let st = r.status.toLowerCase();
                                    let stBadge = (st === 'sukses') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : ((st === 'gagal' || st === 'dibatalkan') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30');
                                    let dateObj = new Date(r.created_at);
                                    let formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
                                    
                                    // Rapihkan nama riwayat biar nyambung sama nama baru
                                    let displayMetode = r.metode;
                                    if(r.metode === 'QRIS_GOPAY') displayMetode = 'QRIS 1';
                                    if(r.metode === 'QRIS_SHOPEE') displayMetode = 'QRIS 2';

                                    return (
                                        <div key={r.id} className={`flex justify-between items-center p-4 ${index !== history.filter(h => h.status !== 'Pending').length - 1 ? 'border-b border-slate-700/50' : ''} hover:bg-slate-800/30 transition-colors rounded-2xl`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center border border-slate-700 shadow-inner">
                                                    <i className="fa-solid fa-wallet text-lg"></i>
                                                </div>
                                                <div>
                                                    <span className="block font-black text-white text-sm mb-1">Rp {formatRp(r.total_bayar)}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">{displayMetode} • {formattedDate}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${stBadge}`}>
                                                    {r.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
