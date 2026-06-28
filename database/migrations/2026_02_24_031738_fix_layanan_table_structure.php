<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('layanan', function (Blueprint $table) {
            // Pastikan kolom harga_beli ada
            if (!Schema::hasColumn('layanan', 'harga_beli')) {
                $table->decimal('harga_beli', 15, 2)->default(0)->after('nama_layanan');
            }
            // Tambahkan index unik agar upsert tidak error
            $table->string('kode_layanan')->change();
            // Drop index lama jika ada, lalu buat yang baru
            try { $table->dropUnique(['kode_layanan']); } catch(\Exception $e) {}
            $table->unique('kode_layanan');
        });
    }
    public function down() {}
};
