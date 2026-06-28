import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

export default function DepositApp({ history, success, error }) {
    const { data, setData, post, processing } = useForm({ 
        jumlah: '', 
        metode: 'JAGO' 
    });

    const formatRp = (n) => n ? new Intl.NumberFormat('id-ID').format(n) : '';
    
    // Cache buster otomatis agar logo tidak stuck di cache lama
    const v = Math.random().toString(36).substring(7);
    const methods = [
        { id: 'JAGO', name: 'Bank Jago', logo: `/images/banks/bank-jago.png?v=${v}`, tag: 'AUTO' },
        { id: 'SEABANK', name: 'SeaBank', logo: `/images/banks/seabank.png?v=${v}`, tag: 'INSTAN' },
        { id: 'QRIS', name: 'QRIS All Pay', logo: `/images/banks/qris.png?v=${v}`, tag: '24 JAM' }
    ];

    const nominals = [10000, 20000, 50000, 100000, 250000, 500000];

    return (
        <div className="mx-auto min-h-screen pb-12 bg-[#F9FAFB] font-sans" style={{ maxWidth: '480px' }}>
            <Head title="Isi Saldo - Amifi Store" />

            {/* HEADER MODERN */}
            <div className="bg-[#4F46E5] pt-12 pb-24 px-6 rounded-b-[50px] shadow-2xl text-center text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center mb-6 opacity-80">
                    <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md">
                        <i className="fa-solid fa-chevron-left"></i>
                    </Link>
                    <span className="text-[10px] font-black tracking-widest uppercase">Amifi Store Payment</span>
                    <div className="w-10"></div>
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter relative z-10">Otomatis 24 Jam</h2>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="px-5 mt-[-70px] relative z-20">
                <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 border border-white">
                    
                    {/* ALERT NOTIFIKASI */}
                    {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-3xl text-[11px] font-black text-center border border-emerald-100">{success}</div>}
                    {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-3xl text-[11px] font-black text-center border border-red-100">{error}</div>}

                    <form onSubmit={(e) => { e.preventDefault(); post('/deposit'); }}>
                        <div className="mb-8 text-center">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Nominal Top Up</label>
                            <div className="flex items-center justify-center gap-2 border-b-2 border-slate-50 pb-3">
                                <span className="text-2xl font-black text-indigo-300">Rp</span>
                                <input 
                                    type="tel" 
                                    className="w-full text-5xl font-black text-slate-800 bg-transparent border-0 focus:ring-0 p-0 tracking-tighter" 
                                    placeholder="0" 
                                    value={formatRp(data.jumlah)} 
                                    onChange={(e) => setData('jumlah', e.target.value.replace(/\D/g, ''))} 
                                />
                            </div>
                        </div>

                        {/* QUICK SELECT NOMINAL */}
                        <div className="grid grid-cols-3 gap-2 mb-8">
                            {nominals.map((nom) => (
                                <button key={nom} type="button" onClick={() => setData('jumlah', nom.toString())}
                                    className={`py-3 rounded-2xl font-black text-[11px] transition-all border-2 ${data.jumlah === nom.toString() ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-50'}`}>
                                    {formatRp(nom)}
                                </button>
                            ))}
                        </div>

                        {/* PILIHAN METODE */}
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Metode Pembayaran</label>
                        <div className="space-y-4 mb-8">
                            {methods.map((m) => (
                                <div key={m.id} onClick={() => setData('metode', m.id)} 
                                     className={`p-4 rounded-[28px] border-2 flex items-center justify-between cursor-pointer transition-all ${data.metode === m.id ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-gray-50 bg-white'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 bg-white rounded-2xl border flex items-center justify-center p-2 shadow-sm">
                                            <img src={m.logo} alt={m.name} className="max-h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">{m.name}</p>
                                            <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">{m.tag}</span>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${data.metode === m.id ? 'bg-indigo-600 border-indigo-600 shadow-inner' : 'border-slate-200'}`}>
                                        {data.metode === m.id && <i className="fa-solid fa-check text-[10px] text-white flex items-center justify-center mt-1"></i>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* INFO BOX DINAMIS */}
                        <div className="mb-10">
                            {data.metode === 'SEABANK' ? (
                                <div className="p-5 bg-orange-50 rounded-[30px] border border-orange-100 flex gap-4">
                                    <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-100">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <div className="text-left text-orange-700">
                                        <h5 className="text-[11px] font-black uppercase mb-1">Penting!</h5>
                                        <p className="text-[10px] font-bold leading-relaxed italic">Wajib transfer menggunakan SeaBank agar otomatis. Antar bank tidak terbaca.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-5 bg-indigo-50 rounded-[30px] border border-indigo-100 flex gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                        <i className="fa-solid fa-circle-info"></i>
                                    </div>
                                    <div className="text-left text-indigo-700">
                                        <h5 className="text-[11px] font-black uppercase mb-1">Info Saldo</h5>
                                        <p className="text-[10px] font-bold leading-relaxed">Transfer sesuai nominal hingga 3 digit terakhir agar saldo masuk hitungan detik.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => post('/deposit')} disabled={processing || !data.jumlah} className="w-full py-5 bg-indigo-600 text-white rounded-[30px] font-black text-sm shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest transition-all">
                            {processing ? 'Loading...' : 'Lanjutkan Pembayaran'}
                        </button>
                    </form>
                </div>

                {/* RIWAYAT AKTIVITAS */}
                <div className="mt-12 px-2 pb-10">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-2 text-left">Aktivitas Terakhir</h5>
                    <div className="space-y-4 text-left">
                        {history && history.length > 0 ? history.map((r) => (
                            <div key={r.id} className="bg-white p-5 rounded-[35px] flex justify-between items-center shadow-sm border border-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                                        <i className="fa-solid fa-wallet"></i>
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-800 tracking-tighter">Rp {formatRp(r.total_bayar)}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{r.metode} • {new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-tighter border ${
                                    r.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>{r.status}</span>
                            </div>
                        )) : (
                            <div className="bg-white py-14 rounded-[40px] text-center border-2 border-dashed border-slate-100 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                Belum Ada Data
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
