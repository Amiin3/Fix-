import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function PoKaje(props) {
    const { auth, flash, products = [], layanan = [] } = props;
    const listProduk = products.length > 0 ? products : layanan;
    const saldoUser = auth?.user?.saldo || 0;

    const { data, setData, post, processing, errors, reset } = useForm({
        tujuan: '',
        kode_layanan: '',
    });

    const [search, setSearch] = useState('');
    const [isMulti, setIsMulti] = useState(false); 

    const filteredProduk = listProduk.filter(p =>
        (p.nama_layanan || p.nama || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.kode_layanan || '').toLowerCase().includes(search.toLowerCase())
    );

    const submit = (e) => {
        e.preventDefault();
        post(route('order.po-xda'), {
            onSuccess: () => reset('tujuan'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Order Paket Premium" />

            <div className="max-w-4xl mx-auto">
                {/* Header Premium */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-3xl shadow-lg p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
                    <div className="z-10 text-center md:text-left mb-4 md:mb-0">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">🚀 Layanan Data Premium</h1>
                        <p className="text-blue-100 mt-1 font-medium text-sm md:text-base">Sistem Transaksi Cepat & Multi-Antrian</p>
                    </div>
                    <div className="z-10 bg-black/20 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 text-center">
                        <span className="text-xs text-blue-100 block font-medium">Sisa Saldo</span>
                        <span className="font-black text-xl md:text-2xl">
                            Rp {new Intl.NumberFormat('id-ID').format(saldoUser)}
                        </span>
                    </div>
                </div>

                {/* Notifikasi Pop-up */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm mb-6 flex items-start">
                        <div className="text-emerald-500 text-xl mr-3">✨</div>
                        <div>
                            <h3 className="text-emerald-800 font-bold">Transaksi Sukses!</h3>
                            <p className="text-emerald-600 text-sm mt-1">{flash.success}</p>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl shadow-sm mb-6 flex items-start">
                        <div className="text-rose-500 text-xl mr-3">⚠️</div>
                        <div>
                            <h3 className="text-rose-800 font-bold">Gagal Memproses</h3>
                            <p className="text-rose-600 text-sm mt-1">{flash.error}</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                    <form onSubmit={submit} className="p-6 md:p-8">
                        
                        {/* INPUT NOMOR & TOGGLE */}
                        <div className="mb-8 relative">
                            <div className="flex justify-between items-end mb-3">
                                <label className="flex items-center text-slate-800 font-bold text-lg">
                                    <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                                    Nomor Tujuan
                                </label>
                                <button 
                                    type="button" 
                                    onClick={() => setIsMulti(!isMulti)}
                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition shadow-sm border border-indigo-100"
                                >
                                    {isMulti ? 'Ganti ke Single Input' : '+ Multi Transaksi'}
                                </button>
                            </div>

                            {isMulti ? (
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-mono shadow-inner resize-none"
                                    rows="4"
                                    placeholder="Contoh Multi:&#10;08123456789&#10;08987654321&#10;(Pisahkan dengan Enter/Baris Baru)"
                                    value={data.tujuan}
                                    onChange={e => setData('tujuan', e.target.value)}
                                    required
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-mono shadow-inner text-lg"
                                    placeholder="Contoh: 08123456789"
                                    value={data.tujuan}
                                    onChange={e => setData('tujuan', e.target.value)}
                                    required
                                />
                            )}
                            {errors.tujuan && <span className="text-rose-500 text-sm mt-2 block font-medium">{errors.tujuan}</span>}
                        </div>

                        {/* PILIH PAKET (SLIM LIST VIEW DENGAN DESKRIPSI HIDE/SHOW) */}
                        <div className="mb-8">
                            <label className="flex items-center text-slate-800 font-bold mb-3 text-lg">
                                <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                                Pilih Paket Data
                            </label>

                            <input 
                                type="text" 
                                placeholder="🔍 Cari nama paket..." 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 mb-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredProduk.length > 0 ? (
                                    filteredProduk.map((item, index) => {
                                        // Cek apakah produk ini sedang dipilih
                                        const isSelected = data.kode_layanan === item.kode_layanan;

                                        return (
                                            <label key={index} htmlFor={`prod-${item.kode_layanan}`} className="block relative cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    id={`prod-${item.kode_layanan}`}
                                                    name="kode_layanan"
                                                    value={item.kode_layanan}
                                                    onChange={e => setData('kode_layanan', e.target.value)}
                                                    className="peer sr-only"
                                                    required
                                                />
                                                {/* UI SLIM CARD */}
                                                <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl transition-all duration-300 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:shadow-md flex flex-col hover:border-blue-300">
                                                    
                                                    {/* Baris Atas: Nama & Harga */}
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-slate-800 text-base">{item.nama_layanan || item.nama}</div>
                                                        </div>
                                                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                            <div className="text-blue-700 font-black text-lg">
                                                                Rp {new Intl.NumberFormat('id-ID').format(item.harga_jual || item.harga)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 🎯 DESKRIPSI HANYA MUNCUL JIKA DIPILIH */}
                                                    {isSelected && item.deskripsi && (
                                                        <div className="mt-3 text-sm text-blue-800 leading-relaxed bg-white/60 p-3 rounded-xl border border-blue-200 shadow-sm transition-all fade-in">
                                                            <span className="font-bold text-blue-600 block mb-1">📝 Detail Layanan:</span>
                                                            {item.deskripsi}
                                                        </div>
                                                    )}

                                                </div>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <div className="py-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="font-medium">⚠️ Tidak ada paket KDA/PDAP ditemukan.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TOMBOL SUBMIT */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={processing || !data.kode_layanan || !data.tujuan}
                                className={`w-full font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center ${
                                    processing || !data.kode_layanan || !data.tujuan
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-1'
                                }`}
                            >
                                {processing ? '⏳ MEMPROSES...' : '🚀 KIRIM ORDER SEKARANG'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
