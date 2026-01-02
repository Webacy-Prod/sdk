#!/usr/bin/env node
/**
 * Script to add .js extensions to relative imports in ESM build output.
 * This is needed because TypeScript with moduleResolution: "bundler" doesn't
 * add extensions, but Node.js ESM requires them.
 *
 * Usage: node fix-esm-imports.mjs <directory>
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync, statSync } from 'fs';

/**
 * Check if a path is a directory (sync)
 */
function isDirectorySync(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory (async)
 */
async function isDirectory(path) {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Resolve the correct extension for an import path
 */
function resolveImportExtension(importPath, fileDir) {
  // Get the full path relative to the file's directory
  const fullPath = join(fileDir, importPath);

  // Check if it's a directory (needs /index.js)
  if (isDirectorySync(fullPath)) {
    return `${importPath}/index.js`;
  }

  // Check if the .js file exists
  if (existsSync(`${fullPath}.js`)) {
    return `${importPath}.js`;
  }

  // Default to .js extension
  return `${importPath}.js`;
}

/**
 * Fix imports in a single file
 */
async function fixFileImports(filePath) {
  let content = await readFile(filePath, 'utf8');
  let modified = false;
  const fileDir = dirname(filePath);

  // Match: from './path' or from "../path" (relative imports without .js)
  // But not: from './path.js' or from '@package/name'
  const importRegex = /(from\s+['"])(\.[^'"]+)(?<!\.js)(['"])/g;

  content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    const resolved = resolveImportExtension(importPath, fileDir);
    if (resolved !== importPath) {
      modified = true;
    }
    return `${prefix}${resolved}${suffix}`;
  });

  // Also fix export statements: export { x } from './path'
  const exportRegex = /(export\s+(?:\{[^}]*\}|\*)\s+from\s+['"])(\.[^'"]+)(?<!\.js)(['"])/g;

  content = content.replace(exportRegex, (match, prefix, importPath, suffix) => {
    const resolved = resolveImportExtension(importPath, fileDir);
    if (resolved !== importPath) {
      modified = true;
    }
    return `${prefix}${resolved}${suffix}`;
  });

  if (modified) {
    await writeFile(filePath, content);
  }

  return modified;
}

/**
 * Recursively process all .js files in a directory
 */
async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      count += await processDirectory(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const modified = await fixFileImports(fullPath);
      if (modified) {
        count++;
      }
    }
  }

  return count;
}

// Main
const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Usage: node fix-esm-imports.mjs <directory>');
  process.exit(1);
}

try {
  const dirExists = await isDirectory(targetDir);
  if (!dirExists) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }

  const count = await processDirectory(targetDir);
  console.log(`Fixed imports in ${count} files in ${targetDir}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
