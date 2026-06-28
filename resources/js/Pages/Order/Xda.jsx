import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../css/mila-loading.css';

export default function Xda({ auth, groupedProducts = {}, userBalance = 0 }) {
    const categories = Object.keys(groupedProducts);
    const [phone, setPhone] = useState(localStorage.getItem("last_hp_xda") || '');
    const [activeCat, setActiveCat] = useState(categories[0] || '');
    const [liveStock, setLiveStock] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [localBalance, setLocalBalance] = useState(userBalance);
    const [isLoading, setIsLoading] = useState(false);
    
    // 🎛️ STATE UNTUK SAKLAR MULTI-TRX
    const [isMultiMode, setIsMultiMode] = useState(false);
    
    // 🚀 FAKE DISCOUNT 5%
    const fakeMarkup = 0.05;

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    useEffect(() => {
        let isMounted = true;
        // 🔄 PERBAIKAN FUNGSI POLING STOK REAL-TIME
        const poll = async () => {
            try {
                const res = await axios.post('/order/xda/poll', { category: activeCat });
                if (isMounted && res.data && res.data.status === 'success') {
                    setLiveStock(res.data.data);
                }
            } catch (e) {
                console.error("Poling stok gagal:", e.response ? e.response.data : e.message);
            }
        };
        poll();
        const timer = setInterval(poll, 5000);
        return () => { isMounted = false; clearInterval(timer); };
    }, [activeCat]);

    // 🧮 LOGIKA PERHITUNGAN MULTI-NOMOR
    const getValidCount = () => {
        if (!isMultiMode) return phone.length >= 5 ? 1 : 0;
        const rawNumbers = phone.split(/[\r\n, ]+/);
        const validNumbers = rawNumbers.filter(n => n.replace(/\D/g, '').length >= 5);
        return [...new Set(validNumbers)].length;
    };

    const validCount = getValidCount();
    const finalPrice = selectedProduct ? (validCount || 1) * selectedProduct.harga_jual : 0;
    const finalPriceCoret = selectedProduct ? Math.round(selectedProduct.harga_jual * (1 + fakeMarkup)) * (validCount || 1) : 0;
    const isBalanceEnough = Number(localBalance) >= finalPrice;

    let selectedIsOutOfStock = false;
    if (selectedProduct) {
        const stockObj = liveStock.find(s => s.kode_layanan === selectedProduct.kode_layanan);
        if (stockObj && (stockObj.status !== 'active' || (stockObj.stok !== 'Unlimited' && parseInt(stockObj.stok) <= 0))) {
            selectedIsOutOfStock = true;
        }
    }

    const handlePay = async () => {
        if (!selectedProduct) return;
        if (validCount === 0) return Swal.fire({icon: 'warning', title: 'Oops', text: 'Masukkan minimal 1 nomor valid.', confirmButtonColor: '#4f46e5', customClass: {popup: 'rounded-[24px]'}});
        if (!isBalanceEnough) {
            return Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: 'Silakan isi dompet Anda.', confirmButtonColor: '#4f46e5', customClass: {popup: 'rounded-[24px]'} }).then((r) => { if(r.isConfirmed) router.visit('/deposit'); });
        }

        // 🚀 POPUP KONFIRMASI MODERN SULTAN
        const konfirmasi = await Swal.fire({
            title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2 uppercase">Konfirmasi Order</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-users text-indigo-500"></i> Target</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${isMultiMode ? `${validCount} Nomor Massal` : phone}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-box-open text-indigo-500"></i> Layanan</span>
                        <span class="text-[13px] font-black text-indigo-600 text-right w-1/2 leading-tight">${selectedProduct.nama_layanan}</span>
                    </div>
                    <div class="bg-gradient-to-br from-indigo-50 to-violet-50 p-5 rounded-[24px] border border-indigo-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-indigo-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-indigo-700 uppercase tracking-widest relative z-10">Total Bayar</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-indigo-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(finalPriceCoret)}</span>
                            <span class="text-2xl font-black text-indigo-700 tracking-tight">Rp ${formatRp(finalPrice)}</span>
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
        });

        if (!konfirmasi.isConfirmed) return;
        
        setIsLoading(true);
        try {
            const response = await axios.post(route("order.xda.store"), { kode_layanan: selectedProduct.kode_layanan, tujuan: phone });
            const res = response.data;
            setIsLoading(false);
            if (res.status === 'success') {
                setLocalBalance(prev => prev - finalPrice);
                Swal.fire({
                    title: 'SUKSES BOSKU! 🚀', text: res.message,
                    imageUrl: 'https://media.tenor.com/gK2A3F6U2o0AAAAj/peach-cat-money.gif',
                    imageWidth: 140, imageHeight: 140, imageAlt: 'Kucing Cuan',
                    confirmButtonText: 'Lanjutkan Gaspol!', confirmButtonColor: '#4f46e5',
                    background: '#ffffff', backdrop: `rgba(79, 70, 229, 0.4)`,
                    customClass: { popup: 'rounded-[32px] border-2 border-indigo-100 shadow-[0_20px_50px_rgba(79,70,229,0.3)]', title: 'text-2xl font-black text-indigo-900', confirmButton: 'rounded-xl font-bold px-8 py-3 text-sm tracking-widest' }
                }).then(() => { router.visit('/riwayat'); });
            } else {
                Swal.fire({ title: 'Gagal', text: String(res.message).replace(/kaje/gi, 'Pusat Data'), icon: 'error', confirmButtonColor: '#f43f5e', customClass: {popup: 'rounded-[24px]'} });
            }
        } catch (error) {
            setIsLoading(false);
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan jaringan.';
            Swal.fire({title: 'Error', text: String(errorMsg).replace(/kaje/gi, 'Pusat Data'), icon: 'error', confirmButtonColor: '#f43f5e', customClass: {popup: 'rounded-[24px]'}});
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Order XDA - MilaStore" />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark-scrollbar::-webkit-scrollbar { width: 5px; }
                .dark-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
                .pulse-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite; display: inline-block; margin-right: 6px; }
                @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); } 100% { transform: scale(0.95); } }
            `}</style>
            
            {/* 🛡️ LOADER CSS ORIGINAL MILASTORE (DIKEMBALIKAN) */}
            {isLoading && (
                <div className="mila-loader-overlay z-[9999] bg-white/90 backdrop-blur-md">
                    <div className="loading-content">
                        <div className="spinner-wrapper">
                            <div className="ms-ring-bg"></div>
                            <div className="ms-ring" style={{borderTopColor: '#4f46e5', borderLeftColor: '#7c3aed'}}></div>
                            <div className="ms-logo" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text'}}><i className="fa-solid fa-satellite-dish"></i></div>
                        </div>
                        <div className="text-indigo-600 font-black tracking-widest mt-4 animate-pulse uppercase text-xs">Menembak Server...</div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-[140px] md:pb-40">
                {/* 🚀 HEADER VIP INDIGO-VIOLET */}
                <div className="p-8 pb-20 text-white shadow-xl relative overflow-hidden rounded-b-[45px]" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md transition-transform hover:-translate-x-1"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <div>
                            <h5 className="font-black text-xl tracking-tight m-0 text-center uppercase drop-shadow-md">Amifi XDA <i className="fa-solid fa-satellite-dish text-amber-300 ml-1 text-sm"></i></h5>
                            <div className="flex items-center justify-center text-[10px] font-bold opacity-90 mt-1 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full w-max mx-auto"><div className="pulse-dot"></div> Live Server</div>
                        </div>
                        <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full font-black text-[10px] shadow-inner uppercase tracking-widest border border-white/10">Rp {formatRp(localBalance)}</div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-12 relative z-20">
                    {/* INPUT HP */}
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-6 relative overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target XDA</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button type="button" onClick={() => setIsMultiMode(false)} className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-all ${!isMultiMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Biasa</button>
                                <button type="button" onClick={() => setIsMultiMode(true)} className={`px-3 py-1 text-[9px] font-black uppercase rounded transition-all ${isMultiMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Masal</button>
                            </div>
                        </div>
                        <div className={`border-b-2 border-slate-100 flex items-center gap-3 focus-within:border-indigo-500 transition-all pb-2 relative z-10 ${isMultiMode ? 'items-start pt-2 border-none' : ''}`}>
                            {!isMultiMode ? (
                                <>
                                    <input type="tel" className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0 tracking-wider placeholder-slate-300" placeholder="08xxx..." value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); localStorage.setItem("last_hp_xda", e.target.value.replace(/\D/g, '')); }} maxLength="14" />
                                    <i className="fa-solid fa-address-book text-slate-300 text-xl"></i>
                                </>
                            ) : (
                                <div className="relative w-full">
                                    <textarea className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none min-h-[120px] text-sm placeholder:text-slate-300 custom-scrollbar" placeholder="081234567890&#10;085643210987" value={phone} onChange={(e) => setPhone(e.target.value)}></textarea>
                                    <span className="absolute top-3 right-3 bg-indigo-100 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm border border-indigo-200">{validCount} Valid</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TAB KATEGORI */}
                    <div className="flex overflow-x-auto gap-2.5 mb-5 no-scrollbar pb-2 snap-x px-1">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => {setActiveCat(cat); setSelectedProduct(null);}} className={`snap-center shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${activeCat === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_8px_15px_rgba(79,70,229,0.3)]' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* LIST PRODUK DENGAN FAKE DISKON JELAS */}
                    <div className="grid grid-cols-1 gap-3">
                        {groupedProducts[activeCat]?.map((p) => {
                            const isSelected = selectedProduct?.kode_layanan === p.kode_layanan;
                            const stockObj = liveStock.find(s => s.kode_layanan === p.kode_layanan);
                            const isUnlimited = stockObj?.stok === 'Unlimited';
                            const isAvail = stockObj ? (stockObj.status === 'active' && (isUnlimited || parseInt(stockObj.stok) > 0)) : true;
                            
                            // KALKULASI FAKE DISKON
                            const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));

                            return (
                                <div key={p.kode_layanan} className={`relative overflow-hidden rounded-[24px] transition-all duration-300 border-2 ${!isAvail ? 'bg-slate-50 border-slate-200 grayscale-[40%]' : isSelected ? 'bg-indigo-50 border-indigo-500 shadow-[0_10px_25px_rgba(79,70,229,0.2)] z-10 ring-4 ring-indigo-50' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200 hover:-translate-y-1'}`}>
                                    
                                    {isAvail && (
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-md tracking-widest z-20">
                                            DISKON 5%
                                        </div>
                                    )}

                                    <div onClick={() => setSelectedProduct(p)} className="p-5 pt-6 cursor-pointer flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white shadow-sm border ${isSelected ? 'text-indigo-600 border-indigo-200' : 'text-slate-500 border-slate-200'}`}>{p.kode_layanan}</div>
                                            <div className="pr-16">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black shadow-sm border ${isAvail ? (isUnlimited ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200') : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                                    {stockObj ? (isUnlimited ? '💎 UNLIMITED' : (isAvail ? `● STOK ${stockObj.stok}` : '● HABIS')) : '⏳ SYNC...'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`font-black text-sm mb-3 leading-snug pr-4 ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>
                                            {p.nama_layanan}
                                        </div>
                                        <div className="text-right">
                                            {isAvail && <div className="text-[11px] text-slate-400 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>}
                                            <div className={`font-black text-[18px] tracking-tight ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                Rp {formatRp(p.harga_jual)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isSelected && p.deskripsi && (
                                        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-4 duration-300 cursor-default">
                                            <div className={`p-4 rounded-[16px] border transition-colors duration-300 ${!isAvail ? 'bg-red-50 border-red-200' : 'bg-slate-900 border-slate-700 shadow-inner'}`}>
                                                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3">
                                                    <i className={`fa-solid ${!isAvail ? 'fa-triangle-exclamation text-red-500' : 'fa-circle-info text-indigo-400'}`}></i>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${!isAvail ? 'text-red-600' : 'text-slate-300'}`}>Info & Rincian Paket</span>
                                                </div>
                                                <div className={`text-xs leading-relaxed whitespace-pre-wrap max-h-[180px] overflow-y-auto dark-scrollbar pr-2 ${!isAvail ? 'text-slate-600' : 'text-slate-300'}`} dangerouslySetInnerHTML={{ __html: p.deskripsi }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 💳 BOTTOM PAYMENT BAR */}
                {selectedProduct && validCount > 0 && (
                    <div className="fixed bottom-[90px] md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5">
                        <div className={`rounded-[32px] p-2 pl-6 pr-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex justify-between items-center border backdrop-blur-xl transition-colors ${selectedIsOutOfStock ? 'bg-red-950/95 border-red-800/50' : 'bg-slate-900/95 border-slate-700/50'}`}>
                            <div>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${selectedIsOutOfStock ? 'text-red-400' : 'text-slate-400'}`}>
                                    Total Tagihan {validCount > 1 ? `(${validCount} Nmr)` : ''}
                                </p>
                                <h3 className="text-xl font-black text-white tracking-tight drop-shadow-sm">Rp {formatRp(finalPrice)}</h3>
                            </div>
                            <button onClick={handlePay} disabled={isLoading || selectedIsOutOfStock} className={`text-white px-6 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 ${selectedIsOutOfStock ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-[0_8px_20px_rgba(79,70,229,0.3)]'}`}>
                                {isLoading ? 'PROSES...' : selectedIsOutOfStock ? 'HABIS' : 'CONFIRM ORDER'} <i className={`fa-solid ${selectedIsOutOfStock ? 'fa-ban text-sm' : 'fa-rocket text-sm'}`}></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
