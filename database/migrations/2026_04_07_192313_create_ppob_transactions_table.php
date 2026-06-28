<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('ppob_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('ref_id')->unique();
            $table->string('product_code');
            $table->string('target'); // Nomor HP
            $table->decimal('price', 12, 2);
            $table->string('status')->default('PROSES'); // PROSES, SUKSES, GAGAL
            $table->string('sn')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('ppob_transactions'); }
};
