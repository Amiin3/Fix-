import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Riwayat({ auth, transaksi }) {
    const [syncingId, setSyncingId] = useState(null);

    // 🔥 MESIN SMART POLLING 6 DETIK
    useEffect(() => {
        // 1. Kumpulkan ID transaksi yang statusnya masih 'Pending'
        const pendingIds = transaksi.data.filter(t => t.status === 'Pending').map(t => t.id);

        // 2. Jika tidak ada yang Pending, matikan mesin agar server santai
        if (pendingIds.length === 0) return;

        // 3. Mulai hitungan mundur 6 detik
        const interval = setInterval(async () => {
            try {
                const res = await axios.post(route('riwayat.check-status'), { ids: pendingIds });
                
                // Cek apakah ada status yang berubah di database
                const statusBerubah = res.data.some(update => {
                    const dataLama = transaksi.data.find(t => t.id === update.id);
                    return dataLama && dataLama.status !== update.status;
                });

                // Jika berubah (misal dari Pending ke Sukses), refresh halaman diam-diam tanpa kedip
                if (statusBerubah) { 
                    router.reload({ preserveScroll: true }); 
                }
            } catch (e) { 
                // Abaikan jika error jaringan sesaat, coba lagi 6 detik kemudian
            }
        }, 6000);

        return () => clearInterval(interval);
    }, [transaksi.data]);

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        Swal.fire({ title: 'Tersalin!', text: text, icon: 'success', timer: 1500, showConfirmButton: false });
    };

    const handleSync = (ref_id) => {
        setSyncingId(ref_id);
        router.post(route('riwayat.sync'), { ref_id: ref_id }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setSyncingId(null);
                const flash = page.props.flash;
                if (flash?.success) Swal.fire('Update!', flash.success, 'success');
                else if (flash?.info) Swal.fire('Info', flash.info, 'info');
                else if (flash?.error) Swal.fire('Oops', flash.error, 'error');
            },
            onError: () => {
                setSyncingId(null);
                Swal.fire('Error', 'Gagal menghubungi server.', 'error');
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Transaksi - MilaStore" />
            <div className="min-h-screen bg-[#f1f5f9] font-['Outfit'] pb-24">
                {/* HEADER SULTAN */}
                <div className="bg-slate-900 pt-10 pb-20 px-6 rounded-b-[40px] shadow-xl relative">
                    <div className="max-w-xl mx-auto">
                        <h1 className="text-2xl font-black text-white tracking-tight">Riwayat Transaksi</h1>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Sistem Auto Sync 3 Provider</p>
                    </div>
                </div>
                {/* LIST TRANSAKSI */}
                <div className="max-w-xl mx-auto px-4 -mt-12 relative z-10 space-y-4">
                    {transaksi.data.length === 0 ? (
                        <div className="bg-white p-10 rounded-[24px] text-center shadow-sm">
                            <i className="fa-solid fa-receipt text-4xl text-slate-200 mb-3"></i>
                            <h4 className="font-black text-slate-400">Belum ada transaksi.</h4>
                        </div>
                    ) : (
                        transaksi.data.map((trx) => (
                            <div key={trx.id} className="bg-white rounded-[24px] p-5 shadow-lg shadow-slate-200/50 border border-slate-50 transition-all hover:scale-[1.01]">
                                <div className="flex justify-between items-start mb-4 border-b border-dashed border-slate-200 pb-4">
                                    <div>
                                        <div className="text-[9px] font-black text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded mb-1">{trx.ref_id}</div>
                                        <h3 className="font-black text-slate-800 leading-tight">{trx.kode_layanan}</h3>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1">{new Date(trx.tanggal).toLocaleString('id-ID')}</div>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="font-black text-indigo-600">Rp {formatRp(trx.harga)}</h4>
                                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${trx.status === 'Sukses' ? 'bg-emerald-100 text-emerald-700' : trx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {trx.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Tujuan / Nomor HP</span>
                                    <div className="font-mono text-lg font-black text-slate-800 tracking-widest">{trx.tujuan}</div>
                                </div>
                                {/* SN / TOKEN PLN */}
                                {trx.sn && trx.status === 'Sukses' && (
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex justify-between items-center mb-4">
                                        <div className="overflow-hidden">
                                            <span className="text-[9px] font-black text-emerald-600 uppercase block mb-0.5">SN / Token / Ref:</span>
                                            <span className="font-mono text-xs font-black text-emerald-800 truncate block">{trx.sn}</span>
                                        </div>
                                        <button onClick={() => copyToClipboard(trx.sn)} className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm active:scale-95">
                                            <i className="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                )}
                                {/* PESAN / KETERANGAN */}
                                {(trx.keterangan || trx.status === 'Pending') && (
                                    <div className="bg-slate-50 p-3 rounded-xl text-[10px] font-bold text-slate-500 mb-4 leading-relaxed whitespace-pre-line border border-slate-100">
                                        <i className="fa-solid fa-circle-info mr-1 text-indigo-400"></i> {trx.keterangan || 'Menunggu respon dari server pusat...'}
                                    </div>
                                )}
                                {/* TOMBOL CEK STATUS (HANYA UNTUK PENDING) */}
                                {trx.status === 'Pending' && (
                                    <button
                                        onClick={() => handleSync(trx.ref_id)}
                                        disabled={syncingId === trx.ref_id}
                                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                                    >
                                        {syncingId === trx.ref_id ? (
                                            <><i className="fa-solid fa-spinner fa-spin"></i> Mengecek Server...</>
                                        ) : (
                                            <><i className="fa-solid fa-rotate-right"></i> Tarik Status Provider</>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
