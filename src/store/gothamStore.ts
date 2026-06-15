import { create } from 'zustand';
import { produce } from 'immer';
import { ScenarioId, WorldState, Country } from '../types';
import { GraphNode, GraphEdge, RelationshipDimension, ForecastSignal, RelationshipChangeRecord, RelationshipSnapshot } from '../types/gotham';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';

interface GothamState {
  selectedNodeId: string | null;   // focused country
  selectedEdgeId: string | null;   // focused connection e.g. "US-CN"
  activeLens: RelationshipDimension | 'blended' | 'rivalry' | 'dependency';
  gothamActive: boolean;
  minTensionThreshold: number;     // slider state: 0 to 100
  regionalFilter: 'ALL' | 'Middle East' | 'Asia' | 'Europe' | 'North America' | 'Africa';
  changeLog: RelationshipChangeRecord[];
  snapshots: RelationshipSnapshot[];
  showStrongOnly: boolean;
}

interface GothamActions {
  setSelectedNodeId: (nodeId: string | null) => void;
  setSelectedEdgeId: (edgeId: string | null) => void;
  setActiveLens: (lens: RelationshipDimension | 'blended' | 'rivalry' | 'dependency') => void;
  setGothamActive: (active: boolean) => void;
  setFilters: (filters: Partial<Pick<GothamState, 'minTensionThreshold' | 'regionalFilter' | 'showStrongOnly'>>) => void;
  addChangeRecord: (record: Omit<RelationshipChangeRecord, 'tick'>) => void;
  tickGotham: (tick: number) => void;
  getSymmetricKey: (c1: string, c2: string) => string;
  synthesizeGraph: () => { nodes: GraphNode[]; edges: GraphEdge[] };
  getRivalryChain: (startCountryId: string) => string[];
  getInfluenceChain: (startCountryId: string) => string[];
}

export const useGothamStore = create<GothamState & GothamActions>((set, get) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  activeLens: 'blended',
  gothamActive: false,
  minTensionThreshold: 0,
  regionalFilter: 'ALL',
  showStrongOnly: false,
  changeLog: [
    { tick: 0, dimension: 'treaty', changeType: 'INITIALIZED', description: 'NATO Article 5 mutual defense structures synchronized under collective command systems.' },
    { tick: 0, dimension: 'hostility', changeType: 'INITIALIZED', description: 'High covert friction registered within the Jerusalem-Tehran cyber axis.' },
    { tick: 0, dimension: 'trade', changeType: 'INITIALIZED', description: 'Silicon and chip supply chains verified between Taipei and US West Coast terminal hubs.' },
  ],
  snapshots: [],

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  setSelectedEdgeId: (edgeId) => set({ selectedEdgeId: edgeId }),
  setActiveLens: (lens) => set({ activeLens: lens }),
  setGothamActive: (active) => set({ gothamActive: active }),
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),

  getSymmetricKey: (c1: string, c2: string) => {
    return [c1, c2].sort().join('-');
  },

  addChangeRecord: (record) => set(produce((draft: GothamState) => {
    const tick = useWorldStore.getState().currentTick;
    draft.changeLog.unshift({
      tick,
      ...record
    });
    // Cap log
    if (draft.changeLog.length > 200) {
      draft.changeLog.pop();
    }
  })),

  tickGotham: (tick) => set(produce((draft: GothamState) => {
    const worldState = useWorldStore.getState();
    const activeScenario = usePlayerStore.getState().activeScenario;

    // Compile a snapshot of the current state of synthesized edges
    const graphData = get().synthesizeGraph();
    const snapshotEdges = graphData.edges.map(e => {
      const { changeReasons, ...rest } = e;
      return rest;
    });

    draft.snapshots.push({
      tick,
      scenarioId: activeScenario,
      edges: snapshotEdges
    });

    // Keep last 30 snapshots for timeline graph lookup
    if (draft.snapshots.length > 30) {
      draft.snapshots.shift();
    }

    // Dynamic state-change listeners & timeline assertions:
    // If a war was recently declared, log a trade embargo and military pivot
    const latestLogs = worldState.globalEventLog.filter(log => log.tick === tick);
    latestLogs.forEach(log => {
      const text = log.text.toUpperCase();
      
      if (text.includes("WAR") && text.includes("DECLARE")) {
        // Find who declared on who
        const countries = Object.keys(worldState.countries);
        const resolved: string[] = [];
        countries.forEach(id => {
          if (text.includes(id) || text.includes(worldState.countries[id].name.toUpperCase())) {
            resolved.push(id);
          }
        });

        if (resolved.length >= 2) {
          const [c1, c2] = resolved;
          draft.changeLog.unshift({
            tick,
            dimension: 'hostility',
            changeType: 'DETERIORATED',
            description: `Active military declarations have ruptured trade lanes and generated an immediate flashpoint trigger between ${c1} and ${c2}.`,
            linkedEventId: `war_${tick}_${c1}_${c2}`
          });
          draft.changeLog.unshift({
            tick,
            dimension: 'trade',
            changeType: 'DETERIORATED',
            description: `Bilateral embargo actions declared between ${c1} and ${c2} following outbreak of direct combat operations.`
          });
        }
      } else if (text.includes("SANCTION") || text.includes("EMBARGO")) {
        // Sanctions occurred
        draft.changeLog.unshift({
          tick,
          dimension: 'trade',
          changeType: 'DETERIORATED',
          description: `Sovereign trade sanctions enforced globally. Trade exposure volatility index shifted higher.`
        });
      } else if (text.includes("CYBER") && text.includes("ATTRIBUTION")) {
        draft.changeLog.unshift({
          tick,
          dimension: 'hostility',
          changeType: 'DETERIORATED',
          description: `Digital cyber penetration confirmed and attributed to hostile state actors. Defensive firewall structures elevated system-wide.`,
          linkedEventId: `cyber_${tick}`
        });
      }
    });
  })),

  getRivalryChain: (startCountryId: string) => {
    const worldState = useWorldStore.getState();
    const c = worldState.countries[startCountryId];
    if (!c) return [];

    const visited = new Set<string>();
    const chain: string[] = [startCountryId];
    visited.add(startCountryId);

    // Iteratively trace strongest local rivals
    let currentId = startCountryId;
    for (let depth = 0; depth < 4; depth++) {
      const activeState = worldState.countries[currentId];
      if (!activeState) break;

      // Rivals from canonical world list: `rivalIds` or lowest opinion
      let worstOpinionId = '';
      let worstOpinion = 0;

      // Examine opinions
      Object.keys(activeState.opinions).forEach(otherId => {
        if (!visited.has(otherId) && activeState.opinions[otherId] < worstOpinion) {
          worstOpinion = activeState.opinions[otherId];
          worstOpinionId = otherId;
        }
      });

      if (worstOpinionId && worstOpinion < -25) {
        chain.push(worstOpinionId);
        visited.add(worstOpinionId);
        currentId = worstOpinionId;
      } else {
        break;
      }
    }

    return chain;
  },

  getInfluenceChain: (startCountryId: string) => {
    const worldState = useWorldStore.getState();
    const c = worldState.countries[startCountryId];
    if (!c) return [];

    const visited = new Set<string>();
    const chain: string[] = [startCountryId];
    visited.add(startCountryId);

    // Trace dependency projection. e.g. Larger GDP powers (US, CN) projecting onto surrounding client states
    let currentId = startCountryId;
    for (let depth = 0; depth < 4; depth++) {
      const activeState = worldState.countries[currentId];
      if (!activeState) break;

      // Find other states that list currentId as a trade partner, have low GDP, and are in same alliance
      let dependentId = '';
      let highestInfluenceMatch = 0;

      Object.keys(worldState.countries).forEach(otherId => {
        if (!visited.has(otherId)) {
          const otherCountry = worldState.countries[otherId];
          let score = 0;
          if (otherCountry.allianceBlock === activeState.allianceBlock && otherCountry.allianceBlock !== 'NEUTRAL') {
            score += 30;
          }
          if (otherCountry.tradePartners.includes(currentId)) {
            score += 20;
          }
          if (activeState.economic.gdpB > otherCountry.economic.gdpB * 8) {
            score += 25;
          }
          if (score > highestInfluenceMatch) {
            highestInfluenceMatch = score;
            dependentId = otherId;
          }
        }
      });

      if (dependentId && highestInfluenceMatch > 35) {
        chain.push(dependentId);
        visited.add(dependentId);
        currentId = dependentId;
      } else {
        break;
      }
    }

    return chain;
  },

  synthesizeGraph: () => {
    const worldState = useWorldStore.getState();
    const playerStore = usePlayerStore.getState();
    const currentTick = worldState.currentTick;
    const countries = worldState.countries;

    const listCountryIds = Object.keys(countries);
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const symmetricPairsDone = new Set<string>();

    // 1. Synthesize Nodes
    listCountryIds.forEach(id => {
      const c = countries[id];
      if (!c) return;

      // Calculate simple graph metrics
      const degree = c.tradePartners.length + (c.allianceBlock !== 'NEUTRAL' ? 3 : 0);
      const hostiles = listCountryIds.filter(otherId => (c.opinions[otherId] || 0) < -40).length;
      const vulnerabilityIndex = Math.min(100, Math.max(0, 
        (100 - (c.political?.stabilityIndex ?? 50)) * 0.4 + 
        (c.economic?.debtStressIndex ?? 10) * 0.3 + 
        hostiles * 8
      ));

      // Calculate aggregate influence proxy score (0-100)
      const gdpScalar = Math.min(45, (c.economic.gdpB / 28000) * 45);
      const militaryScalar = Math.min(45, ((c.arsenal?.totalPowerRating ?? 50) / 1000) * 45);
      const aggregateInfluenceScore = Math.round(gdpScalar + militaryScalar + (c.allianceBlock !== 'NEUTRAL' ? 10 : 0));

      const riskFlags: string[] = [];
      if (vulnerabilityIndex > 65) riskFlags.push('HIGH_VULNERABILITY');
      if (c.haarpActive) riskFlags.push('HAARP_INTERFERENCE');
      if (c.atWarWith.length > 0) riskFlags.push('ACTIVE_WARFRONT');
      if ((c.political?.popularUnrest ?? 0) > 70) riskFlags.push('POPULAR_UNREST');
      if (c.arsenal.nuclearCapable) riskFlags.push('NUCLEAR_POWER');

      let currentStrategicPostureSummary = 'NON-ALIGNED PRAGMATISM';
      if (c.atWarWith.length > 0) currentStrategicPostureSummary = 'ACTIVE MILITARY MOBILIZATION';
      else if (c.allianceBlock === 'NATO') currentStrategicPostureSummary = 'COLLECTIVE DEFENSE ALIGNMENT';
      else if (c.allianceBlock === 'SCO') currentStrategicPostureSummary = 'MULTIPOLAR SECURITY INTEGRATION';
      else if (c.opinions['US'] < -60 || c.opinions['CN'] < -60) currentStrategicPostureSummary = 'CONTAINMENT COUNTER-POSTURING';

      nodes.push({
        countryId: id,
        displayName: c.name,
        region: c.continent || 'Global Area',
        blocTags: c.allianceBlock !== 'NEUTRAL' ? [c.allianceBlock] : [],
        currentStrategicPostureSummary,
        aggregateInfluenceScore,
        riskFlags,
        graphMetrics: {
          degree,
          centrality: Math.min(1, Math.max(0.1, degree / 15)),
          dependencyCount: listCountryIds.filter(otherId => countries[otherId]?.tradePartners.includes(id)).length,
          vulnerabilityIndex: Math.round(vulnerabilityIndex)
        }
      });
    });

    // 2. Synthesize Edges (all pairs)
    for (let i = 0; i < listCountryIds.length; i++) {
      for (let j = i + 1; j < listCountryIds.length; j++) {
        const c1Id = listCountryIds[i];
        const c2Id = listCountryIds[j];
        const c1 = countries[c1Id];
        const c2 = countries[c2Id];

        // Ensure we only process if both are valid and symmetric key has not been processed
        const key = `${c1Id}-${c2Id}`;
        if (symmetricPairsDone.has(key)) continue;
        symmetricPairsDone.add(key);

        const opinionC1 = c1.opinions[c2Id] ?? 0;
        const opinionC2 = c2.opinions[c1Id] ?? 0;

        // Model dimensions
        // tradeDimension
        let tradeScore = 20; // baseline random residual trade exposure
        if (c1.tradePartners.includes(c2Id) || c2.tradePartners.includes(c1Id)) {
          tradeScore += 55;
        }
        // scale with GDP profiles
        const combinedGDP = (c1.economic.gdpB + c2.economic.gdpB);
        tradeScore += Math.min(25, (combinedGDP / 35000) * 25);
        if (c1.atWarWith.includes(c2Id) || c2.atWarWith.includes(c1Id)) {
          tradeScore = 0; // complete cut during warfare
        }
        tradeScore = Math.min(100, Math.max(0, Math.round(tradeScore)));

        // ideologyDimension
        let ideologyScore = 30; // base values mismatch deviation
        if (c1.political?.ideology === c2.political?.ideology) {
          ideologyScore = 90;
        } else {
          const bothDemoc = c1.political?.ideology === 'DEMOCRACY' && c2.political?.ideology === 'DEMOCRACY';
          const bothAuthor = c1.political?.ideology !== 'DEMOCRACY' && c2.political?.ideology !== 'DEMOCRACY';
          if (bothDemoc) ideologyScore = 95;
          else if (bothAuthor) ideologyScore = 65; // authoritarians have transactional alignment
        }
        ideologyScore = Math.min(100, Math.max(0, Math.round(ideologyScore)));

        // militaryLinkScore
        let militaryLinkScore = 15;
        const sameAlliance = c1.allianceBlock === c2.allianceBlock && c1.allianceBlock !== 'NEUTRAL';
        if (sameAlliance) {
          militaryLinkScore += 65;
          if (c1.allianceBlock === 'NATO') militaryLinkScore += 15; // deeper interoperability
        }
        const activeWar = c1.atWarWith.includes(c2Id) || c2.atWarWith.includes(c1Id);
        if (activeWar) {
          militaryLinkScore = 0;
        } else {
          // positive security assistance
          militaryLinkScore += Math.max(0, (opinionC1 + opinionC2) / 4);
        }
        militaryLinkScore = Math.min(100, Math.max(0, Math.round(militaryLinkScore)));

        // treatyObligationScore
        let treatyObligationScore = 10;
        if (sameAlliance) {
          treatyObligationScore += 70;
        }
        // Check active treaties in canonicalWorld
        if (worldState.world?.treatiesById) {
          Object.values(worldState.world.treatiesById).forEach(treaty => {
            if (treaty.status === 'ACTIVE' && treaty.signatoryCountryIds.includes(c1Id) && treaty.signatoryCountryIds.includes(c2Id)) {
              treatyObligationScore += 35;
            }
          });
        }
        treatyObligationScore = Math.min(100, Math.max(0, Math.round(treatyObligationScore)));

        // covertHostilityScore
        let covertHostilityScore = 10;
        if (activeWar) {
          covertHostilityScore += 85;
        } else {
          const avgNegativeOpinion = -((opinionC1 + opinionC2) / 2);
          if (avgNegativeOpinion > 0) {
            covertHostilityScore += avgNegativeOpinion * 0.75;
          }
          // Factor in cyber activities, covert operations
          if (c1.intelligence?.knownThreats?.includes(c2Id) || c2.intelligence?.knownThreats?.includes(c1Id)) {
            covertHostilityScore += 25;
          }
        }
        covertHostilityScore = Math.min(100, Math.max(0, Math.round(covertHostilityScore)));

        // Aggregated indexes
        const overallAffinityScore = Math.max(0, Math.min(100, Math.round(
          (tradeScore * 0.25) + (ideologyScore * 0.2) + (militaryLinkScore * 0.3) + (treatyObligationScore * 0.25) - (covertHostilityScore * 0.3)
        )));

        const overallTensionScore = Math.max(0, Math.min(100, Math.round(
          covertHostilityScore * 0.6 + (100 - overallAffinityScore) * 0.4
        )));

        // Volatility: scale with hostility, leader aggression
        const volatilityScore = Math.max(10, Math.min(100, Math.round(
          overallTensionScore * 0.6 + (sameAlliance ? 10 : 30)
        )));

        // Asymmetric dependency calculation (one way is higher than another)
        // Taiwanese chips logic, or oil flow depend (RU exporter to CN/Europe, SA exporter)
        let dependencyScore = 0;
        if (c1.economic.gdpB > c2.economic.gdpB * 6) {
          dependencyScore = 55; // smaller country has dependency
        } else if (c2.economic.gdpB > c1.economic.gdpB * 6) {
          dependencyScore = 55;
        }
        if (c1Id === 'TW' || c2Id === 'TW') dependencyScore = Math.max(dependencyScore, 85); // Chip focus
        if (c1Id === 'SA' || c2Id === 'SA') dependencyScore = Math.max(dependencyScore, 75); // Oil focus

        // Build active dimensions list
        const activeDimensions: RelationshipDimension[] = [];
        if (tradeScore > 40) activeDimensions.push('trade');
        if (ideologyScore > 50) activeDimensions.push('ideology');
        if (militaryLinkScore > 40) activeDimensions.push('military');
        if (treatyObligationScore > 40) activeDimensions.push('treaty');
        if (covertHostilityScore > 35) activeDimensions.push('hostility');

        // Label status matching
        let relationshipStatus = 'Stable Neutral';
        if (activeWar) relationshipStatus = 'Active Warfront';
        else if (sameAlliance && overallAffinityScore >= 75) relationshipStatus = 'Ironclad Alliance';
        else if (sameAlliance && overallTensionScore >= 50) relationshipStatus = 'Alliance Friction';
        else if (covertHostilityScore >= 70) relationshipStatus = 'Strategic Rivalry';
        else if (tradeScore >= 75 && overallTensionScore < 35) relationshipStatus = 'Economic Partnership';
        else if (dependencyScore >= 70) relationshipStatus = 'Asymmetric Dependency';
        else if (overallTensionScore >= 60) relationshipStatus = 'Frozen Conflict';

        // Forecast signals
        const forecastSignals: ForecastSignal[] = [];
        
        // Signal #1: Provocation Risk
        if (overallTensionScore > 55) {
          forecastSignals.push({
            type: 'PROVOCATION_RISK',
            score: Math.round(overallTensionScore * 0.95 + volatilityScore * 0.1),
            drivers: ['Elevated regional posturing', 'Direct territorial claims friction', 'Border alert escalation threat'],
            confidenceLabel: overallTensionScore > 75 ? 'HIGH' : 'MEDIUM',
            trendDirection: volatilityScore > 70 ? 'RISING' : 'STABLE'
          });
        }

        // Signal #2: Alliance Strain
        if (sameAlliance && overallTensionScore > 30) {
          forecastSignals.push({
            type: 'ALLIANCE_STRAIN',
            score: Math.round(overallTensionScore * 1.2),
            drivers: ['Diverging economic priorities', 'Incompatible sovereign red-lines', 'Sub-system ideological misalignment'],
            confidenceLabel: 'MEDIUM',
            trendDirection: 'RISING'
          });
        }

        // Signal #3: Pressure Opportunities
        if (dependencyScore > 50 && overallTensionScore > 35) {
          forecastSignals.push({
            type: 'PRESSURE_OPPORTUNITY',
            score: Math.round(dependencyScore * 0.8 + overallTensionScore * 0.3),
            drivers: ['Exposed raw commodity sourcing routes', 'Symmetric leverage asymmetries', 'Unilateral supply chain bottlenecks'],
            confidenceLabel: 'HIGH',
            trendDirection: 'STABLE'
          });
        }

        // Retrieve pre-seeded history reasons
        const changeReasons: RelationshipChangeRecord[] = get().changeLog.filter(record => {
          const descLower = record.description.toLowerCase();
          return descLower.includes(c1Id.toLowerCase()) && descLower.includes(c2Id.toLowerCase());
        });

        edges.push({
          id: key,
          sourceCountryId: c1Id,
          targetCountryId: c2Id,
          directional: dependencyScore > 50,
          activeDimensions,
          tradeScore,
          ideologyScore,
          militaryLinkScore,
          treatyObligationScore,
          covertHostilityScore,
          overallAffinityScore,
          overallTensionScore,
          dependencyScore,
          volatilityScore,
          visibility: 'PUBLIC',
          lastChangedTick: currentTick,
          changeReasons,
          linkedWorldEventIds: activeWar ? [`war_evt_${key}`] : [],
          linkedIntelFactIds: [],
          linkedTreatyIds: sameAlliance ? [`treaty_${c1.allianceBlock}`] : [],
          linkedOperationIds: [],
          relationshipStatus,
          forecastSignals
        });
      }
    }

    return { nodes, edges };
  }
}));
