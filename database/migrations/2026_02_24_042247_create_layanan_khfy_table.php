<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('layanan_khfy', function (Blueprint $table) {
            $table->id();
            $table->string('kode_layanan')->unique();
            $table->string('nama_layanan');
            $table->text('deskripsi')->nullable();
            $table->string('kategori')->nullable();
            $table->string('brand')->nullable();
            $table->decimal('harga_beli', 15, 2);
            $table->decimal('harga_jual', 15, 2);
            $table->string('status')->default('active');
            $table->string('tipe')->default('general');
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('layanan_khfy');
    }
};
