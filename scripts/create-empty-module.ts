#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

function createModule(name: string) {
  if (!name) {
    console.error('Please provide a module name.');
    process.exit(1);
  }

  const basePath = path.join(process.cwd(), 'src', 'modules', name);

  if (fs.existsSync(basePath)) {
    console.log(`Module "${name}" already exists.`);
    return;
  }

  fs.mkdirSync(basePath, { recursive: true });

  const files = [
    `${name}.controller.ts`,
    `${name}.interface.ts`,
    `${name}.model.ts`,
    `${name}.service.ts`,
    `${name}.validate.ts`,
    `index.ts`,
  ];

  files.forEach((file) => {
    fs.writeFileSync(path.join(basePath, file), '');
  });

  const indexContent = `
import * as ${name}Controller from './${name}.controller';
import * as ${name}Validation from './${name}.validate';
import * as ${name}Service from './${name}.service';
import  ${name}Model from './${name}.model';
import * as ${name}Interface from './${name}.interface';

export {
  ${name}Controller,
  ${name}Validation,
  ${name}Service,
  ${name}Model,
  ${name}Interface,
};
`.trim();

  fs.writeFileSync(path.join(basePath, 'index.ts'), indexContent);

  console.log(`Module "${name}" created successfully.`);
}

// CLI args
const [, , type, name] = process.argv;

if (type === 'module') {
  createModule(name);
} else {
  console.log('Usage: npm run generate module <name>');
}
