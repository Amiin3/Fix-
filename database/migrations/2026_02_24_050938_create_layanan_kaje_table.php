<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('layanan_kaje', function (Blueprint $table) {
            $table->id();
            $table->string('kode_layanan')->unique();
            $table->string('nama_layanan');
            $table->text('deskripsi')->nullable();
            $table->string('kategori')->nullable();
            $table->decimal('harga_beli', 15, 2);
            $table->decimal('harga_jual', 15, 2);
            $table->integer('stok')->default(0);
            $table->string('status')->default('active');
            $table->timestamp('last_update')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('layanan_kaje');
    }
};
