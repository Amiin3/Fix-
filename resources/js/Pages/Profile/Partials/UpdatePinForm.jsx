import { useRef } from 'react';
import { useForm } from '@inertiajs/react';

export default function UpdatePinForm() {
    const currentPinInput = useRef();
    const newPinInput = useRef();

    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_pin: '',
        new_pin: '',
        new_pin_confirmation: '',
    });

    const updatePin = (e) => {
        e.preventDefault();
        put(route('profile.pin.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.current_pin) currentPinInput.current.focus();
                else if (errors.new_pin) newPinInput.current.focus();
            },
        });
    };

    return (
        <section>
            <form onSubmit={updatePin} className="space-y-4">
                {/* Input PIN Saat Ini */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PIN Saat Ini <span className="text-slate-400 font-medium">(Kosongkan jika belum buat)</span></label>
                    <input
                        ref={currentPinInput}
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={data.current_pin}
                        onChange={(e) => setData('current_pin', e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold tracking-[0.2em] text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        placeholder="••••••"
                    />
                    {errors.current_pin && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.current_pin}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Input PIN Baru */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">PIN Baru</label>
                        <input
                            ref={newPinInput}
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={data.new_pin}
                            onChange={(e) => setData('new_pin', e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold tracking-[0.2em] text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                            placeholder="••••••"
                        />
                        {errors.new_pin && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.new_pin}</p>}
                    </div>

                    {/* Konfirmasi PIN Baru */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi PIN Baru</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={data.new_pin_confirmation}
                            onChange={(e) => setData('new_pin_confirmation', e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold tracking-[0.2em] text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                            placeholder="••••••"
                        />
                        {errors.new_pin_confirmation && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.new_pin_confirmation}</p>}
                    </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-slate-800 text-white rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-800/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan PIN'}
                    </button>

                    {recentlySuccessful && (
                        <p className="text-sm font-bold text-emerald-500 animate-[pulse_1s_ease-in-out]">
                            <i className="fa-solid fa-check-circle mr-1"></i> Tersimpan!
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}
