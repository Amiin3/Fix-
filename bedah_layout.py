import os
import re

file_path = 'resources/js/Layouts/AuthenticatedLayout.jsx'

# 1. Bikin Backup dulu
os.system(f'cp {file_path} {file_path}.bak')

with open(file_path, 'r') as f:
    content = f.read()

# 2. Tambahkan Import jika belum ada
if 'NotificationBell' not in content:
    # Cari import terakhir, lalu selipkan di bawahnya
    content = re.sub(r'(import .*?;?\n)(?!import)', r'\1import NotificationBell from "@/Components/NotificationBell";\n', content, count=1)

# 3. Ganti ikon lonceng statis dengan komponen cerdas kita
target = '<i className="fa-solid fa-bell text-xl animate-wiggle"></i>'
if target in content:
    content = content.replace(target, '<NotificationBell />')
    with open(file_path, 'w') as f:
        f.write(content)
    print("\n✅ OPERASI SUKSES! Lonceng berhasil disuntik tanpa merusak layout.")
else:
    print("\n⚠️ TARGET TIDAK DITEMUKAN. Tapi tenang, file Anda aman. Lonceng mungkin sudah diganti atau formatnya berbeda.")

