import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import '../../../css/mila-loading.css';

// 🖼️ KOMPONEN LOGO ANTI-ERROR SULTAN
const ProviderLogo = ({ provName }) => {
    const [hasError, setHasError] = useState(false);
    const name = provName.toLowerCase();
    let logoUrl = null;
    let brandColor = 'text-slate-800';
    if (name.includes('dana')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Dana_logo.png'; brandColor = 'text-blue-500'; }
    else if (name.includes('ovo')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg'; brandColor = 'text-purple-600'; }
    else if (name.includes('gopay') || name.includes('go-pay')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg'; brandColor = 'text-sky-500'; }
    else if (name.includes('shopee') || name.includes('spay')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg'; brandColor = 'text-orange-500'; }
    else if (name.includes('linkaja')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg'; brandColor = 'text-red-600'; }
    else if (name.includes('isaku') || name.includes('i.saku')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/91/I.saku_logo.svg'; brandColor = 'text-blue-700'; }
    else if (name.includes('maxim')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Maxim_logo.svg'; brandColor = 'text-yellow-500'; }
    else if (name.includes('brizzi') || name.includes('bri')) { logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg'; brandColor = 'text-blue-800'; }
    
    if (logoUrl && !hasError) {
        return <img src={logoUrl} alt={provName} onError={() => setHasError(true)} referrerPolicy="no-referrer" className="h-8 w-auto object-contain mix-blend-multiply drop-shadow-sm transition-transform group-hover:scale-110" />;
    }
    return <span className={`font-black uppercase tracking-wider text-xs ${brandColor}`}>{provName}</span>;
};

export default function Ewallet({ auth, groupedProducts, userBalance }) {
    const [phone, setPhone] = useState('');
    const [activeProvider, setActiveProvider] = useState(null);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [showFavModal, setShowFavModal] = useState(false);
    
    // 🚀 FAKE DISCOUNT 5%
    const fakeMarkup = 0.05;

    // 🛡️ BALIK KE LOGIKA ASLI MILASTORE (tujuan & kode_layanan)
    const { transform, post, processing } = useForm({
        tujuan: '',
        kode_layanan: ''
    });

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);
    const formatDisplayPhone = (str) => {
        let val = str.replace(/\D/g, '');
        let matches = val.match(/.{1,4}/g);
        return matches ? matches.join(' ') : val;
    };

    useEffect(() => {
        const savedFavs = JSON.parse(localStorage.getItem('amifi_ewallet_favs')) || [];
        setFavorites(savedFavs);
    }, []);

    const providers = Object.keys(groupedProducts || {});
    let activeProducts = activeProvider ? (groupedProducts[activeProvider] || []) : [];
    if (search) {
        activeProducts = activeProducts.filter(p => p.nama_layanan.toLowerCase().includes(search.toLowerCase()) || p.harga_jual.toString().includes(search));
    }

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

    const handleSaveFav = () => {
        if(phone.length < 10) return Swal.fire({icon: 'warning', title: 'Oops', text: 'Nomor HP minimal 10 digit.', confirmButtonColor: '#0ea5e9'});
        Swal.fire({
            title: 'Simpan Favorit', input: 'text', inputPlaceholder: 'Nama Kontak',
            showCancelButton: true, confirmButtonText: 'Simpan', confirmButtonColor: '#0ea5e9',
            customClass: { popup: 'rounded-[24px]' }
        }).then(res => {
            if(res.isConfirmed && res.value) {
                const newFavs = [...favorites, { id: Date.now(), name: res.value, no: phone, prov: activeProvider || 'E-Wallet' }];
                setFavorites(newFavs); localStorage.setItem('amifi_ewallet_favs', JSON.stringify(newFavs));
                Swal.fire({ icon: 'success', title: 'Tersimpan!', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleOrder = () => {
        const cleanPhone = phone.replace(/\D/g, '');
        if(!selected || cleanPhone.length < 9) return;
        if (Number(userBalance) < Number(selected.harga_jual)) {
            return Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: 'Top up dulu Sultan!', confirmButtonColor: '#0ea5e9', customClass: { popup: 'rounded-[24px]' } });
        }

        const hargaCoret = Math.round(selected.harga_jual * (1 + fakeMarkup));

        Swal.fire({
            title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2 uppercase">Konfirmasi Pembayaran</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-mobile-screen text-sky-500"></i> No. Tujuan</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${cleanPhone}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-wallet text-sky-500"></i> Layanan</span>
                        <span class="text-[13px] font-black text-sky-600 text-right w-1/2 leading-tight">${selected.nama_layanan}</span>
                    </div>
                    <div class="bg-gradient-to-br from-sky-50 to-cyan-50 p-5 rounded-[24px] border border-sky-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-sky-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-sky-700 uppercase tracking-widest relative z-10">Total Bayar</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-sky-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(hargaCoret)}</span>
                            <span class="text-2xl font-black text-sky-700 tracking-tight">Rp ${formatRp(selected.harga_jual)}</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'BATAL', confirmButtonText: '<i class="fa-solid fa-fingerprint mr-2"></i> BAYAR SEKARANG',
            buttonsStyling: false, reverseButtons: true,
            customClass: {
                confirmButton: 'w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-lg text-xs tracking-widest uppercase transform active:scale-95',
                cancelButton: 'w-full bg-transparent text-slate-500 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-200 tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm border border-slate-100 shadow-2xl'
            }
        }).then((res) => {
            if (res.isConfirmed) {
                localStorage.setItem('last_ewallet_trx', JSON.stringify({ number: cleanPhone, provider: activeProvider, time: new Date().getTime() }));
                
                // 🛡️ FIX: GUNAKAN NAMA VARIABEL ASLI MILASTORE
                transform((data) => ({ ...data, tujuan: cleanPhone, kode_layanan: selected.kode_layanan }));
                
                // 🚀 PROSES & REDIRECT OTOMATIS
                post(route('order.ewallet.store'), {
                    preserveScroll: true,
                    onStart: () => {
                        Swal.fire({
                            title: '<div class="text-xl font-black text-slate-800 mt-2">Memproses Saldo...</div>',
                            html: '<div class="mt-6 flex flex-col items-center"><div class="relative w-16 h-16"><div class="absolute inset-0 border-4 border-slate-100 rounded-full"></div><div class="absolute inset-0 border-4 border-sky-500 rounded-full animate-spin border-t-transparent"></div></div><p class="text-[10px] font-black text-slate-400 mt-6 tracking-widest uppercase animate-pulse">Menghubungi Server</p></div>',
                            allowOutsideClick: false, showConfirmButton: false, customClass: { popup: 'rounded-[32px] p-8' }
                        });
                    },
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success', title: '<div class="text-xl font-black text-slate-800 mt-2">Berhasil!</div>',
                            html: '<p class="text-xs font-bold text-slate-500 mt-1">Mengarahkan ke Riwayat...</p>',
                            timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-[32px] p-6 shadow-2xl' }
                        }).then(() => router.visit('/riwayat'));
                    },
                    onError: (err) => {
                        Swal.fire({ icon: 'error', title: 'Gagal', text: Object.values(err)[0] || 'Terjadi kesalahan.', confirmButtonColor: '#0ea5e9', customClass: { popup: 'rounded-[24px]' } });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Topup E-Wallet - MilaStore" />
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40">
                {/* 🚀 HEADER GRADIENT */}
                <div className="p-8 pb-20 text-white shadow-xl relative overflow-hidden rounded-b-[45px]" style={{background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)'}}>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <div className="text-center">
                            <h1 className="text-xl font-black tracking-tight m-0 uppercase">Top Up E-Wallet</h1>
                            <div className="mt-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">Saldo: Rp {formatRp(userBalance)}</div>
                        </div>
                        <div className="w-8"></div>
                    </div>
                    <i className="fa-solid fa-wallet absolute right-5 -bottom-5 text-8xl text-white opacity-10 -rotate-12"></i>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-12 relative z-20">
                    {/* INPUT HP */}
                    <div className="bg-white rounded-[28px] p-5 shadow-xl border border-slate-50 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Tujuan / Akun</label>
                            {activeProvider && <span className="bg-sky-50 text-sky-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-sky-100 animate-in zoom-in">{activeProvider}</span>}
                        </div>
                        <div className="flex items-center border-b-2 border-slate-100 focus-within:border-sky-500 transition-all pb-2 gap-3">
                            <input type="tel" className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0" placeholder="0812xxxx" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength="16" />
                            <button onClick={handleContactPicker} className="w-12 h-12 bg-sky-50 text-sky-500 rounded-[16px] flex items-center justify-center shadow-sm active:scale-95 transition-transform"><i className="fa-solid fa-address-book text-xl"></i></button>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={handleSaveFav} disabled={phone.length < 10} className="text-[10px] font-black uppercase text-slate-400 hover:text-sky-500 disabled:opacity-50"><i className="fa-regular fa-bookmark mr-1.5"></i> Simpan</button>
                            <button onClick={() => setShowFavModal(true)} className="text-[10px] font-black uppercase text-sky-500 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"><i className="fa-solid fa-list-ul mr-1.5"></i> Favorit</button>
                        </div>
                    </div>

                    {!activeProvider ? (
                        <div className="animate-in fade-in">
                            <h6 className="font-black text-slate-700 mb-4 ml-1 flex items-center gap-2"><div className="bg-sky-100 text-sky-600 w-7 h-7 rounded-full flex justify-center items-center text-[10px]"><i className="fa-solid fa-layer-group"></i></div> Pilih Aplikasi</h6>
                            <div className="grid grid-cols-2 gap-3">
                                {providers.map(prov => (
                                    <div key={prov} onClick={() => setActiveProvider(prov)} className="bg-white p-4 h-[90px] rounded-[24px] border-2 border-slate-100 shadow-sm hover:border-sky-400 cursor-pointer flex flex-col items-center justify-center transition-all group">
                                        <ProviderLogo provName={prov} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4">
                            <div className="flex justify-between items-center mb-5 gap-3">
                                <button onClick={() => {setActiveProvider(null); setSelected(null);}} className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-sky-50 shadow-sm shrink-0"><i className="fa-solid fa-arrow-left"></i></button>
                                <div className="relative flex-1">
                                    <input type="text" placeholder="Cari Nominal..." className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-4 pl-10 font-bold text-xs focus:border-sky-500 focus:ring-0 shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                                    <i className="fa-solid fa-search absolute left-4 top-3 text-sky-400 text-xs"></i>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {activeProducts.map((p) => {
                                    const isSelected = selected?.kode_layanan === p.kode_layanan;
                                    const nominalMatch = p.nama_layanan.match(/\d[0-9.,]*/);
                                    const nominalAngka = nominalMatch ? nominalMatch[0] : '';
                                    const displayTitle = nominalAngka.length > 2 ? nominalAngka : p.nama_layanan.replace(new RegExp(activeProvider, 'i'), '').trim();
                                    const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));
                                    return (
                                        <div key={p.kode_layanan} onClick={() => setSelected(p)} className={`relative p-5 rounded-[24px] transition-all cursor-pointer border-2 flex flex-col justify-between h-[110px] overflow-hidden ${isSelected ? 'bg-sky-50 border-sky-500 shadow-lg scale-[1.02] z-10' : 'bg-white border-slate-100 shadow-sm hover:border-sky-300'}`}>
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm">DISKON 5%</div>
                                            <div>
                                                <div className={`text-[8px] font-black uppercase mb-1 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`}>SALDO</div>
                                                <div className="text-[20px] font-black text-slate-800 tracking-tighter leading-none truncate">{displayTitle}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] text-slate-400 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>
                                                <div className={`font-black text-[14px] ${isSelected ? 'text-sky-600' : 'text-slate-600'}`}>Rp {formatRp(p.harga_jual)}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {selected && phone.length >= 9 && (
                    <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center shadow-2xl z-[50] animate-in slide-in-from-bottom rounded-t-[35px]">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Total Bayar</p>
                            <h3 className="text-2xl font-black text-sky-600 tracking-tighter">Rp {formatRp(selected.harga_jual)}</h3>
                        </div>
                        <button onClick={handleOrder} disabled={processing} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-8 py-3.5 rounded-[16px] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50">BAYAR SEKARANG</button>
                    </div>
                )}

                {showFavModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-5 animate-in fade-in">
                        <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl max-h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-black text-slate-800 text-lg m-0 flex items-center gap-2"><i className="fa-solid fa-heart text-sky-500"></i>Nomor Favorit</h4>
                                <button onClick={() => setShowFavModal(false)} className="w-8 h-8 bg-slate-100 rounded-full text-slate-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 pb-4">
                                {favorites.length === 0 ? (
                                    <div className="text-center py-12 opacity-60"><p className="font-black text-[11px] uppercase text-slate-500">Belum ada nomor tersimpan.</p></div>
                                ) : (
                                    <div className="grid gap-3">
                                        {favorites.map((fav) => (
                                            <div key={fav.id} className="flex justify-between items-center p-4 border-2 border-slate-100 rounded-[20px] bg-white group cursor-pointer" onClick={() => { setPhone(fav.no); if(fav.prov !== 'E-Wallet') setActiveProvider(fav.prov); setShowFavModal(false); }}>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="font-black text-slate-800 text-sm">{fav.name}</div>
                                                    <div className="font-mono text-sky-600 font-bold text-xs mt-1">{formatDisplayPhone(fav.no)} <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] uppercase ml-1">{fav.prov}</span></div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelFav(fav.id); }} className="w-9 h-9 rounded-full bg-slate-50 border text-slate-400 hover:text-red-500 shadow-sm"><i className="fa-regular fa-trash-can"></i></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
