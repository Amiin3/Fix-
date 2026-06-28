import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function MaintenanceSettings({ auth, config }) {
    const [data, setData] = useState({
        manual: config?.manual || false,
        mode: config?.mode || 'total',
        message: config?.message || 'Sistem sedang dalam pemeliharaan rutin. Kami akan segera kembali!',
        whitelist: config?.whitelist || '',
        start: config?.start || '',
        end: config?.end || ''
    });
    const [loading, setLoading] = useState(false);

    const getMyIp = async () => {
        try {
            Swal.fire({ title: 'Melacak IP...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const res = await axios.get('https://api.ipify.org?format=json');
            const myIp = res.data.ip;
            let currentIps = data.whitelist ? data.whitelist.split(',').map(ip => ip.trim()).filter(ip => ip) : [];
            if (!currentIps.includes(myIp)) {
                currentIps.push(myIp);
                setData({ ...data, whitelist: currentIps.join(', ') });
                Swal.fire('✅ Berhasil', `IP (${myIp}) masuk Jalur VIP!`, 'success');
            } else {
                Swal.fire('ℹ️ Info', 'IP sudah ada di Whitelist.', 'info');
            }
        } catch (error) { Swal.fire('❌ Gagal', 'Gagal melacak IP.', 'error'); }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        axios.post('/admin/maintenance-settings', data)
            .then(res => Swal.fire({ title: '🎉 Berhasil!', text: res.data.message, icon: 'success' }))
            .catch(err => Swal.fire({ title: 'Error! 🚨', text: err.response?.data?.message || 'Gagal menyimpan.', icon: 'error' }))
            .finally(() => setLoading(false));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Maintenance Settings - Admin" />
            <div className="min-h-screen bg-slate-50 py-8 font-['Outfit']">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ruang <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Karantina</span></h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">Atur mode maintenance sesuai tingkat urgensi MilaStore.</p>
                    </div>

                    <form onSubmit={handleSave} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                        
                        {/* Status Saklar Utama */}
                        <div className={`p-8 border-b transition-colors duration-500 flex items-center justify-between ${data.manual ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                            <div>
                                <h3 className={`text-xl font-black tracking-widest ${data.manual ? 'text-white' : 'text-slate-700'}`}>
                                    <i className={`fa-solid ${data.manual ? 'fa-power-off text-rose-500' : 'fa-check text-emerald-500'} mr-3`}></i>
                                    {data.manual ? 'KARANTINA AKTIF' : 'SISTEM NORMAL'}
                                </h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-125">
                                <input type="checkbox" className="sr-only peer" checked={data.manual} onChange={(e) => setData({ ...data, manual: e.target.checked })} />
                                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                            </label>
                        </div>

                        <div className={`p-8 space-y-8 ${data.manual ? 'block' : 'opacity-50 grayscale pointer-events-none transition-all'}`}>
                            
                            {/* Pilihan 2 Varian Mode */}
                            <div>
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Pilih Varian Karantina</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Opsi 1: Total */}
                                    <div onClick={() => setData({ ...data, mode: 'total' })} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${data.mode === 'total' ? 'border-rose-500 bg-rose-50 shadow-md' : 'border-slate-200 bg-white hover:border-rose-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-black text-lg ${data.mode === 'total' ? 'text-rose-700' : 'text-slate-600'}`}><i className="fa-solid fa-lock mr-2"></i>Lockdown Total</h4>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.mode === 'total' ? 'border-rose-500' : 'border-slate-300'}`}>
                                                {data.mode === 'total' && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">Web ditutup sepenuhnya. Member akan diarahkan ke halaman Maintenance (Tidak bisa lihat produk).</p>
                                    </div>

                                    {/* Opsi 2: Transaksi */}
                                    <div onClick={() => setData({ ...data, mode: 'transaksi' })} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${data.mode === 'transaksi' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-black text-lg ${data.mode === 'transaksi' ? 'text-orange-700' : 'text-slate-600'}`}><i className="fa-solid fa-cart-arrow-down mr-2"></i>Lockdown Transaksi</h4>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.mode === 'transaksi' ? 'border-orange-500' : 'border-slate-300'}`}>
                                                {data.mode === 'transaksi' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">Web tetap bisa diakses (lihat harga, dll). Tapi tombol Order/Beli dimatikan sementara.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Message & Whitelist */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Pesan Peringatan</label>
                                    <textarea rows="4" value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none" placeholder="Tulis alasan maintenance di sini..."></textarea>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-black text-slate-700 uppercase tracking-widest">Whitelist IP VIP</label>
                                        <button type="button" onClick={getMyIp} className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><i className="fa-solid fa-radar mr-1"></i> Sedot IP Saya</button>
                                    </div>
                                    <textarea rows="4" value={data.whitelist} onChange={(e) => setData({ ...data, whitelist: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-mono" placeholder="192.168.1.1, 103.111.x.x"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center">
                                {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-floppy-disk mr-2"></i>}
                                Terapkan Mode
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
