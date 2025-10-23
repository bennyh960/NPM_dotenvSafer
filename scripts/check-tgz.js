import fs from 'fs';
import path from 'path';

// Read package.json manually
const pkgPath = path.resolve('./package.json'); // adjust if needed
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const { name, version } = pkg;

const tgzName = `${name}-${version}.tgz`;
if (!fs.existsSync(tgzName)) {
  console.error(`Error: Tarball ${tgzName} not found! Did you forget to run npm auto:pack or test locally?`);
  process.exit(1);
}

console.log(`Found tarball: ${tgzName}. Safe to deploy.`);
