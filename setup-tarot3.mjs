import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'node_modules', 'tarot-card-img', 'major');
const destDir = path.join(__dirname, 'public', 'tarot');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

for (let i = 0; i <= 21; i++) {
  const srcName = `${i}m.jpg`;
  const destName = `m${i.toString().padStart(2, '0')}.jpg`;
  
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} to ${destName}`);
  } else {
    console.warn(`File not found: ${srcPath}`);
  }
}

console.log('Tarot setup complete.');
