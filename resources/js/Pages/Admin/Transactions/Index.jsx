import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function TransactionManagement({ auth, transactions, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [localFilter, setLocalFilter] = useState('All'); // Filter lokal

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(parseFloat(n) || 0);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.transaksi.index'), { search }, { preserveState: true });
    };

    const reloadData = () => router.reload({ only: ['transactions'] });

    // 🚀 FITUR EKSEKUSI TRANSAKSI SULTAN (BAWAAN ASLI AMAN)
    const handleAction = async (trx) => {
        const { value: formValues } = await Swal.fire({
            title: '🛠️ Eksekusi Transaksi',
            html: `
                <div class="text-left mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">Detail Trx:</div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-left text-sm">
                    <b>ID:</b> ${trx.ref_id}<br/>
                    <b>User:</b> ${trx.username}<br/>
                    <b>Tujuan:</b> <span class="text-blue-600 font-bold">${trx.tujuan}</span><br/>
                    <b>Harga:</b> Rp ${formatRp(trx.harga)}
                </div>
                <div class="text-left mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">Ubah Status:</div>
                <select id="swal-status" class="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl mb-4 font-bold text-slate-700 py-3">
                    <option value="Pending" ${trx.status === 'Pending' ? 'selected' : ''}>⏳  Pending</option>
                    <option value="Sukses" ${trx.status === 'Sukses' ? 'selected' : ''}>✅  Sukses</option>
                    <option value="Gagal" ${trx.status === 'Gagal' ? 'selected' : ''}>❌  Gagal (Otomatis Refund Saldo)</option>
                </select>
                <div class="text-left mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">Input/Edit SN (Serial Number):</div>
                <input type="text" id="swal-sn" class="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700" value="${trx.sn || ''}" placeholder="Kosongkan jika tidak ada...">
            `,
            showCancelButton: true,
            confirmButtonText: 'Simpan Eksekusi',
            preConfirm: () => {
                return {
                    status: document.getElementById('swal-status').value,
                    sn: document.getElementById('swal-sn').value
                };
            }
        });

        if (formValues) {
            Swal.fire({ title: 'Mengeksekusi...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                const res = await axios.post(`/admin/transaksi/${trx.id}/status`, formValues);
                Swal.fire('Sukses!', res.data.message, 'success');
                reloadData();
            } catch (e) { 
                Swal.fire('Error', 'Gagal memproses transaksi', 'error'); 
            }
        }
    };

    // 📊 MESIN AKUNTAN HALAMAN (MENGHITUNG DATA DI HALAMAN INI SAJA)
    const pageStats = useMemo(() => {
        let totalTrx = transactions.data.length;
        let totalRp = 0;
        let success = 0, pending = 0, failed = 0;

        transactions.data.forEach(trx => {
            totalRp += parseFloat(trx.harga || 0);
            if (trx.status === 'Sukses') success++;
            else if (trx.status === 'Pending') pending++;
            else if (trx.status === 'Gagal') failed++;
        });

        return { totalTrx, totalRp, success, pending, failed };
    }, [transactions.data]);

    // FILTER LOKAL PADA HALAMAN INI
    const displayedTransactions = useMemo(() => {
        if (localFilter === 'All') return transactions.data;
        return transactions.data.filter(trx => trx.status === localFilter);
    }, [transactions.data, localFilter]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pusat Kendali Transaksi - MilaStore" />
            <div className="min-h-screen bg-[#F4F7FB] pb-32 font-['Outfit']">
                
                {/* 🌈 HEADER SULTAN */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 pt-10 pb-24 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-2xl translate-x-1/2 -translate-y-1/4"></div>
                    <div className="max-w-6xl mx-auto relative z-10 flex items-center gap-4">
                        <Link href={route('dashboard')} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-md">
                            <i className="fa-solid fa-arrow-left"></i>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">📡 Pusat Transaksi</h2>
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Monitor & Eksekusi Delay</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-5 -mt-14 relative z-50">
                    
                    {/* 📊 REKAP STATISTIK HALAMAN */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Halaman Ini</p>
                            <h3 className="text-lg font-black text-slate-800">Rp {formatRp(pageStats.totalRp)}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-emerald-500">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sukses</p>
                            <h3 className="text-xl font-black text-emerald-600">{pageStats.success} <span className="text-xs text-slate-400">Trx</span></h3>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-amber-500">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nyangkut (Pending)</p>
                            <h3 className="text-xl font-black text-amber-500">{pageStats.pending} <span className="text-xs text-slate-400">Trx</span></h3>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-rose-500">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gagal / Refund</p>
                            <h3 className="text-xl font-black text-rose-500">{pageStats.failed} <span className="text-xs text-slate-400">Trx</span></h3>
                        </div>
                    </div>

                    {/* 🔍 SEARCH & FILTER BAR */}
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex flex-col md:flex-row gap-3 mb-6">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    className="w-full border-0 bg-slate-50 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Cari ID Ref, Username, atau No Tujuan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-slate-400"></i>
                            </div>
                            <button type="submit" className="bg-slate-800 text-white px-6 rounded-xl font-black shadow-md hover:bg-slate-900 transition-all">
                                CARI
                            </button>
                        </form>
                        <div className="w-full md:w-48">
                            <select 
                                value={localFilter} 
                                onChange={(e) => setLocalFilter(e.target.value)}
                                className="w-full border-0 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="All">Semua Status</option>
                                <option value="Pending">⏳ Hanya Pending</option>
                                <option value="Sukses">✅ Hanya Sukses</option>
                                <option value="Gagal">❌ Hanya Gagal</option>
                            </select>
                        </div>
                    </div>

                    {/* 📊 TABEL TRANSAKSI MODERN */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-500">
                                        <th className="p-4 whitespace-nowrap">Detail Trx</th>
                                        <th className="p-4 whitespace-nowrap">Tujuan & Harga</th>
                                        <th className="p-4 whitespace-nowrap">SN / Keterangan</th>
                                        <th className="p-4 whitespace-nowrap text-center">Status</th>
                                        <th className="p-4 whitespace-nowrap text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedTransactions.length > 0 ? displayedTransactions.map(trx => (
                                        <tr key={trx.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-black text-sm text-slate-800">{trx.ref_id}</div>
                                                <div className="text-[11px] font-bold text-sky-600 mt-0.5"><i className="fa-solid fa-user mr-1 text-slate-400"></i> @{trx.username}</div>
                                                <div className="text-[10px] font-mono text-slate-400 mt-1">{trx.tanggal}</div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-black text-blue-600 tracking-tight text-sm">{trx.tujuan}</div>
                                                <div className="text-xs font-bold text-slate-600 mt-0.5">Rp {formatRp(trx.harga)}</div>
                                            </td>
                                            <td className="p-4 min-w-[200px] max-w-[300px]">
                                                <div className="text-[10px] font-mono bg-slate-100 p-2 rounded-lg text-slate-700 break-all font-bold border border-slate-200 shadow-inner">
                                                    {trx.sn || <span className="italic opacity-50 text-slate-400">Menunggu SN...</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-center">
                                                {trx.status === 'Sukses' && <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm"><i className="fa-solid fa-check-circle mr-1"></i> Sukses</span>}
                                                {trx.status === 'Pending' && <span className="bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full animate-pulse shadow-sm"><i className="fa-solid fa-clock mr-1"></i> Pending</span>}
                                                {trx.status === 'Gagal' && <span className="bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm"><i className="fa-solid fa-xmark-circle mr-1"></i> Gagal</span>}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-center">
                                                <button onClick={() => handleAction(trx)} className="bg-slate-800 hover:bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-md transform hover:scale-105">
                                                    <i className="fa-solid fa-wrench mr-1"></i> Eksekusi
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3 border border-slate-200">
                                                    <i className="fa-solid fa-inbox text-slate-400 text-lg"></i>
                                                </div>
                                                <p className="text-slate-500 font-bold text-sm tracking-wide">Data transaksi tidak ditemukan Bosku!</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 📄 PAGINASI BAWAAN (TETAP AMAN) */}
                    <div className="mt-6 flex justify-center gap-2 pb-10 flex-wrap">
                        {transactions.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${link.active ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            ></Link>
                        ))}
                    </div>
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
