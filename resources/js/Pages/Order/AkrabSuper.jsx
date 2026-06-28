import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios'; // 🚀 TAMBAHKAN AXIOS

export default function AkrabSuper({ auth, groupedData, balance }) {
    const [phone, setPhone] = useState(localStorage.getItem("last_hp_akrab") || '');
    const [activeTab, setActiveTab] = useState('XLA');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [localBalance, setLocalBalance] = useState(balance);
    const [isLoading, setIsLoading] = useState(false);
    const [liveStock, setLiveStock] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchModal, setSearchModal] = useState('');
    
    const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);
    
    const tabs = [
        { id: 'XLA', label: 'XLA Big' },
        { id: 'XDA', label: 'XDA Mini' },
        { id: 'FMX', label: 'FMX' },
        { id: 'CFMX', label: 'CFMX' },
        { id: 'PLN', label: 'PLN' }
    ];

    useEffect(() => {
        let isMounted = true;
        const fetchStock = async () => {
            try {
                // 🚀 GANTI KE AXIOS
                const res = await axios.get(route('order.akrab.stock'));
                const data = res.data;
                if (isMounted && data.ok) {
                    const stockArray = Array.isArray(data.data) ? data.data : [];
                    setLiveStock(stockArray);
                }
            } catch (e) {
                // Silent fail
            }
        };
        fetchStock();
        const interval = setInterval(fetchStock, 5000);
        return () => { isMounted = false; clearInterval(interval); }
    }, []);

    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        setPhone(val);
        localStorage.setItem("last_hp_akrab", val);
    };

    const handlePay = async () => {
        if (!selectedProduct) return;
        if (phone.length < 10) return Swal.fire('Oops', 'Nomor HP minimal 10 digit.', 'warning');
        if (Number(localBalance) < Number(selectedProduct.harga_jual)) {
            return Swal.fire({ icon: 'error', title: 'Saldo Kurang', text: 'Silakan isi saldo Anda.' }).then((r) => { if(r.isConfirmed) window.location.href = '/deposit'; });
        }

        const konfirmasi = await Swal.fire({
            title: 'Konfirmasi Order',
            html: `
                <div style="text-align: left; background: #f8fafc; padding: 20px; border-radius: 20px; margin-top: 10px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Produk</p>
                    <h4 style="margin: 2px 0 15px 0; color: #0f172a; font-weight: 900; font-size: 16px;">${selectedProduct.nama_layanan}</h4>
                    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Nomor Tujuan</p>
                    <h3 style="margin: 2px 0 15px 0; color: #4f46e5; font-weight: 900; letter-spacing: 2px; font-size: 22px; font-family: monospace;">${phone}</h3>
                    <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Total Bayar</p>
                    <h4 style="margin: 2px 0 0 0; color: #0f172a; font-weight: 900; font-size: 18px;">Rp ${formatRp(selectedProduct.harga_jual)}</h4>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: '<i class="fa-solid fa-check"></i> Ya, Beli Sekarang',
            cancelButtonText: 'Batal',
            reverseButtons: true
        });

        if (!konfirmasi.isConfirmed) return;
        setIsLoading(true);

        try {
            // 🚀 GANTI KE AXIOS AGAR BEBAS CSRF MISMATCH
            const response = await axios.post(route('order.akrab.process'), { 
                kode_produk: selectedProduct.kode_layanan, 
                no_hp: phone 
            });
            const res = response.data;
            setIsLoading(false);

            if (res.status === 'success') {
                setLocalBalance(prev => prev - selectedProduct.harga_jual);
                Swal.fire({ title: 'Berhasil!', text: String(res.message).replace(/khfy/gi, 'Server Pusat'), icon: 'success' }).then(() => window.location.href = '/riwayat');
            } else {
                Swal.fire({ title: 'Gagal', text: String(res.message).replace(/khfy/gi, 'Server Pusat'), icon: 'error' });
            }
        } catch (error) {
            setIsLoading(false);
            // 🚀 TANGKAP ERROR ASLI DARI SERVER, BUKAN CUMA "GANGGUAN JARINGAN"
            const errorMsg = error.response?.data?.message || 'Terjadi kesalahan sistem/jaringan.';
            Swal.fire('Error', String(errorMsg).replace(/khfy/gi, 'Server Pusat'), 'error');
        }
    };

    const currentProducts = groupedData[activeTab] || [];
    const isBalanceEnough = selectedProduct ? Number(localBalance) >= Number(selectedProduct.harga_jual) : true;
    
    let selectedIsOutOfStock = false;
    if (selectedProduct) {
        if (activeTab === 'XLA' || activeTab === 'XDA') {
            const st = liveStock.find(i => i.type === selectedProduct.kode_layanan);
            if (!st || parseInt(st.sisa_slot) <= 0) selectedIsOutOfStock = true;
        } else {
            if (selectedProduct.status !== 'active') selectedIsOutOfStock = true;
        }
    }

    return (
        <div className="bg-[#f1f5f9] min-h-screen font-['Outfit'] text-[#0f172a] pb-32">
            <Head title="Akrab Super - MilaStore" />
            
            {isLoading && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <div className="font-black text-indigo-600 tracking-widest uppercase animate-pulse">Memproses Order...</div>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 pt-8 pb-20 px-5 rounded-b-[40px] shadow-2xl relative">
                <div className="max-w-md mx-auto relative z-10">
                    <div className="flex justify-between items-center text-white mb-4">
                        <Link href="/dashboard" className="text-white"><i className="fa-solid fa-arrow-left-long text-xl"></i></Link>
                        <h1 className="text-xl font-black tracking-tight">Akrab Super</h1>
                        <button onClick={() => setIsModalOpen(true)} className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest active:scale-95 border border-white/30">
                            <i className="fa-solid fa-server mr-1"></i> CEK STOK
                        </button>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Sniper Auto Polling Aktif</span>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-12 relative z-20">
                <div className="bg-white rounded-[24px] p-5 shadow-xl border border-slate-100 mb-5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nomor Tujuan</label>
                    <div className="flex items-center border-b-2 border-slate-100 pb-2">
                        <input
                            type="tel" placeholder="08xxx..." maxLength="16"
                            value={phone.match(/.{1,4}/g)?.join(' ') || phone}
                            onChange={handlePhoneChange}
                            className="w-full border-none bg-transparent text-2xl font-black text-slate-800 tracking-wider p-0 font-mono focus:ring-0"
                        />
                        <i className="fa-solid fa-address-book text-slate-300 text-xl"></i>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSelectedProduct(null); }}
                            className={`snap-center shrink-0 px-6 py-3 rounded-[16px] font-black text-xs transition-all whitespace-nowrap border-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 -translate-y-1' : 'bg-white text-slate-500 border-slate-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                    {currentProducts.map(p => {
                        const isSelected = selectedProduct?.kode_layanan === p.kode_layanan;
                        let isOutOfStock = false;
                        let badge;
                        if (activeTab === 'XLA' || activeTab === 'XDA') {
                            const stock = liveStock.find(i => i.type === p.kode_layanan);
                            if (stock) {
                                const slotNumber = parseInt(stock.sisa_slot) || 0;
                                if (slotNumber > 0) {
                                    badge = <span className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[9px] font-black"><i className="fa-solid fa-check"></i> {stock.sisa_slot} Ready</span>;
                                } else {
                                    isOutOfStock = true;
                                    badge = <span className="absolute top-3 right-3 bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-[9px] font-black"><i className="fa-solid fa-clock"></i> Habis</span>;
                                }
                            } else {
                                badge = <span className="absolute top-3 right-3 text-slate-300"><i className="fa-solid fa-spinner fa-spin"></i></span>;
                                isOutOfStock = true;
                            }
                        } else {
                            if (p.status === 'active') {
                                badge = <span className="absolute top-3 right-3 bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[9px] font-black"><i className="fa-solid fa-bolt text-amber-500"></i> Auto</span>;
                            } else {
                                isOutOfStock = true;
                                badge = <span className="absolute top-3 right-3 bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-[9px] font-black"><i className="fa-solid fa-xmark"></i> Gangguan</span>;
                            }
                        }
                        return (
                            <div
                                key={p.kode_layanan}
                                onClick={() => setSelectedProduct(p)}
                                className={`bg-white rounded-[20px] p-4 relative cursor-pointer border-2 transition-all flex flex-col justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-xl scale-[1.02] z-10' : 'border-transparent hover:border-slate-200 shadow-sm'} ${isOutOfStock ? 'opacity-70 grayscale-[0.5]' : ''}`}
                            >
                                {badge}
                                <div>
                                    <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md mb-2">{p.kode_layanan}</span>
                                    <h3 className="text-xs font-black text-slate-800 leading-tight mb-3">{p.nama_layanan}</h3>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-indigo-600 tracking-tight">Rp {formatRp(p.harga_jual)}</div>
                                    {isSelected && (
                                        <div className="mt-3 pt-3 border-t-2 border-indigo-100 border-dashed animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[9px] font-bold text-slate-500 leading-relaxed whitespace-pre-line">
                                                <i className="fa-solid fa-circle-info text-indigo-400 mr-1"></i>{p.deskripsi}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {selectedProduct && (
                <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[35px] border-t border-slate-100 z-50 animate-in slide-in-from-bottom">
                    <div className="max-w-md mx-auto">
                        {selectedIsOutOfStock ? (
                            <div className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">
                                <i className="fa-solid fa-xmark mr-1"></i> Maaf, produk ini sedang kosong
                            </div>
                        ) : !isBalanceEnough ? (
                            <div className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">
                                <i className="fa-solid fa-triangle-exclamation mr-1"></i> Saldo dompet Anda tidak mencukupi
                            </div>
                        ) : null}
                        
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Bayar</p>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Rp {formatRp(selectedProduct.harga_jual)}</h2>
                            </div>
                            <button
                                onClick={handlePay}
                                disabled={selectedIsOutOfStock || !isBalanceEnough || phone.length < 10}
                                className={`px-8 py-4 rounded-full font-black text-sm shadow-xl transition-all ${selectedIsOutOfStock ? 'bg-rose-500 text-white cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 disabled:opacity-50'}`}
                            >
                                {selectedIsOutOfStock ? 'STOK HABIS' : <>PROSES <i className="fa-solid fa-chevron-right ml-1"></i></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-800"><i className="fa-solid fa-server text-indigo-500 mr-2"></i> Live Server Stock</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><i className="fa-solid fa-xmark text-xl"></i></button>
                        </div>
                        <div className="p-4">
                            <input type="text" placeholder="Cari Kode (Cth: XDA)" value={searchModal} onChange={e => setSearchModal(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-sm font-bold focus:border-indigo-500 focus:ring-0 mb-4" />
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {liveStock.filter(i => searchModal === '' || i.type.toUpperCase().includes(searchModal.toUpperCase()) || i.nama.toUpperCase().includes(searchModal.toUpperCase())).map((item, idx) => {
                                    const slot = parseInt(item.sisa_slot);                                    
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-3 border-b border-dashed border-slate-100">
                                            <div>
                                                <div className="font-black text-slate-800 text-sm">{item.type}</div>
                                                <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{item.nama}</div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${slot > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {slot} Slot
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
