import { create } from 'zustand';
import { produce } from 'immer';
import { 
  CountryEnergyProfile, 
  EnergySourceType, 
  EnergySourceState, 
  EnergyImportDependency, 
  EnergyEmbargoAction, 
  EnergyStressRecord, 
  EnergyIncident,
  EnergyDependencyGraphNode,
  EnergyDependencyGraphEdge
} from '../types/energy';
import { useWorldStore } from './worldStore';
import { useArachneStore } from './arachneStore';

export interface EnergyEmbargoPreview {
  actorCountryId: string;
  targetCountryId: string;
  affectedSources: EnergySourceType[];
  directValueExposureB: number;
  expectedImportLossPct: number;
  expectedRerouteSharePct: number;
  estimatedDomesticStressIncrease: number;
  estimatedGdpImpactPercent: number;
  estimatedInflationImpactPercent: number;
  alternateSuppliersAvailable: string[];
  confidenceScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface EnergyState {
  profiles: Record<string, CountryEnergyProfile>;
  incidents: EnergyIncident[];
  selectedCountryId: string;
  compareSupplierId: string | null;
  activeEmbargoes: EnergyEmbargoAction[];
  
  // UI Overlays
  activeMapOverlay: 'NONE' | 'VULNERABILITY' | 'STRESS' | 'DIVERSIFICATION' | 'OIL_DEPENDENCE' | 'GAS_DEPENDENCE' | 'PIPES';
}

interface EnergyActions {
  setSelectedCountryId: (id: string) => void;
  setCompareSupplierId: (id: string | null) => void;
  setActiveMapOverlay: (overlay: EnergyState['activeMapOverlay']) => void;
  
  // Policy actions
  calculateEmbargoPreview: (
    actor: string,
    target: string,
    sources: EnergySourceType[]
  ) => EnergyEmbargoPreview;
  
  imposeEnergyEmbargo: (
    actor: string,
    target: string,
    sources: EnergySourceType[]
  ) => void;
  
  liftEnergyEmbargo: (id: string) => void;
  
  // Disaster / Coercion triggers
  triggerPipelineRupture: (routeId: string, label: string) => void;
  bufferStrategicReserves: (countryId: string, amountDays: number) => void;
  
  // Main engines
  recomputeAllMetrics: () => void;
  tickEnergySystem: (currentTick: number) => void;
  getDependencyGraph: () => { nodes: EnergyDependencyGraphNode[]; edges: EnergyDependencyGraphEdge[] };
}

// Initializing helper for default 7 sources
const makeDefaultSources = (
  countryId: string,
  oilProd: number, oilCons: number,
  gasProd: number, gasCons: number,
  coalProd: number, coalCons: number,
  nuclear: number, hydro: number, solar: number, wind: number
): Record<EnergySourceType, EnergySourceState> => {
  return {
    oil: {
      type: 'oil',
      domesticProduction: oilProd,
      domesticConsumption: oilCons,
      importRequirement: Math.max(0, oilCons - oilProd),
      substitutability: 8,
      stressSensitivity: 80,
      strategicImportance: 10,
      disruptionConsequences: ['Haulage & Logistics cost spike', 'Aviation freight restrictions', 'Strategic reserve drain']
    },
    gas: {
      type: 'gas',
      domesticProduction: gasProd,
      domesticConsumption: gasCons,
      importRequirement: Math.max(0, gasCons - gasProd),
      substitutability: 10,
      stressSensitivity: 90,
      strategicImportance: 9,
      disruptionConsequences: ['Industrial heating shutdown', 'Metallurgical production limits', 'Electric grid balancing premium']
    },
    coal: {
      type: 'coal',
      domesticProduction: coalProd,
      domesticConsumption: coalCons,
      importRequirement: Math.max(0, coalCons - coalProd),
      substitutability: 4,
      stressSensitivity: 40,
      strategicImportance: 7,
      disruptionConsequences: ['Heavy industry carbon levy rise', 'Baseload power plant fallback', 'Bulk port shipping delay']
    },
    nuclear: {
      type: 'nuclear',
      domesticProduction: nuclear,
      domesticConsumption: nuclear,
      importRequirement: 0,
      substitutability: 9,
      stressSensitivity: 20,
      strategicImportance: 8,
      disruptionConsequences: ['Baseload grid failure', 'Sourcing isotope delays']
    },
    hydro: {
      type: 'hydro',
      domesticProduction: hydro,
      domesticConsumption: hydro,
      importRequirement: 0,
      substitutability: 7,
      stressSensitivity: 30,
      strategicImportance: 6,
      disruptionConsequences: ['Seasonal drought reservoir drop']
    },
    solar: {
      type: 'solar',
      domesticProduction: solar,
      domesticConsumption: solar,
      importRequirement: 0,
      substitutability: 5,
      stressSensitivity: 15,
      strategicImportance: 5,
      disruptionConsequences: ['Local grid congestion', 'Intermittent storage balancing demand']
    },
    wind: {
      type: 'wind',
      domesticProduction: wind,
      domesticConsumption: wind,
      importRequirement: 0,
      substitutability: 5,
      stressSensitivity: 15,
      strategicImportance: 5,
      disruptionConsequences: ['Intermittent grid load cuts']
    }
  };
};

const INITIAL_PROFILES_YIELD = (): Record<string, CountryEnergyProfile> => {
  const seed: Record<string, Partial<CountryEnergyProfile>> = {
    US: {
      totalEnergyProduction: 2200,
      totalEnergyConsumption: 2150,
      importDependencyPct: 8,
      exportRole: 'SELF_SUFFICIENT',
      diversificationScore: 85,
      dependencyScore: 12,
      vulnerabilityScore: 15,
      resilienceScore: 92,
      industrialEnergyExposure: 40,
      householdStressExposure: 35,
      routeConcentration: 18,
      strategicBufferDays: 120,
      recoveryAdaptationMomentum: 80,
      dependencies: [
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 40, routeId: 'sea_strait_hormuz', routeType: 'sealane', routeChokepointRisk: 45, rerouteFlexibility: 85, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'oil', supplierCountryId: 'BR', volumeMtoe: 15, routeId: 'atlantic_shipping', routeType: 'sealane', routeChokepointRisk: 10, rerouteFlexibility: 90, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('US', 950, 900, 1050, 1010, 410, 400, 200, 70, 90, 120)
    },
    CN: {
      totalEnergyProduction: 2800,
      totalEnergyConsumption: 3450,
      importDependencyPct: 32,
      exportRole: 'IMPORTER',
      diversificationScore: 78,
      dependencyScore: 56,
      vulnerabilityScore: 48,
      resilienceScore: 72,
      industrialEnergyExposure: 82,
      householdStressExposure: 50,
      routeConcentration: 64,
      strategicBufferDays: 95,
      recoveryAdaptationMomentum: 78,
      dependencies: [
        { sourceType: 'oil', supplierCountryId: 'RU', volumeMtoe: 110, routeId: 'siberian_pipeline', routeType: 'pipeline', routeChokepointRisk: 15, rerouteFlexibility: 30, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 130, routeId: 'malacca_sea_lane', routeType: 'sealane', routeChokepointRisk: 75, rerouteFlexibility: 40, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'gas', supplierCountryId: 'RU', volumeMtoe: 45, routeId: 'power_of_siberia', routeType: 'pipeline', routeChokepointRisk: 10, rerouteFlexibility: 20, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'gas', supplierCountryId: 'IR', volumeMtoe: 25, routeId: 'strait_malacca_gulf', routeType: 'sealane', routeChokepointRisk: 70, rerouteFlexibility: 60, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('CN', 210, 750, 390, 490, 3500, 3600, 130, 290, 220, 280)
    },
    RU: {
      totalEnergyProduction: 1450,
      totalEnergyConsumption: 720,
      importDependencyPct: 0,
      exportRole: 'EXPORTER',
      diversificationScore: 60,
      dependencyScore: 0,
      vulnerabilityScore: 8,
      resilienceScore: 95,
      industrialEnergyExposure: 35,
      householdStressExposure: 20,
      routeConcentration: 25,
      strategicBufferDays: 180,
      recoveryAdaptationMomentum: 65,
      dependencies: [],
      sourceStates: makeDefaultSources('RU', 530, 150, 680, 480, 440, 240, 60, 45, 10, 15)
    },
    SA: {
      totalEnergyProduction: 650,
      totalEnergyConsumption: 160,
      importDependencyPct: 0,
      exportRole: 'EXPORTER',
      diversificationScore: 35,
      dependencyScore: 0,
      vulnerabilityScore: 12,
      resilienceScore: 88,
      industrialEnergyExposure: 60,
      householdStressExposure: 30,
      routeConcentration: 45,
      strategicBufferDays: 150,
      recoveryAdaptationMomentum: 50,
      dependencies: [],
      sourceStates: makeDefaultSources('SA', 590, 110, 115, 105, 5, 5, 2, 0, 15, 5)
    },
    DE: {
      totalEnergyProduction: 120,
      totalEnergyConsumption: 290,
      importDependencyPct: 65,
      exportRole: 'IMPORTER',
      diversificationScore: 72,
      dependencyScore: 68,
      vulnerabilityScore: 58,
      resilienceScore: 62,
      industrialEnergyExposure: 70,
      householdStressExposure: 80,
      routeConcentration: 50,
      strategicBufferDays: 90,
      recoveryAdaptationMomentum: 82,
      dependencies: [
        { sourceType: 'gas', supplierCountryId: 'RU', volumeMtoe: 5, routeId: 'nordstream_stub', routeType: 'pipeline', routeChokepointRisk: 95, rerouteFlexibility: 5, isDisrupted: false, actualDeliveryPct: 90 },
        { sourceType: 'gas', supplierCountryId: 'SA', volumeMtoe: 30, routeId: 'pipeline_norway', routeType: 'pipeline', routeChokepointRisk: 25, rerouteFlexibility: 55, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 45, routeId: 'atlantic_shipping', routeType: 'sealane', routeChokepointRisk: 15, rerouteFlexibility: 80, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('DE', 4, 90, 6, 85, 30, 55, 0, 12, 38, 45)
    },
    JP: {
      totalEnergyProduction: 45,
      totalEnergyConsumption: 410,
      importDependencyPct: 89,
      exportRole: 'IMPORTER',
      diversificationScore: 70,
      dependencyScore: 88,
      vulnerabilityScore: 82,
      resilienceScore: 50,
      industrialEnergyExposure: 78,
      householdStressExposure: 85,
      routeConcentration: 75,
      strategicBufferDays: 100,
      recoveryAdaptationMomentum: 60,
      dependencies: [
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 120, routeId: 'malacca_sea_lane', routeType: 'sealane', routeChokepointRisk: 75, rerouteFlexibility: 40, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'gas', supplierCountryId: 'SA', volumeMtoe: 40, routeId: 'malacca_sea_lane', routeType: 'sealane', routeChokepointRisk: 75, rerouteFlexibility: 45, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'oil', supplierCountryId: 'US', volumeMtoe: 15, routeId: 'pacific_shipping_lane', routeType: 'sealane', routeChokepointRisk: 20, rerouteFlexibility: 85, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('JP', 0.5, 170, 2.0, 90, 1.0, 110, 25, 8, 14, 11)
    },
    IN: {
      totalEnergyProduction: 480,
      totalEnergyConsumption: 880,
      importDependencyPct: 45,
      exportRole: 'IMPORTER',
      diversificationScore: 80,
      dependencyScore: 52,
      vulnerabilityScore: 49,
      resilienceScore: 68,
      industrialEnergyExposure: 74,
      householdStressExposure: 65,
      routeConcentration: 50,
      strategicBufferDays: 74,
      recoveryAdaptationMomentum: 72,
      dependencies: [
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 105, routeId: 'sea_strait_hormuz', routeType: 'sealane', routeChokepointRisk: 45, rerouteFlexibility: 80, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'oil', supplierCountryId: 'RU', volumeMtoe: 95, routeId: 'capesize_shipping_route', routeType: 'sealane', routeChokepointRisk: 30, rerouteFlexibility: 75, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'gas', supplierCountryId: 'IR', volumeMtoe: 15, routeId: 'ocean_gulf_pipeline', routeType: 'pipeline', routeChokepointRisk: 55, rerouteFlexibility: 15, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('IN', 42, 290, 48, 80, 290, 420, 22, 45, 48, 38)
    },
    FR: {
      totalEnergyProduction: 180,
      totalEnergyConsumption: 220,
      importDependencyPct: 18,
      exportRole: 'BALANCED',
      diversificationScore: 82,
      dependencyScore: 22,
      vulnerabilityScore: 20,
      resilienceScore: 88,
      industrialEnergyExposure: 50,
      householdStressExposure: 40,
      routeConcentration: 32,
      strategicBufferDays: 110,
      recoveryAdaptationMomentum: 70,
      dependencies: [
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 30, routeId: 'atlantic_shipping', routeType: 'sealane', routeChokepointRisk: 15, rerouteFlexibility: 85, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'gas', supplierCountryId: 'SA', volumeMtoe: 10, routeId: 'pipeline_norway', routeType: 'pipeline', routeChokepointRisk: 25, rerouteFlexibility: 60, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('FR', 1.5, 75, 2.0, 40, 0.5, 12, 145, 12, 18, 12)
    },
    TW: {
      totalEnergyProduction: 12,
      totalEnergyConsumption: 120,
      importDependencyPct: 90,
      exportRole: 'IMPORTER',
      diversificationScore: 65,
      dependencyScore: 92,
      vulnerabilityScore: 88,
      resilienceScore: 42,
      industrialEnergyExposure: 88,
      householdStressExposure: 82,
      routeConcentration: 85,
      strategicBufferDays: 60,
      recoveryAdaptationMomentum: 55,
      dependencies: [
        { sourceType: 'oil', supplierCountryId: 'SA', volumeMtoe: 45, routeId: 'taiwan_strait_shipping', routeType: 'sealane', routeChokepointRisk: 85, rerouteFlexibility: 25, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'gas', supplierCountryId: 'SA', volumeMtoe: 30, routeId: 'taiwan_strait_shipping', routeType: 'sealane', routeChokepointRisk: 85, rerouteFlexibility: 25, isDisrupted: false, actualDeliveryPct: 100 },
        { sourceType: 'coal', supplierCountryId: 'AU', volumeMtoe: 25, routeId: 'pacific_shipping_lane', routeType: 'sealane', routeChokepointRisk: 40, rerouteFlexibility: 70, isDisrupted: false, actualDeliveryPct: 100 }
      ],
      sourceStates: makeDefaultSources('TW', 0.2, 50, 0.2, 32, 0.5, 30, 4.0, 1.5, 6.0, 3.5)
    },
    IR: {
      totalEnergyProduction: 480,
      totalEnergyConsumption: 280,
      importDependencyPct: 0,
      exportRole: 'EXPORTER',
      diversificationScore: 50,
      dependencyScore: 5,
      vulnerabilityScore: 28,
      resilienceScore: 80,
      industrialEnergyExposure: 45,
      householdStressExposure: 35,
      routeConcentration: 55,
      strategicBufferDays: 120,
      recoveryAdaptationMomentum: 60,
      dependencies: [],
      sourceStates: makeDefaultSources('IR', 195, 100, 250, 150, 5, 5, 2, 5, 10, 5)
    }
  };

  const fullRecord: Record<string, CountryEnergyProfile> = {};

  // Hydrate all countries
  Object.keys(seed).forEach((cid) => {
    const s = seed[cid];
    fullRecord[cid] = {
      countryId: cid,
      sourceStates: s.sourceStates!,
      totalEnergyProduction: s.totalEnergyProduction || 100,
      totalEnergyConsumption: s.totalEnergyConsumption || 100,
      energySufficiencyIndex: Math.round((s.totalEnergyProduction! / s.totalEnergyConsumption!) * 100),
      importDependencyPct: s.importDependencyPct || 0,
      exportRole: s.exportRole || 'SELF_SUFFICIENT',
      diversificationScore: s.diversificationScore || 50,
      dependencyScore: s.dependencyScore || 50,
      vulnerabilityScore: s.vulnerabilityScore || 50,
      resilienceScore: s.resilienceScore || 50,
      domesticStressScore: 0,
      industrialEnergyExposure: s.industrialEnergyExposure || 50,
      householdStressExposure: s.householdStressExposure || 50,
      routeConcentration: s.routeConcentration || 50,
      strategicBufferDays: s.strategicBufferDays || 90,
      recoveryAdaptationMomentum: s.recoveryAdaptationMomentum || 50,
      lastUpdatedTick: 0,
      dependencies: s.dependencies || [],
      activeEmbargoes: [],
      stressState: {
        householdStress: 0,
        industrialStress: 0,
        strategicStress: 0,
        aggregatedStressScore: 0,
        lastShockTick: 0
      }
    };
  });

  return fullRecord;
};

export const useEnergyStore = create<EnergyState & EnergyActions>((set, get) => ({
  profiles: INITIAL_PROFILES_YIELD(),
  incidents: [
    {
      id: 'incident_0',
      tick: 0,
      type: 'ENERGY_BUFFER_IMPROVED',
      actorCountryId: 'US',
      summary: 'United States fills its Strategic Petroleum Reserve (SPR) to 120-day full containment capacity.',
      economicSeverity: 'MINIMAL'
    }
  ],
  selectedCountryId: 'US',
  compareSupplierId: null,
  activeEmbargoes: [],
  activeMapOverlay: 'NONE',

  setSelectedCountryId: (id) => set({ selectedCountryId: id }),
  setCompareSupplierId: (id) => set({ compareSupplierId: id }),
  setActiveMapOverlay: (overlay) => set({ activeMapOverlay: overlay }),

  calculateEmbargoPreview: (actor, target, sources) => {
    const targetProfile = get().profiles[target];
    const actorProfile = get().profiles[actor];
    
    let affectedValue = 0;
    let totalImportsAffected = 0;
    
    if (targetProfile) {
      targetProfile.dependencies.forEach(dep => {
        if (dep.supplierCountryId === actor && sources.includes(dep.sourceType)) {
          affectedValue += dep.volumeMtoe * 0.45; // Approx $450m per Mtoe annual proxy value
          totalImportsAffected += dep.volumeMtoe;
        }
      });
    }

    const availableSuppliers = Object.keys(get().profiles).filter(
      cid => cid !== actor && cid !== target && get().profiles[cid].exportRole === 'EXPORTER'
    );

    let expectedRerouteShare = 30; // default medium-low pipeline
    let routeFlexibility = 50;

    if (sources.includes('oil')) {
      expectedRerouteShare = 85; // oil tankers easily re-chartered
      routeFlexibility = 90;
    } else if (sources.includes('gas')) {
      expectedRerouteShare = 15; // pipelines locked - hard LNG shift
      routeFlexibility = 10;
    }

    const residualSupplyShortagePct = Math.max(0, 100 - expectedRerouteShare);
    const domesticStressInc = Math.round((totalImportsAffected / (targetProfile?.totalEnergyConsumption || 100)) * residualSupplyShortagePct * 1.5);
    const inflationImpact = (totalImportsAffected * 0.08) * (sources.includes('oil') ? 1.5 : 0.8);
    const gdpImpact = -(totalImportsAffected * 0.04) * (sources.includes('gas') ? 1.8 : 0.9);

    return {
      actorCountryId: actor,
      targetCountryId: target,
      affectedSources: sources,
      directValueExposureB: Math.round(affectedValue * 10) / 10,
      expectedImportLossPct: Math.round((totalImportsAffected / (targetProfile?.totalEnergyConsumption || 100)) * 100),
      expectedRerouteSharePct: expectedRerouteShare,
      estimatedDomesticStressIncrease: Math.min(100, Math.max(0, domesticStressInc)),
      estimatedGdpImpactPercent: Math.round(gdpImpact * 100) / 100,
      estimatedInflationImpactPercent: Math.round(inflationImpact * 100) / 100,
      alternateSuppliersAvailable: availableSuppliers,
      confidenceScore: sources.includes('gas') && sources.includes('oil') ? 'HIGH' : 'MEDIUM'
    };
  },

  imposeEnergyEmbargo: (actor, target, sources) => {
    set(produce((draft: EnergyState) => {
      const id = `embargo_${actor}_${target}_${Date.now()}`;
      const tick = useWorldStore.getState().currentTick;
      
      const embargo: EnergyEmbargoAction = {
        id,
        actorCountryId: actor,
        targetCountryId: target,
        affectedSources: sources,
        affectedRoutes: [],
        intensity: 100,
        tickEnacted: tick,
        isActive: true
      };

      draft.activeEmbargoes.push(embargo);

      // Add to country active embargoes list
      if (draft.profiles[target]) {
        draft.profiles[target].activeEmbargoes.push(embargo);
      }
      if (draft.profiles[actor]) {
        draft.profiles[actor].activeEmbargoes.push(embargo);
      }

      // Record incident
      draft.incidents.unshift({
        id: `inc_${Date.now()}`,
        tick,
        type: 'EMBARGO_IMPOSED',
        actorCountryId: actor,
        targetCountryId: target,
        summary: `🚨 ENERGY SECURITIZATION: ${actor} enforces a strict trade interdiction embargo against ${target} for ${sources.join(', ').toUpperCase()}.`,
        economicSeverity: 'SEVERE'
      });

      // Spawn Arachne Intelligence feed item
      useArachneStore.getState().addLiveIntelItem({
        id: `intel_energy_emb_${Date.now()}`,
        title: `🚨 ENERGY EMBARGO ENFORCED: ${actor} ➜ ${target}`,
        summary: `${actor} has weaponized raw energy security pipelines and shipping routes, halting ${sources.join(', ').toUpperCase()} exports immediately.`,
        fullBrief: `This escalates bilateral pressure systems. Critical energy route nodes are closed to cargo bound for ${target}. Alternate logistics links must be sourced immediately.`,
        whyItMatters: `This initiates severe pressure on downstream industrial manufacturing centers and causes heating / transport cost inflation.`,
        countryIds: [target, actor],
        urgency: 'CRITICAL',
        confidence: 'TOTAL',
        themeTags: ['SANCTIONS'],
        sourceLabel: 'COERCIVE ENERGY MONITORS',
        sourceType: 'SIGINT'
      });

      // worldEventLog
      useWorldStore.getState().addGlobalEvent(
        `🚨 ENERGY WARFARE: ${actor} imposed physical energy restriction against ${target} for [${sources.join(', ')}].`,
        'CRITICAL'
      );
    }));

    get().recomputeAllMetrics();
  },

  liftEnergyEmbargo: (id) => {
    set(produce((draft: EnergyState) => {
      const index = draft.activeEmbargoes.findIndex(emb => emb.id === id);
      if (index === -1) return;

      const emb = draft.activeEmbargoes[index];
      const tick = useWorldStore.getState().currentTick;

      draft.incidents.unshift({
        id: `inc_${Date.now()}`,
        tick,
        type: 'ENERGY_BUFFER_IMPROVED',
        actorCountryId: emb.actorCountryId,
        targetCountryId: emb.targetCountryId,
        summary: `🔄 RELIEF DECREE: ${emb.actorCountryId} lifts energy embargo against ${emb.targetCountryId}. Flows restoring.`,
        economicSeverity: 'MINIMAL'
      });

      // Clean from country profiles lists
      const tProf = draft.profiles[emb.targetCountryId];
      if (tProf) {
         tProf.activeEmbargoes = tProf.activeEmbargoes.filter(e => e.id !== id);
      }
      const aProf = draft.profiles[emb.actorCountryId];
      if (aProf) {
         aProf.activeEmbargoes = aProf.activeEmbargoes.filter(e => e.id !== id);
      }

      draft.activeEmbargoes.splice(index, 1);

      useWorldStore.getState().addGlobalEvent(
        `🔄 ENERGY DIPLOMACY: ${emb.actorCountryId} removed energy export ban against ${emb.targetCountryId}.`,
        'INFO'
      );
    }));

    get().recomputeAllMetrics();
  },

  triggerPipelineRupture: (routeId, label) => {
    set(produce((draft: EnergyState) => {
      const tick = useWorldStore.getState().currentTick;
      draft.incidents.unshift({
        id: `inc_disrupt_${Date.now()}`,
        tick,
        type: 'GAS_FLOW_DISRUPTED',
        actorCountryId: 'UN',
        summary: `⚠️ INFRASTRUCTURE ACCIDENT / SABOTAGE: Critical route ${label} reports complete pipeline pressure drop. Transit disrupted.`,
        economicSeverity: 'SEVERE'
      });

      // Mark dependencies carrying via routeId as disrupted
      Object.keys(draft.profiles).forEach(cid => {
        draft.profiles[cid].dependencies.forEach(dep => {
          if (dep.routeId === routeId) {
            dep.isDisrupted = true;
            dep.actualDeliveryPct = 10; // Residual emergency low flow
          }
        });
      });

      useWorldStore.getState().addGlobalEvent(
        `⚠️ ENERGY EMERGENCY: Transit corridor ${label} suffered physical rupture. Import streams severely throttled.`,
        'CRITICAL'
      );
    }));

    get().recomputeAllMetrics();
  },

  bufferStrategicReserves: (countryId, amountDays) => {
    set(produce((draft: EnergyState) => {
      const prof = draft.profiles[countryId];
      if (prof) {
        prof.strategicBufferDays = Math.min(180, prof.strategicBufferDays + amountDays);
      }
    }));
  },

  recomputeAllMetrics: () => {
    set(produce((draft: EnergyState) => {
      const activeEmbargoes = draft.activeEmbargoes;

      Object.keys(draft.profiles).forEach((cid) => {
        const prof = draft.profiles[cid];
        if (!prof) return;

        // Reset dependency disruption flags except direct route blockages (which we model from physical status)
        prof.dependencies.forEach(dep => {
          // Check if there is an active embargo between supplier and cid for this source
          const hasActiveEmbargo = activeEmbargoes.some(
            emb => emb.isActive &&
            emb.actorCountryId === dep.supplierCountryId &&
            emb.targetCountryId === cid &&
            emb.affectedSources.includes(dep.sourceType)
          );

          if (hasActiveEmbargo) {
            dep.isDisrupted = true;
            dep.actualDeliveryPct = 0; // complete blockade
          } else {
            dep.isDisrupted = dep.isDisrupted && dep.routeChokepointRisk > 90; // preserve custom physical disruptions
            if (!dep.isDisrupted) {
              dep.actualDeliveryPct = 100;
            }
          }
        });

        // 1. Calculate diversification index (HHI of supplier concentration)
        const suppliers = prof.dependencies.map(d => d.supplierCountryId);
        const uniqueSuppliers = Array.from(new Set(suppliers));
        let sumSquaredShares = 0;
        let totalImportedVolume = prof.dependencies.reduce((sum, d) => sum + d.volumeMtoe, 0);

        if (totalImportedVolume > 0) {
          uniqueSuppliers.forEach(s => {
            const supplierVolume = prof.dependencies.filter(d => d.supplierCountryId === s).reduce((sum, d) => sum + d.volumeMtoe, 0);
            const share = (supplierVolume / totalImportedVolume) * 100;
            sumSquaredShares += share * share;
          });
          // Normalised 0-100 diversification. 10000 HHI means single supplier.
          prof.diversificationScore = Math.max(10, Math.round(100 - (sumSquaredShares / 100)));
        } else {
          prof.diversificationScore = 100; // Self-sufficient
        }

        // 2. Compute route concentration
        const routeShares: Record<string, number> = {};
        if (prof.dependencies.length > 0) {
          prof.dependencies.forEach(d => {
            routeShares[d.routeId] = (routeShares[d.routeId] || 0) + d.volumeMtoe;
          });
          let maxRouteShare = 0;
          Object.values(routeShares).forEach(v => {
            if (v > maxRouteShare) maxRouteShare = v;
          });
          prof.routeConcentration = Math.round((maxRouteShare / totalImportedVolume) * 100);
        } else {
          prof.routeConcentration = 15;
        }

        // 3. Compute overall dependency and vulnerability scores
        const importedFraction = totalImportedVolume / (prof.totalEnergyConsumption || 100);
        prof.importDependencyPct = Math.round(importedFraction * 100);

        prof.dependencyScore = Math.round(prof.importDependencyPct * 0.9 + (100 - prof.diversificationScore) * 0.1);
        
        prof.vulnerabilityScore = Math.round(
          prof.dependencyScore * 0.5 + 
          prof.routeConcentration * 0.3 + 
          (100 - prof.strategicBufferDays / 1.8) * 0.2
        );
        prof.vulnerabilityScore = Math.max(5, Math.min(98, prof.vulnerabilityScore));

        prof.resilienceScore = Math.round(
          (prof.diversificationScore * 0.4) +
          (prof.strategicBufferDays / 1.8 * 0.4) +
          (prof.recoveryAdaptationMomentum * 0.2)
        );
        prof.resilienceScore = Math.max(10, Math.min(98, prof.resilienceScore));
      });
    }));
  },

  tickEnergySystem: (currentTick) => {
    // Make sure metrics are freshly updated
    get().recomputeAllMetrics();

    set(produce((draft: EnergyState) => {
      Object.keys(draft.profiles).forEach((cid) => {
        const prof = draft.profiles[cid];
        if (!prof) return;

        // Reset temporary stress
        let newHouseholdStress = 0;
        let newIndustrialStress = 0;
        let newStrategicStress = 0;

        // Keep track of total shortfalls
        let totalShortfallMtoe = 0;

        prof.dependencies.forEach(dep => {
          if (dep.isDisrupted) {
            const contracted = dep.volumeMtoe;
            const delivered = contracted * (dep.actualDeliveryPct / 100);
            const deficit = contracted - delivered;

            if (deficit > 0) {
              // Try to reroute / substitute
              let reroutedAmount = 0;
              let alternatePenaltyCost = 0;

              // Rule of Rerouting:
              // - Oil is highly reroutable (80% recovery with sea route shift, but with high financial friction)
              // - Gas pipeline is difficult (15% immediate fallback, LNG port takes time)
              // - Coal is moderately easy (60% alternate shippers)
              let recoveryFactor = 0.3; // Default mixed
              if (dep.sourceType === 'oil') {
                recoveryFactor = 0.85;
                alternatePenaltyCost = deficit * 0.12; // $B penalty added to import fees
              } else if (dep.sourceType === 'gas') {
                recoveryFactor = dep.routeType === 'pipeline' ? 0.15 : 0.45;
                alternatePenaltyCost = deficit * 0.30; // heavy container gas tariff
              } else if (dep.sourceType === 'coal') {
                recoveryFactor = 0.65;
                alternatePenaltyCost = deficit * 0.05;
              }

              // Apply recovery based on adaptation momentum
              recoveryFactor += (prof.recoveryAdaptationMomentum - 50) * 0.002;
              recoveryFactor = Math.max(0.05, Math.min(0.95, recoveryFactor));

              reroutedAmount = deficit * recoveryFactor;
              const residualDeficit = deficit - reroutedAmount;

              totalShortfallMtoe += residualDeficit;

              // Charge Treasury cash penalty for expensive routing / shadow pricing
              if (alternatePenaltyCost > 0) {
                useWorldStore.getState().updateCountry(cid, (c) => {
                  c.economic.treasuryCashB = Math.max(1.0, c.economic.treasuryCashB - alternatePenaltyCost);
                });
              }

              if (residualDeficit > 2.0) {
                // If there's an actual un-reroutable shortfall, raise stress
                if (dep.sourceType === 'oil') {
                  newHouseholdStress += (residualDeficit / dep.volumeMtoe) * 45;
                  newIndustrialStress += (residualDeficit / dep.volumeMtoe) * 20;
                } else if (dep.sourceType === 'gas') {
                  newIndustrialStress += (residualDeficit / dep.volumeMtoe) * 65;
                  newHouseholdStress += (residualDeficit / dep.volumeMtoe) * 40;
                } else if (dep.sourceType === 'coal') {
                  newIndustrialStress += (residualDeficit / dep.volumeMtoe) * 30;
                }
              }

              // Create specific timeline log for successful partial rerouting
              if (reroutedAmount > 1.0 && currentTick % 4 === 1) {
                draft.incidents.unshift({
                  id: `inc_reroute_${cid}_${Date.now()}`,
                  tick: currentTick,
                  type: 'ENERGY_REROUTE_ATTEMPTED',
                  actorCountryId: cid,
                  sourceType: dep.sourceType,
                  summary: `🛡️ SECURITY CONSERVATION: ${cid} completed partial rerouting of disrupted imports of ${dep.sourceType.toUpperCase()} via alternate logistics conduits (recovered ${Math.round(recoveryFactor * 100)}% of cargo).`,
                  economicSeverity: 'STRESSED'
                });
              }
            }
          }
        });

        // Reserve depleting: If shortfalls exist, draw down buffer days
        if (totalShortfallMtoe > 0) {
          prof.strategicBufferDays = Math.max(0, prof.strategicBufferDays - Math.round(totalShortfallMtoe / 2));
          newStrategicStress += (100 - (prof.strategicBufferDays / 1.8)) * 0.8;
        } else if (prof.strategicBufferDays < 90) {
          // Rebuild reserves slowly if no active shortfalls
          prof.strategicBufferDays = Math.min(180, prof.strategicBufferDays + 2);
        }

        // Emergency Coal Fallback clause:
        // If gas/oil is severely short (>20% deficit), country raises domestic coal consumption & production to keep lights on
        if (totalShortfallMtoe > 15.0 && prof.sourceStates.coal.domesticProduction > 10) {
          prof.sourceStates.coal.domesticProduction += 10;
          totalShortfallMtoe = Math.max(0, totalShortfallMtoe - 6.0);
          newIndustrialStress = Math.max(0, newIndustrialStress - 8);
          
          if (currentTick % 6 === 2) {
            draft.incidents.unshift({
              id: `inc_coal_fallback_${Date.now()}`,
              tick: currentTick,
              type: 'PIPELINE_DEPENDENCY_EXPOSED',
              actorCountryId: cid,
              summary: `⚠️ COAL FALLBACK ACTIVATED: Severe gas/oil deficit forces ${cid} to fire up mothballed coal baseload utilities to avoid electric grid blackout, sacrificing environmental metrics.`,
              economicSeverity: 'STRESSED'
            });
          }
        }

        // Clip stress values
        prof.stressState.householdStress = Math.max(0, Math.min(100, Math.round(newHouseholdStress)));
        prof.stressState.industrialStress = Math.max(0, Math.min(100, Math.round(newIndustrialStress)));
        prof.stressState.strategicStress = Math.max(0, Math.min(100, Math.round(newStrategicStress)));

        const aggregateStress = Math.round(
          (prof.stressState.householdStress * 0.4) +
          (prof.stressState.industrialStress * 0.4) +
          (prof.stressState.strategicStress * 0.2)
        );
        prof.stressState.aggregatedStressScore = aggregateStress;
        prof.domesticStressScore = aggregateStress;

        // 3. Propaging physical outcomes to national macro systems
        if (aggregateStress > 10) {
          useWorldStore.getState().updateCountry(cid, (c) => {
            // Inflation spikes
            c.economic.inflationRate = Math.min(25.0, c.economic.inflationRate + (aggregateStress * 0.005));
            // GDP Drag
            c.economic.gdpGrowthRate = Math.max(-8.5, c.economic.gdpGrowthRate - (aggregateStress * 0.0025));
            // Unemployment spikes slightly
            c.economic.unemploymentRate = Math.min(20.0, c.economic.unemploymentRate + (prof.stressState.industrialStress * 0.002));
            // Unrest flares
            c.political.popularUnrest = Math.min(100, c.political.popularUnrest + (prof.stressState.householdStress * 0.04));
            // Decrease stability
            c.political.stabilityIndex = Math.max(5, c.political.stabilityIndex - (aggregateStress * 0.02));
          });

          // Disempower military fuel reserves if buffer days reaches 0
          if (prof.strategicBufferDays === 0) {
            useWorldStore.getState().updateCountry(cid, (c) => {
              if (c.arsenal?.units) {
                c.arsenal.units.forEach(unit => {
                  unit.fuelLevel = Math.max(10, unit.fuelLevel - 5);
                  unit.supplyChainStatus = 'CRITICAL';
                });
              }
            });
          }

          // Trigger incident records for major thresholds
          if (aggregateStress > 45 && currentTick % 5 === 1) {
            draft.incidents.unshift({
              id: `inc_macro_${cid}_${Date.now()}`,
              tick: currentTick,
              type: 'ENERGY_SHOCK_MACRO_SPILLOVER',
              actorCountryId: cid,
              summary: `⚠️ ECONOMIC STAGE ALARM: Prolonged energy stress has triggered industrial stagnation and double-digit inflation projections inside ${cid}. Factions reporting growing political volatility.`,
              economicSeverity: 'SEVERE'
            });

            // Put a World Log event
            useWorldStore.getState().addGlobalEvent(
              `⚠️ ENERGY CRITICAL STRESS: ${cid} suffers severe domestic inflation and factory power curbs as aggregate energy stress hits ${aggregateStress}%.`,
              'WARNING'
            );
          }
        }
      });
    }));
  },

  getDependencyGraph: () => {
    const state = get();
    const nodes: EnergyDependencyGraphNode[] = [];
    const edges: EnergyDependencyGraphEdge[] = [];
    const countries = useWorldStore.getState().countries;

    // Build unique nodes from countries that have energy profiles
    Object.keys(state.profiles).forEach(cid => {
      const p = state.profiles[cid];
      const c = countries[cid];
      if (!c) return;

      nodes.push({
        id: cid,
        label: c.name,
        flag: c.flagEmoji,
        type: p.exportRole === 'EXPORTER' ? 'SUPPLIER' : p.exportRole === 'IMPORTER' ? 'CONSUMER' : 'BALANCED',
        energyVulnerability: p.vulnerabilityScore,
        energyStress: p.domesticStressScore
      });

      // Build edges
      p.dependencies.forEach(dep => {
        edges.push({
          id: `edge_${dep.supplierCountryId}_${cid}_${dep.sourceType}`,
          source: dep.supplierCountryId,
          target: cid,
          sourceType: dep.sourceType,
          volumeMtoe: dep.volumeMtoe,
          routeType: dep.routeType,
          routeId: dep.routeId,
          isDisrupted: dep.isDisrupted,
          flowPct: dep.actualDeliveryPct
        });
      });
    });

    return { nodes, edges };
  }
}));
