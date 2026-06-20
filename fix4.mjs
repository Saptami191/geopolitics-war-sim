import fs from 'fs';

let types = fs.readFileSync('src/types.ts', 'utf-8');

// Fix CommodityType
types = types.replace(
  "export type CommodityType = 'OIL' | 'NATURAL_GAS' | 'WHEAT' | 'RARE_EARTH' | 'SILICON' | 'WEAPONS_GRADE_URANIUM' | 'ARMS';",
  "export type CommodityType = 'OIL' | 'NATURAL_GAS' | 'WHEAT' | 'RARE_EARTH' | 'SILICON' | 'WEAPONS_GRADE_URANIUM' | 'ARMS' | 'oil' | 'gas' | 'semiconductors' | 'food' | 'rareearths' | 'strategic';"
);
types = types.replace("export type CommodityType = 'oil' | 'gas' | 'semiconductors' | 'food' | 'rareearths' | 'strategic';\n", "");

// eliteFactions issue at 6089
// Property 'eliteFactions' must be of type 'Record<string, EliteFaction[]>', but here has type 'EliteFaction[]'.
types = types.replace(/eliteFactions: EliteFaction\[\];/g, "eliteFactions: Record<string, EliteFaction[]>;");

fs.writeFileSync('src/types.ts', types);

// Fix sigintStore.ts
let sigint = fs.readFileSync('src/store/sigintStore.ts', 'utf-8');
sigint = sigint.replace('newObs.corroboratedBy.push(recent[0].id);', 'newObs.corroboratedBy.push(Number(recent[0].id) || 1);');
sigint = sigint.replace('recent[0].corroboratedBy.push(newObs.id);', 'recent[0].corroboratedBy.push(Number(newObs.id) || 1);');
fs.writeFileSync('src/store/sigintStore.ts', sigint);

// Fix nuclearStore.ts
let nuc = fs.readFileSync('src/store/nuclearStore.ts', 'utf-8');
// activeCollectionCampaigns -> campaigns
nuc = nuc.replace(/activeCollectionCampaigns/g, 'campaigns');
fs.writeFileSync('src/store/nuclearStore.ts', nuc);

// Fix operativeStore.ts
let op = fs.readFileSync('src/store/operativeStore.ts', 'utf-8');
op = op.replace(/op\.location/g, 'op.currentLocationId');
fs.writeFileSync('src/store/operativeStore.ts', op);

console.log('Fixed multiple errors');
