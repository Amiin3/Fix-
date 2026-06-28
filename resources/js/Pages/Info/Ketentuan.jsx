import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Ketentuan({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Syarat & Ketentuan - MilaStore" />
            <div className="py-12 px-6 max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-800 mb-6">Syarat & Ketentuan</h2>
                    <div className="prose prose-slate text-sm font-medium leading-relaxed">
                        <p>1. Transaksi di MilaStore diproses otomatis oleh sistem H2H.</p>
                        <p>2. Saldo yang sudah dideposit tidak dapat diuangkan kembali.</p>
                        <p>3. Pengguna wajib menjaga kerahasiaan PIN dan Password.</p>
                        <p>4. MilaStore tidak bertanggung jawab atas kesalahan input nomor tujuan oleh pengguna.</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
