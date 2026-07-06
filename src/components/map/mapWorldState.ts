import { Country, BallisticStrike, ThreatLevel, HUDMode, Unit } from '../../types';
import { useUnitStore } from '../../store/unitStore';
import { getCentroid } from './countryCentroids';

export interface MapNormalizedCountry {
  id: string;
  name: string;
  centroid: [number, number]; // [lng, lat]
  allianceBlock: string;
  atWar: boolean;
  atWarWith: string[];
  isPlayer: boolean;
  isTarget: boolean;
  threatLevel: ThreatLevel;
  opinions: Record<string, number>;
  
  // Layer-Specific Raw Derived Stats for Color/Size calculations
  gdpB: number;
  unrestPct: number;
  firewallLevel: number;
  nuclearCapable: boolean;
  totalPowerRating: number;
  opinionWithPlayer: number;
}

export interface MapNormalizedStrike {
  id: string;
  sourceId: string;
  targetId: string;
  sourceCentroid: [number, number];
  targetCentroid: [number, number];
  weaponType: string;
  progressPct: number;
  status: 'QUEUED' | 'IN_FLIGHT' | 'INTERCEPTED' | 'IMPACT' | 'FAILED';
  isNuclear: boolean;
  yieldMT: number;
}

export interface MapNormalizedTether {
  id: string;
  sourceId: string;
  targetId: string;
  sourceCentroid: [number, number];
  targetCentroid: [number, number];
  type: 'WAR' | 'TRADE' | 'CYBER_THREAT';
}

export interface CanonicalMapState {
  countries: Record<string, MapNormalizedCountry>;
  activeStrikes: MapNormalizedStrike[];
  activeTethers: MapNormalizedTether[];
  
  playerCountryId: string;
  targetCountryId?: string;
  hoveredCountryId?: string;
  
  globalThreatLevel: ThreatLevel;
  nuclearExchangeOccurred: boolean;
  activeHudMode: HUDMode;
  currentTick: number;
  
  theme: 'dark' | 'light';
  activeLayer: 'political' | 'conflicts' | 'economic' | 'cyber' | 'population' | 'nuclear' | 'military';
  /** Map of unit IDs to unit objects */
  units: Record<string, Unit>;
}

/**
 * Normalizes live store snapshots into a single read-only structure.
 * This completely isolates raw Zustand shapes from rendering logic, making 2D and 3D perfect mirrors.
 */
export function deriveCanonicalMapState(
  countries: Record<string, Country>,
  activeStrikes: BallisticStrike[],
  playerCountryId: string,
  targetCountryId: string | undefined,
  hoveredCountryId: string | undefined,
  globalThreatLevel: ThreatLevel,
  nuclearExchangeOccurred: boolean,
  activeHudMode: HUDMode,
  currentTick: number,
  theme: 'dark' | 'light',
  layers: Record<string, boolean>
): CanonicalMapState {
  
  // 1. Identify which layer is active (only one primary active fill color mapping)
  // 2. Gather units from unitStore
  const unitArray = useUnitStore.getState().units;
  const unitMap: Record<string, Unit> = {};
  unitArray.forEach(u => {
    unitMap[u.id] = u;
  });
  const activeLayer = (Object.keys(layers).find((k) => layers[k] === true) || 'political') as CanonicalMapState['activeLayer'];

  // 2. Map-Normalize Countries
  const mapCountries: Record<string, MapNormalizedCountry> = {};
  Object.entries(countries).forEach(([id, c]) => {
    const centroid = getCentroid(id);
    mapCountries[id] = {
      id,
      name: c.name,
      centroid,
      allianceBlock: c.allianceBlock,
      atWar: c.atWarWith && c.atWarWith.length > 0,
      atWarWith: c.atWarWith || [],
      isPlayer: id === playerCountryId,
      isTarget: id === targetCountryId,
      threatLevel: c.threatLevel,
      opinions: c.opinions || {},
      
      gdpB: c.economic?.gdpB ?? 0,
      unrestPct: c.political?.popularUnrest ?? 0,
      firewallLevel: c.intelligence?.cyberFirewallLevel ?? 1,
      nuclearCapable: c.arsenal?.nuclearCapable ?? false,
      totalPowerRating: c.arsenal?.totalPowerRating ?? 0,
      opinionWithPlayer: c.opinions?.[playerCountryId] ?? 0,
    };
  });

  // 3. Map-Normalize Strikes
  const mapStrikes = activeStrikes.map((s) => {
    const isNuclear = (s.warheadYieldMT && s.warheadYieldMT > 0) || s.weaponType === 'ICBM' || s.weaponType === 'SLBM';
    return {
      id: s.id,
      sourceId: s.sourceCountryId,
      targetId: s.targetCountryId,
      sourceCentroid: getCentroid(s.sourceCountryId),
      targetCentroid: getCentroid(s.targetCountryId),
      weaponType: s.weaponType,
      progressPct: s.progressPct,
      status: s.status,
      isNuclear,
      yieldMT: s.warheadYieldMT ?? 0,
    };
  });

  // 4. Map-Normalize Strategic Tethers
  const activeTethers: MapNormalizedTether[] = [];

  // Generate War Domain Tethers (Conflicts)
  if (layers.conflicts) {
    Object.entries(countries).forEach(([srcId, country]) => {
      if (country.atWarWith) {
        country.atWarWith.forEach((tgtId) => {
          if (srcId < tgtId) { // Prevent duplicates
            const sourceCentroid = getCentroid(srcId);
            const targetCentroid = getCentroid(tgtId);
            if (sourceCentroid[0] !== 0 && targetCentroid[0] !== 0) {
              activeTethers.push({
                id: `war-${srcId}-${tgtId}`,
                sourceId: srcId,
                targetId: tgtId,
                sourceCentroid,
                targetCentroid,
                type: 'WAR',
              });
            }
          }
        });
      }
    });

    // Draw active targeting tether between player and selected target in war room
    if (playerCountryId && targetCountryId) {
      const sourceCentroid = getCentroid(playerCountryId);
      const targetCentroid = getCentroid(targetCountryId);
      if (sourceCentroid[0] !== 0 && targetCentroid[0] !== 0) {
        activeTethers.push({
          id: `target-wire-${playerCountryId}-${targetCountryId}`,
          sourceId: playerCountryId,
          targetId: targetCountryId,
          sourceCentroid,
          targetCentroid,
          type: 'CYBER_THREAT',
        });
      }
    }
  }

  // Generate Trade Pathway Tethers
  if (layers.economic) {
    Object.entries(countries).forEach(([srcId, country]) => {
      if (country.tradePartners) {
        country.tradePartners.forEach((tgtId) => {
          if (srcId < tgtId) {
            const sourceCentroid = getCentroid(srcId);
            const targetCentroid = getCentroid(tgtId);
            if (sourceCentroid[0] !== 0 && targetCentroid[0] !== 0) {
              activeTethers.push({
                id: `trade-${srcId}-${tgtId}`,
                sourceId: srcId,
                targetId: tgtId,
                sourceCentroid,
                targetCentroid,
                type: 'TRADE',
              });
            }
          }
        });
      }
    });
  }

  return {
    countries: mapCountries,
    activeStrikes: mapStrikes,
    activeTethers,
    playerCountryId,
    targetCountryId,
    hoveredCountryId,
    globalThreatLevel,
    nuclearExchangeOccurred,
    activeHudMode,
    currentTick,
    theme,
    activeLayer,
    units: unitMap,
  };
}
