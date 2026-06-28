<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        if (!Schema::hasColumn('ppob_transactions', 'username')) {
            Schema::table('ppob_transactions', function (Blueprint $table) {
                $table->string('username')->nullable()->after('id');
            });
        }
    }
    public function down() {}
};
