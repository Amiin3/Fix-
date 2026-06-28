import React, { useState, useRef, useEffect } from 'react';

export default function PinModal({ isOpen, onClose, onSubmit, isLoading }) {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [showAnim, setShowAnim] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowAnim(true);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } else {
            setShowAnim(false);
            setPin(['', '', '', '', '', '']);
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        if (value !== '' && index < 5) inputRefs.current[index + 1].focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullPin = pin.join('');
        if (fullPin.length === 6) onSubmit(fullPin);
    };

    if (!isOpen && !showAnim) return null;

    return (
        <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={!isLoading ? onClose : undefined}></div>
            <div className={`relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 text-center transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mb-6 shadow-inner border border-indigo-100">
                    <i className="fa-solid fa-shield-halved text-2xl text-indigo-500"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2 font-['Outfit']">Verifikasi PIN</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium px-4">Masukkan 6 digit PIN keamanan untuk melanjutkan pembayaran.</p>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-2 mb-8">
                        {pin.map((digit, index) => (
                            <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="password" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} disabled={isLoading} className="w-12 h-14 text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none" />
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        <button type="submit" disabled={pin.join('').length !== 6 || isLoading} className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all duration-300 ${pin.join('').length === 6 && !isLoading ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/30 hover:scale-[1.02] active:scale-95' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}>
                            {isLoading ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-circle-notch fa-spin"></i> MEMVERIFIKASI...</span> : 'KONFIRMASI SUNTIK'}
                        </button>
                        <button type="button" onClick={onClose} disabled={isLoading} className="w-full py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all active:scale-95">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
