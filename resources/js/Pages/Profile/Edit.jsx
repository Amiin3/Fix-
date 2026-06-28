import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdatePinForm from './Partials/UpdatePinForm';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Edit({ auth, full_user, mustVerifyEmail, status }) {
    const { url } = usePage();
    const [appTheme, setAppTheme] = useState({ bg_type: 'color_dark', bg_value: 'from-[#1e3a8a] via-[#1d4ed8] to-[#3b82f6]' });
    
    // 🚀 BACA LEVEL VIP DARI CONTROLLER
    const userLevel = full_user?.level || auth?.user?.level || 'member';
    
    // 🚀 KONFIGURASI BADGE SULTAN
    const levelConfig = {
        member: { label: 'Member', color: 'bg-slate-500', icon: 'fa-medal text-slate-300', shadow: 'shadow-slate-500/50' },
        reseller: { label: 'Reseller', color: 'bg-gradient-to-r from-amber-400 to-yellow-600', icon: 'fa-crown text-yellow-200', shadow: 'shadow-amber-500/50' },
        h2h: { label: 'Partner H2H', color: 'bg-gradient-to-r from-blue-500 to-indigo-700', icon: 'fa-gem text-blue-200', shadow: 'shadow-blue-500/50' },
        admin: { label: 'Owner', color: 'bg-gradient-to-r from-rose-500 to-purple-700', icon: 'fa-shield-halved text-rose-200', shadow: 'shadow-rose-500/50' }
    };
    const currentLevel = levelConfig[userLevel.toLowerCase()] || levelConfig.member;
    
    const [h2h, setH2h] = useState({
        api_key: full_user?.api_key || auth?.user?.api_key || '',
            payment_webhook: full_user?.payment_webhook || auth?.user?.payment_webhook || '',
        payment_secret: full_user?.payment_secret || auth?.user?.payment_secret || '',
        webhook_url: full_user?.webhook_url || auth?.user?.webhook_url || '',
        ip_whitelist: full_user?.ip_whitelist || auth?.user?.ip_whitelist || ''
    });

    useEffect(() => {
        axios.get('/api/theme/status').then(res => setAppTheme(res.data)).catch(() => {});
    }, []);

    const isSpace = appTheme.bg_value === 'animated_space';
    const isClouds = appTheme.bg_value === 'animated_clouds';
    const actualThemeType = (isSpace || isClouds) ? appTheme.bg_value : appTheme.bg_type;
    const isLightTheme = actualThemeType === 'color_light';
    
    let themeClass = `bg-gradient-to-br ${appTheme.bg_value}`;
    let themeStyle = {};
    let textPrimary = 'text-white';
    let textSecondary = 'text-white/80';
    let cardBg = 'bg-white/10 border-white/20 shadow-inner';
    let avatarBg = 'bg-white/20 border-white/30 backdrop-blur-md';
    
    if (isLightTheme) {
        textPrimary = 'text-slate-800';
        textSecondary = 'text-slate-500';
        cardBg = 'bg-white border-slate-200 shadow-[0_5px_15px_rgba(0,0,0,0.05)]';
        avatarBg = 'bg-slate-50 border-slate-200';
    } else if (actualThemeType === 'image') {
        themeClass = 'bg-slate-900';
        themeStyle = { backgroundImage: `url('${appTheme.bg_value}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (actualThemeType === 'animated_space') { themeClass = 'bg-animated-space'; }
    else if (actualThemeType === 'animated_clouds') { themeClass = 'bg-animated-clouds'; }
    
    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n || 0);    
    const displayBalance = auth?.user?.saldo || auth?.user?.balance || 0;
    const uiAvatarUrl = `https://ui-avatars.com/api/?name=${auth?.user?.name || 'User'}&background=random&color=fff&bold=true`;
    
    const handleComingSoon = (feature) => {
        Swal.fire({ icon: 'info', title: 'Segera Hadir!', text: `Fitur ${feature} sedang dikembangkan.`, confirmButtonColor: '#3b82f6' });
    };
    
    const handleUpdateH2H = (action = 'save') => {
        const payload = (action === 'generate' || action === 'generate_secret') ? { action } : { ...h2h, action: 'save' };
        axios.post('/profile/update-h2h', payload)
            .then(res => {
                if(res.data.status) {
                    if(action === 'generate') {
                        Swal.fire({ title: 'Berhasil!', text: 'Sistem akan merefresh untuk memuat API Key baru.', icon: 'success', timer: 1500, showConfirmButton: false });
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        Swal.fire({ toast: true, position: 'top', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 2000 });
                    }
                }
            })
            .catch(err => {
                Swal.fire({ icon: 'error', title: 'Akses Ditolak!', text: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
            });
    };
    
    const handleCopy = (txt) => {
        if(!txt) return Swal.fire({ toast: true, position: 'top', icon: 'warning', title: 'Key Kosong!', showConfirmButton: false, timer: 1500 });
        navigator.clipboard.writeText(txt);
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'Berhasil Disalin!', showConfirmButton: false, timer: 1500 });
    };

    return (
        <>
            <Head title="Profil Sultan - MilaStore" />
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes moveSpace { 0% { background-position: 0 0; } 100% { background-position: 300px 300px; } }
                @keyframes moveClouds { 0% { background-position: 0 0; } 100% { background-position: 600px 0; } }
                .bg-animated-space { background-color: #0b0f19; background-image: radial-gradient(1.5px 1.5px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)); background-repeat: repeat; background-size: 250px 250px; animation: moveSpace 20s linear infinite; }
                .bg-animated-clouds { background-color: #0ea5e9; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250' viewBox='0 0 200 200'%3E%3Cpath fill='%23ffffff' fill-opacity='0.4' d='M59 39c-7.7 0-14.2 5.6-15.7 12.9-4.3-1.4-8.9 4-8.9 10.6 0 7.7 6.2 14 14 14h56c9.9 0 18-8.1 18-18 0-9.1-6.9-16.7-15.7-17.9C103.1 34.4 92.6 27 81 27c-10.7 0-20.1 6.7-23.7 16.2-.5-2.1-2.5-4.2-4.3-4.2zm76 48c-5.8 0-10.6 4.2-11.8 9.7-3.2-1-6.7 3-6.7 8 0 5.8 4.7 10.5 10.5 10.5h42c7.4 0 13.5-6.1 13.5-13.5 0-6.8-5.2-12.5-11.8-13.4C168.3 84.8 160.5 79 152 79c-8 0-15 5-17.7 12.1-.3-1.6-1.8-3.1-3.3-3.1z'/%3E%3C/svg%3E"); animation: moveClouds 35s linear infinite; }
            `}} />
            <AuthenticatedLayout user={auth?.user}>
                <div className="min-h-screen pb-32">
                    <div className={`pt-12 pb-24 px-6 rounded-b-[3rem] relative overflow-hidden transition-all duration-700 ${themeClass}`} style={themeStyle}>
                        <div className="max-w-md mx-auto relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 overflow-hidden ${avatarBg}`}>                                        <img src={uiAvatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-black leading-tight drop-shadow-sm ${textPrimary}`}>{auth?.user?.name || 'User'}</h2>
                                        <div className={`mt-1 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-lg ${currentLevel.color} ${currentLevel.shadow}`}>
                                            <i className={`fa-solid ${currentLevel.icon} text-[10px]`}></i>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">{currentLevel.label}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link href={route('dashboard')} className={`w-10 h-10 rounded-full flex items-center justify-center ${isLightTheme ? 'bg-slate-100 text-slate-500' : 'bg-white/20 text-white'}`}>
                                    <i className="fa-solid fa-house"></i>
                                </Link>
                            </div>
                            <div className={`backdrop-blur-xl border rounded-[2rem] p-6 flex justify-between items-center relative overflow-hidden ${cardBg}`}>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textSecondary}`}>Saldo Aktif</p>
                                    <h3 className={`text-2xl font-black tracking-tighter ${textPrimary}`}>
                                        <span className={`text-sm mr-1 ${textSecondary}`}>Rp</span>
                                        {formatRp(displayBalance)}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textSecondary}`}>Bergabung</p>
                                    <h3 className={`text-xs font-black ${textPrimary}`}>
                                        {auth?.user?.created_at ? new Date(auth.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto px-5 -mt-10 relative z-50 space-y-6">
                        <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden">                            
                            <div className="p-3">
                                <Link href="/riwayat" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i className="fa-solid fa-clock-rotate-left"></i></div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">Riwayat Transaksi</h5>
                                            <p className="text-[10px] font-medium text-slate-400">Pantau semua transaksi Anda</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </Link>
                                <Link href="/mutasi" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i className="fa-solid fa-money-bill-transfer"></i></div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">Mutasi Saldo</h5>
                                            <p className="text-[10px] font-medium text-slate-400">Cek pemasukan & pengeluaran</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </Link>
                                <button onClick={() => handleComingSoon('Daftar Harga')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i className="fa-solid fa-tags"></i></div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">Daftar Harga</h5>
                                            <p className="text-[10px] font-medium text-slate-400">Harga update produk PPOB</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </button>
                                <Link href={route('referral.index')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i className="fa-solid fa-users"></i></div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">Downline & Referral</h5>
                                            <p className="text-[10px] font-medium text-slate-400">Ajak teman dapatkan komisi</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </Link>
                                <Link href="/notifikasi" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center text-lg relative group-hover:scale-110 transition-transform">
                                            <i className="fa-solid fa-bell"></i>
                                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-sky-50"></span>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">Pusat Notifikasi</h5>
                                            <p className="text-[10px] font-medium text-slate-400">Pemberitahuan & Info Penting</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </Link>
                                <Link href="/bantuan" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group border-b border-slate-50 last:border-0 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"><i className="fa-solid fa-headset"></i></div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">Bantuan & CS</h5>
                                            <p className="text-[10px] font-medium text-slate-400">Hubungi kami jika ada kendala</p>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                </Link>
                            </div>
                        </div>

                        {/* 🚀 MENU API & WEBHOOK DIBUKA UNTUK SEMUA LEVEL BIAR RESELLER GAK BINGUNG */}
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <h4 className="font-black text-slate-800 text-xs mb-5 uppercase tracking-widest flex items-center gap-2">
                                <i className="fa-solid fa-code text-indigo-500"></i> API & Integrasi H2H
                            </h4>
                            <div className="space-y-4">
                                <Link href={route('developer.api')} className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-100 p-4 rounded-2xl transition-all group text-left mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><i className="fa-solid fa-book"></i></div>
                                        <span className="font-bold text-slate-700 text-xs">Baca Dokumentasi API</span>
                                    </div>
                                    <i className="fa-solid fa-arrow-right text-slate-400 text-xs group-hover:translate-x-1 transition-transform"></i>
                                </Link>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Secret API Key</label>
                                    <div className="flex gap-2 mt-1">
                                        <input readOnly value={h2h.api_key} className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none" placeholder="Belum ada Key..." />
                                        <button onClick={() => handleUpdateH2H('generate')} className="bg-indigo-600 text-white px-3 rounded-xl active:scale-90 transition-all shadow-md"><i className="fa-solid fa-rotate"></i></button>
                                        <button onClick={() => handleCopy(h2h.api_key)} className="bg-slate-800 text-white px-3 rounded-xl active:scale-90 transition-all shadow-md"><i className="fa-solid fa-copy"></i></button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">URL Webhook (Callback)</label>
                                    <input value={h2h.webhook_url} onChange={e => setH2h({...h2h, webhook_url: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 mt-1 outline-none focus:border-indigo-500 transition-all" placeholder="https://web-anda.com/callback" />
                                    <div className="mt-4 p-4 bg-indigo-500/5 rounded-2xl border-2 border-dashed border-indigo-500/20">
                                        <label className="text-[10px] font-black uppercase text-indigo-500 ml-1">URL Webhook Payment (MilaPay)</label>
                                        <input value={h2h.payment_webhook} onChange={e => setH2h({...h2h, payment_webhook: e.target.value})} className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 mt-1 outline-none focus:border-indigo-500" placeholder="https://web-anda.com/callback-payment" />
                                        <p className="text-[9px] text-indigo-400 mt-1 italic font-bold">* Khusus laporan QRIS, JAGO, SEABANK (MilaPay V12)</p>
                                    <div className="mt-4 border-t border-indigo-500/20 pt-4">
                                        <label className="text-[10px] font-black uppercase text-indigo-500 ml-1">Secret Key Webhook (Signature)</label>
                                        <div className="flex gap-2 mt-1">
                                            <input readOnly value={h2h.payment_secret} className="flex-1 bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none" placeholder="Belum ada Secret Key..." />
                                            <button onClick={() => handleUpdateH2H("generate_secret")} className="bg-indigo-600 text-white px-3 rounded-xl active:scale-90 transition-all shadow-md"><i className="fa-solid fa-rotate"></i></button>
                                            <button onClick={() => handleCopy(h2h.payment_secret)} className="bg-slate-800 text-white px-3 rounded-xl active:scale-90 transition-all shadow-md"><i className="fa-solid fa-copy"></i></button>
                                        </div>
                                        <p className="text-[9px] text-indigo-400 mt-1 italic font-bold">* Gunakan ini untuk validasi MD5 di script tujuan</p>
                                    </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Whitelist IP Server</label>
                                    <input value={h2h.ip_whitelist} onChange={e => setH2h({...h2h, ip_whitelist: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 mt-1 outline-none focus:border-indigo-500 transition-all" placeholder="Contoh: 1.2.3.4, 5.6.7.8" />
                                </div>
                                <button onClick={() => handleUpdateH2H('save')} className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg flex justify-center items-center gap-2">
                                    <i className="fa-solid fa-floppy-disk"></i> Simpan Konfigurasi
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50">
                            <h4 className="font-black text-slate-800 text-xs mb-5 uppercase tracking-widest px-1 opacity-80 flex items-center gap-2">
                                <i className="fa-solid fa-user-pen text-blue-500"></i> Informasi Pribadi
                            </h4>
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50">
                            <h4 className="font-black text-slate-800 text-xs mb-5 uppercase tracking-widest px-1 opacity-80 flex items-center gap-2">
                                <i className="fa-solid fa-shield-halved text-rose-500"></i> Keamanan Sandi
                            </h4>
                            <UpdatePasswordForm />
                        </div>
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-slate-50">
                            <h4 className="font-black text-slate-800 text-xs mb-5 uppercase tracking-widest px-1 opacity-80 flex items-center gap-2">
                                <i className="fa-solid fa-key text-emerald-500"></i> PIN Keamanan Transaksi
                            </h4>
                            <UpdatePinForm />
                        </div>
                        <Link href={route('logout')} method="post" as="button" className="w-full bg-rose-50 text-rose-600 rounded-[2rem] p-5 font-black uppercase tracking-widest text-xs border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 mb-4">
                            <i className="fa-solid fa-power-off text-base"></i> Keluar Aplikasi
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
