<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theme_settings', function (Blueprint $table) {
            $table->id();
            // Menyimpan jenis tema: 'color' (Warna/Gradient) atau 'image' (Gambar/GIF)
            $table->string('bg_type')->default('color'); 
            // Menyimpan value-nya: (Class warna tailwind ATAU Link URL Gambar)
            $table->text('bg_value')->nullable(); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_settings');
    }
};
