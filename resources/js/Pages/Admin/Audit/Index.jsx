import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index() {
    const [auditUser, setAuditUser] = useState('');
    const [auditData, setAuditData] = useState(null);
    const [loadingAudit, setLoadingAudit] = useState(false);
    
    const [checkedDeposits, setCheckedDeposits] = useState({});
    const [checkedTrx, setCheckedTrx] = useState({});

    const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    const fetchAuditData = async () => {
        if (!auditUser) return;
        setLoadingAudit(true);
        try {
            const res = await axios.get(`/admin/audit?audit_user=${auditUser}`);
            if (res.data.error) return Swal.fire('Gagal', res.data.error, 'error');
            
            setAuditData(res.data);
            
            // Centang semua secara default
            const initDep = {}; res.data.deposits.forEach(d => initDep[d.id] = true);
            const initTrx = {}; res.data.transaksi.forEach(t => initTrx[t.id] = true);
            setCheckedDeposits(initDep); setCheckedTrx(initTrx);
        } catch (e) {
            Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
        } finally {
            setLoadingAudit(false);
        }
    };

    const calcValues = useMemo(() => {
        let calcDeposit = 0, calcTrxKeluar = 0, calcTrxMasuk = 0;
        if (auditData) {
            auditData.deposits.forEach(d => { if (checkedDeposits[d.id]) calcDeposit += parseFloat(d.total_bayar); });
            auditData.transaksi.forEach(t => {
                if (checkedTrx[t.id]) {
                    let harga = parseFloat(t.harga);
                    let sn = (t.sn || '').toLowerCase();
                    let isMasuk = harga < 0 || (t.kode_layanan === 'MANUAL' && (sn.includes('tambah') || sn.includes('masuk') || sn.includes('refund')));
                    if (isMasuk) calcTrxMasuk += Math.abs(harga);
                    else calcTrxKeluar += Math.abs(harga);
                }
            });
        }
        return { calcDeposit, calcTrxKeluar, calcTrxMasuk, finalSaldo: calcDeposit + calcTrxMasuk - calcTrxKeluar };
    }, [auditData, checkedDeposits, checkedTrx]);

    const submitFixSaldo = () => {
        Swal.fire({
            title: 'Yakin Timpa Saldo?',
            text: `Saldo akan diubah menjadi Rp ${formatRp(calcValues.finalSaldo)}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Sinkronkan!',
            confirmButtonColor: '#4f46e5'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/admin/audit', { fix_saldo_user_id: auditData.user.id, new_saldo: calcValues.finalSaldo }, {
                    onSuccess: () => {
                        setAuditData(null);
                        setAuditUser('');
                        Swal.fire('Berhasil', 'Saldo berhasil disinkronkan secara permanen!', 'success');
                    }
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <Head title="Pusat Audit - MilaStore" />
            
            <div className="bg-[#0f172a] pt-12 pb-24 px-6 rounded-b-[50px] shadow-2xl">
                <h1 className="text-2xl font-black text-white tracking-tight"><i className="fa-solid fa-magnifying-glass-chart text-indigo-400 mr-2"></i> Pusat Audit Keuangan</h1>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[3px] mt-1">X-Ray Ledger & Sinkronisasi Saldo</p>
            </div>

            <div className="px-6 -mt-16 max-w-6xl mx-auto space-y-6 relative z-10">
                
                {/* PANEL PENCARIAN */}
                <div className="bg-white rounded-[32px] p-4 shadow-xl flex flex-col md:flex-row gap-4 border border-slate-100">
                    <input type="text" placeholder="Masukkan Nama / Email / WA Member untuk diaudit..." value={auditUser} onChange={(e) => setAuditUser(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchAuditData()} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <button onClick={fetchAuditData} disabled={loadingAudit} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all">{loadingAudit ? 'Mencari...' : 'Tarik Data'}</button>
                </div>

                {auditData ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10">
                        {/* KOTAK HASIL KALKULASI PINTAR */}
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-indigo-800">
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Saldo Asli di Database</p>
                                    <h3 className="text-2xl font-black text-slate-400 line-through mt-1">{formatRp(auditData.user.saldo || 0)}</h3>
                                    <p className="text-xs text-slate-500 font-bold mt-2">Member: @{auditData.user.name}</p>
                                </div>
                                <div className="border-l border-indigo-800 pl-10">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Kalkulasi Mesin X-Ray</p>
                                    <h3 className={`text-4xl font-black tracking-tight mt-1 ${calcValues.finalSaldo < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>{formatRp(calcValues.finalSaldo)}</h3>
                                </div>
                            </div>
                            <button onClick={submitFixSaldo} className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[3px] shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                <i className="fa-solid fa-rotate mr-2"></i> Timpa Saldo
                            </button>
                        </div>

                        {/* TABEL MUTASI INTERAKTIF */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* TABEL MASUK */}
                            <div className="bg-white rounded-[40px] p-6 shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-6 px-2"><i className="fa-solid fa-arrow-down mr-2"></i> Deposit (Uang Masuk)</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {auditData.deposits.length === 0 ? <p className="text-xs font-bold text-slate-400 text-center py-10">Tidak ada riwayat.</p> : auditData.deposits.map(d => (
                                        <label key={d.id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${checkedDeposits[d.id] ? 'bg-emerald-50/50 border-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-200 grayscale opacity-60'}`}>
                                            <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded-md" checked={checkedDeposits[d.id]} onChange={() => setCheckedDeposits(p => ({...p, [d.id]: !p[d.id]}))} />
                                            <div className="ml-4 flex-1">
                                                <p className="text-sm font-black text-slate-800">{d.metode} <span className="float-right text-emerald-600">{formatRp(d.total_bayar)}</span></p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1">ID: {d.id} • {new Date(d.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            {/* TABEL KELUAR */}
                            <div className="bg-white rounded-[40px] p-6 shadow-sm border border-slate-100">
                                <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-6 px-2"><i className="fa-solid fa-arrow-up mr-2"></i> Transaksi (Keluar / Manual)</h3>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {auditData.transaksi.length === 0 ? <p className="text-xs font-bold text-slate-400 text-center py-10">Tidak ada riwayat.</p> : auditData.transaksi.map(t => {
                                        const harga = parseFloat(t.harga);
                                        const sn = (t.sn || '').toLowerCase();
                                        const isMasuk = harga < 0 || (t.kode_layanan === 'MANUAL' && (sn.includes('tambah') || sn.includes('masuk') || sn.includes('refund')));
                                        return (
                                            <label key={t.id} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${checkedTrx[t.id] ? (isMasuk ? 'bg-indigo-50/50 border-indigo-500 shadow-sm' : 'bg-rose-50/50 border-rose-500 shadow-sm') : 'bg-slate-50 border-slate-200 grayscale opacity-60'}`}>
                                                <input type="checkbox" className={`w-5 h-5 rounded-md ${isMasuk ? 'text-indigo-600' : 'text-rose-600'}`} checked={checkedTrx[t.id]} onChange={() => setCheckedTrx(p => ({...p, [t.id]: !p[t.id]}))} />
                                                <div className="ml-4 flex-1">
                                                    <p className="text-sm font-black text-slate-800">{t.kode_layanan} <span className={`float-right ${isMasuk ? 'text-indigo-600' : 'text-rose-600'}`}>{isMasuk ? '+' : '-'}{formatRp(Math.abs(harga))}</span></p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-1">SN: {t.sn || '-'}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">ID: {t.id} • {new Date(t.created_at).toLocaleString('id-ID')}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100 border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-box-open text-3xl text-slate-300"></i>
                        </div>
                        <h3 className="text-lg font-black text-slate-700">Ruang Audit Kosong</h3>
                        <p className="text-sm font-medium text-slate-400 mt-1">Masukkan nama member di atas untuk memulai X-Ray keuangan.</p>
                    </div>
                )}
            </div>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}</style>
        </div>
    );
}
