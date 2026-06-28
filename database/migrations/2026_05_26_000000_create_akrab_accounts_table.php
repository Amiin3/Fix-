<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('akrab_accounts', function (Blueprint $blue) {
            $blue->id();
            $blue->string('phone')->unique();
            $blue->decimal('parent_balance', 15, 2)->default(0);
            $blue->decimal('quota_remaining', 8, 2)->default(0);
            $blue->decimal('quota_total', 8, 2)->default(0);
            $blue->date('package_expiry')->nullable();
            $blue->json('slots_data')->nullable();
            $blue->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('akrab_accounts');
    }
};
