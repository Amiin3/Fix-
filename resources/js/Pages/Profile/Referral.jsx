import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Referral({ auth, user: userProp, downlines = [], komisi = 0 }) {
    // Kita pakai userProp dari Controller karena ini yang sudah ter-generate kodenya
    const user = userProp || auth.user;
    const refCode = user.kode_referral || 'KLIK_REFRESH...';
    const refLink = `${window.location.origin}/register?ref=${refCode}`;

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

    const copyLink = () => {
        if (!user.kode_referral) return Swal.fire('Error', 'Kode belum siap, coba refresh', 'error');
        navigator.clipboard.writeText(refLink);
        Swal.fire({ title: 'Tersalin!', text: 'Link Referral siap dibagikan!', icon: 'success', timer: 1500, showConfirmButton: false });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Referral Sultan - MilaStore" />
            <div className="min-h-screen bg-slate-50 pb-32 pt-10">
                <div className="max-w-2xl mx-auto px-5 space-y-6">
                    <Link href="/profile" className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 w-max">
                        <i className="fa-solid fa-arrow-left"></i> Kembali
                    </Link>

                    <div className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl">
                        <p className="text-xs font-black uppercase tracking-widest opacity-60">Komisi Sultan</p>
                        <h2 className="text-4xl font-black">Rp {formatRp(komisi)}</h2>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4">Link Referral</h3>
                        <div className="flex bg-slate-100 p-2 rounded-2xl items-center">
                            <input type="text" readOnly value={refLink} className="flex-1 bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0" />
                            <button onClick={copyLink} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs">Salin</button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
