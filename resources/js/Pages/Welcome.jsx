import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Selamat Datang - Amifi Store" />
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-['Outfit']">
                
                {/* 🎨 EFEK CAHAYA SULTAN DI BACKGROUND */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse"></div>
                
                {/* 🌌 POLA GRID BACKGROUND */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                <div className="relative z-10 text-center px-6 w-full max-w-2xl">
                    
                    {/* KOTAK KACA (GLASSMORPHISM) */}
                    <div className="bg-white/10 backdrop-blur-2xl p-10 md:p-14 rounded-[40px] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                        
                        {/* ICON ROKET */}
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30 border-4 border-slate-800">
                            <i className="fa-solid fa-bolt text-4xl text-white"></i>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300 tracking-tighter mb-4 drop-shadow-lg uppercase">
                            MilaStore
                        </h1>
                        
                        <p className="text-indigo-200 text-sm md:text-base font-medium mb-10 leading-relaxed px-4">
                            Platform PPOB & TopUp Games Terlengkap.
                            <br className="hidden md:block"/> Sistem serba otomatis, online 24 jam nonstop.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {auth.user ? (
                                // JIKA SUDAH LOGIN, TAMPILKAN TOMBOL KE DASHBOARD
                                <Link
                                    href={route('dashboard')}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black px-8 py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-white/20"
                                >
                                    <i className="fa-solid fa-rocket"></i> Masuk Dashboard
                                </Link>
                            ) : (
                                // JIKA BELUM LOGIN, TAMPILKAN TOMBOL LOGIN & REGISTER
                                <>
                                    <Link
                                        href={route('login')}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black px-8 py-5 rounded-2xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-white/20"
                                    >
                                        <i className="fa-solid fa-right-to-bracket"></i> Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-slate-800/50 hover:bg-slate-800 text-white border border-white/20 font-black px-8 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                    >
                                        <i className="fa-solid fa-user-plus"></i> Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-slate-500 text-[10px] mt-12 font-black uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} Amifi Store. All Rights Reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
