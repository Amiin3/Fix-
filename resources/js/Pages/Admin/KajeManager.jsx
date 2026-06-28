import React, { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function KajeManager({ auth, layanan, categories }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const bulkForm = useForm({ profit_amount: '', kategori_target: 'all' });

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    const handleSync = () => {
        Swal.fire({
            title: 'Sync Kaje?',
            text: "Mengambil data terbaru dari provider...",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5'
        }).then((res) => {
            if (res.isConfirmed) {
                router.post(route('admin.kaje.sync'), {}, {
                    onStart: () => Swal.showLoading(),
                    onSuccess: () => Swal.fire('Berhasil!', 'Data Kaje tersinkron.', 'success')
                });
            }
        });
    };

    const handleBulk = (e) => {
        e.preventDefault();
        bulkForm.post(route('admin.kaje.mass-update'), {
            onSuccess: () => {
                bulkForm.reset();
                Swal.fire('Sukses!', 'Harga massal berhasil diupdate.', 'success');
            }
        });
    };

    const editProduct = (p) => {
        Swal.fire({
            title: `Edit ${p.kode_layanan}`,
            html: `
                <div class="text-left mb-2 text-sm font-bold">Harga Beli: Rp ${formatRp(p.harga_beli)}</div>
                <input type="number" id="swal-harga" class="swal2-input" placeholder="Harga Jual" value="${p.harga_jual}">
                <select id="swal-status" class="swal2-select">
                    <option value="active" ${p.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${p.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            preConfirm: () => {
                return {
                    id: p.id,
                    harga_jual: document.getElementById('swal-harga').value,
                    status: document.getElementById('swal-status').value,
                    deskripsi: p.deskripsi
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.kaje.update'), result.value, {
                    onSuccess: () => Swal.fire('Sukses!', 'Data berhasil disimpan.', 'success')
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kaje Manager - MilaStore" />
            <div className="py-10 px-4 max-w-7xl mx-auto font-['Outfit']">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kelola Produk Kaje</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Provider: XDA / KAJE</p>
                    </div>
                    <button onClick={handleSync} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        <i className="fa-solid fa-sync mr-2"></i> Sync Provider
                    </button>
                </div>

                {/* FORM UPDATE MASSAL */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-6 p-6">
                    <form onSubmit={handleBulk} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Kategori Target</label>
                            <select value={bulkForm.kategori_target} onChange={e => bulkForm.setData('kategori_target', e.target.value)} className="w-full rounded-xl border-slate-200 text-sm font-bold focus:ring-indigo-500">
                                <option value="all">Semua Kategori</option>
                                {categories && categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Markup (Keuntungan per trx)</label>
                            <input type="number" value={bulkForm.profit_amount} onChange={e => bulkForm.setData('profit_amount', e.target.value)} className="w-full rounded-xl border-slate-200 text-sm font-bold focus:ring-indigo-500" placeholder="Contoh: 1000" />
                        </div>
                        <button type="submit" disabled={bulkForm.processing} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-800 transition-all disabled:opacity-50">
                            Update Massal
                        </button>
                    </form>
                </div>

                {/* TABEL DATA */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Nama Produk</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Kategori</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Hrg Beli</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase">Hrg Jual</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {/* Hapus .data karena kita pakai get() di controller */}
                                {layanan && layanan.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="p-5">
                                            <div className="font-bold text-slate-700 text-sm">{p.nama_layanan}</div>
                                            <div className="text-[10px] font-mono text-slate-400">{p.kode_layanan}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">{p.kategori}</span>
                                        </td>
                                        <td className="p-5 text-sm font-black text-slate-600">Rp {formatRp(p.harga_beli)}</td>
                                        <td className="p-5 text-sm font-black text-emerald-600">Rp {formatRp(p.harga_jual)}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{p.status}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button onClick={() => editProduct(p)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
