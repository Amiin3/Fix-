import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function VerifyOtp({ email }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        Swal.fire({ title: 'Memeriksa Kode...', didOpen: () => { Swal.showLoading() } });
        post(route('otp.check'), {
            onSuccess: () => {
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Nomor WhatsApp terverifikasi.', timer: 2000, showConfirmButton: false });
            },
            onError: (err) => {
                Swal.fire({ icon: 'error', title: 'Gagal', text: err.otp || 'Kode OTP Salah!' });
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center p-6 font-sans">
            <Head title="Verifikasi WhatsApp - Mila Store" />
            
            <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-white">
                <div className="p-8 sm:p-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-green-400 to-emerald-500 text-white shadow-xl shadow-green-200 mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Cek WhatsApp Anda</h2>
                    <p className="text-[13px] text-slate-500 font-medium mb-8">
                        Kami telah mengirimkan 6-digit kode OTP ke nomor WhatsApp yang Anda daftarkan.
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <input 
                                type="text" 
                                maxLength="6"
                                value={data.otp} 
                                onChange={e => setData('otp', e.target.value)} 
                                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-400 font-black"
                                placeholder="••••••"
                                required
                            />
                            {errors.otp && <p className="text-red-500 text-xs mt-2 font-bold">{errors.otp}</p>}
                        </div>

                        <button disabled={processing} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[13px] font-black uppercase tracking-widest py-4 px-4 rounded-2xl shadow-lg shadow-emerald-200 transform transition-all active:scale-[0.98]">
                            {processing ? 'MEMVERIFIKASI...' : 'VERIFIKASI SEKARANG'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
