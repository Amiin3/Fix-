import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function RiwayatTransaksi() {
    const [status, setStatus] = useState('all');
    const [searchQ, setSearchQ] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [totalSukses, setTotalSukses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const typingTimeoutRef = useRef(null);
    const formatRp = (angka) => new Intl.NumberFormat('id-ID').format(angka);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/riwayat/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
                body: JSON.stringify({ status, q: searchQ })
            });
            const res = await response.json();
            setTransactions(res.data);
            setTotalSukses(res.data.total_sukses);
        } catch (error) {
            console.error("Gagal memuat riwayat");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { fetchHistory(); }, 500);
    }, [status, searchQ]);

    const openSheet = (tx) => { setSelectedTx(tx); setIsSheetOpen(true); };
    const closeSheet = () => { setIsSheetOpen(false); setTimeout(() => setSelectedTx(null), 300); };

    const copySN = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'SN Tersalin!', showConfirmButton: false, timer: 1500 });
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Head title="Riwayat Transaksi - Amifi Store" />

            <div className="bg-white px-5 py-4 sticky top-0 z-40 border-b border-slate-100 shadow-sm flex justify-between items-center">
                <Link href="/dashboard" className="text-slate-800 font-bold text-xl no-underline">←</Link>
                <h6 className="font-black text-slate-800 m-0 tracking-wide text-[15px]">RIWAYAT TRANSAKSI</h6>
                <div className="bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 text-[10px] font-black tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> LIVE
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-5">
                {/* FILTER CARD */}
                <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 mb-4 flex gap-2">
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-1/3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 py-3 focus:ring-0">
                        <option value="all">Semua</option>
                        <option value="Sukses">Sukses</option>
                        <option value="Menunggu">Proses</option>
                        <option value="Gagal">Gagal</option>
                    </select>
                    <input type="text" placeholder="Cari No / SN..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="w-2/3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 py-3 focus:ring-0 placeholder:font-medium" />
                </div>

                {/* SUMMARY */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[24px] p-5 text-white flex justify-between items-center shadow-lg shadow-indigo-200 mb-6">
                    <div>
                        <div className="text-[10px] font-black opacity-75 tracking-[1px] mb-1">TOTAL PENGELUARAN (SUKSES)</div>
                        <div className="text-2xl font-black">Rp {formatRp(totalSukses)}</div>
                    </div>
                    <div className="text-4xl opacity-30">📊</div>
                </div>

                {/* LIST TRANSAKSI */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div></div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-10 text-slate-400"><div className="text-5xl mb-3 opacity-30">📂</div><div className="font-bold text-sm">Tidak ada transaksi ditemukan.</div></div>
                    ) : transactions.map((tx) => {
                        let bgClass = tx.status === 'Sukses' ? "bg-emerald-100 text-emerald-700" : (['Gagal','Batal'].includes(tx.status) ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700 animate-pulse");

                        return (
                            <div key={tx.ref_id} onClick={() => openSheet(tx)} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-300 transition-all active:scale-95 flex items-center">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-4 flex-shrink-0 bg-slate-50 border border-slate-100 shadow-sm">{tx.icon}</div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="font-black text-slate-800 text-sm truncate pr-2">{tx.kode_layanan}</div>
                                        <div className="font-black text-indigo-600 text-sm whitespace-nowrap">Rp {formatRp(tx.harga)}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs font-bold text-slate-500 truncate">{tx.tujuan}</div>
                                        <div className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${bgClass}`}>{tx.status}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM SHEET STRUK */}
            <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSheetOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeSheet}></div>
            <div className={`fixed bottom-0 left-0 w-full bg-white z-[60] rounded-t-[35px] transition-transform duration-400 ease-out max-h-[90vh] overflow-y-auto ${isSheetOpen ? 'translate-y-0 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]' : 'translate-y-full'}`}>
                {selectedTx && (
                    <div className="max-w-md mx-auto pb-8">
                        <div className="bg-slate-50 pt-5 pb-6 px-6 text-center border-b border-slate-100 rounded-t-[35px]">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5"></div>
                            <div className="text-5xl mb-3">{selectedTx.status === 'Sukses' ? '✅' : (['Gagal','Batal'].includes(selectedTx.status) ? '❌' : '⏳')}</div>
                            <h4 className="font-black text-slate-800 text-xl tracking-wide uppercase">{selectedTx.status}</h4>
                            <div className="text-xs font-bold text-slate-400 mt-1">{formatDate(selectedTx.tanggal)}</div>
                        </div>

                        <div className="px-6 py-5">
                            <div className="flex justify-between py-2.5 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">ID Transaksi</span><span className="text-xs font-black text-slate-800">#{selectedTx.ref_id}</span></div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">Nomor Tujuan</span><span className="text-sm font-black text-slate-800 tracking-wider">{selectedTx.tujuan}</span></div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">Layanan</span><span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{selectedTx.kode_layanan}</span></div>
                            <div className="flex justify-between py-2.5 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">Provider</span><span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-widest">{selectedTx.provider}</span></div>
                            
                            <div className="flex justify-between items-center pt-4 pb-2 mb-2">
                                <span className="text-sm font-black text-slate-800">Total Harga</span>
                                <span className="text-2xl font-black text-indigo-600">Rp {formatRp(selectedTx.harga)}</span>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mt-2 mb-5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SN / Keterangan Provider</div>
                                {selectedTx.sn_parsed.type === 'PLN' ? (
                                    <div className="font-mono text-xl font-black text-indigo-600 tracking-[3px] break-words">{selectedTx.sn_parsed.token}</div>
                                ) : (
                                    <div className="text-sm font-bold text-slate-700 break-words leading-relaxed">{selectedTx.sn_parsed.raw}</div>
                                )}
                            </div>

                            <button onClick={() => copySN(selectedTx.sn_parsed.type === 'PLN' ? selectedTx.sn_parsed.token : selectedTx.sn_parsed.raw)} disabled={selectedTx.status === 'Gagal'} className="w-full bg-slate-100 text-slate-600 font-black py-3.5 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm">
                                📋 Salin SN / Keterangan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
