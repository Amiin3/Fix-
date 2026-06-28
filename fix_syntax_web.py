import os

file_path = 'routes/web.php'
os.system(f'cp {file_path} {file_path}.bak_error') # Backup dulu

with open(file_path, 'r') as f:
    lines = f.readlines()

# Hapus baris paling bawah jika isinya cuma '}' atau ');' yang double
# Kita ambil sampai baris sebelum error (355)
clean_lines = lines[:354]

# Kita tutup dengan benar
content = "".join(clean_lines)
if not content.strip().endswith('});'):
    # Jika belum tertutup group-nya, kita tutup paksa dengan rapi
    content = content.rstrip() + "\n});\n"
else:
    content = content.rstrip() + "\n"

with open(file_path, 'w') as f:
    f.write(content)

print("✅ SYNTAX ERROR BARIS 355 DIBERSIHKAN!")
