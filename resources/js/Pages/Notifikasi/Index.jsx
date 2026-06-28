import PushToggle from "@/Components/PushToggle";
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

// 🎨 MILASTORE V12 ULTIMATE NOTIF STYLES
const ultimateStyles = `
    .cyber-bg {
        background-color: #f8fafc;
        background-image: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05), transparent 50%);
        min-height: 100vh;
    }
    .notif-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
    }
    .notif-card.unread {
        background: #f0f9ff;
        border-color: #bae6fd;
        box-shadow: 0 4px 15px -3px rgba(56, 189, 248, 0.2);
    }
    .notif-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
        border-color: #bfdbfe;
    }
    .glow-text { text-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
`;

export default function NotificationIndex({ auth, notifications, unreadCount }) {
    
    // 📩 TANDAI 1 DIBACA
    const markRead = (id) => {
        axios.post(`/notifikasi/${id}/read`).then(() => router.reload({ preserveScroll: true }));
    };

    // 🧹 TANDAI SEMUA DIBACA DGN KONFIRMASI SWEETALERT
    const markAllRead = () => {
        Swal.fire({
            title: '<div class="text-xl font-black text-slate-800 tracking-tight uppercase">Tandai Semua?</div>',
            html: '<p class="text-sm font-bold text-slate-500">Semua notifikasi akan ditandai sebagai telah dibaca.</p>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check-double mr-1"></i> Ya, Baca Semua',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            buttonsStyling: false,
            customClass: {
                confirmButton: 'w-full bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl px-5 py-3 mt-4 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] text-[11px] tracking-widest uppercase',
                cancelButton: 'w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-xl px-5 py-3 mt-2 transition-all text-[11px] tracking-widest uppercase',
                popup: 'rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-slate-100'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/notifikasi/read-all', {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success', title: 'Berhasil!', text: 'Semua pesan telah dibaca.',
                            timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-3xl border border-slate-100' }
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pusat Pesan - MilaStore" />
            <style>{ultimateStyles}</style>

            <div className="cyber-bg pb-[140px] md:pb-32 font-['Outfit']">
                
                {/* 🌟 HEADER VIP V12 */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 pt-12 pb-24 px-5 rounded-b-[45px] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    <div className="max-w-md mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <Link href={route('dashboard')} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition-all text-white border border-white/10 shadow-lg active:scale-95 shrink-0">
                                <i className="fa-solid fa-arrow-left"></i>
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-2xl font-black italic tracking-tighter text-white glow-text uppercase mb-0.5">
                                    Pusat Pesan
                                </h1>
                                <p className="text-blue-200/80 text-[10px] font-bold tracking-widest uppercase">
                                    MilaStore Notifikasi
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="absolute right-0 top-1.5 text-[9px] font-black uppercase bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all shadow-md active:scale-95 flex items-center gap-1.5 backdrop-blur-sm">
                                <i className="fa-solid fa-check-double"></i> Baca Semua
                            </button>
                        )}
                    </div>
                    
                    {unreadCount > 0 && (
                        <div className="max-w-md mx-auto mt-6 relative z-10 animate-in fade-in zoom-in duration-300">
                            <div className="inline-flex items-center bg-white/10 border border-white/20 px-4 py-2 rounded-2xl backdrop-blur-md">
                                <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-ping mr-2 shadow-[0_0_10px_rgba(248,113,113,0.8)]"></div>
                                <span className="text-xs font-black text-white tracking-widest uppercase">{unreadCount} Pesan Baru</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 📋 KONTEN NOTIFIKASI */}
                <div className="max-w-md mx-auto px-5 -mt-10 relative z-20">
                    <div className="mb-4">
                        <PushToggle />
                    </div>

                    <div className="space-y-4">
                        {notifications.data.length > 0 ? (
                            notifications.data.map((notif, idx) => {
                                const isUnread = !notif.read_at;
                                const isPromo = notif.data.type === 'promo' || notif.data.title?.toLowerCase().includes('promo');
                                const isSystem = notif.data.type === 'system' || notif.data.title?.toLowerCase().includes('sistem');
                                
                                // Penentuan Ikon & Warna Dinamis
                                let iconClass = notif.data.icon || 'fa-bell';
                                let colorClass = 'bg-blue-50 text-blue-500 border-blue-100';
                                
                                if (isPromo) {
                                    iconClass = 'fa-tag';
                                    colorClass = 'bg-orange-50 text-orange-500 border-orange-100';
                                } else if (isSystem) {
                                    iconClass = 'fa-gear';
                                    colorClass = 'bg-slate-100 text-slate-500 border-slate-200';
                                } else if (notif.data.title?.toLowerCase().includes('sukses')) {
                                    iconClass = 'fa-circle-check';
                                    colorClass = 'bg-emerald-50 text-emerald-500 border-emerald-100';
                                }

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => isUnread && markRead(notif.id)}
                                        className={`notif-card rounded-[24px] p-5 relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in ${isUnread ? 'unread group' : 'opacity-80 grayscale-[20%]'}`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Aksen Biru di Kiri Jika Belum Dibaca */}
                                        {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}

                                        <div className="flex gap-4 items-start">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${colorClass} ${isUnread ? 'ring-4 ring-blue-50 transition-all group-hover:scale-110' : ''}`}>
                                                <i className={`fa-solid ${iconClass} text-xl`}></i>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <h4 className={`text-sm font-black truncate pr-2 ${isUnread ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {notif.data.title}
                                                    </h4>
                                                    {isUnread && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse mt-1"></div>}
                                                </div>
                                                
                                                <div 
                                                    className={`text-xs leading-relaxed ${isUnread ? 'text-slate-600 font-medium' : 'text-slate-400'}`}
                                                    dangerouslySetInnerHTML={{ __html: notif.data.message }}
                                                />
                                                
                                                <div className="mt-3 flex items-center gap-1.5">
                                                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isUnread ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <i className="fa-regular fa-clock mr-1"></i>
                                                        {new Date(notif.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white p-12 rounded-[32px] text-center shadow-sm border border-slate-100 mt-4">
                                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fa-solid fa-bell-slash text-3xl text-slate-300"></i>
                                </div>
                                <h3 className="text-lg font-black text-slate-700 mb-1 uppercase tracking-widest">Hening Sekali</h3>
                                <p className="text-xs text-slate-400 font-bold">Belum ada pemberitahuan untuk Anda.</p>
                            </div>
                        )}
                    </div>

                    {/* 🧭 PAGINASI */}
                    {notifications.links && notifications.data.length > 0 && notifications.links.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-8">
                            {notifications.links.map((link, index) => {
                                if (!link.url && !link.active) return null;
                                return (
                                    <Link 
                                        key={index} 
                                        href={link.url || '#'} 
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', '<i class="fa-solid fa-chevron-left"></i>').replace('Next', '<i class="fa-solid fa-chevron-right"></i>') }} 
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${link.active ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : !link.url ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`} 
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
