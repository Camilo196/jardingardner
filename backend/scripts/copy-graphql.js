const fs = require('fs');
const path = require('path');

const srcPath = path.resolve('src/infrastructure/adapters/inputs/schema.graphql');
const destPath = path.resolve('dist/infrastructure/adapters/inputs/schema.graphql');

if (!fs.existsSync(srcPath)) {
  console.error(`Source file not found: ${srcPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(destPath), { recursive: true });
fs.copyFileSync(srcPath, destPath);
console.log(`Copied ${srcPath} to ${destPath}`);
