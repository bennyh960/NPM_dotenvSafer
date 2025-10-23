// scripts/deploy-local.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1️⃣ Read package.json to get name and version
const pkgPath = path.resolve('./package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const { name, version } = pkg;

// 2️⃣ Run npm pack to generate .tgz
console.log('Packing the npm package...');
const tarballName = `${name}-${version}.tgz`;
execSync('npm pack', { stdio: 'inherit' });

// 3️⃣ Verify the tarball exists
const tarballPath = path.resolve(tarballName);
if (!fs.existsSync(tarballPath)) {
  console.error(`❌ Tarball ${tarballName} not found!`);
  process.exit(1);
}

// 4️⃣ Install the tarball locally in the current project (or your testing project)
console.log(`Installing ${tarballName} locally...`);
execSync(`npm install ${tarballPath} --no-save`, { stdio: 'inherit' });

console.log(`✅ ${tarballName} installed locally. You can now test your package.`);
