import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [, , distDir, basePath] = process.argv;

if (!distDir) {
  console.error('Usage: node scripts/rewrite-web-output.mjs <distDir> [basePath]');
  process.exit(1);
}

const prefix = (basePath || '').replace(/\/+$/, '');

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    }
    else {
      results.push(full);
    }
  }
  return results;
}

const files = walk(distDir).filter(file => /\.(html|js|css)$/.test(file));

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  if (prefix) {
    content = content
      .replace(/(?<![\w/])\/_expo\//g, `${prefix}/_expo/`)
      .replace(/(?<![\w/])\/assets\//g, `${prefix}/assets/`)
      .replace(/(?<![\w/])\/favicon\.ico/g, `${prefix}/favicon.ico`);
  }
  if (file.endsWith('.html')) {
    writeFileSync(join(distDir, '404.html'), content);
  }
  writeFileSync(file, content);
}

console.log(`Rewrote ${files.length} files with base path '${prefix || '(root)'}'`);
