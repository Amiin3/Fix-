import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, CheckCircle, AlertCircle, Package, Settings, Filter, ChevronDown, Percent, Coins } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function DigiflazzManager({ auth, products, stats }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // STATE UNTUK KEUNTUNGAN (MARKUP)
    const [markupPersen, setMarkupPersen] = useState(2); // Default 2%
    const [markupFlat, setMarkupFlat] = useState(500);   // Default Rp 500

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    // FUNGSI SINKRONISASI PINTAR
    const handleSync = async () => {
        Swal.fire({
            title: 'Mulai Sinkronisasi?',
            html: `Harga jual akan diatur otomatis dengan keuntungan:<br><br><b>${markupPersen}%</b> + <b>Rp ${formatRp(markupFlat)}</b> dari harga modal Digiflazz.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Tarik & Update Harga!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSyncing(true);
                Swal.fire({
                    title: 'Mesin Sedang Bekerja...',
                    text: 'Menarik ribuan data dari provider dan menghitung ulang harga jual. Jangan tutup halaman ini.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                try {
                    // Mengirim perintah Sync beserta setting keuntungan
                    const response = await axios.post(route('admin.digiflazz.sync'), {
                        markup_persen: markupPersen,
                        markup_flat: markupFlat
                    });

                    if (response.data.success || response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sempurna! 🚀',
                            text: response.data.message || 'Semua produk & harga berhasil diupdate dengan markup terbaru.',
                            confirmButtonColor: '#3b82f6',
                        }).then(() => window.location.reload());
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Opps! Gagal Update',
                        text: error.response?.data?.message || 'Server sibuk atau koneksi API Digiflazz terputus. Coba lagi!',
                        confirmButtonColor: '#ef4444'
                    });
                } finally {
                    setIsSyncing(false);
                }
            }
        });
    };

    const filteredProducts = products ? products.filter((item) => {
        return (
            (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }) : [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Digiflazz Manager - MilaStore Admin" />
            
            <div className="min-h-screen pb-32 bg-[#F4F7FB] font-['Outfit']">
                
                {/* 🌈 HEADER SULTAN ADMIN */}
                <div className="pt-8 pb-32 px-6 rounded-b-[3rem] bg-gradient-to-br from-slate-900 via-[#0f172a] to-blue-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4 text-white">
                            <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                                <i className="fa-solid fa-server text-2xl text-blue-400"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Produk Digiflazz</h2>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mt-1 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Koneksi H2H Stabil
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📦 KONTROL MARKUP & SYNC */}
                <div className="max-w-7xl mx-auto px-5 -mt-20 relative z-50 mb-8">
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.08)] border border-slate-50">
                        <h4 className="font-black text-slate-800 text-base mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <i className="fa-solid fa-gears text-blue-500"></i> Mesin Penarik Data (Sync) & Seting Keuntungan
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            
                            {/* MARKUP PERSEN */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2">
                                    <Percent className="w-3 h-3 text-emerald-500" /> Keuntungan Persen (%)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={markupPersen} 
                                        onChange={(e) => setMarkupPersen(e.target.value)}
                                        className="w-full pl-4 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-slate-800 text-lg"
                                        placeholder="Misal: 2"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400">%</span>
                                </div>
                            </div>

                            {/* MARKUP FLAT / RUPIAH */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block flex items-center gap-2">
                                    <Coins className="w-3 h-3 text-amber-500" /> Keuntungan Tetap (Rp)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                                    <input 
                                        type="number" 
                                        value={markupFlat} 
                                        onChange={(e) => setMarkupFlat(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 font-black text-slate-800 text-lg"
                                        placeholder="Misal: 500"
                                    />
                                </div>
                            </div>

                            {/* TOMBOL SYNC SULTAN */}
                            <div>
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isSyncing ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white active:scale-95'}`}
                                >
                                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'MENGHITUNG...' : 'TARIK & UPDATE HARGA'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* 📦 TABEL PENCARIAN (Tetap Sama Seperti Sebelumnya) */}
                <div className="max-w-7xl mx-auto px-5 relative z-50">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                        
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                            <div className="relative w-full md:w-1/2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari Nama Produk, Kategori, atau SKU..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Detail Produk</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SKU Code</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Harga Modal</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.length > 0 ? filteredProducts.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 text-sm mb-1">{item.product_name}</div>
                                                <div className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest">
                                                    {item.category}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                                                    {item.sku}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-slate-800 flex items-center gap-1">
                                                    <span className="text-xs text-slate-400 font-bold">Rp</span>
                                                    {item.price?.toLocaleString('id-ID')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center w-max gap-1.5 ${item.status === 'active' || item.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' || item.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                <h3 className="text-slate-800 font-black text-lg mb-1">Belum Ada Data</h3>
                                                <p className="text-slate-400 text-sm">Atur keuntungan di atas dan klik Tarik & Update Harga!</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
