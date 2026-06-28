<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'kode_referral')) {
                $table->string('kode_referral', 20)->unique()->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'uplink_id')) {
                $table->unsignedBigInteger('uplink_id')->nullable()->after('kode_referral');
            }
            if (!Schema::hasColumn('users', 'komisi')) {
                $table->decimal('komisi', 15, 2)->default(0)->after('uplink_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kode_referral', 'uplink_id', 'komisi']);
        });
    }
};
