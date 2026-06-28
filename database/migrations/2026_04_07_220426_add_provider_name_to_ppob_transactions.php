<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('ppob_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('ppob_transactions', 'provider_name')) {
                $table->string('provider_name')->nullable()->after('product_code');
            }
        });
    }
    public function down() {}
};
