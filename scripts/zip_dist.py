import zipfile
import os

dist_dir = os.path.join(os.getcwd(), 'dist')
public_dir = os.path.join(os.getcwd(), 'public')
os.makedirs(public_dir, exist_ok=True)

output_zips = [
    os.path.join(public_dir, 'sanctuary-for-aline-web.zip'),
    os.path.join(dist_dir, 'sanctuary-for-aline-web.zip')
]

import shutil

# Ensure redirects for Netlify
with open(os.path.join(dist_dir, '_redirects'), 'w') as f:
    f.write('/* /index.html 200\n')

# Copy vercel.json for Vercel
vercel_path = os.path.join(os.getcwd(), 'vercel.json')
if os.path.exists(vercel_path):
    shutil.copy2(vercel_path, os.path.join(dist_dir, 'vercel.json'))

for target_zip in output_zips:
    with zipfile.ZipFile(target_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if file.endswith('.zip') or file.endswith('.cjs') or file.endswith('.map'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, dist_dir)
                z.write(file_path, arcname)

print("Zip packages generated successfully at:")
for z in output_zips:
    print(f"  - {z} ({os.path.getsize(z)} bytes)")
