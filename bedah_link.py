import os
import re

file_path = 'resources/js/Layouts/AuthenticatedLayout.jsx'
os.system(f'cp {file_path} {file_path}.bak2')

with open(file_path, 'r') as f:
    content = f.read()

# 1. Tambah Import jika belum ada
if 'NotificationBadge' not in content:
    content = re.sub(r'(import .*?;?\n)(?!import)', r'\1import NotificationBadge from "@/Components/NotificationBadge";\n', content, count=1)

# 2. Ganti ikon lonceng statis dengan link badge kita
target_atas = '<i className="fa-solid fa-bell text-xl animate-wiggle"></i>'
if target_atas in content:
    content = content.replace(target_atas, '<NotificationBadge />')

with open(file_path, 'w') as f:
    f.write(content)
print("✅ Lonceng Atas Berhasil Diupdate menjadi Link Halaman Notifikasi!")
