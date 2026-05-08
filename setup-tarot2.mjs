import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagePath = path.join(__dirname, 'node_modules', 'tarot-card-img');
console.log('Contents of node_modules/tarot-card-img:', fs.readdirSync(packagePath));

try {
  console.log(execSync(`find ${packagePath} -name "*.jpg"`).toString());
} catch(e) {
  console.error(e);
}
