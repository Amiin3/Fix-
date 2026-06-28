import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function LoncengSultan() {
    // 💡 TAMBAHKAN 'flash' UNTUK NANGKEP SINYAL DARI SERVER LARAVEL
    const { vapidPublicKey, flash } = usePage().props;
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // 🔥 SINKRONISASI JEMBATAN ANDROID V12 (AUTO-TRIGGER) 🔥
    useEffect(() => {
        if (flash && window.AndroidBridge) {
            if (flash.android_notif) {
                window.AndroidBridge.showNotification(flash.android_notif.title || 'MilaStore', flash.android_notif.message);
            } else if (flash.success) {
                window.AndroidBridge.showNotification('✅ SUKSES', flash.success);
            } else if (flash.error) {
                window.AndroidBridge.showNotification('❌ INFO', flash.error);
            }
        }
    }, [flash]);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    setIsSubscribed(sub !== null);
                });
            });
        }
    }, []);

    const toggleNotification = async () => {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (isSubscribed) {
            if (sub) {
                await sub.unsubscribe();
                await axios.post('/push/unsubscribe', { endpoint: sub.endpoint });
            }
            setIsSubscribed(false);
            alert('🔕 Notifikasi dimatikan. Bos tidak akan diganggu lagi.');
        } else {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedVapidKey });
                await axios.post('/push/subscribe', sub);
                setIsSubscribed(true);
                alert('🔔 Radar Aktif! HP Bos siap bergetar!');
            } else {
                alert('Akses notifikasi diblokir oleh HP Bos!');
            }
        }
    };

    const testDebug = () => {
        // 🚀 1. JALUR TOL: TEMBAK LANGSUNG KE APLIKASI ANDROID (Kalau dibuka di APK)
        if (window.AndroidBridge && typeof window.AndroidBridge.showNotification === 'function') {
            window.AndroidBridge.showNotification('🛠️ DEBUG SYSTEM OK!', 'Jalur komunikasi Web ke OS Android aman, Bos!');
        }

        // 🌐 2. JALUR BIASA: TEMBAK KE WEB PUSH (Kalau dibuka di Chrome/PC)
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification('🛠️ DEBUG SYSTEM OK!', {
                    body: 'Jalur komunikasi Web ke OS Android aman, Bos!',
                    icon: '/logo.png',
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            if (!window.AndroidBridge) alert('Nyalakan dulu radarnya, Bos!');
        }
    };

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    }

    if (!vapidPublicKey) return null;

    return (
        <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="relative p-2 text-gray-600 hover:text-indigo-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {isSubscribed && <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>}
            </button>
            {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Pengaturan Radar</h3>
                        <p className="text-xs text-gray-500">Kontrol notifikasi perangkat ini</p>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Notifikasi Aktif</span>
                            <button onClick={toggleNotification} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSubscribed ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSubscribed ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {/* Tombol Uji Coba sekarang bisa di-klik meskipun Service Worker mati (Selama dibuka di Aplikasi Android) */}
                        <button onClick={testDebug} className={`w-full py-2 text-xs font-bold rounded-lg transition ${(isSubscribed || window.AndroidBridge) ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                            🛠️ UJI COBA (DEBUG)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
