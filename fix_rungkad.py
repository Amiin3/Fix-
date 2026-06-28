file_path = 'resources/js/Pages/Profile/Index.jsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

# 1. Buang kodingan yang nyasar di parameter
clean_lines = []
for line in lines:
    if 'const [isCsOpen, setIsCsOpen] = useState(false);' not in line:
        clean_lines.append(line)

content = "".join(clean_lines)

# 2. Taruh di tempat yang benar (di dalam function body, tepat setelah 'auth')
target = 'const { user } = auth;'
replacement = 'const { user } = auth;\n    const [isCsOpen, setIsCsOpen] = useState(false);'
content = content.replace(target, replacement)

with open(file_path, 'w') as f:
    f.write(content)

print("✅ KODINGAN RUNGKAD SUDAH DIBENARKAN SULTAN!")
