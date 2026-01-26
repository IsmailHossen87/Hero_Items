#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
    console.log('❌ Module name missing');
    console.log('👉 Usage: npm run make:module <moduleName>');
    process.exit(1);
}

// Define the base path for modules
const basePath = path.join(process.cwd(), 'src/app/modules');

// Check if the module already exists (e.g., "user", "car", "auth")
const modulePath = path.join(basePath, moduleName);

// If module already exists, display an error and exit
if (fs.existsSync(modulePath)) {
    console.log(`⚠️ Module "${moduleName}" already exists.`);
    process.exit(1);
}

// If the module doesn't exist, proceed to create the module
fs.mkdirSync(modulePath, { recursive: true });

const files = [
    'interface',
    'controller',
    'service',
    'model',
    'validation',
    'router',
];

// Create necessary files for the new module
files.forEach((file) => {
    const filePath = path.join(modulePath, `${moduleName}.${file}.ts`);
    fs.writeFileSync(filePath, `// ${moduleName}.${file}.ts\n`);
});

console.log(`✅ Module "${moduleName}" created successfully.`);
