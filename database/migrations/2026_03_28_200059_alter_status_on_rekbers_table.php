<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up() {
        // 🚀 UBAH KOLOM STATUS JADI TEKS BEBAS BIAR GAK KAKU!
        DB::statement("ALTER TABLE rekbers MODIFY status VARCHAR(50) DEFAULT 'pending'");
    }

    public function down() {
        // Gak perlu dibalikin ke ENUM, biarin aja bebas selamanya
    }
};
