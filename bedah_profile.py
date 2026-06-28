import os
import re

file_path = 'resources/js/Pages/Profile/Index.jsx'
os.system(f'cp {file_path} {file_path}.bak_profile')

with open(file_path, 'r') as f:
    content = f.read()

# 1. Tambah Import CsMenu jika belum ada
if 'CsMenu' not in content:
    content = re.sub(r'(import .*?;?\n)(?!import)', r'\1import CsMenu from "@/Components/CsMenu";\n', content, count=1)

# 2. Tambah state isCsOpen di dalam fungsi utama (kita selipkan di atas state lain atau hook)
if 'isCsOpen' not in content:
    # Cari letak deklarasi function komponen (misal: export default function Index() { )
    content = re.sub(r'(export default function[^{]+\{)', r'\1\n    const [isCsOpen, setIsCsOpen] = useState(false);\n', content, count=1)
    
    # Kalau lupa import useState, tambahkan sekalian
    if 'useState' not in content:
        content = re.sub(r'import React', r'import React, { useState }', content, count=1)

# 3. Ganti tombol "Hubungi CS" supaya onClick-nya manggil setIsCsOpen(true)
target_button = r'<a href="#" onClick=\{handleComingSoon\} className="(flex items-center justify-between p-4 hover:bg-slate-50 transition-colors no-underline)">([^<]*)<div className="flex items-center gap-3">([^<]*)<div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-lg"><i className="fa-solid fa-headset"></i></div>([^<]*)<span className="font-bold text-slate-700 text-sm">Hubungi Customer Service</span>([^<]*)</div>([^<]*)<i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>([^<]*)</a>'

replacement = r'''<button onClick={() => setIsCsOpen(true)} className="\1 w-full text-left">\2<div className="flex items-center gap-3">\3<div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-lg"><i className="fa-solid fa-headset"></i></div>\4<span className="font-bold text-slate-700 text-sm">Hubungi Customer Service</span>\5</div>\6<i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>\7</button>'''

content = re.sub(target_button, replacement, content, flags=re.DOTALL)

# 4. Taruh komponen CsMenu sebelum div penutup utama / footer
# Biasanya sebelum {/* BOTTOM NAVIGATION FIXED */}
if '<CsMenu' not in content:
    content = content.replace('{/* BOTTOM NAVIGATION FIXED */}', '<CsMenu isOpen={isCsOpen} onClose={() => setIsCsOpen(false)} />\n            {/* BOTTOM NAVIGATION FIXED */}')

with open(file_path, 'w') as f:
    f.write(content)

print("✅ TOMBOL CS DI MENU PROFIL BERHASIL DI-UPGRADE JADI VVIP SULTAN!")
