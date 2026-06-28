import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function War() {
    const [logs, setLogs] = useState(['[SISTEM] Radar Kaje aktif. Menunggu perintah...']);
    const [queue, setQueue] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const terminalEndRef = useRef(null);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const fetchList = () => {
        // Tarik antrean langsung dari rute list
        axios.get('/admin/kaje/war-po/list').then(res => {
            setQueue(res.data.data);
        }).catch(err => console.error("Gagal tarik antrean", err));
    };

    const runWar = () => {
        if (!isRunning) return;
        axios.post('/admin/kaje/war-po/execute').then(res => {
            if (res.data.status === 'stopped') {
                setIsRunning(false);
                addLog('🔴 Sistem dimatikan oleh Server.');
            } else if (res.data.log) {
                const newLogs = res.data.log.split(' | ');
                newLogs.forEach(log => {
                    if (log.trim() !== '') addLog(log);
                });
            }
        }).catch(err => {
            addLog('🚨 Koneksi ke mesin server terputus!');
        });
    };

    useEffect(() => {
        fetchList();
        const listInterval = setInterval(fetchList, 3000);
        return () => clearInterval(listInterval);
    }, []);

    useEffect(() => {
        let warInterval;
        if (isRunning) {
            addLog('⚡ GATLING GUN AKTIF! Menyerang Kaje...');
            runWar();
            warInterval = setInterval(runWar, 1500); 
        }
        return () => clearInterval(warInterval);
    }, [isRunning]);

    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString('id-ID');
        setLogs(prev => [...prev.slice(-99), `[${time}] ${msg}`]);
    };

    const handleAction = (actionType, refId = null) => {
        if (!confirm(`YAKIN BOSKU? Aksi ini akan menggagalkan pesanan!`)) return;
        
        axios.post('/admin/kaje/war-po/action', { action: actionType, ref_id: refId }).then(res => {
            addLog(`⚙️ ${res.data.log}`);
            fetchList(); 
        }).catch(err => addLog('🚨 Gagal melakukan aksi.'));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
            <Head title="Command Center - KAJE WAR" />
            
            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center border-l-4 border-blue-600">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">🎯 KAJE WAR-PO</h2>
                        <p className="text-sm text-gray-500">Mode Serangan: Full Auto-Pilot Tanpa Limit</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <button onClick={() => handleAction('refresh_all')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow transition-all">
                            🔄 Refresh Zombi
                        </button>
                        <button onClick={() => handleAction('cancel_all')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-all">
                            🧹 BATAL SEMUA TRX
                        </button>
                        <button 
                            onClick={() => setIsRunning(!isRunning)} 
                            className={`px-8 py-2 rounded font-bold text-white shadow-lg transition-all ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse text-gray-900' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isRunning ? '🛑 STOP TEMBAK' : '🚀 MULAI TEMBAK'}
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                    <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="ml-2 text-gray-400 font-mono text-sm tracking-widest">TERMINAL_LOG</span>
                        </div>
                    </div>
                    <div className="h-64 overflow-y-auto font-mono text-xs md:text-sm p-4 text-green-400 leading-relaxed tracking-wide">
                        {logs.map((log, i) => (
                            <div key={i} className="hover:bg-gray-800 px-1 rounded transition-colors">{log}</div>
                        ))}
                        <div ref={terminalEndRef} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-lg">📋 Daftar Antrean (Target)</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Total: {queue.length} TRX</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100/50">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Waktu Masuk</th>
                                    <th className="px-5 py-3 font-semibold">No Target</th>
                                    <th className="px-5 py-3 font-semibold">Kode Peluru</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-right">Aksi Manual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {queue.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-medium">✨ Radar bersih. Menunggu pesanan masuk...</td></tr>
                                ) : queue.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap">{item.waktu}</td>
                                        <td className="px-5 py-3 font-bold text-gray-900">{item.tujuan}</td>
                                        <td className="px-5 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{item.produk}</span></td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
                                                ${item.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                                  item.status === 'Proses_API' ? 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse' : 
                                                  'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                                {item.status === 'Proses_API' ? '⚔️ Digempur' : item.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right whitespace-nowrap space-x-2">
                                            <button onClick={() => handleAction('skip', item.ref)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm">Tendang</button>
                                            <button onClick={() => handleAction('cancel_ref', item.ref)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm">Batal TRX</button>
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
