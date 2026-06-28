import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import moment from 'moment';

export default function Statistik({ auth, saldo_user = 0, pemasukan = 0, pengeluaran = 0, riwayat = [] }) {
    const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
    
    // Safety check biar gak pembagian nol
    const efisiensi = pemasukan > 0 ? Math.round(((pemasukan - pengeluaran) / pemasukan) * 100) : 0;

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Premium Analytics - MilaStore" />
            <div className="min-h-screen bg-[#050505] text-slate-300 pb-32 font-['Plus_Jakarta_Sans']">
                <div className="bg-gradient-to-b from-[#1A1A1A] to-[#050505] pt-12 pb-24 px-6 rounded-b-[60px] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 opacity-5 rounded-full blur-[100px]"></div>
                    <div className="max-w-md mx-auto relative z-10 text-center">
                        <div className="flex justify-between items-center mb-10">
                            <Link href="/dashboard" className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400">
                                <i className="fa-solid fa-chevron-left"></i>
                            </Link>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500">Portfolio Pro</h2>
                            <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-4">
                            {formatRp(saldo_user)}
                        </h1>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Performance: {efisiensi}%
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-6 -mt-12 relative z-20">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#111111] rounded-[30px] p-5 border border-white/5 shadow-xl">
                            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                                <i className="fa-solid fa-arrow-down-short-wide"></i>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inflow</p>
                            <h3 className="text-sm font-black text-white mt-1">{formatRp(pemasukan)}</h3>
                        </div>
                        <div className="bg-[#111111] rounded-[30px] p-5 border border-white/5 shadow-xl">
                            <div className="w-9 h-9 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                                <i className="fa-solid fa-arrow-up-short-wide"></i>
                            </div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Outflow</p>
                            <h3 className="text-sm font-black text-white mt-1">{formatRp(pengeluaran)}</h3>
                        </div>
                    </div>

                    <div className="bg-[#111111] rounded-[40px] p-7 border border-white/5 shadow-2xl mb-8">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Transaction History</h4>
                            <div className="h-1 w-8 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div className="space-y-6">
                            {riwayat && riwayat.length > 0 ? riwayat.map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg border transition-all ${item.type === 'in' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-white/5 text-slate-500 border-white/5 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 group-hover:border-yellow-500/10'}`}>
                                            <i className={`fa-solid ${item.type === 'in' ? 'fa-plus' : 'fa-minus'}`}></i>
                                        </div>
                                        <div className="max-w-[130px]">
                                            <h5 className="text-[11px] font-black text-white uppercase truncate leading-none mb-1.5">{item.title}</h5>
                                            <span className="text-[9px] font-bold text-slate-600">{moment(item.created_at).format('DD MMM, HH:mm')}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xs font-black ${item.type === 'in' ? 'text-emerald-500' : 'text-slate-200'}`}>
                                            {item.type === 'in' ? '+' : '-'}{formatRp(item.amt)}
                                        </p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${['success', 'sukses', 'lunas'].includes(item.status?.toLowerCase()) ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            ● {item.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-20 font-black text-[10px] uppercase tracking-widest">Empty Data</div>
                            )}
                        </div>
                    </div>

                    <Link href="/deposit" className="group flex items-center justify-between bg-yellow-500 hover:bg-yellow-400 text-black p-6 rounded-[35px] shadow-xl relative">
                        <div className="relative z-10">
                            <h4 className="font-black text-sm mb-0.5">Deposit Assets</h4>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Prepare for next transaction</p>
                        </div>
                        <div className="w-12 h-12 bg-black text-yellow-500 rounded-2xl flex items-center justify-center text-xl shadow-xl relative z-10">
                            <i className="fa-solid fa-plus"></i>
                        </div>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
