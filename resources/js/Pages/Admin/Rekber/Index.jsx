import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ auth, rekbers }) {
    const { flash } = usePage().props;
    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);

    // 📢 TANGKAP PESAN DARI SERVER
    useEffect(() => {
        if (flash?.error) Swal.fire('Gagal!', flash.error, 'error');
        if (flash?.success) Swal.fire('Sah!', flash.success, 'success');
    }, [flash]);

    const handleAction = (trx_id, actionType) => {
        const isRefund = actionType === 'refund';
        Swal.fire({
            title: isRefund ? 'Refund ke Pembeli?' : 'Paksa Cair ke Penjual?',
            text: isRefund 
                ? "Saldo Pembeli akan dikembalikan utuh. Gunakan jika penjual menipu." 
                : "Saldo akan langsung dikirim ke Penjual. Gunakan jika pembeli kabur.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: isRefund ? '#e11d48' : '#10b981',
            confirmButtonText: 'Ya, Ketuk Palu!'
        }).then((result) => {
            if (result.isConfirmed) {
                // 🚀 CARA BENER NGIRIM DATA KE LARAVEL PAKE ROUTER INERTIA
                router.post(route('admin.rekber.action', trx_id), { action: actionType }, { preserveScroll: true });
            }
        });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'secured': return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">DANA DIAMANKAN</span>;
            case 'processed': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">DIPROSES PENJUAL</span>;
            case 'success': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">SELESAI</span>;
            case 'refunded': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">DIKEMBALIKAN</span>;
            default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Rekber - MilaStore" />
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 p-5 md:p-10">
                <div className="max-w-4xl mx-auto">
                    
                    <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl mb-8 flex justify-between items-center text-white relative overflow-hidden">
                        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-rose-500 opacity-20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Panel Hakim <span className="text-rose-500">Rekber</span></h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kendali Penuh Transaksi Member</p>
                        </div>
                        <i className="fa-solid fa-scale-balanced text-5xl text-rose-500/50"></i>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-5 border-b border-slate-100">ID / Pesanan</th>
                                        <th className="p-5 border-b border-slate-100">Pembeli</th>
                                        <th className="p-5 border-b border-slate-100">Penjual</th>
                                        <th className="p-5 border-b border-slate-100">Nilai Barang</th>
                                        <th className="p-5 border-b border-slate-100">Status</th>
                                        <th className="p-5 border-b border-slate-100 text-right">Tombol Dewa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rekbers.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-10 font-bold text-slate-400">Belum ada transaksi Rekber.</td></tr>
                                    ) : (
                                        rekbers.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                                <td className="p-5">
                                                    <p className="text-[10px] font-bold text-slate-400">{r.trx_id}</p>
                                                    <p className="text-sm font-black text-slate-800">{r.judul_pesanan}</p>
                                                </td>
                                                <td className="p-5 text-xs font-bold text-indigo-600">ID: {r.buyer_id}</td>
                                                <td className="p-5">
                                                    <p className="text-xs font-black text-slate-800">{r.seller_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{r.seller_whatsapp}</p>
                                                </td>
                                                <td className="p-5 text-sm font-black text-emerald-600">Rp {formatRp(r.nominal)}</td>
                                                <td className="p-5">{getStatusBadge(r.status)}</td>
                                                <td className="p-5 text-right">
                                                    {['secured', 'processed'].includes(r.status) ? (
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => handleAction(r.trx_id, 'refund')} className="bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all" title="Refund ke Pembeli">
                                                                <i className="fa-solid fa-rotate-left"></i> REFUND
                                                            </button>
                                                            <button onClick={() => handleAction(r.trx_id, 'forward')} className="bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all" title="Paksa Cair ke Penjual">
                                                                <i className="fa-solid fa-check-double"></i> CAIRKAN
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300"><i className="fa-solid fa-lock"></i> TERKUNCI</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
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
