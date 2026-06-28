<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('payment_configs', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // qris_static, seabank_no, seabank_name, jago_no, jago_name
            $table->text('value')->nullable();
            $table->timestamps();
        });
        
        // Isi Data Awal (Default)
        DB::table('payment_configs')->insert([
            ['key' => 'qris_static', 'value' => '000201010211...'], 
            ['key' => 'seabank_no', 'value' => '9012345678'],
            ['key' => 'seabank_name', 'value' => 'MILA STORE'],
            ['key' => 'jago_no', 'value' => '1020304050'],
            ['key' => 'jago_name', 'value' => 'MILA STORE'],
        ]);
    }
    public function down() { Schema::dropIfExists('payment_configs'); }
};
