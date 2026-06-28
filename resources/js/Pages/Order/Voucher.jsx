import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import '@/../../resources/css/mila-loading.css';

export default function Voucher({ auth, groupedProducts, userBalance }) {
    const [phone, setPhone] = useState('');
    const [activeProvider, setActiveProvider] = useState(null);
    const [selected, setSelected] = useState(null);

    // Deklarasi useForm Sakti
    const { transform, post, processing } = useForm({
        tujuan: '',
        kode_layanan: ''
    });

    const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);
    const providers = Object.keys(groupedProducts || {});
    const activeProducts = activeProvider ? (groupedProducts[activeProvider] || []) : [];

    const handleOrder = () => {
        if(!selected || phone.length < 10) return;
        
        // Suntik Data
        transform((data) => ({
            ...data,
            tujuan: phone,
            kode_layanan: selected.kode_layanan
        }));

        // Tembak Route Voucher
        post(route('order.voucher.store'), {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Beli Voucher - MilaStore" />
            
            {processing && (
                <div className="mila-loader-overlay">
                    <div className="loading-content">
                        <div className="spinner-wrapper">
                            <div className="ms-ring-bg"></div>
                            <div className="ms-ring" style={{borderTopColor: '#e11d48', borderLeftColor: '#be123c'}}></div>
                            <div className="ms-logo" style={{background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', WebkitBackgroundClip: 'text'}}>MS</div>
                        </div>
                        <div className="text-rose-600 font-bold tracking-widest mt-4">MEMPROSES VOUCHER...</div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#f8fafc] font-['Outfit'] pb-40">
                <div className="app-header-pln" style={{background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)'}}>
                    <div className="max-w-md mx-auto flex justify-between items-center">
                        <h5 className="font-black text-xl m-0 text-white">Beli Voucher</h5>
                        <div className="bg-black/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-bold text-white">
                            <i className="fa-solid fa-wallet mr-2"></i> Rp {formatRp(userBalance)}
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto px-4 -mt-10">
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-500/10 mb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nomor HP Pembeli</label>
                        <div className="flex items-center border-b-2 border-slate-100 focus-within:border-rose-500 transition-all pb-2">
                            <input
                                type="tel" className="w-full border-none focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0"
                                placeholder="0812 3456 7890" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength="13"
                            />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2">*Kode voucher akan dikirim via SN transaksi</p>
                    </div>

                    {!activeProvider ? (
                        <>
                            <h6 className="font-black text-slate-700 mb-3 ml-1">Pilih Jenis Voucher</h6>
                            <div className="grid grid-cols-2 gap-3">
                                {providers.length === 0 ? (
                                    <div className="col-span-2 text-center py-10 text-slate-400 font-bold">Voucher Kosong</div>
                                ) : providers.map(prov => (
                                    <div key={prov} onClick={() => setActiveProvider(prov)} className="bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm hover:border-rose-300 cursor-pointer flex items-center justify-between transition-all hover:-translate-y-1">
                                        <span className="font-bold text-slate-800">{prov}</span>
                                        <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-3 ml-1">
                                <h6 className="font-black text-slate-700">Voucher {activeProvider}</h6>
                                <button onClick={() => {setActiveProvider(null); setSelected(null);}} className="text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full"><i className="fa-solid fa-arrow-left mr-1"></i> Ganti</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {activeProducts.map((p) => (
                                    <div key={p.kode_layanan} onClick={() => setSelected(p)} className={`p-4 rounded-2xl transition-all border-2 cursor-pointer ${selected?.kode_layanan === p.kode_layanan ? 'bg-rose-50 border-rose-500 shadow-md scale-[1.02]' : 'bg-white border-transparent shadow-sm hover:border-rose-200'}`}>
                                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">KODE VOUCHER</div>
                                        <div className="font-bold text-slate-800 mb-2 leading-snug">{p.nama_layanan}</div>
                                        <div className="text-rose-600 font-black text-sm">Rp {formatRp(p.harga_jual)}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {selected && activeProvider && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 animate-bounce-in">
                        <div className="max-w-md mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bayar</p>
                                <h3 className="text-2xl font-black text-slate-800">Rp {formatRp(selected.harga_jual)}</h3>
                            </div>
                            <button onClick={handleOrder} disabled={processing} className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-full font-black shadow-lg shadow-rose-500/30 active:scale-95 transition-all disabled:opacity-50">
                                {processing ? 'MEMPROSES...' : 'BELI'} <i className="fa-solid fa-chevron-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
