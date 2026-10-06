import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distPath = path.resolve(process.cwd(), 'dist');
const zipOutputFile = path.resolve(process.cwd(), 'public', 'sanctuary-for-aline-web.zip');
const distZipOutputFile = path.resolve(distPath, 'sanctuary-for-aline-web.zip');

console.log('Ensuring dist directory has _redirects...');
fs.writeFileSync(path.join(distPath, '_redirects'), '/* /index.html 200\n');

// Also copy vercel.json into dist for Vercel drag-and-drop
if (fs.existsSync(path.resolve(process.cwd(), 'vercel.json'))) {
  fs.copyFileSync(path.resolve(process.cwd(), 'vercel.json'), path.join(distPath, 'vercel.json'));
}

console.log('Creating zip archive of static bundle...');
// Use python3 zipfile to pack the dist folder contents
const pyScript = `
import zipfile, os

dist_dir = "${distPath}"
output_zip = "${zipOutputFile}"
dist_zip = "${distZipOutputFile}"

def zip_folder(target_zip):
    with zipfile.ZipFile(target_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if file.endswith('.zip') or file.endswith('.cjs') or file.endswith('.map'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, dist_dir)
                z.write(file_path, arcname)

zip_folder(output_zip)
zip_folder(dist_zip)
print("Zip created successfully.")
`;

execSync(`python3 -c '${pyScript.replace(/\n/g, ';')}'`, { stdio: 'inherit' });
console.log('Bundle packaged at public/sanctuary-for-aline-web.zip and dist/sanctuary-for-aline-web.zip');
