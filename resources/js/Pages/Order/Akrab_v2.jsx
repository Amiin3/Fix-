import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Akrab_v2({ groupedProducts = {}, userBalance = 0 }) {
    const categories = Object.keys(groupedProducts);
    const [phone, setPhone] = useState(localStorage.getItem("last_hp_akrab_xda") || '');
    const [activeCat, setActiveCat] = useState(categories.length > 0 ? categories[0] : '');
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    const [localBalance, setLocalBalance] = useState(userBalance);
    const [liveStock, setLiveStock] = useState([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);

    // LIVE POLLING CERDAS (Hanya untuk kategori Akrab & Circle)
    useEffect(() => {
        let isMounted = true;
        const fetchLiveStock = async () => {
            // Cek apakah kategori saat ini mengandung kata 'akrab' atau 'circle'
            const catLower = activeCat.toLowerCase();
            const needsPolling = catLower.includes('akrab') || catLower.includes('circle');

            // Jika bukan Akrab/Circle, hentikan proses polling untuk menghemat server
            if (!needsPolling) return;

            try {
                const res = await axios.post('/order/akrab_v2/poll');
                if (isMounted && res.data.status === 'success') {
                    setLiveStock(res.data.data);
                }
            } catch (e) { console.log('Polling tertunda'); }
        };

        fetchLiveStock(); // Panggil pertama kali saat pindah tab
        const intervalId = setInterval(fetchLiveStock, 8000); // Ulangi tiap 8 detik
        
        return () => { isMounted = false; clearInterval(intervalId); };
    }, [activeCat]); // Effect akan dipicu ulang setiap kali user pindah kategori (Tab)

    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/\D/g, ''); 
        setPhone(val);
        localStorage.setItem("last_hp_akrab_xda", val);
    };

    const formatDisplayPhone = (str) => {
        let matches = str.match(/.{1,4}/g);
        return matches ? matches.join(' ') : str;
    };

    const openBottomSheet = (prod) => {
        setSelectedProduct(prod);
        setIsSheetOpen(true);
    };

    const closeBottomSheet = () => {
        setIsSheetOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    };

    const handlePay = async () => {
        if (!selectedProduct) return;
        if (phone.length < 10) return Swal.fire('Oops', 'Nomor HP minimal 10 digit.', 'warning');
        
        if (localBalance < selectedProduct.harga_jual) {
            closeBottomSheet();
            Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: 'Silakan isi saldo Anda.' }).then((r) => {
                if(r.isConfirmed) window.location.href='/deposit';
            });
            return;
        }

        // Validasi ekstra khusus Akrab/Circle (Cegah beli saat stok kosong tapi di-bypass user)
        const catLower = activeCat.toLowerCase();
        if (catLower.includes('akrab') || catLower.includes('circle')) {
            const stockData = liveStock.find(item => item.kode_layanan === selectedProduct.kode_layanan);
            if (stockData && (stockData.status !== 'active' || parseInt(stockData.stok) <= 0)) {
                return Swal.fire('Habis', 'Stok paket ini sedang kosong dari pusat', 'error');
            }
        }

        closeBottomSheet();
        setIsLoading(true);

        try {
            const res = await axios.post('/order/akrab_v2/store', {
                kode_produk: selectedProduct.kode_layanan,
                target: phone
            });

            setIsLoading(false);

            if (res.data.status === 'success') {
                setLocalBalance(prev => prev - selectedProduct.harga_jual);
                Swal.fire({ title: 'Berhasil!', text: res.data.message, icon: 'success' })
                .then(() => { window.location.href = '/dashboard'; });
            } else {
                Swal.fire({ title: 'Gagal', text: res.data.message, icon: 'error' });
            }
        } catch (error) {
            setIsLoading(false);
            Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
        }
    };

    const currentProducts = groupedProducts[activeCat] || [];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Head title="Akrab XDA - Amifi Store" />

            {isLoading && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                    <div className="text-sm font-black text-slate-600 uppercase tracking-widest animate-pulse">Memproses Transaksi...</div>
                </div>
            )}

            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-b-[40px] px-6 pt-8 pb-24 shadow-lg relative">
                <div className="max-w-md mx-auto flex justify-between items-center text-white">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-white opacity-90 hover:opacity-100 font-bold text-2xl">←</Link>
                        <div>
                            <h5 className="m-0 font-black text-lg leading-tight">Akrab XDA</h5>
                            <div className="flex items-center mt-1">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399] mr-2"></div>
                                <span className="text-[10px] font-bold opacity-90">Live Kaje Server</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm">
                        <span className="text-amber-400">💰</span> Rp {formatRp(localBalance)}
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-12 relative z-10">
                <div className="bg-white rounded-[24px] p-5 shadow-lg border border-violet-100 mb-5 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all">
                    <label className="text-[10px] font-black text-violet-500 uppercase tracking-[2px] block mb-2">Nomor Tujuan</label>
                    <div className="flex items-center border-b-2 border-slate-100 pb-2">
                        <input type="tel" placeholder="08xxxxxxxx" maxLength="16" value={formatDisplayPhone(phone)} onChange={handlePhoneChange} className="w-full border-none bg-transparent text-2xl font-black text-slate-800 outline-none p-0 focus:ring-0 placeholder-slate-300 font-mono tracking-wider" />
                        <span className="text-2xl text-slate-300 ml-2">📱</span>
                    </div>
                </div>

                <div className="flex overflow-x-auto whitespace-nowrap pb-4 mb-2 -mx-4 px-4 scrollbar-hide space-x-3">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCat(cat)} className={`inline-flex items-center px-6 py-3 rounded-full font-black text-xs transition-all border-2 ${activeCat === cat ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200 transform -translate-y-1' : 'bg-white text-slate-500 border-violet-100 hover:border-violet-300'}`}>
                            <span className="mr-2">{cat.toLowerCase().includes('akrab') || cat.toLowerCase().includes('circle') ? '👥' : '⚡'}</span> {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4">
                <div className="grid grid-cols-1 gap-3">
                    {currentProducts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold text-sm">Produk tidak tersedia / Belum Sync.</div>
                    ) : currentProducts.map(p => {
                        const catLower = activeCat.toLowerCase();
                        const isRealTimeTab = catLower.includes('akrab') || catLower.includes('circle');

                        let isAvail = true; // Default ke True untuk kategori Auto
                        let badgeHtml = <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest"><i className="fa-solid fa-bolt mr-1"></i> AUTO</div>;

                        // JIKA TAB INI BUTUH REAL-TIME (Akrab/Circle)
                        if (isRealTimeTab) {
                            const stockData = liveStock.find(item => item.kode_layanan === p.kode_layanan);
                            isAvail = false; // Default false sebelum loading selesai
                            badgeHtml = <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black tracking-widest flex items-center"><span className="w-2 h-2 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin mr-1"></span> WAIT</div>;

                            if (stockData) {
                                isAvail = (stockData.status === 'active' && parseInt(stockData.stok) > 0);
                                if (isAvail) {
                                    badgeHtml = <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">✅ {stockData.stok} STOK</div>;
                                } else {
                                    badgeHtml = <div className="absolute top-4 right-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest">❌ HABIS</div>;
                                }
                            }
                        }

                        return (
                            <div key={p.kode_layanan} onClick={() => isAvail && openBottomSheet(p)} className={`bg-white rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between shadow-sm ${isAvail ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md border-transparent hover:border-violet-100' : 'opacity-60 grayscale border-dashed border-slate-200 cursor-not-allowed'}`}>
                                {badgeHtml}
                                <div className="text-sm font-black text-slate-800 leading-snug w-3/4 mb-3">{p.nama_layanan}</div>
                                <div className="text-lg font-black text-violet-600">Rp {formatRp(p.harga_jual)}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeBottomSheet}></div>
            
            <div className={`fixed bottom-0 left-0 w-full bg-white z-50 rounded-t-[30px] p-6 sm:p-8 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[85vh] overflow-y-auto ${isSheetOpen ? 'translate-y-0 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]' : 'translate-y-full'}`}>
                {selectedProduct && (
                    <div className="max-w-md mx-auto">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        
                        <h5 className="font-black text-xl text-slate-800 mb-2 leading-tight">{selectedProduct.nama_layanan}</h5>
                        
                        <div className="flex justify-between items-center bg-violet-50 border border-violet-100 p-4 rounded-2xl mb-5">
                            <span className="font-mono font-black text-violet-500 text-xs tracking-widest">{selectedProduct.kode_layanan}</span>
                            <span className="text-2xl font-black text-violet-700">Rp {formatRp(selectedProduct.harga_jual)}</span>
                        </div>

                        <div className="mb-2"><small className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Info & Detail Paket</small></div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
                            <ul className="space-y-2">
                                {selectedProduct.deskripsi ? 
                                    selectedProduct.deskripsi.split(/\r?\n/).map((line, idx) => {
                                        let cleanLine = line.replace(/^[-•]\s*/, '').trim();
                                        if(cleanLine.length < 2) return null;
                                        return (
                                            <li key={idx} className="flex items-start text-xs font-bold text-slate-600 leading-relaxed">
                                                <span className="text-violet-500 mr-2 mt-0.5">✓</span>
                                                <span>{cleanLine}</span>
                                            </li>
                                        )
                                    })
                                : <li className="text-xs font-bold text-slate-400">Deskripsi tidak tersedia.</li>}
                            </ul>
                        </div>

                        <button onClick={handlePay} disabled={phone.length < 10 || localBalance < selectedProduct.harga_jual} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95 disabled:grayscale disabled:cursor-not-allowed">
                            {phone.length < 10 ? 'MASUKKAN NOMOR HP' : (localBalance < selectedProduct.harga_jual ? 'SALDO TIDAK CUKUP' : 'BELI SEKARANG')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
