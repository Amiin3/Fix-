<?php
$file = 'resources/js/Pages/Order/PreOrderXla.jsx';
$content = file_get_contents($file);

// Tambahkan listener untuk Flash Messages
if (strpos($content, 'Swal') === false) {
    $script = "\n  import Swal from 'sweetalert2';\n  import { useEffect } from 'react';\n";
    $content = preg_replace('/import/', $script, $content, 1);
}

$alert_code = "
  const { flash, errors } = usePage().props;
  useEffect(() => {
    if (flash?.success) Swal.fire('Berhasil!', flash.success, 'success');
    if (flash?.error || errors?.error) Swal.fire('Gagal', flash?.error || errors?.error, 'error');
  }, [flash, errors]);
";

if (strpos($content, 'useEffect') === false) {
    $content = str_replace('const page = usePage();', "const page = usePage();\n$alert_code", $content);
    file_put_contents($file, $content);
}
