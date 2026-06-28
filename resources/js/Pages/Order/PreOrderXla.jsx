import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';
import '../../../css/mila-loading.css';

export default function PreOrderXla({ auth, products, total_antri }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, reset } = useForm({
        no_hp: '',
        kode_produk: '',
        is_multi: false
    });
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const fakeMarkup = 0.05;

    // 🛡️ FLASH MESSAGE HANDLING (SUKSES SAJA)
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'DORR! MASUK BOS! 🚀', text: flash.success, icon: 'success',
                confirmButtonColor: '#ea580c', background: '#1e293b', color: '#f8fafc',
                customClass: { popup: 'rounded-[24px] border border-slate-700' }
            }).then(() => router.visit('/riwayat'));
        }
    }, [flash]);

    // 📱 FUNGSI SAKTI: AMBIL DARI KONTAK
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
        }
    };

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    // OTOMATIS MENGHITUNG NOMOR VALID & ANTI DUPLIKAT
    const getValidNumbers = () => {
        if (!data.no_hp) return 0;
        if (!data.is_multi) return data.no_hp.length >= 10 ? 1 : 0;
        const raw = data.no_hp.split(/[\r\n,]+/);
        const clean = raw.map(n => n.replace(/\D/g, '')).filter(n => n.length >= 10);
        return new Set(clean).size;
    };

    const count = getValidNumbers();
    const activeProduct = products.find(p => p.kode_layanan === data.kode_produk);
    const totalHarga = count > 0 && activeProduct ? count * activeProduct.harga_jual : 0;
    const totalHargaCoret = count > 0 && activeProduct ? count * Math.round(activeProduct.harga_jual * (1 + fakeMarkup)) : 0;

    const submitOrder = (e) => {
        e.preventDefault();
        
        if (count === 0) return Swal.fire({icon: 'warning', title: 'Amunisi Kosong!', text: 'Masukkan minimal 1 nomor HP valid!', confirmButtonColor: '#ea580c', background: '#1e293b', color: '#f8fafc', customClass: {popup: 'rounded-[24px] border border-slate-700'}});
        if (!data.kode_produk) return Swal.fire({icon: 'warning', title: 'Target Kosong!', text: 'Pilih produk dulu Bos!', confirmButtonColor: '#ea580c', background: '#1e293b', color: '#f8fafc', customClass: {popup: 'rounded-[24px] border border-slate-700'}});
        if (count > 20) return Swal.fire({icon: 'error', title: 'Kebanyakan Bos!', text: 'Maksimal 20 nomor dalam 1 order.', confirmButtonColor: '#ef4444', background: '#1e293b', color: '#f8fafc', customClass: {popup: 'rounded-[24px] border border-slate-700'}});

        // 🚀 POPUP WAR CONFIRMATION
        Swal.fire({
            title: `<div class="text-2xl font-black text-white tracking-tight mt-2 uppercase">KONFIRMASI TEMBAK</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-800 p-4 rounded-[20px] border border-slate-700 flex justify-between items-center shadow-inner">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-crosshairs text-orange-500"></i> Amunisi</span>
                        <span class="text-lg font-black text-white tracking-widest font-mono">${data.is_multi ? `${count} Target` : data.no_hp}</span>
                    </div>
                    <div class="bg-slate-800 p-4 rounded-[20px] border border-slate-700 flex justify-between items-center shadow-inner">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-box-open text-orange-500"></i> Senjata</span>
                        <span class="text-[12px] font-black text-orange-400 text-right w-1/2 leading-tight">${activeProduct.nama_layanan}</span>
                    </div>
                    <div class="bg-gradient-to-br from-red-900/50 to-orange-900/50 p-5 rounded-[24px] border border-red-500/30 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-red-500/20 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-red-400 uppercase tracking-widest relative z-10">Biaya Perang</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-red-300/50 line-through mb-0.5 font-bold">Rp ${formatRp(totalHargaCoret)}</span>
                            <span class="text-2xl font-black text-orange-500 tracking-tight">Rp ${formatRp(totalHarga)}</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'BATAL', confirmButtonText: '<i class="fa-solid fa-skull mr-2"></i> DOR BRUTAL!',
            buttonsStyling: false, reverseButtons: true, background: '#0f172a',
            customClass: {
                confirmButton: 'w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.3)] text-xs tracking-widest uppercase transform active:scale-95 border border-red-500/50',
                cancelButton: 'w-full bg-transparent hover:bg-slate-800 text-slate-400 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-700 tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm border border-slate-700 shadow-[0_30px_60px_rgba(0,0,0,0.5)]'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // 🚀 EKSEKUSI PENEMBAKAN
                post(route('war.xla.store'), {
                    preserveScroll: true,
                    onStart: () => {
                        Swal.fire({
                            title: '<div class="text-xl font-black text-white mt-2">MENEMBAK SERVER...</div>',
                            html: `
                                <div class="mt-6 mb-2 flex flex-col items-center justify-center">
                                    <div class="relative w-20 h-20">
                                        <div class="absolute inset-0 border-4 border-slate-700 rounded-full shadow-inner"></div>
                                        <div class="absolute inset-0 border-4 border-orange-500 rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(234,88,12,0.5)]"></div>
                                        <div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-fire text-red-500 text-2xl animate-pulse"></i></div>
                                    </div>
                                    <p class="text-[11px] font-black text-slate-400 mt-8 tracking-[0.2em] uppercase animate-pulse">Tahan, Bosku!</p>
                                </div>
                            `,
                            allowOutsideClick: false, showConfirmButton: false, background: '#0f172a',
                            customClass: { popup: 'rounded-[32px] p-8 w-full max-w-sm border border-slate-700 shadow-2xl' }
                        });
                    },
                    onSuccess: () => {
                        reset('no_hp');
                    },
                    onError: (errors) => {
                        // 🛑 REM DARURAT JIKA ERROR/SALDO KURANG (TIDAK MUTER-MUTER LAGI)
                        Swal.fire({
                            title: 'GAGAL TEMBAK ❌ ', 
                            text: errors.error || 'Terjadi kesalahan sistem atau saldo tidak mencukupi!', 
                            icon: 'error',
                            confirmButtonColor: '#ef4444', background: '#1e293b', color: '#f8fafc',
                            customClass: { popup: 'rounded-[24px] border border-slate-700' }
                        });
                    },
                    onFinish: () => {
                        // Jaga-jaga kalau nyangkut (timeout provider), kita paksa stop
                        if (Swal.isVisible() && Swal.getTitle()?.innerText.includes('MENEMBAK SERVER')) {
                            Swal.close();
                        }
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="WAR XLA PREMIUM" />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }
                .dark-scrollbar::-webkit-scrollbar { width: 4px; }
                .dark-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
                .pulse-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 2s infinite; display: inline-block; margin-right: 6px; box-shadow: 0 0 8px #ef4444; }
                @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { transform: scale(0.95); } }
            `}</style>

            <div className="min-h-screen bg-[#0f172a] font-['Outfit'] pb-[140px] md:pb-40">
                {/* 🚀 HEADER WAR MODE (RED-ORANGE) */}
                <div className="p-8 pb-20 text-white shadow-2xl relative overflow-hidden rounded-b-[45px] border-b border-red-500/20" style={{background: 'linear-gradient(135deg, #991b1b 0%, #ea580c 100%)'}}>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white w-8 h-8 flex items-center justify-center bg-black/30 rounded-full backdrop-blur-md transition-transform hover:-translate-x-1 border border-white/10"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <div>
                            <h5 className="font-black text-xl tracking-tight m-0 text-center uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] italic text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">🔥 WAR XLA</h5>
                            <div className="flex items-center justify-center text-[10px] font-black mt-1.5 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full w-max mx-auto border border-red-500/30 backdrop-blur-sm shadow-inner text-red-100">
                                <div className="pulse-dot"></div> Live Antrean: {total_antri || 0}
                            </div>
                        </div>
                        <div className="w-8"></div>
                    </div>
                    <i className="fa-solid fa-fire-flame-curved absolute right-2 -bottom-5 text-8xl text-black opacity-20 -rotate-12"></i>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-12 relative z-20">
                    <form onSubmit={submitOrder} className="space-y-5">
                        {/* 🎯 KOTAK INPUT TARGET */}
                        <div className="bg-[#1e293b] rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-slate-700 relative overflow-hidden focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/20 transition-all">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Tembakan</label>
                                <button type="button" onClick={() => setData({ ...data, no_hp: '', is_multi: !data.is_multi })} className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/30 uppercase transition hover:bg-orange-500/20 active:scale-95 shadow-sm">
                                    <i className={`fa-solid ${data.is_multi ? 'fa-user' : 'fa-users'} mr-1`}></i> {data.is_multi ? 'Single Mode' : 'Brutal Mode'}
                                </button>
                            </div>
                            <div className={`border-b-2 border-slate-700 flex items-center gap-3 focus-within:border-orange-500 transition-all pb-2 relative z-10 ${data.is_multi ? 'items-start pt-2 border-none' : ''}`}>
                                {data.is_multi ? (
                                    <div className="relative w-full">
                                        <textarea
                                            value={data.no_hp} onChange={e => setData('no_hp', e.target.value)} rows="4"
                                            className="w-full border border-slate-600 bg-[#0f172a] rounded-2xl p-4 font-mono text-sm font-bold text-orange-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none placeholder-slate-600 dark-scrollbar shadow-inner"
                                            placeholder="0819xxxxxxxx&#10;0838xxxxxxxx&#10;(Satu baris satu target)"
                                        ></textarea>
                                        <span className="absolute bottom-3 right-3 bg-slate-800 text-orange-500 text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm border border-slate-600 backdrop-blur-md">{count} Target Valid</span>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="tel" className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-white p-0 tracking-wider placeholder-slate-600"
                                            placeholder="0819xxx..." value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value.replace(/\D/g, ''))} maxLength="14"
                                        />
                                        <button type="button" onClick={handleContactPicker} className="w-12 h-12 bg-slate-800 text-orange-500 rounded-[16px] flex items-center justify-center shrink-0 hover:bg-slate-700 border border-slate-600 transition-all shadow-sm active:scale-95"><i className="fa-solid fa-address-book text-xl"></i></button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 📦 GUDANG SENJATA (PRODUK) */}
                        <div className="flex justify-between items-center mb-1 px-2">
                            <h6 className="font-black text-slate-300 m-0 text-sm tracking-tight flex items-center gap-2"><div className="bg-slate-800 text-orange-500 w-7 h-7 rounded-full flex justify-center items-center text-[10px] border border-slate-700"><i className="fa-solid fa-box-open"></i></div> Senjata War</h6>
                            <i className="fa-solid fa-gun text-slate-600"></i>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {products.length === 0 ? (
                                <div className="text-center py-10 bg-[#1e293b] rounded-[24px] border border-slate-700 font-bold text-slate-500 shadow-sm flex flex-col items-center">
                                    <i className="fa-solid fa-box-open text-4xl mb-3 opacity-30 text-slate-400"></i> Amunisi Kosong.
                                </div>
                            ) : (
                                products.map((p) => {
                                    const isSelected = selectedProduct === p.kode_layanan;
                                    const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));
                                    
                                    return (
                                        <div key={p.kode_layanan} onClick={() => { setSelectedProduct(p.kode_layanan); setData('kode_produk', p.kode_layanan); }} className={`relative overflow-hidden rounded-[24px] transition-all duration-300 border-2 bg-[#1e293b] cursor-pointer flex flex-col justify-between ${isSelected ? 'border-orange-500 shadow-[0_10px_25px_rgba(234,88,12,0.2)] scale-[1.02] z-10 ring-2 ring-orange-500/20' : 'border-slate-700 shadow-sm hover:border-slate-500 hover:-translate-y-1'}`}>
                                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl shadow-md tracking-widest z-20">
                                                DISKON 5%
                                            </div>
                                            <div className="p-5 pt-6 flex justify-between items-center">
                                                <div className="w-2/3 pr-2">
                                                    <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm border w-max mb-2.5 ${isSelected ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' : 'text-slate-400 bg-slate-800 border-slate-700'}`}>{p.kode_layanan}</div>
                                                    <div className={`font-black text-sm leading-snug tracking-tight ${isSelected ? 'text-orange-500' : 'text-slate-200'}`}>
                                                        {p.nama_layanan}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col justify-end">
                                                    <div className="text-[10px] text-slate-500 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>
                                                    <div className={`text-[17px] font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        Rp {formatRp(p.harga_jual)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </form>
                </div>

                {/* 💳 BOTTOM PAYMENT BAR WAR MODE */}
                {selectedProduct && count > 0 && (
                    <div className="fixed bottom-[90px] md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5">
                        <div className="bg-slate-900 rounded-[32px] p-2 pl-6 pr-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-between items-center border border-slate-700 backdrop-blur-xl">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Eksekusi {count > 1 ? `(${count} Target)` : ''}</p>
                                <h3 className="text-xl font-black text-white tracking-tight drop-shadow-sm">Rp {formatRp(totalHarga)}</h3>
                            </div>
                            <button onClick={submitOrder} disabled={processing} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-[0_8px_20px_rgba(220,38,38,0.3)] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 border border-red-500/50">
                                {processing ? 'RELOADING...' : 'DOR BRUTAL'} <i className="fa-solid fa-skull text-sm"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
