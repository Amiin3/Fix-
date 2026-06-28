<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('ppob_products', function (Blueprint $table) {
            $table->text('description')->nullable()->after('product_name');
        });
    }
    public function down() {
        Schema::table('ppob_products', function (Blueprint $table) { $table->dropColumn('description'); });
    }
};
