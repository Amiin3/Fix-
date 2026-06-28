<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('layanan', function (Blueprint $table) {
            // Hapus index lama jika ada (untuk menghindari tabrakan)
            try { $table->dropUnique(['kode_layanan']); } catch(\Exception $e) {}
            
            // Tambahkan index UNIQUE pada kode_layanan
            $table->string('kode_layanan')->change();
            $table->unique('kode_layanan');
        });
    }
    public function down() {}
};
