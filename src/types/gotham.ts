import { ScenarioId } from '../types';

export type RelationshipDimension = 'trade' | 'ideology' | 'military' | 'treaty' | 'hostility';

export interface ForecastSignal {
  type: 'PROVOCATION_RISK' | 'ALLIANCE_STRAIN' | 'PRESSURE_OPPORTUNITY';
  score: number; // 0-100
  drivers: string[];
  confidenceLabel: 'LOW' | 'MEDIUM' | 'HIGH';
  trendDirection: 'STABLE' | 'RISING' | 'DECAYING';
  mitigations?: string[];
}

export interface RelationshipChangeRecord {
  tick: number;
  dimension: RelationshipDimension | 'ALL';
  changeType: 'IMPROVED' | 'DETERIORATED' | 'STABILIZED' | 'INITIALIZED';
  description: string;
  linkedEventId?: string;
  linkedIntelId?: string;
  linkedTreatyId?: string;
}

export interface GraphNodeMetrics {
  degree: number;
  centrality: number; // calculated centrality proxy (0-1)
  dependencyCount: number; // count of states dependent on this node
  vulnerabilityIndex: number; // calculated exposure rating (0-100)
}

export interface GraphNode {
  countryId: string;
  displayName: string;
  region: string;
  blocTags: string[];
  currentStrategicPostureSummary: string;
  aggregateInfluenceScore: number; // 0-100 derived
  riskFlags: string[];
  graphMetrics: GraphNodeMetrics;
}

export interface GraphEdge {
  id: string; // source_target
  sourceCountryId: string;
  targetCountryId: string;
  directional: boolean; // many ties are asymmetric
  activeDimensions: RelationshipDimension[];
  
  // Dimensional raw scores (0 to 100)
  tradeScore: number;             // Economic interdependence, exposure, depth
  ideologyScore: number;          // Regime affinity, matching values
  militaryLinkScore: number;      // Defense alignment, basing, command ties
  treatyObligationScore: number;  // binding commitments
  covertHostilityScore: number;   // shadow conflict, subversion

  // Aggregated evaluation indexes (0 to 100)
  overallAffinityScore: number;   // friendship proxy
  overallTensionScore: number;    // conflict proxy
  dependencyScore: number;        // unidirectional exposure
  volatilityScore: number;        // fluctuations trigger likelihood

  visibility: 'PUBLIC' | 'CLASSIFIED' | 'PLAYER_ONLY';
  lastChangedTick: number;
  changeReasons: RelationshipChangeRecord[];
  
  linkedWorldEventIds: string[];
  linkedIntelFactIds: string[];
  linkedTreatyIds: string[];
  linkedOperationIds: string[];
  
  relationshipStatus: string;    // Label e.g., "Militant Bloc Ally", "Proxy Rivalry", "Symmetric Trade Dependency"
  forecastSignals: ForecastSignal[];
}

export interface RelationshipSnapshot {
  tick: number;
  scenarioId: ScenarioId;
  edges: Omit<GraphEdge, 'changeReasons'>[];
}
