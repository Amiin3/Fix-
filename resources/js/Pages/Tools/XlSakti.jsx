import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function XlSakti({ auth }) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAction = async (actionStr, requireOtp = false) => {
        if (phone.length < 10) {
            Swal.fire('Oops', 'Masukkan nomor XL yang valid!', 'warning');
            return;
        }

        let otpCode = '';
        if (requireOtp) {
            const { value: otp } = await Swal.fire({
                title: 'Masukkan Kode OTP',
                input: 'text',
                inputPlaceholder: 'Contoh: 123456',
                showCancelButton: true,
                inputValidator: (value) => { if (!value) return 'OTP tidak boleh kosong!' }
            });
            if (!otp) return;
            otpCode = otp;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await axios.post(route('tools.xl.process'), {
                action: actionStr,
                number: phone,
                otp: otpCode
            });

            if (res.data.success) {
                Swal.fire('Berhasil', res.data.message || 'Perintah dieksekusi', 'success');
                setResult(res.data.data);
            } else {
                Swal.fire('Gagal', res.data.message || 'Terjadi kesalahan server', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Jaringan bermasalah', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Alat Sakti XL - MilaStore" />
            <div className="min-h-screen bg-slate-900 font-['Outfit'] pb-32 text-slate-200">
                {/* HEADER */}
                <div className="bg-slate-800 pt-10 pb-12 px-6 rounded-b-[40px] shadow-2xl border-b border-slate-700">
                    <div className="max-w-md mx-auto text-center">
                        <h2 className="text-2xl font-black text-cyan-400 mb-2"><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Alat Sakti XL</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Amifi Utility Tools V1</p>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-5 -mt-6 relative z-10">
                    {/* INPUT NUMBER */}
                    <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 mb-6">
                        <label className="text-[10px] font-black text-cyan-500 uppercase tracking-widest block mb-2">Target Nomor XL</label>
                        <input 
                            type="tel" 
                            className="w-full border-0 border-b-2 border-slate-600 focus:ring-0 focus:border-cyan-400 text-2xl font-black p-0 py-2 bg-transparent text-white placeholder-slate-600 transition-all" 
                            placeholder="0878..." 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    {/* TOOL BUTTONS GRID */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button onClick={() => handleAction('get_otp')} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <i className="fa-solid fa-key block text-2xl mb-2"></i> Minta OTP
                        </button>
                        <button onClick={() => handleAction('login_otp', true)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <i className="fa-solid fa-right-to-bracket block text-2xl mb-2"></i> Login OTP
                        </button>
                        <button onClick={() => handleAction('cek_kuota')} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <i className="fa-solid fa-chart-pie block text-2xl mb-2"></i> Cek Kuota
                        </button>
                        <button onClick={() => handleAction('cek_pulsa')} disabled={loading} className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <i className="fa-solid fa-wallet block text-2xl mb-2"></i> Cek Pulsa
                        </button>
                        <button onClick={() => handleAction('kunci_pulsa')} disabled={loading} className="bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <i className="fa-solid fa-lock block text-2xl mb-2"></i> Kunci Pulsa
                        </button>
                        <button onClick={() => handleAction('buka_pulsa')} disabled={loading} className="bg-slate-600 hover:bg-slate-500 text-white p-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <i className="fa-solid fa-lock-open block text-2xl mb-2"></i> Buka Kunci
                        </button>
                    </div>

                    {/* RESULT TERMINAL VIEW */}
                    {result && (
                        <div className="bg-black p-5 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 flex items-center px-3 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                <span className="ml-2 text-[9px] font-bold text-slate-400">Response Terminal</span>
                            </div>
                            <pre className="mt-4 text-[11px] text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
