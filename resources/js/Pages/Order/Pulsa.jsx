import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import '../../../css/mila-loading.css';

// 🎨 KOMPONEN WARNA BADGE OPERATOR
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
    const c = colors[provider] || 'bg-cyan-50 text-cyan-600 border-cyan-200';
    return <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm animate-in zoom-in ${c}`}>{provider}</span>;
};

export default function Pulsa({ auth, groupedProducts, userBalance }) {
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState(null);
    const [selected, setSelected] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [showFavModal, setShowFavModal] = useState(false);
    
    // 🚀 FAKE DISCOUNT 5%
    const fakeMarkup = 0.05;

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

    // 📡 INIT: Load Data Favorit
    useEffect(() => {
        const savedFavs = JSON.parse(localStorage.getItem('amifi_pulsa_favs')) || [];
        setFavorites(savedFavs);
    }, []);

    // 📡 Radar Pendeteksi Provider (Komplit Se-Indonesia)
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

    const activeProducts = provider && groupedProducts ? (groupedProducts[provider] || groupedProducts[provider.toLowerCase()] || []) : [];

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
        } else {
            Swal.fire({ icon: 'info', title: 'Tidak Didukung', text: 'Gunakan Aplikasi Android MilaStore atau Chrome untuk fitur ini.', confirmButtonColor: '#0ea5e9' });
        }
    };

    // ⭐ FUNGSI SAKTI: SIMPAN & LOAD FAVORIT
    const handleSaveFav = () => {
        if(phone.length < 10) return Swal.fire({icon: 'warning', title: 'Oops', text: 'Nomor HP minimal 10 digit.', confirmButtonColor: '#0ea5e9', customClass: {popup: 'rounded-[24px]'}});
        Swal.fire({
            title: 'Simpan ke Favorit', input: 'text', inputPlaceholder: 'Misal: Nomor Istri',
            showCancelButton: true, confirmButtonText: 'Simpan', cancelButtonText: 'Batal', confirmButtonColor: '#0ea5e9',
            customClass: { popup: 'rounded-[24px]', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
        }).then(res => {
            if(res.isConfirmed && res.value) {
                const newFavs = [...favorites, { id: Date.now(), name: res.value, no: phone }];
                setFavorites(newFavs); localStorage.setItem('amifi_pulsa_favs', JSON.stringify(newFavs));
                Swal.fire({ icon: 'success', title: 'Tersimpan!', timer: 1500, showConfirmButton: false, customClass: {popup: 'rounded-[24px]'} });
            }
        });
    };

    const handleDelFav = (id) => {
        const newFavs = favorites.filter(f => f.id !== id);
        setFavorites(newFavs); localStorage.setItem('amifi_pulsa_favs', JSON.stringify(newFavs));
    };

    // 🛡️ FUNGSI SAKTI: ANTI DOUBLE TRANSFER
    const checkCooldown = (targetNumber) => {
        const lastTrx = JSON.parse(localStorage.getItem('last_pulsa_trx'));
        if (lastTrx && lastTrx.number === targetNumber) {
            const diff = new Date().getTime() - lastTrx.time;
            if (diff < 5 * 60 * 1000) {
                const timeLeft = Math.ceil((5 * 60 * 1000 - diff) / 1000 / 60);
                Swal.fire({ icon: 'warning', title: 'Transaksi Ditahan!', text: `Tunggu ${timeLeft} menit lagi untuk mencegah double transfer!`, confirmButtonColor: '#0ea5e9', customClass: {popup: 'rounded-[24px]'} });
                return false;
            }
        }
        return true;
    };

    // 🚀 FUNGSI TRANSAKSI MODERN + REDIRECT
    const handleOrder = () => {
        const cleanPhone = phone.replace(/\D/g, '');
        if(!selected || cleanPhone.length < 10) return;
        if (Number(userBalance) < Number(selected.harga_jual)) return Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: 'Silakan top up dompet Anda terlebih dahulu.', confirmButtonColor: '#0ea5e9', customClass: {popup: 'rounded-[24px]'} });
        if (!checkCooldown(cleanPhone)) return;

        const nominalAngka = selected.nama_layanan.replace(/\D/g, '');
        const nominalTampil = nominalAngka.length >= 4 ? formatRp(nominalAngka) : selected.nama_layanan;
        const hargaCoret = Math.round(selected.harga_jual * (1 + fakeMarkup));

        Swal.fire({
            title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2 uppercase">Konfirmasi Pembelian</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-mobile-screen text-cyan-500"></i> No. Tujuan</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${cleanPhone}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-bolt text-cyan-500"></i> Nominal</span>
                        <span class="text-[14px] font-black text-cyan-600 text-right w-1/2 leading-tight">Pulsa ${nominalTampil}</span>
                    </div>
                    <div class="bg-gradient-to-br from-cyan-50 to-indigo-50 p-5 rounded-[24px] border border-cyan-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-cyan-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-cyan-700 uppercase tracking-widest relative z-10">Total Bayar</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-cyan-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(hargaCoret)}</span>
                            <span class="text-2xl font-black text-cyan-700 tracking-tight">Rp ${formatRp(selected.harga_jual)}</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'BATALKAN', confirmButtonText: '<i class="fa-solid fa-fingerprint mr-2"></i> BAYAR SEKARANG',
            buttonsStyling: false, reverseButtons: true,
            customClass: {
                confirmButton: 'w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-[0_8px_20px_rgba(6,182,212,0.3)] text-xs tracking-widest uppercase transform active:scale-95',
                cancelButton: 'w-full bg-transparent hover:bg-slate-50 text-slate-500 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-200 tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm border border-slate-100 shadow-2xl'
            }
        }).then((res) => {
            if (res.isConfirmed) {
                localStorage.setItem('last_pulsa_trx', JSON.stringify({ number: cleanPhone, time: new Date().getTime() }));
                transform((data) => ({ ...data, tujuan: cleanPhone, kode_layanan: selected.kode_layanan }));
                
                post(route('order.pulsa.store'), {
                    preserveScroll: true,
                    onStart: () => {
                        Swal.fire({
                            title: '<div class="text-xl font-black text-slate-800 mt-2">Memproses Pulsa...</div>',
                            html: `
                                <div class="mt-6 mb-2 flex flex-col items-center justify-center">
                                    <div class="relative w-20 h-20">
                                        <div class="absolute inset-0 border-4 border-slate-100 rounded-full shadow-inner"></div>
                                        <div class="absolute inset-0 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
                                        <div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-bolt text-indigo-500 text-2xl animate-pulse"></i></div>
                                    </div>
                                    <p class="text-[11px] font-black text-slate-400 mt-8 tracking-[0.2em] uppercase animate-pulse">Menghubungi Operator</p>
                                </div>
                            `,
                            allowOutsideClick: false, showConfirmButton: false, buttonsStyling: false,
                            customClass: { popup: 'rounded-[32px] p-8 w-full max-w-sm border border-slate-100 shadow-2xl' }
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
                        Swal.fire({ icon: 'error', title: 'Gagal', text: Object.values(err)[0] || 'Terjadi kesalahan sistem.', confirmButtonColor: '#0ea5e9', customClass: { popup: 'rounded-[24px]' } });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Isi Pulsa - MilaStore" />
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40">
                {/* 🚀 HEADER GRADIENT CYAN-INDIGO */}
                <div className="p-8 pb-20 text-white shadow-xl relative overflow-hidden rounded-b-[45px]" style={{background: 'linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)'}}>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
                        <Link href="/dashboard" className="text-white w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md transition-transform hover:-translate-x-1"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <div className="text-center">
                            <h1 className="text-xl font-black tracking-tight m-0 uppercase drop-shadow-md">Isi Pulsa</h1>
                            <div className="mt-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-inner">Saldo: Rp {formatRp(userBalance)}</div>
                        </div>
                        <div className="w-8"></div>
                    </div>
                    <i className="fa-solid fa-bolt absolute right-5 -bottom-5 text-8xl text-white opacity-10 -rotate-12"></i>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-12 relative z-20">
                    {/* INPUT HP */}
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-50 rounded-full blur-2xl"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor HP Tujuan</label>
                            <ProviderBadge provider={provider} />
                        </div>
                        <div className="flex items-center border-b-2 border-slate-100 focus-within:border-cyan-500 transition-all pb-2 gap-3 relative z-10">
                            <input
                                type="tel"
                                className="flex-1 w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0 tracking-wider placeholder-slate-300"
                                placeholder="0812xxxx" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength="15"
                            />
                            {phone.length >= 10 && <i className="fa-solid fa-check-circle absolute right-14 top-2 text-cyan-500 text-lg animate-in zoom-in"></i>}
                            <button onClick={handleContactPicker} className="w-12 h-12 bg-cyan-50 text-cyan-500 rounded-[16px] flex items-center justify-center shadow-sm active:scale-95 transition-transform"><i className="fa-solid fa-address-book text-xl"></i></button>
                        </div>
                        <div className="flex justify-between items-center mt-4 relative z-10">
                            <button onClick={handleSaveFav} disabled={phone.length < 10} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 transition-colors disabled:opacity-50"><i className="fa-regular fa-bookmark mr-1.5 text-sm"></i> Simpan</button>
                            <button onClick={() => setShowFavModal(true)} className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-50 px-4 py-2 rounded-xl hover:bg-cyan-100 transition-colors shadow-sm border border-cyan-100"><i className="fa-solid fa-list-ul mr-1.5"></i> Favorit</button>
                        </div>
                    </div>

                    {/* PILIHAN NOMINAL */}
                    <div className="grid grid-cols-2 gap-3">
                        {phone.length < 4 ? (
                            <div className="col-span-2 bg-white/60 backdrop-blur-md rounded-[32px] p-12 text-center border border-slate-100 shadow-sm animate-in fade-in">
                                <div className="w-20 h-20 bg-gradient-to-tr from-cyan-50 to-indigo-50 text-cyan-300 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-inner"><i className="fa-solid fa-keyboard"></i></div>
                                <h4 className="font-black text-slate-700 mb-1.5">Ketik Nomor HP</h4>
                                <p className="font-bold text-[11px] text-slate-400 leading-relaxed px-4">Pilihan nominal pulsa otomatis muncul setelah Anda mengetik awalan nomor.</p>
                            </div>
                        ) : activeProducts.length === 0 ? (
                            <div className="col-span-2 bg-rose-50 rounded-[32px] p-10 text-center border border-rose-100 mt-2 animate-in fade-in zoom-in">
                                <div className="w-16 h-16 bg-white text-rose-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm"><i className="fa-solid fa-triangle-exclamation"></i></div>
                                <h4 className="font-black text-rose-700 mb-1">Produk Kosong</h4>
                                <p className="font-bold text-[11px] text-rose-500/70">Maaf, layanan pulsa {provider || 'ini'} sedang tidak tersedia dari server.</p>
                            </div>
                        ) : (
                            activeProducts.map((p) => {
                                const isSelected = selected?.kode_layanan === p.kode_layanan;
                                const nominalAngka = p.nama_layanan.replace(/\D/g, '');
                                const nominalTampil = nominalAngka.length >= 4 ? formatRp(nominalAngka) : p.nama_layanan;
                                const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));

                                return (
                                    <div key={p.kode_layanan} onClick={() => setSelected(p)} className={`relative p-5 rounded-[24px] transition-all cursor-pointer border-2 bg-white flex flex-col justify-between h-[115px] overflow-hidden ${isSelected ? 'border-cyan-500 shadow-[0_10px_25px_rgba(6,182,212,0.25)] scale-[1.02] ring-4 ring-cyan-50 z-10' : 'border-slate-100 shadow-sm hover:border-cyan-200 hover:-translate-y-1'}`}>
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm tracking-widest">DISKON 5%</div>
                                        <div>
                                            <div className={`text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`}>
                                                <i className="fa-solid fa-bolt text-[8px]"></i> PULSA {provider}
                                            </div>
                                            <div className="text-[22px] font-black text-slate-800 tracking-tighter leading-none truncate">{nominalTampil}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-slate-400 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>
                                            <div className={`font-black text-[15px] ${isSelected ? 'text-cyan-600' : 'text-slate-500'}`}>Rp {formatRp(p.harga_jual)}</div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 💳 FLOATING CHECKOUT BAR SULTAN */}
                {selected && phone.length >= 10 && (
                    <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-50 animate-in slide-in-from-bottom rounded-t-[35px]">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Bayar</p>
                            <h3 className="text-2xl font-black text-cyan-600 tracking-tighter drop-shadow-sm">Rp {formatRp(selected.harga_jual)}</h3>
                        </div>
                        <button onClick={handleOrder} disabled={processing} className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-8 py-3.5 rounded-[16px] font-black text-[11px] uppercase tracking-widest shadow-[0_8px_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                            BAYAR SEKARANG <i className="fa-solid fa-fingerprint text-sm ml-1"></i>
                        </button>
                    </div>
                )}

                {/* MODAL DAFTAR FAVORIT */}
                {showFavModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-5 animate-in fade-in">
                        <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] flex flex-col border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-black text-slate-800 text-lg m-0 flex items-center gap-2"><i className="fa-solid fa-address-book text-cyan-500"></i>Nomor Favorit</h4>
                                <button onClick={() => setShowFavModal(false)} className="w-8 h-8 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><i className="fa-solid fa-chevron-down sm:hidden"></i><i className="fa-solid fa-xmark hidden sm:block"></i></button>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
                                {favorites.length === 0 ? (
                                    <div className="text-center py-12 opacity-60">
                                        <i className="fa-regular fa-folder-open text-5xl mb-4 text-slate-400"></i>
                                        <p className="font-black text-[11px] uppercase tracking-widest text-slate-500">Belum ada nomor tersimpan.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {favorites.map((fav) => (
                                            <div key={fav.id} className="flex justify-between items-center p-4 border-2 border-slate-100 rounded-[20px] hover:border-cyan-300 transition-all bg-white hover:shadow-md group cursor-pointer" onClick={() => { setPhone(fav.no); setShowFavModal(false); }}>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="font-black text-slate-800 text-sm">{fav.name}</div>
                                                    <div className="font-mono text-cyan-600 font-bold tracking-widest text-[11px] mt-1 bg-cyan-50 px-2 py-0.5 rounded w-max">{formatDisplayPhone(fav.no)}</div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelFav(fav.id); }} className="w-9 h-9 shrink-0 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"><i className="fa-regular fa-trash-can"></i></button>
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
