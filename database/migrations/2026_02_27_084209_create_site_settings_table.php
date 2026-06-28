<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
        
        // Data Default
        DB::table('site_settings')->insert([
            ['key' => 'bank_email', 'value' => 'admin@gmail.com'],
            ['key' => 'bank_password', 'value' => ''],
        ]);
    }
    public function down() { Schema::dropIfExists('site_settings'); }
};
