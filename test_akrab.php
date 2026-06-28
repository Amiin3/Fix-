<?php
$msisdn = '6281916526445';
$service = app(\App\Services\AkrabApiService::class);

echo "\n\033[1;33m MENGUJI KONEKSI SERVER XL VIA SERVICE ORIGINAL... \033[0m\n";
echo " MSISDN : " . $msisdn . "\n\n";

$response = $service->getMemberInfo($msisdn);

echo "\033[1;35m[RAW DATA RESPOND]:\033[0m\n";
print_r($response);
echo "\n\033[1;34m==================================================\033[0m\n";
