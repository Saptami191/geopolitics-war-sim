import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace('export interface DeceptionCampaign {\n  id: string;\n  codename: string;', 'export interface AdversarialDeceptionCampaign {\n  id: string;\n  codename: string;');
content = content.replace('deceptionCampaigns: DeceptionCampaign[];', 'deceptionCampaigns: AdversarialDeceptionCampaign[];');
fs.writeFileSync('src/types.ts', content);

let inf = fs.readFileSync('src/store/influenceStore.ts', 'utf-8');
inf = inf.replace(/DeceptionCampaign/g, 'AdversarialDeceptionCampaign');
fs.writeFileSync('src/store/influenceStore.ts', inf);
console.log('Fixed DeceptionCampaign');
