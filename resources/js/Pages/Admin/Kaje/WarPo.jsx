import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function WarPo() {
    const [logs, setLogs] = useState(['[SISTEM] Radar Kaje aktif. Menunggu perintah...']);
    const [queue, setQueue] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const terminalEndRef = useRef(null);

    // Auto-scroll terminal ke bawah
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Fungsi Tarik Data Antrean
    const fetchList = () => {
        axios.get(route('admin.kaje.war.list')).then(res => {
            setQueue(res.data.data);
        }).catch(err => console.error("Gagal tarik antrean"));
    };

    // Fungsi Nembak Mesin Backend
    const runWar = () => {
        if (!isRunning) return;
        axios.post(route('admin.kaje.war.execute')).then(res => {
            if (res.data.status === 'stopped') {
                setIsRunning(false);
                addLog('🔴 Sistem dimatikan oleh Server.');
            } else if (res.data.log) {
                // Pecah log jika server mengirim banyak log sekaligus
                const newLogs = res.data.log.split(' | ');
                newLogs.forEach(log => {
                    if (log.trim() !== '') addLog(log);
                });
            }
        }).catch(err => {
            addLog('🚨 Koneksi ke mesin server terputus!');
        });
    };

    // Sinkronisasi Data (Berjalan di Background)
    useEffect(() => {
        fetchList();
        const listInterval = setInterval(fetchList, 3000); // Refresh tabel tiap 3 detik
        return () => clearInterval(listInterval);
    }, []);

    // Jantung Pemicu Bot (Burst Fire Mode)
    useEffect(() => {
        let warInterval;
        if (isRunning) {
            addLog('⚡ GATLING GUN AKTIF! Menyerang Kaje...');
            runWar(); // Tembakan pertama
            warInterval = setInterval(runWar, 1500); // Tembakan beruntun tiap 1.5 detik
        }
        return () => clearInterval(warInterval);
    }, [isRunning]);

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString('id-ID');
        setLogs(prev => [...prev.slice(-99), `[${time}] ${msg}`]); // Simpan 100 log terakhir
    };

    // Tombol Aksi Manual (Cancel, Skip, dll)
    const handleAction = (actionType, refId = null) => {
        if (!confirm(`Yakin ingin melakukan eksekusi ini?`)) return;
        axios.post(route('admin.kaje.war.action'), { action: actionType, ref_id: refId }).then(res => {
            addLog(`⚙️ ${res.data.log}`);
            fetchList();
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
            <Head title="Command Center - KAJE WAR" />
            
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* HEADER & KONTROL UTAMA */}
                <div className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center border-l-4 border-blue-600">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">🎯 COMMAND CENTER (KAJE)</h2>
                        <p className="text-sm text-gray-500">Mode Serangan: Full Auto-Pilot Tanpa Limit</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <button 
                            onClick={() => setIsRunning(!isRunning)} 
                            className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${isRunning ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isRunning ? '🛑 STOP PENEMBAKAN' : '🚀 MULAI SERANGAN'}
                        </button>
                    </div>
                </div>

                {/* TERMINAL MONITOR */}
                <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    <div className="bg-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="ml-2 text-gray-400 font-mono text-sm tracking-widest">LIVE_RADAR_LOG</span>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => handleAction('refresh_all')} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded shadow">🔄 Refresh Zombi</button>
                             <button onClick={() => handleAction('cancel_all')} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded shadow">🧹 Sapu Bersih</button>
                        </div>
                    </div>
                    <div className="h-64 overflow-y-auto font-mono text-xs md:text-sm p-4 text-green-400 leading-relaxed tracking-wide">
                        {logs.map((log, i) => (
                            <div key={i} className="hover:bg-gray-800 px-1 rounded transition-colors">{log}</div>
                        ))}
                        <div ref={terminalEndRef} />
                    </div>
                </div>

                {/* DAFTAR ANTREAN */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-lg">📋 Daftar Target Operasi</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Sisa: {queue.length} Antrean</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100/50">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Waktu Masuk</th>
                                    <th className="px-5 py-3 font-semibold">No Target</th>
                                    <th className="px-5 py-3 font-semibold">Kode Peluru</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-right">Aksi Darurat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {queue.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-medium">✨ Radar bersih. Tidak ada target.</td></tr>
                                ) : queue.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap">{item.waktu}</td>
                                        <td className="px-5 py-3 font-bold text-gray-900">{item.tujuan}</td>
                                        <td className="px-5 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{item.produk}</span></td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
                                                ${item.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                                  item.status === 'Proses_API' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                                  'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                                {item.status === 'Proses_API' ? 'Sedang Digempur' : item.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right whitespace-nowrap">
                                            <button onClick={() => handleAction('skip', item.ref)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-medium mr-2 transition-colors shadow-sm">Tendang</button>
                                            <button onClick={() => handleAction('cancel_ref', item.ref)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm">Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
