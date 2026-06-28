<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('kelompok', function (Blueprint $table) {
            // Tambahkan kolom provider setelah nama_kelompok
            if (!Schema::hasColumn('kelompok', 'provider')) {
                $table->string('provider')->nullable()->after('nama_kelompok');
            }
        });
    }

    public function down() {
        Schema::table('kelompok', function (Blueprint $table) {
            $table->dropColumn('provider');
        });
    }
};
