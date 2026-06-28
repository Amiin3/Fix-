<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>MILASTORE | Fast Topup</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root { --primary: #4f46e5; --surface: #ffffff; --bg: #f8fafc; --text-main: #0f172a; --text-muted: #64748b; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #e2e8f0; color: var(--text-main); -webkit-font-smoothing: antialiased; }
        
        /* App Shell (Mobile View Constraint) */
        .app-shell { max-width: 480px; margin: 0 auto; background-color: var(--bg); min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,0.1); position: relative; padding-bottom: 100px; }
        
        /* Modern Header */
        .app-header { background: var(--surface); padding: 16px 20px; position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .app-title { font-weight: 800; font-size: 16px; letter-spacing: 0.5px; margin: 0; }
        .icon-btn { color: var(--text-muted); font-size: 18px; text-decoration: none; transition: 0.2s; }
        .icon-btn:hover { color: var(--primary); }

        /* Input Section */
        .section-box { padding: 20px; }
        .input-wrapper { background: var(--surface); border: 2px solid #e2e8f0; border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .input-wrapper:focus-within { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
        .input-wrapper input { border: none; background: transparent; width: 100%; font-size: 16px; font-weight: 700; color: var(--text-main); outline: none; padding-left: 12px; }
        .input-wrapper input::placeholder { color: #94a3b8; font-weight: 500; }

        /* Scrollable Tabs */
        .tabs-container { display: flex; gap: 10px; overflow-x: auto; padding: 0 20px 15px 20px; scrollbar-width: none; }
        .tabs-container::-webkit-scrollbar { display: none; }
        .tab-btn { background: #e2e8f0; border: none; padding: 8px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; color: var(--text-muted); white-space: nowrap; transition: 0.3s; cursor: pointer; }
        .tab-btn.active { background: var(--text-main); color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

        /* Product List */
        .product-list { padding: 0 20px; }
        .product-card { background: var(--surface); border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s ease; position: relative; overflow: hidden; }
        .product-card.empty-stock { opacity: 0.6; cursor: not-allowed; background: #f8fafc; }
        .product-card:not(.empty-stock):hover { border-color: #cbd5e1; transform: translateY(-1px); }
        .product-card.selected { border-color: var(--primary); background: #eef2ff; border-width: 2px; padding: 15px; } /* Adjust padding for 2px border */
        
        /* Details & Accordion */
        .p-code { font-weight: 800; font-size: 15px; }
        .p-price { font-weight: 800; color: var(--primary); font-size: 15px; }
        .p-desc-box { display: none; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1; animation: slideDown 0.3s ease; }
        .product-card.selected .p-desc-box { display: block; }
        .p-name { font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
        .p-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
        
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        /* Floating Action Button */
        .fab-container { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; padding: 16px 20px 24px 20px; background: linear-gradient(to top, rgba(255,255,255,1) 80%, rgba(255,255,255,0)); z-index: 1000; }
        .btn-checkout { background: var(--text-main); color: #fff; border: none; width: 100%; padding: 16px; border-radius: 16px; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1); display: flex; justify-content: center; align-items: center; gap: 8px; }
        .btn-checkout:disabled { background: #cbd5e1; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
        .btn-checkout:not(:disabled):active { transform: scale(0.98); }

        /* Status Badge */
        .badge-stock { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; }
        .badge-available { background: #dcfce7; color: #166534; }
        .badge-empty { background: #fee2e2; color: #991b1b; }
        
        /* Result Alert */
        .result-alert { border-radius: 16px; border: none; padding: 16px; margin-bottom: 20px; }
        .result-alert.sukses { background: #dcfce7; color: #166534; }
        .result-alert.proses { background: #fef3c7; color: #92400e; }
        .result-alert.gagal { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="app-header">
            <a href="javascript:history.back()" class="icon-btn"><i class="fas fa-arrow-left"></i></a>
            <h1 class="app-title">MilaStore <span class="text-primary">AkrabV8</span></h1>
            <a href="{{ url('/riwayat') }}" class="icon-btn"><i class="fas fa-receipt"></i></a>
        </div>

        <div class="section-box">
            @if(session('trx_result'))
                @php 
                    $res = session('trx_result'); 
                    $statusClass = strtolower($res->status ?? 'gagal');
                @endphp
                <div class="alert result-alert {{ $statusClass }}">
                    <div class="d-flex align-items-center mb-2">
                        <i class="fas {{ $statusClass == 'sukses' ? 'fa-check-circle' : ($statusClass == 'proses' ? 'fa-clock' : 'fa-times-circle') }} fs-4 me-2"></i>
                        <h6 class="fw-bold mb-0 m-0">Transaksi {{ $res->status ?? 'GAGAL' }}</h6>
                    </div>
                    <div class="small fw-medium">{{ $res->message ?? 'Terjadi kesalahan sistem.' }}</div>
                    @if(isset($res->sn) && $res->sn != '-' && $res->sn != '')
                        <hr class="my-2 opacity-25">
                        <div class="small font-monospace fw-bold">SN: {{ $res->sn }}</div>
                    @endif
                </div>
            @endif

            <form action="{{ url('/akrabv8/process') }}" method="POST" id="orderForm">
                @csrf
                <input type="hidden" name="product_code" id="selectedProductCode" required>

                <label class="text-muted small fw-bold text-uppercase tracking-wide mb-2 d-block px-1">Nomor Tujuan</label>
                <div class="input-wrapper mb-4">
                    <i class="fas fa-mobile-screen text-primary fs-5"></i>
                    <input type="tel" name="target" placeholder="08XX - XXXX - XXXX" required autocomplete="off" maxlength="15">
                </div>

                @if($groupedProducts->isEmpty())
                    <div class="text-center py-5">
                        <i class="fas fa-box-open text-muted fs-1 opacity-25 mb-3"></i>
                        <h6 class="fw-bold text-muted">Belum ada produk aktif</h6>
                    </div>
                @else
                    <label class="text-muted small fw-bold text-uppercase tracking-wide mb-2 d-block px-1">Pilih Kategori</label>
                @endif
            </form>
        </div>

        @if(!$groupedProducts->isEmpty())
            <div class="tabs-container" id="categoryTabs">
                @foreach($groupedProducts as $category => $products)
                    <button type="button" class="tab-btn {{ $loop->first ? 'active' : '' }}" onclick="switchCategory('{{ md5($category) }}', this)">
                        {{ $category }}
                    </button>
                @endforeach
            </div>

            <div class="product-list pb-5">
                @foreach($groupedProducts as $category => $products)
                    <div class="category-section" id="cat-{{ md5($category) }}" style="display: {{ $loop->first ? 'block' : 'none' }}">
                        @foreach($products as $p)
                            <div class="product-card {{ $p->stock_count < 1 ? 'empty-stock' : '' }}" 
                                 onclick="selectProduct('{{ $p->product_code }}', '{{ number_format($p->price_sell, 0, ',', '.') }}', {{ $p->stock_count }}, this)">
                                
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="p-code">{{ $p->product_code }}</div>
                                        @if($p->stock_count > 0)
                                            <span class="badge-stock badge-available mt-1 d-inline-block"><i class="fas fa-check me-1"></i> Tersedia</span>
                                        @else
                                            <span class="badge-stock badge-empty mt-1 d-inline-block"><i class="fas fa-xmark me-1"></i> Kosong</span>
                                        @endif
                                    </div>
                                    <div class="text-end">
                                        <div class="p-price">Rp {{ number_format($p->price_sell, 0, ',', '.') }}</div>
                                    </div>
                                </div>

                                <div class="p-desc-box">
                                    @if($p->product_name)
                                        <div class="p-name">{{ $p->product_name }}</div>
                                    @endif
                                    <div class="p-desc">
                                        {!! nl2br(e(str_replace(' | ', "\n", $p->description))) !!}
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endforeach
            </div>
        @endif

        <div class="fab-container">
            <button type="submit" form="orderForm" class="btn-checkout" id="btnSubmit" disabled>
                <i class="fas fa-lock"></i> PILIH PRODUK
            </button>
        </div>
    </div>

    <script>
        // Logika Pindah Kategori Tab
        function switchCategory(catId, btnElement) {
            // Sembunyikan semua list kategori
            document.querySelectorAll('.category-section').forEach(el => el.style.display = 'none');
            // Tampilkan list yang dipilih
            document.getElementById('cat-' + catId).style.display = 'block';
            
            // Ubah gaya tombol tab
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            btnElement.classList.add('active');
        }

        // Logika Pemilihan Produk (Smart Accordion & Button Update)
        function selectProduct(code, price, stock, cardElement) {
            // Jangan seleksi kalau stok kosong
            if(stock < 1) return;

            // Hapus seleksi dari semua kartu
            document.querySelectorAll('.product-card').forEach(card => card.classList.remove('selected'));
            
            // Tambahkan efek seleksi ke kartu yang diklik (memunculkan deskripsi)
            cardElement.classList.add('selected');
            
            // Masukkan kode produk ke input hidden form
            document.getElementById('selectedProductCode').value = code;
            
            // Aktifkan dan update tombol checkout di bawah
            let btn = document.getElementById('btnSubmit');
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-shield-check"></i> BAYAR RP ${price}`;
        }

        // Mencegah Dobel Submit (Anti-Spam Klik)
        document.getElementById('orderForm').addEventListener('submit', function() {
            let btn = document.getElementById('btnSubmit');
            btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> MEMPROSES...`;
            btn.disabled = true;
            btn.style.opacity = '0.8';
        });
    </script>
</body>
</html>
