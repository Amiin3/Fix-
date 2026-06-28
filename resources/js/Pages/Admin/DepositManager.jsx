import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function DepositManager({ auth, deposits, settings = [], site = {} }) {
    // Fungsi pintar buat narik data lama dari database
    const getSetting = (metode) => {
        const found = settings.find(s => s.metode === metode);
        return found ? found.nomor : '';
    };

    // 🛑 MURNI STATE GOPAY DAN SHOPEE (Gak ada lagi QRIS Utama)
    const [qrisGopay, setQrisGopay] = useState(getSetting('QRIS_GOPAY') || '');
    const [qrisShopee, setQrisShopee] = useState(getSetting('QRIS_SHOPEE') || '');

    const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);

    const handleSaveQris = (e) => {
        e.preventDefault();
        
        // Tarik data bank Jago & Seabank lama biar gak hilang ke-reset
        const jago = settings.find(s => s.metode === 'JAGO') || {};
        const seabank = settings.find(s => s.metode === 'SEABANK') || {};

        const payload = {
            email: site?.bank_email || '',
            password: site?.bank_password || '',
            jago_acc: jago.nomor || '',
            jago_name: jago.atas_nama || '',
            seabank_acc: seabank.nomor || '',
            seabank_name: seabank.atas_nama || '',
            qris_gopay: qrisGopay,
            qris_shopee: qrisShopee
        };

        router.post(route('admin.deposit.qris'), payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (page.props.flash.success) Swal.fire('Berhasil!', page.props.flash.success, 'success');
                if (page.props.flash.error) Swal.fire('Gagal!', page.props.flash.error, 'error');
            }
        });
    };

    const handleProcess = (id, status, user_name, amount) => {
        const actionText = status === 'Sukses' ? 'Setujui' : 'Tolak';
        const actionColor = status === 'Sukses' ? '#10b981' : '#ef4444';
        Swal.fire({
            title: `${actionText} Deposit?`,
            html: `Anda akan me-${actionText.toLowerCase()} deposit dari <b>${user_name}</b> sebesar <b>Rp ${formatRp(amount)}</b>.`,
            icon: 'warning', showCancelButton: true, confirmButtonColor: actionColor, cancelButtonText: 'Batal', confirmButtonText: `Ya, ${actionText}!`
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.deposit.process'), { id: id, status: status }, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        if (page.props.flash.success) Swal.fire('Berhasil!', page.props.flash.success, 'success');
                        if (page.props.flash.error) Swal.fire('Gagal!', page.props.flash.error, 'error');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Deposit - Admin" />
            <div className="min-h-screen bg-[#f1f5f9] font-['Outfit'] pb-20">
                <div className="bg-slate-900 pt-8 pb-20 px-6 rounded-b-[40px] shadow-xl relative">
                    <div className="max-w-6xl mx-auto flex justify-between items-center text-white">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight"><i className="fa-solid fa-wallet text-indigo-500 mr-2"></i> Kelola Deposit</h1>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Sistem Validasi QRIS Manual</p>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
                    
                    {/* 🛑 FORM PENGATURAN STRING QRIS (GOPAY & SHOPEE) 🛑 */}
                    <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 flex flex-col gap-6">
                        <div className="border-b border-slate-100 pb-2">
                            <h3 className="font-black text-slate-800"><i className="fa-solid fa-qrcode text-indigo-500 mr-2"></i> Pengaturan String NMID QRIS</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">Masukkan string QRIS dari GoBiz atau Shopee Partner Anda di sini.</p>
                        </div>

                        {/* KOTAK INPUT QRIS GOPAY */}
                        <div className="flex flex-col md:flex-row gap-4 items-center bg-green-50/50 p-4 rounded-2xl border border-green-100">
                            <div className="w-full md:w-1/3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-wallet"></i></div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">QRIS GoPay</h4>
                                        <p className="text-[10px] font-bold text-green-600 uppercase">Merchant GoBiz</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-2/3">
                                <input 
                                    type="text" 
                                    value={qrisGopay} 
                                    onChange={e => setQrisGopay(e.target.value)} 
                                    placeholder="Tempel String GoPay (000201010211...)" 
                                    className="w-full bg-white border border-green-200 p-3 rounded-xl font-mono text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all shadow-sm" 
                                />
                            </div>
                        </div>

                        {/* KOTAK INPUT QRIS SHOPEE */}
                        <div className="flex flex-col md:flex-row gap-4 items-center bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                            <div className="w-full md:w-1/3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-bag-shopping"></i></div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">QRIS ShopeePay</h4>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase">Shopee Partner</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-2/3 flex flex-col sm:flex-row gap-3">
                                <input 
                                    type="text" 
                                    value={qrisShopee} 
                                    onChange={e => setQrisShopee(e.target.value)} 
                                    placeholder="Tempel String Shopee (000201010211...)" 
                                    className="w-full bg-white border border-orange-200 p-3 rounded-xl font-mono text-xs focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all shadow-sm" 
                                />
                                <button onClick={handleSaveQris} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all shrink-0 w-full sm:w-auto">
                                    <i className="fa-solid fa-save mr-2"></i> SIMPAN SEMUA
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* TABEL DEPOSIT */}
                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(deposits?.data || []).length === 0 ? (
                                        <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold text-sm">Belum ada data deposit.</td></tr>
                                    ) : (
                                        deposits.data.map((d) => {
                                            const isPending = d.status === 'Pending';
                                            let stBadge = 'bg-amber-100 text-amber-700';
                                            if (d.status === 'Sukses') stBadge = 'bg-emerald-100 text-emerald-700';
                                            if (d.status === 'Gagal' || d.status === 'Dibatalkan') stBadge = 'bg-rose-100 text-rose-700';
                                            return (
                                                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="text-xs font-black text-slate-800">#{d.id}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">{new Date(d.created_at).toLocaleString('id-ID')}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm font-black text-indigo-600">{d.user_name}</div>
                                                        <div className="text-[10px] font-bold text-slate-500">{d.user_email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm font-black text-emerald-600 tracking-tight">Rp {formatRp(d.total_bayar)}</div>
                                                        <div className="text-[9px] font-black text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">KODE: {d.kode_unik}</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${stBadge}`}>{d.status}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {isPending ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => handleProcess(d.id, 'Gagal', d.user_name, d.total_bayar)} className="bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm"><i className="fa-solid fa-xmark"></i></button>
                                                                <button onClick={() => handleProcess(d.id, 'Sukses', d.user_name, d.total_bayar)} className="bg-emerald-500 text-white hover:bg-emerald-600 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm"><i className="fa-solid fa-check"></i></button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-300"><i className="fa-solid fa-lock mr-1"></i> Selesai</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                            <div>Menampilkan {deposits.current_page} dari {deposits.last_page}</div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
