<?php
try {
    $trx = \Illuminate\Support\Facades\DB::table('transaksi')->orderBy('id', 'desc')->first();
    echo "\n🚀 TEST MANUAL JOB H2H UNTUK TRX: " . $trx->ref_id . "\n";
    
    // Paksa panggil kurir H2H
    $job = new \App\Jobs\ProcessH2HOrder($trx->id, 'DIGI', $trx->kode_layanan, $trx->tujuan, $trx->ref_id);
    $job->handle();
    
    echo "✅ KURIR BERHASIL JALAN SAMPAI AKHIR!\n\n";
} catch (\Throwable $e) {
    echo "\n❌ KURIR PINGSAN KARENA FATAL ERROR: \n";
    echo $e->getMessage() . "\n";
    echo "Di file: " . $e->getFile() . " (Baris " . $e->getLine() . ")\n\n";
}
