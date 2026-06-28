<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('metode')->unique(); // JAGO, SEABANK, QRIS
            $table->string('nomor');
            $table->string('atas_nama');
            $table->timestamps();
        });

        // Isi data awal (Seed)
        DB::table('payment_settings')->insert([
            ['metode' => 'JAGO', 'nomor' => '1234567890', 'atas_nama' => 'Amifi Store'],
            ['metode' => 'SEABANK', 'nomor' => '0987654321', 'atas_nama' => 'Amifi Store'],
            ['metode' => 'QRIS', 'nomor' => '000102030405', 'atas_nama' => 'Amifi Store'],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('payment_settings');
    }
};
