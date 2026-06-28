import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AkrabNew({ auth, products, userSaldo }) {
    const [targetMsisdn, setTargetMsisdn] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSaldo, setCurrentSaldo] = useState(userSaldo);

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!targetMsisdn) return Swal.fire('Peringatan', 'Nomor HP pembeli wajib diisi!', 'warning');
        if (!selectedProduct) return Swal.fire('Peringatan', 'Silakan pilih varian paket terlebih dahulu!', 'warning');

        const prodDetail = products.find(p => p.id === parseInt(selectedProduct));
        if (prodDetail && currentSaldo < prodDetail.harga_jual) {
            return Swal.fire('Saldo Kurang', 'Sisa saldo Anda tidak cukup untuk membeli paket ini.', 'error');
        }

        const confirm = await Swal.fire({
            title: 'Konfirmasi Pembelian',
            html: `Apakah Anda yakin ingin memproses paket <b>${prodDetail?.nama_produk}</b> ke nomor <b>${targetMsisdn}</b>?`,
            icon: 'question', showCancelButton: true, confirmButtonColor: '#4f46e5', confirmButtonText: 'Ya, Beli Sekarang!'
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);
        Swal.fire({
            title: 'Menghubungi Server XL...',
            html: 'Sedang menunggu respons real-time dari operator pusat XL Axiata. Mohon jangan di-refresh.',
            allowOutsideClick: false, didOpen: () => Swal.showLoading()
        });

        try {
            // HIT ENDPOINT BARU: akrabnew
            const res = await axios.post('/order/akrabnew/submit', {
                target_msisdn: targetMsisdn,
                product_id: selectedProduct
            });

            if (res.data.status) {
                Swal.fire({ title: 'TRANSAKSI BERHASIL!', text: res.data.message, icon: 'success', confirmButtonColor: '#10b981' });
                if (prodDetail) setCurrentSaldo(prev => prev - prodDetail.harga_jual);
                setTargetMsisdn(''); setSelectedProduct('');
            } else {
                Swal.fire({ title: 'TRANSAKSI GAGAL!', text: res.data.message, icon: 'error', confirmButtonColor: '#ef4444' });
            }
        } catch (err) {
            Swal.fire('Error Sistem', 'Terjadi gangguan jaringan internet/timeout server.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Order Paket Akrab - MilaStore" />

            <div className="min-h-screen bg-slate-100 text-slate-800 pb-12 font-sans">
                {/* TOP BAR BRAND */}
                <div className="bg-white px-6 py-4 shadow-sm border-b border-slate-200 flex justify-between items-center mb-8 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white p-2 rounded-xl text-xl shadow-md"><i className="fa-solid fa-cart-shopping"></i></div>
                        <div>
                            <h4 className="font-black text-xl text-slate-900 tracking-tight">MilaStore Order V2</h4>
                            <small className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">Operator Portal Jaringan</small>
                        </div>
                    </div>
                    {/* DISPLAY SALDO SULTAN */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 rounded-2xl text-white shadow-md flex items-center gap-3 border border-indigo-500">
                        <i className="fa-solid fa-wallet text-xl opacity-80"></i>
                        <div className="text-right">
                            <span className="block text-[10px] font-bold text-indigo-100 uppercase tracking-wide">Sisa Saldo Anda</span>
                            <strong className="text-lg font-black tracking-wide">Rp {currentSaldo.toLocaleString('id-ID')}</strong>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-200">
                        <div className="border-b border-slate-100 pb-4 mb-6">
                            <h5 className="font-black text-lg text-slate-900 flex items-center gap-2"><i className="fa-solid fa-wifi text-indigo-600"></i> XL DATA AKRAB ENTERPRISE</h5>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Suntik paket akrab instan langsung ke nomor hp pelanggan Anda murni via API operator.</p>
                        </div>

                        <form onSubmit={handleOrderSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2"><i className="fa-solid fa-phone mr-1"></i> Nomor Handphone Tujuan</label>
                                <input type="number" value={targetMsisdn} onChange={(e) => setTargetMsisdn(e.target.value)} placeholder="Contoh: 081916526445" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-mono text-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300" disabled={loading} required />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2"><i className="fa-solid fa-layer-group mr-1"></i> Varian Paket Kuota</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {products.map(p => {
                                        const isAvailable = p.stok_tersedia > 0;
                                        return (
                                            <div key={p.id} onClick={() => !loading && isAvailable && setSelectedProduct(p.id.toString())} className={`border-2 rounded-2xl p-4 flex justify-between items-center transition-all ${selectedProduct === p.id.toString() ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' : isAvailable ? 'border-slate-200 hover:border-indigo-300 cursor-pointer' : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedProduct === p.id.toString() ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'}`}>
                                                        {selectedProduct === p.id.toString() && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-sm">{p.nama_produk} ({p.kuber_gb} GB)</h4>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded mt-1 inline-block border ${isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{isAvailable ? `READY: ${p.stok_tersedia} SLOT` : 'STOK HABIS'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-indigo-600 font-black text-base">Rp {p.harga_jual?.toLocaleString('id-ID')}</span>
                                                    {p.deskripsi && <small className="text-[10px] text-slate-400 font-medium">{p.deskripsi}</small>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button type="submit" disabled={loading || !targetMsisdn || !selectedProduct} className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                                <i className="fa-solid fa-circle-check"></i> PROSES PEMBELIAN INSTAN
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
