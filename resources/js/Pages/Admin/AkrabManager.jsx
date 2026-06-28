import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AkrabManager({ auth, localManagers, masterProducts }) {
    const [activeTab, setActiveTab] = useState('pengelola');
    const [currentView, setCurrentView] = useState('list');
    const [selectedMsisdn, setSelectedMsisdn] = useState(null);
    const [slotsData, setSlotsData] = useState([]);
    const [parentData, setParentData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Fitur Pencarian MilaStore
    const [searchQuery, setSearchQuery] = useState('');
    
    // Mass Sync State
    const [isMassSyncing, setIsMassSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    // Amankan data Object ke Array
    const managersArray = Object.values(localManagers || {});
    const productsArray = Object.values(masterProducts || {});

    // Filter Mesin Pencari Real-Time
    const filteredManagers = managersArray.filter(m => m.msisdn.includes(searchQuery));
    const filteredSlots = slotsData?.filter(s => 
        (s.member_msisdn || '').includes(searchQuery) || 
        (s.member_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ==========================================
    // 1. ENGINE SYNC & DATA LOADER
    // ==========================================
    const runMassSync = async () => {
        if (managersArray.length === 0) return;
        const confirm = await Swal.fire({ title: 'Mulai Mass Sync?', text: `Sinkronisasi ${managersArray.length} pengelola ke server XL pusat.`, icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981' });
        if (!confirm.isConfirmed) return;

        setIsMassSyncing(true); setSyncProgress(0);
        for (let i = 0; i < managersArray.length; i++) {
            try { await axios.post('/admin/akrab/ajax-sync-slot', { msisdn: managersArray[i].msisdn }); } catch (err) {}
            setSyncProgress(Math.round(((i + 1) / managersArray.length) * 100));
        }
        setTimeout(() => { setIsMassSyncing(false); Swal.fire('Sukses', 'Seluruh pengelola berhasil diperbarui.', 'success'); router.reload(); }, 1000);
    };

    const loadSlotsFromDB = async (msisdn) => {
        setLoading(true); setSelectedMsisdn(msisdn); setCurrentView('slots'); setSearchQuery('');
        try {
            const res = await axios.get(`/admin/akrab/member-info?active_msisdn=${msisdn}`);
            setSlotsData(res.data?.members || []);
            setParentData(res.data?.parent || null);
        } catch (e) { Swal.fire('Error', 'Gagal memuat data dari DB lokal.', 'error'); }
        setLoading(false);
    };

    const syncIndividualSlot = async (msisdn) => {
        Swal.fire({ title: 'Menarik Data Server XL...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const res = await axios.post('/admin/akrab/ajax-sync-slot', { msisdn: msisdn });
            if (res.data.status || res.data.success) { Swal.fire('Sukses', 'Data ditarik!', 'success'); loadSlotsFromDB(msisdn); } 
            else { Swal.fire('Gagal', res.data.message || 'Gagal sinkronisasi.', 'error'); }
        } catch (e) { Swal.fire('Error', 'Koneksi ke API XL terputus.', 'error'); }
    };

    // ==========================================
    // 2. ACTION HANDLERS (INVITE, KICK, KUBER)
    // ==========================================
    const actionHit = async (action, payload) => {
        Swal.fire({ title: 'Memproses ke XL...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const res = await axios.post('/admin/akrab/action', { action, active_msisdn: selectedMsisdn, ...payload });
            if (res.data.status || res.data.success) { 
                Swal.fire('Berhasil', 'Sukses dieksekusi!', 'success'); 
                syncIndividualSlot(selectedMsisdn); // Auto-sync pasca aksi
            } else { 
                Swal.fire('Gagal', res.data.message || 'Ditolak oleh Server XL.', 'error'); 
            }
        } catch (e) { Swal.fire('Error', 'Sistem Backend bermasalah.', 'error'); }
    };

    const confirmKick = async (slotId, fid, memberName, memberHp) => {
        const confirm = await Swal.fire({
            title: '⚠️ KICK ANGGOTA!',
            html: `Yakin ingin menendang <b>${memberName || 'Anggota'}</b> (${memberHp || '-'})?<br><br><span class="text-rose-500 font-bold">Peringatan: XL hanya memberikan 1x kesempatan invite ulang pada slot ini!</span>`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'YA, KICK SEKARANG'
        });
        if (confirm.isConfirmed) { actionHit('kick', { family_member_id: fid, slot_id: slotId }); }
    };

    const handleForceKuber = async (fid) => {
        const { value: gb } = await Swal.fire({ title: 'Tembak Kuota (GB)', input: 'number', showCancelButton: true, confirmButtonColor: '#0ea5e9' });
        if (gb) actionHit('force_kuber', { family_member_id: fid, gb: gb });
    };

    const handleMapSlot = async (slotId, prodId) => {
        try { await axios.post('/admin/akrab/slots/map', { slot_id: slotId, mapped_product_id: prodId }); loadSlotsFromDB(selectedMsisdn); } catch (e) {}
    };

    // ==========================================
    // 3. MASTER PRODUK & OTP
    // ==========================================
    const handleProductForm = async (prod = null) => {
        const { value: formValues } = await Swal.fire({
            title: prod ? '🔧 Edit Varian Produk' : '📦 Tambah Varian Produk',
            html: `
                <input id="swal_p_nama" class="swal2-input" placeholder="Nama Varian (Ex: Akrab 10GB)" value="${prod ? prod.nama_produk : ''}">
                <input id="swal_p_harga" type="number" class="swal2-input" placeholder="Harga Jual (Rp)" value="${prod ? prod.harga_jual : ''}">
                <input id="swal_p_kuber" type="number" class="swal2-input" placeholder="Jatah Kuber (GB)" value="${prod ? prod.kuber_gb : ''}">
                <input id="swal_p_desc" class="swal2-input" placeholder="Deskripsi Singkat" value="${prod?.deskripsi || ''}">
            `,
            focusConfirm: false, showCancelButton: true, confirmButtonText: 'Simpan',
            preConfirm: () => ({
                id: prod?.id || null,
                nama_produk: document.getElementById('swal_p_nama').value,
                harga_jual: document.getElementById('swal_p_harga').value,
                kuber_gb: document.getElementById('swal_p_kuber').value,
                deskripsi: document.getElementById('swal_p_desc').value
            })
        });

        if (formValues?.nama_produk && formValues?.harga_jual) {
            Swal.showLoading();
            await axios.post('/admin/akrab/products', formValues);
            router.reload();
        }
    };

    const handleDeleteProduct = async (id) => {
        const check = await Swal.fire({ title: 'Hapus Varian?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
        if (check.isConfirmed) { Swal.showLoading(); await axios.post('/admin/akrab/products/delete', { id }); router.reload(); }
    };

    const handleLoginOtp = async () => {
        const { value: msisdn } = await Swal.fire({ title: 'Request OTP Baru', input: 'number', inputPlaceholder: '0819xxxx', showCancelButton: true });
        if (msisdn) {
            Swal.fire({ title: 'Mengirim OTP...', didOpen: () => Swal.showLoading() });
            const res = await axios.post('/admin/akrab/req-otp', { msisdn });
            if (res.data.status || res.data.success) {
                const { value: otp } = await Swal.fire({ title: 'Masukkan Kode OTP', input: 'text', showCancelButton: true });
                if (otp) {
                    Swal.fire({ title: 'Verifikasi Sesi...', didOpen: () => Swal.showLoading() });
                    const loginRes = await axios.post('/admin/akrab/submit-otp', { msisdn, otp });
                    if (loginRes.data.status || loginRes.data.success) { Swal.fire('Aktif', 'Sesi Pengelola Berhasil Diinjeksi!', 'success'); router.reload(); } 
                    else { Swal.fire('Gagal', 'OTP salah atau expired.', 'error'); }
                }
            } else { Swal.fire('Gagal', res.data.message || 'Gagal mengirim OTP.', 'error'); }
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="MilaStore Akrab V14.3" />

            <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans">
                
                {/* HEADER MILASTORE SULTAN */}
                <div className="bg-white px-6 py-5 shadow-sm border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        {currentView === 'slots' ? (
                            <button onClick={() => {setCurrentView('list'); setSearchQuery('');}} className="mr-4 text-2xl text-slate-400 hover:text-indigo-600 transition-colors"><i className="fa-solid fa-circle-left"></i></button>
                        ) : (
                            <div className="mr-4 text-3xl text-indigo-600"><i className="fa-solid fa-shield-halved"></i></div>
                        )}
                        <div>
                            <h6 className="mb-0 font-black text-xl text-slate-800 tracking-tight">MILASTORE AKRAB</h6>
                            <small className="text-indigo-500 font-bold tracking-widest text-[10px] uppercase">Enterprise V14.3 Final</small>
                        </div>
                    </div>
                    {/* SEARCH BAR GLOBAL */}
                    <div className="hidden md:flex relative w-72 shadow-sm rounded-full">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={currentView === 'list' ? "Cari induk (Ex: 0819...)" : "Cari anggota (Nama / No HP)..."} className="w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium" />
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-3 text-slate-400"></i>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4">
                    {/* MASS SYNC LOADER */}
                    {isMassSyncing && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl border border-slate-100">
                                <h5 className="font-bold text-lg text-slate-900 mb-1">Mass Sync Berjalan...</h5>
                                <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden mb-2 mt-4 p-1 border">
                                    <div className="bg-[#10b981] h-full flex items-center justify-center text-white text-[11px] font-black rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }}>{syncProgress}%</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================= */}
                    {/* VIEW 1: DASHBOARD (PENGELOLA / PRODUK) */}
                    {/* ======================================= */}
                    {currentView === 'list' && (
                        <>
                            <div className="flex gap-2 mb-6">
                                <button onClick={() => setActiveTab('pengelola')} className={`px-6 py-2.5 font-bold rounded-full text-xs shadow-sm transition-all flex items-center ${activeTab === 'pengelola' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}><i className="fa-solid fa-sitemap mr-2"></i> PENGELOLA</button>
                                <button onClick={() => setActiveTab('produk')} className={`px-6 py-2.5 font-bold rounded-full text-xs shadow-sm transition-all flex items-center ${activeTab === 'produk' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}><i className="fa-solid fa-boxes-stacked mr-2"></i> PRODUK</button>
                                <button onClick={() => setActiveTab('otp')} className={`px-6 py-2.5 font-bold rounded-full text-xs shadow-sm transition-all flex items-center ${activeTab === 'otp' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}><i className="fa-solid fa-key mr-2"></i> OTP & SESI</button>
                            </div>

                            {activeTab === 'pengelola' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h6 className="font-bold text-lg text-slate-800">Daftar Induk Aktif</h6>
                                        <button onClick={runMassSync} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-full shadow-sm text-xs transition-all"><i className="fa-solid fa-rotate mr-2"></i> MASS SYNC ({managersArray.length})</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {filteredManagers.map((m, idx) => (
                                            <div key={idx} className="bg-white border-2 border-slate-100 hover:border-indigo-300 rounded-2xl p-5 shadow-sm transition-all">
                                                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                                                    <div>
                                                        <h5 className="font-bold text-xl text-slate-800 font-mono mb-1">{m.msisdn}</h5>
                                                        <span className="inline-block bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">Tgl Reset: {m.tanggal_restok || 1}</span>
                                                    </div>
                                                    <span className={`inline-block font-black px-2 py-1 rounded-md text-[10px] uppercase border ${m.status_pengelola === 'open' || !m.status_pengelola ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>{m.status_pengelola || 'OPEN'}</span>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-3.5 mb-4 text-xs font-medium space-y-2 border border-slate-100">
                                                    <div className="flex justify-between text-slate-500"><span>Total Kuota Induk:</span><strong className="text-slate-800">{m.total_quota_gb || 0} GB</strong></div>
                                                    <div className="flex justify-between text-slate-500"><span>Sisa Tersedia:</span><strong className="text-emerald-600 text-sm font-black bg-emerald-50 px-2 py-0.5 rounded">{m.sisa_quota_gb || 0} GB</strong></div>
                                                </div>
                                                <button onClick={() => loadSlotsFromDB(m.msisdn)} className="w-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-2.5 rounded-xl transition-all text-xs border border-indigo-100"><i className="fa-solid fa-arrow-right-to-bracket mr-1"></i> BUKA PETA SLOT</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'produk' && (
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h6 className="font-bold text-lg text-slate-800">Master Varian Paket</h6>
                                        <button onClick={() => handleProductForm()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm"><i className="fa-solid fa-plus mr-1"></i> BUAT VARIAN</button>
                                    </div>
                                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                                                <tr><th className="p-4">Nama Produk</th><th className="p-4">Jatah Kuber</th><th className="p-4">Harga Jual</th><th className="p-4 text-center">Aksi</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {productsArray.map(p => (
                                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4 font-bold text-slate-800">{p.nama_produk}<br/><span className="text-[10px] text-slate-400 font-normal">{p.deskripsi || '-'}</span></td>
                                                        <td className="p-4"><span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-md text-[11px] font-black">{p.kuber_gb} GB</span></td>
                                                        <td className="p-4 text-emerald-600 font-black text-base">Rp {p.harga_jual?.toLocaleString('id-ID')}</td>
                                                        <td className="p-4 text-center flex justify-center gap-2">
                                                            <button onClick={() => handleProductForm(p)} className="text-slate-600 bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-xl transition-colors"><i className="fa-solid fa-pen text-xs"></i></button>
                                                            <button onClick={() => handleDeleteProduct(p.id)} className="text-rose-600 bg-rose-50 hover:bg-rose-100 w-9 h-9 rounded-xl transition-colors"><i className="fa-solid fa-trash text-xs"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'otp' && (
                                <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-sm mt-10">
                                    <div className="bg-indigo-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 text-indigo-500 text-3xl border border-indigo-100 shadow-inner">
                                        <i className="fa-solid fa-mobile-screen-button"></i>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Injeksi Sesi XL Baru</h3>
                                    <p className="text-slate-500 text-xs mb-8 max-w-xs mx-auto leading-relaxed">Login via OTP untuk menambahkan nomor pengelola induk baru ke dalam sistem MILASTORE.</p>
                                    <button onClick={handleLoginOtp} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl shadow-md text-xs tracking-wider transition-all"><i className="fa-solid fa-key mr-2"></i> REQUEST OTP SEKARANG</button>
                                </div>
                            )}
                        </>
                    )}

                    {/* ======================================= */}
                    {/* VIEW 2: SLOTS MAP (JARINGAN ANGGOTA) */}
                    {/* ======================================= */}
                    {currentView === 'slots' && selectedMsisdn && (
                        <div>
                            {parentData && (
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-white relative overflow-hidden">
                                    <div className="absolute -right-10 -top-10 text-white/5 text-9xl"><i className="fa-solid fa-server"></i></div>
                                    <div className="z-10">
                                        <span className="text-[10px] font-black bg-black/20 px-3 py-1 rounded-md border border-white/10 tracking-widest uppercase mb-2 inline-block">MONITOR INDUK MILASTORE</span>
                                        <h2 className="text-4xl font-black font-mono drop-shadow-md">{parentData.msisdn}</h2>
                                    </div>
                                    <div className="z-10 flex gap-8 text-sm font-bold bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 w-full md:w-auto">
                                        <div><span className="text-indigo-200 block text-[10px] uppercase mb-1">Total Alokasi</span><strong className="text-3xl">{parentData.total_quota_gb || 0}</strong><small className="font-normal ml-1">GB</small></div>
                                        <div className="w-px bg-white/20"></div>
                                        <div><span className="text-emerald-200 block text-[10px] uppercase mb-1">Sisa Tersedia</span><strong className="text-3xl text-emerald-300 drop-shadow-md">{parentData.sisa_quota_gb || 0}</strong><small className="font-normal ml-1 text-emerald-200">GB</small></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <h6 className="font-black text-slate-800 text-lg ml-2"><i className="fa-solid fa-network-wired text-indigo-500 mr-2"></i> Peta Jalur Anggota</h6>
                                <button onClick={() => syncIndividualSlot(selectedMsisdn)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-md transition-all"><i className="fa-solid fa-cloud-arrow-down mr-2"></i> TARIK DATA XL</button>
                            </div>

                            {loading ? ( <div className="text-center py-20 text-slate-400 font-bold"><i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3 block text-indigo-500"></i> Memuat Peta...</div> ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSlots?.map((m, idx) => {
                                        const isFilled = m.status_slot === 'filled';
                                        const fid = m.family_id_filled || m.family_id_empty;
                                        
                                        return (
                                            <div key={idx} className={`bg-white border-2 rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${m.mapped_product_id ? 'border-slate-200 hover:border-indigo-400' : 'border-rose-300 bg-rose-50/50'}`}>
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex gap-2">
                                                            <span className="text-[10px] bg-slate-800 text-white font-black px-2.5 py-1 rounded-md shadow-sm">SLOT {m.slot_id}</span>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isFilled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>{isFilled ? 'TERISI' : 'KOSONG'}</span>
                                                    </div>

                                                    <h5 className="font-black text-slate-800 text-xl truncate">{m.member_name || (isFilled ? 'Tanpa Nama' : 'Menunggu Buyer')}</h5>
                                                    <small className="text-slate-500 font-mono font-bold block text-sm mt-1 mb-4">{m.member_msisdn || '-'}</small>
                                                    
                                                    {isFilled && (
                                                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2 mb-4">
                                                            <div className="flex justify-between items-center text-slate-500"><span>Alokasi Kuber:</span><strong className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-sm">{m.quota_limit || 0} GB</strong></div>
                                                            <div className="flex justify-between items-center text-slate-500"><span>Terpakai:</span><strong className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-sm">{m.quota_used || 0} GB</strong></div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="border-t border-dashed border-slate-200 pt-4">
                                                    <label className="text-[10px] text-slate-400 font-black block mb-2"><i className="fa-solid fa-link mr-1"></i>SUNTIK KE VARIAN PRODUK</label>
                                                    <select value={m.mapped_product_id || ''} onChange={(e) => handleMapSlot(m.slot_id, e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs p-3 font-bold mb-4 focus:ring-2 focus:ring-indigo-500">
                                                        <option value="">-- JANGAN DIJUAL --</option>
                                                        {productsArray.map(p => <option key={p.id} value={p.id}>{p.nama_produk} ({p.kuber_gb}GB)</option>)}
                                                    </select>

                                                    {isFilled ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleForceKuber(fid)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-md text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"><i className="fa-solid fa-bolt-lightning"></i> KUBER</button>
                                                            <button onClick={() => confirmKick(m.slot_id, fid, m.member_name, m.member_msisdn)} className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"><i className="fa-solid fa-user-xmark"></i></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={async () => {
                                                            const { value: target } = await Swal.fire({ title: 'Invite Manual', input: 'number', inputPlaceholder: '0819xxxx', showCancelButton: true, confirmButtonColor: '#4f46e5' });
                                                            if (target) actionHit('invite', { slot_id: m.slot_id, family_member_id: fid, target_msisdn: target });
                                                        }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"><i className="fa-solid fa-user-plus"></i> INVITE PEMBELI</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
