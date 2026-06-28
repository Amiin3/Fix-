<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - Friends VPS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Roboto+Mono:wght@500&display=swap" rel="stylesheet">
    <style>
        :root { --bg-dark: #0b0e11; --bg-card: #151a21; --primary: #3b82f6; --text-gray: #848e9c; }
        body { background-color: var(--bg-dark); color: #eaecef; font-family: 'Rajdhani', sans-serif; padding-bottom: 50px; }
        .navbar-custom { background: var(--bg-card); border-bottom: 1px solid #2b3139; padding: 15px 0; }
        .product-card { background: var(--bg-card); border: 1px solid #2b3139; border-radius: 10px; padding: 15px; height: 100%; transition: 0.2s; }
        .product-card:hover { border-color: var(--primary); transform: translateY(-3px); }
        .price-tag { color: #f97316; font-family: 'Roboto Mono', monospace; font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>
    <nav class="navbar-custom sticky-top mb-4">
        <div class="container d-flex justify-content-between align-items-center">
            <a href="/dashboard" class="text-decoration-none" style="color:var(--primary); font-weight:700; font-size:20px;">
                <i class="fa-solid fa-arrow-left me-2"></i> KEMBALI
            </a>
            <div class="fw-bold">SALDO: Rp {{ number_format($user->saldo ?? 0) }}</div>
        </div>
    </nav>

    <div class="container">
        <h4 class="fw-bold mb-4 text-uppercase"><i class="fa-solid fa-cart-shopping me-2 text-primary"></i> ORDER {{ $title }}</h4>
        
        <div class="row g-3">
            @forelse($products as $p)
            <div class="col-md-4 col-6">
                <div class="product-card">
                    <div class="fw-bold mb-2" style="font-size: 14px; min-height: 40px;">{{ $p->nama_layanan ?? $p->layanan }}</div>
                    <div class="price-tag mb-1">Rp {{ number_format($p->harga_jual ?? $p->harga ?? 0) }}</div>
                    <button class="btn btn-primary btn-sm w-100 mt-2 fw-bold">BELI SEKARANG</button>
                </div>
            </div>
            @empty
            <div class="col-12 text-center py-5 text-muted">Produk untuk kategori ini tidak ditemukan.</div>
            @endforelse
        </div>
    </div>
</body>
</html>
