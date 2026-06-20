import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');
// At 6075
content = content.replace("export interface RegimePressureState {\n  // Target regime stats\n  legitimacy: number;", "export interface NationRegimePressureState {\n  // Target regime stats\n  legitimacy: number;");
content = content.replace("regimePressure?: RegimePressureState;", "regimePressure?: NationRegimePressureState;");
fs.writeFileSync('src/types.ts', content);

console.log('Fixed RegimePressureState duplicate');
