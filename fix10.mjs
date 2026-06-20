import fs from 'fs';
let co = fs.readFileSync('src/store/conventionalOpsStore.ts', 'utf-8');
co = co.replace(/'SEA'/g, "'sealane'");
co = co.replace(/'PIPELINE'/g, "'pipeline'");
fs.writeFileSync('src/store/conventionalOpsStore.ts', co);
console.log('Fixed quotes in conventionalOpsStore');
