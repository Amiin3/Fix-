import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function AppLock({ children }) {
    const { auth } = usePage().props;
    const [isLocked, setIsLocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true); // 🚀 STATE BARU: Pengecekan Database
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [shake, setShake] = useState(false);
    
    const [mode, setMode] = useState('VERIFY'); 
    const [tempPin, setTempPin] = useState(''); 
    
    const inputRefs = useRef([]);

    // Saat web dibuka, Satpam nanya langsung ke Database!
    useEffect(() => {
        if (auth?.user) {
            const unlocked = sessionStorage.getItem('app_unlocked');
            if (!unlocked) {
                setIsLocked(true);
                // 🚀 TEMBAK LANGSUNG KE DATABASE, BYPASS INERTIA!
                axios.get('/check-pin-status').then(res => {
                    setMode(res.data.has_pin ? 'VERIFY' : 'CREATE');
                    setIsChecking(false);
                }).catch(() => {
                    setMode('VERIFY'); // Fallback aman
                    setIsChecking(false);
                });
            } else {
                setIsChecking(false);
            }
        } else {
            setIsChecking(false);
        }
    }, [auth]);

    useEffect(() => {
        if (isLocked && !isChecking) {
            setTimeout(() => inputRefs.current[0]?.focus(), 200);
        }
    }, [isLocked, isChecking, mode]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setErrorMsg('');

        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        
        if (index === 5 && value !== '') {
            handlePinLogic([...newPin.slice(0, 5), value].join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePinLogic = (fullPin) => {
        if (mode === 'CREATE') {
            setTempPin(fullPin);
            setMode('CONFIRM');
            setPin(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } else if (mode === 'CONFIRM') {
            if (fullPin !== tempPin) {
                setErrorMsg('PIN tidak cocok! Silakan buat ulang.');
                setMode('CREATE');
                setTempPin('');
                setPin(['', '', '', '', '', '']);
                setShake(true);
                setTimeout(() => setShake(false), 500);
            } else {
                verifyApi(fullPin);
            }
        } else {
            verifyApi(fullPin);
        }
    };

    const verifyApi = async (fullPin) => {
        setIsLoading(true);
        try {
            const res = await axios.post('/verify-pin', { pin: fullPin });
            if (res.data.success) {
                sessionStorage.setItem('app_unlocked', 'true');
                setIsLocked(false);
            }
        } catch (err) {
            setPin(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setErrorMsg(err.response?.data?.message || 'PIN Tidak Valid!');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLocked) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F4F7FB] font-['Outfit']">
            {isChecking ? (
                /* 🚀 ANIMASI LOADING KEREN SAAT NGECEK DATABASE */
                <div className="flex flex-col items-center justify-center animate-pulse">
                    <i className="fa-solid fa-shield-halved text-4xl text-blue-500 mb-4 animate-bounce"></i>
                    <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Memeriksa Keamanan...</p>
                </div>
            ) : (
                <div className={`relative z-10 bg-white border border-slate-100 p-8 rounded-[35px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-sm text-center transform transition-all ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                    
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6 shadow-inner border border-blue-100">
                        <i className={`fa-solid ${mode === 'VERIFY' ? 'fa-shield-halved text-blue-500' : 'fa-key text-emerald-500'} text-3xl`}></i>
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-wide">
                        {mode === 'VERIFY' && 'Keamanan MilaStore'}
                        {mode === 'CREATE' && 'Buat PIN Baru'}
                        {mode === 'CONFIRM' && 'Konfirmasi PIN'}
                    </h2>
                    <p className="text-sm text-slate-500 mb-8 font-medium px-4">
                        {mode === 'VERIFY' && 'Masukkan 6 digit PIN keamanan untuk masuk ke aplikasi.'}
                        {mode === 'CREATE' && 'Demi keamanan, buat 6 digit PIN transaksi Anda sekarang.'}
                        {mode === 'CONFIRM' && 'Masukkan kembali 6 digit PIN yang baru saja Anda buat.'}
                    </p>

                    <div className="flex justify-center gap-2 mb-6">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isLoading}
                                className="w-12 h-14 text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                            />
                        ))}
                    </div>

                    <div className="h-6">
                        {errorMsg && <p className="text-rose-500 font-bold text-sm animate-pulse">{errorMsg}</p>}
                    </div>
                    
                    {isLoading && <p className="text-blue-500 font-bold text-sm mt-2 animate-pulse"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Memverifikasi...</p>}
                </div>
            )}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                }
            `}</style>
        </div>
    );
}
