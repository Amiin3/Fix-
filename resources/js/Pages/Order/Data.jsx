import React, { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import '@/../../resources/css/mila-loading.css';

// 🎨 KOMPONEN BADGE OPERATOR
const ProviderBadge = ({ provider }) => {
    if (!provider) return null;
    const colors = {
        'TELKOMSEL': 'bg-red-50 text-red-600 border-red-200',
        'INDOSAT': 'bg-yellow-50 text-yellow-600 border-yellow-200',
        'XL': 'bg-blue-50 text-blue-600 border-blue-200',
        'AXIS': 'bg-purple-50 text-purple-600 border-purple-200',
        'TRI': 'bg-slate-800 text-white border-slate-600',
        'SMARTFREN': 'bg-pink-50 text-pink-600 border-pink-200'
    };
    const c = colors[provider] || 'bg-indigo-50 text-indigo-600 border-indigo-200';
    return <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm animate-in zoom-in ${c}`}>{provider}</span>;
};

export default function Data({ auth, groupedProducts, userBalance }) {
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState(null);
    const [selected, setSelected] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Semua');
    
    // 🚀 FAKE DISCOUNT 5%
    const fakeMarkup = 0.05;

    const { transform, post, processing } = useForm({ tujuan: '', kode_layanan: '' });

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);

    // 📡 RADAR PROVIDER OTOMATIS
    useEffect(() => {
        const prefix = phone.substring(0, 4);
        if (phone.length >= 4) {
            if (['0811','0812','0813','0821','0822','0823','0851','0852','0853'].includes(prefix)) setProvider('TELKOMSEL');
            else if (['0814','0815','0816','0855','0856','0857','0858'].includes(prefix)) setProvider('INDOSAT');
            else if (['0817','0818','0819','0859','0877','0878','0879'].includes(prefix)) setProvider('XL');
            else if (['0831','0832','0833','0838'].includes(prefix)) setProvider('AXIS');
            else if (['0895','0896','0897','0898','0899'].includes(prefix)) setProvider('TRI');
            else if (['0881','0882','0883','0884','0885','0886','0887','0888','0889'].includes(prefix)) setProvider('SMARTFREN');
            else setProvider(null);
        } else {
            setProvider(null);
            setSelected(null);
        }
    }, [phone]);

    // 📱 FUNGSI SAKTI: AMBIL DARI KONTAK
    const handleContactPicker = async () => {
        if (window.AndroidBridge && typeof window.AndroidBridge.bukaKontak === 'function') {
            window._contactResolve = (data) => {
                if (data && data.length > 0) {
                    let number = data[0].tel[0].replace(/\D/g, '');
                    if (number.startsWith('62')) number = '0' + number.substring(2);
                    setPhone(number);
                }
            };
            window.AndroidBridge.bukaKontak();
        } else if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const contacts = await navigator.contacts.select(['tel'], { multiple: false });
                if (contacts.length > 0 && contacts[0].tel.length > 0) {
                    let number = contacts[0].tel[0].replace(/\D/g, '');
                    if (number.startsWith('62')) number = '0' + number.substring(2);
                    setPhone(number);
                }
            } catch (ex) {}
        }
    };

    // 🧠 MESIN AI AUTO-GROUPING
    const { categories, productsByCategory } = useMemo(() => {
        if (!provider || !groupedProducts) return { categories: [], productsByCategory: {} };
        const keys = Object.keys(groupedProducts);
        let matchingKey = keys.find(k => k.toLowerCase() === provider.toLowerCase());
        if (!matchingKey) matchingKey = keys.find(k => k.toLowerCase().includes(provider.toLowerCase()));
        
        const activeProducts = matchingKey ? groupedProducts[matchingKey] : [];
        if (activeProducts.length === 0) return { categories: [], productsByCategory: {} };
        
        const groups = { 'Semua': activeProducts };
        const catSet = new Set(['Semua']);
        
        activeProducts.forEach(p => {
            let name = p.nama_layanan;
            const regexJunk = new RegExp(`\\b(${provider}|Telkomsel|Tsel|Indosat|Isat|XL|Axis|Tri|Three|Smartfren|Data|Paket|Internet|Promo|Inject|Voucher|Kuota)\\b`, 'gi');
            name = name.replace(regexJunk, '').trim();
            const match = name.match(/^([a-zA-Z\s\-]+)/);
            let categoryName = match ? match[1].trim() : 'Reguler';
            
            if (categoryName.length < 3 || categoryName.toLowerCase() === 'hari' || categoryName.toLowerCase() === 'bulan') {
                categoryName = 'Reguler';
            } else {
                categoryName = categoryName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            }
            
            if (!groups[categoryName]) groups[categoryName] = [];
            groups[categoryName].push(p);
            catSet.add(categoryName);
        });
        
        return {
            categories: Array.from(catSet).sort((a, b) => a === 'Semua' ? -1 : b === 'Semua' ? 1 : a.localeCompare(b)),
            productsByCategory: groups
        };
    }, [provider, groupedProducts]);

    // 🛡️ ANTI DOUBLE TRANSFER
    const checkCooldown = (targetNumber) => {
        const lastTrx = JSON.parse(localStorage.getItem('last_data_trx'));
        if (lastTrx && lastTrx.number === targetNumber) {
            const diff = new Date().getTime() - lastTrx.time;
            if (diff < 5 * 60 * 1000) {
                const timeLeft = Math.ceil((5 * 60 * 1000 - diff) / 1000 / 60);
                Swal.fire({ icon: 'warning', title: 'Transaksi Ditahan!', text: `Tunggu ${timeLeft} menit lagi untuk mencegah double transfer!`, confirmButtonColor: '#6366f1', customClass: {popup: 'rounded-[24px]'} });
                return false;
            }
        }
        return true;
    };

    // 🚀 TRANSAKSI MODERN
    const handleOrder = () => {
        const cleanPhone = phone.replace(/\D/g, '');
        if(!selected || cleanPhone.length < 10) return;
        if (Number(userBalance) < Number(selected.harga_jual)) return Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: 'Top up dompet dulu Sultan!', confirmButtonColor: '#6366f1', customClass: {popup: 'rounded-[24px]'} });
        if (!checkCooldown(cleanPhone)) return;

        const hargaCoret = Math.round(selected.harga_jual * (1 + fakeMarkup));
        let cleanItemName = selected.nama_layanan;
        const regexBrand = new RegExp(`\\b(${provider})\\b`, 'gi');
        cleanItemName = cleanItemName.replace(regexBrand, '').trim();

        Swal.fire({
            title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2 uppercase">Konfirmasi Pembelian</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-mobile-screen text-indigo-500"></i> No. Tujuan</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${cleanPhone}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-wifi text-indigo-500"></i> Paket</span>
                        <span class="text-[12px] font-black text-indigo-600 text-right w-1/2 leading-tight">${cleanItemName}</span>
                    </div>
                    <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-[24px] border border-indigo-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-indigo-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-indigo-700 uppercase tracking-widest relative z-10">Total Bayar</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-indigo-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(hargaCoret)}</span>
                            <span class="text-2xl font-black text-indigo-700 tracking-tight">Rp ${formatRp(selected.harga_jual)}</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'BATALKAN', confirmButtonText: '<i class="fa-solid fa-fingerprint mr-2"></i> BAYAR SEKARANG',
            buttonsStyling: false, reverseButtons: true,
            customClass: {
                confirmButton: 'w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] text-xs tracking-widest uppercase transform active:scale-95',
                cancelButton: 'w-full bg-transparent hover:bg-slate-50 text-slate-500 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-200 tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm border border-slate-100 shadow-2xl'
            }
        }).then((res) => {
            if (res.isConfirmed) {
                localStorage.setItem('last_data_trx', JSON.stringify({ number: cleanPhone, time: new Date().getTime() }));
                transform((data) => ({ ...data, tujuan: cleanPhone, kode_layanan: selected.kode_layanan }));
                
                post(route('order.data.store'), {
                    preserveScroll: true,
                    onStart: () => {
                        Swal.fire({
                            title: '<div class="text-xl font-black text-slate-800 mt-2">Menyuntikkan Paket...</div>',
                            html: `
                                <div class="mt-6 mb-2 flex flex-col items-center justify-center">
                                    <div class="relative w-20 h-20">
                                        <div class="absolute inset-0 border-4 border-slate-100 rounded-full shadow-inner"></div>
                                        <div class="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                        <div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-wifi text-purple-500 text-xl animate-pulse"></i></div>
                                    </div>
                                    <p class="text-[11px] font-black text-slate-400 mt-8 tracking-[0.2em] uppercase animate-pulse">Menghubungi Server</p>
                                </div>
                            `,
                            allowOutsideClick: false, showConfirmButton: false, buttonsStyling: false,
                            customClass: { popup: 'rounded-[32px] p-8 w-full max-w-sm border border-slate-100 shadow-2xl' }
                        });
                    },
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success', title: '<div class="text-xl font-black text-slate-800 mt-2">Paket Meluncur!</div>',
                            html: '<p class="text-xs font-bold text-slate-500 mt-1">Mengarahkan ke Riwayat...</p>',
                            timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[32px] p-6 shadow-2xl' }
                        }).then(() => router.visit('/riwayat'));
                    },
                    onError: (err) => {
                        Swal.fire({ icon: 'error', title: 'Gagal', text: Object.values(err)[0] || 'Terjadi kesalahan sistem.', confirmButtonColor: '#6366f1', customClass: { popup: 'rounded-[24px]' } });
                    }
                });
            }
        });
    };

    const currentViewProducts = productsByCategory[activeCategory] || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Paket Data - MilaStore" />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-[140px] md:pb-40">
                {/* 🚀 HEADER GRADIENT INDIGO-PURPLE */}
                <div className="p-8 pb-20 text-white shadow-xl relative overflow-hidden rounded-b-[45px]" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)'}}>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md transition-transform hover:-translate-x-1"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <div className="text-center">
                            <h1 className="text-xl font-black tracking-tight m-0 uppercase drop-shadow-md">Paket Data</h1>
                            <div className="mt-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-inner">Saldo: Rp {formatRp(userBalance)}</div>
                        </div>
                        <div className="w-8"></div>
                    </div>
                    <i className="fa-solid fa-satellite-dish absolute right-5 -bottom-5 text-8xl text-white opacity-10 -rotate-12"></i>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-12 relative z-20">
                    {/* INPUT HP */}
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-5 relative overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor HP Tujuan</label>
                            <ProviderBadge provider={provider} />
                        </div>
                        <div className="flex items-center border-b-2 border-slate-100 pb-2 gap-3 relative z-10">
                            <input
                                type="tel"
                                className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0 tracking-wider placeholder-slate-300"
                                placeholder="0812xxxx" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength="15"
                            />
                            {phone.length >= 10 && <i className="fa-solid fa-check-circle absolute right-14 top-2 text-indigo-500 text-lg animate-in zoom-in"></i>}
                            <button onClick={handleContactPicker} className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-[16px] flex items-center justify-center shadow-sm active:scale-95 transition-transform"><i className="fa-solid fa-address-book text-xl"></i></button>
                        </div>
                    </div>

                    {/* 🗂️ TAB KATEGORI SCROLL */}
                    {categories.length > 1 && (
                        <div className="flex overflow-x-auto gap-2.5 mb-5 no-scrollbar pb-2 snap-x px-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setActiveCategory(cat); setSelected(null); }}
                                    className={`snap-center shrink-0 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${activeCategory === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_8px_15px_rgba(79,70,229,0.3)]' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* LIST PRODUK */}
                    <div className="grid grid-cols-1 gap-3">
                        {phone.length < 4 ? (
                            <div className="text-center py-12 opacity-60 bg-white/50 backdrop-blur-sm rounded-[32px] border-2 border-dashed border-slate-200 mt-2 shadow-sm animate-in fade-in">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"><i className="fa-solid fa-keyboard"></i></div>
                                <p className="font-bold text-[11px] uppercase tracking-widest text-slate-500">Ketik nomor (08xx)<br/>untuk memunculkan paket.</p>
                            </div>
                        ) : currentViewProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-[32px] border border-slate-100 shadow-sm animate-in zoom-in">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"><i className="fa-solid fa-box-open"></i></div>
                                <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Paket Kosong.</p>
                            </div>
                        ) : (
                            currentViewProducts.map((p) => {
                                const isSelected = selected?.kode_layanan === p.kode_layanan;
                                let displayName = p.nama_layanan;
                                const regexBrand = new RegExp(`\\b(${provider})\\b`, 'gi');
                                displayName = displayName.replace(regexBrand, '').trim();
                                const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));

                                return (
                                    <div key={p.kode_layanan} onClick={() => setSelected(p)} className={`p-5 rounded-[24px] transition-all cursor-pointer relative overflow-hidden border-2 ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-[0_10px_25px_rgba(79,70,229,0.25)] scale-[1.02] z-10 ring-4 ring-indigo-50' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200 hover:-translate-y-1'}`}>
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm tracking-widest">DISKON 5%</div>
                                        <div className="flex justify-between items-start mt-2">
                                            <div className="w-3/4 pr-4">
                                                <div className="text-[8px] font-black text-indigo-400 bg-indigo-100/50 px-2 py-0.5 rounded uppercase tracking-widest mb-2 w-max border border-indigo-100">Kode: {p.kode_layanan}</div>
                                                <div className={`font-black leading-snug text-sm tracking-tight ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>{displayName}</div>
                                            </div>
                                            <div className="text-right flex flex-col justify-end">
                                                <div className="text-[10px] text-slate-400 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>
                                                <div className={`text-[16px] font-black tracking-tight ${isSelected ? 'text-indigo-600' : 'text-indigo-500'}`}>Rp {formatRp(p.harga_jual)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 💳 FLOATING CHECKOUT BAR SULTAN */}
                {selected && phone.length >= 10 && (
                    <div className="fixed bottom-[90px] md:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5">
                        <div className="bg-slate-900 rounded-[32px] p-2 pl-6 pr-2 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex justify-between items-center border border-slate-700/50 backdrop-blur-xl">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Bayar</p>
                                <h3 className="text-xl font-black text-white tracking-tight">Rp {formatRp(selected.harga_jual)}</h3>
                            </div>
                            <button onClick={handleOrder} disabled={processing} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                                {processing ? 'PROSES...' : 'BAYAR'} <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
