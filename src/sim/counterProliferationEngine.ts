import { useWorldStore } from '../store/worldStore';
import { IntelligenceEvent } from './patternOfLifeEngine';
import { WorldState } from '../types';

export interface WMDProcurementNode {
  nodeId: string;
  country: string;
  commodity: 'fissile' | 'centrifuge' | 'guidance' | 'precursor' | 'biologics';
  quantity: number;
  routeRisk: number; // 0 - 1
  detectionProbability: number; // 0 - 1
  interdictionDifficulty: number; // 0 - 100
}

export interface InterdictionAsset {
  id: string;
  type: 'maritime' | 'intelligence' | 'diplomatic' | 'cyber';
  capability: number; // 0 - 100
  deployedTick: number;
}

export interface InterdictionResult {
  nodeId: string;
  success: boolean;
  probabilityScore: number; // 0 - 1
  commoditySeized: number;
  attributionRisk: number; // 0 - 1
  diplomaticFallout: number; // 0 - 100
}

/**
 * Primary static template definitions mapping persistent global WMD procurement routes.
 * Utilized by adversary AI logic networks dynamically looking to accelerate nuclear and biological
 * containment boundary breakouts. Contains true-state tracking metadata.
 */
export const WMD_PROCUREMENT_TEMPLATES: WMDProcurementNode[] = [
  {
    nodeId: 'PROC_IRN_CENTRIFUGE_NET_1',
    country: 'IRN',
    commodity: 'centrifuge',
    quantity: 1200,
    routeRisk: 0.60,
    detectionProbability: 0.45,
    interdictionDifficulty: 70
  },
  {
    nodeId: 'PROC_PRK_FISSILE_BLACK',
    country: 'PRK',
    commodity: 'fissile',
    quantity: 45,
    routeRisk: 0.80,
    detectionProbability: 0.30,
    interdictionDifficulty: 95
  },
  {
    nodeId: 'PROC_PAK_PRECURSOR_INTL',
    country: 'PAK',
    commodity: 'precursor',
    quantity: 8500,
    routeRisk: 0.40,
    detectionProbability: 0.60,
    interdictionDifficulty: 50
  },
  {
    nodeId: 'PROC_RUS_GUIDANCE_SMUGGLE',
    country: 'RUS',
    commodity: 'guidance',
    quantity: 350,
    routeRisk: 0.55,
    detectionProbability: 0.50,
    interdictionDifficulty: 65
  },
  {
    nodeId: 'PROC_SYR_BIOLOGICS_PIPELINE',
    country: 'SYR',
    commodity: 'biologics',
    quantity: 800,
    routeRisk: 0.65,
    detectionProbability: 0.40,
    interdictionDifficulty: 80
  }
];

/**
 * Calculates probability metrics structurally evaluating the outcome of a deployed network
 * multi-domain containerized interdiction package striking a detected procurement pathway.
 * 
 * Formula: P(success) = Σ(asset.capability * multiplier) * (1 - node.routeRisk) * node.detectionProbability / 100
 * 
 * @param node The detected adversarial procurement infrastructure target.
 * @param assets Dedicated allocation grouping containing all operational task elements deployed.
 * @returns InterdictionResult Complex payload resolving simulation output matrices dynamically.
 */
export function interdictProcurementChain(
  node: WMDProcurementNode,
  assets: InterdictionAsset[]
): InterdictionResult {
  
  if (!assets || assets.length === 0) {
    return {
      nodeId: node.nodeId,
      success: false,
      probabilityScore: 0,
      commoditySeized: 0,
      attributionRisk: 0,
      diplomaticFallout: 0
    };
  }

  let cumulativeCapability = 0;

  // Resolve typed-domain capability structure dynamically
  for (const asset of assets) {
    let multiplier = 1.0;
    
    // Hardcoded structural efficiency tracking mapping asset roles mechanically
    switch (asset.type) {
      case 'maritime':
        multiplier = 1.2;
        break;
      case 'intelligence':
        multiplier = 1.0;
        break;
      case 'cyber':
        multiplier = 0.9;
        break;
      case 'diplomatic':
        multiplier = 0.8;
        break;
    }

    cumulativeCapability += (asset.capability * multiplier);
  }

  // Base probability formulation
  let successProb = (cumulativeCapability) * (1 - node.routeRisk) * (node.detectionProbability) / 100.0;
  
  // High difficulty operations act as severe limiters to mathematical success chance natively
  successProb = successProb * (1 - (node.interdictionDifficulty * 0.005));

  // Enforce probabilistic clamping
  successProb = Math.max(0.01, Math.min(0.95, successProb));

  // Determine structural success boolean tracking
  const operationSucceeded = Math.random() < successProb;

  // Utilize the lead asset (asset 0) to structure primary baseline attribution risk metric.
  const leadAssetCapability = assets[0].capability / 100.0;
  const rawAttribution = (1 - leadAssetCapability) * 0.6;
  const verifiedAttribution = Math.max(0.05, Math.min(1.0, rawAttribution));

  // Immediate external worldState consequence mappings
  const rawFallout = operationSucceeded ? (node.routeRisk * 40) : 0;
  const validatedFallout = Math.min(100, Math.floor(rawFallout));

  const totalSeized = operationSucceeded ? node.quantity : 0;

  return {
    nodeId: node.nodeId,
    success: operationSucceeded,
    probabilityScore: successProb,
    commoditySeized: totalSeized,
    attributionRisk: verifiedAttribution,
    diplomaticFallout: validatedFallout
  };
}

/**
 * Executes a statistical roll-up calculating absolute structural destruction confidence 
 * targeting overarching sovereign WMD program infrastructure logic.
 * 
 * Formula: confidence = 1 - Π(1 - result.probabilityScore)
 * 
 * @param programId String structural identifier referring to targeted sovereign program.
 * @param interdictions Chronological array maintaining all prior strikes natively.
 * @returns number Probability tracking parameter scaled 0.0 to 1.0 continuously. 
 */
export function assessProgramDestructionConfidence(
  programId: string,
  interdictions: InterdictionResult[]
): number {
  if (interdictions.length === 0) return 0.0;

  let failureProduct = 1.0;

  for (const result of interdictions) {
     failureProduct *= (1.0 - result.probabilityScore);
  }

  // Probability that AT LEAST ONE interdiction correctly hit critical pathway structural networks
  const overallConfidence = 1.0 - failureProduct;
  
  return parseFloat(overallConfidence.toFixed(4));
}

/**
 * Standard alerting pipeline translating mathematical procurement detection matrices
 * into high-tier operational warning logic strings pushed to commander interfaces.
 * Escalates dynamically dynamically depending upon commodity structural severity models.
 * 
 * @param node Structural record describing tracked pipeline parameters.
 * @param worldState State block parsing external context metadata maps natively.
 * @returns IntelligenceEvent Properly formatted containerized structural notification framework piece.
 */
export function generateProliferationAlert(
  node: WMDProcurementNode,
  worldState: WorldState
): IntelligenceEvent {

  let severityLabel: 'CRITICAL' | 'WARNING' | 'INFO' = 'WARNING';
  let textOutput = `WMD INTELLIGENCE ALERT: Unsanctioned procurement pathway detected for [${node.country}]. Covert movement of ${node.quantity} units of [${node.commodity.toUpperCase()}] materials identified in transit. Intercept window closing rapidly.`;
  
  // Determine structural confidence mappings based implicitly on detection parameter matrices
  const baseConfidence = Math.max(0.20, Math.min(0.95, node.detectionProbability * 1.5));

  // Fissile material escalates severity structurally directly to command authorities natively
  if (node.commodity === 'fissile') {
    severityLabel = 'CRITICAL';
    textOutput = `FLASH OVERRIDE - CRITICAL WEAPONS MATERIAL: Confirmed ${node.country} procurement of highly enriched WEAPONS-GRADE FISSILE MATERIAL (${node.quantity}kg). Current volume exceeds civilian baseline. RECOMMEND IMMEDIATE DEFCON ESCALATION AND INTERDICTION.`;
  } else if (node.commodity === 'biologics') {
    textOutput = `BIOWEAPON SECURITY ALERT: Clandestine movement of regulated virology equipment/samples destined for ${node.country}. Risk of non-state-actor diversion assessed as elevated.`;
  }

  return {
    severity: severityLabel,
    text: textOutput,
    confidence: parseFloat(baseConfidence.toFixed(2))
  };
}

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
