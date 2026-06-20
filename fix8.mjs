import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace(
  "export interface EliteFaction {\n  id: string;\n  name: string;\n  alignment: EliteFactionAlignment;\n  power: number; // 0-100\n  loyalty: number; // 0-100\n  grievance: number; // 0-100\n}",
  "export interface OldEliteFaction {\n  id: string;\n  name: string;\n  alignment: EliteFactionAlignment;\n  power: number; // 0-100\n  loyalty: number; // 0-100\n  grievance: number; // 0-100\n}"
);
content = content.replace("eliteFactions: Record<string, EliteFaction[]>;", "eliteFactions: Record<string, OldEliteFaction[]>;");
fs.writeFileSync('src/types.ts', content);

console.log('Fixed EliteFaction duplicate');
