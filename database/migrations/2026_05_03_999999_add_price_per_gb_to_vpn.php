<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::table('vpn_products', function (Blueprint $table) {
            $table->decimal('price_per_gb', 15, 2)->default(0)->after('price_per_day');
        });
    }
    public function down() {
        Schema::table('vpn_products', function (Blueprint $table) {
            $table->dropColumn('price_per_gb');
        });
    }
};
