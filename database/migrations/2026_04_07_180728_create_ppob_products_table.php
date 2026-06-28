<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('ppob_products', function (Blueprint $table) {
            $table->id();
            $table->string('provider_name')->default('ADAMMEDIA');
            $table->string('category')->nullable();
            $table->string('product_name');
            $table->string('product_code')->unique();
            $table->decimal('price_cost', 12, 2)->default(0); 
            $table->decimal('price_sell', 12, 2)->default(0); 
            $table->integer('stock_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('ppob_products'); }
};
