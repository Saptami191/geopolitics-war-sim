import { SIGINTIntercept } from './patternOfLifeEngine';

export interface HUMINTReport {
  id: string;
  entityId: string;
  text: string;
  targetNationId: string;
  confidence: number; // 0-1
  stale: boolean;
  timestamp: number;
}

export interface OSINTSource {
  id: string;
  sourceType: string;
  reliability: number; // 0-1
  lastUpdateTick: number;
}

export interface CorroborationResult {
  humintId: string;
  sigintId: string;
  entityId: string;
  upgradedConfidence: number; // 0-1
  timestamp: number;
}

export interface FusedIntelPicture {
  militaryThreat: number;      // 0-100
  economicInstability: number; // 0-100
  leadershipIntent: number;    // 0-100  
  nuclearRisk: number;         // 0-100
  overallConfidence: number;   // 0-1
  dominantSource: 'SIGINT' | 'HUMINT' | 'OSINT' | 'FUSION';
}

/**
 * Executes temporal cross-referencing between isolated HUMINT reports and
 * intercepted SIGINT traffic. When two disparate intelligence channels flag
 * the same entity within a tightly constrained operational window, the confidence
 * interval is synthetically artificially amplified via multi-INT corroboration.
 * 
 * @param humintReports Raw feed of human-source field reporting.
 * @param sigintIntercepts Raw feed of structural communications interceptions.
 * @returns CorroborationResult[] Array of structurally matched intel pairs with upgraded confidence states.
 */
export function crossReferenceHUMINTandSIGINT(
  humintReports: HUMINTReport[],
  sigintIntercepts: SIGINTIntercept[]
): CorroborationResult[] {
  const verifiedMatches: CorroborationResult[] = [];
  
  // Tightly constrained operational temporal window (±3 ticks) required for corroboration match.
  const TIME_WINDOW_CONSTRAINT = 3;

  for (let i = 0; i < humintReports.length; i++) {
    const report = humintReports[i];
    
    // We do not cross-reference stale and degraded intel files.
    if (report.stale) continue;

    let matchFound = false;

    for (let j = 0; j < sigintIntercepts.length; j++) {
      const intercept = sigintIntercepts[j];

      // Entity strict matching AND temporal window containment ensures high correlation validity.
      if (report.entityId === intercept.entityId) {
        const timeDelta = Math.abs(report.timestamp - intercept.timestamp);
        
        if (timeDelta <= TIME_WINDOW_CONSTRAINT) {
          matchFound = true;

          // Perform categorical confidence upgrade tracking based on prior state mapping matrices.
          // RUMINT (0.2) -> HUMINT (0.65) / SIGINT (0.80) -> CONFIRMED (0.95)
          let upgradedState = report.confidence;
          if (report.confidence < 0.4) {
             upgradedState = 0.65; // Massive structural jump from hearsay to corroborated node.
          } else if (report.confidence < 0.7) {
             upgradedState = 0.80; // High confidence upgrade.
          } else {
             upgradedState = 0.95; // Golden rule CONFIRMED lock.
          }

          verifiedMatches.push({
            humintId: report.id,
            sigintId: intercept.id,
            entityId: report.entityId,
            upgradedConfidence: upgradedState,
            timestamp: Math.max(report.timestamp, intercept.timestamp)
          });
          
          // Assuming strong pair linkage, we break inner to avoid over-counting the same report loop.
          break;
        }
      }
    }
  }

  return verifiedMatches;
}

/**
 * Calculates a structurally aggregated threat calculus matrix for a sovereign target
 * by layering SIGINT, HUMINT, and OSINT capabilities into weighted domains.
 * Determines the dominant intelligence paradigm driving the current threat model.
 * 
 * @param targetNation ISO-3 target string mapping target infrastructure.
 * @param sigintVisibility Pre-calculated numerical visibility index representing SIGINT penetration.
 * @param humintReports Actively curated pool of non-stale human intelligence documents targeting the nation.
 * @param osintSources Aggregated array of open-source metric trackers covering target regions.
 * @returns FusedIntelPicture Composite intelligence object structuring operational parameters.
 */
export function computeFusedIntelligencePicture(
  targetNation: string,
  sigintVisibility: number,
  humintReports: HUMINTReport[],
  osintSources: OSINTSource[]
): FusedIntelPicture {
  
  // Phase 1: Assess source bucket structural weights
  
  // SIGINT is mapped directly from its active network calculation matrix.
  const sigintScore = Math.max(0, Math.min(100, sigintVisibility));
  
  // HUMINT is computed against the aggregated confidence intervals of all relevant files.
  let humintScoreTotal = 0;
  let relevantHumintCount = 0;
  for (let i = 0; i < humintReports.length; i++) {
    if (humintReports[i].targetNationId === targetNation && !humintReports[i].stale) {
      humintScoreTotal += (humintReports[i].confidence * 100);
      relevantHumintCount++;
    }
  }
  const humintScore = relevantHumintCount > 0 ? (humintScoreTotal / relevantHumintCount) : 0;
  
  // OSINT operates as a high-noise, low-granularity baseline filler, capped for accuracy limitations.
  let osintScoreTotal = 0;
  for (let i = 0; i < osintSources.length; i++) {
    osintScoreTotal += (osintSources[i].reliability * 100);
  }
  const osintScore = osintSources.length > 0 ? Math.min(85, (osintScoreTotal / osintSources.length)) : 10; // Baseline floor established
  
  // Phase 2: Compute global fusion weights
  // Hardcoded doctrinal reliance mapping: SIGINT (40%), HUMINT (35%), OSINT (25%)
  const W_SIG = 0.40;
  const W_HUM = 0.35;
  const W_OSI = 0.25;

  const fusedConfidenceMetric = (sigintScore * W_SIG) + (humintScore * W_HUM) + (osintScore * W_OSI);
  const normalizedConfidence = Math.max(0, Math.min(1.0, fusedConfidenceMetric / 100));

  // Determine structural dominance bucket routing
  const rawDominanceMap = {
    'SIGINT': sigintScore * W_SIG,
    'HUMINT': humintScore * W_HUM,
    'OSINT': osintScore * W_OSI
  };
  
  let dominantSource: 'SIGINT' | 'HUMINT' | 'OSINT' | 'FUSION' = 'FUSION';
  let topScore = 0;
  let collisionCount = 0;

  for (const source in rawDominanceMap) {
    if (Object.prototype.hasOwnProperty.call(rawDominanceMap, source)) {
      const score = (rawDominanceMap as any)[source];
      if (score > topScore) {
        topScore = score;
        dominantSource = source as 'SIGINT' | 'HUMINT' | 'OSINT';
        collisionCount = 1;
      } else if (score === topScore) {
        collisionCount++;
      }
    }
  }
  
  if (collisionCount >= 2 && topScore > 10) {
     dominantSource = 'FUSION'; // Multiple high-impact nodes contributing identically.
  }

  // Phase 3: Synthesize tactical dimensions from derived confidence and random simulation drift.
  // In a full environment, these would be mapped specifically from parseable target attributes, 
  // but mechanically they derive structurally bounded threat representations.
  const militaryThreat = Math.min(100, Math.max(0, (normalizedConfidence * 50) + (sigintScore * 0.5)));
  const economicInstability = Math.min(100, Math.max(0, (normalizedConfidence * 40) + (osintScore * 0.6)));
  const leadershipIntent = Math.min(100, Math.max(0, (normalizedConfidence * 60) + (humintScore * 0.4)));
  const nuclearRisk = Math.min(100, Math.max(0, (sigintScore * 0.3) + (humintScore * 0.2) + (normalizedConfidence * 20)));

  return {
    militaryThreat,
    economicInstability,
    leadershipIntent,
    nuclearRisk,
    overallConfidence: normalizedConfidence,
    dominantSource
  };
}

/**
 * Mechanical intelligence decay loop handling the temporal degradation of isolated
 * HUMINT files. Implements an exponential decay curve after a hard 10-tick baseline latency.
 * Updates stateful parameters safely via object cloning.
 * 
 * @param report The target HUMINT report tracking record.
 * @param ticksElapsed The difference between report generation and current engine tick.
 * @returns HUMINTReport Newly cloned structurally degraded report model.
 */
export function degradeIntelOverTime(
  report: HUMINTReport,
  ticksElapsed: number
): HUMINTReport {
  const degraded: HUMINTReport = { ...report };
  
  // Tactical intelligence remains effectively actionable and non-degraded for first 10 ticks overhead.
  if (ticksElapsed > 10) {
    const lagPeriod = ticksElapsed - 10;
    
    // Applying standard exponential decay multiplier targeting rapid obsolescence curve.
    const degradationMultiplier = Math.pow(0.97, lagPeriod);
    degraded.confidence = degraded.confidence * degradationMultiplier;
    
    // RUMINT floor bound. Anything dropping below 0.20 gets structurally flagged as functionally dead.
    if (degraded.confidence < 0.20) {
       degraded.stale = true;
    }
  }

  return degraded;
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
