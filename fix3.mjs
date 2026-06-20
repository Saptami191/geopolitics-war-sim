import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace("export type RouteType = 'port' | 'pipeline' | 'corridor' | 'sealane';", "export type TradeRouteType = 'port' | 'pipeline' | 'corridor' | 'sealane';");
content = content.replace(/type: RouteType;/g, "type: TradeRouteType;");
content = content.replace(/routeType: RouteType;/g, "routeType: TradeRouteType;");
fs.writeFileSync('src/types.ts', content);

let tr = fs.readFileSync('src/store/tradeStore.ts', 'utf-8');
tr = tr.replace(/RouteType/g, 'TradeRouteType');
fs.writeFileSync('src/store/tradeStore.ts', tr);

let matrix = fs.readFileSync('src/components/panels/TradeMatrixPanel.tsx', 'utf-8');
matrix = matrix.replace(/RouteType/g, 'TradeRouteType');
fs.writeFileSync('src/components/panels/TradeMatrixPanel.tsx', matrix);

console.log('Fixed RouteType');
