<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        Schema::create('reseller_discounts', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->unique(); // khfy, adam, kaje
            $table->decimal('potongan', 15, 2)->default(0);
            $table->timestamps();
        });

        // Insert data awal biar nggak kosong
        DB::table('reseller_discounts')->insert([
            ['provider' => 'khfy', 'potongan' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['provider' => 'adam', 'potongan' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['provider' => 'kaje', 'potongan' => 0, 'created_at' => now(), 'updated_at' => now()]
        ]);
    }
    public function down() {
        Schema::dropIfExists('reseller_discounts');
    }
};
