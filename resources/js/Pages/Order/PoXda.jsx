import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function PoXda({ auth, products, totalAntri }) {
    const { props } = usePage();
    const { data, setData, post, processing, reset } = useForm({
        kode_layanan: '',
        tujuan: '',
    });

    const [validCount, setValidCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedProd, setSelectedProd] = useState(null);
    
    // 🎯 STATE UNTUK MODE SINGLE / MULTI TRX
    const [isMultiMode, setIsMultiMode] = useState(false);

    useEffect(() => {
        if (props.flash?.success) {
            Swal.fire({ title: 'Order Masuk!', text: props.flash.success, icon: 'success', confirmButtonColor: '#4f46e5' });
            reset('tujuan'); setValidCount(0); setTotalPrice(0);
        }
        if (props.errors?.message) {
            Swal.fire('Gagal!', props.errors.message, 'error');
        }
    }, [props.flash, props.errors]);

    useEffect(() => {
        const interval = setInterval(() => { router.reload({ only: ['totalAntri'], preserveScroll: true }); }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const prod = products?.find(p => p.kode_layanan === data.kode_layanan);
        setSelectedProd(prod || null);

        const price = prod ? parseFloat(prod.harga_jual) : 0;
        const rawNumbers = data.tujuan.split(/[\r\n, ]+/);
        const validNumbers = rawNumbers.filter(n => n.replace(/\D/g, '').length >= 9);
        const uniqueNumbers = [...new Set(validNumbers)];

        setValidCount(uniqueNumbers.length);
        setTotalPrice(uniqueNumbers.length * price);
    }, [data.kode_layanan, data.tujuan, products]);

    const submit = (e) => {
        e.preventDefault();
        if (validCount === 0) return Swal.fire('Perhatian!', 'Masukkan minimal 1 nomor valid.', 'warning');

        Swal.fire({
            title: 'Konfirmasi Transaksi',
            html: `Membeli <b>${selectedProd.nama_layanan}</b><br/>Untuk <b>${validCount}</b> Nomor.<br/><br/>Total Bayar: <b class="text-indigo-600 text-xl">Rp ${totalPrice.toLocaleString('id-ID')}</b>`,
            icon: 'question', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#ef4444', confirmButtonText: 'Ya, Bayar Sekarang!'
        }).then((result) => {
            if (result.isConfirmed) post(window.location.pathname, { preserveScroll: true });
        });
    };

    const deskripsiLayanan = selectedProd?.catatan || selectedProd?.deskripsi || selectedProd?.keterangan || "Tidak ada deskripsi/syarat khusus untuk layanan ini. Pastikan nomor tujuan sudah benar dan dalam masa aktif.";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pre-Order War Kaje" />
            <div className="py-8 px-4 bg-slate-50 min-h-screen font-['Outfit']">
                <div className="max-w-6xl mx-auto">
                    
                    {/* 🚀 HEADER PREMIUM */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-[32px] p-8 text-white shadow-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden border-t-4 border-indigo-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5 -translate-y-1/2 translate-x-1/4">
                            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">INJEKSI PRODUK</h1>
                            <p className="text-indigo-300 mt-2 text-sm font-medium">Layanan transaksi cepat, aman, dan otomatis.</p>
                        </div>
                        <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl text-center border border-white/10 shadow-inner">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Server Antrian</p>
                            <p className="text-2xl font-black flex items-center justify-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                                {totalAntri || 0} Aktif
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* 💻 KOLOM KIRI: FORM INPUT */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                                
                                {/* PILIH PRODUK */}
                                <div className="mb-8">
                                    <label className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                        Pilih Produk Layanan
                                    </label>
                                    <select 
                                        className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                                        value={data.kode_layanan}
                                        onChange={e => setData('kode_layanan', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Ketuk untuk memilih --</option>
                                        {products && products.map((p, i) => (
                                            <option key={i} value={p.kode_layanan}>
                                                {p.kode_layanan} - {p.nama_layanan} (Rp {parseFloat(p.harga_jual).toLocaleString('id-ID')})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* INPUT NOMOR */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 ml-2 gap-3">
                                        <label className="block text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            Nomor Tujuan Target
                                        </label>
                                        
                                        {/* 🎛️ SAKLAR TOGGLE SINGLE / MULTI */}
                                        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => { setIsMultiMode(false); reset('tujuan'); }}
                                                className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all tracking-wider ${!isMultiMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Biasa
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsMultiMode(true); reset('tujuan'); }}
                                                className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all tracking-wider ${isMultiMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Masal (Multi)
                                            </button>
                                        </div>
                                    </div>

                                    {/* KONDISI TAMPILAN BERDASARKAN MODE */}
                                    {!isMultiMode ? (
                                        // 🟢 TAMPILAN TRANSAKSI BIASA (INPUT KECIL)
                                        <input 
                                            type="text"
                                            className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-5 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-xl placeholder:text-slate-300 placeholder:font-normal"
                                            placeholder="Contoh: 081234567890"
                                            value={data.tujuan}
                                            onChange={e => setData('tujuan', e.target.value)}
                                            required
                                        />
                                    ) : (
                                        // 🔴 TAMPILAN TRANSAKSI MASAL (TEXTAREA BESAR)
                                        <div className="relative">
                                            <textarea 
                                                className="w-full border-2 border-slate-100 bg-slate-50 rounded-3xl p-6 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none min-h-[250px] leading-relaxed resize-y placeholder:text-slate-300 placeholder:font-normal text-lg"
                                                placeholder="081234567890&#10;085643210987&#10;089876543210"
                                                value={data.tujuan}
                                                onChange={e => setData('tujuan', e.target.value)}
                                                required
                                            ></textarea>
                                            <span className="absolute top-4 right-4 text-[10px] font-black tracking-wider bg-slate-800 text-white px-3 py-1.5 rounded-xl opacity-80 pointer-events-none">
                                                Pisahkan dgn Enter
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 📋 KOLOM KANAN: DESKRIPSI & CHECKOUT */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* KOTAK DESKRIPSI */}
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Informasi Layanan
                                </h3>
                                
                                {selectedProd ? (
                                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                                        <div className="mb-4 pb-4 border-b border-indigo-100/50">
                                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Kode & Nama</p>
                                            <p className="font-black text-indigo-900">{selectedProd.kode_layanan}</p>
                                            <p className="text-sm font-bold text-slate-600">{selectedProd.nama_layanan}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-indigo-400 mb-2">Deskripsi / Syarat</p>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {deskripsiLayanan}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center border-dashed">
                                        <p className="text-xs font-bold text-slate-400">Pilih produk di samping untuk melihat deskripsi.</p>
                                    </div>
                                )}
                            </div>

                            {/* KALKULATOR & TOMBOL SUBMIT */}
                            <form onSubmit={submit} className="bg-slate-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                                
                                <div className="relative z-10 flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Target Valid</p>
                                        <p className="text-3xl font-black text-white">{validCount} <span className="text-sm font-medium text-slate-400">Nomor</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Biaya</p>
                                        <p className="text-2xl font-black text-emerald-400">Rp {totalPrice.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing || validCount === 0 || !selectedProd}
                                    className="relative z-10 w-full bg-gradient-to-r from-indigo-500 to-blue-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/50 hover:shadow-indigo-500/50 active:scale-[0.98] transition-all uppercase tracking-widest text-sm flex justify-center items-center gap-2 border border-white/10"
                                >
                                    {processing ? 'MENGIRIM DATA...' : '🚀 PROSES PEMBAYARAN'}
                                </button>
                            </form>

                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
