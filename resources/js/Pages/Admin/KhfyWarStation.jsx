import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function KhfyWarStation({ auth }) {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), msg: '[SYSTEM] Mesin Gatling Gun siap. Menunggu saklar dihidupkan...', type: 'text-emerald-400' }]);
    const [poList, setPoList] = useState([]);
    const [cancelRef, setCancelRef] = useState('');
    const terminalEndRef = useRef(null);

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (msg, type = 'text-yellow-400') => {
        setLogs(prev => {
            const newLogs = [...prev, { time: new Date().toLocaleTimeString(), msg, type }];
            return newLogs.slice(-100);
        });
    };

    const fetchTable = async () => {
        try {
            const res = await axios.get(route('admin.khfy.war.table'));
            setPoList(res.data);
        } catch (error) {
            console.error("Gagal memuat tabel");
        }
    };

    // Mesin Penembak (Gatling Gun)
    useEffect(() => {
        let timer;
        if (isRunning) {
            timer = setInterval(async () => {
                try {
                    const res = await axios.post(route('admin.khfy.war.shoot'));
                    const statusColor = res.data.status === 'shoot' ? 'text-cyan-400' : 
                                      (res.data.status === 'error' ? 'text-rose-400' : 'text-yellow-400');
                    addLog(res.data.log, statusColor);
                } catch (error) {
                    addLog('Koneksi Engine terputus. Mencoba lagi...', 'text-rose-400');
                }
            }, 800);
        }
        return () => clearInterval(timer);
    }, [isRunning]);

    // Sinkronisasi Tabel (Tiap 3 Detik)
    useEffect(() => {
        fetchTable();
        const interval = setInterval(fetchTable, 3000);
        return () => clearInterval(interval);
    }, []);

    // --- FUNGSI AKSI ---
    const handleSkip = async (kode) => {
        if (confirm(`Yakin men-SKIP seluruh antrian ${kode}?\n(Semua saldo user dikembalikan otomatis)`)) {
            const res = await axios.post(route('admin.khfy.war.skip'), { kode });
            addLog(res.data.log, 'text-yellow-400');
            fetchTable();
        }
    };

    // Batal Manual dari Input Text
    const handleCancelRef = async () => {
        if (!cancelRef) return alert("Masukkan Ref ID!");
        executeCancel(cancelRef);
        setCancelRef('');
    };

    // Batal Langsung dari Tombol Tabel
    const cancelFromTable = (ref) => {
        executeCancel(ref);
    };

    // Eksekutor Pembatalan
    const executeCancel = async (ref) => {
        if (confirm(`Batalkan transaksi ${ref}?\nSaldo akan langsung dikembalikan ke user.`)) {
            try {
                const res = await axios.post(route('admin.khfy.war.cancel'), { ref_id: ref });
                addLog(res.data.log, res.data.status === 'error' ? 'text-rose-400' : 'text-yellow-400');
                fetchTable();
            } catch (error) {
                addLog("Gagal menghubungi server database.", "text-rose-400");
            }
        }
    };

    const handleCancelAll = async () => {
        if (confirm("🚨 PERINGATAN DARURAT 🚨\nYakin ingin MEMBATALKAN SEMUA antrian Menunggu?\nSemua saldo user akan dikembalikan!")) {
            const res = await axios.post(route('admin.khfy.war.cancelAll'));
            addLog(res.data.log, 'text-rose-400');
            fetchTable();
        }
    };

    // Helper Warna Badge Status
    const getStatusBadge = (status) => {
        if (status === 'Menunggu') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (status === 'Proses_API') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        if (status === 'Sukses') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">PO War Station</h2>}>
            <Head title="PO War Station - Khfy" />

            <div className="py-8 bg-[#0f172a] min-h-screen font-mono text-sky-400 pb-24">
                <div className="max-w-[1400px] mx-auto sm:px-6 lg:px-8">
                    
                    <h2 className="text-white text-center font-black text-2xl mb-8 tracking-wider">
                        <i className="fa-solid fa-bolt text-yellow-400 mr-2"></i> COMMAND CENTER: PO WAR STATION
                    </h2>

                    {/* TOMBOL SAKLAR UTAMA */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button 
                            onClick={() => { setIsRunning(true); addLog("WAR DIMULAI! GATLING GUN AKTIF...", "text-cyan-400"); }}
                            disabled={isRunning}
                            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${isRunning ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95'}`}>
                            🚀 MULAI WAR (SAKLAR ON)
                        </button>
                        <button 
                            onClick={() => { setIsRunning(false); addLog("WAR DIHENTIKAN MANUAL. Mesin mendingin.", "text-rose-400"); }}
                            disabled={!isRunning}
                            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${!isRunning ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95'}`}>
                            🛑 STOP WAR
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* PANEL KIRI: KONTROL */}
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-sm">
                                <h6 className="text-white font-bold mb-4 flex items-center">
                                    <i className="fa-solid fa-shield-halved text-cyan-400 mr-2"></i> MANAJEMEN DARURAT
                                </h6>
                                <div className="mb-4">
                                    <label className="text-[11px] text-slate-400 mb-2 block uppercase tracking-wider">Batalkan 1 Transaksi (Input Manual)</label>
                                    <div className="flex">
                                        <input type="text" value={cancelRef} onChange={(e) => setCancelRef(e.target.value)} placeholder="Contoh: PO1708..." className="bg-black/50 border border-slate-700 text-white rounded-l-lg px-3 py-2 w-full text-sm focus:ring-rose-500 focus:border-rose-500" />
                                        <button onClick={handleCancelRef} className="bg-rose-600 hover:bg-rose-500 text-white px-4 rounded-r-lg text-sm font-bold transition-colors">Batal</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] text-slate-400 mb-2 block uppercase tracking-wider">Aksi Massal</label>
                                    <button onClick={handleCancelAll} className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 rounded-lg text-sm font-bold transition-colors">
                                        <i className="fa-solid fa-skull-crossbones mr-2"></i> Kosongkan Semua Antrian
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-sm">
                                <h6 className="text-white font-bold mb-2 flex items-center">
                                    <i className="fa-solid fa-forward-step text-yellow-400 mr-2"></i> MENU SKIP PRIORITAS
                                </h6>
                                <p className="text-[11px] text-slate-400 mb-4">Gunakan jika stok provider habis total.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['XLA89', 'XLA14', 'XLA39', 'XLA32', 'XLA51', 'XLA65'].map((kode, idx) => (
                                        <button key={kode} onClick={() => handleSkip(kode)} className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 py-2 rounded-lg text-xs font-bold transition-colors">
                                            Skip {kode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PANEL KANAN: TERMINAL */}
                        <div className="md:col-span-2 flex flex-col">
                            <h5 className="text-white font-bold mb-3 flex items-center tracking-wide">
                                <i className="fa-solid fa-terminal text-emerald-400 mr-2"></i> LIVE TERMINAL LOG
                            </h5>
                            <div className="bg-[#000000] border border-[#333333] rounded-xl p-4 flex-grow h-[420px] overflow-y-auto shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] custom-scrollbar">
                                {logs.map((l, i) => (
                                    <div key={i} className={`text-[13px] mb-1 leading-relaxed ${l.type}`}>
                                        <span className="text-slate-500">[{l.time}]</span> {l.msg}
                                    </div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* TABEL LIVE (FULL SPEC ALAM NATIVE PHP) */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-white font-bold flex items-center tracking-wide">
                                <i className="fa-solid fa-list-check text-cyan-400 mr-2"></i> DAFTAR PRE-ORDER (LIVE)
                            </h5>
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold flex items-center uppercase tracking-wider">
                                <i className="fa-solid fa-rotate fa-spin mr-2"></i> Auto-Sync Aktif
                            </span>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar pb-2">
                            <table className="w-full text-sm text-center text-slate-300">
                                <thead className="text-[11px] text-white uppercase bg-black/60 border-b-2 border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                                        <th className="px-4 py-3">Ref ID</th>
                                        <th className="px-4 py-3">Username</th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">Tujuan</th>
                                        <th className="px-4 py-3">Harga</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-tr-lg">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poList.length === 0 ? (
                                        <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-500"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Memuat data real-time...</td></tr>
                                    ) : (
                                        poList.map((po, i) => {
                                            const wkt = new Date(po.tanggal).toLocaleTimeString('id-ID');
                                            return (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-3 py-3 text-xs text-slate-500">{wkt}</td>
                                                    <td className="px-3 py-3 font-bold text-cyan-400">{po.ref_id}</td>
                                                    <td className="px-3 py-3 text-slate-400">{po.username}</td>
                                                    <td className="px-3 py-3 font-bold">
                                                        {po.kode_produk} <sup className="text-slate-500 text-[10px]">P{po.prioritas}</sup>
                                                    </td>
                                                    <td className="px-3 py-3 font-mono text-white tracking-widest">{po.tujuan}</td>
                                                    <td className="px-3 py-3">Rp {new Intl.NumberFormat('id-ID').format(po.harga)}</td>
                                                    <td className="px-3 py-3">
                                                        <span className={`px-2 py-1 border rounded text-[11px] font-bold ${getStatusBadge(po.status)}`}>
                                                            {po.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {po.status === 'Menunggu' ? (
                                                            <button 
                                                                onClick={() => cancelFromTable(po.ref_id)}
                                                                title="Batalkan & Refund"
                                                                className="bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-1 rounded transition-colors"
                                                            >
                                                                <i className="fa-solid fa-xmark"></i>
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-600">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
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
