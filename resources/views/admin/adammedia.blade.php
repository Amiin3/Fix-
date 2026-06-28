<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RADAR ADMIN | MILASTORE</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&family=Plus+Jakarta+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; color: #1e293b; }
        .radar-console { background: #000; color: #10b981; font-family: 'JetBrains Mono', monospace; padding: 15px; border-radius: 12px; font-size: 11px; height: 180px; overflow-y: auto; border: 2px solid #334155; }
        .card-custom { border: none; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .btn-primary { background: #4f46e5; border: none; border-radius: 10px; font-weight: 700; }
    </style>
</head>
<body class="py-4">
<div class="container">
    <div class="row g-4">
        <div class="col-md-5">
            <div class="card card-custom p-4 bg-white mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold m-0"><i class="fas fa-satellite-dish me-2"></i> SYSTEM RADAR</h6>
                    {!! $api_status !!}
                </div>
                <div class="radar-console mb-3">{{ $radar_logs }}</div>
                
                <h6 class="fw-bold small text-muted mb-2">AMBIL TIKET DEPOSIT (AM0702)</h6>
                <form action="{{ url('/admin/adammedia/ticket') }}" method="POST" class="d-flex gap-2">
                    @csrf
                    <input type="number" name="amount" class="form-control form-control-sm rounded-3" placeholder="Nominal" required>
                    <button type="submit" class="btn btn-dark btn-sm px-3">TIKET</button>
                </form>
            </div>
        </div>

        <div class="col-md-7">
            <div class="card card-custom bg-white overflow-hidden">
                <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
                    <h6 class="fw-bold m-0">Adammedia Products</h6>
                    <form action="{{ url('/admin/adammedia/sync') }}" method="POST">
                        @csrf
                        <button class="btn btn-primary btn-sm px-3">SINKRONKAN</button>
                    </form>
                </div>
                <div class="table-responsive" style="max-height: 450px;">
                    <table class="table table-hover align-middle small">
                        <thead class="table-light">
                            <tr><th>KODE</th><th>MODAL</th><th>JUAL</th><th>STOK</th><th>AKSI</th></tr>
                        </thead>
                        <tbody>
                            @foreach($products as $p)
                            <tr>
                                <td><b>{{ $p->product_code }}</b></td>
                                <td class="text-muted">Rp{{ number_format($p->price_original) }}</td>
                                <form action="{{ url('/admin/adammedia/update/'.$p->id) }}" method="POST">
                                    @csrf
                                    <td><input type="number" name="price_sell" value="{{ $p->price_sell }}" class="form-control form-control-sm fw-bold" style="width: 90px"></td>
                                    <td><input type="number" name="stock_count" value="{{ $p->stock_count }}" class="form-control form-control-sm text-center" style="width: 60px"></td>
                                    <td><button type="submit" class="btn btn-sm btn-outline-dark border-0"><i class="fas fa-save"></i></button></td>
                                </form>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://kit.fontawesome.com/your-code.js" crossorigin="anonymous"></script>
</body>
</html>
