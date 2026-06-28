import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../../css/mila-loading.css';

// 🖼️ KOMPONEN LOGO PASCABAYAR OTOMATIS
const ProviderLogo = ({ provName }) => {
    const [hasError, setHasError] = useState(false);
    const name = provName.toLowerCase();
    
    let logoUrl = null;
    let iconClass = null;
    let colorClass = 'text-emerald-500';

    if (name.includes('indosat') || name.includes('im3')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Indosat_Ooredoo_Hutchison_logo_%282022%29.svg/512px-Indosat_Ooredoo_Hutchison_logo_%282022%29.svg.png';
    else if (name.includes('telkomsel') || name.includes('omni')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Telkomsel_2021_icon.svg/512px-Telkomsel_2021_icon.svg.png';
    else if (name.includes('pln') || name.includes('listrik')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Logo_PLN.svg/512px-Logo_PLN.svg.png';
    else if (name.includes('bpjs')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/BPJS_Kesehatan_logo.svg/512px-BPJS_Kesehatan_logo.svg.png';
    else if (name.includes('indihome') || name.includes('telkom')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/IndiHome_logo.svg/512px-IndiHome_logo.svg.png';
    else if (name.includes('pdam') || name.includes('air')) { iconClass = 'fa-faucet-drip'; colorClass = 'text-sky-500'; }
    else if (name.includes('pgn') || name.includes('gas')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/PGN_logo.svg/512px-PGN_logo.svg.png';
    else if (name.includes('finance') || name.includes('angsuran') || name.includes('kredit') || name.includes('fif') || name.includes('adira')) { iconClass = 'fa-file-invoice-dollar'; colorClass = 'text-amber-500'; }
    else if (name.includes('xl') || name.includes('axis')) logoUrl = 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/XL_Axiata_logo_2016.svg/512px-XL_Axiata_logo_2016.svg.png';
    else if (name.includes('tri') || name.includes('three')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Three_logo.svg/512px-Three_logo.svg.png';
    else if (name.includes('smartfren')) logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Smartfren_Logo_%282019%29.svg/512px-Smartfren_Logo_%282019%29.svg.png';

    if (logoUrl && !hasError) {
        return <img src={logoUrl} alt={provName} onError={() => setHasError(true)} referrerPolicy="no-referrer" className="h-8 w-auto max-w-[60px] object-contain drop-shadow-sm transition-all group-hover:scale-110" />;
    }
    
    if (iconClass) {
        return <i className={`fa-solid ${iconClass} text-3xl ${colorClass} transition-all group-hover:scale-110 drop-shadow-sm`}></i>;
    }

    return <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors"><i className="fa-solid fa-file-invoice text-slate-400 group-hover:text-emerald-500 text-lg"></i></div>;
};

export default function Pascabayar({ auth, products = [], userBalance }) {
    const [phone, setPhone] = useState('');
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    
    const [isLoadingInq, setIsLoadingInq] = useState(false);
    const [billData, setBillData] = useState(null); 
    const [selectedPromo, setSelectedPromo] = useState(null);

    const { post, processing } = useForm({});
    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);

    // 🔍 FITUR PENCARIAN
    const filteredProducts = products.filter(p => 
        p.nama_layanan.toLowerCase().includes(search.toLowerCase()) || 
        p.kode_layanan.toLowerCase().includes(search.toLowerCase())
    );

    const handleCekTagihan = async () => {
        if (!selected || phone.length < 5) return;
        setIsLoadingInq(true);
        
        try {
            const res = await axios.post(route('order.pascabayar.inquiry'), {
                tujuan: phone,
                kode_layanan: selected.kode_layanan
            });
            
            if (res.data.success) {
                setBillData({
                    ...res.data.data,
                    ref_id: res.data.ref_id
                });
                setSelectedPromo(null);
            } else {
                Swal.fire({ icon: 'info', title: 'Informasi', text: res.data.message, confirmButtonColor: '#10b981' });
            }
        } catch (error) {
            Swal.fire('Error', 'Terjadi kesalahan koneksi', 'error');
        } finally {
            setIsLoadingInq(false);
        }
    };

    const handleBayar = () => {
        if (!billData) return;
        
        const isOmni = Array.isArray(billData.desc?.detail);
        if (isOmni && !selectedPromo) {
            return Swal.fire('Perhatian', 'Silakan pilih salah satu promo terlebih dahulu!', 'warning');
        }

        const finalPrice = isOmni ? selectedPromo.harga : billData.selling_price;

        if (userBalance < finalPrice) {
            return Swal.fire('Oops', 'Saldo Anda tidak mencukupi.', 'error');
        }

        post(route('order.pascabayar.pay', {
            tujuan: billData.customer_no,
            kode_layanan: billData.buyer_sku_code, 
            ref_id: billData.ref_id,
            harga: finalPrice,
            kodebayar_code: isOmni ? selectedPromo.kode_promo : null 
        }), { preserveScroll: true, onSuccess: () => setBillData(null) });
    };

    const isOmniResponse = billData && Array.isArray(billData.desc?.detail);

    // 🏷️ LABEL DINAMIS
    const getInputLabel = () => {
        if (!selected) return 'Nomor HP / ID Pelanggan';
        const name = selected.nama_layanan.toLowerCase();
        if (name.includes('indosat') || name.includes('telkomsel') || name.includes('xl') || name.includes('tri') || name.includes('smartfren')) return 'Masukkan Nomor HP';
        if (name.includes('pln')) return 'No. Meter / ID Pelanggan PLN';
        if (name.includes('bpjs')) return 'Nomor VA BPJS';
        if (name.includes('pdam')) return 'ID Pelanggan PDAM';
        return 'Nomor Tujuan / ID Pelanggan';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pascabayar & Tagihan - MilaStore" />
            <style>{`.app-header-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 20px 90px 20px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; color: white; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }`}</style>

            {(processing || isLoadingInq) && (
                <div className="mila-loader-overlay z-[9999] bg-white/90 backdrop-blur-md">
                    <div className="loading-content">
                        <div className="spinner-wrapper">
                            <div className="ms-ring-bg"></div>
                            <div className="ms-ring" style={{borderTopColor: '#10b981', borderLeftColor: '#059669'}}></div>
                            <div className="ms-logo" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text'}}><i className="fa-solid fa-file-invoice-dollar"></i></div>
                        </div>
                        <div className="text-emerald-600 font-black tracking-widest mt-4 animate-pulse uppercase text-xs">
                            {isLoadingInq ? 'Mengecek Server...' : 'Memproses Pembayaran...'}
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40">
                
                {/* 🌈 HEADER SULTAN */}
                <div className="app-header-green shadow-xl shadow-emerald-200/50 relative overflow-hidden">
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white hover:-translate-x-1 transition-transform">
                            <i className="fa-solid fa-arrow-left-long text-xl"></i>
                        </Link>
                        <h5 className="font-black text-xl tracking-tight m-0 text-center">Pascabayar & Tagihan</h5>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 font-black text-xs shadow-inner">
                            Rp {formatRp(userBalance)}
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-16 relative z-20">
                    
                    {/* 📱 KARTU PILIH PRODUK & INPUT */}
                    <div className="bg-white rounded-[32px] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-6">
                        
                        {!selected ? (
                            <div className="animate-in fade-in">
                                <h6 className="font-black text-slate-700 mb-4 tracking-tight flex items-center gap-2">
                                    <div className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex justify-center items-center"><i className="fa-solid fa-file-invoice"></i></div>
                                    Pilih Layanan Tagihan
                                </h6>

                                {/* SEARCH BAR */}
                                <div className="relative mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Cari PLN, PDAM, Indosat..." 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pl-12 font-bold text-sm text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <i className="fa-solid fa-search absolute left-4 top-3.5 text-slate-400"></i>
                                </div>

                                {/* DAFTAR PRODUK DENGAN LOGO */}
                                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-2 text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs">Produk tidak ditemukan.</div>
                                    ) : filteredProducts.map(p => (
                                        <div key={p.kode_layanan} onClick={() => setSelected(p)} className="bg-white p-4 rounded-[20px] border-2 border-slate-100 shadow-sm hover:border-emerald-400 hover:shadow-emerald-100/50 cursor-pointer flex flex-col items-center text-center transition-all hover:-translate-y-1 group relative">
                                            <div className="h-[50px] flex items-center justify-center w-full mb-3">
                                                <ProviderLogo provName={p.nama_layanan} />
                                            </div>
                                            <div className="font-black text-xs text-slate-800 leading-snug line-clamp-2 w-full">{p.nama_layanan}</div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <i className="fa-solid fa-circle-check text-emerald-500"></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right-4">
                                {/* HEADER TERPILIH */}
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => {setSelected(null); setPhone('');}} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                            <i className="fa-solid fa-arrow-left text-xs"></i>
                                        </button>
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <ProviderLogo provName={selected.nama_layanan} />
                                            <h6 className="font-black text-slate-800 m-0 uppercase tracking-tight text-xs leading-tight line-clamp-2">{selected.nama_layanan}</h6>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100 shrink-0">
                                        Inquiry
                                    </span>
                                </div>

                                {/* INPUT NOMOR */}
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{getInputLabel()}</label>
                                <div className="border-2 border-slate-100 rounded-2xl p-2 pl-4 flex items-center bg-slate-50 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 mb-2 transition-all">
                                    <input
                                        type="tel"
                                        className="w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0 tracking-wider placeholder-slate-300"
                                        placeholder="08xxx / 1234xxx"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button onClick={() => setPhone('')} className={`w-8 h-8 text-slate-300 hover:text-rose-500 transition-colors ${phone.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                                        <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* TOMBOL CEK TAGIHAN */}
                    {selected && phone.length >= 5 && !billData && (
                        <button onClick={handleCekTagihan} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-[24px] font-black text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all uppercase tracking-widest flex justify-center items-center gap-2 animate-in slide-in-from-bottom-5">
                            Cek Tagihan / Promo <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    )}
                </div>

                {/* 🧾 MODAL HASIL INQUIRY & PROMO OMNI */}
                {billData && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-5 animate-in fade-in">
                        <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom pb-8 max-h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center mb-5 border-b border-dashed border-slate-200 pb-4 shrink-0">
                                <h4 className="font-black text-slate-800 text-lg m-0 flex items-center gap-2">
                                    <i className="fa-solid fa-file-invoice text-emerald-500"></i> {isOmniResponse ? 'Pilih Paket Spesial' : 'Rincian Tagihan'}
                                </h4>
                                <button onClick={() => setBillData(null)} className="w-8 h-8 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            
                            <div className="space-y-4 mb-6 bg-slate-50 p-5 rounded-2xl overflow-y-auto custom-scrollbar pr-2 flex-1">
                                <div className="flex flex-col gap-1 mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan / Nama</span>
                                    <span className="text-base font-black text-slate-800 leading-tight">
                                        {billData.customer_name && billData.customer_name !== '-' ? billData.customer_name : billData.customer_no}
                                    </span>
                                </div>

                                {isOmniResponse ? (
                                    <div className="mt-4 border-t border-slate-200 pt-4">
                                        <div className="space-y-3">
                                            {billData.desc.detail.map((promo, idx) => {
                                                const isSelectedPromo = selectedPromo?.kode_promo === promo.kode_promo;
                                                return (
                                                    <label key={idx} className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelectedPromo ? 'border-emerald-500 bg-white shadow-lg shadow-emerald-500/10 scale-[1.02] ring-4 ring-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelectedPromo ? 'border-emerald-500' : 'border-slate-300'}`}>
                                                                {isSelectedPromo && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className={`text-sm font-black leading-snug block mb-1.5 ${isSelectedPromo ? 'text-emerald-700' : 'text-slate-700'}`}>{promo.nama_promo}</span>
                                                                <span className={`text-xs font-black inline-block px-2.5 py-1 rounded-lg ${isSelectedPromo ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-500 bg-slate-100'}`}>
                                                                    Rp {formatRp(promo.harga)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1 border-t border-slate-200 pt-4 mt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keterangan Tagihan</span>
                                        <span className="text-sm font-bold text-slate-700 whitespace-pre-wrap leading-relaxed">{billData.desc?.detail || billData.desc || 'Tidak ada rincian tambahan.'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="shrink-0 border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl mb-4 border border-emerald-100">
                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Total Pembayaran</span>
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter drop-shadow-sm">
                                        Rp {formatRp(isOmniResponse ? (selectedPromo?.harga || 0) : billData.selling_price)}
                                    </span>
                                </div>

                                <button onClick={handleBayar} disabled={isOmniResponse && !selectedPromo} className="w-full bg-slate-900 text-white py-4 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2">
                                    Bayar Tagihan <i className="fa-solid fa-check-circle"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
