<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('deposits', function (Blueprint $table) {
            // Kita tambahkan kolom amount setelah user_id
            if (!Schema::hasColumn('deposits', 'amount')) {
                $table->decimal('amount', 15, 2)->after('user_id')->default(0);
            }
            
            // Memastikan kolom pendukung lainnya ada
            if (!Schema::hasColumn('deposits', 'kode_unik')) {
                $table->integer('kode_unik')->after('amount')->default(0);
            }
            
            if (!Schema::hasColumn('deposits', 'total_bayar')) {
                $table->decimal('total_bayar', 15, 2)->after('kode_unik')->default(0);
            }
        });
    }

    public function down()
    {
        Schema::table('deposits', function (Blueprint $table) {
            $table->dropColumn(['amount', 'kode_unik', 'total_bayar']);
        });
    }
};
