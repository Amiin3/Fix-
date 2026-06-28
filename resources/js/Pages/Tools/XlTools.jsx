import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function XlTools({ auth, userBalance = 0 }) {
    const [activeTab, setActiveTab] = useState('xl'); 
    const [isLoading, setIsLoading] = useState(false);
    const [localBalance, setLocalBalance] = useState(userBalance);
    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    // --- STATE XL TEMBAK ---
    const [xlNumber, setXlNumber] = useState(localStorage.getItem('last_xl_number') || '');
    const [xlOtp, setXlOtp] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [xlInfo, setXlInfo] = useState(null);

    // --- STATE OTP PACKAGE ---
    const [otpPackages, setOtpPackages] = useState([]);
    const [otpDestination, setOtpDestination] = useState('');

    useEffect(() => {
        if (activeTab === 'otp' && otpPackages.length === 0) {
            fetchOtpPackages();
        }
    }, [activeTab]);

    const fetchOtpPackages = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/tools/xl/list-otp');
            if (res.data.success) {
                setOtpPackages(res.data.data.products || []);
            } else {
                Swal.fire('Gagal', res.data.message || 'Gagal mengambil data OTP', 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Jaringan bermasalah', 'error');
        }
        setIsLoading(false);
    };

    // ================= AKSI XL TEMBAK =================
    const reqOtp = async () => {
        if (!xlNumber) return Swal.fire('Oops', 'Masukkan Nomor XL!', 'warning');
        setIsLoading(true);
        localStorage.setItem('last_xl_number', xlNumber);
        try {
            const res = await axios.post('/tools/xl/get-otp', { number: xlNumber });
            if (res.data.success) Swal.fire('Sukses', 'OTP telah dikirim ke nomor Anda.', 'success');
            else Swal.fire('Gagal', res.data.message, 'error');
        } catch (e) { Swal.fire('Error', 'Sistem sibuk.', 'error'); }
        setIsLoading(false);
    };

    const loginOtp = async () => {
        if (!xlOtp) return Swal.fire('Oops', 'Masukkan Kode OTP!', 'warning');
        setIsLoading(true);
        try {
            const res = await axios.post('/tools/xl/login-otp', { number: xlNumber, code_otp: xlOtp });
            if (res.data.success) {
                setIsLoggedIn(true);
                fetchXlInfo();
                Swal.fire('Sukses', 'Berhasil Login XL!', 'success');
            } else Swal.fire('Gagal', res.data.message, 'error');
        } catch (e) { Swal.fire('Error', 'Sistem sibuk.', 'error'); }
        setIsLoading(false);
    };

    const loginSesi = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post('/tools/xl/login-sesi', { number: xlNumber });
            if (res.data.success) {
                setIsLoggedIn(true);
                fetchXlInfo();
                Swal.fire('Sukses', 'Berhasil Login via Sesi!', 'success');
            } else Swal.fire('Gagal', 'Sesi kadaluarsa, silakan minta OTP baru.', 'error');
        } catch (e) { Swal.fire('Error', 'Sistem sibuk.', 'error'); }
        setIsLoading(false);
    };

    const fetchXlInfo = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post('/tools/xl/get-info', { number: xlNumber });
            setXlInfo(res.data);
        } catch (e) { console.error(e); }
        setIsLoading(false);
    };

    const toggleLock = async (currentStatus) => {
        setIsLoading(true);
        try {
            const res = await axios.post('/tools/xl/set-lock', { number: xlNumber, is_locked: !currentStatus });
            if (res.data.success) {
                Swal.fire('Sukses', 'Status Kunci Pulsa Diubah!', 'success');
                fetchXlInfo();
            } else Swal.fire('Gagal', res.data.message, 'error');
        } catch (e) { Swal.fire('Error', 'Sistem sibuk.', 'error'); }
        setIsLoading(false);
    };

    const unregPaket = async (code) => {
        const conf = await Swal.fire({ title: 'Yakin Unreg?', text: "Paket akan dihapus dari kartu Anda!", icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Unreg!' });
        if (!conf.isConfirmed) return;
        setIsLoading(true);
        try {
            const res = await axios.post('/tools/xl/unreg', { number: xlNumber, unsubscribe_code: code });
            if (res.data.success) {
                Swal.fire('Sukses', 'Paket berhasil di-unreg.', 'success');
                fetchXlInfo();
            } else Swal.fire('Gagal', res.data.message, 'error');
        } catch (e) { Swal.fire('Error', 'Sistem sibuk.', 'error'); }
        setIsLoading(false);
    };

    // ================= AKSI BELI OTP =================
    const buyOtp = async (pkg) => {
        if (!otpDestination) return Swal.fire('Oops', 'Masukkan nomor tujuan!', 'warning');
        const hrg = pkg.display_price || 500; 
        if (parseFloat(localBalance) < parseFloat(hrg)) return Swal.fire('Oops', 'Saldo tidak cukup!', 'error');

        const conf = await Swal.fire({ title: 'Beli Paket OTP?', html: `<b>${pkg.name}</b><br>Harga: Rp ${formatRp(hrg)}<br><br><small>Tujuan: ${otpDestination}</small>`, icon: 'question', showCancelButton: true });
        if (!conf.isConfirmed) return;
        
        setIsLoading(true);
        try {
            const res = await axios.post('/tools/xl/order-otp', {
                destination: otpDestination,
                code: pkg.code,
                payment: 'PULSA', 
                price: hrg
            });
            if (res.data.success) {
                setLocalBalance(prev => prev - hrg);
                Swal.fire('Berhasil!', 'Paket OTP sedang diproses.', 'success').then(() => window.location.href = '/riwayat');
            } else {
                Swal.fire('Gagal', res.data.message, 'error');
            }
        } catch (e) { Swal.fire('Error', 'Sistem sibuk.', 'error'); }
        setIsLoading(false);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="XL Tools & OTP - Mila Store" />
            <div className="min-h-screen bg-[#F8FAFC] font-['Outfit'] pb-32">
                {/* 🌟 LOADER */}
                {isLoading && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="font-black text-blue-600 tracking-widest uppercase animate-pulse">Memproses Data...</p>
                    </div>
                )}

                {/* 🌟 HEADER SULTAN */}
                <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 pt-10 pb-20 px-5 rounded-b-[40px] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
                    <div className="max-w-md mx-auto relative z-10 flex justify-between items-center">
                        <Link href="/dashboard" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md"><i className="fa-solid fa-arrow-left"></i></Link>
                        <h1 className="text-xl font-black tracking-tight">X-Tools Premium</h1>
                        <div className="bg-white/20 px-3 py-1.5 rounded-xl font-black text-xs backdrop-blur-md border border-white/30">Rp {formatRp(localBalance)}</div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-10 relative z-20">
                    {/* 🌟 TAB MENU */}
                    <div className="flex bg-white rounded-2xl p-1.5 shadow-lg mb-6 border border-slate-100">
                        <button onClick={() => setActiveTab('xl')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'xl' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>XL Tembak</button>
                        <button onClick={() => setActiveTab('otp')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'otp' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Paket OTP</button>
                    </div>

                    {/* ================= TAB 1: XL TEMBAK ================= */}
                    {activeTab === 'xl' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            {!isLoggedIn ? (
                                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
                                    <div className="mb-5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor XL</label>
                                        <div className="flex items-center mt-1 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-blue-500 transition-all">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-mobile-screen"></i></div>
                                            <input type="tel" value={xlNumber} onChange={e => setXlNumber(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="0878..." />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-5">
                                        <button onClick={reqOtp} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all">1. Minta OTP</button>
                                        <button onClick={loginSesi} className="flex-1 bg-emerald-100 text-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-200 transition-all">Login Sesi</button>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode OTP</label>
                                        <input type="text" value={xlOtp} onChange={e => setXlOtp(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center font-black tracking-[0.5em] text-blue-600 focus:ring-blue-500" placeholder="••••••" />
                                    </div>
                                    <button onClick={loginOtp} className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all">2. Login OTP</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* INFO DASHBOARD XL */}
                                    {xlInfo && xlInfo.balance?.success && (
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-[28px] text-white shadow-xl relative overflow-hidden">
                                            <i className="fa-solid fa-sim-card absolute -right-4 -bottom-4 text-7xl opacity-20 -rotate-12"></i>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Pulsa Tersedia</p>
                                            <h2 className="text-3xl font-black tracking-tighter mb-4">{xlInfo.balance.data.remaining_text}</h2>
                                            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                                                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
                                                    <span className="opacity-70 block mb-0.5">Masa Aktif</span>
                                                    <span>{xlInfo.balance.data.expired_at}</span>
                                                </div>
                                                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
                                                    <span className="opacity-70 block mb-0.5">Tenggang</span>
                                                    <span>{xlInfo.balance.data.grace_end_date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                            <i className="fa-solid fa-map-location-dot text-2xl text-orange-500 mb-2"></i>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Lokasi Kartu</span>
                                            <span className="text-xs font-bold text-slate-700 mt-1">{xlInfo?.city?.data || 'Loading...'}</span>
                                        </div>
                                        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                            <i className="fa-solid fa-money-bill-transfer text-2xl text-rose-500 mb-2"></i>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Tagihan / Loan</span>
                                            <span className="text-xs font-bold text-rose-600 mt-1">{xlInfo?.loans?.data || 'Rp 0'}</span>
                                        </div>
                                    </div>

                                    {xlInfo && xlInfo.lock?.success && (
                                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-black text-slate-800 text-sm">Kunci Pulsa</h4>
                                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Status: {xlInfo.lock.data.is_locked ? 'Terkunci 🔒' : 'Terbuka 🔓'}</p>
                                            </div>
                                            <button onClick={() => toggleLock(xlInfo.lock.data.is_locked)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${xlInfo.lock.data.is_locked ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {xlInfo.lock.data.is_locked ? 'Buka Kunci' : 'Kunci Sekarang'}
                                            </button>
                                        </div>
                                    )}

                                    {xlInfo && xlInfo.quotas?.success && xlInfo.quotas.data.length > 0 && (
                                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                                            <h4 className="font-black text-slate-800 text-sm mb-4"><i className="fa-solid fa-chart-pie text-blue-500 mr-2"></i>Detail Paket</h4>
                                            <div className="space-y-3">
                                                {xlInfo.quotas.data.map((q, i) => (
                                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold text-xs text-slate-700">{q.name || 'Paket Data'}</p>
                                                            <p className="text-[10px] text-slate-500">{q.quota || 'Unlimited'}</p>
                                                        </div>
                                                        {q.unsubscribe_code && (
                                                            <button onClick={() => unregPaket(q.unsubscribe_code)} className="text-[9px] bg-rose-500 text-white px-2 py-1 rounded font-black uppercase">Unreg</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= TAB 2: PAKET OTP DENGAN DESKRIPSI ================= */}
                    {activeTab === 'otp' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 mb-5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Tujuan OTP</label>
                                <div className="flex items-center mt-1 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-indigo-500 transition-all">
                                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><i className="fa-solid fa-paper-plane"></i></div>
                                    <input type="tel" value={otpDestination} onChange={e => setOtpDestination(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="08xxx..." />
                                </div>
                            </div>

                            <h4 className="font-black text-slate-800 text-sm mb-3 ml-2">Pilih Paket OTP</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {otpPackages.map((pkg, i) => (
                                    <div key={i} onClick={() => buyOtp(pkg)} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 hover:border-indigo-300 cursor-pointer transition-all active:scale-[0.98] group overflow-hidden">
                                        
                                        {/* HEADER KARTU (Ikon, Nama, Harga) */}
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                                                    <i className="fa-solid fa-box-open"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 leading-tight pr-2">{pkg.name || pkg.code}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black tracking-widest uppercase">{pkg.code}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-indigo-600 text-sm">Rp {formatRp(pkg.display_price || 500)}</p>
                                                <p className="text-[9px] font-bold text-white bg-emerald-500 px-3 py-1 rounded-full uppercase mt-1.5 shadow-md shadow-emerald-200 inline-block group-hover:bg-emerald-600 transition-colors">Beli</p>
                                            </div>
                                        </div>

                                        {/* 🔥 AREA DESKRIPSI PAKET 🔥 */}
                                        {pkg.description && pkg.description.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100/80">
                                                <ul className="space-y-1.5">
                                                    {pkg.description.map((desc, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-[10.5px] font-medium text-slate-500 leading-relaxed">
                                                            <i className="fa-solid fa-circle-check text-emerald-400 mt-[3px] text-[10px]"></i>
                                                            <span>{desc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                    </div>
                                ))}

                                {otpPackages.length === 0 && !isLoading && (
                                    <div className="text-center py-10 bg-white rounded-[20px] border border-slate-100">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 text-2xl"><i className="fa-solid fa-box-open"></i></div>
                                        <p className="text-slate-400 font-bold text-sm">Tidak ada paket tersedia.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
