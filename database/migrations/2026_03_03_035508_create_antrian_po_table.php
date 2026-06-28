<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('antrian_po', function (Blueprint $table) {
            $table->id();
            $table->string('ref_id')->unique()->comment('ID Transaksi Unik');
            $table->string('username')->index()->comment('Untuk target refund saldo');
            $table->string('kode_produk')->index();
            $table->string('tujuan')->comment('Nomor HP / Tujuan');
            $table->decimal('harga', 15, 2)->default(0)->comment('Nominal Refund');
            $table->integer('prioritas')->default(1)->index()->comment('Makin kecil makin didahulukan');
            $table->string('status')->default('Menunggu')->index()->comment('Menunggu, Proses_API, Sukses, Gagal, Dibatalkan, Skipped');
            $table->timestamp('tanggal')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('antrian_po');
    }
};
