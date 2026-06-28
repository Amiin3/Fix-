<?php
$file = 'resources/js/Pages/Order/PreOrderXla.jsx';
$content = file_get_contents($file);

// Kita ganti fungsi post-nya agar menembak ke rute yang benar-benar kebal begal
$content = preg_replace("/post\(route\('[^']+'\)/", "post(route('war.xla.store')", $content);

file_put_contents($file, $content);
echo "✔️ Rute React Berhasil Dikunci!\n";
