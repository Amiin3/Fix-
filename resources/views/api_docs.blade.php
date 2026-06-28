<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MilaPay V12 - Full Stack API Documentation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b0f1a; color: #94a3b8; }
        code { font-family: 'JetBrains Mono', monospace; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); }
    </style>
</head>
<body class="antialiased">

    <header class="border-b border-white/5 sticky top-0 z-50 glass">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
                <div class="bg-indigo-500 text-white p-1 rounded-md font-black text-[10px] italic">MILA</div>
                <span class="text-white font-black tracking-tighter text-lg">PAY <span class="text-indigo-400">V12</span></span>
            </div>
            <span class="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Inertia.js Edition</span>
        </div>
    </header>

    <main class="container mx-auto px-6 py-12 max-w-5xl">
        
        <div class="mb-12">
            <h1 class="text-5xl font-extrabold text-white mb-4 tracking-tighter">API Integration Guide</h1>
            <p class="text-slate-400 max-w-2xl">Dokumentasi lengkap untuk integrasi MilaPay. Mendukung White-Label, Webhook Callback, dan High-Security Signature.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            <div class="lg:col-span-2 space-y-12">
                
                <section>
                    <h2 class="text-white font-black text-xl mb-4 flex items-center gap-3"><span class="text-indigo-500">01.</span> AUTENTIKASI</h2>
                    <div class="glass p-6 rounded-3xl space-y-4">
                        <p class="text-sm">Gunakan API Key Anda pada HTTP Header untuk setiap request (Khusus eksternal).</p>
                        <div class="bg-black/40 p-4 rounded-2xl border border-white/5">
                            <code class="text-indigo-300 text-xs">X-MILA-KEY: MS-YOUR-SECRET-KEY</code>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="text-white font-black text-xl mb-4 flex items-center gap-3"><span class="text-indigo-500">02.</span> CREATE TRANSACTION</h2>
                    <div class="glass p-6 rounded-3xl space-y-4">
                        <div class="flex gap-2 text-[10px] font-black uppercase">
                            <span class="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">POST</span>
                            <span class="text-slate-500">https://milastore.web.id/api/gateway/pay</span>
                        </div>
                        <table class="w-full text-xs text-left">
                            <tr class="text-slate-500 uppercase font-black tracking-widest"><th class="pb-2">Param</th><th class="pb-2">Description</th></tr>
                            <tr class="border-t border-white/5"><td class="py-3 font-mono text-indigo-400">amount</td><td class="py-3">Nominal transaksi (Min 10.000)</td></tr>
                            <tr class="border-t border-white/5"><td class="py-3 font-mono text-indigo-400">method</td><td class="py-3">QRIS_GOPAY, QRIS_SHOPEE, JAGO, SEABANK</td></tr>
                            <tr class="border-t border-white/5"><td class="py-3 font-mono text-indigo-400">webhook_url</td><td class="py-3">URL Callback (Opsional)</td></tr>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 class="text-white font-black text-xl mb-4 flex items-center gap-3"><span class="text-indigo-500">03.</span> WEBHOOK / CALLBACK</h2>
                    <div class="glass p-6 rounded-3xl space-y-4 border-l-4 border-indigo-500">
                        <p class="text-sm text-slate-300">Server MilaPay akan mengirimkan POST JSON ke URL Callback Anda segera setelah pembayaran sukses.</p>
                        <div class="bg-black/60 p-5 rounded-2xl font-mono text-xs text-blue-400 leading-relaxed">
{
  "trx_id": 437,
  "status": "SUKSES",
  "amount": 25000,
  "total_bayar": 25870,
  "signature": "8d7f87f7d..."
}
                        </div>
                        <div class="bg-indigo-500/10 p-4 rounded-xl">
                            <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Security Signature (MD5):</p>
                            <code class="text-xs text-slate-300 italic">md5(trx_id + total_bayar + "MILAPAY_SECRET_V12")</code>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="text-white font-black text-xl mb-4 flex items-center gap-3"><span class="text-indigo-500">04.</span> REACT INERTIA.JS INTEGRATION</h2>
                    <div class="glass p-6 rounded-3xl space-y-4">
                        <p class="text-sm italic text-slate-400">// Contoh request menggunakan bawaan useForm Inertia</p>
                        <div class="bg-[#011627] p-5 rounded-2xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
<pre>
import { useForm } from '@inertiajs/react';

export default function Checkout() {
    const { data, setData, post, processing } = useForm({
        amount: 10000,
        method: 'QRIS_GOPAY'
    });

    const submitPayment = (e) => {
        e.preventDefault();
        post('/api/gateway/pay', {
            preserveScroll: true,
            onSuccess: (page) => {
                // Tangkap data QRIS / Kartu Bank dari response Controller
                console.log("QR Ready:", page.props.qr_image);
            }
        });
    };

    return (
        &lt;form onSubmit={submitPayment}&gt;
            &lt;button disabled={processing}&gt;Bayar Sekarang&lt;/button&gt;
        &lt;/form&gt;
    );
}
</pre>
                        </div>
                    </div>
                </section>

            </div>

            <div class="space-y-6">
                <div class="glass p-6 rounded-3xl">
                    <h4 class="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">API Endpoints</h4>
                    <ul class="text-[11px] space-y-3 font-mono">
                        <li class="flex justify-between border-b border-white/5 pb-2"><span>Create Pay</span><span class="text-emerald-400">POST</span></li>
                        <li class="flex justify-between border-b border-white/5 pb-2"><span>Check Status</span><span class="text-blue-400">GET</span></li>
                        <li class="flex justify-between border-b border-white/5 pb-2"><span>Cancel Trx</span><span class="text-rose-400">POST</span></li>
                    </ul>
                </div>

                <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20">
                    <h4 class="text-white font-black italic mb-2">SULTAN TIP! 🦅</h4>
                    <p class="text-[11px] text-indigo-100 leading-relaxed">Karena Anda menggunakan <b>Inertia.js</b>, jangan lupa kirim data balik dari controller menggunakan <code>Inertia::render()</code> atau <code>back()->with()</code> agar <i>page.props</i> di React terisi dengan sempurna.</p>
                </div>
            </div>

        </div>

        <footer class="mt-20 pt-10 border-t border-white/5 text-center">
            <p class="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">MilaPay Core Engine &copy; 2026</p>
        </footer>

    </main>

</body>
</html>
