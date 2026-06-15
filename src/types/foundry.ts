export type CommodityType = 'oil' | 'gas' | 'semiconductors' | 'food' | 'rareearths' | 'strategic';

export type RouteMode = 'maritime' | 'pipeline' | 'land' | 'manufacturing' | 'mixed';

export type RouteStatus = 'STABLE' | 'STRESSED' | 'REROUTED' | 'BLOCKED';

export type ChokepointStatus = 'SECURE' | 'CONGESTED' | 'BLOCKED';

export interface CommodityFlow {
  id: string;
  commodityType: CommodityType;
  sourceCountryId: string;
  destinationCountryId: string;
  transitPath: string[]; // List of intermediate countries / transit states
  transitChokepointIds: string[]; // Chokepoints crossed
  mode: RouteMode;
  volumeScore: number; // 0-100 (amount of throughput)
  strategicImportance: number; // 0-100 (criticality to importer/exporter)
  substitutability: number; // 0-100 (availability of alternate partners)
  disruptionSensitivity: number; // 0-100 (vulnerability level)
  routeStatus: RouteStatus;
  linkedTreatyIds: string[];
  linkedWorldEventIds: string[];
  linkedIntelFactIds: string[];
  lastChangedTick: number;
  dependenciesSummary: string;
}

export interface Chokepoint {
  id: string; // e.g. 'hormuz', 'malacca', 'suez', 'panama', 'taiwan_strait', 'bosphorus', 'bab_el_mandeb'
  name: string;
  coordinates: { x: number; y: number }; // Relative coordinate mapping for visual layout overlay
  chokepointType: 'strait' | 'canal' | 'corridor' | 'hub';
  connectedCommodities: CommodityType[];
  throughputImportance: number; // 0-100
  exposureScore: number; // 0-100 (calculated dynamic exposure risk)
  controllingCountryIds: string[]; // Adjacent/controlling sovereign entities
  vulnerabilityTags: string[];
  currentDisruptionStatus: ChokepointStatus;
  strategicSummary: string;
}

export interface SupplyDependencyRecord {
  countryId: string;
  commodityType: CommodityType;
  dependenceRatio: number; // 0-100%
  primarySourceCountryId: string;
  primaryRouteId: string;
  chokepointExposureScore: number; // 0-100
  substituteAvailability: 'NONE' | 'LIMITED' | 'SUFFICIENT';
  resilienceRating: number; // 0-100% (strategic stockpile depth etc)
}

export interface DisruptionSignal {
  id: string;
  type: 'SUPPLY_ROUTE_DISRUPTED' | 'CHOKEPOINT_STRESSED' | 'COMMODITY_SHORTAGE_RISK_RISING' | 'ENERGY_FLOW_IMPAIRED' | 'FOOD_IMPORT_VULNERABILITY_SPIKE' | 'SEMICONDUCTOR_CHAIN_STRAIN' | 'STRATEGIC_MATERIAL_BOTTLENECK';
  countryId: string;
  commodityType: CommodityType;
  severity: number; // 0-100
  durationTicks: number; // dynamic persistence
  sourceId: string; // flow ID or chokepoint ID of the trigger
  description: string;
  affectedSystems: string[]; // e.g. ['MILITARY_READINESS', 'GDP_OUTPUT', 'POPULAR_STABILITY']
}

export interface ImpactPreview {
  actionType: 'EMBARGO' | 'SANCTION' | 'INTERDICTION' | 'ROUTE_CLOSURE';
  actorCountryId: string;
  targetCountryId: string;
  affectedCommodities: CommodityType[];
  disruptionSeverity: number; // 0-100
  firstOrderEconomicImpact: string;
  firstOrderMilitaryImpact: string;
  diplomaticFalloutRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedAllies: string[];
  expectRerouting: boolean;
  reroutingDelayTicks: number;
  confidenceLabel: 'LOW' | 'MEDIUM' | 'HIGH';
}
