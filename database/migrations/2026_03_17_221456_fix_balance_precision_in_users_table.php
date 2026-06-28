<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('saldo', 16, 2)->default(0)->change();
        });
        Schema::table('layanan', function (Blueprint $table) {
            $table->decimal('harga_jual', 16, 2)->default(0)->change();
        });
    }
};
