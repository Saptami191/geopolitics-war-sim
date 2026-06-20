import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace(/Record<string, OldEliteFaction\[\]>/g, 'Record<string, EliteFaction[]>');
content = content.replace("export interface OldEliteFaction {\n  id: string;", "export interface NationEliteFaction {\n  id: string;");
fs.writeFileSync('src/types.ts', content);

let sig = fs.readFileSync('src/store/sigintStore.ts', 'utf-8');
sig = sig.replace(/'LIVE'/g, "'BREAKING'");
fs.writeFileSync('src/store/sigintStore.ts', sig);

let op = fs.readFileSync('src/store/operativeStore.ts', 'utf-8');
op = op.replace(/op\.currentLocationId/g, 'op.regionOfOperation');
fs.writeFileSync('src/store/operativeStore.ts', op);

console.log('Fixed fix9 issues');
