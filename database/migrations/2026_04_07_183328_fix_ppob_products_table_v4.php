<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('ppob_products', function (Blueprint $table) {
            if (!Schema::hasColumn('ppob_products', 'description')) {
                $table->text('description')->nullable()->after('product_name');
            }
            if (!Schema::hasColumn('ppob_products', 'category')) {
                $table->string('category')->nullable()->after('provider_name');
            }
        });
    }
    public function down() { }
};
