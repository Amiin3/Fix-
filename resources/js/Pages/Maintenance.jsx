import React from 'react';
import { Head } from '@inertiajs/react';

export default function Maintenance({ message }) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-['Outfit'] text-center selection:bg-rose-500 selection:text-white">
            <Head title="Sistem Maintenance - MilaStore" />
            
            {/* Animasi Logo/Icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="w-28 h-28 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-5xl text-rose-500 relative z-10 shadow-2xl">
                    <i className="fa-solid fa-person-digging animate-bounce"></i>
                </div>
            </div>

            {/* Teks Peringatan */}
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-widest uppercase">
                Under <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Maintenance</span>
            </h1>
            
            <div className="max-w-md mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                    {message || 'MilaStore sedang melakukan pemeliharaan sistem. Kami akan kembali lebih cepat dari tebakan Anda!'}
                </p>
            </div>

            {/* Footer / Badge */}
            <div className="mt-10 px-6 py-2.5 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-full text-xs font-black tracking-[0.2em]">
                MOHON TUNGGU SEBENTAR
            </div>
        </div>
    );
}
