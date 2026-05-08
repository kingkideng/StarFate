import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Installing tarot-card-img...');
execSync('npm install tarot-card-img --no-save', { stdio: 'inherit' });

// Try to find the package path since it might be in different places depending on npm version
let packagePath = '';
try {
  packagePath = path.dirname(new URL(import.meta.resolve('tarot-card-img/package.json')).pathname);
} catch (e) {
  packagePath = path.join(__dirname, 'node_modules', 'tarot-card-img');
}

const srcDir = path.join(packagePath, 'major');
const destDir = path.join(__dirname, 'public', 'tarot');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let foundImages = false;

// Check if major directory exists
if (fs.existsSync(srcDir)) {
	for (let i = 0; i <= 21; i++) {
	  const fileName = `m${i.toString().padStart(2, '0')}.jpg`;
	  const srcPath = path.join(srcDir, fileName);
	  const destPath = path.join(destDir, fileName);

	  if (fs.existsSync(srcPath)) {
		fs.copyFileSync(srcPath, destPath);
		console.log(`Copied ${fileName}`);
		foundImages = true;
	  } else {
		console.warn(`File not found: ${srcPath}`);
	  }
	}
} else {
	console.error(`Source directory not found: ${srcDir}`);
    // Fallback: list all directories in package path to find where images are
    if (fs.existsSync(packagePath)) {
        console.log('Directory contents of tarot-card-img:', fs.readdirSync(packagePath));
    }
}

if (!foundImages && fs.existsSync(packagePath)) {
    console.log('Looking recursively...');
    const execSync = require('child_process').execSync;
    try {
        console.log(execSync(`find ${packagePath} -name "*.jpg"`).toString());
    } catch(e) {}
}

console.log('Tarot setup complete.');
