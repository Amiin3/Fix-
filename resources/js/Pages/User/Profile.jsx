import React from 'react';
import { Head, Link } from '@inertiajs/react';
export default function Profile({ user }) {
    return (<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50"><h1 className="text-2xl font-black">PROFIL AKUN</h1><p className="text-slate-400">{user?.name}</p><Link href="/dashboard" className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl">Kembali</Link></div>);
}
