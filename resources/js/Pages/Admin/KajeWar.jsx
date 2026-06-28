import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

export default function KajeWar({ initialQueue, stats }) {
    const [logs, setLogs] = useState('Menghubungkan ke satelit...');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(route('admin.kaje.war.logs'));
                setLogs(res.data.logs);
            } catch (e) {
                setLogs('Gagal menarik log...');
            }
        };
        fetchLogs();
        const interval = setInterval(fetchLogs, 4000);
        return () => clearInterval(interval);
    }, []);

    const doAction = (id, action) => {
        if (confirm(`Konfirmasi tindakan ${action}?`)) {
            setLoading(true);
            router.post(route('admin.kaje.war.update'), { id, action }, {
                onFinish: () => setLoading(false)
            });
        }
    };

    return (
        <div className={`p-4 bg-slate-950 min-h-screen text-slate-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Head title="CONTROL CENTER" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-black text-white italic">🛰️ WAR COMMAND</h1>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">Kaje Provider Gateway</div>
                </div>
                <button onClick={() => router.post(route('admin.kaje.war.poll'))} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full font-black text-xs shadow-lg shadow-blue-500/20">🚀 JALANKAN BOT</button>
            </div>

            {/* MONITOR TERMINAL */}
            <div className="bg-black rounded-2xl border border-slate-800 overflow-hidden mb-6 shadow-2xl">
                <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">system_monitor.sh</span>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                </div>
                <div className="p-4 h-40 overflow-y-auto font-mono text-[10px] text-cyan-400/80 leading-relaxed">
                    <pre className="whitespace-pre-wrap">{logs}</pre>
                </div>
            </div>

            {/* TABEL TRANSAKSI */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-[11px]">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-500 uppercase text-[9px] font-bold">
                            <th className="p-4">Target / User</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Intervensi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {initialQueue.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                                <td className="p-4">
                                    <div className="font-black text-white">{item.tujuan}</div>
                                    <div className="text-slate-500">{item.username} - {item.sku}</div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${item.status === 'Sukses' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => doAction(item.id, 'retry')} className="bg-slate-800 hover:bg-amber-600 p-2 rounded-lg transition-colors">🔄</button>
                                        <button onClick={() => doAction(item.id, 'success')} className="bg-slate-800 hover:bg-green-600 p-2 rounded-lg">✅</button>
                                        <button onClick={() => doAction(item.id, 'failed')} className="bg-slate-800 hover:bg-red-600 p-2 rounded-lg">❌</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
