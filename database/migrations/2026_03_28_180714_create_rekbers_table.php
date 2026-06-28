<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('rekbers', function (Blueprint $table) {
            $table->id();
            $table->string('trx_id')->unique(); // MS-RK-xxxx
            $table->foreignId('buyer_id')->constrained('users');
            $table->string('seller_name');
            $table->string('seller_whatsapp');
            $table->string('judul_pesanan');
            $table->text('deskripsi_pesanan');
            $table->decimal('nominal', 15, 2);
            $table->decimal('fee', 15, 2);
            $table->decimal('total_bayar', 15, 2);
            $table->enum('fee_payer', ['buyer', 'seller', 'split']);
            $table->enum('status', ['pending', 'secured', 'shipped', 'dispute', 'success', 'canceled'])->default('pending');
            $table->text('bukti_proses')->nullable(); // Link foto/text bukti dari seller
            $table->text('alasan_dispute')->nullable();
            $table->timestamps();
        });

        // Tabel Chat buat Evidence
        Schema::create('rekber_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rekber_id')->constrained('rekbers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->text('message');
            $table->string('attachment')->nullable();
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('rekber_messages');
        Schema::dropIfExists('rekbers');
    }
};
