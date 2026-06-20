import fs from 'fs';
import path from 'path';

const typesDir = 'src/types';
if(fs.existsSync(typesDir)) {
  const files = fs.readdirSync(typesDir);
  let allTypesContent = '';
  for (const file of files) {
    // We remove imports from these files because they might import relative things, but usually types just import from each other or 'types'.
    // Actually if they import from each other, when concatenated, those imports might fail. 
    // We should remove lines starting with `import `? 
    // Wait, let's just append everything. Types don't conflict unless same name.
    let content = fs.readFileSync(path.join(typesDir, file), 'utf-8');
    // regex to remove relative imports like import { x } from './arachne';
    content = content.replace(/import\s+({[^}]+})\s+from\s+['"]\.\/[^'"]+['"];?/g, '');
    allTypesContent += '\n// FROM ' + file + '\n' + content + '\n';
  }

  fs.appendFileSync('src/types.ts', allTypesContent);

  function replaceImports(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if(item === 'types') continue; // don't process the folder we are deleting
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        replaceImports(fullPath);
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        // replace from '../../types/sanctions' to '../../types'
        // replace from '../types/finint' to '../types'
        // replace from './types/blabla' to './types'
        const regex = /from\s+['"]((?:\.\.\/|\.\/)+)types\/[a-zA-Z0-9_-]+['"]/g;
        const replaced = content.replace(regex, 'from \'$1types\'');
        if (replaced !== content) {
          fs.writeFileSync(fullPath, replaced);
        }
      }
    }
  }

  replaceImports('src');
  fs.rmSync(typesDir, { recursive: true, force: true });
}
