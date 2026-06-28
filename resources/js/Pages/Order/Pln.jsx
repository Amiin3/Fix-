import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import '@/../../resources/css/mila-loading.css';

export default function Pln({ auth, products, userBalance }) {
    const [target, setTarget] = useState('');
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    
    // 🎛️ State untuk Fitur Sultan
    const [showScanner, setShowScanner] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [showFavModal, setShowFavModal] = useState(false);
    
    // 🚀 FITUR FAKE DISCOUNT SULTAN (5%)
    const fakeMarkup = 0.05;

    const { transform, post, processing } = useForm({
        tujuan: '',
        kode_layanan: ''
    });

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);
    
    // 🛡️ ANTI-HACKING: Filter hanya angka
    const formatDisplayId = (str) => {
        let val = str.replace(/\D/g, '').slice(0, 20); // Max 20 digit
        let matches = val.match(/.{1,4}/g);
        return matches ? matches.join(' ') : val;
    };

    // 📡 INIT: Panggil Satelit Scanner & Load Data Favorit
    useEffect(() => {
        if (!document.getElementById('qr-scanner-script')) {
            const script = document.createElement('script');
            script.id = 'qr-scanner-script';
            script.src = 'https://unpkg.com/html5-qrcode';
            script.async = true;
            document.body.appendChild(script);
        }
        const savedFavs = JSON.parse(localStorage.getItem('amifi_pln_favs')) || [];
        setFavorites(savedFavs);
    }, []);

    // 📸 FUNGSI SAKTI 1: SCANNER BARCODE METERAN
    useEffect(() => {
        let html5QrCode;
        if (showScanner) {
            if (window.Html5Qrcode) {
                html5QrCode = new window.Html5Qrcode("pln-reader");
                html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 100 } },
                    (decodedText) => {
                        const numberOnly = decodedText.replace(/\D/g, '');
                        setTarget(numberOnly);
                        setShowScanner(false);
                        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Nomor Meter: ' + numberOnly, timer: 1500, showConfirmButton: false });
                    },
                    (errorMessage) => {}
                ).catch((err) => {
                    setShowScanner(false);
                    Swal.fire('Akses Ditolak', 'Pastikan Anda memberikan izin kamera pada browser.', 'error');
                });
            } else {
                Swal.fire('Tunggu', 'Modul kamera sedang disiapkan, coba lagi.', 'info');
                setShowScanner(false);
            }
        }
        return () => {
            if (html5QrCode && html5QrCode.isScanning) html5QrCode.stop().catch(e => console.error(e));
        };
    }, [showScanner]);

    // 📱 FUNGSI SAKTI 2: AMBIL DARI KONTAK
    const handleContactPicker = async () => {
        if (window.AndroidBridge && typeof window.AndroidBridge.bukaKontak === 'function') {
            window._contactResolve = (data) => {
                if (data && data.length > 0) {
                    let number = data[0].tel[0].replace(/\D/g, '');
                    if (number.startsWith('62')) number = '0' + number.substring(2);
                    setTarget(number);
                }
            };
            window.AndroidBridge.bukaKontak();
        } else if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const contacts = await navigator.contacts.select(['tel'], { multiple: false });
                if (contacts.length > 0 && contacts[0].tel.length > 0) {
                    let number = contacts[0].tel[0].replace(/\D/g, '');
                    if (number.startsWith('62')) number = '0' + number.substring(2);
                    setTarget(number);
                }
            } catch (ex) {}
        } else {
            Swal.fire({ icon: 'info', title: 'Tidak Didukung', text: 'Gunakan Google Chrome atau Aplikasi Android untuk fitur ini.', confirmButtonColor: '#10b981' });
        }
    };

    // ⭐ FUNGSI SAKTI 3: SIMPAN & LOAD FAVORIT
    const handleSaveFav = () => {
        const num = target.replace(/\D/g, '');
        if(num.length < 11) return Swal.fire('Oops', 'Nomor meter harus minimal 11 digit.', 'warning');
        Swal.fire({
            title: 'Simpan ke Favorit', input: 'text', inputPlaceholder: 'Misal: Meteran Rumah',
            showCancelButton: true, confirmButtonText: 'Simpan', cancelButtonText: 'Batal', confirmButtonColor: '#10b981'
        }).then(res => {
            if(res.isConfirmed && res.value) {
                const newFavs = [...favorites, { id: Date.now(), name: res.value, no: num }];
                setFavorites(newFavs);
                localStorage.setItem('amifi_pln_favs', JSON.stringify(newFavs));
                Swal.fire({ icon: 'success', title: 'Tersimpan!', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleDelFav = (id) => {
        const newFavs = favorites.filter(f => f.id !== id);
        setFavorites(newFavs);
        localStorage.setItem('amifi_pln_favs', JSON.stringify(newFavs));
    };

    // 🛡️ FUNGSI SAKTI 4: ANTI DOUBLE TRANSFER (COOLDOWN 5 MENIT)
    const checkCooldown = (targetNumber) => {
        const lastTrx = JSON.parse(localStorage.getItem('last_pln_trx'));
        if (lastTrx && lastTrx.number === targetNumber) {
            const now = new Date().getTime();
            const diff = now - lastTrx.time;
            if (diff < 5 * 60 * 1000) {
                const timeLeft = Math.ceil((5 * 60 * 1000 - diff) / 1000 / 60);
                Swal.fire({ icon: 'warning', title: 'Transaksi Ditahan!', text: `Anda baru saja mengisi token ke nomor ini. Tunggu ${timeLeft} menit lagi untuk mencegah transfer ganda!`, confirmButtonColor: '#10b981' });
                return false;
            }
        }
        return true;
    };

    // 🚀 FUNGSI SAKTI 5: UI TRANSAKSI MODERN + REDIRECT
    const handleOrder = () => {
        const cleanTarget = target.replace(/\D/g, '');
        if(!selected || cleanTarget.length < 11) {
            return Swal.fire({
                icon: 'warning', title: 'Oops!', text: 'Masukkan Nomor Meter minimal 11 digit!', 
                confirmButtonColor: '#10b981', customClass: { popup: 'rounded-[24px] shadow-2xl' }
            });
        }
        if (Number(userBalance) < Number(selected.harga_jual)) {
            return Swal.fire({ 
                icon: 'error', title: 'Saldo Kurang', text: 'Silakan top up dompet Anda terlebih dahulu.', 
                confirmButtonColor: '#10b981', customClass: { popup: 'rounded-[24px] shadow-2xl' }
            });
        }
        if (!checkCooldown(cleanTarget)) return;

        // MATEMATIKA DISKON
        const hargaCoret = Math.round(selected.harga_jual * (1 + fakeMarkup));

        Swal.fire({
            title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2">Konfirmasi Pembayaran</div>`,
            html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-bolt text-amber-500"></i> No. Meter / ID</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${cleanTarget}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-box-open text-emerald-500"></i> Produk</span>
                        <span class="text-[13px] font-black text-emerald-600 text-right w-1/2 leading-tight">${selected.nama_layanan}</span>
                    </div>
                    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-[24px] border border-emerald-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-emerald-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-emerald-700 uppercase tracking-widest relative z-10">Total Tagihan</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-emerald-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(hargaCoret)}</span>
                            <span class="text-2xl font-black text-emerald-700 tracking-tight">Rp ${formatRp(selected.harga_jual)}</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'BATALKAN',
            confirmButtonText: '<i class="fa-solid fa-fingerprint mr-2"></i> BAYAR SEKARANG',
            buttonsStyling: false,
            reverseButtons: true, // Ubah posisi tombol (Batal di kiri, Bayar di kanan)
            customClass: {
                confirmButton: 'w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] text-xs tracking-widest uppercase transform active:scale-95',
                cancelButton: 'w-full bg-transparent hover:bg-slate-50 text-slate-500 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-200 tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.12)]'
            }
        }).then((res) => {
            if (res.isConfirmed) {
                // Kunci Cooldown
                localStorage.setItem('last_pln_trx', JSON.stringify({ number: cleanTarget, time: new Date().getTime() }));
                
                // Siapkan Data ke Inertia
                transform((data) => ({ ...data, tujuan: cleanTarget, kode_layanan: selected.kode_layanan }));
                
                // 🚀 ANIMASI LOADING SUPER MODERN (Menggantikan CSS Biasa)
                Swal.fire({
                    title: '<div class="text-xl font-black text-slate-800 mt-2">Memproses Transaksi...</div>',
                    html: `
                        <div class="mt-6 mb-2 flex flex-col items-center justify-center">
                            <div class="relative w-20 h-20">
                                <div class="absolute inset-0 border-4 border-slate-100 rounded-full shadow-inner"></div>
                                <div class="absolute inset-0 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                <div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-bolt text-amber-500 text-2xl animate-pulse"></i></div>
                            </div>
                            <p class="text-[11px] font-black text-slate-400 mt-8 tracking-[0.2em] uppercase animate-pulse">Menyambungkan ke Server PLN</p>
                        </div>
                    `,
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    buttonsStyling: false,
                    customClass: { popup: 'rounded-[32px] p-8 w-full max-w-sm border border-slate-100 shadow-[0_40px_80px_rgba(0,0,0,0.15)]' }
                });

                // Eksekusi API & Redirect
                post(route('order.pln.store'), {
                    preserveScroll: true,
                    onFinish: () => {
                        // Begitu proses backend kelar, APAPUN hasilnya, langsung arahkan ke riwayat!
                        Swal.fire({
                            icon: 'success',
                            title: '<div class="text-xl font-black text-slate-800 mt-2">Order Diterima!</div>',
                            html: '<p class="text-xs font-bold text-slate-500 mt-1">Mengarahkan ke Riwayat Transaksi...</p>',
                            timer: 1500,
                            timerProgressBar: true,
                            showConfirmButton: false,
                            customClass: { popup: 'rounded-[32px] p-6 shadow-2xl border border-slate-100' }
                        }).then(() => {
                            router.visit('/riwayat'); // SPA Redirect yang mulus tanpa reload halaman
                        });
                    }
                });
            }
        });
    };

    let plnList = Array.isArray(products) ? products : (products?.PLN || []);
    if (search) {
        plnList = plnList.filter(p => p.nama_layanan.toLowerCase().includes(search.toLowerCase()) || p.harga_jual.toString().includes(search));
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Token PLN - MilaStore" />
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .app-header-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 20px 90px 20px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; color: white; }
                #pln-reader { border-radius: 20px; overflow: hidden; border: none !important; }
                #pln-reader video { border-radius: 20px; object-fit: cover; }
            `}</style>
            
            {/* Overlay CSS Lama dimatikan karena sudah pakai SweetAlert2 Modern */}
            
            <div className="min-h-screen bg-[#f8fafc] font-['Outfit'] pb-40">
                <div className="app-header-green shadow-xl shadow-emerald-200/50 relative">
                    <div className="max-w-md mx-auto relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <Link href="/dashboard" className="text-white"><i className="fa-solid fa-arrow-left-long text-xl"></i></Link>
                            <h5 className="font-black text-xl tracking-tight m-0 text-center">Token PLN</h5>
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 font-black text-xs shadow-inner">Rp {formatRp(userBalance)}</div>
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-4 -mt-16 relative z-20">
                    <div className="bg-white rounded-[28px] p-5 shadow-xl shadow-emerald-100/50 border border-white mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 shadow-inner"><i className="fa-solid fa-bolt-lightning text-xl"></i></div>
                            <h2 className="text-lg font-black text-slate-800 m-0 tracking-tight">Isi Token</h2>
                        </div>
                        
                        <div className="border border-slate-200 rounded-2xl p-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 transition-all mb-4 bg-slate-50 focus-within:bg-white relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ID Pelanggan / No. Meter</label>
                            <input
                                type="tel"
                                className="w-full border-none focus:ring-0 font-mono text-xl font-black text-slate-800 p-0 placeholder-slate-300 tracking-widest bg-transparent"
                                placeholder="0000 0000 0000"
                                value={formatDisplayId(target)}
                                onChange={(e) => setTarget(e.target.value)}
                                maxLength="24"
                            />
                            {target.replace(/\D/g, '').length >= 11 && (
                                <i className="fa-solid fa-check-circle absolute right-4 top-8 text-emerald-500 text-xl animate-in zoom-in duration-300"></i>
                            )}
                        </div>

                        <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <button onClick={handleContactPicker} className="flex-1 py-3 text-[11px] font-black text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-r border-slate-200 flex items-center justify-center gap-2 uppercase tracking-wide"><i className="fa-regular fa-user text-sm"></i> Kontak</button>
                            <button onClick={() => setShowScanner(true)} className="flex-1 py-3 text-[11px] font-black text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border-r border-slate-200 flex items-center justify-center gap-2 uppercase tracking-wide"><i className="fa-solid fa-qrcode text-sm"></i> Scan QR</button>
                            <button onClick={() => setShowFavModal(true)} className="flex-1 py-3 text-[11px] font-black text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"><i className="fa-solid fa-heart text-sm"></i> Favorit</button>
                        </div>

                        {target.replace(/\D/g, '').length >= 11 && (
                            <div className="text-center mt-4 animate-in fade-in zoom-in">
                                <button onClick={handleSaveFav} className="text-[10px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><i className="fa-solid fa-bookmark mr-1"></i> Simpan Nomor Ini</button>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h6 className="font-black text-slate-800 m-0 text-sm tracking-tight">Pilih Nominal</h6>
                            <i className="fa-solid fa-list-check text-slate-300"></i>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {plnList.length === 0 ? (
                            <div className="col-span-2 text-center py-10 bg-white rounded-[24px] border border-slate-100"><p className="font-bold text-slate-500 text-sm">Produk PLN Kosong.</p></div>
                        ) : (
                            plnList.map((p) => {
                                const isSelected = selected?.kode_layanan === p.kode_layanan;
                                const isGangguan = p.status === 'empty' || p.status === 'gangguan';
                                const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));
                                
                                return (
                                    <div
                                        key={p.kode_layanan}
                                        onClick={() => !isGangguan && setSelected(p)}
                                        className={`relative p-4 rounded-[20px] transition-all border-2 overflow-hidden ${isGangguan ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md scale-[1.02] z-10' : 'bg-white border-slate-100 shadow-sm hover:border-emerald-200 cursor-pointer hover:-translate-y-1 transform-gpu'}`}
                                    >
                                        {!isGangguan && (
                                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm tracking-widest">
                                                DISKON 5%
                                            </div>
                                        )}
                                        {isGangguan && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-sm">GANGGUAN</span>
                                        )}
                                        
                                        <div className={`font-black mb-1.5 leading-tight text-[13px] ${isSelected ? 'text-emerald-700' : 'text-slate-700'} ${isGangguan && 'text-slate-500'}`}>
                                            {p.nama_layanan}
                                        </div>
                                        <div>
                                            {!isGangguan && <div className="text-[9px] text-slate-400 line-through mb-0.5 font-bold">Rp {formatRp(hargaCoret)}</div>}
                                            <div className={`font-black text-[14px] ${isSelected ? 'text-emerald-600' : 'text-emerald-500'} ${isGangguan && 'text-slate-400'}`}>
                                                Rp {formatRp(p.harga_jual)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 🚀 BOTTOM BAR FIX: Konfirmasi Pesanan */}
                {selected && target.replace(/\D/g, '').length >= 11 && (
                    <div className="fixed bottom-0 left-0 w-full p-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 rounded-t-[35px] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-[50] animate-in slide-in-from-bottom">
                        <div className="max-w-md mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Bayar</p>
                                <h3 className="text-2xl font-black text-emerald-600 tracking-tighter">Rp {formatRp(selected.harga_jual)}</h3>
                            </div>
                            <button onClick={handleOrder} disabled={processing} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3.5 rounded-[16px] font-black text-[11px] uppercase tracking-widest shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                                BELI SEKARANG <i className="fa-solid fa-fingerprint text-sm"></i>
                            </button>
                        </div>
                    </div>
                )}
                
                {/* 🚀 MODAL SCANNER & FAVORIT TETAP UTUH DI SINI */}
                {showScanner && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col justify-center items-center p-5 animate-in fade-in">
                        <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-white/20">
                            <div className="flex justify-between items-center mb-5">
                                <h4 className="font-black text-slate-800 text-lg m-0 flex items-center gap-2"><i className="fa-solid fa-qrcode text-emerald-500"></i>Scan Barcode Meteran</h4>
                                <button onClick={() => setShowScanner(false)} className="w-8 h-8 bg-slate-100 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            <div id="pln-reader" className="w-full bg-slate-900 rounded-[20px] overflow-hidden shadow-inner mb-4 border-2 border-slate-100"></div>
                            <p className="text-center text-[11px] font-bold text-slate-500 tracking-wide uppercase">Arahkan kamera ke Barcode di Meteran PLN.</p>
                        </div>
                    </div>
                )}
                
                {showFavModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-5 animate-in fade-in">
                        <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] flex flex-col border border-white/20">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-black text-slate-800 text-lg m-0 flex items-center gap-2"><i className="fa-solid fa-heart text-emerald-500"></i>Nomor Favorit</h4>
                                <button onClick={() => setShowFavModal(false)} className="w-8 h-8 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><i className="fa-solid fa-chevron-down sm:hidden"></i><i className="fa-solid fa-xmark hidden sm:block"></i></button>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                                {favorites.length === 0 ? (
                                    <div className="text-center py-12 opacity-60"><i className="fa-regular fa-folder-open text-5xl mb-4 text-slate-400"></i><p className="font-black text-[11px] uppercase tracking-widest text-slate-500">Belum ada nomor tersimpan.</p></div>
                                ) : (
                                    <div className="grid gap-3 pb-4">
                                        {favorites.map((fav) => (
                                            <div key={fav.id} className="flex justify-between items-center p-4 border-2 border-slate-100 rounded-[20px] hover:border-emerald-300 transition-all bg-white hover:shadow-md group cursor-pointer" onClick={() => { setTarget(fav.no); setShowFavModal(false); }}>
                                                <div>
                                                    <div className="font-black text-slate-800 text-sm">{fav.name}</div>
                                                    <div className="font-mono text-emerald-600 font-bold tracking-widest text-[11px] mt-1 bg-emerald-50 px-2 py-0.5 rounded w-max">{formatDisplayId(fav.no)}</div>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelFav(fav.id); }} className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"><i className="fa-regular fa-trash-can"></i></button>
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
