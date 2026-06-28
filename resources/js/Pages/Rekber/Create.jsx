import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Create({ auth, adminFee }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        judul: '', nominal: '', seller_whatsapp: ''
    });

    const [identifier, setIdentifier] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [sellerInfo, setSellerInfo] = useState({ name: '', masked_wa: '' });
    const [checking, setChecking] = useState(false);

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);
    const totalPay = (Number(data.nominal) || 0) + Number(adminFee);

    // 📢 TANGKAP PESAN FLASH DARI SERVER
    useEffect(() => {
        if (flash?.error) Swal.fire('Oops! Gagal', flash.error, 'error');
        if (flash?.success) Swal.fire('Berhasil!', flash.success, 'success');
        
        // Tangkap error validasi kolom
        if (Object.keys(errors).length > 0) {
            Swal.fire('Validasi Gagal', Object.values(errors)[0], 'error');
        }
    }, [flash, errors]);

    const checkAccount = async () => {
        if (!identifier) return Swal.fire('Eitss!', 'Masukkan Email/WA Penjual dulu!', 'warning');
        setChecking(true);
        try {
            const res = await axios.post('/rekber/check-seller', { identifier });
            if (res.data.found) {
                setSellerInfo({ name: res.data.name, masked_wa: res.data.masked_wa });
                setData('seller_whatsapp', res.data.seller_whatsapp);
                setIsVerified(true);
            } else {
                Swal.fire('Tidak Ditemukan!', res.data.message, 'error');
                setIsVerified(false);
            }
        } catch (e) {
            Swal.fire('Error', 'Koneksi bermasalah', 'error');
        }
        setChecking(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Number(auth.user.saldo) < totalPay) return Swal.fire('Saldo Kurang!', 'Top Up dulu Bosku!', 'error');

        Swal.fire({
            title: 'Buat Rekber?',
            text: `Sistem akan mengamankan saldo Rp ${formatRp(totalPay)} (Termasuk Admin Rp ${formatRp(adminFee)}). Saldo akan ditahan sampai barang diterima.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Ya, Amankan Dana!'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('rekber.store'), { preserveScroll: true });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Buat Rekber Baru" />
            <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 pt-8 px-5">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/rekber" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-indigo-600"><i className="fa-solid fa-arrow-left"></i></Link>
                        <div><h2 className="text-2xl font-black text-slate-800">Buat Rekber</h2></div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 shadow-xl mb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">1. Cari Akun Penjual (Email / WA)</label>
                        {!isVerified ? (
                            <div className="flex gap-2">
                                <input type="text" className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-100" placeholder="0812..." value={identifier} onChange={e => setIdentifier(e.target.value)} />
                                <button type="button" onClick={checkAccount} disabled={checking} className="bg-indigo-600 text-white px-5 rounded-2xl font-black text-xs active:scale-95 transition-all">{checking ? 'CEK...' : 'CARI'}</button>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                                <div>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase">Penjual Terverifikasi</span>
                                    <h4 className="font-black text-slate-800">{sellerInfo.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-500">{sellerInfo.masked_wa}</p>
                                </div>
                                <button type="button" onClick={() => setIsVerified(false)} className="text-rose-500 font-bold text-xs bg-white px-3 py-1 rounded-lg shadow-sm">Ganti</button>
                            </div>
                        )}
                    </div>

                    {isVerified && (
                        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-6 shadow-xl animate-in fade-in slide-in-from-bottom-5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">2. Rincian Barang</label>
                            <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 mb-4 font-bold text-sm focus:ring-2 focus:ring-indigo-100" placeholder="Judul (Contoh: Akun ML)" value={data.judul} onChange={e => setData('judul', e.target.value)} required />
                            
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">3. Harga Barang (Rp)</label>
                            <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 mb-6 font-black text-xl text-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="0" value={data.nominal} onChange={e => setData('nominal', e.target.value)} required />

                            <div className="pt-4 border-t-2 border-dashed border-slate-100">
                                <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-slate-500">Harga Barang</span><span className="text-xs font-black">Rp {formatRp(data.nominal)}</span></div>
                                <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold text-slate-500">Biaya Admin (Pembeli)</span><span className="text-xs font-black text-rose-500">+ Rp {formatRp(adminFee)}</span></div>
                                <div className="flex justify-between items-center mb-6"><span className="text-sm font-black text-slate-800">Total Potong Saldo</span><span className="text-xl font-black text-indigo-600">Rp {formatRp(totalPay)}</span></div>

                                <button type="submit" disabled={processing || !data.nominal} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">BUAT REKBER SEKARANG</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
