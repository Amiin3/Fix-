import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Debug({ tables, badProducts, logs, env }) {
    const { post, processing } = useForm();

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300 p-4 md:p-8 font-mono text-sm">
            <Head title="ULTIMATE DEBUG - AMIFI" />
            
            <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <div>
                    <h1 className="text-2xl font-black text-red-500 tracking-tighter">MASTER DEBUG ULTIMATE v2.0</h1>
                    <p className="text-xs text-slate-500">System Diagnostik Amifi Store - 2026</p>
                </div>
                <button 
                    onClick={() => post('/debug-system/clear')}
                    disabled={processing}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
                >
                    {processing ? '⚡ CLEANING...' : '🧹 PURGE SYSTEM CACHE'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Kolom 1: Tabel & Kesehatan Data */}
                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                        <h3 className="text-blue-400 font-black mb-4 flex items-center">📡 DATABASE INTEGRITY</h3>
                        {Object.entries(tables).map(([name, data]) => (
                            <div key={name} className="flex justify-between items-center mb-3 p-2 bg-slate-900/50 rounded-lg">
                                <span className="font-bold text-slate-400">{name}</span>
                                <div className="text-right">
                                    <div className={data.exists ? "text-emerald-400" : "text-red-500"}>
                                        {data.exists ? `✅ ${data.count} Rows` : "❌ MISSING"}
                                    </div>
                                    {!data.has_provider && data.exists && <div className="text-[10px] text-amber-500">⚠ No Provider Col</div>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-red-900/30">
                        <h3 className="text-red-400 font-black mb-4">🚨 BIANG KEROK BLANK (BAD DATA)</h3>
                        {badProducts.length > 0 ? badProducts.map(p => (
                            <div key={p.id} className="text-[10px] mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                [ID:{p.id}] {p.nama_layanan} ({p.kode_layanan}) - <span className="font-bold">Provider Kosong!</span>
                            </div>
                        )) : <div className="text-emerald-500 text-xs italic">Data Provider Bersih.</div>}
                    </div>
                </div>

                {/* Kolom 2 & 3: Ultimate Log Parser */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 h-full">
                        <h3 className="text-amber-400 font-black mb-4 flex justify-between">
                            <span>📜 REAL-TIME ERROR HEADS</span>
                            <span className="text-[10px] text-slate-500">storage/logs/laravel.log</span>
                        </h3>
                        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                            {logs.length > 0 ? logs.map((log, i) => (
                                <div key={i} className="p-4 bg-black/40 rounded-xl border-l-4 border-red-600 font-sans text-xs leading-relaxed">
                                    <div className="text-red-400 font-bold mb-1">ERROR RECORD #{i+1}</div>
                                    <div className="text-slate-300">{log}</div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-slate-600 italic">Tidak ada error yang terdeteksi. Sistem stabil.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
