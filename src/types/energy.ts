export type EnergySourceType = 'oil' | 'gas' | 'coal' | 'nuclear' | 'hydro' | 'solar' | 'wind';

export interface EnergySourceState {
  type: EnergySourceType;
  domesticProduction: number;      // Mtoe or units
  domesticConsumption: number;     // Mtoe or units
  importRequirement: number;       // positive if needs imports, negative if surplus exporter
  substitutability: number;        // 1-10 difficulty to replace
  stressSensitivity: number;       // 0-100 baseline vulnerability
  strategicImportance: number;     // 1-10 priority (e.g. oil/gas high, solar/wind growing)
  disruptionConsequences: string[]; // custom indicators (e.g. "Industrial power outages", "Transport cost spike")
}

export interface EnergyImportDependency {
  sourceType: EnergySourceType;
  supplierCountryId: string;
  volumeMtoe: number;              // volume imported
  routeId: string;                 // segment or node ID representing the main route (from tradeStore or road/lane ID)
  routeType: 'pipeline' | 'sealane' | 'port' | 'corridor' | 'mixed';
  routeChokepointRisk: number;     // 0-100 risk score
  rerouteFlexibility: number;      // 0-100 ease of rerouting (pipeline is low, tanker/oil is high)
  isDisrupted: boolean;
  actualDeliveryPct: number;       // 100% is normal, can drift down during embargo or blockage
}

export interface EnergyExportProfile {
  sourceType: EnergySourceType;
  recipientCountryId: string;
  volumeMtoe: number;
  routeId: string;
}

export interface EnergyVulnerabilityProfile {
  vulnerabilityScore: number;      // 0-100
  diversificationScore: number;    // 0-100 (high is good, meaning diversified sources/suppliers)
  routeConcentrationScore: number; // 0-100 (high is risky, meaning dependent on one chokepoint)
  embargoSensitivity: number;      // 0-100
  rerouteFlexibilityScore: number; // 0-100
  criticalDrivers: string[];       // top reasons for exposure/vulnerability
}

export interface EnergyRerouteOption {
  sourceType: EnergySourceType;
  alternativeSupplierId: string;
  routeId: string;
  availableCapacityFraction: number; // 0.0 - 1.0
  frictionCostMultiplier: number;    // e.g. 1.25 representing longer route costing more
  coerciveRiskScore: number;         // 0-100 vulnerability with alternative supplier
}

export interface EnergyEmbargoAction {
  id: string;
  actorCountryId: string;
  targetCountryId: string;
  affectedSources: EnergySourceType[];
  affectedRoutes: string[];          // routes locked down
  intensity: number;                 // 0-100 % enforcement
  tickEnacted: number;
  isActive: boolean;
}

export interface EnergyStressRecord {
  householdStress: number;           // 0-100 (hitting heating, power bills)
  industrialStress: number;          // 0-100 (factory slowdowns, power allocation)
  strategicStress: number;           // 0-100 (drawdowns of state strategic reserves)
  aggregatedStressScore: number;     // 0-100 combined
  lastShockTick: number;
}

export interface EnergyShockRecord {
  id: string;
  countryId: string;
  sourceType: EnergySourceType;
  impactGdpFallPercent: number;
  impactInflationPercent: number;
  unemploymentSpikePercent: number;
  socialFragilityDelta: number;
  description: string;
  tickOccurred: number;
}

export interface CountryEnergyProfile {
  countryId: string;
  sourceStates: Record<EnergySourceType, EnergySourceState>;
  totalEnergyProduction: number;   // Gross output
  totalEnergyConsumption: number;  // Gross usage
  energySufficiencyIndex: number;  // 0-100% or above (representing domestic / demand ratio)
  importDependencyPct: number;     // 0-100 percentage exposed externally
  exportRole: 'EXPORTER' | 'IMPORTER' | 'BALANCED' | 'SELF_SUFFICIENT';
  
  // Scoring
  diversificationScore: number;
  dependencyScore: number;
  vulnerabilityScore: number;
  resilienceScore: number;
  domesticStressScore: number;
  
  // Sectoral Exposure
  industrialEnergyExposure: number; // 0-100
  householdStressExposure: number;  // 0-100
  routeConcentration: number;       // 0-100
  strategicBufferDays: number;      // size of country supply buffer e.g. 90 days EPR
  recoveryAdaptationMomentum: number; // 0-100
  lastUpdatedTick: number;

  dependencies: EnergyImportDependency[];
  activeEmbargoes: EnergyEmbargoAction[];
  stressState: EnergyStressRecord;
}

export interface EnergyDependencyGraphNode {
  id: string;
  label: string;
  flag: string;
  type: 'SUPPLIER' | 'CONSUMER' | 'BALANCED';
  energyVulnerability: number;
  energyStress: number;
}

export interface EnergyDependencyGraphEdge {
  id: string;
  source: string;                  // supplier
  target: string;                  // importer
  sourceType: EnergySourceType;
  volumeMtoe: number;
  routeType: 'pipeline' | 'sealane' | 'port' | 'corridor' | 'mixed';
  routeId: string;
  isDisrupted: boolean;
  flowPct: number;                 // current actual vs contracted flow
}

export interface EnergyIncident {
  id: string;
  tick: number;
  type: 'EMBARGO_IMPOSED' | 'GAS_FLOW_DISRUPTED' | 'PIPELINE_DEPENDENCY_EXPOSED' | 'ENERGY_REROUTE_ATTEMPTED' | 'DOMESTIC_ENERGY_STRESS_ESCALATED' | 'ENERGY_VULNERABILITY_THRESHOLD_CROSSED' | 'ENERGY_BUFFER_IMPROVED' | 'ENERGY_SHOCK_MACRO_SPILLOVER';
  actorCountryId: string;
  targetCountryId?: string;
  routeId?: string;
  sourceType?: EnergySourceType;
  summary: string;
  economicSeverity: 'MINIMAL' | 'STRESSED' | 'SEVERE';
}
