<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('vpn_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('protocol')->unique(); // vmess, vless, trojan, ssh, zivpn
            $table->decimal('price_per_day', 15, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('vpn_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('order_id')->unique();
            $table->string('protocol');
            $table->string('vpn_username');
            $table->integer('duration'); // in days
            $table->decimal('total_price', 15, 2);
            $table->string('status'); // success, failed
            $table->text('api_response')->nullable();
            $table->text('formatted_output')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('vpn_transactions');
        Schema::dropIfExists('vpn_products');
    }
};
