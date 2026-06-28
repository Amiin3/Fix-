import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Swal from 'sweetalert2';

export default function KhfyManager({ auth, layanan, categories, filter_cat }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [isMarkupSelected, setIsMarkupSelected] = useState(false); // STATE KHUSUS NOMINAL
    
    const bulkForm = useForm({ action_type: '', bulk_mode: 'flat', bulk_val: '', ids: [] });
    const syncForm = useForm({ markup_value: 1000, reset_harga: true });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ id: '', nama_layanan: '', deskripsi: '', harga_jual: '' });
    const submitEdit = (e) => {
        e.preventDefault();
        router.post(route('admin.khfy.update_single'), editForm, {
            onSuccess: () => { setShowEditModal(false); Swal.fire('Berhasil!', 'Data sukses diperbarui.', 'success'); }
        });
    };


    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

    const runBulk = (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) return Swal.fire('Error', 'Pilih produk dulu, Bos!', 'error');
        if (bulkForm.action_type === 'markup' && !bulkForm.bulk_val) return Swal.fire('Error', 'Isi nominal profitnya!', 'error');
        
        router.post(route('admin.khfy.bulk'), { ...bulkForm.data, ids: selectedIds }, {
            onSuccess: () => { setSelectedIds([]); bulkForm.reset(); setIsMarkupSelected(false); Swal.fire('Berhasil!', 'Aksi massal sukses.', 'success'); }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Khfy Manager - MilaStore" />
            <div className="py-10 px-6 max-w-7xl mx-auto font-['Outfit']">
                
                <div className="flex justify-between items-center mb-8 bg-slate-900 p-8 rounded-[40px] shadow-2xl text-white">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">Produk KhfyPay</h1>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Sultan Edition V3.1</p>
                    </div>
                    <button onClick={() => setShowSyncModal(true)} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-400 transition-all shadow-lg">
                        <i className="fa-solid fa-rotate mr-2"></i> SMART SYNC
                    </button>
                </div>

                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-4 items-center justify-between">
                    <form onSubmit={runBulk} className="flex flex-wrap gap-3 items-center">
                        <select 
                            value={bulkForm.action_type} 
                            onChange={e => {
                                bulkForm.setData('action_type', e.target.value);
                                setIsMarkupSelected(e.target.value === 'markup'); // PAKSA STATE BERUBAH
                            }} 
                            className="rounded-xl border-slate-200 bg-slate-50 text-xs font-black focus:ring-indigo-500"
                        >
                            <option value="">- Pilih Aksi -</option>
                            <option value="markup">Update Profit (Markup)</option>
                            <option value="active">Aktifkan (ON)</option>
                            <option value="inactive">Matikan (OFF)</option>
                            <option value="delete">Hapus Produk</option>
                        </select>
                        
                        {/* INPUT NOMINAL - DIPASTIKAN MUNCUL */}
                        {isMarkupSelected && (
                            <div className="flex gap-2 transition-all duration-300">
                                <select value={bulkForm.bulk_mode} onChange={e => bulkForm.setData('bulk_mode', e.target.value)} className="rounded-xl border-slate-200 bg-slate-50 text-xs font-bold">
                                    <option value="flat">Rp</option>
                                    <option value="percent">%</option>
                                </select>
                                <input 
                                    type="number" 
                                    value={bulkForm.bulk_val} 
                                    onChange={e => bulkForm.setData('bulk_val', e.target.value)} 
                                    placeholder="Isi Nominal" 
                                    className="w-32 rounded-xl border-slate-200 bg-indigo-50 text-xs font-black text-indigo-600 focus:ring-indigo-500 shadow-inner" 
                                />
                            </div>
                        )}
                        <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] hover:bg-black transition-all">TERAPKAN</button>
                    </form>

                    <select value={filter_cat || ''} onChange={e => router.get(route('admin.khfy.index'), { cat: e.target.value })} className="rounded-xl border-slate-200 bg-slate-50 text-xs font-black">
                        <option value="">Semua Kategori</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-6 w-10"><input type="checkbox" onChange={(e) => e.target.checked ? setSelectedIds(layanan.map(l => l.id)) : setSelectedIds([])} checked={selectedIds.length === layanan.length && layanan.length > 0} /></th>
                                <th className="p-6">Produk Khfy</th>
                                <th className="p-6">Hrg Beli</th>
                                <th className="p-6">Hrg Jual</th>
                                <th className="p-6 text-center">Status</th><th className="p-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {layanan.map((p) => (
                                <tr key={p.id} className={`hover:bg-slate-50/50 transition-all ${selectedIds.includes(p.id) ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="p-6"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])} /></td>
                                    <td className="p-6">
                                        <div className="text-sm font-black text-slate-800">{p.nama_layanan}</div>
                                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{p.kode_layanan} • <span className="text-indigo-500">{p.kategori}</span></div>
                                    </td>
                                    <td className="p-6 text-[11px] font-black text-slate-400">Rp {formatRp(p.harga_beli)}</td>
                                    <td className="p-6 text-sm font-black text-indigo-600">Rp {formatRp(p.harga_jual)}</td>
                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{p.status === 'active' ? 'ON' : 'OFF'}</span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <button onClick={() => { setEditForm({id: p.id, nama_layanan: p.nama_layanan, deskripsi: p.deskripsi || '', harga_jual: p.harga_jual}); setShowEditModal(true); }} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200">EDIT</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            
            {/* EDIT MODAL INDIVIDUAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4">Edit Detail Produk</h3>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nama Produk</label>
                                <input type="text" value={editForm.nama_layanan} onChange={e => setEditForm({...editForm, nama_layanan: e.target.value})} className="w-full rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-indigo-500 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Harga Jual (Rp)</label>
                                <input type="number" value={editForm.harga_jual} onChange={e => setEditForm({...editForm, harga_jual: e.target.value})} className="w-full rounded-2xl border-slate-100 bg-slate-50 font-black text-indigo-600 focus:ring-indigo-500" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Deskripsi / Format Kuota</label>
                                <textarea value={editForm.deskripsi} onChange={e => setEditForm({...editForm, deskripsi: e.target.value})} placeholder="Ketik format deskripsi disini..." className="w-full rounded-2xl border-slate-100 bg-slate-50 font-medium focus:ring-indigo-500 text-xs min-h-[120px]"></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 text-xs font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">BATAL</button>
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">SIMPAN PERUBAHAN</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SYNC MODAL */}
            {showSyncModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4">Sync Khfy Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Profit Default (Rp)</label>
                                <input type="number" value={syncForm.markup_value} onChange={e => syncForm.setData('markup_value', e.target.value)} className="w-full rounded-2xl border-slate-100 bg-slate-50 font-black focus:ring-indigo-500" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowSyncModal(false)} className="flex-1 py-4 text-xs font-black text-slate-400">BATAL</button>
                                <button onClick={(e) => { e.preventDefault(); syncForm.post(route('admin.khfy.sync'), { onSuccess: () => setShowSyncModal(false) })}} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">MULAI SYNC</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
