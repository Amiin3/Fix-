<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. 🔥 SAPU BERSIH VARIABEL 'NULL' PALSU
        DB::statement("UPDATE users SET phone = NULL WHERE phone = '' OR phone = 'NULL' OR phone = 'null'");
        DB::statement("UPDATE users SET whatsapp = NULL WHERE whatsapp = '' OR whatsapp = 'NULL' OR whatsapp = 'null'");

        // 2. 🤖 AUTO-SCAN & FIX SEMUA NOMOR KEMBAR (PHONE)
        $phoneDupes = DB::table('users')
            ->select('phone')
            ->whereNotNull('phone')
            ->groupBy('phone')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('phone');

        foreach ($phoneDupes as $val) {
            $ids = DB::table('users')->where('phone', $val)->pluck('id');
            // Biarkan ID pertama tetap asli, sisanya kita kasih label -DUP
            foreach ($ids->skip(1) as $id) {
                DB::table('users')->where('id', $id)->update(['phone' => $val . '-DUP-' . $id]);
            }
        }

        // 3. 🤖 AUTO-SCAN & FIX SEMUA NOMOR KEMBAR (WHATSAPP)
        $waDupes = DB::table('users')
            ->select('whatsapp')
            ->whereNotNull('whatsapp')
            ->groupBy('whatsapp')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('whatsapp');

        foreach ($waDupes as $val) {
            $ids = DB::table('users')->where('whatsapp', $val)->pluck('id');
            foreach ($ids->skip(1) as $id) {
                DB::table('users')->where('id', $id)->update(['whatsapp' => $val . '-DUP-' . $id]);
            }
        }

        // 4. 🔒 PASANG GEMBOK UNIK
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->string('whatsapp')->nullable()->change();
        });

        // Paksa hapus index lama kalau ada yang nyangkut setengah jalan
        try { DB::statement("ALTER TABLE users DROP INDEX users_phone_unique"); } catch (\Exception $e) {}
        try { DB::statement("ALTER TABLE users DROP INDEX users_whatsapp_unique"); } catch (\Exception $e) {}

        DB::statement("ALTER TABLE users ADD UNIQUE INDEX users_phone_unique (phone)");
        DB::statement("ALTER TABLE users ADD UNIQUE INDEX users_whatsapp_unique (whatsapp)");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_phone_unique');
            $table->dropUnique('users_whatsapp_unique');
        });
    }
};
