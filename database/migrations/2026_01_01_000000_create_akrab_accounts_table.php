<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('akrab_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('msisdn')->unique();
            $table->longText('data_member')->nullable();
            $table->timestamp('last_sync')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('akrab_accounts');
    }
};
