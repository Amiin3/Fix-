import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, rekbers = [] }) {
    const [filter, setFilter] = useState('all'); 
    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);

    const filteredData = rekbers.filter(item => {
        if (filter === 'buying') return item.buyer_id === auth.user.id;
        if (filter === 'selling') return item.seller_id === auth.user.id;
        return true;
    });

    const getStatusInfo = (status) => {
        switch(status) {
            case 'secured': return { text: 'DANA AMAN', color: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-500' };
            case 'processed': return { text: 'DIPROSES', color: 'bg-amber-100 text-amber-600', border: 'border-amber-500' };
            case 'success': return { text: 'SELESAI', color: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-500' };
            default: return { text: status, color: 'bg-slate-100 text-slate-400', border: 'border-slate-200' };
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Rekber" />
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 pt-8 px-5">
                <div className="max-w-md mx-auto">
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter text-slate-800 uppercase">Rekber <span className="text-indigo-600">Hub</span></h2>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Daftar Invoice Transaksi</p>
                        </div>
                        <Link href={route('rekber.create')} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                            <i className="fa-solid fa-plus text-xl"></i>
                        </Link>
                    </div>

                    {/* FILTER TABS */}
                    <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        {['all', 'buying', 'selling'].map(t => (
                            <button key={t} onClick={() => setFilter(t)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
                                {t === 'all' ? 'Semua' : t === 'buying' ? 'Pembeli' : 'Penjual'}
                            </button>
                        ))}
                    </div>

                    {/* DAFTAR INVOICE */}
                    <div className="space-y-4">
                        {filteredData.length === 0 ? (
                            <div className="text-center py-20">
                                <i className="fa-solid fa-receipt text-5xl text-slate-200 mb-4 block"></i>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada Invoice</p>
                            </div>
                        ) : (
                            filteredData.map((item) => {
                                const isBuyer = auth.user.id === item.buyer_id;
                                const status = getStatusInfo(item.status);
                                return (
                                    <Link key={item.id} href={route('rekber.show', item.trx_id)} className={`block bg-white rounded-2xl p-4 shadow-sm border-l-4 transition-all active:scale-95 ${status.border}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${isBuyer ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                    {isBuyer ? 'Saya Pembeli' : 'Saya Penjual'}
                                                </span>
                                                <h4 className="text-sm font-black text-slate-800 mt-1">{item.judul_pesanan}</h4>
                                            </div>
                                            <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-dashed pt-2">
                                            <div className="text-[10px] text-slate-400 font-bold tracking-widest">{item.trx_id}</div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Nilai Barang</p>
                                                <p className="text-sm font-black text-slate-800">Rp {formatRp(item.nominal)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
