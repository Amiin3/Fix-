import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function History({ orders = { data: [] } }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-800">
            <Head title="Riwayat Transaksi" />
            <div className="bg-indigo-900 p-8 pt-12 text-white rounded-b-[40px] shadow-xl relative">
                <Link href="/dashboard" className="absolute top-8 left-6 text-white/70 text-sm font-black no-underline">❮ KEMBALI</Link>
                <h1 className="text-2xl font-black text-center mt-6 uppercase tracking-widest">Riwayat</h1>
            </div>
            <div className="max-w-md mx-auto px-6 mt-6">
                <div className="space-y-4">
                    {orders.data && orders.data.length > 0 ? orders.data.map((o, i) => (
                        <div key={i} className="bg-white p-5 rounded-[25px] shadow-sm border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">{o.created_at || 'Hari Ini'}</p>
                                <h3 className="text-sm font-black m-0 uppercase">{o.nama_layanan || 'Transaksi'}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-indigo-600 m-0">Rp {new Intl.NumberFormat('id-ID').format(o.harga_jual || 0)}</p>
                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${o.status === 'Sukses' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{o.status || 'Pending'}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-10 bg-white rounded-[30px] shadow-sm">
                            <p className="text-4xl mb-2">🧾</p>
                            <p className="text-[10px] font-black uppercase text-slate-400">Belum ada transaksi</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
