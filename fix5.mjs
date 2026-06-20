import fs from 'fs';

let a2 = fs.readFileSync('src/store/a2adStore.ts', 'utf-8');
a2 = a2.replace(/activeCollectionCampaigns/g, 'campaigns');
fs.writeFileSync('src/store/a2adStore.ts', a2);

let co = fs.readFileSync('src/store/conventionalOpsStore.ts', 'utf-8');
co = co.replace(/activeCollectionCampaigns/g, 'campaigns');
co = co.replace(/"SEA"/g, "'sealane'");
co = co.replace(/"PIPELINE"/g, "'pipeline'");
fs.writeFileSync('src/store/conventionalOpsStore.ts', co);

console.log('Fixed additional stores');
