
import React, { useState, useMemo, useEffect } from 'react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { Head, Link, router } from '@inertiajs/react';

import Swal from 'sweetalert2';

import axios from 'axios';



const fadeInUp = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .live-dot { animation: pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; } @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }`;



export default function AkrabV8({ auth, reguler = [], circle = [], promo = [] }) {

    const [target, setTarget] = useState('');

    const [activeTab, setActiveTab] = useState('akrab');

    const [orderMode, setOrderMode] = useState('reguler');

    const [isMultiOrder, setIsMultiOrder] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);



    // 🚀 RADAR 5 DETIK MILASTORE

    const [liveProducts, setLiveProducts] = useState([

        ...(reguler || []), 

        ...(circle || []), 

        ...(typeof promo !== 'undefined' ? promo : [])

    ]);

    

    useEffect(() => {

        const timer = setInterval(() => {

            axios.get('/api/v8/live-stock').then(res => { 

                if (res.data && typeof res.data === 'object' && !res.data.message && (res.data.reguler || res.data.circle || res.data.promo)) {

                    const incomingData = [

                        ...(res.data.reguler || []),

                        ...(res.data.circle || []),

                        ...(res.data.promo || [])

                    ];

                    if (incomingData.length > 0) setLiveProducts(incomingData);

                } 

            }).catch(() => {});

        }, 5000);

        return () => clearInterval(timer);

    }, []);



    const fakeMarkup = 0.03;

    const allProducts = liveProducts; 



    // 🔥 MESIN PENGURUT MILASTORE: XDA dan XAP Dijejer Berdampingan Berdasarkan Angka

    const trueAkrab = useMemo(() => {

        const list = allProducts.filter(p => p.product_code && (p.product_code.toUpperCase().includes('XDA') || p.product_code.toUpperCase().includes('XAP')));

        return list.sort((a, b) => {

            const numA = parseInt(a.product_code.replace(/\D/g, '')) || 0;

            const numB = parseInt(b.product_code.replace(/\D/g, '')) || 0;

            if (numA === numB) {

                // Jika angkanya sama (misal 38), XDA ditaruh di atas XAP otomatis karena abjad D < P

                return a.product_code.localeCompare(b.product_code);

            }

            return numA - numB;

        });

    }, [allProducts]);



    // CIRCLE = Hanya XCLP

    const trueCircle = useMemo(() => {

        return allProducts.filter(p => p.product_code && p.product_code.toUpperCase().includes('XCLP')).sort((a, b) => {

            const numA = parseInt(a.product_code.replace(/\D/g, '')) || 0;

            const numB = parseInt(b.product_code.replace(/\D/g, '')) || 0;

            return numA - numB;

        });

    }, [allProducts]);



    const getActiveProducts = () => {

        if (activeTab === 'akrab') return trueAkrab;

        if (activeTab === 'circle') return trueCircle;

        return [];

    };

    const activeProductsList = getActiveProducts();



    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);



    const renderSmartDescription = (desc) => {

        if (!desc) return null;

        if (desc.includes('|') || desc.toLowerCase().includes('area')) {

            const parts = desc.split(/\||\n/).map(s => s.trim()).filter(s => s !== '');

            return (

                <div className="text-[11px] text-slate-600 font-medium leading-relaxed bg-[#f8fafc] p-3.5 rounded-[12px] border border-slate-200/60 shadow-inner">

                    <div className="mb-2.5">

                        <div className="font-bold text-slate-800 mb-1">Details Kuota :</div>

                        <div className="space-y-0.5 ml-1">

                            {parts.map((p, idx) => {

                                let clean = p.replace(/area\s*(\d+)/i, 'AREA $1 ').replace(':', ' : ').replace(/^~?\s*/, '');

                                return <div key={idx}>~ {clean}</div>;

                            })}

                        </div>

                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70">

                        <div className="font-bold text-slate-800 mb-1">noted :</div>

                        <div className="space-y-0.5 ml-1 text-slate-500">

                            <div>~ rewards tidak masuk, tunggu 1 x 24 jam, baru komplen</div>

                            <div>~ official, resmi, bergaransi di MILASTORE</div>

                        </div>

                    </div>

                </div>

            );

        }

        return <div className="text-[11px] text-slate-600 font-medium leading-relaxed whitespace-pre-wrap bg-[#f8fafc] p-3.5 rounded-[12px] border border-slate-200/60 shadow-inner" dangerouslySetInnerHTML={{ __html: desc }} />;

    };



    const getRealStock = (p) => {

        // 🔥 FIX SINKRONISASI STOK BACKEND & FRONTEND

        return p.live_stock !== undefined ? p.live_stock : (p.stock_count || 0);

    };



    const handleOrder = (product) => {

        if (!product.is_active) return Swal.fire({icon: 'info', title: 'Tertidur 💤', text: 'Layanan istirahat.', confirmButtonColor: '#0f172a'});

        if (!target || target.trim().length < 10) return Swal.fire({icon: 'warning', title: 'Nomor Kosong 📱', text: 'Isi nomor tujuan dulu Sultan!', confirmButtonColor: '#0f172a'});

        

        const targetsArray = target.split(/[\n,]+/).map(n => n.trim()).filter(n => n !== "");

        const jumlahTarget = targetsArray.length;

        const totalHargaAsli = product.price_sell * jumlahTarget;

        const totalHargaCoret = Math.round(product.price_sell * (1 + fakeMarkup)) * jumlahTarget;

        const isPO = orderMode === 'po';

        const currentStock = getRealStock(product);

        

        if (!isPO && currentStock <= 0) {

            Swal.fire({

                title: 'Stok Pusat Kosong! ⚠️', text: 'MilaStore merekomendasikan untuk beralih ke Mode Pre-Order agar pesanan otomatis dieksekusi saat stok masuk.', icon: 'warning', showCancelButton: true, confirmButtonText: '📦 PINDAH KE MODE PO', cancelButtonText: 'TETAP TEMBAK INSTAN', confirmButtonColor: '#4f46e5', cancelButtonColor: '#ef4444', customClass: { popup: 'rounded-[28px]' }

            }).then((result) => {

                if (result.isConfirmed) { setOrderMode('po'); }

                else if (result.dismiss === Swal.DismissReason.cancel) { executeOrder(product, targetsArray, totalHargaAsli, totalHargaCoret, isPO); }

            });

        } else {

            executeOrder(product, targetsArray, totalHargaAsli, totalHargaCoret, isPO);

        }

    };



    const executeOrder = (product, targetsArray, totalHargaAsli, totalHargaCoret, isPO) => {

        const jumlahTarget = targetsArray.length;

        const modeTitle = isPO ? 'Konfirmasi Pre-Order' : 'Konfirmasi Order Instan';

        const btnText = isPO ? '📦 MASUKKAN KE ANTREAN' : '⚡   SUNTIK SEKARANG';

        const btnColor = isPO ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-blue-600';

        

        Swal.fire({

            title: `<div class="text-xl font-black text-slate-800 tracking-tight">${modeTitle} ${jumlahTarget > 1 ? 'Massal' : ''}</div>`,

            html: `

                <div class="text-left text-sm mt-3 space-y-2.5">

                    ${isPO ? `<div class="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-[10px] font-bold text-indigo-700 text-center uppercase tracking-widest mb-3">Mode Pre-Order (Antrean Prioritas)</div>` : ''}

                    <div class="bg-slate-50 p-3.5 rounded-[16px] border border-slate-100 flex justify-between items-center"><span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Produk</span><span class="text-[11px] font-black ${isPO ? 'text-indigo-600' : 'text-blue-600'} text-right w-1/2 leading-tight">${product.product_name}</span></div>

                    <div class="bg-slate-50 p-3.5 rounded-[16px] border border-slate-100 flex justify-between items-center"><span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${jumlahTarget > 1 ? 'Jumlah Target' : 'Nomor Tujuan'}</span><span class="text-lg font-black text-slate-800 tracking-wider">${jumlahTarget > 1 ? jumlahTarget + ' <span class="text-[10px]">Nomor</span>' : targetsArray[0]}</span></div>

                    <div class="${isPO ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100'} p-4 rounded-[16px] border flex justify-between items-center"><span class="text-[9px] font-black ${isPO ? 'text-indigo-600' : 'text-blue-600'} uppercase tracking-widest">Total Bayar</span><div class="text-right"><span class="text-[10px] text-slate-400 line-through mr-1.5">Rp ${formatRp(totalHargaCoret)}</span><span class="text-xl font-black ${isPO ? 'text-indigo-700' : 'text-blue-700'}">Rp ${formatRp(totalHargaAsli)}</span></div></div>

                </div>

            `,

            showCancelButton: true, cancelButtonText: 'BATAL', confirmButtonText: btnText, buttonsStyling: false,

            customClass: { confirmButton: `w-full ${btnColor} text-white font-black rounded-xl px-5 py-3.5 mt-4 transition-all shadow-lg text-[11px] tracking-widest uppercase`, cancelButton: 'w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl px-5 py-3 mt-2 transition-all text-xs', popup: 'rounded-[28px] p-5 w-full max-w-sm border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.1)]' }

        }).then((result) => {

            if (result.isConfirmed) {

                setIsProcessing(true);

                Swal.fire({ title: isPO ? 'Memasukkan ke Gudang...' : 'Menyiapkan Jalur...', text: 'Sedang memproses request...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                axios.post('/order/place', { product_code: product.product_code, target: target, order_mode: orderMode }).then(res => {

                    setIsProcessing(false);

                    if (res.data.success) {

                        if(res.data.is_po_alert) { Swal.fire({ title: '📦 Masuk Antrean PO!', text: res.data.message, icon: 'info', iconColor: '#4f46e5', timer: 4500, timerProgressBar: true, showConfirmButton: false, customClass: { popup: 'rounded-[28px]' } }).then(() => router.visit('/riwayat')); }

                        else { Swal.fire({ title: '🎉 Berhasil Diproses!', text: res.data.message, icon: 'success', timer: 3500, timerProgressBar: true, showConfirmButton: false, customClass: { popup: 'rounded-[28px]' } }).then(() => router.visit('/riwayat')); }

                    } else { Swal.fire({ title: 'Order Gagal ⚠️', text: res.data.message, icon: 'warning', timer: 4000, timerProgressBar: true, confirmButtonColor: '#0f172a', customClass: { popup: 'rounded-[28px]' } }); }

                }).catch(err => {

                    setIsProcessing(false);

                    Swal.fire({ title: 'Waduh Sultan! 🚨', text: err.response?.data?.message || 'Server MILASTORE sedang sibuk.', icon: 'error', timer: 3000, timerProgressBar: true, confirmButtonColor: '#ef4444', customClass: { popup: 'rounded-[28px]' } });

                });

            }

        });

    };



    return (

        <AuthenticatedLayout user={auth.user}>

            <Head title="Akrab V8 Pro - MilaStore" />

            <style>{fadeInUp}</style>

            

            {isProcessing && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-sm"></div>}

            

            <div className="min-h-screen bg-[#f8fafc] pb-24 pt-4 font-['Outfit']">

                <div className="max-w-lg mx-auto px-4">

                    

                    {/* MILASTORE BRANDING HEADER */}

                    <div className="relative flex items-center justify-center mb-6">

                        <Link href={route('dashboard')} className="absolute left-0 w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:text-blue-600 transition-all"><i className="fa-solid fa-arrow-left"></i></Link>

                        <div className="text-center">

                            <h2 className="text-xl font-black text-slate-800 leading-none mb-0.5">Akrab <span className="text-blue-600">V8</span></h2>

                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">BY MILASTORE</p>

                        </div>

                    </div>



                    <div className="bg-slate-100/70 p-1.5 rounded-2xl mb-5 flex gap-1 border border-slate-200/50 shadow-inner">

                        <button onClick={() => setOrderMode('reguler')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 ${orderMode === 'reguler' ? 'bg-white text-slate-900 shadow-[0_4px_10px_rgba(0,0,0,0.05)] scale-100' : 'text-slate-400 hover:text-slate-600 scale-95'}`}><i className="fa-solid fa-bolt text-amber-500"></i> Order Biasa</button>

                        <button onClick={() => setOrderMode('po')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 ${orderMode === 'po' ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] scale-100' : 'text-slate-400 hover:text-slate-600 scale-95'}`}><i className="fa-solid fa-box-open"></i> Pre-Order</button>

                    </div>



                    <div className={`mb-5 p-3 rounded-xl border flex items-start gap-3 transition-all ${orderMode === 'reguler' ? 'bg-amber-50/50 border-amber-100/50' : 'bg-indigo-50/50 border-indigo-100/50'}`}>

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${orderMode === 'reguler' ? 'bg-amber-100 text-amber-500' : 'bg-indigo-100 text-indigo-500'}`}><i className={`fa-solid ${orderMode === 'reguler' ? 'fa-rocket' : 'fa-clock-rotate-left'}`}></i></div>

                        <div>

                            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${orderMode === 'reguler' ? 'text-amber-700' : 'text-indigo-700'}`}>{orderMode === 'reguler' ? 'Mode Instan Aktif' : 'Mode Pre-Order Aktif'}</h4>

                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{orderMode === 'reguler' ? 'Pesanan langsung dieksekusi ke pusat MILASTORE.' : 'Pesanan ditahan di server. Robot akan mengeksekusi otomatis begitu stok tersedia.'}</p>

                        </div>

                    </div>



                    <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-5 relative">

                        <div className="flex justify-between items-center mb-3 mt-1">

                            <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm border border-slate-700">{isMultiOrder ? 'Target (Massal)' : 'Nomor Target'}</div>

                            <button onClick={() => { setIsMultiOrder(!isMultiOrder); setTarget(''); }} className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border ${isMultiOrder ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}><i className={`fa-solid ${isMultiOrder ? 'fa-check-circle' : 'fa-list-ol'}`}></i>{isMultiOrder ? 'Mode Massal: ON' : 'Mode Massal: OFF'}</button>

                        </div>

                        {isMultiOrder ? (

                            <textarea value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0819xxx, 0812xxx&#10;(Pisahkan pakai Koma atau Enter)" rows="3" className="w-full bg-slate-50/50 border border-slate-100 rounded-[14px] py-3.5 px-4 text-sm font-black text-slate-800 tracking-widest outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 resize-none leading-relaxed"></textarea>

                        ) : (

                            <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full bg-slate-50/50 border border-slate-100 rounded-[14px] py-3.5 px-4 text-lg font-black text-slate-800 text-center tracking-widest outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300" />

                        )}

                    </div>



                    {/* 🔥 TAB MENU MILASTORE: HANYA ADA 2 */}

                    <div className="flex bg-white p-1.5 rounded-[14px] mb-5 border border-slate-100 shadow-sm gap-1">

                        <button onClick={() => setActiveTab('akrab')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'akrab' ? 'bg-slate-900 text-white shadow-md scale-100' : 'text-slate-400 hover:bg-slate-50 scale-95'}`}>🔥 Akrab</button>

                        <button onClick={() => setActiveTab('circle')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'circle' ? 'bg-blue-600 text-white shadow-md scale-100' : 'text-slate-400 hover:bg-slate-50 scale-95'}`}>💎 Circle</button>

                    </div>



                    <div className="space-y-3">

                        {activeProductsList.length === 0 ? (

                            <div className="text-center py-10 bg-white rounded-[20px] border border-slate-100 border-dashed">

                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">

                                    <i className="fa-solid fa-box-open text-2xl text-slate-300"></i>

                                </div>

                                <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">PRODUK KOSONG</h3>

                                <p className="text-[10px] text-slate-400 font-medium mt-1">Stok untuk kategori ini sedang tidak tersedia.</p>

                            </div>

                        ) : (

                            activeProductsList.map((p) => {

                                const isSelected = selectedProduct?.id === p.id;

                                const isPromo = p.product_code.toUpperCase().includes('XAP');

                                const currentStock = getRealStock(p);



                                return (

                                    <div key={p.id} className={`group bg-white rounded-[20px] p-4 transition-all duration-300 relative animate-in fade-in-up border ${isSelected ? 'border-blue-500 shadow-[0_10px_25px_rgba(37,99,235,0.15)] ring-4 ring-blue-50 z-10 scale-[1.01]' : (orderMode === 'reguler' && currentStock <= 0 ? 'border-red-100 bg-red-50/30' : 'border-slate-100 hover:border-blue-300')} cursor-pointer`} onClick={() => { if(p.is_active) setSelectedProduct(isSelected ? null : p); }}>

                                        <div className="flex justify-between items-start gap-2">

                                            <div className="flex-1 pr-2">

                                                <div className="flex items-center flex-wrap gap-1.5 mb-2">

                                                    

                                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded tracking-widest border ${isPromo ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>

                                                        {isPromo ? <><i className="fa-solid fa-fire-flame-curved mr-1"></i>{p.product_code}</> : p.product_code}

                                                    </span>



                                                    {orderMode === 'reguler' ? (

                                                        currentStock > 0 ? (

                                                            <span className="flex items-center gap-1 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100"><span className="w-1 h-1 rounded-full bg-emerald-500 live-dot"></span> STOK: {currentStock}</span>

                                                        ) : (

                                                            <span className="flex items-center gap-1 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-red-50 text-red-600 border border-red-100"><span className="w-1 h-1 rounded-full bg-red-500"></span> KOSONG</span>

                                                        )

                                                    ) : (

                                                        <span className="text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100"><i className="fa-solid fa-bolt"></i> FAST PO</span>

                                                    )}

                                                </div>

                                                <h4 className="font-bold text-slate-800 text-[12px] leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 pr-1">{p.product_name}</h4>

                                            </div>

                                            <div className="text-right flex flex-col justify-center items-end min-w-[95px] border-l border-slate-100 pl-3">

                                                <div className={`text-[14px] font-black mb-2 leading-none ${isPromo ? 'text-rose-600' : 'text-blue-600'}`}>Rp {formatRp(p.price_sell)}</div>

                                                <button onClick={(e) => { e.stopPropagation(); if(p.is_active) handleOrder(p); }} className={`w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all text-white shadow-sm ${orderMode === 'po' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : (currentStock <= 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : (isPromo ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700' : 'bg-slate-900 hover:bg-blue-600'))}`}>

                                                    {orderMode === 'po' ? 'Antre PO' : (currentStock <= 0 ? 'Stok Habis' : 'Beli')}

                                                </button>

                                            </div>

                                        </div>

                                        {isSelected && (

                                            <div className="mt-4 pt-3.5 border-t border-slate-100/80 animate-in fade-in duration-300">

                                                <div className="flex items-center gap-2 mb-2.5">

                                                    <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100"><i className="fa-solid fa-file-lines text-[10px] text-blue-500"></i></div>

                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Deskripsi & Syarat</span>

                                                </div>

                                                {renderSmartDescription(p.description)}

                                            </div>

                                        )}

                                    </div>

                                );

                            })

                        )}

                    </div>

                </div>

            </div>

        </AuthenticatedLayout>

    );

}

