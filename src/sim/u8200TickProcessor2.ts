import { useWorldStore } from '../store/worldStore';
import { useSigintStore } from '../store/sigintStore';
import { WorldState } from '../types';
import { processBudgetDecayTick, computeVisibilityFromAllocation, SIGINTBudgetAllocation, SIGINTStateSubset } from './sigintBudgetEngine';
import { updatePatternOfLife, detectAnomalies, generateAnomalyAlert, PatternOfLifeRecord, SIGINTIntercept } from './patternOfLifeEngine';
import { crossReferenceHUMINTandSIGINT, CorroborationResult } from './humintSigintFusionEngine';
import { detectIncomingDeception, DeceptionOperation } from './sigintDeceptionEngine';

import { usePlayerStore } from '../store/playerStore';

/**
 * Standard processing pipeline encapsulating dynamic logic execution cycles
 * across all Unit 8200 structured intelligence architectures mapping into
 * global state engines natively.
 * 
 * Executed via synchronous polling arrays derived externally from world orchestration bounds.
 * 
 * @param worldState State mapping struct linking external dependencies.
 * @param tick Orchestrator clock frame parameter natively binding execution flows.
 */
export function processU8200Tick2(
  worldState: WorldState,
  tick: number
): void {
  // Enforce immediate retrieval of full volatile store models targeting execution pipeline mapping.
  const sigintState = useSigintStore.getState();

  // STEP 1 — Native continuous degradation modeling
  // Applies mathematical decay mechanics simulating raw operational budget shortfalls natively.
  // Utilizing an intersection projection ensuring state compatibility with interface domains.
  const decayedBase = processBudgetDecayTick(sigintState as any as SIGINTStateSubset);
  
  // Directly writing back structurally safe blocks securely into bounded interface arrays constraints
  useSigintStore.setState({ 
    channels: decayedBase.channels,
    budgetAllocation: decayedBase.budgetAllocation 
  } as any);

  // STEP 2 — Real-time target penetration arrays updating
  // Resolving visibility structural bounds mechanically simulating deep global sensing arrays
  if (decayedBase.channels && decayedBase.budgetAllocation) {
    const freshVisibilityMatrix: Record<string, number> = {};
    for (const nationId in worldState.countries) {
      if (Object.prototype.hasOwnProperty.call(worldState.countries, nationId)) {
        if (nationId === (usePlayerStore.getState().countryId || 'US')) continue; // Filter tracking player natively
        
        const vis = computeVisibilityFromAllocation(
          decayedBase.budgetAllocation, 
          nationId, 
          decayedBase.channels
        );
        freshVisibilityMatrix[nationId] = vis;
      }
    }
    useSigintStore.setState({ nationVisibility: freshVisibilityMatrix } as any);
  }

  // STEP 3 — Macro Pattern of Life processing sweeps executed tri-tick bounds securely
  // Processes high-density communication mappings mathematically building tracking baselines sequentially
  const trackedEntities = (sigintState as any).trackedEntities as { entityId: string, polRecord: PatternOfLifeRecord }[];
  const recentIntercepts = (sigintState as any).recentIntercepts as SIGINTIntercept[];

  if (tick % 3 === 0 && trackedEntities && recentIntercepts) {
    const updatedTrackedEntities = [...trackedEntities];

    for (let i = 0; i < updatedTrackedEntities.length; i++) {
       const entity = updatedTrackedEntities[i];
       
       // Filtering specifically for tightly matched historical intercept slices structurally bounding memory mapping
       const entityLatest = recentIntercepts
         .filter(intercept => intercept.entityId === entity.entityId)
         .slice(-5);
       
       let updatedRecord = { ...entity.polRecord };
       for (const intercept of entityLatest) {
         updatedRecord = updatePatternOfLife(updatedRecord, intercept);
       }
       
       updatedTrackedEntities[i] = {
         ...entity,
         polRecord: updatedRecord
       };
    }
    useSigintStore.setState({ trackedEntities: updatedTrackedEntities } as any);
  }

  // STEP 4 — Predictive tactical anomaly identification structures natively bound
  // Searches recently computed structural baselines dynamically seeking heavy z-score distortions 
  if (tick % 3 === 0 && trackedEntities) {
    // We re-query the store to grab freshly mapped vectors successfully derived step 3 natively
    const activeEntities = ((useSigintStore.getState() as any).trackedEntities ?? []) as { entityId: string, polRecord: PatternOfLifeRecord }[];
    const activePolRecords = activeEntities.map(e => e.polRecord);
    
    // Z-Score threshold established structurally at 2.0 mechanically bound to minimize false positive floods
    const anomalies = detectAnomalies(activePolRecords, 2.0);

    for (const anomaly of anomalies) {
      const alert = generateAnomalyAlert(anomaly);
      
      // Inject dynamically compiled structural alerts directly targeting communication array layers mapping locally
      useWorldStore.getState().applyTickDelta(draft => {
        draft.globalEventLog.unshift({
          tick,
          text: alert.text,
          severity: alert.severity as 'CRITICAL' | 'WARNING' | 'INFO'
        });
      });
    }
  }

  // STEP 5 — Hybrid multi-platform intelligence corroboration architectures mapped natively
  // Seeks structured confirmation mechanics combining remote technical signals mathematically verifying human networks
  if (tick % 5 === 0 && recentIntercepts) {
    const activeHumintReports = (worldState as any).humintReports ?? [];
    
    const fusedConfirmations = crossReferenceHUMINTandSIGINT(
       activeHumintReports,
       recentIntercepts
    );

    if (fusedConfirmations.length > 0) {
      useSigintStore.setState(s => {
         const existingConfirmed = (s as any).confirmedIntel ?? [];
         return {
           confirmedIntel: [...existingConfirmed, ...fusedConfirmations]
         } as any;
      });
    }
  }

  // STEP 6 — Deep Counter-Intelligence & Deception Network sweeps executed systematically natively
  // Filters active incoming tactical traffic flows hunting explicitly for synthetic adversarial injections natively
  if (tick % 10 === 0 && recentIntercepts && trackedEntities) {
    const currentPolBaselineRecords = trackedEntities.map(e => e.polRecord);

    const deceptionCheck = detectIncomingDeception(
      recentIntercepts,
      currentPolBaselineRecords
    );

    // Escalation flag bounded severely matching aggressive thresholds minimizing background noise outputs
    if (deceptionCheck.deceptionProbability > 0.6) {
      useWorldStore.getState().applyTickDelta(draft => {
        draft.globalEventLog.unshift({
          tick,
          severity: 'WARNING',
          text: `SIGINT ALERT: Incoming deception operation detected. Probability: ${(deceptionCheck.deceptionProbability * 100).toFixed(0)}%. Type: ${deceptionCheck.mostLikelyType ?? 'UNKNOWN'}`
        });
      });
    }
  }
}

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
