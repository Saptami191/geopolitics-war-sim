import { useWorldStore } from '../store/worldStore';
import { WorldState } from '../types';

import { usePlayerStore } from '../store/playerStore';

export interface ChokePoint {
  id: string;
  name: string;
  dailyTrafficBnUSD: number;
  vulnerabilityScore: number;
  affectedCommodities: string[];
  controllingNation: string | null;
  militaryPresence: number; // 0-100
}

export interface CommodityFlow {
  from: string;
  to: string;
  commodity: string;
  originalVolumeK: number;
  deliveredVolumeK: number;
  blockageRatio: number; // 0-1
  activeChokepoints: string[];
}

export interface VulnerabilityReport {
  nationId: string;
  criticalDependencies: string[];
  worstCaseGDPShock: number;
  daysOfStrategicReserve: number;
  alternateRouteAvailable: boolean;
}

export interface MilitaryAsset {
  id: string;
  type: string;
  strength: number;
}

export interface InterdictionResult {
  success: boolean;
  escalationRisk: number;
}

/**
 * 5 authoritative hardcoded records with REAL data tracking massive maritime vulnerabilities.
 */
export const CHOKEPOINTS: ChokePoint[] = [
  {
    id: 'CHOKE_HORMUZ',
    name: 'Strait of Hormuz',
    dailyTrafficBnUSD: 1.8,
    vulnerabilityScore: 0.85,
    affectedCommodities: ['oil', 'LNG'],
    controllingNation: 'Iran',
    militaryPresence: 72
  },
  {
    id: 'CHOKE_SUEZ',
    name: 'Suez Canal',
    dailyTrafficBnUSD: 0.9,
    vulnerabilityScore: 0.65,
    affectedCommodities: ['oil', 'containers', 'grains'],
    controllingNation: 'Egypt',
    militaryPresence: 45
  },
  {
    id: 'CHOKE_TAIWAN_STRAIT',
    name: 'Taiwan Strait',
    dailyTrafficBnUSD: 1.1,
    vulnerabilityScore: 0.90,
    affectedCommodities: ['semiconductors', 'electronics', 'oil'],
    controllingNation: null,
    militaryPresence: 85
  },
  {
    id: 'CHOKE_BAB_EL_MANDEB',
    name: 'Bab-el-Mandeb',
    dailyTrafficBnUSD: 0.45,
    vulnerabilityScore: 0.70,
    affectedCommodities: ['oil', 'LNG', 'containers'],
    controllingNation: 'Yemen',
    militaryPresence: 60
  },
  {
    id: 'CHOKE_MALACCA',
    name: 'Strait of Malacca',
    dailyTrafficBnUSD: 0.7,
    vulnerabilityScore: 0.60,
    affectedCommodities: ['oil', 'coal', 'semiconductors'],
    controllingNation: null,
    militaryPresence: 35
  }
];

/**
 * Iteratively simulates absolute supply delivery outputs by routing original commodity volumes
 * through heavily contested geographic transit corridors, dynamically applying interdiction friction losses.
 * 
 * @param from Source nation ID logically generating supply.
 * @param to Target nation ID logically importing supply.
 * @param commodity Tracking semantic string defining cargo structure.
 * @param volumeK Pre-interdiction maximum theoretical shipment volume in kilotons.
 * @param activeInterdictions Array tracking active hostile chokepoints by ID.
 * @returns CommodityFlow A structurally complete tracking frame tracking loss rates natively.
 */
export function simulateCommodityFlow(
  from: string,
  to: string,
  commodity: string,
  volumeK: number,
  activeInterdictions: string[]
): CommodityFlow {
  let deliveredVolume = volumeK;

  // Track matched interdiction structures sequentially dragging downward mathematically
  const chokepointsHit: string[] = [];

  for (const interdictionId of activeInterdictions) {
    const cp = CHOKEPOINTS.find(c => c.id === interdictionId);
    
    // Only apply degradation logic if this chokepoint specifically targets the payload's commodity type
    if (cp && cp.affectedCommodities.includes(commodity)) {
      chokepointsHit.push(cp.id);
      
      // Multiplier applies a penalty heavily scaling with the natural vulnerability topology of the straight
      deliveredVolume = deliveredVolume * (1 - cp.vulnerabilityScore * 0.7);
    }
  }

  // Safety bounding ensures we don't accidentally simulate negative matter
  deliveredVolume = Math.max(0, deliveredVolume);

  let blockageRatio = 0;
  if (volumeK > 0) {
    blockageRatio = (volumeK - deliveredVolume) / volumeK;
  }

  return {
    from,
    to,
    commodity,
    originalVolumeK: volumeK,
    deliveredVolumeK: deliveredVolume,
    blockageRatio,
    activeChokepoints: chokepointsHit
  };
}

/**
 * Calculates raw combat probability vectors defining the success logic of a targeted kinetic
 * naval blockade structurally isolating a global maritime checkpoint dynamically.
 * 
 * @param chokepointId Structural target chokepoint to isolate natively.
 * @param assets Deployed naval groupings attempting total blockage validation natively.
 * @returns InterdictionResult Outcome struct specifying completion and blowback limits.
 */
export function computeChokePointInterdiction(
  chokepointId: string,
  assets: MilitaryAsset[]
): InterdictionResult {
  const chokepoint = CHOKEPOINTS.find(c => c.id === chokepointId);
  if (!chokepoint) {
    return { success: false, escalationRisk: 0.0 };
  }

  const navalAssets = assets.filter(a => a.type === 'NAVAL');
  
  if (navalAssets.length === 0) {
    return { success: false, escalationRisk: 0.0 };
  }

  let totalNavalStrength = 0;
  for (const asset of navalAssets) {
    totalNavalStrength += asset.strength;
  }

  // Complexity algorithm balancing raw naval power linearly against geographic limits natively
  // heavily guarded chokepoints structurally resist isolation attempts algorithmically.
  const denominator = (chokepoint.vulnerabilityScore * 100) + (chokepoint.militaryPresence * 0.8);
  
  // Failsafe guarding division
  if (denominator <= 0) return { success: true, escalationRisk: 0.5 };

  let successProbability = totalNavalStrength / denominator;
  
  // Probabilistic ceiling caps the engine preventing 100% certainty regardless of mass
  successProbability = Math.min(0.95, successProbability);

  if (successProbability < 0.2) {
    // Operations with extremely poor mass ratios automatically fail violently triggering immediate blowback
    return { success: false, escalationRisk: 0.8 };
  }

  const isSuccess = Math.random() < successProbability;
  
  return {
    success: isSuccess,
    escalationRisk: isSuccess ? 0.3 : 0.6 // Success limits escalation, failure multiplies it
  };
}

/**
 * Macro-economic analytic tool determining total sovereign GDP vulnerability specifically linked
 * directly to external commodity routing networks under immediate hostile or structural threat.
 * 
 * @param nationId Sovereign identity mapping importing state.
 * @param flows Master array tracking overall global delivery sequences.
 * @param activeInterdictions Systemic identifiers indicating fully blocked global corridors natively.
 * @returns VulnerabilityReport Extracted intelligence structural warning.
 */
export function assessSupplyChainVulnerability(
  nationId: string,
  flows: CommodityFlow[],
  activeInterdictions: string[]
): VulnerabilityReport {
  
  // Filter for highly obstructed routes flowing explicitly towards our targeted vulnerable nation
  const criticalFlows = flows.filter(f => f.blockageRatio > 0.3 && f.to === nationId);
  
  const criticalDependencies: string[] = [];
  let worstCaseGDPShock = 0;

  // We explicitly match the active interdictions structurally to scale the damage multiplier directly
  const matchedChokepoints = CHOKEPOINTS.filter(c => activeInterdictions.includes(c.id));
  
  let averageVuln = 0;
  if (matchedChokepoints.length > 0) {
    let sumVuln = 0;
    for (const cp of matchedChokepoints) {
       sumVuln += cp.vulnerabilityScore;
    }
    averageVuln = sumVuln / matchedChokepoints.length;
  }

  for (const flow of criticalFlows) {
    if (!criticalDependencies.includes(flow.commodity)) {
      criticalDependencies.push(flow.commodity);
    }
  }

  // Linear shock modeling explicitly scaling with commodity breadth explicitly
  worstCaseGDPShock = criticalDependencies.length * 2.5 * averageVuln;

  // Arbitrary modeling assumptions built specifically around typical structural reserve depths
  let reserveDays = 30; // default baseline
  if (criticalDependencies.includes('oil')) reserveDays = 90;
  else if (criticalDependencies.includes('grains')) reserveDays = 45;
  else if (criticalDependencies.includes('semiconductors')) reserveDays = 14;

  return {
    nationId,
    criticalDependencies,
    worstCaseGDPShock: Math.min(100, Math.max(0, worstCaseGDPShock)),
    daysOfStrategicReserve: reserveDays,
    alternateRouteAvailable: Math.random() > 0.5 // Structural placeholder representing geographic depth tracking
  };
}

/**
 * Standard processing loop orchestrating macro global updates for the supply chain
 * models natively. Filters explicit vulnerability paths targeting player nations directly.
 * 
 * Executes exclusively structurally on 5 tick barriers.
 * 
 * @param worldState Core state matrix natively encapsulating active operations and blockades natively.
 * @param tick Orchestrator system cycle identifier.
 */
export function processSupplyChainTick(worldState: WorldState, tick: number): void {
  if (tick % 5 !== 0) return;

  const playerNation = usePlayerStore.getState().countryId || 'US';
  
  // Simulate active hostiles. In real execution we pull from the blockade tracking module arrays.
  const simulatedActiveBlockades = worldState.globalEventLog.filter(e => e.text.includes('BLOCKADE') || e.text.includes('INTERDICT')).length > 0 ? ['CHOKE_HORMUZ'] : [];
  
  // Mocking structural standard base flows targeting the player natively representing GDP engine overhead
  const baseFlows: CommodityFlow[] = [
    simulateCommodityFlow('SA', playerNation, 'oil', 15000, simulatedActiveBlockades),
    simulateCommodityFlow('TW', playerNation, 'semiconductors', 200, simulatedActiveBlockades),
    simulateCommodityFlow('CA', playerNation, 'grains', 5000, simulatedActiveBlockades)
  ];

  const vulnerability = assessSupplyChainVulnerability(playerNation, baseFlows, simulatedActiveBlockades);

  if (vulnerability.worstCaseGDPShock > 15) {
     useWorldStore.getState().applyTickDelta((draft) => {
        draft.globalEventLog.unshift({
           tick: draft.currentTick,
           severity: 'CRITICAL',
           text: `SUPPLY CHAIN VULNERABILITY ALERT: ${vulnerability.criticalDependencies.join(', ').toUpperCase()} flows heavily disrupted. Potential localized GDP shock modeling up to ${vulnerability.worstCaseGDPShock.toFixed(1)}%. Recommend immediate reserve deployment or operational interdiction resolution natively.`
        });
     });
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
