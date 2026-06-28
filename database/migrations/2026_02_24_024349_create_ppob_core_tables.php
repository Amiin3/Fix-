<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('kelompok', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kelompok');
            $table->string('icon')->nullable();
            $table->string('warna')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::create('layanan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_layanan')->unique();
            $table->string('provider');
            $table->string('nama_layanan');
            $table->decimal('harga_jual', 15, 2);
            $table->string('tipe')->default('data');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('kelompok_id')->nullable()->constrained('kelompok')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'saldo')) {
                $table->decimal('saldo', 15, 2)->default(0)->after('email');
            }
        });
    }

    public function down() {
        Schema::dropIfExists('layanan');
        Schema::dropIfExists('kelompok');
    }
};
