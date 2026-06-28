import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Users({ auth, users }) {
    const [search, setSearch] = useState('');

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

    // FITUR PENCARIAN INSTAN
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // FITUR EDIT SALDO & LEVEL (POP-UP)
    const handleEdit = (user) => {
        Swal.fire({
            title: '✏️ Edit Data Member',
            html: `
                <div class="text-left mb-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                    <input id="swal-name" class="w-full border-2 border-slate-100 rounded-xl p-3 font-bold bg-slate-50 text-slate-500" value="${user.name}" disabled>
                </div>
                <div class="text-left mb-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Level Akun</label>
                    <select id="swal-level" class="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-3 font-bold text-slate-700 outline-none transition-all">
                        <option value="user" ${user.level === 'user' ? 'selected' : ''}>👤 User Biasa</option>
                        <option value="admin" ${user.level === 'admin' ? 'selected' : ''}>👑 Administrator</option>
                    </select>
                </div>
                <div class="text-left mb-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo (Rp)</label>
                    <input type="number" id="swal-saldo" class="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl p-3 font-black text-indigo-600 text-xl outline-none transition-all shadow-inner" value="${user.saldo}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: '<i class="fa-solid fa-floppy-disk mr-1"></i> Simpan',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                return {
                    level: document.getElementById('swal-level').value,
                    saldo: document.getElementById('swal-saldo').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(`/admin/users/${user.id}`, result.value, {
                    onSuccess: () => Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'Data berhasil diupdate!', showConfirmButton: false, timer: 3000 }),
                    onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error')
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-20">
            <Head title="Kelola Member - MilaStore" />

            {/* 🌈 HEADER */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 pt-10 pb-24 px-6 rounded-b-[40px] relative shadow-lg overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 opacity-10 blur-[80px] rounded-full"></div>
                <div className="max-w-5xl mx-auto flex justify-between items-center text-white relative z-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 hover:-translate-x-1 transition-all active:scale-95">
                            <i className="fa-solid fa-arrow-left text-lg"></i>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none mb-1">Database Member</h1>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-200">Pusat Kendali Pengguna</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📦 CONTENT */}
            <div className="max-w-5xl mx-auto px-5 -mt-12 relative z-20">
                <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-50">
                    
                    {/* 🔍 SEARCH & STATS BAR */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="bg-indigo-50/50 px-5 py-3 rounded-2xl border border-indigo-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                <i className="fa-solid fa-users text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Member Aktif</p>
                                <h3 className="text-3xl font-black text-slate-800 leading-none">{users.length} <span className="text-sm font-bold text-slate-400">Akun</span></h3>
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-md w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau email member..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 font-bold text-slate-700 focus:border-indigo-500 focus:bg-white transition-all outline-none shadow-inner"
                            />
                        </div>
                    </div>

                    {/* 📊 TABLE */}
                    <div className="overflow-x-auto rounded-[24px] border border-slate-100 shadow-sm">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Informasi Akun</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Level</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Saldo Dompet</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-slate-400 font-bold">
                                            <i className="fa-solid fa-ghost text-5xl mb-4 opacity-20 block"></i>
                                            Tidak ada member yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u, index) => (
                                        <tr key={u.id} className={`border-slate-50 hover:bg-slate-50/80 transition-colors group ${index !== filteredUsers.length - 1 ? 'border-b' : ''}`}>
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img src={`https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`} className="w-12 h-12 rounded-full shadow-sm border-2 border-white" />
                                                        {u.level === 'admin' && <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[8px] p-1 rounded-full border-2 border-white"><i className="fa-solid fa-crown"></i></div>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-base mb-0.5">{u.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-wide"><i className="fa-regular fa-envelope mr-1"></i>{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.level === 'admin' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                    {u.level === 'admin' ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="font-black text-slate-800 text-lg">
                                                    <span className="text-xs text-slate-400 mr-1 opacity-60">Rp</span> 
                                                    {formatRp(u.saldo)}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <button
                                                    onClick={() => handleEdit(u)}
                                                    className="w-10 h-10 rounded-xl bg-white border-2 border-indigo-100 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm active:scale-90 flex items-center justify-center mx-auto"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
}
