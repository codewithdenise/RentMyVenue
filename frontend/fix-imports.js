import fs from 'fs';
import path from 'path';

// Helper function to get import type
function getImportType(importPath) {
  if (importPath.startsWith('react')) return 'react';
  if (!importPath.startsWith('.') && !importPath.startsWith('@')) return 'external';
  if (importPath.startsWith('@')) return 'external';
  return 'internal';
}

// Helper function to sort imports
function sortImports(imports) {
  const groups = {
    react: [],
    external: [],
    internal: []
  };

  // Group imports
  imports.forEach(imp => {
    const match = imp.match(/from ['"]([^'"]+)['"]/);
    if (match) {
      const importPath = match[1];
      const type = getImportType(importPath);
      groups[type].push(imp);
    }
  });

  // Sort each group
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => a.localeCompare(b));
  });

  // Combine groups with newlines between
  return [
    ...groups.react,
    groups.react.length > 0 ? '' : null,
    ...groups.external,
    groups.external.length > 0 ? '' : null,
    ...groups.internal
  ].filter(Boolean);
}

// Process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find import section
  const importSection = content.match(/^import[^;]+;(\r?\n\s*import[^;]+;)*\r?\n*/m);
  
  if (!importSection) return;
  
  const imports = importSection[0].split(/\r?\n/).filter(line => line.trim());
  const sortedImports = sortImports(imports);
  
  // Replace import section with sorted imports
  const newContent = content.replace(
    importSection[0],
    sortedImports.join('\n') + '\n\n'
  );
  
  fs.writeFileSync(filePath, newContent);
}

// Walk directory recursively
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.match(/\.(ts|tsx)$/)) {
      processFile(filePath);
    }
  });
}

// Start processing from src directory
walkDir(path.join(process.cwd(), 'src'));
console.log('Import sorting complete');
