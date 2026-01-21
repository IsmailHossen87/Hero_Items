#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
    console.log('❌ Please provide module name');
    process.exit(1);
}

const basePath = path.join(process.cwd(), 'src/modules', moduleName);

const files = [
    'interface',
    'controller',
    'model',
    'service',
    'validation',
    'router',
];

if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
}

files.forEach((file) => {
    const filePath = path.join(basePath, `${moduleName}.${file}.ts`);
    fs.writeFileSync(filePath, `// ${moduleName}.${file}.ts\n`);
});

console.log(`✅ Module '${moduleName}' generated`);
