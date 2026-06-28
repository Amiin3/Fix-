import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PushToggle() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const ONESIGNAL_APP_ID = "d285d368-7e50-48fd-a0cb-59c6b3bf3669";

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            window.OneSignalDeferred.push(async function(OneSignal) {
                console.log("OneSignal: Memulai Inisialisasi...");
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                });

                // Otomatis cek status saat halaman dibuka
                const subId = OneSignal.User.PushSubscription.id;
                if (subId) {
                    console.log("OneSignal: User sudah terdaftar dengan ID:", subId);
                    setIsSubscribed(true);
                }
            });
        };
    }, []);

    const activatePush = () => {
        setLoading(true);
        window.OneSignalDeferred.push(async function(OneSignal) {
            try {
                console.log("OneSignal: Meminta Izin Notifikasi...");
                await OneSignal.Notifications.requestPermission();
                
                // Paksa HP lapor ke OneSignal
                await OneSignal.User.PushSubscription.optIn();
                
                const subId = OneSignal.User.PushSubscription.id;
                if (subId) {
                    console.log("OneSignal: ID Berhasil didapat:", subId);
                    setIsSubscribed(true);
                    
                    // Simpan ke Database Laravel agar Admin bisa kirim notif personal
                    await axios.post('/api/save-push-token', { token: subId });
                    alert("SUKSES! HP Sultan Terkoneksi. ID: " + subId);
                } else {
                    console.error("OneSignal: Izin diberikan tapi ID tidak keluar.");
                    alert("Coba Refresh Halaman & Klik Lagi Bang.");
                }
            } catch (err) {
                console.error("OneSignal Error:", err);
                alert("Error: " + err.message);
            }
            setLoading(false);
        });
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl mb-8 border border-blue-50 flex justify-between items-center transition-all duration-500">
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-colors ${isSubscribed ? 'bg-green-500' : 'bg-blue-600'}`}>
                    <i className={`fa-solid ${isSubscribed ? 'fa-check' : 'fa-bell'} text-xl ${!isSubscribed && 'animate-bounce'}`}></i>
                </div>
                <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">Notifikasi Sultan v2.1</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                        Status: <span className={isSubscribed ? 'text-green-600' : 'text-orange-500'}>{isSubscribed ? 'Aktif Terpercaya' : 'Belum Terhubung'}</span>
                    </p>
                </div>
            </div>
            <button 
                onClick={activatePush} 
                disabled={loading || isSubscribed}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 ${isSubscribed ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
            >
                {isSubscribed ? 'READY' : (loading ? 'WAIT...' : 'AKTIFKAN')}
            </button>
        </div>
    );
}
