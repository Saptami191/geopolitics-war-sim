import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');
const lines = content.split('\n');

const newLines = lines.filter((line, i) => {
  const lineNum = i + 1;
  if ([4957, 5463, 6530, 7052].includes(lineNum)) return false;
  return true;
});

content = newLines.join('\n');
content = content.replace("from '../store/defconStore'", "from './store/defconStore'");

fs.writeFileSync('src/types.ts', content);

console.log('Fixed types.ts');
