import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function VpnManager({ products }) {
    const [editData, setEditData] = useState(null);
    const { data, setData, post, processing } = useForm({
        id: '', price_per_day: '', price_per_gb: '', price_per_ip: '', description: '', is_active: true
    });

    const openEdit = (p) => {
        setEditData(p);
        setData({
            id: p.id, price_per_day: p.price_per_day, price_per_gb: p.price_per_gb || 0, price_per_ip: p.price_per_ip || 0,
            description: p.description || '', is_active: p.is_active ? true : false
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/vpn-manager/update', {
            onSuccess: () => {
                setEditData(null);
                Swal.fire('Berhasil!', 'Data Produk VPN telah diupdate', 'success');
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <Head title="Admin VPN - MilaStore" />
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800"><i className="fa-solid fa-server text-blue-600 mr-2"></i> VPN Manager</h1>
                        <p className="text-slate-500 text-sm">Atur harga Multi-Dimensi (Hari, GB, Limit IP) VPN V12.</p>
                    </div>
                    <Link href="/dashboard" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm">Kembali</Link>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                            <tr><th className="p-4">Layanan</th><th className="p-4">Tarif Dasar</th><th className="p-4">Status</th><th className="p-4 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{p.name} <br/><span className="text-xs font-normal text-slate-400">{p.protocol}</span></td>
                                    <td className="p-4 text-blue-600 font-bold">
                                        Rp {Number(p.price_per_day).toLocaleString('id-ID')}/Hari <br/>
                                        <span className="text-xs text-slate-400 font-medium">+ Rp {Number(p.price_per_ip).toLocaleString('id-ID')}/IP Extra</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center"><button onClick={() => openEdit(p)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs transition">EDIT</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-lg font-black mb-4">Edit {editData.name}</h2>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 mb-2">Harga Per Hari (Rp)</label>
                                <input type="number" value={data.price_per_day} onChange={e => setData('price_per_day', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 mb-2">Harga Tambahan per Limit IP (Rp) - <i>Isi 0 jika gratis</i></label>
                                <input type="number" value={data.price_per_ip} onChange={e => setData('price_per_ip', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" required />
                            </div>
                            {['vmess', 'vless', 'trojan'].includes(editData.protocol) && (
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-2">Harga Per GB (Rp)</label>
                                    <input type="number" value={data.price_per_gb} onChange={e => setData('price_per_gb', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" required />
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 mb-2">Keterangan Layanan</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm h-20" placeholder="Cth: Dilarang Torrent."></textarea>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center space-x-3">
                                    <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                                    <span className="font-bold text-slate-700">Layanan Aktif</span>
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setEditData(null)} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">Batal</button>
                                <button type="submit" disabled={processing} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
