import {
  SovereignAgentState,
  StrategicPerceptionState,
  WorldState,
  Country,
  NationalIdentityVector
} from '../types';

/**
 * Computes the pure strategic perception state for a given country based on the current world state and others' sovereign states.
 * 
 * @param countryId The country analyzing the world
 * @param worldDraft Complete current draft of the world state
 * @param sovereignStates Complete map of all sovereign agents in the system
 * @returns StrategicPerceptionState
 */
export function computePerception(
  countryId: string,
  worldDraft: WorldState,
  sovereignStates: Record<string, SovereignAgentState>
): StrategicPerceptionState {
  const agent = sovereignStates[countryId];
  const country = worldDraft.countries[countryId];

  const adversaries: Record<string, boolean> = {};
  const reliableAllies: Record<string, boolean> = {};
  const distractionTargets: Record<string, string> = {};
  const apparentDeceptionPostures: Record<string, 'TRANSPARENT' | 'DECEPTIVE' | 'UNCERTAIN'> = {};

  if (!country) {
    return {
      countryId,
      adversaries,
      reliableAllies,
      distractionTargets,
      perceivedRegionalTensions: 20,
      apparentDeceptionPostures
    };
  }

  // Helper: compute ideological distance
  const getIdeologyDistance = (idA: string, idB: string): number => {
    const stateA = sovereignStates[idA];
    const stateB = sovereignStates[idB];
    if (!stateA || !stateB) return 100;
    const iA = stateA.identity.ideology;
    const iB = stateB.identity.ideology;

    const fields: (keyof typeof iA)[] = [
      'liberalInstitutionalist',
      'nationalistSovereigntist',
      'revolutionaryRevisionist',
      'pragmaticTransactional',
      'authoritarianPluralistic',
      'religiousSecularGovernance',
      'civilizationalPosture',
      'universalistVsParticularist'
    ];

    let absSum = 0;
    fields.forEach(field => {
      absSum += Math.abs((iA[field] as number) - (iB[field] as number));
    });
    return absSum / fields.length;
  };

  // Loop through all countries in the worldDraft
  Object.keys(worldDraft.countries).forEach((otherId) => {
    if (otherId === countryId) return;

    const otherCountry = worldDraft.countries[otherId];
    if (!otherCountry) return;

    // 1. Identify Adversaries
    // Hostile opinions (< -30), active sanctions, active wars, or high threat memory (> 30)
    const opinion = country.opinions[otherId] ?? 0;
    const isAtWar = country.atWarWith.includes(otherId) || otherCountry.atWarWith.includes(countryId);
    const hasSanctions = country.economic.sanctionedBy.includes(otherId) || otherCountry.economic.sanctionedBy.includes(countryId);
    
    let maxThreatScore = 0;
    if (agent && agent.threatMemory) {
      const records = agent.threatMemory.filter(tm => tm.targetCountryId === otherId);
      if (records.length > 0) {
        maxThreatScore = Math.max(...records.map(tm => tm.severityScore));
      }
    }

    if (opinion < -30 || isAtWar || hasSanctions || maxThreatScore > 30) {
      adversaries[otherId] = true;
    }

    // 2. Identify Reliable Allies
    // Positive opinions (> 50), matching ideology (< 20 ideological distance), or trust score > 60
    let maxTrustScore = 0;
    if (agent && agent.trustMemory) {
      const records = agent.trustMemory.filter(tm => tm.targetCountryId === otherId);
      if (records.length > 0) {
        maxTrustScore = Math.max(...records.map(tm => tm.trustScore));
      }
    }

    const sharesTrade = country.tradePartners?.includes(otherId) && otherCountry.tradePartners?.includes(countryId);
    const ideoDist = getIdeologyDistance(countryId, otherId);

    if (opinion > 50 || ideoDist < 20 || maxTrustScore > 60 || sharesTrade) {
      // Must not be an adversary to be a reliable ally
      if (!adversaries[otherId]) {
        reliableAllies[otherId] = true;
      }
    }

    // 3. Identify Distraction Targets
    // Nations at war with others (but not us), high unrest (> 65), or active economic debt stress (> 50)
    const otherWarsWithOthers = otherCountry.atWarWith.filter(wId => wId !== countryId);
    const otherUnrest = otherCountry.political.popularUnrest ?? 0;
    const otherDebtStress = otherCountry.economic.debtStressIndex ?? 0;

    if (otherWarsWithOthers.length > 0 || otherUnrest > 65 || otherDebtStress > 50) {
      let desc = '';
      if (otherWarsWithOthers.length > 0) {
        desc += `At war with ${otherWarsWithOthers.join(', ')}. `;
      }
      if (otherUnrest > 65) {
        desc += `Experiencing high civil unrest (${otherUnrest}%). `;
      }
      if (otherDebtStress > 50) {
        desc += `Severe sovereign debt stress (${otherDebtStress}%). `;
      }
      distractionTargets[otherId] = desc.trim();
    }

    // 4. Detect Apparent Deception Postures
    // Check if otherId is running SIGNAL_CONCILIATION but has high covertPropensity and MOBILIZE_COVERT_ASSETS
    const otherAgent = sovereignStates[otherId];
    if (otherAgent) {
      const otherPlan = otherAgent.activePlan;
      const otherCovertPropensity = otherAgent.identity?.security?.covertPropensity ?? 50;

      if (otherPlan) {
        const hasConciliation = otherPlan.steps.some(step => step.actionType === 'SIGNAL_CONCILIATION' && !step.completed);
        const hasCovertMobilization = otherPlan.steps.some(step => step.actionType === 'MOBILIZE_COVERT_ASSETS');

        if (hasConciliation && otherCovertPropensity > 55 && hasCovertMobilization) {
          apparentDeceptionPostures[otherId] = 'DECEPTIVE';
        } else if (hasConciliation && otherCovertPropensity <= 50) {
          apparentDeceptionPostures[otherId] = 'TRANSPARENT';
        } else {
          apparentDeceptionPostures[otherId] = 'UNCERTAIN';
        }
      } else {
        apparentDeceptionPostures[otherId] = 'UNCERTAIN';
      }
    } else {
      apparentDeceptionPostures[otherId] = 'UNCERTAIN';
    }
  });

  // 5. Compute perceivedRegionalTensions
  // Weighted average of threat scores for nations on the same continent as analyzing agent
  let totalThreatWeight = 0;
  let countThreatNeighbors = 0;

  Object.keys(worldDraft.countries).forEach((otherId) => {
    if (otherId === countryId) return;
    const otherCountry = worldDraft.countries[otherId];
    if (otherCountry && otherCountry.continent === country.continent) {
      let neighborThreat = 15; // default moderate baseline

      // opinion modifier
      const opinionNeighbor = country.opinions[otherId] ?? 0;
      if (opinionNeighbor < 0) {
        neighborThreat += Math.abs(opinionNeighbor) * 0.5; // up to +50
      }

      // active war modifier
      if (otherCountry.atWarWith.length > 0) {
        neighborThreat += 30;
      }

      // threat memory modifier
      if (agent && agent.threatMemory) {
        const records = agent.threatMemory.filter(tm => tm.targetCountryId === otherId);
        if (records.length > 0) {
          neighborThreat += Math.max(...records.map(tm => tm.severityScore)) * 0.3;
        }
      }

      totalThreatWeight += Math.min(100, neighborThreat);
      countThreatNeighbors++;
    }
  });

  const perceivedRegionalTensions = countThreatNeighbors > 0 
    ? Math.round(totalThreatWeight / countThreatNeighbors)
    : 20;

  return {
    countryId,
    adversaries,
    reliableAllies,
    distractionTargets,
    perceivedRegionalTensions: Math.max(0, Math.min(100, perceivedRegionalTensions)),
    apparentDeceptionPostures
  };
}
