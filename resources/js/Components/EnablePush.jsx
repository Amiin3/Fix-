import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EnablePush() {
    const [isSubscribed, setIsSubscribed] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub === null) {
                        setIsSubscribed(false);
                        // Munculkan pelan setelah 2 detik biar elegan
                        setTimeout(() => setIsVisible(true), 2000);
                    }
                });
            });
        }
    }, []);

    const subscribeUser = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return alert('Izin ditolak browser.');

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
            });

            await axios.post('/push/subscribe', sub);
            setIsVisible(false);
            setTimeout(() => setIsSubscribed(true), 500);
        } catch (e) {
            console.error(e);
        }
    };

    if (isSubscribed || !isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999] animate-bounce-in">
            <div className="bg-white/90 backdrop-blur-lg border border-purple-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        {/* Icon Animasi */}
                        <div className="bg-purple-100 p-3 rounded-2xl">
                            <svg className="w-8 h-8 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-gray-900 font-bold text-lg leading-tight">
                                Radar Amifi Aktif?
                            </h3>
                            <p className="text-gray-500 text-xs mt-1">
                                Jangan sampai ketinggalan info War & PO penting!
                            </p>
                        </div>

                        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {/* Benefit List */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Update Status PO Real-time
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Notifikasi Suara Saat Sukses
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={subscribeUser}
                        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] transition-all active:scale-95 text-sm"
                    >
                        Aktifkan Sekarang
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-in {
                    0% { transform: translateY(100px); opacity: 0; }
                    60% { transform: translateY(-10px); opacity: 1; }
                    100% { transform: translateY(0); }
                }
                .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            `}} />
        </div>
    );
}
