import re, os

file_path = 'bootstrap/app.php'

if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    if 'EnterpriseWAF::class' not in content:
        # Cari fungsi withMiddleware dan suntikkan WAF di dalamnya
        pattern = r"(->withMiddleware\(function\s*\(Middleware\s*\$middleware\)\s*\{)"
        replacement = r"\1\n        $middleware->append(\App\Http\Middleware\EnterpriseWAF::class);"
        
        new_content = re.sub(pattern, replacement, content, count=1)
        
        with open(file_path, 'w') as f:
            f.write(new_content)
        print("✅ Jantung Firewall (WAF) BERHASIL ditanam ke inti Laravel!")
    else:
        print("⚡ Firewall sudah terpasang!")
else:
    print("❌ File bootstrap/app.php tidak ditemukan.")
