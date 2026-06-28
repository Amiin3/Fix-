{{-- 1. CSS TEMA SLIM MODERN --}}
<style>
    .akrab-card-modern {
        background: #111827; border: 1px solid #1f2937; border-radius: 10px; color: #f3f4f6;
    }
    .btn-slim {
        padding: 6px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; border: none; transition: 0.2s;
    }
    .btn-slim-primary { background: #2563eb; color: #fff; } .btn-slim-primary:hover { background: #1d4ed8; }
    .btn-slim-danger { background: #dc2626; color: #fff; } .btn-slim-danger:hover { background: #b91c1c; }
    .btn-slim-success { background: #059669; color: #fff; } .btn-slim-success:hover { background: #047857; }
    
    .xl-terminal-box {
        background: #000000; font-family: 'Consolas', 'Courier New', monospace; font-size: 11px;
        color: #10b981; border-left: 3px solid #3b82f6; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;
    }
</style>

{{-- 2. HTML WADAH PENGELOLA --}}
<div class="akrab-card-modern p-3 mb-3 shadow-sm">
    <div class="d-flex justify-content-between align-items-center mb-3" style="border-bottom: 1px solid #374151; padding-bottom: 10px;">
        <div>
            <span class="d-block text-secondary" style="font-size: 11px;">MSISDN PENGELOLA</span>
            <strong class="text-white fs-5">{{ $pengelola->msisdn }}</strong>
        </div>
        <div class="text-end">
            <span class="d-block text-secondary" style="font-size: 11px;">JADWAL RESET</span>
            <span class="badge bg-dark text-info border border-secondary">Tgl {{ $pengelola->tanggal_restok ?? 'N/A' }}</span>
        </div>
    </div>

    {{-- Tombol Aksi --}}
    <div class="d-flex flex-wrap gap-2 justify-content-between">
        <div class="d-flex gap-2">
            <button class="btn-slim btn-slim-danger" onclick="executeXlAction('close', '{{ $pengelola->msisdn }}', this)">
                <i class="fa fa-lock"></i> Close All
            </button>
            <button class="btn-slim btn-slim-success" onclick="executeXlAction('open', '{{ $pengelola->msisdn }}', this)">
                <i class="fa fa-unlock"></i> Open All
            </button>
        </div>
        
        <button class="btn-slim btn-slim-primary" onclick="executeXlAction('sync', '{{ $pengelola->msisdn }}', this)">
            <i class="fa fa-sync"></i> Sync XL
        </button>
    </div>

    {{-- Monitor Terminal Live Log --}}
    <div id="xl-log-{{ $pengelola->msisdn }}" class="xl-terminal-box p-2 mt-3 rounded d-none">
        <div class="text-warning mb-1" style="border-bottom: 1px solid #333; font-size: 10px;">>_ RAW SERVER RESPONSE</div>
        <pre id="xl-raw-text-{{ $pengelola->msisdn }}" class="m-0 text-white"></pre>
    </div>
</div>

{{-- 3. JAVASCRIPT AJAX CORE (Hanya di-render sekali jika dipanggil dalam loop) --}}
@once
<script>
function executeXlAction(action, msisdn, element) {
    let originalHtml = $(element).html();
    $(element).html('<i class="fa fa-spinner fa-spin"></i> Wait...').prop('disabled', true);
    
    let logBox = $(`#xl-log-${msisdn}`);
    let logText = $(`#xl-raw-text-${msisdn}`);
    
    let targetUrl = "";
    if (action === 'close') targetUrl = "{{ route('admin.akrab.close-all') }}";
    if (action === 'open') targetUrl = "{{ route('admin.akrab.open-all') }}";
    
    // Sync spesifik per nomor, menggunakan logic backend yg ada
    if (action === 'sync') targetUrl = "{{ route('admin.akrab.bulk-sync') }}"; 

    logBox.addClass('d-none');
    logText.text('');

    $.ajax({
        url: targetUrl,
        type: "POST",
        data: {
            _token: "{{ csrf_token() }}",
            msisdn: msisdn
        },
        dataType: "json",
        success: function(response) {
            logBox.removeClass('d-none');
            
            // Tangkap status success (mendukung format JSON dari controller kita dan raw dari XL)
            let isSuccess = response.success === true || response.status === true;
            
            if (isSuccess) {
                logBox.css('border-left', '3px solid #10b981'); // Hijau
            } else {
                logBox.css('border-left', '3px solid #ef4444'); // Merah
            }

            logText.text(JSON.stringify(response, null, 4));
        },
        error: function(xhr) {
            logBox.removeClass('d-none').css('border-left', '3px solid #ef4444');
            let errorData = {
                "HTTP_STATUS": xhr.status,
                "ERROR_MESSAGE": "Koneksi gagal atau Server Pusat Timeout",
                "RAW_DEBUG": xhr.responseText ? xhr.responseText.substring(0, 200) : "Blank Response"
            };
            logText.text(JSON.stringify(errorData, null, 4));
        },
        complete: function() {
            $(element).html(originalHtml).prop('disabled', false);
        }
    });
}
</script>
@endonce
