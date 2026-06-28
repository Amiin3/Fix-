import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function PromoManager({ auth, promos }) {
    const [form, setForm] = useState({ id: null, title: '', description: '', badge: '', theme: 'indigo', icon: 'fa-bolt', url: '', is_active: 1 });
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.put(`/admin/promo/${form.id}`, form, { onSuccess: () => resetForm() });
        } else {
            router.post('/admin/promo', form, { onSuccess: () => resetForm() });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({ title: 'Hapus Promo?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48' })
        .then((res) => { if (res.isConfirmed) router.delete(`/admin/promo/${id}`); });
    };

    const resetForm = () => {
        setForm({ id: null, title: '', description: '', badge: '', theme: 'indigo', icon: 'fa-bolt', url: '', is_active: 1 });
        setIsEditing(false);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Promo" />
            <div className="py-12 px-4 max-w-4xl mx-auto font-sans">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-800"><i className="fa-solid fa-bullhorn text-indigo-500 mr-2"></i> Kelola Promo & Banner</h2>
                </div>

                {/* FORM INPUT PROMO */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <h4 className="font-bold mb-4">{isEditing ? 'Edit Promo' : 'Tambah Promo Baru'}</h4>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Judul Promo" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border-slate-200 rounded-xl w-full" required />
                        <input type="text" placeholder="Teks Lencana (Cth: HOT PROMO)" value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} className="border-slate-200 rounded-xl w-full" />
                        <textarea placeholder="Deskripsi Singkat" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border-slate-200 rounded-xl w-full col-span-2" rows="2"></textarea>
                        
                        <select value={form.theme} onChange={e => setForm({...form, theme: e.target.value})} className="border-slate-200 rounded-xl w-full">
                            <option value="indigo">Warna Ungu-Biru (Indigo)</option>
                            <option value="rose">Warna Merah-Oranye (Rose)</option>
                            <option value="emerald">Warna Hijau (Emerald)</option>
                            <option value="sky">Warna Biru Muda (Sky)</option>
                        </select>
                        <select value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="border-slate-200 rounded-xl w-full">
                            <option value="fa-bolt">Ikon Petir (Flash Sale)</option>
                            <option value="fa-gamepad">Ikon Gamepad (Games)</option>
                            <option value="fa-gift">Ikon Hadiah (Gift)</option>
                            <option value="fa-percent">Ikon Persen (Diskon)</option>
                        </select>
                        <input type="text" placeholder="URL Tujuan (Opsional, awalan https://)" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="border-slate-200 rounded-xl w-full" />
                        <select value={form.is_active} onChange={e => setForm({...form, is_active: e.target.value})} className="border-slate-200 rounded-xl w-full">
                            <option value="1">Aktif Tampil</option>
                            <option value="0">Sembunyikan</option>
                        </select>

                        <div className="col-span-2 flex gap-2 mt-2">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 w-full">{isEditing ? 'Simpan Perubahan' : 'Tambahkan Promo'}</button>
                            {isEditing && <button type="button" onClick={resetForm} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold w-1/3">Batal</button>}
                        </div>
                    </form>
                </div>

                {/* TABEL DAFTAR PROMO */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-4 font-bold">Banner Promo</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.length === 0 ? <tr><td colSpan="3" className="p-8 text-center text-slate-400">Belum ada promo.</td></tr> : null}
                            {promos.map(p => (
                                <tr key={p.id} className="border-t border-slate-100">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{p.title}</div>
                                        <div className="text-xs text-slate-500">{p.badge} • Tema: {p.theme}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{p.is_active ? 'Aktif' : 'Disembunyikan'}</span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => { setForm(p); setIsEditing(true); window.scrollTo(0,0); }} className="text-indigo-500 bg-indigo-50 p-2 rounded-lg"><i className="fa-solid fa-pen"></i></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-rose-500 bg-rose-50 p-2 rounded-lg"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
