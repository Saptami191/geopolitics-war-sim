import { create } from 'zustand';
import { produce } from 'immer';
import {
  InfrastructureHealthState, CyberDefenseBudget, IncidentResponseTeam, CyberIncident,
  CyberNormsTreaty, SectorRecoveryEntry, CyberEscalationTrigger, CyberIntelligenceGain,
  InfrastructureSector, KillChainOperation
} from '../types';
import { useWorldStore } from './worldStore';

export interface CyberDefenseState {
  infrastructureHealth: Record<string, InfrastructureHealthState>;
  defenseBudgets: Record<string, CyberDefenseBudget>;
  incidentResponseTeams: Record<string, IncidentResponseTeam>;
  activeIncidents: Record<string, CyberIncident>;
  cyberNormsTreaties: Record<string, CyberNormsTreaty>;
  sectorRecoveryQueue: SectorRecoveryEntry[];
  cyberEscalationTriggers: CyberEscalationTrigger[];
  cyberIntelligenceGains: CyberIntelligenceGain[];

  setDefenseBudget: (countryId: string, budget: number) => void;
  allocateThreatToSector: (countryId: string, sector: InfrastructureSector, amount: number) => void;
  upgradeHardeningTier: (countryId: string, sector: InfrastructureSector) => void;
  deployIncidentResponseTeam: (teamId: string, incidentId: string) => void;
  containIncident: (incidentId: string) => void;
  proposeCyberNormsTreaty: (params: Partial<CyberNormsTreaty>) => string;
  joinNormsTreaty: (treatyId: string, countryId: string) => void;
  violateNormsTreaty: (treatyId: string, countryId: string, operationId: string) => void;
  applyAttack: (countryId: string, sector: InfrastructureSector, operation: KillChainOperation) => void;
  propagateCascade: (sourceCountryId: string, sourceSector: InfrastructureSector) => void;
  tickCyberDefense: () => void;

  tickInfrastructureRecovery: () => void;
  tickIncidentResponse: () => void;
  tickCascadeEffects: () => void;
  checkEscalationTriggers: () => void;
  exportIntelligenceGains: () => void;
}

export const useCyberDefenseStore = create<CyberDefenseState>((set, get) => ({
  infrastructureHealth: {},
  defenseBudgets: {},
  incidentResponseTeams: {},
  activeIncidents: {},
  cyberNormsTreaties: {},
  sectorRecoveryQueue: [],
  cyberEscalationTriggers: [],
  cyberIntelligenceGains: [],

  setDefenseBudget: (countryId, budget) => set(produce((state: CyberDefenseState) => {
    if (!state.defenseBudgets[countryId]) {
      state.defenseBudgets[countryId] = {
        countryId,
        totalBudget: budget,
        allocationBySector: {} as Record<InfrastructureSector, number>,
        allocationToIncidentResponse: 0,
        allocationToThreatIntel: 0,
        allocationToOffensiveCounter: 0,
        totalAllocated: 0
      };
    } else {
      state.defenseBudgets[countryId].totalBudget = budget;
    }
  })),

  allocateThreatToSector: (countryId, sector, amount) => set(produce((state: CyberDefenseState) => {
    const budget = state.defenseBudgets[countryId];
    if (budget) {
      budget.allocationBySector[sector] = amount;
    }
  })),

  upgradeHardeningTier: (countryId, sector) => set(produce((state: CyberDefenseState) => {
    const key = `${countryId}-${sector}`;
    const health = state.infrastructureHealth[key];
    if (health) {
      if (health.hardeningTier === 'UNPROTECTED') health.hardeningTier = 'BASIC';
      else if (health.hardeningTier === 'BASIC') health.hardeningTier = 'STANDARD';
      else if (health.hardeningTier === 'STANDARD') health.hardeningTier = 'ADVANCED';
      else if (health.hardeningTier === 'ADVANCED') health.hardeningTier = 'HARDENED';
      else if (health.hardeningTier === 'HARDENED') health.hardeningTier = 'AIR_GAPPED';
    }
  })),

  deployIncidentResponseTeam: (teamId, incidentId) => set(produce((state: CyberDefenseState) => {
    const team = state.incidentResponseTeams[teamId];
    if (team) {
      team.isDeployed = true;
      team.deployedToIncidentId = incidentId;
      team.currentLoad++;
    }
  })),

  containIncident: (incidentId) => set(produce((state: CyberDefenseState) => {
    const inc = state.activeIncidents[incidentId];
    if (inc && !inc.isContained) {
      inc.isContained = true;
      inc.containedAtTick = useWorldStore.getState().currentTick;
    }
  })),

  proposeCyberNormsTreaty: (params) => {
    const id = `TREATY-${Date.now()}`;
    set(produce((state: CyberDefenseState) => {
      state.cyberNormsTreaties[id] = {
        id,
        name: params.name || 'New Cyber Norms Treaty',
        signatories: params.signatories || [],
        provisions: params.provisions || [],
        isEnforced: true,
        violationCount: 0,
        violationsByCountry: {},
        diplomaticConsequences: params.diplomaticConsequences || 'SANCTIONS'
      };
    }));
    return id;
  },

  joinNormsTreaty: (treatyId, countryId) => set(produce((state: CyberDefenseState) => {
    const treaty = state.cyberNormsTreaties[treatyId];
    if (treaty && !treaty.signatories.includes(countryId)) {
      treaty.signatories.push(countryId);
    }
  })),

  violateNormsTreaty: (treatyId, countryId, operationId) => set(produce((state: CyberDefenseState) => {
    const treaty = state.cyberNormsTreaties[treatyId];
    if (treaty) {
      treaty.violationCount++;
      treaty.violationsByCountry[countryId] = (treaty.violationsByCountry[countryId] || 0) + 1;
    }
  })),

  applyAttack: (countryId, sector, operation) => set(produce((state: CyberDefenseState) => {
    const key = `${countryId}-${sector}`;
    if (!state.infrastructureHealth[key]) {
        state.infrastructureHealth[key] = {
            countryId,
            sector,
            integrityScore: 100,
            availabilityScore: 100,
            resilienceScore: 50,
            hardeningTier: 'BASIC',
            activeIncidents: [],
            recoveryTicksRemaining: 0,
            economicOutputModifier: 1.0,
            cascadingEffectsActive: [],
            lastAttackedTick: null,
            lastRecoveredTick: null
        }
    }
    
    const health = state.infrastructureHealth[key];
    health.integrityScore -= 30; // base damage
    health.availabilityScore -= 40;
    health.lastAttackedTick = useWorldStore.getState().currentTick;
    health.recoveryTicksRemaining = 10;
    
    const incidentId = `INC-${Date.now()}`;
    const incident: CyberIncident = {
      id: incidentId,
      operationId: operation.id,
      sector,
      incidentType: 'DATA_DESTRUCTION',
      severity: 'HIGH',
      economicLoss: 100,
      populationImpact: 20,
      isContained: false,
      containedAtTick: null,
      recoveryTicksRequired: 10,
      publiclyAttributed: false,
      attributedTo: null
    };
    health.activeIncidents.push(incident);
    state.activeIncidents[incidentId] = incident;
    
    useWorldStore.getState().addGlobalEvent(`[CYBER] Cyber attack degraded ${countryId} ${sector}`, 'CRITICAL');
    
    get().propagateCascade(countryId, sector);
  })),

  propagateCascade: (sourceCountryId, sourceSector) => set(produce((state: CyberDefenseState) => {
    // Simplified cascade mapping
    const cascadeMap: Record<string, InfrastructureSector[]> = {
      'POWER_GRID': ['FINANCIAL_SYSTEM', 'COMMUNICATIONS', 'WATER_SYSTEM', 'TRANSPORT', 'HEALTHCARE'],
      'FINANCIAL_SYSTEM': ['TRANSPORT', 'FOOD_SUPPLY'],
      'TRANSPORT': ['FOOD_SUPPLY', 'FUEL_GAS'],
      'COMMUNICATIONS': ['FINANCIAL_SYSTEM', 'MILITARY_C2'],
      'WATER_SYSTEM': ['HEALTHCARE', 'FOOD_SUPPLY'],
      'FUEL_GAS': ['POWER_GRID', 'TRANSPORT'],
      'MILITARY_C2': ['COMMUNICATIONS'],
      'HEALTHCARE': ['WATER_SYSTEM'],
      'FOOD_SUPPLY': ['HEALTHCARE'],
      'NUCLEAR_FACILITIES': []
    };
    
    const downstream = cascadeMap[sourceSector] || [];
    downstream.forEach(ds => {
      const key = `${sourceCountryId}-${ds}`;
      if (!state.infrastructureHealth[key]) return; // Initialize if needed later
      const health = state.infrastructureHealth[key];
      
      health.cascadingEffectsActive.push({
        fromSector: sourceSector,
        toSector: ds,
        effectType: 'OPERATIONAL_DEGRADATION',
        magnitude: 20,
        durationTicksRemaining: 5
      });
      health.availabilityScore -= 10;
    });
  })),

  tickCyberDefense: () => {
    get().tickInfrastructureRecovery();
    get().tickIncidentResponse();
    get().tickCascadeEffects();
    get().checkEscalationTriggers();
    get().exportIntelligenceGains();
  },

  tickInfrastructureRecovery: () => set(produce((state: CyberDefenseState) => {
    Object.values(state.infrastructureHealth).forEach(health => {
      if (health.recoveryTicksRemaining > 0) {
        health.recoveryTicksRemaining--;
        if (health.recoveryTicksRemaining === 0) {
           health.integrityScore = Math.min(100, health.integrityScore + 10);
           health.availabilityScore = Math.min(100, health.availabilityScore + 10);
           health.lastRecoveredTick = useWorldStore.getState().currentTick;
        }
      }
    });
  })),

  tickIncidentResponse: () => set(produce((state: CyberDefenseState) => {
     // Simplified incident tick
     Object.values(state.incidentResponseTeams).forEach(team => {
        if (team.isDeployed && team.deployedToIncidentId) {
            const inc = state.activeIncidents[team.deployedToIncidentId];
            if (inc && !inc.isContained) {
                inc.recoveryTicksRequired--;
                if (inc.recoveryTicksRequired <= 0) {
                    inc.isContained = true;
                    inc.containedAtTick = useWorldStore.getState().currentTick;
                    team.isDeployed = false;
                    team.currentLoad--;
                }
            }
        }
     });
  })),

  tickCascadeEffects: () => set(produce((state: CyberDefenseState) => {
    Object.values(state.infrastructureHealth).forEach(health => {
      health.cascadingEffectsActive.forEach((cascade, index) => {
        if (cascade.durationTicksRemaining > 0) {
          cascade.durationTicksRemaining--;
        } else {
          health.cascadingEffectsActive.splice(index, 1);
        }
      });
    });
  })),

  checkEscalationTriggers: () => {
     // Placeholder for complex escalation
  },

  exportIntelligenceGains: () => set(produce((state: CyberDefenseState) => {
      // Moves cyberIntelligenceGains to respective stores
      state.cyberIntelligenceGains = [];
  }))
}));
