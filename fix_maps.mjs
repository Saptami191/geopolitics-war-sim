import fs from 'fs';
import path from 'path';

const panelsDir = path.join(process.cwd(), 'src/components/panels');

const files = fs.readdirSync(panelsDir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(panelsDir, f));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // A regex to automatically wrap something like `someVar.map(` into `(someVar || []).map(` if not already guarded.
  // This is a naive regex but works on most simple variables.
  const regex = /([a-zA-Z0-9_]+((?:\.[a-zA-Z0-9_]+)*))\.map\(/g;
  
  let newContent = content.replace(regex, (match, prefix) => {
    // skip already guarded like `(foo || []).map` or `Object.entries(x).map`
    if (prefix.startsWith('Object.') || prefix.startsWith('Array.')) return match;
    if (prefix === 'tabs') return match;
    if (prefix === 'resolutions') return match; 
    
    return `(${prefix} || []).map(`;
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log(`Replaced maps in ${path.basename(file)}`);
  }
}
