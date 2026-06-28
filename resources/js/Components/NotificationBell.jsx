import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/get-my-notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Gagal ambil notif:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Cek tiap 30 detik
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const toggleDropdown = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // Tandai sudah dibaca di database
            await axios.post('/api/read-my-notifications');
            // Update tampilan lokal seketika (biar angka merah langsung hilang)
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
        }
    };

    return (
        <div className="relative inline-block">
            {/* Tombol Lonceng */}
            <button onClick={toggleDropdown} className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                <i className="fa-solid fa-bell text-xl animate-wiggle"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Isi Notifikasi */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[999]">
                    <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-blue-600 text-white">
                        <h4 className="font-bold text-sm uppercase tracking-wider">Notifikasi</h4>
                        <i className="fa-solid fa-envelope-open-text opacity-50"></i>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read_at ? 'bg-blue-50/40' : ''}`}>
                                    <p className="text-xs font-black text-slate-800">{n.data?.title || 'Informasi'}</p>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.data?.message || 'Ada pembaruan sistem baru.'}</p>
                                    <span className="text-[9px] text-slate-400 mt-2 block font-medium">
                                        <i className="fa-regular fa-clock mr-1"></i>
                                        {moment(n.created_at).fromNow()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <i className="fa-solid fa-box-open text-slate-200 text-4xl mb-3"></i>
                                <p className="text-xs text-slate-400 font-bold uppercase">Belum ada notifikasi</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
