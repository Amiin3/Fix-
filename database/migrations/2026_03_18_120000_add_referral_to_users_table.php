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
                $table->string('kode_referral')->nullable()->unique();
            }
            if (!Schema::hasColumn('users', 'upline_id')) {
                $table->unsignedBigInteger('upline_id')->nullable();
            }
            if (!Schema::hasColumn('users', 'referral_id')) {
                $table->unsignedBigInteger('referral_id')->nullable();
            }
            if (!Schema::hasColumn('users', 'markup')) {
                $table->integer('markup')->default(0);
            }
        });
    }
};
