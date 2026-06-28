import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Index({ auth, deposits, settings = [], site, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const initialRender = useRef(true);

    const getSetting = (m, f) => (settings || []).find(s => s.metode === m)?.[f] || '';
    const { data, setData, post, processing } = useForm({
        email: site?.bank_email || '', password: site?.bank_password || '',
        jago_acc: getSetting('JAGO', 'nomor'), jago_name: getSetting('JAGO', 'atas_nama'),
        seabank_acc: getSetting('SEABANK', 'nomor'), seabank_name: getSetting('SEABANK', 'atas_nama'),
        qris_gopay: getSetting('QRIS_GOPAY', 'nomor'), qris_shopee: getSetting('QRIS_SHOPEE', 'nomor'),
    });

    // 🔍 Debounce Search
    useEffect(() => {
        if (initialRender.current) { initialRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get('/admin/deposit', { search: searchTerm }, { preserveState: true, replace: true });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSave = (e) => {
        e.preventDefault();
        post(route('admin.deposit.qris'), { onSuccess: () => Swal.fire('Tersimpan!', 'Konfigurasi updated.', 'success') });
    };

    const handleAction = async (id, status) => {
        const color = status === 'Sukses' ? '#10b981' : '#ef4444';
        const result = await Swal.fire({
            title: `Setel ke ${status}?`,
            text: `Data deposit #${id} akan diubah statusnya.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: color,
            confirmButtonText: 'Ya, Eksekusi!'
        });

        if (result.isConfirmed) {
            Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await axios.post(`/admin/deposit/${id}/action`, { status });
                if(res.data.success) {
                    Swal.fire('Berhasil!', res.data.message, 'success');
                    router.reload({ only: ['deposits'] });
                } else {
                    Swal.fire('Gagal', res.data.message, 'error');
                }
            } catch (e) { Swal.fire('Error', 'Gagal memproses server.', 'error'); }
        }
    };

    const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Audit Keuangan - MilaStore" />
            <div className="min-h-screen bg-slate-50 font-['Outfit'] pb-32 pt-8">
                <div className="max-w-6xl mx-auto px-5">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Financial <span className="text-blue-600">Audit</span></h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifikasi & Konfigurasi Deposit Member</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => document.getElementById('config-panel').scrollIntoView({behavior: 'smooth'})} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm">Config</button>
                        </div>
                    </div>

                    {/* SEARCH BOX SULTAN */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 mb-8 relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                        <input type="text" className="w-full border-none bg-transparent pl-12 py-3 text-sm font-bold text-slate-800 focus:ring-0" placeholder="Cari Nama Member, Email, atau ID Deposit..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    {/* LIST DATA (MODERN CARDS) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        {deposits.data.map((d) => (
                            <div key={d.id} className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
                                <div className="absolute -top-2 -right-2 text-slate-50 font-black text-5xl italic group-hover:text-slate-100 transition-colors">#{d.id}</div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={`https://ui-avatars.com/api/?name=${d.member_name}&background=random&color=fff&bold=true`} className="w-10 h-10 rounded-full border border-slate-100 shadow-sm" />
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-800 text-sm leading-tight truncate uppercase">{d.member_name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 truncate">{d.member_email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Nominal</p>
                                            <p className="font-black text-emerald-600 text-sm">{formatRp(d.total_bayar)}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Metode</p>
                                            <p className="font-black text-slate-700 text-[10px] uppercase">{d.metode.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${d.status === 'Sukses' ? 'bg-emerald-100 text-emerald-600' : d.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{d.status}</span>
                                        {d.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction(d.id, 'Gagal')} className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                                                <button onClick={() => handleAction(d.id, 'Sukses')} className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"><i className="fa-solid fa-check"></i></button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-3 text-[8px] font-bold text-slate-300 italic text-right">{new Date(d.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINASI */}
                    <div className="mt-8 flex justify-center gap-1.5 flex-wrap">
                        {deposits.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-200 hover:bg-blue-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>

                    {/* CONFIG PANEL (BOTTOM) */}
                    <div id="config-panel" className="mt-20 bg-white rounded-[40px] p-8 shadow-sm border border-slate-200">
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-800">Payment <span className="text-blue-600 italic">Settings</span></h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konfigurasi Rekening & QRIS</p>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Gmail Bot</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Gmail Password</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Bank Jago</h5>
                                    <input type="text" placeholder="Rekening" value={data.jago_acc} onChange={e => setData('jago_acc', e.target.value)} className="w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">SeaBank</h5>
                                    <input type="text" placeholder="Rekening" value={data.seabank_acc} onChange={e => setData('seabank_acc', e.target.value)} className="w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" />
                                </div>
                            </div>
                            <button disabled={processing} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[4px] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50">Save Global Config</button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
