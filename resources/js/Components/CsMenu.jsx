import React from 'react';

export default function CsMenu({ isOpen, onClose }) {
    if (!isOpen) return null;

    const waNumber = "6287760390507"; 
    const waMessage = "Halo Admin Amifi Store, saya butuh bantuan nih Bang...";
    const linkChat = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
    const linkSaluran = "https://whatsapp.com/channel/0029VaRBcJEHrDZhT0G5GK3e";
    const linkGrup = "https://chat.whatsapp.com/DHi6CfDy87UDZiwRQCS1QM?mode=gi_t";

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 relative transform transition-all shadow-2xl animate-slide-up">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                        <i className="fa-solid fa-headset"></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-800">Pusat Bantuan</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Pilih jalur VVIP untuk menghubungi kami</p>
                </div>
                <div className="flex flex-col gap-3">
                    <a href={linkChat} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-100 transition-colors group">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                            <i className="fa-brands fa-whatsapp"></i>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-bold text-green-800">Chat Admin (WA)</h4>
                            <p className="text-[10px] text-green-600">Fast response 24/7</p>
                        </div>
                        <i className="fa-solid fa-chevron-right ml-auto text-green-400"></i>
                    </a>
                    <a href={linkSaluran} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-colors group">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-bullhorn"></i>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-bold text-blue-800">Saluran Info Promo</h4>
                            <p className="text-[10px] text-blue-600">Update harga & diskon</p>
                        </div>
                        <i className="fa-solid fa-chevron-right ml-auto text-blue-400"></i>
                    </a>
                    <a href={linkGrup} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-100 transition-colors group">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-users"></i>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-bold text-emerald-800">Grup Komunitas</h4>
                            <p className="text-[10px] text-emerald-600">Mabar & Diskusi Santai</p>
                        </div>
                        <i className="fa-solid fa-chevron-right ml-auto text-emerald-400"></i>
                    </a>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl uppercase tracking-wider transition-colors">
                    Tutup
                </button>
            </div>
        </div>
    );
}
