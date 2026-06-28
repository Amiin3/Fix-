import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function WarPo({ auth }) {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [cancelRef, setCancelRef] = useState('');
    const terminalEndRef = useRef(null);

    // Auto-scroll log monitor
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // 🌟 FIX 1: AUTO-CLEAN LOGS (Maksimal 100 baris agar browser tidak nge-lag/crash)
    const addLog = (msg, type = 'wait') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => {
            const newLogs = [...prev, { time, msg, type }];
            return newLogs.slice(-100); 
        });
    };

    const fetchTable = () => {
        axios.post(route('admin.khfy.warengine.list'))
            .then(res => setTableData(res.data.data || []))
            .catch(err => console.error('Tabel Sync Error'));
    };

    useEffect(() => {
        let timer;
        const runEngine = async () => {
            if (!isRunning) return;
            try {
                const res = await axios.post(route('admin.khfy.warengine.execute'));
                addLog(res.data.log, res.data.status);
            } catch (error) {
                addLog('Koneksi Engine terputus. Mencoba ulang...', 'error');
            }
            if (isRunning) timer = setTimeout(runEngine, 1500); 
        };

        if (isRunning) {
            addLog('⚡ WAR DIMULAI! Sistem Polling Async Aktif...', 'shoot');
            runEngine();
        } else {
            clearTimeout(timer);
        }
        return () => clearTimeout(timer);
    }, [isRunning]);

    useEffect(() => {
        fetchTable();
        const syncTimer = setInterval(fetchTable, 3000);
        return () => clearInterval(syncTimer);
    }, []);

    const handleAction = async (actionData, confirmMsg) => {
        if (!confirm(confirmMsg)) return;
        try {
            const res = await axios.post(route('admin.khfy.warengine.action'), actionData);
            addLog(res.data.log, res.data.status);
            fetchTable();
        } catch (error) {
            addLog('Gagal mengeksekusi perintah.', 'error');
        }
    };

    const getLogColor = (type) => {
        if (type === 'shoot' || type === 'success') return 'text-emerald-400 font-semibold';
        if (type === 'error' || type === 'warning' || type === 'spamming') return 'text-rose-400 font-semibold';
        return 'text-slate-300';
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-bold text-2xl text-slate-800 leading-tight">Command Center</h2>}>
            <Head title="PO Command Center" />
            
            <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* Header & Main Toggle */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Status Sistem Auto-PO</h3>
                            <p className="text-sm text-slate-500">Mesin Gatling Gun God Mode (Async Polling)</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsRunning(true)} disabled={isRunning} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-200 animate-pulse' : 'bg-emerald-200'}`}></div>
                                {isRunning ? 'SISTEM BERJALAN' : 'MULAI WAR'}
                            </button>
                            <button onClick={() => { setIsRunning(false); addLog('🛑 SISTEM DIHENTIKAN MANUAL.', 'error'); }} disabled={!isRunning} className="flex items-center gap-2 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:border-slate-100 disabled:text-slate-400">
                                STOP WAR
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Kiri: Panel Kontrol Darurat */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">🛡️</span>
                                    Manajemen Darurat
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Batalkan Manual (Ref ID)</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={cancelRef} onChange={e => setCancelRef(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="PO123..." />
                                            <button onClick={() => { handleAction({ action: 'cancel_ref', ref_id: cancelRef }, 'Batalkan transaksi ini?'); setCancelRef(''); }} className="bg-rose-500 hover:bg-rose-600 px-4 rounded-lg font-bold text-white text-sm transition-colors">Batal</button>
                                        </div>
                                    </div>
                                    <hr className="border-slate-100" />
                                    <button onClick={() => handleAction({ action: 'cancel_all' }, 'DARURAT! Kosongkan SEMUA antrean dan refund saldo user?')} className="w-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
                                        ☠️ Kosongkan Semua Antrean
                                    </button>
                                    <hr className="border-slate-100 my-2" />
                                    <button onClick={() => handleAction({ action: 'kalibrasi' }, 'Mulai Kalibrasi Manual? Sistem akan memaksa cek semua transaksi yang nyangkut lebih dari 3 menit.')} className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors border border-blue-100">
                                        🧹 Kalibrasi Manual (Sapu Jagat)
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">⏩</span>
                                    Skip Prioritas
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {['XLA89', 'XLA14', 'XLA39', 'XLA32', 'XLA51', 'XLA65'].map(kode => (
                                        <button key={kode} onClick={() => handleAction({ action: 'skip', kode }, `Lewati semua antrean ${kode} dan kembalikan saldo?`)} className="bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-xs py-2 rounded-lg font-bold transition-all">
                                            Skip {kode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Kanan: System Monitor */}
                        <div className="lg:col-span-2">
                            <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 flex flex-col h-full overflow-hidden relative">
                                <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex justify-between items-center z-10">
                                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        System Monitor Log
                                        <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">Auto-Clean Aktif</span>
                                    </h3>
                                    <span className="flex h-2 w-2 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                    </span>
                                </div>
                                <div className="p-4 h-[400px] overflow-y-auto font-mono text-[13px] leading-relaxed relative z-0">
                                    <div className="text-slate-500 mb-2">Sistem siap. Menunggu perintah operator...</div>
                                    {logs.map((log, i) => (
                                        <div key={i} className={`mb-1.5 ${getLogColor(log.type)}`}>
                                            <span className="text-slate-500 mr-2">[{log.time}]</span> {log.msg}
                                        </div>
                                    ))}
                                    <div ref={terminalEndRef} />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Tabel Data Pre-Order */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">📋 Daftar Antrean PO Live</h3>
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold border border-indigo-100">
                                Auto-Sync 3s
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Waktu</th>
                                        <th className="px-6 py-4">Ref ID</th>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4">Produk</th>
                                        <th className="px-6 py-4">Tujuan</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Aksi</th> {/* 🌟 FIX 2: Kolom Aksi */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-slate-700">
                                    {tableData.length > 0 ? tableData.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-slate-500 text-xs">{row.waktu}</td>
                                            <td className="px-6 py-3 font-bold text-indigo-600">{row.ref}</td>
                                            <td className="px-6 py-3">{row.user}</td>
                                            <td className="px-6 py-3 font-bold">{row.produk}</td>
                                            <td className="px-6 py-3 font-mono">{row.tujuan}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                                    row.status === 'Sukses' ? 'bg-emerald-100 text-emerald-700' :
                                                    row.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' :
                                                    row.status === 'Proses_API' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            {/* 🌟 SULTAN FIX: Tombol Batal & Refresh Dewa di Tabel */}
              <td className="px-6 py-3 text-center flex justify-center items-center gap-2">
                  {!['Sukses', 'Dibatalkan'].includes(row.status) && (
                      <button
                          onClick={() => handleAction({ action: 'cancel_ref', ref_id: row.ref }, `Batalkan TRX ${row.ref} dan kembalikan saldo user?`)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-rose-100 hover:border-rose-500 shadow-sm"
                          title="Batalkan & Refund"
                      >
                          ❌ Cancel
                      </button>
                  )}
                  {['Proses_API', 'Butuh_Review', 'Gagal'].includes(row.status) && (
                      <button
                          onClick={() => handleAction({ action: 'refresh_ref', ref_id: row.ref }, `Paksa TRX ${row.ref} kembali ke Menunggu?`)}
                          className="bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-sky-100 hover:border-sky-500 shadow-sm"
                          title="Paksa ke Menunggu"
                      >
                          ♻️ Refresh
                      </button>
                  )}
                  {['Sukses', 'Dibatalkan'].includes(row.status) && (
                      <span className="text-slate-400 text-xs italic">-</span>
                  )}
              </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="text-center py-8 text-slate-400">Belum ada antrean masuk...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
