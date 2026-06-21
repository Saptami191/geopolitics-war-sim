import { useWorldStore } from '../store/worldStore';
import { WorldState } from '../types';

export interface Commodity {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  priceVolatility: number;
  majorProducers: string[];
  majorConsumers: string[];
  sanctionSensitivity: number;
  strategicReserveMultiplier: number;
}

export interface EconomicDelta {
  gdpImpact: number;
  inflationSpike: number;
  blowback: boolean;
}

/**
 * 7 precise structural definitions anchoring the core global supply-demand
 * market simulator mechanics. Mappings explicitly bind to core resource flows natively.
 */
export const COMMODITY_DEFINITIONS: Commodity[] = [
  {
    id: 'COMM_OIL',
    name: 'oil',
    basePrice: 85,
    currentPrice: 85,
    priceVolatility: 0.18,
    majorProducers: ['SA', 'RU', 'US', 'IR'],
    majorConsumers: ['US', 'CN', 'EU', 'JP', 'IN'],
    sanctionSensitivity: 0.85,
    strategicReserveMultiplier: 1.2
  },
  {
    id: 'COMM_NATGAS',
    name: 'natural_gas',
    basePrice: 3.5,
    currentPrice: 3.5,
    priceVolatility: 0.25,
    majorProducers: ['RU', 'US', 'QA'],
    majorConsumers: ['EU', 'CN', 'JP', 'KR'],
    sanctionSensitivity: 0.75,
    strategicReserveMultiplier: 1.0
  },
  {
    id: 'COMM_COAL',
    name: 'coal',
    basePrice: 180,
    currentPrice: 180,
    priceVolatility: 0.15,
    majorProducers: ['CN', 'AU', 'IN', 'RU'],
    majorConsumers: ['CN', 'IN', 'EU', 'KR'],
    sanctionSensitivity: 0.55,
    strategicReserveMultiplier: 0.8
  },
  {
    id: 'COMM_RARE_EARTH',
    name: 'rare_earths',
    basePrice: 120,
    currentPrice: 120,
    priceVolatility: 0.30,
    majorProducers: ['CN', 'AU'],
    majorConsumers: ['US', 'EU', 'JP', 'KR'],
    sanctionSensitivity: 0.95,
    strategicReserveMultiplier: 1.5
  },
  {
    id: 'COMM_SEMI',
    name: 'semiconductors',
    basePrice: 450,
    currentPrice: 450,
    priceVolatility: 0.35,
    majorProducers: ['TW', 'KR', 'US'],
    majorConsumers: ['CN', 'US', 'EU', 'JP'],
    sanctionSensitivity: 0.90,
    strategicReserveMultiplier: 1.8
  },
  {
    id: 'COMM_WHEAT',
    name: 'wheat',
    basePrice: 220,
    currentPrice: 220,
    priceVolatility: 0.20,
    majorProducers: ['RU', 'UA', 'US', 'AU'],
    majorConsumers: ['EG', 'TR', 'ID', 'BD'],
    sanctionSensitivity: 0.60,
    strategicReserveMultiplier: 1.1
  },
  {
    id: 'COMM_WATER',
    name: 'water',
    basePrice: 0.5,
    currentPrice: 0.5,
    priceVolatility: 0.05,
    majorProducers: ['BR', 'CA', 'CN', 'RU'],
    majorConsumers: ['IN', 'CN', 'US', 'PK'],
    sanctionSensitivity: 0.20,
    strategicReserveMultiplier: 1.0
  }
];

/**
 * Executes high-frequency scalar shifts against baseline equilibrium points
 * structurally simulating volatile global commodity pricing mechanics driven natively by events.
 * 
 * Formula: P = Base * (1+SShock) * (1+DShock) * (1+SpecPressure) * (RandomVolatilityDrift)
 * 
 * @param commodity The structural target definition tracking natively.
 * @param supplyShock Multiplier determining instantaneous restriction (-0.2 is -20%).
 * @param demandShock Multiplier determining instantaneous overhead (0.5 is massive wartime boom).
 * @param speculativePressure Multiplier from automated global algorithmic futures trading.
 * @returns number Synthetically bounded instantaneous spot price in baseline global currency bounds.
 */
export function computeCommodityPrice(
  commodity: Commodity,
  supplyShock: number,
  demandShock: number,
  speculativePressure: number
): number {
  
  // Implements the specific bounded execution formula matching algorithmic guidelines specifically.
  const randomDriftScalar = 1 + ((Math.random() - 0.5) * commodity.priceVolatility * 0.2);

  let rawCalculatedPrice = commodity.basePrice 
    * (1 + supplyShock) 
    * (1 + demandShock) 
    * (1 + speculativePressure) 
    * randomDriftScalar;

  // Implementation enforces strict upper and lower clamping protecting the UI from breaking mathematically.
  const lowerBound = commodity.basePrice * 0.3;
  const upperBound = commodity.basePrice * 4.0;

  // Mathematical clamping function explicitly securing rendering domains safely natively.
  rawCalculatedPrice = Math.max(lowerBound, Math.min(upperBound, rawCalculatedPrice));

  return parseFloat(rawCalculatedPrice.toFixed(2));
}

/**
 * Specifically structures macroeconomic shock mechanics triggered explicitly via 
 * diplomatic sanctions logic severing critical trade dependencies directly.
 * 
 * @param commodityId Identifier string aligning natively to internal catalog records.
 * @param targetNationId Identifier routing consequences mechanically towards the isolated nation state natively.
 * @param worldState Explicit master array map structurally utilized strictly for import scaling models.
 * @returns EconomicDelta A strictly encapsulated numeric penalty object directly bounding subsequent implementations.
 */
export function applyEmbargo(
  commodityId: string,
  targetNationId: string,
  worldState: WorldState
): EconomicDelta {
  const commodity = COMMODITY_DEFINITIONS.find(c => c.id === commodityId);
  
  if (!commodity) {
    return { gdpImpact: 0, inflationSpike: 0, blowback: false };
  }

  const targetData = worldState.countries[targetNationId];
  
  // Defensively assign a generic baseline modeling strict dependency arrays mathematically natively.
  // We logically bind import dependencies strongly if the target exists externally.
  let importDependency = 0.5; // Generic structural baseline mapping directly to systemic imports logically.
  
  if (targetData && targetData.economic && targetData.economic.gdpB > 0) {
      // Abstractly synthesize import dependency logically tied functionally to structural volumes.
      // Scaling structurally directly against arbitrary limits securely safely natively.
      importDependency = Math.min(1.0, (targetData.economic.gdpB / 5000));
  }

  // Linear extraction defining structural economic degradation natively.
  const calculatedImpact = -commodity.sanctionSensitivity * importDependency * 0.08;
  const calculatedInflation = commodity.sanctionSensitivity * 0.04;
  
  // Immediate blowback risk flagged if the targeted commodity is intrinsically crucial globally natively.
  const isBlowbackTriggered = commodity.sanctionSensitivity > 0.8;

  return {
    gdpImpact: parseFloat(calculatedImpact.toFixed(4)),
    inflationSpike: parseFloat(calculatedInflation.toFixed(4)),
    blowback: isBlowbackTriggered
  };
}

/**
 * Standard persistent cyclic function automatically driving organic drift variance
 * universally specifically bound natively strictly aligning across the overarching platform mathematically. 
 * Executes conditionally utilizing specific modular timeline framing internally dynamically structurally.
 * 
 * @param tick Global clock sequence actively resolving chronological mapping internally structurally. 
 */
export function processCommodityTick(tick: number): void {
  // Step 1: Every standard tick, universally invoke randomized volatility drift against the master cache array dynamically
  for (let i = 0; i < COMMODITY_DEFINITIONS.length; i++) {
     const commodity = COMMODITY_DEFINITIONS[i];
     
     // Mathematically apply a bounded scalar specifically mirroring random Brownian structural drifts dynamically
     const randomDrift = 1 + ((Math.random() - 0.5) * 0.03); // ±1.5% drift structurally native specifically mapped
     commodity.currentPrice = commodity.currentPrice * randomDrift;
     
     // Re-apply bounded clamping safely ensuring internal data structures remain valid structurally natively internally
     commodity.currentPrice = Math.max(commodity.basePrice * 0.3, Math.min(commodity.basePrice * 4.0, commodity.currentPrice));
  }

  // Step 2: Complex heuristic evaluation sequences executing functionally exclusively mapped dynamically across multi-tick loops.
  if (tick % 8 === 0) {
     const worldState = useWorldStore.getState();
     
     const eventStrings = worldState.globalEventLog.map(e => e.text.toUpperCase());
     let hormuzConflict = false;
     let ukraineConflict = false;
     let taiwanConflict = false;

     // Substring parsing identifying macro regional disruptions mapped explicitly functionally
     for (const text of eventStrings) {
        if (text.includes('HORMUZ') || text.includes('IRAN')) hormuzConflict = true;
        if (text.includes('UKRAINE') || text.includes('BLACK SEA')) ukraineConflict = true;
        if (text.includes('TAIWAN') || text.includes('STRAIT')) taiwanConflict = true;
     }

     // Inject explicitly targeted supply/demand modifier spikes responding deterministically
     // structurally directly aligning against conflict markers evaluated mechanically.
     if (hormuzConflict || ukraineConflict || taiwanConflict) {
        useWorldStore.getState().applyTickDelta((draft) => {
           for (let i = 0; i < COMMODITY_DEFINITIONS.length; i++) {
              if (COMMODITY_DEFINITIONS[i].id === 'COMM_OIL' && hormuzConflict) {
                 COMMODITY_DEFINITIONS[i].currentPrice *= 1.15; // 15% shock spike natively
                 draft.globalEventLog.unshift({ tick: draft.currentTick, severity: 'WARNING', text: "GLOBAL MARKET: Oil futures spike 15% amid Hormuz disruption." });
              }
              if (COMMODITY_DEFINITIONS[i].id === 'COMM_WHEAT' && ukraineConflict) {
                 COMMODITY_DEFINITIONS[i].currentPrice *= 1.20; // 20% shock spike natively
                 draft.globalEventLog.unshift({ tick: draft.currentTick, severity: 'WARNING', text: "GLOBAL MARKET: Wheat futures spike 20% amid Black Sea disruption." });
              }
              if (COMMODITY_DEFINITIONS[i].id === 'COMM_SEMI' && taiwanConflict) {
                 COMMODITY_DEFINITIONS[i].currentPrice *= 1.25; // 25% shock spike natively
                 draft.globalEventLog.unshift({ tick: draft.currentTick, severity: 'CRITICAL', text: "GLOBAL MARKET: Semiconductor spot prices spike 25% amid Taiwan Straits disruption." });
              }
           }
        });
     }
  }
}

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
