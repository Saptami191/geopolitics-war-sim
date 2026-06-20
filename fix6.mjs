import fs from 'fs';

let content = fs.readFileSync('src/store/cinematicsStore.ts', 'utf-8');
content = content.replace(
  "export type CinematicSceneType =",
  "export type CinematicSceneType =\n  | 'SIGINT_BREAKTHROUGH'\n  | 'DECEPTION_EXPOSED'\n  | 'COLLECTION_COMPROMISED'\n  | 'PATTERN_OF_LIFE_SHIFT'"
);
fs.writeFileSync('src/store/cinematicsStore.ts', content);

console.log('Fixed cinematicsStore');
