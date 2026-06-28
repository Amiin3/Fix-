import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Show({ auth, rekber }) {
    const { post, processing } = useForm();
    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);

    // 🚨 INI DIA OBATNYA! Kita paksa jadi Number() biar tombol 100% muncul!
    const isBuyer = Number(auth.user.id) === Number(rekber.buyer_id);
    const isSeller = Number(auth.user.id) === Number(rekber.seller_id);

    const actionRequest = (routeUrl, title, text, confirmText, color) => {
        Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonColor: color, confirmButtonText: confirmText })
        .then((result) => { if (result.isConfirmed) post(route(routeUrl, rekber.trx_id), { preserveScroll: true }); });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Invoice ${rekber.trx_id}`} />
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 pt-8 px-5">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/rekber" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-indigo-600"><i className="fa-solid fa-arrow-left"></i></Link>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detail Transaksi</span>
                    </div>

                    {/* BANNER STATUS */}
                    <div className={`rounded-[32px] p-6 mb-6 text-center text-white shadow-xl ${rekber.status === 'secured' ? 'bg-indigo-600' : rekber.status === 'processed' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        <i className={`text-4xl mb-3 fa-solid ${rekber.status === 'secured' ? 'fa-shield-halved' : rekber.status === 'processed' ? 'fa-truck-fast' : 'fa-check-double'}`}></i>
                        <h2 className="text-xl font-black uppercase tracking-tighter">
                            {rekber.status === 'secured' ? 'Menunggu ACC Penjual' : rekber.status === 'processed' ? 'Pesanan Diproses Penjual' : 'Transaksi Selesai'}
                        </h2>
                        <p className="text-xs font-bold opacity-80 mt-1">{rekber.trx_id}</p>
                    </div>

                    {/* RINCIAN DATA */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm mb-6 space-y-4">
                        <div className="flex justify-between"><span className="text-xs text-slate-500 font-bold">Pesanan</span><span className="text-xs font-black text-slate-800">{rekber.judul_pesanan}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 font-bold">Nilai Barang</span><span className="text-xs font-black text-slate-800">Rp {formatRp(rekber.nominal)}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 font-bold">Penjual</span><span className="text-xs font-black text-slate-800">{isSeller ? 'Anda' : rekber.seller_name}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 font-bold">Pembeli</span><span className="text-xs font-black text-slate-800">{isBuyer ? 'Anda' : 'Member MilaStore'}</span></div>
                        
                        {isBuyer && <div className="pt-3 border-t-2 border-dashed flex justify-between"><span className="text-xs font-bold text-rose-500">Biaya Admin (Dibayar Anda)</span><span className="text-xs font-black text-rose-500">Rp {formatRp(rekber.fee)}</span></div>}
                        {isSeller && <div className="pt-3 border-t-2 border-dashed flex justify-between"><span className="text-xs font-bold text-emerald-500">Uang Diterima Nanti</span><span className="text-sm font-black text-emerald-600">Rp {formatRp(rekber.nominal)}</span></div>}
                    </div>

                    {/* ⚡ TOMBOL AKSI UNTUK PENJUAL (ACC REKBER) */}
                    {isSeller && rekber.status === 'secured' && (
                        <div className="animate-in slide-in-from-bottom-5">
                            <p className="text-[10px] font-bold text-slate-400 text-center mb-2 uppercase tracking-widest">Aksi Penjual</p>
                            <button onClick={() => actionRequest('rekber.acc', 'ACC Rekber Ini?', 'Dana Pembeli sudah diamankan sistem. Silakan ACC dan kirim barangnya!', 'Ya, ACC & Proses!', '#f59e0b')} disabled={processing} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-amber-500/30 active:scale-95 transition-all">
                                <i className="fa-solid fa-check-double mr-2"></i> ACC PERMINTAAN REKBER
                            </button>
                        </div>
                    )}

                    {/* ⚡ TOMBOL AKSI UNTUK PEMBELI (PENCAIRAN SALDO) */}
                    {isBuyer && rekber.status === 'processed' && (
                        <div className="animate-in slide-in-from-bottom-5">
                            <p className="text-[10px] font-bold text-slate-400 text-center mb-2 uppercase tracking-widest">Aksi Pembeli</p>
                            <button onClick={() => actionRequest('rekber.release', 'Barang Sudah Aman?', 'Saldo akan langsung dicairkan ke rekening Penjual.', 'Ya, Cairkan Saldo!', '#10b981')} disabled={processing} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/30 active:scale-95 transition-all">
                                <i className="fa-solid fa-hand-holding-dollar mr-2"></i> BARANG DITERIMA (CAIRKAN SALDO)
                            </button>
                        </div>
                    )}

                    {rekber.status === 'success' && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest">
                            <i className="fa-solid fa-lock text-emerald-500 mr-1"></i> TRANSAKSI SELESAI
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
