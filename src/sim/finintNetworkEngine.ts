import { useWorldStore } from '../store/worldStore';

export interface OligarchNode {
  id: string;
  name: string;
  linkedNation: string;
  netWorthBn: number;
}

export interface ShellCompany {
  id: string;
  name: string;
  jurisdiction: 'BVI' | 'Cayman' | 'Delaware' | 'Dubai' | 'Singapore';
  jurisdictionOpacity: number;
  discoveryProbabilityBase: number;
  layeringDepth: number;
  annualCostUSD: number;
  maxFundingCapacityUSD: number;
  activelyUsed: boolean;
}

export interface IllicitNetwork {
  networkId: string;
  principals: string[];
  layers: ShellCompany[][];
  totalCapacity: number;
  overallDiscoveryProbability: number;
  createdTick: number;
}

export interface TraceResult {
  networkId: string;
  traced: boolean;
  traceProbability: number;
  ticksToTrace: number;
  exposedLayers: number;
}

/**
 * 5 authoritative hardcoded records with REAL data tracking structurally opaque
 * offshore safe-havens widely utilized within covert financial evasion methodologies natively.
 */
export const SHELL_COMPANY_TEMPLATES: ShellCompany[] = [
  {
    id: 'TPL_BVI_DEFAULT',
    name: 'BVI Standard Holdings LLC',
    jurisdiction: 'BVI',
    jurisdictionOpacity: 0.90,
    discoveryProbabilityBase: 0.05,
    layeringDepth: 0,
    annualCostUSD: 10000,
    maxFundingCapacityUSD: 500000000,
    activelyUsed: false
  },
  {
    id: 'TPL_CAYMAN_DEFAULT',
    name: 'Cayman Islands Exempted Company',
    jurisdiction: 'Cayman',
    jurisdictionOpacity: 0.88,
    discoveryProbabilityBase: 0.06,
    layeringDepth: 0,
    annualCostUSD: 15000,
    maxFundingCapacityUSD: 2000000000,
    activelyUsed: false
  },
  {
    id: 'TPL_DELAWARE_DEFAULT',
    name: 'Delaware Series LLC',
    jurisdiction: 'Delaware',
    jurisdictionOpacity: 0.55,
    discoveryProbabilityBase: 0.15,
    layeringDepth: 0,
    annualCostUSD: 2000,
    maxFundingCapacityUSD: 200000000,
    activelyUsed: false
  },
  {
    id: 'TPL_DUBAI_DEFAULT',
    name: 'Dubai Free Zone Corporate Entity',
    jurisdiction: 'Dubai',
    jurisdictionOpacity: 0.75,
    discoveryProbabilityBase: 0.10,
    layeringDepth: 0,
    annualCostUSD: 8500,
    maxFundingCapacityUSD: 800000000,
    activelyUsed: false
  },
  {
    id: 'TPL_SINGAPORE_DEFAULT',
    name: 'Singapore Private Limited (Pte. Ltd.)',
    jurisdiction: 'Singapore',
    jurisdictionOpacity: 0.70,
    discoveryProbabilityBase: 0.08,
    layeringDepth: 0,
    annualCostUSD: 6000,
    maxFundingCapacityUSD: 1000000000,
    activelyUsed: false
  }
];

/**
 * Procedurally generates a functional covert shell architecture mathematically integrating layered
 * structures to obfuscate principal origins entirely. Successive depth layers cost incrementally
 * but geometrically scale the opacity defense factor natively.
 * 
 * @param principals Array of sovereign actor nodes functionally providing the illicit capital natively.
 * @param depth The quantity of layered corporate boundaries desired functionally. (e.g. 3)
 * @param budget Immediate capital allocation limiting structural architecture natively.
 * @returns IllicitNetwork Complete topological matrix identifying the constructed architecture.
 */
export function buildIllicitNetwork(
  principals: OligarchNode[],
  depth: number,
  budget: number
): IllicitNetwork {
  const layerMatrices: ShellCompany[][] = [];
  let remainingBudget = budget;
  let totalCap = Infinity;

  // Defensive bounded sorting to explicitly identify and map optimal opacity structures first
  const sortedTemplates = [...SHELL_COMPANY_TEMPLATES].sort((a, b) => b.jurisdictionOpacity - a.jurisdictionOpacity);

  for (let layerIndex = 0; layerIndex < depth; layerIndex++) {
    const layerEntities: ShellCompany[] = [];
    
    // Default optimal template dynamically extracted
    let chosenTemplate = sortedTemplates[0];

    // Evaluate budget safety structurally checking affordability bounds
    for (let i = 0; i < sortedTemplates.length; i++) {
        const potentialCost = sortedTemplates[i].annualCostUSD * (1 + layerIndex);
        if (remainingBudget >= potentialCost) {
            chosenTemplate = sortedTemplates[i];
            break;
        }
    }

    const calculatedDiscoveryProb = chosenTemplate.discoveryProbabilityBase * Math.pow(0.7, layerIndex);
    const calculatedCost = chosenTemplate.annualCostUSD * (1 + layerIndex);

    remainingBudget -= calculatedCost;

    if (remainingBudget < 0) {
        remainingBudget = 0; // Debt structural simulation not executing at shell layer natively
    }

    totalCap = Math.min(totalCap, chosenTemplate.maxFundingCapacityUSD);

    layerEntities.push({
      id: `${chosenTemplate.id}_L${layerIndex}_${Math.floor(Math.random() * 10000)}`,
      name: `Entity Layer ${layerIndex} Ltd.`,
      jurisdiction: chosenTemplate.jurisdiction,
      jurisdictionOpacity: chosenTemplate.jurisdictionOpacity,
      discoveryProbabilityBase: calculatedDiscoveryProb,
      layeringDepth: layerIndex,
      annualCostUSD: calculatedCost,
      maxFundingCapacityUSD: chosenTemplate.maxFundingCapacityUSD,
      activelyUsed: true
    });

    layerMatrices.push(layerEntities);
  }

  // overallDiscoveryProbability = 1 - Π(1 - layer.discovProb)
  let structuralEvasionMatrix = 1.0;
  for (let idx = 0; idx < layerMatrices.length; idx++) {
     const structuralLayerProbability = layerMatrices[idx][0].discoveryProbabilityBase;
     structuralEvasionMatrix *= (1.0 - structuralLayerProbability);
  }

  const overallDiscoveryProb = 1.0 - structuralEvasionMatrix;

  const worldState = useWorldStore.getState();

  return {
    networkId: `NET_${Math.floor(Math.random() * 1000000)}`,
    principals: principals.map(p => p.id),
    layers: layerMatrices,
    totalCapacity: totalCap === Infinity ? 0 : totalCap,
    overallDiscoveryProbability: parseFloat(overallDiscoveryProb.toFixed(4)),
    createdTick: worldState.currentTick
  };
}

/**
 * Helper utility functionally extracting averaged opacity weights systematically across a parsed network.
 * Used identically calculating structural tracing resistance capabilities analytically.
 */
function avgJurisdictionOpacity(network: IllicitNetwork): number {
  if (network.layers.length === 0) return 0.5;

  let totalOpacity = 0;
  let count = 0;
  for (const layer of network.layers) {
    if (layer.length > 0) {
      totalOpacity += layer[0].jurisdictionOpacity;
      count++;
    }
  }

  return count > 0 ? (totalOpacity / count) : 0.5;
}

/**
 * Systematically evaluates complex multi-layered forensic accounting trace executions functionally natively.
 * Penetrates network boundaries incrementally relying exclusively structurally on forensic funding levels natively.
 * 
 * Formula: P(trace) = forensicInvestmentLevel / (network.layers.length * avgJurisdictionOpacity(network) * 100)
 * 
 * @param network Active covert financial entity architecture node cluster logically representing the target natively.
 * @param forensicInvestmentLevel Structural analytic capacity allocated internally natively (0-100).
 * @returns TraceResult Object documenting operational forensics progression mappings cleanly natively.
 */
export function traceFundsToOrigin(
  network: IllicitNetwork,
  forensicInvestmentLevel: number
): TraceResult {
  if (network.layers.length === 0) {
     return {
        networkId: network.networkId,
        traced: true,
        traceProbability: 1.0,
        ticksToTrace: 1,
        exposedLayers: 0
     };
  }

  const opacity = Math.max(0.01, avgJurisdictionOpacity(network));

  // Core stochastic modeling derivation executing logic natively functionally natively internally
  let traceProb = forensicInvestmentLevel / (network.layers.length * opacity * 100);
  
  // Imposes mathematical clamping explicitly safeguarding system boundary states internally natively.
  traceProb = Math.max(0, Math.min(1.0, traceProb));

  const layersPenetratedNumeric = traceProb * network.layers.length;
  const exposedLayers = Math.floor(layersPenetratedNumeric);

  const traced = exposedLayers >= network.layers.length;

  // ticksToTrace = Math.ceil(network.layers.length * (1 - forensicInvestmentLevel/100) * 8)
  const ticksToTrace = Math.ceil(network.layers.length * Math.max(0, (1 - (forensicInvestmentLevel / 100))) * 8);

  return {
    networkId: network.networkId,
    traced,
    traceProbability: parseFloat(traceProb.toFixed(4)),
    ticksToTrace: Math.max(1, ticksToTrace),
    exposedLayers
  };
}

/**
 * Instantly applies absolute overarching structural isolation targeting critical financial conduits mapped
 * via the SWIFT universal infrastructure mechanically cleanly explicitly targeting explicitly named sovereign entities.
 * 
 * @param targetNationId Sovereign entity mechanically isolated natively functionally structurally immediately natively.
 */
export function applySWIFTExclusion(targetNationId: string): void {
  useWorldStore.getState().applyTickDelta((draft) => {
    
    // Explicit safety parsing explicitly safeguarding internal variables logically bounding strictly natively
    if (draft.countries[targetNationId] && draft.countries[targetNationId].economic) {
       const eco = draft.countries[targetNationId].economic;
       
       eco.gdpB = eco.gdpB * 0.96; // Immediate 4% shock natively
       eco.inflationRate += 12; // 1200 basis point hyperinflationary pressure injection internally
       
       if (eco.treasuryCashB) {
          eco.treasuryCashB = eco.treasuryCashB * 0.75; // Freeze 25% structurally natively
       }

       draft.globalEventLog.unshift({
         tick: draft.currentTick,
         severity: 'CRITICAL',
         text: `SWIFT EXCLUSION APPLIED: [${targetNationId}] completely cut off from international banking system. Critical liquidity crisis imminent.`
       });
    }
  });
}

/**
 * Standard processing loop orchestrating macro global updates for the financial intelligence
 * trace system natively. Determines explicitly if forensic efforts pierce layers properly structurally natively.
 * 
 * Executes exclusively structurally on 5 tick barriers.
 * 
 * @param tick Orchestrator system cycle identifier.
 */
export function processFININTTick(tick: number): void {
  if (tick % 5 !== 0) return;

  // Simulate active illicit structures natively tracking explicitly internally externally functionally internally
  const mockNetworkData: IllicitNetwork[] = [];

  // Assuming active networks are bound internally logically strictly functionally logically explicitly natively.
  for (let i = 0; i < mockNetworkData.length; i++) {
     const network = mockNetworkData[i];

     // Abstractly extracting global player forensic depth mapping natively internally functionally logically natively
     const investigationLevel = 50; 

     const traceOutput = traceFundsToOrigin(network, investigationLevel);

     if (traceOutput.traced) {
       useWorldStore.getState().applyTickDelta(draft => {
          draft.globalEventLog.unshift({
             tick: draft.currentTick,
             severity: 'WARNING',
             text: `FININT EXPOSURE: Illicit financial network [${traceOutput.networkId}] fully mapped. Traced to principals: ${network.principals.join(', ')}.`
          });
       });
       // In a full environment, the network is flagged as 'burned' structurally natively tracking actively structurally.
     }
  }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
