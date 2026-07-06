import { ThreatLevel, HUDMode } from '../../types';

export interface RendererFrameCountry {
  id: string;
  name: string;
  centroid: [number, number];
  allianceBlock: string;
  atWar: boolean;
  atWarWith: string[];
  isPlayer: boolean;
  isTarget: boolean;
  threatLevel: ThreatLevel;
  gdpB: number;
  unrestPct: number;
  firewallLevel: number;
  nuclearCapable: boolean;
  totalPowerRating: number;
}

export interface RendererFrameUnit {
  id: string;
  name: string;
  type: string;
  owner: string;
  position: { lat: number; lon: number };
  status: string;
  health: number;
  fuel: number;
}

export interface RendererFrameStrike {
  id: string;
  sourceId: string;
  targetId: string;
  sourceCentroid: [number, number];
  targetCentroid: [number, number];
  weaponType: string;
  progressPct: number;
  status: string;
  isNuclear: boolean;
  yieldMT: number;
}

export interface RendererFrameTether {
  id: string;
  sourceId: string;
  targetId: string;
  sourceCentroid: [number, number];
  targetCentroid: [number, number];
  type: string;
}

export interface RendererFrame {
  version: number;
  tick: number;
  theme: 'dark' | 'light';
  activeLayer: string;
  activeHudMode: HUDMode;
  globalThreatLevel: ThreatLevel;
  nuclearExchangeOccurred: boolean;
  playerCountryId: string;
  targetCountryId?: string;
  countries: Record<string, RendererFrameCountry>;
  units: Record<string, RendererFrameUnit>;
  activeStrikes: RendererFrameStrike[];
  activeTethers: RendererFrameTether[];
}
