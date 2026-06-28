import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

const safeRoute = (name, params = {}) => {
    try { return route(name, params); } catch (e) {
        let url = '/admin/xlku';
        if (params.session) url += `?session=${params.session}`;
        return url;
    }
};

const formatByteKeHuman = (bytes) => {
    if (!bytes || bytes <= 0 || isNaN(bytes)) return "0 KB";
    const s = ['B', 'KB', 'MB', 'GB', 'TB'];
    const e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + s[e];
};
const formatByteKeGB = (bytes) => (!bytes || bytes <= 0 || isNaN(bytes)) ? 0 : (bytes / (1024 ** 3)).toFixed(1);
const formatResetDate = (ts) => {
    if (!ts || ts === 0 || isNaN(ts)) return '-';
    return new Date(ts * 1000).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function XlkuEngine(props) {
    const { auth, sessions, activeSession, memberInfo, profile, balance, pythonError, resellers, mappings, isAdmin } = props;

    // 🔥 SABUK PENGAMAN MUTLAK (MENCEGAH BLANK PUTIH) 🔥
    const safeSessions = Array.isArray(sessions) ? sessions : (sessions ? Object.values(sessions) : []);
    const safeResellers = Array.isArray(resellers) ? resellers : [];
    const safeMappings = mappings || {};
    const safePythonError = typeof pythonError === 'object' ? JSON.stringify(pythonError) : String(pythonError || '');

    const [isProcessing, setIsProcessing] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpForm, setOtpForm] = useState({ msisdn: '', otp: '' });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUserToPromote, setSelectedUserToPromote] = useState(null);
    const searchRef = useRef(null);

    const [localResellers, setLocalResellers] = useState(safeResellers);
    useEffect(() => { setLocalResellers(safeResellers); }, [safeResellers]);

    useEffect(() => {
        let interval;
        if (activeSession && !pythonError && !isProcessing) {
            interval = setInterval(() => { if (!Swal.isVisible()) router.reload({ only: ['memberInfo', 'profile', 'balance', 'pythonError'], preserveState: true, preserveScroll: true }); }, 8000);
        }
        return () => clearInterval(interval);
    }, [activeSession, pythonError, isProcessing]);

    // 🔥 PARSING DATA XL DENGAN PENGAMAN 🔥
    const rawData = memberInfo?.data?.data || memberInfo?.data || memberInfo || null;
    const mInfo = rawData?.member_info || rawData || null;
    
    const rawMembers = mInfo?.members_slot_data || mInfo?.members || rawData?.members || [];
    const safeMembersArray = Array.isArray(rawMembers) ? rawMembers : [];
    const regulerSlots = safeMembersArray.filter(m => (m?.role || m?.member_type || '').toUpperCase() !== 'PARENT');

    const rawTambahan = mInfo?.additional_members || rawData?.additional_members || [];
    const tambahanSlots = Array.isArray(rawTambahan) ? rawTambahan : [];

    const selectSession = (msisdn) => { if(!isProcessing) router.get(safeRoute('admin.xlku.index', { session: msisdn }), {}, { preserveState: true, preserveScroll: true }); };

    const executeAction = async (endpoint, payload, titleSuccess) => {
        if (isProcessing) return; setIsProcessing(true);
        try {
            const res = await axios.post(`/admin/xlku/${endpoint}`, payload);
            if (res.data.success) { Swal.fire({ icon: 'success', title: titleSuccess, html: `<div class="text-xs font-mono text-left bg-emerald-50 text-emerald-700 p-3 rounded-xl border mt-2 whitespace-pre-wrap">${JSON.stringify(res.data.data || res.data.message, null, 2)}</div>`, confirmButtonColor: '#2563eb' }); } 
            else { Swal.fire({ icon: 'error', title: 'GAGAL', html: `<div class="text-xs font-mono text-left bg-red-50 text-red-700 p-3 rounded-xl border mt-2 whitespace-pre-wrap">${JSON.stringify(res.data.error, null, 2)}</div>`, confirmButtonColor: '#ef4444' }); }
            router.reload({ only: ['memberInfo', 'profile', 'balance', 'sessions', 'mappings'] });
        } catch (error) { Swal.fire("Server Error", "Koneksi ke server terputus.", "error"); } finally { setIsProcessing(false); }
    };

    // =================================================================
    // MANAJEMEN API & TENANT (PENCARIAN USER REALTIME)
    // =================================================================
    const handleSearchUser = async (e) => {
        const q = e.target.value; setSearchQuery(q); setSelectedUserToPromote(null);
        if (q.length > 2) { 
            try { 
                const res = await axios.get(`/admin/xlku/search-users?q=${q}`); 
                setSearchResults(Array.isArray(res.data) ? res.data : []); 
            } catch(e) { setSearchResults([]); } 
        } else { setSearchResults([]); }
    };

    const handlePromoteUser = (e) => {
        e.preventDefault();
        if(!selectedUserToPromote) return Swal.fire('Peringatan', 'Pilih user dari daftar pencarian terlebih dahulu!', 'warning');
        Swal.fire({ title: 'Beri Akses API?', text: `User ${selectedUserToPromote.name} akan dinaikkan menjadi Tenant.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Ya, Generate' }).then(async (r) => {
            if(r.isConfirmed) {
                if(isProcessing) return; setIsProcessing(true);
                try {
                    const res = await axios.post('/admin/xlku/promote-user', { user_id: selectedUserToPromote.id });
                    if (res.data.success) {
                        const newUser = res.data.data;
                        if (!localResellers.find(r => r.id === newUser.id)) setLocalResellers([newUser, ...localResellers]);
                        Swal.fire({ title: 'Akses API Diberikan!', html: `User <b>${newUser.name}</b> sekarang adalah Tenant H2H. <br><br> <span class="font-mono text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 select-all">API Key: ${newUser.api_key}</span>`, icon: 'success' });
                        setSearchQuery(''); setSelectedUserToPromote(null); setSearchResults([]);
                    } else { Swal.fire('Gagal', res.data.error, 'error'); }
                } catch (err) { Swal.fire('Error', 'Gagal memproses.', 'error'); } finally { setIsProcessing(false); }
            }
        });
    };

    const handleRevokeReseller = (id, name) => {
        Swal.fire({ title: `Cabut Akses ${name}?`, text: 'Akses API dicabut, akun user aman di database.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Cabut' }).then(async (res) => {
            if (res.isConfirmed) {
                if(isProcessing) return; setIsProcessing(true);
                try {
                    const r = await axios.delete(`/admin/xlku/reseller/${id}`);
                    if(r.data.success) { setLocalResellers(localResellers.filter(user => user.id !== id)); Swal.fire('Dicabut', r.data.message, 'success'); } 
                    else { Swal.fire('Gagal', r.data.error, 'error'); }
                } catch (e) { Swal.fire('Error', 'Kesalahan sistem', 'error'); } finally { setIsProcessing(false); }
            }
        });
    };

    const handleUpdateApi = async (userId, regenerateKey, currentIp) => {
        if(isProcessing) return; setIsProcessing(true);
        try {
            const r = await axios.post('/admin/xlku/save-api', { user_id: userId, ip_whitelist: currentIp, regenerate_key: regenerateKey });
            if(r.data.success) {
                if(regenerateKey) { setLocalResellers(localResellers.map(u => u.id === userId ? { ...u, api_key: r.data.api_key } : u)); Swal.fire('Berhasil', 'API Key di-rotate!', 'success'); }
            } else { Swal.fire('Gagal', r.data.error, 'error'); }
        } catch(e) { Swal.fire('Error', 'Gagal simpan.', 'error'); } finally { setIsProcessing(false); }
    };

    const handleAssignOwner = async (e) => {
        const resellerId = e.target.value;
        if(isProcessing) return; setIsProcessing(true);
        try {
            const r = await axios.post('/admin/xlku/assign-owner', { msisdn: activeSession, reseller_id: resellerId });
            if(r.data.success) { Swal.fire('Berhasil', r.data.message, 'success'); router.reload({ only: ['mappings'] }); }
        } catch(e) {} finally { setIsProcessing(false); }
    };

    // =================================================================
    // MANAJEMEN AKRAB (FULL FITUR)
    // =================================================================
    const handleDeleteSession = () => { Swal.fire({ title: 'Hapus Sesi XL?', text: 'Harus login OTP lagi nanti!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus' }).then(r => { if(r.isConfirmed) executeAction('delete-session', { msisdn: activeSession }, 'SESI DIHAPUS'); }); };
    const handleSync = () => executeAction('sync-session', { active_msisdn: activeSession }, 'SINKRONISASI BERHASIL');
    const handleReqOtp = async () => executeAction('req-otp', { msisdn: otpForm.msisdn }, 'OTP TERKIRIM');
    const submitOtp = async (e) => { e.preventDefault(); await executeAction('submit-otp', { msisdn: otpForm.msisdn, otp: otpForm.otp }, 'LOGIN BERHASIL'); setShowOtpModal(false); setOtpForm({msisdn:'', otp:''}); };
    const handleInvite = (slotId, fmid) => { Swal.fire({ title: 'Invite Member', input: 'text', inputPlaceholder: 'Cth: 62819...', showCancelButton: true, confirmButtonColor: '#2563eb', preConfirm: (t) => { if (!t) return Swal.showValidationMessage('Nomor kosong!'); return executeAction('invite', { active_msisdn: activeSession, msisdn: t, slot_id: slotId, family_member_id: fmid }, 'INVITE BERHASIL'); }}); };
    
    const handleKick = (msisdn, fmid) => { 
        Swal.fire({ title: 'Yakin Tendang Member?', text: `Nomor ${msisdn} akan dikeluarkan dari paket.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Lanjut' }).then((res1) => {
            if (res1.isConfirmed) {
                Swal.fire({ 
                    title: 'Verifikasi Akhir!', html: 'Ketik <b>TENDANG</b> di bawah ini untuk eksekusi:', input: 'text', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'EKSEKUSI KICK',
                    preConfirm: (v) => { 
                        if(v !== 'TENDANG') return Swal.showValidationMessage('Anda harus mengetik TENDANG!'); 
                        return executeAction('remove', { active_msisdn: activeSession, family_member_id: fmid }, 'KICK BERHASIL'); 
                    }
                }); 
            }
        });
    };

    const handleLimit = (msisdn, fmid, currentAlloc) => {
        const currentGB = formatByteKeGB(currentAlloc);
        Swal.fire({
            title: 'Atur Limit Kuota (GB)',
            text: `Limit untuk ${msisdn}. Kosongkan/isi 0 untuk Unlimited.`,
            input: 'number', inputValue: currentGB > 0 ? currentGB : '', inputAttributes: { min: 0, step: 0.1, placeholder: 'Cth: 2.5' }, showCancelButton: true, confirmButtonColor: '#2563eb', confirmButtonText: 'Simpan Limit'
        }).then((res) => {
            if (res.isConfirmed) {
                const limitGb = res.value || 0;
                executeAction('set-quota', { active_msisdn: activeSession, limit_gb: limitGb, family_member_id: fmid }, 'LIMIT BERHASIL DIUBAH');
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Super Dashboard H2H" />
            <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-screen text-slate-800 pb-32">
                
                {/* HEADER UTAMA */}
                <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 mb-1"><i className="fa-solid fa-bolt mr-2 text-blue-600"></i> MilaStore Central</h2>
                        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">{isAdmin ? '🛡️ Administrator Mode v7.0' : '💼 Reseller Portal v7.0'}</p>
                    </div>
                    {isAdmin && <button onClick={() => setShowOtpModal(true)} className="bg-slate-800 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all whitespace-nowrap"><i className="fa-solid fa-plus mr-2"></i>Login Sesi XL Baru</button>}
                </div>

                {/* BLOK 1: PENCARIAN USER & MANAJEMEN API */}
                {isAdmin && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-black uppercase tracking-widest"><i className="fa-solid fa-user-shield mr-2"></i>Berikan Akses Tenant H2H</h3>
                                <p className="text-xs text-blue-200 mt-1">Cari username/email user, lalu berikan akses API tanpa merusak data asli.</p>
                            </div>
                            
                            <form onSubmit={handlePromoteUser} className="relative w-full md:w-[450px]" ref={searchRef}>
                                <div className="flex bg-white/10 border border-white/20 rounded-xl focus-within:bg-white/20 transition-colors">
                                    <div className="pl-4 py-3 text-blue-200 flex items-center"><i className="fa-solid fa-search"></i></div>
                                    <input disabled={isProcessing} className="w-full bg-transparent border-none px-3 py-3 text-sm text-white placeholder-blue-200 outline-none font-bold" placeholder="Cari Username / Email..." value={searchQuery} onChange={handleSearchUser} />
                                    {selectedUserToPromote && <button type="button" onClick={() => { setSelectedUserToPromote(null); setSearchQuery(''); }} className="pr-4 py-3 text-blue-200 hover:text-white"><i className="fa-solid fa-xmark"></i></button>}
                                </div>
                                
                                {searchResults.length > 0 && !selectedUserToPromote && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-60 overflow-y-auto z-50 text-slate-800">
                                        {searchResults.map(u => (
                                            <div key={u.id} onClick={() => { setSelectedUserToPromote(u); setSearchQuery(`${u.name} (${u.email})`); setSearchResults([]); }} className="p-3 border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors">
                                                <div className="font-black text-sm">{u.name}</div><div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <button type="submit" disabled={isProcessing || !selectedUserToPromote} className="w-full mt-3 bg-white text-blue-700 font-black rounded-xl px-6 py-3 hover:scale-[1.02] transition-transform shadow-md disabled:opacity-50 disabled:hover:scale-100"><i className="fa-solid fa-key mr-2"></i>Generate Akses API</button>
                            </form>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4"><i className="fa-solid fa-list mr-2"></i>Daftar Tenant & Konfigurasi API</h3>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-widest">
                                        <tr><th className="py-4 px-5 font-black">Identitas User</th><th className="py-4 px-5 font-black">Kunci API (X-AKRAB-KEY)</th><th className="py-4 px-5 font-black">Whitelist IP</th><th className="py-4 px-5 font-black text-right">Aksi</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {localResellers.length === 0 ? (
                                            <tr><td colSpan="4" className="py-8 text-center text-slate-400 text-xs italic">Belum ada user tenant.</td></tr>
                                        ) : localResellers.map(r => (
                                            <tr key={r.id} className="hover:bg-slate-50">
                                                <td className="py-4 px-5"><div className="font-black text-slate-800">{r.name}</div><div className="text-[10px] font-mono text-slate-400 mt-0.5">{r.email}</div></td>
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">{r.api_key}</span>
                                                        <button onClick={() => handleUpdateApi(r.id, true, r.ip_whitelist)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Generate Ulang Key"><i className="fa-solid fa-rotate"></i></button>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5"><input defaultValue={r.ip_whitelist} onBlur={(e) => handleUpdateApi(r.id, false, e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500" placeholder="*" /></td>
                                                <td className="py-4 px-5 text-right"><button onClick={() => handleRevokeReseller(r.id, r.name)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 transition-colors"><i className="fa-solid fa-ban mr-1"></i> Cabut Akses</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* BLOK 2: WAR ENGINE & MANAJEMEN AKRAB */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                    {/* PANEL KIRI: DAFTAR SESI */}
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5"><i className="fa-solid fa-sim-card text-blue-500 mr-2"></i> Sesi Pengelola ({safeSessions.length})</h3>
                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {safeSessions.length === 0 && <div className="text-center p-4 bg-slate-50 rounded-xl text-slate-400 text-xs font-medium border border-dashed">Kosong. Login sesi baru.</div>}
                                {safeSessions.map((sess) => {
                                    const owner = safeMappings[sess]?.owner_name || 'BELUM DISEWA';
                                    const isActive = activeSession === sess;
                                    return (
                                        <div key={sess} onClick={() => selectSession(sess)} className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${isActive ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm ring-1 ring-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                            <div className="font-mono text-sm font-black flex justify-between items-center">
                                                <span>{sess}</span>{isActive && <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span></span>}
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[10px]"><span className="text-slate-400 font-bold uppercase">Hak Sewa:</span><span className={`px-2 py-0.5 rounded-full font-black ${owner.includes('BELUM') ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>{owner}</span></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* PANEL KANAN: DETAIL SESI & SLOT MEMBER */}
                    <div className="xl:col-span-3 space-y-6">
                        {!activeSession ? (
                            <div className="bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400"><i className="fa-solid fa-hand-pointer text-6xl text-slate-300 mb-6 animate-bounce"></i><h3 className="font-black text-xl mb-2">Pilih Sesi Pengelola</h3><p className="text-sm">Silakan pilih salah satu sesi di panel sebelah kiri.</p></div>
                        ) : pythonError ? (
                            <div className="bg-red-50 rounded-3xl border border-red-200 p-8"><div className="flex items-center text-red-600 mb-4"><i className="fa-solid fa-triangle-exclamation text-4xl mr-4"></i><h3 className="font-black text-xl">Sesi Terputus / Kadaluarsa</h3></div><div className="bg-white p-4 rounded-xl text-xs font-mono text-red-700 border mb-4">{safePythonError}</div>{isAdmin && <button onClick={handleDeleteSession} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold"><i className="fa-solid fa-trash mr-2"></i>Hapus Sesi Ini</button>}</div>
                        ) : !mInfo ? (
                            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-blue-500"><i className="fa-solid fa-circle-notch fa-spin text-5xl mb-5"></i><p className="font-bold text-xs uppercase tracking-widest">Membaca Data Server XL...</p></div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-sm">
                                
                                <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-8 gap-4">
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800">{profile?.data?.name || profile?.name || "Memuat Nama..."}</h4>
                                        <p className="text-xs font-bold text-slate-500 mt-1">Saldo: <span className="text-emerald-600">Rp {Number(balance?.data?.balance_amount || balance?.balance || 0).toLocaleString('id-ID')}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleSync} disabled={isProcessing} className="bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 shadow-sm"><i className="fa-solid fa-rotate mr-1"></i> Sync Data</button>
                                        {isAdmin && <button onClick={handleDeleteSession} disabled={isProcessing} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-200"><i className="fa-solid fa-trash mr-1"></i> Hapus Sesi</button>}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div className="mb-8 p-5 rounded-2xl bg-blue-50 border border-blue-100">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2"><i className="fa-solid fa-link mr-1"></i> Hak Sewa Tenant (Untuk Sesi: {activeSession})</label>
                                        <select className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={safeMappings[activeSession]?.reseller_id || ''} onChange={handleAssignOwner}>
                                            <option value="">-- Bebas Akses (Belum Disewa Siapapun) --</option>
                                            {localResellers.map(r => <option key={r.id} value={r.id}>{r.name} ({r.email})</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    {[{ l: 'Paket Utama', v: String(mInfo.plan_type || 'AKRAB'), c: 'text-slate-800' }, { l: 'Sisa Kuota', v: formatByteKeHuman(mInfo.remaining_quota), c: 'text-emerald-600' }, { l: 'Total Kuota', v: formatByteKeHuman(mInfo.total_quota), c: 'text-blue-600' }, { l: 'Reset Date', v: formatResetDate(mInfo.end_date), c: 'text-orange-500 text-sm' }].map((i, x) => (<div key={x} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center"><div className="text-[10px] font-black text-slate-400 uppercase mb-2">{i.l}</div><div className={`text-xl font-black ${i.c}`}>{i.v}</div></div>))}
                                </div>

                                {/* TABEL SLOT MEMBER DENGAN FITUR LIMIT & KICK */}
                                {[{ t: "Slot Reguler (Parent Disembunyikan)", d: regulerSlots, c: 'border-slate-200 bg-slate-50 text-slate-700' }, { t: "Slot Tambahan", d: tambahanSlots, c: 'border-orange-200 bg-orange-50/50 text-orange-700' }].map((tb, x) => (tb.d && tb.d.length > 0) && (
                                    <div key={x} className={`mb-8 rounded-3xl border overflow-hidden ${tb.c.split(' ')[0]}`}>
                                        <div className={`px-6 py-4 border-b ${tb.c.split(' ')[1]}`}><h4 className={`text-xs font-black uppercase ${tb.c.split(' ')[2]}`}><i className="fa-solid fa-users mr-2"></i>{tb.t}</h4></div>
                                        <div className="overflow-x-auto"><table className="w-full text-left text-sm whitespace-nowrap"><thead className="bg-white border-b text-slate-400 text-[10px] uppercase"><tr><th className="py-4 px-6">ID SLOT</th><th className="py-4 px-6">MEMBER / NOMOR</th><th className="py-4 px-6 text-center">LIMIT KUOTA</th><th className="py-4 px-6 text-right">MANAJEMEN AKRAB</th></tr></thead><tbody className="divide-y text-slate-700 bg-white">
                                            {tb.d.map((mb, i) => {
                                                const rms = mb.msisdn || mb.member_msisdn || mb.receiver_msisdn || mb.subscriber_number || '';
                                                const k = ((mb.status || '').toUpperCase() === 'EMPTY' || (mb.status || '').toUpperCase() === 'AVAILABLE' || !rms);
                                                const tm = k ? null : rms; const fmid = mb.family_member_id || mb.family_member_id_empty || '';
                                                const alloc = mb.usage?.quota_allocated || mb.quota?.quota_allocated || mb.my_quota?.quota_allocated || 0;
                                                return (
                                                    <tr key={i} className="hover:bg-slate-50">
                                                        <td className="py-4 px-6 font-mono text-slate-400 text-xs font-bold">{mb.slot_id ?? '-'}</td>
                                                        {k ? (
                                                            <><td className="py-4 px-6"><span className="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full font-black">KOSONG</span></td><td className="py-4 px-6 text-center text-slate-300">—</td><td className="py-4 px-6 text-right"><button onClick={() => handleInvite(mb.slot_id ?? '-', fmid)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100 shadow-sm"><i className="fa-solid fa-plus mr-1"></i> Invite Member</button></td></>
                                                        ) : (
                                                            <>
                                                                <td className="py-4 px-6 font-black">{tm} {mb.alias && <span className="text-[10px] text-orange-500 block">{mb.alias}</span>}</td>
                                                                <td className="py-4 px-6 text-center font-black text-blue-600 bg-slate-50">{alloc > 0 ? formatByteKeHuman(alloc) : 'Unlimited'}</td>
                                                                <td className="py-4 px-6 text-right space-x-2">
                                                                    <button onClick={() => handleLimit(tm, fmid, alloc)} className="bg-white hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-all shadow-sm" title="Atur Limit Kuota"><i className="fa-solid fa-sliders mr-1"></i> Limit</button>
                                                                    <button onClick={() => handleKick(tm, fmid)} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold border border-red-100 transition-all shadow-sm" title="Keluarkan Member"><i className="fa-solid fa-user-xmark mr-1"></i> Kick</button>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody></table></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL OTP LOGIN */}
                {showOtpModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"><div className="bg-white rounded-3xl p-8 w-full max-w-sm"><h3 className="text-xl font-black mb-6"><i className="fa-solid fa-right-to-bracket text-blue-500 mr-3"></i>Login Sesi XL</h3><form onSubmit={submitOtp} className="space-y-4"><div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Nomor HP</label><div className="flex gap-2"><input disabled={isProcessing} value={otpForm.msisdn} onChange={e => setOtpForm({...otpForm, msisdn: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold" placeholder="62819..." required /><button type="button" onClick={handleReqOtp} disabled={isProcessing} className="bg-blue-50 text-blue-700 px-5 rounded-xl"><i className="fa-solid fa-paper-plane"></i></button></div></div><div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Kode OTP</label><input disabled={isProcessing} value={otpForm.otp} onChange={e => setOtpForm({...otpForm, otp: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-center tracking-[0.5em] font-black text-lg" required /></div><div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowOtpModal(false)} className="w-full bg-slate-100 text-slate-600 rounded-xl py-3 text-sm font-bold">Batal</button><button type="submit" disabled={isProcessing} className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-bold">Eksekusi</button></div></form></div></div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
