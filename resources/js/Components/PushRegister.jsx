import React, { useEffect } from 'react';

export default function PushRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/sw.js')
                .then(function(swReg) {
                    console.log('Service Worker is registered', swReg);
                })
                .catch(function(error) {
                    console.error('Service Worker Error', error);
                });
        }
    }, []);

    const askPermission = () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Izin diberikan!');
                // Di sini nanti kita kirim Token HP user ke database
            }
        });
    };

    return null; // Komponen ini hanya bekerja di balik layar
}
