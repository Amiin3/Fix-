<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MilaPay - Tagihan #{{ $deposit->id }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* ANIMASI CUSTOM JOSJIS */
        @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseBorder {
            0%, 100% { border-color: rgba(79, 70, 229, 0.3); box-shadow: 0 0 10px rgba(79, 70, 229, 0.1); }
            50% { border-color: rgba(79, 70, 229, 0.8); box-shadow: 0 0 20px rgba(79, 70, 229, 0.4); }
        }
        @keyframes successPop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-card {
            animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-pulse-border {
            animation: pulseBorder 2s infinite ease-in-out;
        }
        .animate-success {
            animation: successPop 0.5s ease-out forwards;
        }
        
        /* Transition untuk transisi halus antar status */
        .fade-transition {
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        body {
            background-color: #0f172a; /* Slate 900 biar kontras */
            background-image: radial-gradient(#1e293b 1px, transparent 1px);
            background-size: 20px 20px;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4 font-sans text-slate-900">
    
    <div id="main-container" class="w-full max-w-md fade-transition opacity-100">
        
        <div id="invoice-card" class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-card">
            
            <div class="bg-indigo-700 p-6 text-center text-white bg-gradient-to-br from-slate-900 to-indigo-800 border-b-4 border-yellow-400">
                <h1 class="text-3xl font-black italic tracking-tighter uppercase">MILA<span class="text-yellow-400">PAY</span></h1>
                <p class="text-[10px] uppercase tracking-widest opacity-70 mt-1">Official Payment Gateway</p>
            </div>
            
            <div class="p-8 text-center">
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Pembayaran</p>
                <h2 class="text-5xl font-black text-slate-800 tracking-tighter">Rp {{ number_format($deposit->total_bayar, 0, ',', '.') }}</h2>
                
                <div class="mt-5 bg-rose-50 text-rose-600 text-[11px] px-5 py-2.5 rounded-full font-bold border border-rose-100 animate-pulse uppercase tracking-wide">
                    ⚠️ Transfer Sesuai Nominal (Termasuk Kode Unik)
                </div>

                <div class="mt-8 border-t-2 border-slate-100 border-dashed pt-8 relative">
                    <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-bold text-indigo-600 uppercase tracking-widest">{{ $method->name }}</span>

                    @if($qr_image)
                        <div class="inline-block p-2.5 bg-white border-2 rounded-[2rem] animate-pulse-border shadow-inner">
                            <img src="{{ $qr_image }}" alt="Payment Card" class="w-72 h-72 mx-auto rounded-2xl shadow-inner">
                        </div>
                        
                        <div class="mt-6 space-y-2">
                            @if($isQris)
                                <p class="text-xs text-slate-500 font-medium">Scan QRIS di atas dengan aplikasi E-Wallet/M-Banking Anda.</p>
                                <p class="text-[10px] text-green-700 font-black uppercase tracking-widest bg-green-100 inline-block px-4 py-1.5 rounded-full border border-green-200">QRIS DYNAMIC MPM READY</p>
                            @else
                                <p class="text-xs text-slate-500 font-medium">Ini adalah kartu rekening virtual. Salin data di atas untuk transfer.</p>
                                <p class="text-[10px] text-indigo-700 font-black uppercase tracking-widest bg-indigo-100 inline-block px-4 py-1.5 rounded-full border border-indigo-200">BANK TRANSFER MODE</p>
                            @endif
                        </div>
                    @endif
                </div>

                <div class="mt-8 flex items-center justify-center gap-3 text-slate-400 bg-slate-50 py-4 rounded-full border border-slate-100">
                    <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <p class="text-[11px] font-bold italic tracking-wide uppercase">Menunggu Pembayaran...</p>
                <button onclick="cancelTrx()" id="btn-cancel" class="mt-6 text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-all block mx-auto py-2 px-4 border border-rose-100 rounded-full hover:bg-rose-50">❌ Batalkan Pesanan</button>
                </div>
            </div>
        </div>
    </div>

    <div id="success-screen" class="hidden fixed inset-0 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-[2.5rem] p-12 text-center shadow-2xl border-2 border-green-200 animate-success max-w-sm w-full">
            <div class="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-6xl shadow-inner mb-6">✅</div>
            <h2 class="text-4xl font-black text-slate-800 tracking-tighter leading-none">BOOM!<br>BERHASIL</h2>
            <p class="text-slate-500 mt-4 text-sm font-medium">Pembayaran Anda terverifikasi.<br>Saldo otomatis ditambahkan.</p>
            <p class="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">MilaPay V12 Secured</p>
        </div>
    </div>

    <script>
        const trxId = "{{ $deposit->id }}";
        const mainContainer = document.getElementById('main-container');
        const successScreen = document.getElementById('success-screen');

        const checkInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/gateway/status/${trxId}`);
                if (!res.ok) return;
                const data = await res.json();
                
                if (data.is_paid) {
                    clearInterval(checkInterval);
        async function cancelTrx() {
            if(!confirm("Yakin ingin membatalkan pesanan ini?")) return;
            try {
                const res = await fetch(`/api/gateway/cancel/${trxId}`, { 
                    method: "POST", 
                    headers: { "X-CSRF-TOKEN": "{{ csrf_token() }}" } 
                });
                const data = await res.json();
                if (data.status) window.location.reload();
            } catch (e) { alert("Gagal membatalkan"); }
        }

                    showSuccess();
                }
            } catch (e) { }
        }, 3000); // Poll setiap 3 detik

        async function cancelTrx() {
            if(!confirm("Yakin ingin membatalkan pesanan ini?")) return;
            try {
                const res = await fetch(`/api/gateway/cancel/${trxId}`, { 
                    method: "POST", 
                    headers: { "X-CSRF-TOKEN": "{{ csrf_token() }}" } 
                });
                const data = await res.json();
                if (data.status) window.location.reload();
            } catch (e) { alert("Gagal membatalkan"); }
        }

        function showSuccess() {
            // Animasi transisi halus: Fade out invoice, fade in sukses
            mainContainer.style.opacity = '0';
            mainContainer.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                mainContainer.classList.add('hidden');
                successScreen.classList.remove('hidden');
            }, 500); // Nunggu animasi fade out selesai
        }
    </script>
</body>
</html>
