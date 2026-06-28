import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Asumsi pakai layout standar

export default function War({ auth, stockData }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Menu WAR XLA - KhfyPay</h2>}>
            <Head title="WAR XLA Khfy" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">📡 Live Cek Stok Akrab XL/Axis</h3>
                            <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all">
                                <i className="fa-solid fa-rotate-right mr-2"></i> Refresh Stok
                            </button>
                        </div>
                        
                        {/* Jika ada error dari server Khfy */}
                        {stockData?.status === false && stockData?.message && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                                <p className="font-bold">Gagal Menarik Data</p>
                                <p>{stockData.message}</p>
                            </div>
                        )}

                        {/* Menampilkan Output JSON/Data Stok Khfy */}
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-700">
                            <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                                {JSON.stringify(stockData, null, 2)}
                            </pre>
                        </div>
                        
                        <div className="mt-4 text-xs text-slate-500 italic">
                            * Data ini ditarik secara real-time langsung dari server KhfyPay.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
