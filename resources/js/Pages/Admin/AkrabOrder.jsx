import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AkrabOrder({ auth, products }) {
    const [targetMsisdn, setTargetMsisdn] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [loading, setLoading] = useState(false);
    const [queues, setQueues] = useState([]);

    const fetchQueues = async () => {
        try {
            const res = await axios.get('/admin/akrab/order/queues');
            if (res.data.status) setQueues(res.data.data);
        } catch (e) {}
    };

    // Auto-refresh monitor antrean setiap 5 detik
    useEffect(() => {
        fetchQueues();
        const interval = setInterval(fetchQueues, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleOrder = async (e) => {
        e.preventDefault();
        if (!targetMsisdn || !selectedProduct) return Swal.fire('Error', 'Nomor Target dan Produk wajib diisi!', 'warning');

        Swal.fire({ title: 'Memproses Order...', html: 'Mencari slot kosong & mengeksekusi Invite...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            const res = await axios.post('/admin/akrab/order/submit', { target_msisdn: targetMsisdn, product_id: selectedProduct });
            if (res.data.status) {
                Swal.fire('Order Diterima!', res.data.message, 'success');
                setTargetMsisdn('');
                setSelectedProduct('');
                fetchQueues();
            } else {
                Swal.fire('Gagal', res.data.message, 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Koneksi ke server gagal.', 'error');
        }
    };

    const triggerCron = async () => {
        Swal.fire({ title: 'Menjalankan Worker...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await axios.get('/cron/akrab/process-kuber');
        Swal.fire('Worker Selesai', res.data.message, 'info');
        fetchQueues();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Menu Order MilaStore" />

            <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans">
                {/* HEADER */}
                <div className="bg-white px-6 py-5 shadow-sm border-b border-slate-200 flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <Link href="/admin/akrab" className="mr-4 text-2xl text-slate-400 hover:text-indigo-600 transition-colors"><i className="fa-solid fa-circle-left"></i></Link>
                        <div>
                            <h6 className="mb-0 font-black text-xl text-slate-800 tracking-tight">MENU ORDER OTOMATIS</h6>
                            <small className="text-emerald-500 font-bold tracking-widest text-[10px] uppercase">MilaStore War Engine</small>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* PANEL KIRI: FORM ORDER */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                            <div className="bg-indigo-50 text-indigo-700 p-4 rounded-2xl mb-6 border border-indigo-100 flex items-center gap-4">
                                <i className="fa-solid fa-bolt-lightning text-3xl"></i>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wide">Sistem Auto-Kuber</h3>
                                    <p className="text-[11px] font-medium opacity-80 leading-snug">Order akan memotong stok secara otomatis. Jeda eksekusi Kuber adalah 2 menit pasca invite berhasil.</p>
                                </div>
                            </div>

                            <form onSubmit={handleOrder}>
                                <div className="mb-5">
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nomor Pembeli (Target)</label>
                                    <input type="number" value={targetMsisdn} onChange={(e) => setTargetMsisdn(e.target.value)} placeholder="0819xxxx" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
                                </div>

                                <div className="mb-8">
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Pilih Varian Produk</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {products.map(p => (
                                            <div key={p.id} onClick={() => p.stok_tersedia > 0 && setSelectedProduct(p.id)} className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex justify-between items-center ${selectedProduct === p.id ? 'border-indigo-500 bg-indigo-50/50' : p.stok_tersedia > 0 ? 'border-slate-100 hover:border-indigo-300' : 'border-slate-100 opacity-50 cursor-not-allowed bg-slate-50'}`}>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{p.nama_produk} ({p.kuber_gb}GB)</h4>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded mt-1 inline-block ${p.stok_tersedia > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>STOK: {p.stok_tersedia} SLOT</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-emerald-600 font-black text-sm">Rp {p.harga_jual.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={!targetMsisdn || !selectedProduct} className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                                    <i className="fa-solid fa-rocket"></i> EKSEKUSI ORDER SEKARANG
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* PANEL KANAN: LIVE MONITOR ANTREAN */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full">
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                <div>
                                    <h6 className="font-bold text-lg text-slate-800"><i className="fa-solid fa-satellite-dish text-indigo-500 mr-2"></i> Live Monitor Kuber</h6>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Otomatis Eksekusi setelah 2 menit</p>
                                </div>
                                {/* Tombol Manual Cron untuk Testing */}
                                <button onClick={triggerCron} className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold py-2 px-4 rounded-xl text-[10px] transition-all"><i className="fa-solid fa-stopwatch mr-1"></i> TEST TRIGGER CRON</button>
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {queues.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 font-bold text-sm">Belum ada antrean order.</div>
                                ) : queues.map((q, i) => (
                                    <div key={i} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-inner ${q.status_queue === 'success' ? 'bg-emerald-500' : q.status_queue === 'failed' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                                                <i className={`fa-solid ${q.status_queue === 'success' ? 'fa-check' : q.status_queue === 'failed' ? 'fa-xmark' : 'fa-hourglass-half fa-spin'}`}></i>
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-800 font-mono text-sm tracking-tight">{q.member_msisdn}</h5>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <span className="text-[10px] bg-white border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded">Tembak: {q.kuber_gb} GB</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Slot Induk: {q.parent_msisdn}</span>
                                                </div>
                                                {q.log && <p className="text-[10px] text-rose-500 mt-1 italic">{q.log}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.status_queue === 'success' ? 'bg-emerald-100 text-emerald-700' : q.status_queue === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{q.status_queue}</span>
                                            <div className="text-[9px] text-slate-400 font-bold mt-1.5">Jadwal: {new Date(q.process_at).toLocaleTimeString('id-ID')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
