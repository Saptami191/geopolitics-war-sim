export interface SIGINTIntercept {
  id: string;
  entityId: string;
  sourceType: string;
  timestamp: number;
}

export interface PatternOfLifeRecord {
  entityId: string;
  entityType: 'leader' | 'military' | 'diplomat';
  contactFrequency: Record<string, number>;
  locationSignature: string[];
  anomalyScore: number;
  rollingBaseline: number[];
  lastUpdatedTick: number;
}

export interface IntelligenceEvent {
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  text: string;
  confidence: number;
}

/**
 * Iteratively updates a PatternOfLifeRecord with a new intercept, advancing both
 * its immediate frequency state and appending to its long-term baseline window.
 * Z-score anomaly recalculation is automatically integrated on each update.
 * 
 * @param existing The prior POF entity baseline matrix.
 * @param newIntercept The newly decoded communications intercept referencing this entity.
 * @returns PatternOfLifeRecord A structurally cloned and statistically updated record.
 */
export function updatePatternOfLife(
  existing: PatternOfLifeRecord,
  newIntercept: SIGINTIntercept
): PatternOfLifeRecord {
  const record: PatternOfLifeRecord = { ...existing };
  record.contactFrequency = { ...record.contactFrequency };
  record.rollingBaseline = [...record.rollingBaseline];
  record.locationSignature = [...record.locationSignature];

  // Increment the contact frequency tracking map.
  if (record.contactFrequency[newIntercept.sourceType] !== undefined) {
    record.contactFrequency[newIntercept.sourceType] += 1;
  } else {
    record.contactFrequency[newIntercept.sourceType] = 1;
  }
  
  // Aggregate numeric total sum of frequencies to compute against the baseline
  let currentFrequencyTotal = 0;
  for (const key in record.contactFrequency) {
    if (Object.prototype.hasOwnProperty.call(record.contactFrequency, key)) {
      currentFrequencyTotal += record.contactFrequency[key];
    }
  }

  record.lastUpdatedTick = newIntercept.timestamp;

  // We maintain a hard constraint of 30 trailing entries to build the z-score window.
  // This simulates the past 30 ticks of nominal background noise.
  record.rollingBaseline.push(currentFrequencyTotal);
  if (record.rollingBaseline.length > 30) {
    // Shifts out oldest baseline entry to maintain trailing window
    record.rollingBaseline.shift();
  }

  // Z-Score Recalculation Phase
  if (record.rollingBaseline.length >= 2) {
    let sum = 0;
    for (let i = 0; i < record.rollingBaseline.length; i++) {
       sum += record.rollingBaseline[i];
    }
    const mean = sum / record.rollingBaseline.length;

    let varianceSum = 0;
    for (let i = 0; i < record.rollingBaseline.length; i++) {
       const diff = record.rollingBaseline[i] - mean;
       varianceSum += (diff * diff);
    }
    // We compute sample variance, falling back gracefully if length < 2
    const variance = varianceSum / (record.rollingBaseline.length - 1);
    const stdDev = Math.sqrt(variance);

    if (stdDev > 0.001) {
       record.anomalyScore = (currentFrequencyTotal - mean) / stdDev;
    } else {
       // If standard deviation is 0, they are flatlining and currently unchanged
       record.anomalyScore = 0;
    }
  } else {
    record.anomalyScore = 0;
  }

  return record;
}

/**
 * Sweeps an array of tracked POF records, filtering for any that exceed the
 * defined statistical threshold for anomalous behavior based on Z-score deviation.
 * 
 * @param records Complete array of tracked POF baseline structures.
 * @param threshold Numeric threshold (typically 2.0 or 3.0 standard deviations).
 * @returns PatternOfLifeRecord[] Structurally sorted array of targets behaving anomalously.
 */
export function detectAnomalies(
  records: PatternOfLifeRecord[],
  threshold: number
): PatternOfLifeRecord[] {
  const anomalies: PatternOfLifeRecord[] = [];

  for (const record of records) {
    if (record.anomalyScore > threshold) {
      anomalies.push(record);
    }
  }

  // Sort by highest deviation to ensure critical warnings rise to the top
  return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
}

/**
 * Transcribes a mathematical anomaly object into a human-readable and structured
 * notification alert format for dispatch into command feeds.
 * 
 * @param record The specific record evaluating significantly beyond nominal.
 * @returns IntelligenceEvent Parsed threat container for system routing.
 */
export function generateAnomalyAlert(record: PatternOfLifeRecord): IntelligenceEvent {
  const severityLevel: 'CRITICAL' | 'WARNING' = record.anomalyScore > 3.0 ? 'CRITICAL' : 'WARNING';
  
  // Format string identifier safely indicating tactical target deviation
  const textAlert = `SIGINT ANOMALY: Pattern of Life analysis on entity [${record.entityId}] (${record.entityType.toUpperCase()}) shows significant communication deviation (${record.anomalyScore.toFixed(2)} sigma). High likelihood of imminent maneuver or protocol shift.`;
  
  // Confidence scales directly with standard deviations mapping against a known
  // statistical confidence interval chart. Base 0.50 + linear extrapolation.
  const evalConfidence = Math.min(0.95, 0.50 + (record.anomalyScore * 0.15));

  return {
    severity: severityLevel,
    text: textAlert,
    confidence: evalConfidence
  };
}

/**
 * Computes cosine similarity of the contact frequency vectors between two entities.
 * Critical capability utilized to determine if two supposedly isolated adversaries
 * or diplomatic channels are utilizing coordinated mirror strategies.
 * 
 * @param a First entity's POF metadata structural record.
 * @param b Second entity's POF metadata structural record.
 * @returns number Probability alignment scoring bounded 0 to 1.
 */
export function computePatternSimilarity(
  a: PatternOfLifeRecord,
  b: PatternOfLifeRecord
): number {
  // Aggregate all unique dimension keys contained in either frequency map
  const uniqueKeys: string[] = [];
  
  for (const k in a.contactFrequency) {
    if (Object.prototype.hasOwnProperty.call(a.contactFrequency, k)) {
      if (!uniqueKeys.includes(k)) uniqueKeys.push(k);
    }
  }
  for (const k in b.contactFrequency) {
    if (Object.prototype.hasOwnProperty.call(b.contactFrequency, k)) {
      if (!uniqueKeys.includes(k)) uniqueKeys.push(k);
    }
  }

  // Fallback trap to prevent NaN errors when both entities have absolutely no data
  if (uniqueKeys.length === 0) return 0.0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of uniqueKeys) {
    const valA = a.contactFrequency[key] || 0;
    const valB = b.contactFrequency[key] || 0;

    dotProduct += (valA * valB);
    normA += (valA * valA);
    normB += (valB * valB);
  }

  if (normA === 0 || normB === 0) return 0.0;

  const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  return Math.max(0, Math.min(1.0, cosineSimilarity));
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
