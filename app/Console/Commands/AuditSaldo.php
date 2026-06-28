<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AuditSaldo extends Command
{
    protected $signature = 'audit:saldo {identifier} {--fix} {--all}';
    protected $description = 'Mesin X-Ray untuk melacak ketimpangan deposit vs transaksi member secara komplit';

    public function handle()
    {
        $identifier = $this->argument('identifier');
        $isFix = $this->option('fix');
        $showAll = $this->option('all');
        $limitData = $showAll ? 100000 : 15;

        $this->info("==================================================================================");
        $this->info(" 🕵️  MESIN X-RAY AUDIT MILASTORE - TARGET: {$identifier} ");
        $this->info("==================================================================================");

        $user = User::where('name', $identifier)->orWhere('email', $identifier)->orWhere('whatsapp', $identifier)->first();

        if (!$user) {
            $this->error("❌ Misi Dibatalkan: Member dengan Nama/Email/WA '{$identifier}' tidak ditemukan!");
            return;
        }

        // ==========================================
        // 1. HITUNG DEPOSIT PURE (UANG MASUK DARI PAYMENT GATEWAY)
        // ==========================================
        $depositQuery = DB::table('deposits')->where('user_id', $user->id)->whereIn('status', ['Sukses', 'success', 'SUKSES']);
        $depositSukses = $depositQuery->sum('total_bayar');
        
        $depositList = $depositQuery->orderBy('id', 'desc')->limit($limitData)->get();
        $depositRows = [];
        foreach ($depositList as $dep) {
            $depositRows[] = [
                $dep->id,
                date('y-m-d H:i', strtotime($dep->created_at)),
                $dep->metode,
                'Rp ' . number_format($dep->total_bayar, 0, ',', '.'),
                $dep->status
            ];
        }

        // ==========================================
        // 2. HITUNG TRANSAKSI (ADA YANG KELUAR, ADA YANG MASUK/MANUAL)
        // ==========================================
        $trxQuery = DB::table('transaksi')
            ->where('username', $user->name)
            ->whereIn('status', ['Sukses', 'Proses', 'Pending', 'success', 'SUKSES', 'PROSES', 'PENDING']);
            
        $trxList = $trxQuery->orderBy('id', 'desc')->limit($limitData)->get();
        $trxRows = [];
        
        $totalBeliKeluar = 0;
        $totalManualMasuk = 0;

        foreach ($trxList as $trx) {
            $harga = (float) $trx->harga;
            $snLcase = strtolower($trx->sn ?? '');
            
            // 🧠 LOGIKA PINTAR: Deteksi apakah MANUAL ini Penambahan atau Pengurangan?
            $isMasuk = false;
            if ($harga < 0) {
                // Jika harga minus, otomatis itu penambahan saldo (refund)
                $isMasuk = true;
            } elseif ($trx->kode_layanan === 'MANUAL' && (strpos($snLcase, 'tambah') !== false || strpos($snLcase, 'masuk') !== false || strpos($snLcase, 'refund') !== false)) {
                // Jika manual dan keterangannya ada kata tambah/masuk/refund
                $isMasuk = true;
            }

            if ($isMasuk) {
                $totalManualMasuk += abs($harga);
                $alur = '🟢 MASUK (+)';
            } else {
                $totalBeliKeluar += abs($harga);
                $alur = '🔴 KELUAR (-)';
            }

            $trxRows[] = [
                $trx->id,
                date('y-m-d H:i', strtotime($trx->tanggal ?? $trx->created_at)),
                $trx->kode_layanan,
                substr($trx->sn ?? '-', 0, 15), // MUNCULIN KETERANGAN MANUALNYA
                $alur,
                'Rp ' . number_format(abs($harga), 0, ',', '.'),
                $trx->status
            ];
        }

        // ==========================================
        // 3. KALKULASI HASIL AUDIT
        // ==========================================
        $saldoSeharusnya = ($depositSukses + $totalManualMasuk) - $totalBeliKeluar;
        $saldoAsli = $user->saldo ?? 0;
        $selisih = $saldoAsli - $saldoSeharusnya;

        $this->line("👤 Member   : " . $user->name . " (" . $user->email . ")");
        $this->line("💳 Sisa Saldo Asli di Aplikasi : Rp " . number_format($saldoAsli, 0, ',', '.'));
        $this->line("----------------------------------------------------------------------------------");
        
        $this->info("📥 RINCIAN UANG MASUK (TOP UP PAYMENT) - " . ($showAll ? "SEMUA DATA" : "15 TERAKHIR"));
        if (count($depositRows) > 0) {
            $this->table(['ID', 'Tanggal', 'Metode', 'Nominal', 'Status'], $depositRows);
        } else {
            $this->line("   (Belum ada riwayat top up sukses)");
        }
        
        $this->warn("\n🔄 RINCIAN MUTASI TRANSAKSI (BELI & MANUAL) - " . ($showAll ? "SEMUA DATA" : "15 TERAKHIR"));
        if (count($trxRows) > 0) {
            $this->table(['ID', 'Tanggal', 'Produk', 'SN / Keterangan', 'Alur Saldo', 'Nominal', 'Status'], $trxRows);
        } else {
            $this->line("   (Belum ada riwayat transaksi)");
        }
        
        $this->line("----------------------------------------------------------------------------------");
        $this->info("➕ Total Top Up Deposit    : Rp " . number_format($depositSukses, 0, ',', '.'));
        if ($totalManualMasuk > 0) {
            $this->info("➕ Total Penambahan Manual : Rp " . number_format($totalManualMasuk, 0, ',', '.'));
        }
        $this->warn("➖ Total Pembelian Keluar  : Rp " . number_format($totalBeliKeluar, 0, ',', '.'));
        $this->line("🧮 SALDO SEHARUSNYA        : Rp " . number_format($saldoSeharusnya, 0, ',', '.'));
        $this->line("==================================================================================");

        if ($selisih == 0) {
            $this->info("✅ STATUS AMAN: Saldo member ini 100% presisi. Tidak ada kebocoran.");
        } elseif ($selisih > 0) {
            $this->warn("⚠️ KETIMPANGAN DITEMUKAN: Saldo Asli LEBIH BESAR Rp " . number_format($selisih, 0, ',', '.') . " dari seharusnya!");
        } else {
            $this->error("🚨 KEBOCORAN DITEMUKAN: Saldo Asli LEBIH KECIL Rp " . number_format(abs($selisih), 0, ',', '.') . " dari seharusnya!");
        }

        if ($isFix && $selisih != 0) {
            DB::table('users')->where('id', $user->id)->update(['saldo' => $saldoSeharusnya]);
            $this->info("\n✅ BERHASIL SINKRONISASI! Saldo telah diubah menjadi Rp " . number_format($saldoSeharusnya, 0, ',', '.'));
        }
        $this->info("");
    }
}
