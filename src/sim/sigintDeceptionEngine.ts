import { useWorldStore } from '../store/worldStore';
import { PatternOfLifeRecord, SIGINTIntercept, computePatternSimilarity } from './patternOfLifeEngine';

export interface DeceptionOperation {
  id: string;
  name: string;
  type: 'traffic_injection' | 'frequency_mimicry' | 'false_order_of_battle' | 'persona_injection';
  cost: number;
  detectionRisk: number; // 0-1
  targetBeliefDelta: Record<string, number>;
  durationTicks: number;
}

export interface DeceptionDetectionResult {
  flaggedIntercepts: string[];
  deceptionProbability: number; // 0-1
  mostLikelyType: DeceptionOperation['type'] | null;
}

// Ensure interface aligns with the required tracking payload structure
export interface SIGINTStateTargeting {
  activeDeceptionOps: DeceptionOperation[];
  sigintConfidence: number;
}

/**
 * Registry of available high-tier signals deception mechanics.
 * Each models a distinct tradecraft discipline used to poison adversary 
 * collection metrics organically through noise scaling operations.
 */
export const DECEPTION_OPERATIONS: DeceptionOperation[] = [
  {
    id: 'DECEP_TRAFFIC_INJECT',
    name: 'Phantom Chatter Noise Flooding',
    type: 'traffic_injection',
    cost: 1500000,
    // Extremely safe due to deniability, reduces CONFIRMED intel down to RUMINT bandwidths
    detectionRisk: 0.15, 
    targetBeliefDelta: {
      'militaryThreat': -25, // adversary lowers readiness assuming background noise
      'economicInstability': 10 
    },
    durationTicks: 12
  },
  {
    id: 'DECEP_FREQ_MIMIC',
    name: 'Allied Frequency Impersonation',
    type: 'frequency_mimicry',
    cost: 3200000,
    // High risk if adversary implements cryptographic timing checks
    detectionRisk: 0.60,
    targetBeliefDelta: {
      'diplomaticIsolation': -40, // adversary believes we are coordinating
      'allianceStress': 30        // sows confusion in adversary network modeling
    },
    durationTicks: 8
  },
  {
    id: 'DECEP_FALSE_OOB',
    name: 'Ghost Force Projection Matrix',
    type: 'false_order_of_battle',
    cost: 5500000,
    // Highest operational impact, moderaterly risky to sustain
    detectionRisk: 0.45,
    targetBeliefDelta: {
      'militaryThreat': 60,       // spikes adversary threat assessment immediately
      'nuclearRisk': 15           // triggers strategic force alert thresholds
    },
    durationTicks: 20
  },
  {
    id: 'DECEP_PERSONA_INJECT',
    name: 'Synthetic Diplomatic Backchannel',
    type: 'persona_injection',
    cost: 2800000,
    // Requires constant human-in-the-loop validation, massive risk overhead
    detectionRisk: 0.75,
    targetBeliefDelta: {
      'leadershipIntent': -50,    // completely reverses adversary understanding of our aims
    },
    durationTicks: 15
  }
];

/**
 * Initializes and bounds a synthetic deception operation against the targeted adversary node.
 * Binds structural adjustments dynamically to target's internal worldState variables
 * simulating successful infiltration of their analytic feeds.
 * 
 * @param op Structural op parameter dictionary executing against the target.
 * @param targetNationId ISO-3 identifier of the victim state.
 * @param sigintState Active local SIGINT state containing structural operations arrays.
 * @returns Modified SIGINTStateTargeting payload with active operations appended.
 */
export function launchDeceptionOperation<T extends SIGINTStateTargeting>(
  op: DeceptionOperation,
  targetNationId: string,
  sigintState: T
): T {
  // Deep clone state boundary to prevent immediate mutation leaks
  const resultantState = { ...sigintState };
  resultantState.activeDeceptionOps = [...resultantState.activeDeceptionOps];
  
  // Apply targeted belief modifiers to world state dynamically through delta.
  // This simulates the adversary's automated systems incorporating our poisoned data.
  useWorldStore.getState().applyTickDelta((draft) => {
    const targetData = draft.countries[targetNationId];
    if (targetData && targetData.intelligence) {
       for (const key in op.targetBeliefDelta) {
         if (Object.prototype.hasOwnProperty.call(op.targetBeliefDelta, key)) {
           // Safely increment structural target beliefs bound securely by mapping
           const deltaVal = op.targetBeliefDelta[key];
           let existingVal = (targetData.intelligence as any)[key] ?? 50;
           existingVal += deltaVal;
           (targetData.intelligence as any)[key] = Math.max(0, Math.min(100, existingVal));
         }
       }
    }
  });

  // Structural degradation: Executing heavy deception operations imposes a 
  // bandwidth constraint on our own analytical SIGINT tracking systems securely.
  const confidencePenalty = op.detectionRisk * 0.5 * 100;
  resultantState.sigintConfidence = Math.max(0, resultantState.sigintConfidence - confidencePenalty);

  // Operationalize task and append internally
  resultantState.activeDeceptionOps.push({ ...op });

  return resultantState;
}

/**
 * Filters incoming intercepted signals traffic through a Bayesian anomaly detection
 * matrix specifically hunting for orchestrated adversarial deception logic structures.
 * 
 * Logic mapping relies heavily on evaluating Likelihood Ratios (LR) against 
 * deep-time pattern-of-life baselines.
 * 
 * P(pattern|genuine) / P(pattern|deception)
 * P(pattern|deception) = 1 - patternSimilarity to baseline
 * 
 * @param intercepts Tightly framed window grouping of recent captured intercept fragments.
 * @param patternBaseline Deep-time structured tracking records of individual node histories.
 * @returns DeceptionDetectionResult Evaluated matrices tracking probability and vectors.
 */
export function detectIncomingDeception(
  intercepts: SIGINTIntercept[],
  patternBaseline: PatternOfLifeRecord[]
): DeceptionDetectionResult {
  const flaggedIntercepts: string[] = [];
  let cumulativeLR = 0;
  let flaggedCount = 0;

  // Track typological distributions functionally to ascertain tradecraft modeling
  let typeTrafficking = 0;
  let typeFalseOOB = 0;

  for (let i = 0; i < intercepts.length; i++) {
    const intercept = intercepts[i];
    
    // Find corroborating deep-time baseline if available
    const baseline = patternBaseline.find(b => b.entityId === intercept.entityId);
    
    if (baseline) {
       // Convert intercept into synthetic single-point baseline to utilize cosine similarity wrapper
       const syntheticBaseline: PatternOfLifeRecord = {
         entityId: intercept.entityId,
         entityType: baseline.entityType,
         contactFrequency: { [intercept.sourceType]: 1 },
         locationSignature: [],
         anomalyScore: 0,
         rollingBaseline: [],
         lastUpdatedTick: intercept.timestamp
       };

       // Evaluate structural P(pattern | genuine)
       const pGenuine = Math.max(0.01, computePatternSimilarity(syntheticBaseline, baseline));
       
       // Evaluate synthetic structural P(pattern | deception)
       const pDeception = Math.max(0.01, 1 - pGenuine);

       // Likelihood Ratio
       const likelihoodRatio = pGenuine / pDeception;

       if (likelihoodRatio < 0.3) {
         flaggedIntercepts.push(intercept.id);
         flaggedCount++;
         cumulativeLR += likelihoodRatio;
         
         // Bayesian routing estimators
         if (intercept.sourceType === 'MILITARY_ORDERS') typeFalseOOB++;
         else typeTrafficking++;
       }
    } else {
       // Completely new entities blasting intercepts triggers baseline Bayesian uncertainty mappings.
       // Treating unknown entities lacking baselines as moderate deception risks dynamically.
       if (Math.random() < 0.25) {
          flaggedIntercepts.push(intercept.id);
          flaggedCount++;
          cumulativeLR += 0.25;
       }
    }
  }

  // Aggregate overarching probabilistic determination
  // Higher number of independently tracked low-LR flags exponentially scales confidence of deception.
  let overarchingProbability = 0;
  if (flaggedCount > 0) {
    const avgLR = cumulativeLR / flaggedCount;
    // LR approaches 0 as deception probability approaches 1
    overarchingProbability = Math.min(0.95, 1 - avgLR); 
    // Scaling modifier based on intercept density structure
    overarchingProbability += (flaggedCount * 0.05);
  }
  
  overarchingProbability = Math.max(0, Math.min(1.0, overarchingProbability));

  // Typological structural evaluation modeling for feedback mappings
  let likelyType: DeceptionOperation['type'] | null = null;
  if (flaggedCount > 0) {
    if (typeFalseOOB > typeTrafficking) likelyType = 'false_order_of_battle';
    else likelyType = 'traffic_injection';
  }

  return {
    flaggedIntercepts,
    deceptionProbability: overarchingProbability,
    mostLikelyType: likelyType
  };
}

/**
 * Automatically computes necessary protective cybersecurity and signals counter-deception
 * funding allocations structurally required to block incoming adversarial deception campaigns.
 * 
 * Formula: protection = 100 * (1 - e^(-budget / 50))
 * 
 * @param detectionResult Matrix defining adversarial operational probability parameters.
 * @param budget Immediate capital allocation dynamically injected to halt operation (in Millions).
 * @returns number 0-100 derived structural counter-deception resistance probability.
 */
export function computeCounterDeceptionInvestment(
  detectionResult: DeceptionDetectionResult,
  budget: number
): number {
  if (budget <= 0) return 0;
  
  // Calculate raw protective barrier generated from capital expenditure via exponential curve formula
  const eulerCalc = Math.exp(-budget / 50.0);
  let protectionLevel = 100 * (1 - eulerCalc);

  // If adversary definitively possesses the operational initiative dynamically, their 
  // operations structure penetrates active defenses at double the typical efficiency rate.
  if (detectionResult.deceptionProbability > 0.7) {
    protectionLevel = protectionLevel * 0.5;
  }

  return Math.max(0, Math.min(100, protectionLevel));
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
