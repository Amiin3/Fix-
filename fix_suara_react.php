<?php
$file = 'resources/js/Pages/Order/PreOrderXla.jsx';
$content = file_get_contents($file);

// 1. Tambahkan import fungsi SweetAlert dan usePage
if (strpos($content, 'usePage') === false) {
    $content = str_replace(
        "import { Head, useForm } from '@inertiajs/react';", 
        "import { Head, useForm, usePage } from '@inertiajs/react';\nimport Swal from 'sweetalert2';\nimport { useEffect } from 'react';", 
        $content
    );
}

// 2. Buat alarm deteksi error/sukses dari Controller
$alert_code = "
    const { flash, errors: pageErrors } = usePage().props;
    
    useEffect(() => {
        if (flash?.success) Swal.fire({ title: 'Berhasil!', text: flash.success, icon: 'success' });
        if (flash?.error) Swal.fire({ title: 'Gagal', text: flash.error, icon: 'error' });
        if (pageErrors?.error) Swal.fire({ title: 'Oops', text: pageErrors.error, icon: 'error' });
    }, [flash, pageErrors]);
";

// 3. Suntikkan alarm ke dalam fungsi
if (strpos($content, 'Swal.fire') === false) {
    $content = str_replace(
        "const [selectedProduct, setSelectedProduct] = useState(null);", 
        "const [selectedProduct, setSelectedProduct] = useState(null);\n" . $alert_code, 
        $content
    );
    file_put_contents($file, $content);
    echo "✔️ Pita suara berhasil dipasang ke React!\n";
} else {
    echo "⚠️ Pita suara sudah ada sebelumnya.\n";
}
