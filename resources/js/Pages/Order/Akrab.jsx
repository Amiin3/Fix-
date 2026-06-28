import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../../css/mila-loading.css';

export default function Akrab({ auth, products = [], userBalance = 0 }) {
    const { flash } = usePage().props;
    const [isMulti, setIsMulti] = useState(false);
    const [liveStock, setLiveStock] = useState({});
    const [activeTab, setActiveTab] = useState('XLA');
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // 🚀 FAKE DISCOUNT 5%
    const fakeMarkup = 0.05;

    // 🛡️ LOGIKA ASLI MILASTORE
    const { data, setData, post, processing, reset } = useForm({
        no_hp: '', kode_layanan: '', is_multi: false
    });

    // 🚀 BENTENG ALERT KUCING GEMOY (100% ORI)
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'SUKSES BOSKU! 🚀',
                text: flash.success,
                imageUrl: 'https://media.tenor.com/gK2A3F6U2o0AAAAj/peach-cat-money.gif',
                imageWidth: 140,
                imageHeight: 140,
                imageAlt: 'Kucing Cuan',
                confirmButtonText: 'Lanjutkan Gaspol!',
                confirmButtonColor: '#4f46e5',
                background: '#ffffff',
                backdrop: `rgba(79, 70, 229, 0.4)`,
                customClass: {
                    popup: 'rounded-[32px] border-2 border-indigo-100 shadow-[0_20px_50px_rgba(79,70,229,0.3)]',
                    title: 'text-2xl font-black text-indigo-900',
                    confirmButton: 'rounded-xl font-bold px-8 py-3 text-sm tracking-widest'
                }
            });
        }
        if (flash?.error) {
            Swal.fire({
                title: 'Waduh, Maaf Bosku! 😿',
                text: flash.error,
                imageUrl: 'https://media.tenor.com/7bVNQk2X06UAAAAj/peach-cat-crying.gif',
                imageWidth: 140,
                imageHeight: 140,
                imageAlt: 'Kucing Sedih',
                confirmButtonText: 'Oke, Nggak Apa-apa',
                confirmButtonColor: '#f43f5e',
                background: '#ffffff',
                backdrop: `rgba(225, 29, 72, 0.4)`,
                customClass: {
                    popup: 'rounded-[32px] border-2 border-rose-100 shadow-[0_20px_50px_rgba(225,29,72,0.3)]',
                    title: 'text-2xl font-black text-rose-900',
                    confirmButton: 'rounded-xl font-bold px-8 py-3 text-sm tracking-widest'
                }
            });
        }
    }, [flash]);

    const fetchStock = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsSyncing(true);
        try {
            const res = await axios.get('/order/akrab/check-stock?t=' + new Date().getTime());
            if (res.data?.ok) {
                const stockMap = {};
                res.data.data.forEach(item => { stockMap[item.type] = item.sisa_slot; });
                setLiveStock(stockMap);
            }
        } catch (e) { console.log("Menunggu data stok pusat..."); }
        if (!isSilent) setTimeout(() => setIsSyncing(false), 500);
    }, []);

    useEffect(() => {
        fetchStock();
        const interval = setInterval(() => fetchStock(true), 3000);
        const handleFocus = () => fetchStock(true);
        window.addEventListener('focus', handleFocus);
        return () => { clearInterval(interval); window.removeEventListener('focus', handleFocus); };
    }, [fetchStock]);

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    const filteredProducts = useMemo(() => {
        let filtered = products.filter(p => {
            if (activeTab === 'XLA') return p.kode_layanan.startsWith('XLA') && !p.kode_layanan.startsWith('XLAP');
            if (activeTab === 'PROMO') return p.kode_layanan.startsWith('XLAP') || p.kode_layanan.startsWith('XDAP');
            if (activeTab === 'XDA') return p.kode_layanan.startsWith('XDA') && !p.kode_layanan.startsWith('XDAP');
            if (activeTab === 'FMX') return p.kode_layanan.startsWith('FMX');
            if (activeTab === 'CFMX') return p.kode_layanan.startsWith('CFMX');
            if (activeTab === 'PLN') return p.kode_layanan.startsWith('CEKPLN');
            return p.kode_layanan.startsWith('BPA') || p.kode_layanan.startsWith('XLB');
        });
        if (searchQuery) filtered = filtered.filter(p => p.nama_layanan.toLowerCase().includes(searchQuery.toLowerCase()));
        return filtered;
    }, [products, activeTab, searchQuery]);

    const selectedProduct = useMemo(() => products.find(p => p.kode_layanan === data.kode_layanan), [products, data.kode_layanan]);
    
    const isSelectedKosong = useMemo(() => {
        if (!selectedProduct) return true;
        if (selectedProduct.status !== 'active') return true;
        const sisa = liveStock[selectedProduct.kode_layanan];
        if (sisa !== undefined && sisa <= 0) return true;
        return false;
    }, [selectedProduct, liveStock]);

    const targetCount = useMemo(() => {
        if (!data.no_hp) return 0;
        if (!data.is_multi) return 1;
        return data.no_hp.split(/[\r\n, ]+/).filter(n => n.trim().length > 0).length || 1;
    }, [data.no_hp, data.is_multi]);

    const totalHarga = selectedProduct ? selectedProduct.harga_jual * targetCount : 0;
    const hargaCoretSatu = selectedProduct ? Math.round(selectedProduct.harga_jual * (1 + fakeMarkup)) : 0;
    const totalHargaCoret = hargaCoretSatu * targetCount;

    const handleContactPicker = async () => {
        if (window.AndroidBridge && typeof window.AndroidBridge.bukaKontak === 'function') {
            window._contactResolve = (contactData) => {
                if (contactData && contactData.length > 0) {
                    let number = contactData[0].tel[0].replace(/\D/g, '');
                    if (number.startsWith('62')) number = '0' + number.substring(2);
                    setData('no_hp', number);
                }
            };
            window.AndroidBridge.bukaKontak();
        } else if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const contacts = await navigator.contacts.select(['tel'], { multiple: false });
                if (contacts.length > 0 && contacts[0].tel.length > 0) {
                    let number = contacts[0].tel[0].replace(/\D/g, '');
                    if (number.startsWith('62')) number = '0' + number.substring(2);
                    setData('no_hp', number);
                }
            } catch (ex) {}
        } else {
            Swal.fire({ icon: 'info', title: 'Tidak Didukung', text: 'Gunakan Aplikasi Android MilaStore untuk fitur ini.', confirmButtonColor: '#4f46e5' });
        }
    };

    const handleSubmit = () => {
        if (!data.no_hp || !data.kode_layanan) return Swal.fire('Eitss!', 'Lengkapi data dulu Bosku!', 'warning');
        if (isSelectedKosong) return Swal.fire('Maaf Bosku!', 'Stok sedang kosong dari pusat.', 'error');
        if (Number(userBalance) < Number(totalHarga)) {
            return Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: `Tagihan Rp ${formatRp(totalHarga)}, saldo Anda tidak cukup!`, confirmButtonColor: '#4f46e5' });
        }

        // 🚀 POPUP KONFIRMASI MODERN (Aman, hanya visual penahan)
        Swal.fire({
            title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2 uppercase">Konfirmasi ${activeTab}</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-users text-indigo-500"></i> Target</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${isMulti ? `${targetCount} Nomor Massal` : data.no_hp}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-box-open text-indigo-500"></i> Layanan</span>
                        <span class="text-[13px] font-black text-indigo-600 text-right w-1/2 leading-tight">${selectedProduct.nama_layanan}</span>
                    </div>
                    <div class="bg-gradient-to-br from-indigo-50 to-violet-50 p-5 rounded-[24px] border border-indigo-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-indigo-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-indigo-700 uppercase tracking-widest relative z-10">Total Bayar</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-indigo-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(totalHargaCoret)}</span>
                            <span class="text-2xl font-black text-indigo-700 tracking-tight">Rp ${formatRp(totalHarga)}</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'BATALKAN', confirmButtonText: '<i class="fa-solid fa-rocket mr-2"></i> TEMBAK SEKARANG',
            buttonsStyling: false, reverseButtons: true,
            customClass: {
                confirmButton: 'w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-[0_8px_20px_rgba(79,70,229,0.3)] text-xs tracking-widest uppercase transform active:scale-95',
                cancelButton: 'w-full bg-transparent hover:bg-slate-50 text-slate-500 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-200 tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm border border-slate-100 shadow-2xl'
            }
        }).then((res) => {
            if (res.isConfirmed) {
                // 🛡️ LOGIKA ASLI 100% (Pakai loader bawaan, reset state, dan fetchStock)
                post('/order/akrab', {
                    preserveScroll: true,
                    onSuccess: () => { 
                        reset('no_hp', 'kode_layanan'); 
                        fetchStock(); 
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Suntik Akrab XLA/XDA" />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark-scrollbar::-webkit-scrollbar { width: 5px; }
                .dark-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
            `}</style>
            
            {/* 🛡️ LOADER CSS ORIGINAL MILASTORE (DIKEMBALIKAN) */}
            {processing && (
                <div className="mila-loader-overlay z-[9999] bg-white/90 backdrop-blur-md">
                    <div className="loading-content">
                        <div className="spinner-wrapper">
                            <div className="ms-ring-bg"></div>
                            <div className="ms-ring" style={{borderTopColor: '#4f46e5', borderLeftColor: '#7c3aed'}}></div>
                            <div className="ms-logo" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text'}}><i className="fa-solid fa-crown"></i></div>
                        </div>
                        <div className="text-indigo-600 font-black tracking-widest mt-4 animate-pulse uppercase text-xs">Memproses Order...</div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-[140px] md:pb-40">
                {/* 🚀 HEADER VIP INDIGO-VIOLET */}
                <div className="p-8 pb-20 text-white shadow-xl relative overflow-hidden rounded-b-[45px]" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md transition-transform hover:-translate-x-1"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <h5 className="font-black text-xl tracking-tight m-0 text-center uppercase drop-shadow-md">XL Akrab <i className="fa-solid fa-crown text-amber-300 ml-1 text-sm"></i></h5>
                        <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full font-black text-[10px] shadow-inner uppercase tracking-widest border border-white/10">Rp {formatRp(userBalance)}</div>
                    </div>
                    <i className="fa-solid fa-users absolute right-5 -bottom-5 text-8xl text-white opacity-10 -rotate-12"></i>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-12 relative z-20">
                    {/* INPUT HP */}
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-6 relative overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor HP Tujuan</label>
                            <button type="button" onClick={() => {
                                const multiMode = !isMulti; setIsMulti(multiMode); setData({ ...data, no_hp: '', is_multi: multiMode });
                            }} className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 uppercase transition hover:bg-indigo-100 active:scale-95 shadow-sm">
                                <i className={`fa-solid ${isMulti ? 'fa-user' : 'fa-users'} mr-1`}></i> {isMulti ? 'Single' : 'Massal'}
                            </button>
                        </div>
                        <div className={`border-b-2 border-slate-100 flex items-center gap-3 focus-within:border-indigo-500 transition-all pb-2 relative z-10 ${isMulti ? 'items-start pt-2' : ''}`}>
                            {isMulti ? (
                                <textarea
                                    value={data.no_hp} onChange={e => setData('no_hp', e.target.value)} rows="3"
                                    className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-sm font-bold text-slate-800 p-0 placeholder-slate-300 custom-scrollbar"
                                    placeholder="08xxx&#10;08xxx&#10;(Satu baris satu nomor)"
                                ></textarea>
                            ) : (
                                <input
                                    type="tel" className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0 tracking-wider placeholder-slate-300"
                                    placeholder="08xxx..." value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value.replace(/\D/g, ''))} maxLength="14"
                                />
                            )}
                            {!isMulti && (
                                <button onClick={handleContactPicker} className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-[16px] flex items-center justify-center shrink-0 hover:bg-indigo-100 transition-all shadow-sm active:scale-95"><i className="fa-solid fa-address-book text-xl"></i></button>
                            )}
                        </div>
                    </div>

                    {/* TAB KATEGORI */}
                    <div className="flex overflow-x-auto gap-2.5 mb-5 no-scrollbar pb-2 snap-x px-1">
                        {['XLA', 'PROMO', 'XDA', 'FMX', 'CFMX', 'PLN', 'BONUS'].map(tab => (
                            <button
                                key={tab} onClick={() => { setActiveTab(tab); setData('kode_layanan', ''); }}
                                className={`snap-center shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${activeTab === tab ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_8px_15px_rgba(79,70,229,0.3)]' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                        <button type="button" onClick={() => fetchStock()} className="snap-center shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-slate-800 text-white shadow-sm hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-2 border-2 border-slate-800 ml-2">
                            <i className={`fa-solid fa-sync ${isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`}></i> {isSyncing ? 'SYNC...' : 'SYNC STOK'}
                        </button>
                    </div>

                    {/* PENCARIAN */}
                    <div className="mb-5 relative px-1">
                        <input type="text" placeholder="Cari Layanan..." className="w-full bg-white border border-slate-200 rounded-[20px] py-3.5 px-4 font-bold text-sm text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm pl-11" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <i className="fa-solid fa-search absolute left-5 top-4.5 text-slate-400 text-sm"></i>
                    </div>

                    {/* LIST PRODUK DENGAN FAKE DISKON JELAS */}
                    <div className="grid grid-cols-1 gap-3">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-[32px] border border-slate-100 font-bold text-slate-500 shadow-sm flex flex-col items-center">
                                <i className="fa-solid fa-box-open text-4xl mb-3 opacity-50 text-slate-300"></i> Produk tidak ditemukan.
                            </div>
                        ) : (
                            filteredProducts.map((p) => {
                                const sisa = liveStock[p.kode_layanan];
                                const isHasApiStock = sisa !== undefined;
                                const isOut = p.status !== 'active' || (isHasApiStock && sisa <= 0);
                                const isSelected = data.kode_layanan === p.kode_layanan;
                                
                                const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));

                                return (
                                    <div key={p.kode_layanan} className={`relative overflow-hidden rounded-[24px] transition-all duration-300 border-2 ${isOut ? 'bg-slate-50 border-slate-200 grayscale-[30%]' : isSelected ? 'bg-indigo-50 border-indigo-500 shadow-[0_10px_25px_rgba(79,70,229,0.2)] z-10 ring-4 ring-indigo-50' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200 hover:-translate-y-1'}`}>
                                        
                                        {!isOut && (
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-md tracking-widest z-20">
                                                DISKON 5%
                                            </div>
                                        )}

                                        <div onClick={() => setData('kode_layanan', isSelected ? '' : p.kode_layanan)} className="p-5 pt-6 cursor-pointer flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white shadow-sm border ${isSelected ? 'text-indigo-600 border-indigo-200' : 'text-slate-500 border-slate-200'}`}>{p.kode_layanan}</div>
                                                <div className="pr-16">
                                                    {isOut ? (
                                                        <span className="px-2 py-1 rounded text-[9px] font-black shadow-sm bg-red-100 text-red-600 border border-red-200">KOSONG</span>
                                                    ) : isHasApiStock ? (
                                                        <span className="px-2 py-1 rounded text-[9px] font-black shadow-sm bg-emerald-100 text-emerald-700 border border-emerald-200">{sisa} SLOT</span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded text-[9px] font-black shadow-sm bg-blue-100 text-blue-600 border border-blue-200">TERSEDIA</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`font-black text-sm mb-3 leading-snug pr-4 ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
                                                {p.nama_layanan}
                                            </div>
                                            <div className="text-right">
                                                {!isOut && <div className="text-[11px] text-slate-400 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>}
                                                <div className={`font-black text-[18px] tracking-tight ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                    Rp {formatRp(p.harga_jual)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {isSelected && (
                                            <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-4 duration-300 cursor-default">
                                                <div className={`p-4 rounded-[16px] border transition-colors duration-300 ${isOut ? 'bg-red-50 border-red-200' : 'bg-slate-900 border-slate-700 shadow-inner'}`}>
                                                    <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3">
                                                        <i className={`fa-solid ${isOut ? 'fa-triangle-exclamation text-red-500' : 'fa-circle-info text-indigo-400'}`}></i>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOut ? 'text-red-600' : 'text-slate-300'}`}>Info & Rincian Paket</span>
                                                    </div>
                                                    <div className={`text-xs leading-relaxed whitespace-pre-wrap max-h-[180px] overflow-y-auto dark-scrollbar pr-2 ${isOut ? 'text-slate-600' : 'text-slate-300'}`} dangerouslySetInnerHTML={{ __html: p.deskripsi || 'Tidak ada rincian area/kuota untuk produk ini.' }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 💳 BOTTOM PAYMENT BAR */}
                {selectedProduct && data.no_hp.length >= 10 && (
                    <div className="fixed bottom-[90px] md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5">
                        <div className={`rounded-[32px] p-2 pl-6 pr-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex justify-between items-center border backdrop-blur-xl transition-colors ${isSelectedKosong ? 'bg-red-950/95 border-red-800/50' : 'bg-slate-900/95 border-slate-700/50'}`}>
                            <div>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isSelectedKosong ? 'text-red-400' : 'text-slate-400'}`}>
                                    Total Tagihan {targetCount > 1 ? `(${targetCount} Nmr)` : ''}
                                </p>
                                <h3 className="text-xl font-black text-white tracking-tight drop-shadow-sm">Rp {formatRp(totalHarga)}</h3>
                            </div>
                            <button onClick={handleSubmit} disabled={processing || isSelectedKosong} className={`text-white px-6 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 ${isSelectedKosong ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-[0_8px_20px_rgba(79,70,229,0.3)]'}`}>
                                {processing ? 'PROSES...' : isSelectedKosong ? 'KOSONG' : 'CONFIRM ORDER'} <i className={`fa-solid ${isSelectedKosong ? 'fa-ban text-sm' : 'fa-rocket text-sm'}`}></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
