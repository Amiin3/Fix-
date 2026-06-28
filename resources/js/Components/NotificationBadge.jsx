import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function NotificationBadge({ isBottomNav = false }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/api/get-unread-count');
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error("Gagal hitung notif:", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 15000); // Cek update tiap 15 detik
        return () => clearInterval(interval);
    }, []);

    // TAMPILAN UNTUK MENU BAWAH (BOTTOM NAV)
    if (isBottomNav) {
        return (
            <Link href="/notifikasi" className="relative flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 w-full h-full">
                <div className="relative">
                    <i className="fa-solid fa-bell text-2xl mb-1"></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium">Notifikasi</span>
            </Link>
        );
    }

    // TAMPILAN UNTUK HEADER ATAS (POJOK KANAN ATAS)
    return (
        <Link href="/notifikasi" className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
            <i className="fa-solid fa-bell text-xl animate-wiggle"></i>
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
