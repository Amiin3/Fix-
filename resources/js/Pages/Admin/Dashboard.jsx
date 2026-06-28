import React, { useEffect } from 'react';
import  { Head, Link, router, usePage, useForm }  from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Dashboard({ auth, stats, recent_deposits, success, error }) {
    // Kode dashboard admin Bos...
    // Semua fungsi yang tadinya pakai Inertia.post sekarang otomatis pakai router.post
    return (
        <div className="p-6 bg-slate-900 min-h-screen text-white">
            <Head title="Admin Panel" />
            {/* Tampilan Dashboard Admin Bos */}
        </div>
    );
}
