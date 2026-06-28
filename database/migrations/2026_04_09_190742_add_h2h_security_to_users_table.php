<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Ciptakan api_key jika fisiknya memang belum ada di database
            if (!Schema::hasColumn('users', 'api_key')) {
                $table->string('api_key', 100)->nullable()->unique()->after('password');
            }

            // 2. Tambahkan wadah pengaman H2H
            if (!Schema::hasColumn('users', 'ip_whitelist')) {
                $table->string('ip_whitelist')->nullable()->comment('IP Server Reseller (Anti Maling)');
            }
            if (!Schema::hasColumn('users', 'webhook_url')) {
                $table->string('webhook_url')->nullable()->comment('URL Callback Notifikasi Order');
            }
        });

        // 3. Bersihkan & Kunci jika kolomnya ternyata sudah ada dari dulu
        if (Schema::hasColumn('users', 'api_key')) {
            try {
                DB::statement("UPDATE users SET api_key = NULL WHERE api_key = '' OR api_key = 'NULL' OR api_key = 'null'");
                DB::statement("ALTER TABLE users ADD UNIQUE INDEX users_api_key_unique (api_key)");
            } catch (\Exception $e) {
                // Abaikan jika index unik sudah terpasang
            }
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'ip_whitelist')) $table->dropColumn('ip_whitelist');
            if (Schema::hasColumn('users', 'webhook_url')) $table->dropColumn('webhook_url');
        });
    }
};
