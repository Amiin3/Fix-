<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MILASTORE | Prestige Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; color: #1e293b; padding-bottom: 50px; }
        .enterprise-nav { background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 1000; padding: 15px 0; }
        .card-p { background: #fff; border: none; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .btn-p { border-radius: 12px; font-weight: 700; padding: 10px 20px; border: none; }
        .input-p { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; font-size: 14px; width: 100%; }
    </style>
</head>
<body>
    <nav class="enterprise-nav shadow-sm mb-4">
        <div class="container d-flex justify-content-between align-items-center">
            <h4 class="fw-bold mb-0 text-primary">MILASTORE <span class="text-dark small">v7.5</span></h4>
            <div class="d-flex gap-2">
                <button class="btn btn-dark btn-p" data-bs-toggle="modal" data-bs-target="#mD"><i class="fas fa-wallet"></i></button>
                <form action="{{ url('admin/adammedia/sync') }}" method="POST">@csrf<button class="btn btn-primary btn-p"><i class="fas fa-sync"></i></button></form>
            </div>
        </div>
    </nav>
    <div class="container">
        @if(session('ticket_res'))
        <div class="card-p p-4 mb-4 border-start border-primary border-5 bg-white shadow-sm">
            <h6 class="fw-bold text-primary"><i class="fas fa-receipt me-2"></i>INSTRUKSI TRANSFER:</h6>
            <div class="fw-bold small" style="white-space: pre-line; font-family: monospace;">{{ session('ticket_res') }}</div>
        </div>
        @endif
        
        <div class="row mb-4">
            <div class="col-12">
                <div class="card-p p-4 bg-primary text-white d-flex justify-content-between align-items-center rounded-4 shadow-sm" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);">
                    <div>
                        <small class="fw-bold opacity-75 tracking-wider">PROVIDER BALANCE</small>
                        <div class="h2 fw-bold mb-0 mt-1">{{ $balance }}</div>
                    </div>
                    <i class="fas fa-wallet fa-3x opacity-50"></i>
                </div>
            </div>
        </div>

        <div class="card-p overflow-hidden">
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead class="bg-light"><tr><th class="ps-4">PRODUCT</th><th>DISPLAY & DESC</th><th width="170">PRICE</th><th class="pe-4 text-end">SAVE</th></tr></thead>
                    <tbody>
                        @foreach($products as $p)
                        <tr>
                            <td class="ps-4">
                                <div class="fw-bold text-dark">{{ $p->product_code }}</div>
                                <small class="text-muted">Stock: {{ $p->stock_count }}</small>
                            </td>
                            <td>
                                <form action="{{ url('admin/adammedia/update', $p->id) }}" method="POST" id="f-{{ $p->id }}">@csrf
                                <input type="text" name="product_name" value="{{ $p->product_name }}" class="input-p py-1 mb-1 fw-bold">
                                <textarea name="description" class="input-p py-1" rows="1">{{ $p->description }}</textarea>
                            </td>
                            <td>
                                <input type="number" name="price_sell" value="{{ (int)$p->price_sell }}" class="form-control fw-bold mb-1">
                                <div class="form-check form-switch"><input class="form-check-input" type="checkbox" name="is_active" {{ $p->is_active?'checked':'' }}> <small>Active</small></div>
                                </form>
                            </td>
                            <td class="pe-4 text-end"><button type="submit" form="f-{{ $p->id }}" class="btn btn-primary btn-p btn-sm px-3 shadow-sm">SAVE</button></td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="modal fade" id="mD" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content border-0 rounded-4 shadow-lg p-4">
        <h5 class="fw-bold mb-4 text-center">Generate Tiket Deposit</h5>
        <form action="{{ url('admin/adammedia/ticket') }}" method="POST">@csrf
            <div class="mb-4"><label class="small fw-bold mb-2">NOMINAL TRANSFER</label><input type="number" name="amount" class="input-p text-center h3 fw-bold py-3" required></div>
            <button class="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow">AMBIL TIKET</button>
        </form>
    </div></div></div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
