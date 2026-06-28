<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('badge')->nullable();
            $table->string('theme')->default('indigo'); // Pilihan: indigo, rose, emerald, sky
            $table->string('icon')->default('fa-bolt');
            $table->string('url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('promos');
    }
};
