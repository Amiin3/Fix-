<?php
// Gunakan Schema builder bawaan Laravel
$kolomPengelola = \Illuminate\Support\Facades\Schema::getColumnListing('akrab_pengelola');
$kolomSlots = \Illuminate\Support\Facades\Schema::getColumnListing('akrab_slots');

echo "\n\033[1;36m==================================================\033[0m\n";
echo "\033[1;33m       STRUKTUR TABEL AKRAB PENGELOLA\033[0m\n";
echo "\033[1;36m==================================================\033[0m\n";
foreach ($kolomPengelola as $index => $kolom) {
    echo " " . ($index + 1) . ". " . $kolom . "\n";
}

echo "\n\033[1;36m==================================================\033[0m\n";
echo "\033[1;33m       STRUKTUR TABEL AKRAB SLOTS\033[0m\n";
echo "\033[1;36m==================================================\033[0m\n";
foreach ($kolomSlots as $index => $kolom) {
    echo " " . ($index + 1) . ". " . $kolom . "\n";
}
echo "\n\033[1;36m==================================================\033[0m\n";
