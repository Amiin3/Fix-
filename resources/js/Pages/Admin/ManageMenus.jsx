import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

const defaultAdminMenus = [
    { name: "VPN Manager", icon: "fa-server", route: "admin.vpn.index" }, { name: "Transaksi", icon: "fa-receipt", route: "admin.transaksi.index" },
    { name: "Deposit", icon: "fa-wallet", route: "admin.deposit.index" }, { name: "Digiflazz", icon: "fa-bolt", route: "admin.digiflazz.index" },
    { name: "Keuangan", icon: "fa-money-bill-trend-up", route: "admin.keuangan" }, { name: "Sistem XDA", icon: "fa-microchip", route: "admin.kaje.index" },
    { name: "War XDA", icon: "fa-rocket", route: "admin.kaje.war.index" }, { name: "Command PO", icon: "fa-robot", route: "admin.po_v8" },
    { name: "Promo", icon: "fa-bullhorn", route: "admin.promo.index" }, { name: "Sistem XLA", icon: "fa-users", route: "admin.khfy.index" },
    { name: "War XLA", icon: "fa-jet-fighter", route: "admin.khfy.war.po" }, { name: "Adammedia", icon: "fa-satellite-dish", url: "/admin/adammedia" },
    { name: "Member", icon: "fa-users-gear", route: "admin.users" }, { name: "Audit", icon: "fa-user-secret", url: "/admin/audit", isBlade: true },
    { name: "Broadcast", icon: "fa-tower-broadcast", route: "admin.broadcast" }, { name: "Setting", icon: "fa-sliders", route: "profile.edit" },
    { name: "Diskon", icon: "fa-tags", url: "/admin/reseller-discounts" }, { name: "Payment", icon: "fa-money-check-dollar", url: "/admin/payment-settings" },
    { name: "Kelola Menu", icon: "fa-layer-group", url: "/admin/menus" }
];

const defaultAppMenus = [
    { name: "VPN V12", icon: "fa-shield-halved", color: "text-white", bg: "bg-gradient-to-br from-blue-700 to-indigo-900 shadow-md border border-indigo-400/30", route: "order.vpn" },
    { name: "Cek Kuota", icon: "fa-magnifying-glass-chart", color: "text-white", bg: "bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md border border-emerald-400/30", url: "https://milastore.cloud/order/cek-kuota" },
    { name: "Pulsa", icon: "fa-mobile-retro", color: "text-white", bg: "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md", route: "order.pulsa" },
    { name: "Data", icon: "fa-wifi", color: "text-white", bg: "bg-gradient-to-br from-indigo-400 to-purple-600 shadow-md", route: "order.data" },
    { name: "E-Wallet", icon: "fa-wallet", color: "text-white", bg: "bg-gradient-to-br from-sky-300 to-cyan-500 shadow-md", route: "order.ewallet" },
    { name: "PLN", icon: "fa-bolt", color: "text-white", bg: "bg-gradient-to-br from-yellow-300 to-amber-500 shadow-md", route: "order.pln" },
    { name: "Pascabayar", icon: "fa-file-invoice-dollar", color: "text-white", bg: "bg-gradient-to-br from-teal-400 to-emerald-600 shadow-md", route: "order.pascabayar" },
    { name: "Games", icon: "fa-gamepad", color: "text-white", bg: "bg-gradient-to-br from-emerald-400 to-green-600 shadow-md", route: "order.games" },
    { name: "Voucher", icon: "fa-ticket", color: "text-white", bg: "bg-gradient-to-br from-rose-400 to-red-600 shadow-md", route: "order.voucher" },
    { name: "Masa Aktif", icon: "fa-calendar-check", color: "text-white", bg: "bg-gradient-to-br from-orange-400 to-rose-500 shadow-md", route: "order.masa-aktif" },
    { name: "Akrab XLA", icon: "fa-users", color: "text-white", bg: "bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md", route: "order.akrab" },
    { name: "Akrab V8", icon: "fa-share-nodes", color: "text-white", bg: "bg-gradient-to-br from-pink-400 to-rose-600 shadow-md border border-pink-300/50", url: "/order/akrabv8", isBlade: true },
    { name: "PO XLA", icon: "fa-fire", color: "text-white", bg: "bg-gradient-to-br from-red-500 to-orange-600 shadow-md", route: "war.xla.index" },
    { name: "Akrab XDA", icon: "fa-microchip", color: "text-white", bg: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-md", route: "order.xda" },
    { name: "PO XDA", icon: "fa-rocket", color: "text-white", bg: "bg-gradient-to-br from-indigo-500 to-blue-700 shadow-md", route: "order.po-xda.view" },
    { name: "Tool XL", icon: "fa-wrench", color: "text-white", bg: "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md", route: "tools.xl" },
    { name: "API Docs", icon: "fa-laptop-code", color: "text-white", bg: "bg-gradient-to-br from-slate-700 to-slate-900 shadow-md border border-slate-500/50", url: "/developer/payment-gateway-docs" }
];

// 🚀 DAFTAR PALET WARNA SULTAN
const colorPresets = [
    { bg: 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-md border border-white/20', preview: 'from-blue-600 to-blue-800' },
    { bg: 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md border border-white/20', preview: 'from-cyan-400 to-blue-600' },
    { bg: 'bg-gradient-to-br from-teal-400 to-emerald-600 shadow-md border border-white/20', preview: 'from-teal-400 to-emerald-600' },
    { bg: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-md border border-white/20', preview: 'from-emerald-400 to-green-600' },
    { bg: 'bg-gradient-to-br from-yellow-300 to-amber-500 shadow-md border border-white/20', preview: 'from-yellow-300 to-amber-500' },
    { bg: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md border border-white/20', preview: 'from-amber-500 to-orange-600' },
    { bg: 'bg-gradient-to-br from-rose-500 to-red-600 shadow-md border border-white/20', preview: 'from-rose-500 to-red-600' },
    { bg: 'bg-gradient-to-br from-pink-400 to-rose-600 shadow-md border border-white/20', preview: 'from-pink-400 to-rose-600' },
    { bg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md border border-white/20', preview: 'from-purple-500 to-fuchsia-600' },
    { bg: 'bg-gradient-to-br from-indigo-500 to-blue-700 shadow-md border border-white/20', preview: 'from-indigo-500 to-blue-700' },
    { bg: 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-md border border-white/20', preview: 'from-slate-700 to-slate-900' },
    { bg: 'bg-gradient-to-br from-slate-100 to-slate-200 shadow-md border border-slate-300 text-slate-800', preview: 'from-slate-100 to-slate-200' }
];

export default function ManageMenus({ auth }) {
    const [adminMenus, setAdminMenus] = useState(defaultAdminMenus);
    const [appMenus, setAppMenus] = useState(defaultAppMenus);
    const [activeTab, setActiveTab] = useState('app');

    useEffect(() => {
        axios.get('/api/menus/list').then(res => {
            if (res.data.status === 'custom') {
                setAdminMenus(res.data.data.admin);
                setAppMenus(res.data.data.app);
            }
        });
    }, []);

    const saveToServer = (newAdmin, newApp) => {
        Swal.fire({
            title: 'Memperbarui Dashboard...', 
            allowOutsideClick: false, 
            didOpen:() => Swal.showLoading()
        });
        axios.post('/admin/menus/save', {admin: newAdmin, app: newApp}).then(res => {
            Swal.fire({
                title: 'Mantap! 🎉',
                text: res.data.message || 'Perubahan menu berhasil diterapkan.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    const renderIconPreview = (iconString) => {
        if (!iconString) return <i className="fa-solid fa-circle"></i>;
        if (iconString.includes('/') || iconString.includes('http')) return <img src={iconString} className="w-full h-full object-contain p-1.5 drop-shadow-md" alt="icon" />;
        return <i className={`fa-solid ${iconString}`}></i>;
    };

    const handleEdit = (type, index) => {
        const list = type === 'admin' ? [...adminMenus] : [...appMenus];
        const item = list[index];
        const hasImage = item.icon && (item.icon.includes('/') || item.icon.includes('http'));

        // 🚀 BIKIN HTML PALET WARNA (KHUSUS MENU PRODUK)
        const paletteHtml = type === 'app' ? `
            <div class="text-left mb-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Palet Warna (Klik untuk Pilih)</div>
            <div class="grid grid-cols-6 gap-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ${colorPresets.map(c => `
                    <div class="w-full h-8 rounded-lg cursor-pointer shadow-sm border border-slate-200 hover:scale-110 hover:shadow-md transition-all bg-gradient-to-br ${c.preview}" 
                         onclick="document.getElementById('m-bg').value='${c.bg}'" 
                         title="Pilih Warna Ini">
                    </div>
                `).join('')}
            </div>
            <div class="text-left mb-1 text-[10px] font-black uppercase text-slate-500 tracking-widest">Kustom Kode Warna (Manual)</div>
            <input id="m-bg" class="swal2-input !mt-0 !mb-4 !w-full !text-[11px] font-mono text-slate-500" value="${item.bg}">
        ` : '';

        Swal.fire({
            title: `<div class="text-xl font-black">Edit Menu ${type === 'app' ? 'Produk' : 'Admin'}</div>`,
            html: `
                <div class="text-left mt-4 mb-1 text-[10px] font-black uppercase text-slate-500 tracking-widest">Nama Menu</div>
                <input id="m-name" class="swal2-input !mt-0 !mb-4 !w-full" value="${item.name}">
                
                <div class="text-left mb-1 text-[10px] font-black uppercase text-slate-500 tracking-widest">Tipe Logo / Icon</div>
                <select id="m-icon-type" class="w-full border-2 border-slate-200 rounded-xl mb-3 font-bold text-slate-700 py-2.5 px-3" onchange="
                    if(this.value === 'upload') {
                        document.getElementById('icon-upload-div').style.display = 'block';
                        document.getElementById('icon-text-div').style.display = 'none';
                    } else {
                        document.getElementById('icon-upload-div').style.display = 'none';
                        document.getElementById('icon-text-div').style.display = 'block';
                    }
                ">
                    <option value="text" ${!hasImage ? 'selected' : ''}>FontAwesome Icon (Teks)</option>
                    <option value="upload" ${hasImage ? 'selected' : ''}>Upload Gambar Galeri</option>
                </select>

                <div id="icon-text-div" style="display: ${!hasImage ? 'block' : 'none'};">
                    <input id="m-icon-text" class="swal2-input !mt-0 !mb-4 !w-full" placeholder="Contoh: fa-rocket" value="${!hasImage ? item.icon : 'fa-circle'}">
                </div>

                <div id="icon-upload-div" style="display: ${hasImage ? 'block' : 'none'};">
                    <div class="mb-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[90px] shadow-inner">
                        <img id="m-preview-img" src="${hasImage ? item.icon : ''}" class="h-14 mx-auto object-contain drop-shadow-md z-10 relative transition-all" style="display: ${hasImage ? 'block' : 'none'};">
                        <div id="m-preview-text" style="display: ${hasImage ? 'none' : 'block'};" class="z-10 relative">
                            <i class="fa-solid fa-cloud-arrow-up text-2xl text-blue-400 mb-2 block"></i>
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Gambar (Maks 2MB)</span>
                        </div>
                    </div>
                    <input type="file" id="m-file" accept="image/*" class="w-full border-2 border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-600 mb-4 bg-white cursor-pointer hover:border-blue-400 transition-colors" onchange="
                        const file = this.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                document.getElementById('m-preview-img').src = e.target.result;
                                document.getElementById('m-preview-img').style.display = 'block';
                                document.getElementById('m-preview-text').style.display = 'none';
                            }
                            reader.readAsDataURL(file);
                        }
                    ">
                </div>

                ${paletteHtml}
                
                <div class="text-left mb-1 text-[10px] font-black uppercase text-slate-500 tracking-widest">URL / Route Tujuan</div>
                <input id="m-url" class="swal2-input !mt-0 !mb-4 !w-full" placeholder="/url-bebas ATAU nama.route" value="${item.url || item.route || ''}">
            `,
            showCancelButton: true, 
            confirmButtonText: '<i class="fa-solid fa-floppy-disk mr-1"></i> Simpan', 
            confirmButtonColor: '#3b82f6',
            cancelButtonText: 'Batal',
            preConfirm: async () => {
                const typeIcon = document.getElementById('m-icon-type').value;
                let finalIcon = item.icon;

                if (typeIcon === 'text') {
                    finalIcon = document.getElementById('m-icon-text').value;
                } else {
                    const fileInput = document.getElementById('m-file');
                    if (fileInput.files.length > 0) {
                        const formData = new FormData();
                        formData.append('icon_file', fileInput.files[0]);
                        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                        
                        try {
                            Swal.getConfirmButton().innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sedang Mengunggah...';
                            Swal.getConfirmButton().disabled = true;

                            const res = await axios.post('/admin/menus/upload-icon', formData, {
                                headers: { 
                                    'Content-Type': 'multipart/form-data',
                                    'X-CSRF-TOKEN': csrfToken
                                },
                                onUploadProgress: (progressEvent) => {
                                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                    Swal.showValidationMessage(`🚀 Proses Upload: ${percentCompleted}%`);
                                }
                            });
                            
                            finalIcon = res.data.url;
                            Swal.resetValidationMessage(); 
                        } catch (e) {
                            const errText = e.response?.data?.message || 'Network Error / Timeout. Pastikan gambar di bawah 2MB.';
                            Swal.showValidationMessage(`❌ Gagal Upload: ${errText}`);
                            Swal.getConfirmButton().innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Simpan';
                            Swal.getConfirmButton().disabled = false;
                            return false; 
                        }
                    }
                }

                const urlVal = document.getElementById('m-url').value;
                const isRoute = !urlVal.startsWith('/') && !urlVal.startsWith('http');
                
                return {
                    ...item,
                    name: document.getElementById('m-name').value, 
                    icon: finalIcon,
                    bg: type === 'app' ? document.getElementById('m-bg').value : item.bg,
                    url: isRoute ? '' : urlVal, route: isRoute ? urlVal : '',
                }
            }
        }).then(res => {
            if(res.isConfirmed) {
                list[index] = res.value;
                if(type === 'admin') { setAdminMenus(list); saveToServer(list, appMenus); }
                else { setAppMenus(list); saveToServer(adminMenus, list); }
            }
        })
    };

    const renderList = (type, data) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {data.map((m, i) => (
                <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-300 transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-inner overflow-hidden ${type === 'app' ? m.bg : 'bg-slate-800'}`}>
                            {renderIconPreview(m.icon)}
                        </div>
                        <div><h4 className="font-black text-slate-800 text-sm leading-tight mb-0.5">{m.name}</h4><p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[120px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{m.route || m.url}</p></div>
                    </div>
                    <button onClick={() => handleEdit(type, i)} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center shrink-0"><i className="fa-solid fa-pen"></i></button>
                </div>
            ))}
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Menu" />
            <div className="py-8 bg-slate-50 min-h-screen font-['Outfit']">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-layer-group"></i></div>
                            <div><h2 className="text-xl font-black text-slate-800 leading-tight">Manajer Menu Dinamis</h2><p className="text-xs text-slate-500 font-medium">Ubah logo dan warna menu secara instan.</p></div>
                        </div>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
                            <button onClick={() => setActiveTab('app')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'app' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>Menu Produk</button>
                            <button onClick={() => setActiveTab('admin')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>Menu Admin</button>
                        </div>
                    </div>
                    {activeTab === 'app' ? renderList('app', appMenus) : renderList('admin', adminMenus)}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
