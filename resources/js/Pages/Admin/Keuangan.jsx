import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Keuangan({ stats, portofolio, deposits, users, success, error }) {
    
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, reset } = useForm({
        username: '',
        aksi: 'tambah',
        jumlah: ''
    });

    useEffect(() => {
        if (success) Swal.fire('Berhasil!', success, 'success');
        if (error) Swal.fire('Oops!', error, 'error');
    }, [success, error]);

    const submit = (e) => {
        e.preventDefault();
        post('/admin/keuangan/update', {
            onSuccess: () => reset('jumlah', 'username')
        });
    };

    const filteredUsers = users.filter(user => 
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const autoFillUser = (name) => {
        setData('username', name);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
            <Head title="Manajemen Keuangan" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Manajemen Keuangan</h1>
                        <p className="text-sm text-gray-500">Pantau arus kas dan kelola saldo member MilaStore</p>
                    </div>
                </div>
                <Link href="/admin/dashboard" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition shadow-sm">
                    &larr; KEMBALI
                </Link>
            </div>

            {/* Widget Statistik Cerah */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p className="text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase">Total Saldo Member</p>
                    <h3 className="text-2xl font-black text-gray-800">Rp {new Intl.NumberFormat('id-ID').format(stats.total_saldo)}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                    <p className="text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase">Deposit Sukses Hari Ini</p>
                    <h3 className="text-2xl font-black text-emerald-600">Rp {new Intl.NumberFormat('id-ID').format(stats.depo_hari_ini)}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                    <p className="text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase">Deposit Pending</p>
                    <h3 className="text-2xl font-black text-amber-500">{stats.depo_pending} <span className="text-sm font-medium">Trx</span></h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <p className="text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase">Total Member Aktif</p>
                    <h3 className="text-2xl font-black text-purple-600">{stats.total_member} <span className="text-sm font-medium">User</span></h3>
                </div>
            </div>

            {/* 🔥 NEW: PORTOFOLIO BISNIS 🔥 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-6">
                    <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg></span>
                    Portofolio & Performa Finansial (Keseluruhan)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-indigo-50 to-white">
                        <p className="text-indigo-500 text-xs font-bold uppercase mb-1">Total Dana Masuk (All Time)</p>
                        <h4 className="text-2xl font-black text-indigo-700">Rp {new Intl.NumberFormat('id-ID').format(portofolio.total_masuk)}</h4>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-emerald-50 to-white">
                        <p className="text-emerald-500 text-xs font-bold uppercase mb-1">Dana Terpakai / Omset</p>
                        <h4 className="text-2xl font-black text-emerald-700">Rp {new Intl.NumberFormat('id-ID').format(portofolio.dana_terpakai)}</h4>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-amber-50 to-white">
                        <p className="text-amber-500 text-xs font-bold uppercase mb-1">Saldo Mengendap (Liabilities)</p>
                        <h4 className="text-2xl font-black text-amber-700">Rp {new Intl.NumberFormat('id-ID').format(portofolio.saldo_mengendap)}</h4>
                    </div>
                </div>

                <div className="mt-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                        <span>Rasio Dana Terpakai ({portofolio.persentase_terpakai}%)</span>
                        <span>Saldo Mengendap ({100 - portofolio.persentase_terpakai}%)</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-4 flex overflow-hidden shadow-inner">
                        <div className="bg-emerald-500 h-4 rounded-l-full transition-all duration-1000" style={{ width: `${portofolio.persentase_terpakai}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">Visualisasi perbandingan antara total deposit yang sudah dibelanjakan oleh member dengan saldo yang masih utuh di sistem.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-1 space-y-8">
                    {/* Form Edit Saldo */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold mb-5 text-gray-800 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg></span>
                            Update Saldo Cepat
                        </h3>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama / Email Member</label>
                                <input type="text" placeholder="Klik dari tabel di samping ➡" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" value={data.username} onChange={e => setData('username', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tindakan</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={data.aksi} onChange={e => setData('aksi', e.target.value)}>
                                        <option value="tambah">TAMBAH (+)</option>
                                        <option value="kurang">KURANG (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nominal (Rp)</label>
                                    <input type="number" placeholder="10000" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" value={data.jumlah} onChange={e => setData('jumlah', e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" disabled={processing} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-lg font-bold shadow-md shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50">
                                {processing ? 'MEMPROSES...' : 'EKSEKUSI SALDO'}
                            </button>
                        </form>
                    </div>

                    {/* Tabel Riwayat Deposit */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-extrabold mb-4 text-gray-800">Riwayat Deposit Terbaru</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <tbody>
                                    {(deposits || []).length === 0 ? (
                                        <tr><td className="py-4 text-center text-gray-400">Belum ada deposit masuk.</td></tr>
                                    ) : deposits.map((d, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                            <td className="py-3">
                                                <div className="font-bold text-gray-800">{d.buyer || 'Guest'}</div>
                                                <div className="text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString('id-ID')}</div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="font-bold text-emerald-600">+ Rp {new Intl.NumberFormat('id-ID').format(d.amount)}</div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'Sukses' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Database Semua User */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-md"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></span>
                            Data Saldo Member Aktif
                        </h3>
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari nama / email..." 
                                className="pl-10 w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 rounded-lg max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left relative">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 shadow-sm">
                                <tr>
                                    <th className="p-4 font-bold">Member Info</th>
                                    <th className="p-4 font-bold">No. HP</th>
                                    <th className="p-4 font-bold text-right">Saldo Saat Ini</th>
                                    <th className="p-4 font-bold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium">Member tidak ditemukan.</td></tr>
                                ) : filteredUsers.map((u, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{u.phone || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className="font-black text-gray-800">Rp {new Intl.NumberFormat('id-ID').format(u.saldo)}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => autoFillUser(u.name)}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap"
                                            >
                                                Pilih & Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
