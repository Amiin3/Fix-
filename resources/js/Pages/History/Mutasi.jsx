import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Mutasi({ mutasi = [], statistik = {} }) {
    const [filter, setFilter] = useState('SEMUA');
    const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka || 0);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    // Filter Data Mutasi
    const filteredMutasi = mutasi.filter(item => filter === 'SEMUA' ? true : item.tipe === filter);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Head title="Statistik Mutasi - Amifi Store" />

            {/* HEADER PREMIUM */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 pt-6 px-5 pb-24 rounded-b-[40px] shadow-[0_10px_30px_rgba(245,158,11,0.2)] relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="max-w-md mx-auto flex items-center justify-between relative z-10 text-white">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-white opacity-80 hover:opacity-100 text-2xl no-underline transition-opacity"><i className="fa-solid fa-arrow-left-long"></i></Link>
                        <h5 className="m-0 font-black text-lg tracking-wide">Statistik Mutasi</h5>
                    </div>
                </div>

                <div className="max-w-md mx-auto mt-6 text-center relative z-10 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Saldo Tersedia</p>
                    <h2 className="text-4xl font-black tracking-tight mb-0">Rp {formatRp(statistik.saldo_sekarang)}</h2>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 -mt-16 relative z-20">
                {/* KARTU STATISTIK BULANAN */}
                <div className="bg-white rounded-[24px] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-100 mb-6">
                    <div className="text-center mb-4 pb-4 border-b border-slate-100">
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-3 py-1 rounded-full uppercase tracking-widest">Periode: {statistik.bulan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-center w-1/2 border-r border-slate-100">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-lg mx-auto mb-2"><i className="fa-solid fa-arrow-down"></i></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-0.5">Uang Masuk</p>
                            <h4 className="text-sm font-black text-emerald-600">Rp {formatRp(statistik.total_masuk)}</h4>
                        </div>
                        <div className="text-center w-1/2">
                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-lg mx-auto mb-2"><i className="fa-solid fa-arrow-up"></i></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-0.5">Uang Keluar</p>
                            <h4 className="text-sm font-black text-rose-600">Rp {formatRp(statistik.total_keluar)}</h4>
                        </div>
                    </div>
                </div>

                {/* FILTER TAB */}
                <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-5">
                    {['SEMUA', 'MASUK', 'KELUAR'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setFilter(tab)} 
                            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${filter === tab ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TIMELINE MUTASI */}
                <h3 className="text-xs font-black text-slate-800 tracking-wider mb-4 ml-1 uppercase">Riwayat Aktivitas</h3>
                <div className="space-y-3">
                    {filteredMutasi.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                            <div className="text-4xl mb-2 opacity-30">📭</div>
                            <div className="font-bold text-sm text-slate-500">Tidak ada mutasi ditemukan.</div>
                        </div>
                    ) : (
                        filteredMutasi.map((item, idx) => {
                            const isMasuk = item.tipe === 'MASUK';
                            const statusColor = item.status === 'Sukses' ? 'text-emerald-500' : (['Gagal', 'Batal'].includes(item.status) ? 'text-rose-500' : 'text-amber-500');
                            
                            return (
                                <div key={idx} className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:border-amber-200 transition-colors">
                                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-xl shrink-0 ${isMasuk ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <i className={`fa-solid ${isMasuk ? 'fa-wallet' : 'fa-receipt'}`}></i>
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-start mb-1">
                                            <h6 className="font-black text-slate-800 text-xs truncate pr-2 m-0 leading-tight">{item.keterangan}</h6>
                                            <span className={`font-black text-sm whitespace-nowrap ${isMasuk ? 'text-emerald-500' : 'text-slate-800'}`}>
                                                {isMasuk ? '+' : '-'} Rp {formatRp(item.nominal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] font-bold text-slate-400">{formatDate(item.created_at)}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md ${statusColor}`}>{item.status}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
