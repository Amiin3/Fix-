import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import CsMenu from "@/Components/CsMenu";

export default function Profile({
 auth }) {
    const { user } = auth;
    const [isCsOpen, setIsCsOpen] = useState(false);
    
    // Foto Profil dengan inisial jika kosong
    const fotoProfil = user.foto ? `/assets/img/profile/${user.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128&bold=true`;

    const handleLogout = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Keluar Akun?',
            text: "Anda harus login kembali untuk bertransaksi.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            shape: 'rounded-xl'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/logout'); // Fungsi bawaan Laravel untuk logout
            }
        });
    };

    const handleComingSoon = (e) => {
        e.preventDefault();
        Swal.fire({
            icon: 'info', title: 'Segera Hadir', text: 'Fitur pengaturan ini sedang dalam pembaruan sistem.',
            confirmButtonColor: '#6366f1', confirmButtonText: 'Mengerti'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            <Head title="Profil Akun - Amifi Store" />

            {/* HEADER PROFIL */}
            <div className="bg-gradient-to-b from-indigo-600 to-blue-500 pt-8 px-5 pb-20 rounded-b-[40px] shadow-lg relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="max-w-md mx-auto relative z-10 flex justify-between items-start text-white">
                    <h5 className="font-black text-xl tracking-wide">Profil Akun</h5>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20">
                        {user.role === 'admin' ? '⭐ Admin' : '💎 Member'}
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 -mt-14 relative z-20">
                {/* KARTU IDENTITAS USER */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center mb-6 text-center">
                    <div className="w-24 h-24 bg-white rounded-[24px] p-1.5 shadow-md -mt-16 mb-3">
                        <img src={fotoProfil} alt="Profil" className="w-full h-full object-cover rounded-[18px]" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-0.5">{user.name}</h2>
                    <p className="text-xs font-bold text-slate-500 mb-3">{user.username || user.email}</p>
                    <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase">
                        Terdaftar
                    </div>
                </div>

                {/* MENU PENGATURAN AKUN */}
                <h6 className="font-black text-slate-400 text-[11px] uppercase tracking-[2px] ml-2 mb-3">Pengaturan Akun</h6>
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden">
                    <a href="#" onClick={handleComingSoon} className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors no-underline">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-lg"><i className="fa-solid fa-user-pen"></i></div>
                            <span className="font-bold text-slate-700 text-sm">Edit Profil</span>
                        </div>
                        <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                    </a>
                    <a href="#" onClick={handleComingSoon} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors no-underline">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-lg"><i className="fa-solid fa-lock"></i></div>
                            <span className="font-bold text-slate-700 text-sm">Ganti Password & PIN</span>
                        </div>
                        <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                    </a>
                </div>

                {/* MENU KOMUNITAS & BANTUAN (LINK WA ASLI) */}
                <h6 className="font-black text-slate-400 text-[11px] uppercase tracking-[2px] ml-2 mb-3">Komunitas & Bantuan</h6>
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden">
                    <a href="https://chat.whatsapp.com/DHi6CfDy87UDZiwRQCS1QM?mode=gi_t" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-emerald-50 transition-colors no-underline">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#25D366] text-white shadow-md shadow-green-200 rounded-2xl flex items-center justify-center text-xl"><i className="fa-brands fa-whatsapp"></i></div>
                            <div>
                                <span className="font-bold text-slate-700 text-sm block">Grup Diskusi WhatsApp</span>
                                <span className="text-[10px] font-semibold text-slate-400 block">Gabung komunitas member.</span>
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-emerald-500 text-xs"></i>
                    </a>
                    <a href="https://whatsapp.com/channel/0029VaRBcJEHrDZhT0G5GK3e" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-teal-50 transition-colors no-underline">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#128C7E] text-white shadow-md shadow-teal-200 rounded-2xl flex items-center justify-center text-xl"><i className="fa-solid fa-bullhorn"></i></div>
                            <div>
                                <span className="font-bold text-slate-700 text-sm block">Saluran WhatsApp Resmi</span>
                                <span className="text-[10px] font-semibold text-slate-400 block">Info & Promo PPOB tercepat.</span>
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-up-right-from-square text-teal-500 text-xs"></i>
                    </a>
                    <button onClick={() => setIsCsOpen(true)} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors no-underline w-full text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-lg"><i className="fa-solid fa-headset"></i></div>
                            <span className="font-bold text-slate-700 text-sm">Hubungi Customer Service</span>
                        </div>
                        <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                    </button>
                </div>

                {/* TOMBOL LOGOUT */}
                <button onClick={handleLogout} className="w-full bg-rose-50 text-rose-600 border border-rose-100 font-black py-4 rounded-[20px] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 flex items-center justify-center gap-2">
                    <i className="fa-solid fa-right-from-bracket"></i> KELUAR AKUN
                </button>
                <div className="text-center mt-6">
                    <span className="text-[10px] font-bold text-slate-400">Amifi Store System v2.0 © 2026</span>
                </div>
            </div>

            <CsMenu isOpen={isCsOpen} onClose={() => setIsCsOpen(false)} />
            {/* BOTTOM NAVIGATION FIXED */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe z-50">
                <div className="max-w-md mx-auto px-6 py-3 flex justify-between items-center">
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors no-underline">
                        <span className="text-xl">🏠</span>
                        <span className="text-[9px] font-black tracking-wider">BERANDA</span>
                    </Link>
                    <Link href="/riwayat" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors no-underline">
                        <span className="text-xl">🧾</span>
                        <span className="text-[9px] font-black tracking-wider">RIWAYAT</span>
                    </Link>
                    <Link href="/deposit" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors no-underline">
                        <span className="text-xl">💳</span>
                        <span className="text-[9px] font-black tracking-wider">DEPOSIT</span>
                    </Link>
                    <Link href="/profile" className="flex flex-col items-center gap-1 text-indigo-600 no-underline">
                        <span className="text-xl">👤</span>
                        <span className="text-[9px] font-black tracking-wider">PROFIL</span>
                    </Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `.pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 10px); }`}} />
        </div>
    );
}
