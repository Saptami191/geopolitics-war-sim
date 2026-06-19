import { create } from 'zustand';
import { produce } from 'immer';
import { useWorldStore } from './worldStore';
import { useConventionalOpsStore } from './conventionalOpsStore';
import { useSigintStore } from './sigintStore';
import { useEconomyStore } from './economyStore';
import { useCinematicsStore } from './cinematicsStore';
import { useConsequenceStore } from './consequenceStore';
import { audio } from '../utils/audio';
import {
  IndustrialSector,
  IndustrialCapacityBlock,
  ProductionItem,
  ProductionQueue,
  DefenseFacility,
  ResearchProject,
  RDCategory,
  StrategicComponent,
  ComponentRequirement,
  MobilizationState,
  MobilizationLevel,
  ArmsExportContract,
  DeliveryMilestone,
  ExportLicense,
  ProcurementIntelEntry,
  DefenseIndustryAlert,
  Country
} from '../types';

export interface DefenseIndustryState {
  industrialCapacity: Record<string, IndustrialCapacityBlock[]>;
  productionQueues: Record<string, ProductionQueue>;
  defenseFacilities: Record<string, DefenseFacility>;
  researchProjects: Record<string, ResearchProject>;
  strategicComponents: Record<string, StrategicComponent>;
  mobilizationStates: Record<string, MobilizationState>;
  exportContracts: Record<string, ArmsExportContract>;
  exportLicenses: Record<string, ExportLicense>;
  procurementIntel: Record<string, ProcurementIntelEntry>;
  defenseAlerts: DefenseIndustryAlert[];
  techGenerationByCountryAndSector: Record<string, Record<IndustrialSector, number>>;
}

export interface DefenseIndustryActions {
  // Industrial base
  updateIndustrialCapacity: (countryId: string, sector: IndustrialSector, delta: Partial<IndustrialCapacityBlock>) => void;
  applyMobilizationToCapacity: (countryId: string) => void;
  applySanctionDegradation: (countryId: string, sector: IndustrialSector, intensity: number) => void;

  // Production
  enqueueProductionItem: (countryId: string, item: Omit<ProductionItem, 'id' | 'startedAtTick'>) => string;
  cancelProductionItem: (countryId: string, itemId: string) => void;
  reprioritizeItem: (countryId: string, itemId: string, priority: ProductionItem['priority']) => void;
  checkComponentAvailability: (item: ProductionItem) => ComponentRequirement[];

  // Facilities
  addFacility: (facility: Omit<DefenseFacility, 'id'>) => string;
  damageFacility: (facilityId: string, damageTicks: number) => void;
  repairFacility: (facilityId: string, ticksRepaired: number) => void;
  nationalizeFacility: (facilityId: string) => void;

  // R&D
  startResearchProject: (project: Omit<ResearchProject, 'id' | 'progressPercent' | 'ticksElapsed' | 'status' | 'completedAtTick'>) => string;
  pauseResearchProject: (projectId: string) => void;
  accelerateResearchProject: (projectId: string, fundingBoost: number) => void;
  stealResearchProject: (projectId: string, stealerCountryId: string) => void;
  completeResearchProject: (projectId: string) => void;
  failResearchProject: (projectId: string) => void;

  // Components
  consumeComponent: (componentId: string, countryId: string, quantity: number) => boolean;
  stockpileComponent: (componentId: string, countryId: string, quantity: number) => void;
  sanctionComponentFlow: (componentId: string, fromCountryId: string, toCountryId: string) => void;
  liftComponentSanction: (componentId: string, fromCountryId: string, toCountryId: string) => void;

  // Mobilization
  setMobilizationLevel: (countryId: string, level: MobilizationLevel) => void;
  beginDemobilization: (countryId: string) => void;
  updateMobilizationSustainability: (countryId: string) => void;

  // Exports
  initiateExportContract: (contract: Omit<ArmsExportContract, 'id' | 'isViolated' | 'violationDetails'>) => string;
  cancelExportContract: (contractId: string, reason: string) => void;
  revokeExportLicense: (licenseId: string, reason: string) => void;
  flagExportViolation: (contractId: string, details: string) => void;
  processDeliveryMilestone: (contractId: string, tick: number) => void;

  // Procurement intel
  updateProcurementIntel: (countryId: string, update: Partial<ProcurementIntelEntry>) => void;
  inferMobilizationFromIntel: (countryId: string) => MobilizationLevel;

  // Tick & Helpers
  tickDefenseIndustry: (currentTick: number) => void;
  tickProductionQueues: (currentTick: number) => void;
  tickResearchProjects: (currentTick: number) => void;
  tickComponentConsumption: (currentTick: number) => void;
  tickMobilizationStates: (currentTick: number) => void;
  tickExportContracts: (currentTick: number) => void;
  detectProductionSignals: (currentTick: number) => void;
  applyRDBreakthrough: (projectId: string, currentTick: number) => void;
  triggerCinematics: (currentTick: number) => void;
  
  initializeStandardDataset: () => void;
}

export const useDefenseIndustryStore = create<DefenseIndustryState & DefenseIndustryActions>((set, get) => ({
  industrialCapacity: {},
  productionQueues: {},
  defenseFacilities: {},
  researchProjects: {},
  strategicComponents: {},
  mobilizationStates: {},
  exportContracts: {},
  exportLicenses: {},
  procurementIntel: {},
  defenseAlerts: [],
  techGenerationByCountryAndSector: {},

  // -- IMPLEMENTATION TO BE ADDED --
  
  updateIndustrialCapacity: (countryId, sector, delta) => set(produce((draft: DefenseIndustryState) => {
    if (!draft.industrialCapacity[countryId]) draft.industrialCapacity[countryId] = [];
    const block = draft.industrialCapacity[countryId].find(b => b.sectorId === sector);
    if (block) {
      Object.assign(block, delta);
      block.lastUpdatedTick = useWorldStore.getState().currentTick;
    }
  })),

  applyMobilizationToCapacity: (countryId) => set(produce((draft: DefenseIndustryState) => {
    const mobState = draft.mobilizationStates[countryId];
    if (!mobState || !draft.industrialCapacity[countryId]) return;
    draft.industrialCapacity[countryId].forEach(block => {
      let calcCap = block.baseCapacity * block.mobilizationMultiplier;
      calcCap *= (100 - block.sanctionDegradation) / 100;
      block.currentCapacity = Math.max(0, calcCap);
    });
  })),

  applySanctionDegradation: (countryId, sector, intensity) => set(produce((draft: DefenseIndustryState) => {
    if (draft.industrialCapacity[countryId]) {
      const block = draft.industrialCapacity[countryId].find(b => b.sectorId === sector);
      if (block) {
        block.sanctionDegradation = Math.min(100, block.sanctionDegradation + intensity);
      }
    }
  })),

  enqueueProductionItem: (countryId, item) => {
    const id = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    set(produce((draft: DefenseIndustryState) => {
      if (!draft.productionQueues[countryId]) {
        draft.productionQueues[countryId] = {
          countryId, items: [], totalQueuedCost: 0, estimatedMonthlyOutput: 0, bottleneckSector: null
        };
      }
      draft.productionQueues[countryId].items.push({
        ...item,
        id,
        startedAtTick: useWorldStore.getState().currentTick
      });
      draft.productionQueues[countryId].totalQueuedCost += (item.costPerUnit * item.quantity);
    }));
    return id;
  },

  cancelProductionItem: (countryId, itemId) => set(produce((draft: DefenseIndustryState) => {
    if (draft.productionQueues[countryId]) {
      draft.productionQueues[countryId].items = draft.productionQueues[countryId].items.filter(i => i.id !== itemId);
    }
  })),

  reprioritizeItem: (countryId, itemId, priority) => set(produce((draft: DefenseIndustryState) => {
    const queue = draft.productionQueues[countryId];
    if (queue) {
      const item = queue.items.find(i => i.id === itemId);
      if (item) item.priority = priority;
    }
  })),

  checkComponentAvailability: (item) => {
    const state = get();
    return item.requiredComponents.map(req => {
      const comp = state.strategicComponents[req.componentId];
      let available = false;
      if (comp) {
        available = (comp.stockpileByCountry[item.countryId] || 0) >= req.quantityPerUnit;
      }
      return { ...req, isAvailable: available };
    });
  },

  addFacility: (facility) => {
    const id = `FAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    set(produce((draft: DefenseIndustryState) => {
      draft.defenseFacilities[id] = { ...facility, id };
    }));
    return id;
  },

  damageFacility: (facilityId, damageTicks) => set(produce((draft: DefenseIndustryState) => {
    const fac = draft.defenseFacilities[facilityId];
    if (fac) {
      fac.damageTicks += damageTicks;
      fac.capacityUnits = Math.max(0, fac.capacityUnits - damageTicks * 10);
      fac.isOperational = fac.damageTicks < 50;
    }
  })),

  repairFacility: (facilityId, ticksRepaired) => set(produce((draft: DefenseIndustryState) => {
    const fac = draft.defenseFacilities[facilityId];
    if (fac) {
      fac.damageTicks = Math.max(0, fac.damageTicks - ticksRepaired);
      if (fac.damageTicks === 0) fac.isOperational = true;
    }
  })),

  nationalizeFacility: (facilityId) => set(produce((draft: DefenseIndustryState) => {
    if (draft.defenseFacilities[facilityId]) {
      draft.defenseFacilities[facilityId].isNationalized = true;
      draft.defenseFacilities[facilityId].isPrivate = false;
    }
  })),

  startResearchProject: (project) => {
    const id = `RD-${Date.now()}`;
    set(produce((draft: DefenseIndustryState) => {
      draft.researchProjects[id] = {
        ...project,
        id,
        progressPercent: 0,
        ticksElapsed: 0,
        status: 'ACTIVE',
        completedAtTick: null
      };
    }));
    return id;
  },

  pauseResearchProject: (projectId) => set(produce((draft: DefenseIndustryState) => {
    if (draft.researchProjects[projectId]) draft.researchProjects[projectId].status = 'PAUSED';
  })),

  accelerateResearchProject: (projectId, fundingBoost) => set(produce((draft: DefenseIndustryState) => {
    if (draft.researchProjects[projectId]) {
      draft.researchProjects[projectId].fundingPerTick += fundingBoost;
    }
  })),

  stealResearchProject: (projectId, stealerCountryId) => set(produce((draft: DefenseIndustryState) => {
    const proj = draft.researchProjects[projectId];
    if (proj) {
      proj.isStolen = true;
      audio.playEWDetectionPulse(); // Play the stolen data alert tone
      
      draft.defenseAlerts.unshift({
        id: `ALT-${Date.now()}`,
        type: 'RD_STOLEN',
        severity: 'CRITICAL',
        countryId: proj.countryId,
        details: `R&D Project ${proj.name} compromised by hostile intelligence operation.`,
        tick: useWorldStore.getState().currentTick,
        acknowledged: false
      });
      // A stealer gets instant progress on a similar project
      const stealerProjId = `RD-${stealerCountryId}-${Date.now()}`;
      draft.researchProjects[stealerProjId] = {
        ...proj,
        id: stealerProjId,
        countryId: stealerCountryId,
        progressPercent: proj.progressPercent * 0.6,
        totalFundingInvested: 0,
        isStolen: false, // It's their newly acquired project
        isClassified: true
      };
    }
  })),

  completeResearchProject: (projectId) => set(produce((draft: DefenseIndustryState) => {
    const proj = draft.researchProjects[projectId];
    if (proj) {
      proj.status = 'COMPLETE';
      proj.progressPercent = 100;
      proj.completedAtTick = useWorldStore.getState().currentTick;
      
      // Update tech gen
      if (!draft.techGenerationByCountryAndSector[proj.countryId]) draft.techGenerationByCountryAndSector[proj.countryId] = {} as any;
      draft.techGenerationByCountryAndSector[proj.countryId][proj.sector] = Math.max(
          draft.techGenerationByCountryAndSector[proj.countryId][proj.sector] || 1, 
          proj.targetGeneration
      );
    }
  })),

  failResearchProject: (projectId) => set(produce((draft: DefenseIndustryState) => {
    if (draft.researchProjects[projectId]) draft.researchProjects[projectId].status = 'FAILED';
  })),

  consumeComponent: (componentId, countryId, quantity) => {
    let success = false;
    set(produce((draft: DefenseIndustryState) => {
      const comp = draft.strategicComponents[componentId];
      if (comp && (comp.stockpileByCountry[countryId] || 0) >= quantity) {
        comp.stockpileByCountry[countryId] -= quantity;
        comp.consumptionRateByCountry[countryId] = (comp.consumptionRateByCountry[countryId] || 0) + quantity;
        success = true;
      }
    }));
    return success;
  },

  stockpileComponent: (componentId, countryId, quantity) => set(produce((draft: DefenseIndustryState) => {
    const comp = draft.strategicComponents[componentId];
    if (comp) {
      comp.stockpileByCountry[countryId] = (comp.stockpileByCountry[countryId] || 0) + quantity;
      comp.globalSupplyLevel = Math.max(0, comp.globalSupplyLevel - (quantity * 0.1)); // Reduce global float
    }
  })),

  sanctionComponentFlow: (componentId, fromId, toId) => set(produce((draft: DefenseIndustryState) => {
    const comp = draft.strategicComponents[componentId];
    if (comp) {
      const flowId = `${fromId}_${toId}`;
      if (!comp.sanctionedFlows.includes(flowId)) comp.sanctionedFlows.push(flowId);
    }
  })),

  liftComponentSanction: (componentId, fromId, toId) => set(produce((draft: DefenseIndustryState) => {
    const comp = draft.strategicComponents[componentId];
    if (comp) {
      const flowId = `${fromId}_${toId}`;
      comp.sanctionedFlows = comp.sanctionedFlows.filter(f => f !== flowId);
    }
  })),

  setMobilizationLevel: (countryId, level) => set(produce((draft: DefenseIndustryState) => {
    const currentTick = useWorldStore.getState().currentTick;
    if (!draft.mobilizationStates[countryId]) {
      draft.mobilizationStates[countryId] = {
        countryId, level: 'PEACETIME', civilianIndustrialDiverted: 0,
        mobilizationStartTick: null, demobilizationStartTick: null,
        economicDistortionScore: 0, warEconomyActive: false,
        populationSupportScore: 100, sustainabilityTicks: 999
      };
    }
    const state = draft.mobilizationStates[countryId];
    state.level = level;
    state.mobilizationStartTick = currentTick;
    
    // update logic multipliers
    let mult = 1.0;
    let divert = 0;
    
    if (level === 'ELEVATED') { mult = 1.3; divert = 10; state.sustainabilityTicks = 999; }
    else if (level === 'PARTIAL') { mult = 1.7; divert = 30; state.sustainabilityTicks = 24;}
    else if (level === 'FULL') { mult = 2.5; divert = 60; state.sustainabilityTicks = 12;}
    else if (level === 'TOTAL_WAR') { mult = 3.2; divert = 90; state.sustainabilityTicks = 8; state.warEconomyActive = true; }
    
    state.civilianIndustrialDiverted = divert;
    
    if (draft.industrialCapacity[countryId]) {
      draft.industrialCapacity[countryId].forEach(b => b.mobilizationMultiplier = mult);
    }
    
    if (level === 'FULL' || level === 'TOTAL_WAR') {
      audio.playEWCognitiveRadar(); // Use an industrial/horn like sound
    }
    
    setTimeout(() => {
        useWorldStore.getState().addGlobalEvent(`[DEFENSE] ${countryId} transitioned to ${level.replace('_', ' ')} mobilization.`, 'WARNING');
    }, 0);
  })),

  beginDemobilization: (countryId) => set(produce((draft: DefenseIndustryState) => {
    const state = draft.mobilizationStates[countryId];
    if (state) {
      state.level = 'PEACETIME';
      state.demobilizationStartTick = useWorldStore.getState().currentTick;
      state.warEconomyActive = false;
      if (draft.industrialCapacity[countryId]) {
        draft.industrialCapacity[countryId].forEach(b => b.mobilizationMultiplier = 1.0);
      }
    }
  })),

  updateMobilizationSustainability: (countryId) => set(produce((draft: DefenseIndustryState) => {
    const state = draft.mobilizationStates[countryId];
    if (state && state.level !== 'PEACETIME') {
      state.sustainabilityTicks = Math.max(0, state.sustainabilityTicks - 1);
      state.economicDistortionScore = Math.min(100, state.economicDistortionScore + (state.civilianIndustrialDiverted * 0.05));
    }
  })),

  initiateExportContract: (contract) => {
    const id = `EXP-${Date.now()}`;
    set(produce((draft: DefenseIndustryState) => {
      draft.exportContracts[id] = {
        ...contract,
        id,
        isViolated: false,
        violationDetails: null
      };
    }));
    return id;
  },

  cancelExportContract: (contractId, reason) => set(produce((draft: DefenseIndustryState) => {
    if (draft.exportContracts[contractId]) draft.exportContracts[contractId].isActive = false;
  })),

  revokeExportLicense: (licenseId, reason) => set(produce((draft: DefenseIndustryState) => {
    const lic = draft.exportLicenses[licenseId];
    if (lic) {
      lic.isApproved = false;
      lic.revokedAtTick = useWorldStore.getState().currentTick;
      lic.revokeReason = reason;
      audio.playEWSpoofSnap();
    }
  })),

  flagExportViolation: (contractId, details) => set(produce((draft: DefenseIndustryState) => {
    const c = draft.exportContracts[contractId];
    if (c) {
      c.isViolated = true;
      c.violationDetails = details;
      
      draft.defenseAlerts.unshift({
        id: `ALT-${Date.now()}`, type: 'EXPORT_VIOLATION', severity: 'HIGH',
        countryId: c.exporterCountryId, details: `Export contract to ${c.importerCountryId} violated: ${details}`,
        tick: useWorldStore.getState().currentTick, acknowledged: false
      });
    }
  })),

  processDeliveryMilestone: (contractId, tick) => set(produce((draft: DefenseIndustryState) => {
    const c = draft.exportContracts[contractId];
    if (c && c.isActive) {
      const pending = c.deliverySchedule.find(m => !m.delivered && tick >= m.tickTarget);
      if (pending) {
        pending.delivered = true;
        pending.deliveredAtTick = tick;
        // Transfer logic here. Payments via Economy.
      }
    }
  })),

  updateProcurementIntel: (countryId, update) => set(produce((draft: DefenseIndustryState) => {
    if (!draft.procurementIntel[countryId]) {
      draft.procurementIntel[countryId] = {
        countryId, observedPurchases: [], inferredProductionRamp: [], estimatedMobilizationLevel: 'PEACETIME',
        knownFacilities: [], rdBreakthroughsSuspected: [], supplyChainVulnerabilities: [],
        lastUpdatedTick: useWorldStore.getState().currentTick, confidenceScore: 0
      };
    }
    Object.assign(draft.procurementIntel[countryId], update);
    draft.procurementIntel[countryId].lastUpdatedTick = useWorldStore.getState().currentTick;
  })),

  inferMobilizationFromIntel: (countryId) => {
    return get().procurementIntel[countryId]?.estimatedMobilizationLevel || 'PEACETIME';
  },

  tickDefenseIndustry: (currentTick) => {
    const state = get();
    state.tickProductionQueues(currentTick);
    state.tickResearchProjects(currentTick);
    state.tickComponentConsumption(currentTick);
    state.tickMobilizationStates(currentTick);
    state.tickExportContracts(currentTick);
    state.detectProductionSignals(currentTick);
    state.triggerCinematics(currentTick);
  },

  tickProductionQueues: (currentTick) => set(produce((draft: DefenseIndustryState) => {
    Object.values(draft.productionQueues).forEach(queue => {
      // Sort by priority logic (EMERGENCY > HIGH > NORMAL > LOW)
      queue.items.sort((a,b) => {
         const pVals: any = { 'EMERGENCY': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };
         return pVals[b.priority] - pVals[a.priority];
      });
      
      let qBlocked = false;
      
      queue.items.forEach(item => {
        // Reset blocks for re-eval
        item.isBlocked = false;
        item.blockReasons = [];
        
        // 1. check component supply
        item.requiredComponents.forEach(req => {
          const comp = draft.strategicComponents[req.componentId];
          const hasComponent = comp && (comp.stockpileByCountry[item.countryId] || 0) >= req.quantityPerUnit;
          if (!hasComponent) {
            item.isBlocked = true;
            if(!item.blockReasons.includes(`Missing Component ${req.componentId}`)) {
              item.blockReasons.push(`Missing Component ${req.componentId}`);
               qBlocked = true;
            }
          }
        });
        
        // 2. if not blocked, tick production
        if (!item.isBlocked) {
          // consume components
          item.requiredComponents.forEach(req => {
            const comp = draft.strategicComponents[req.componentId];
            if (comp) {
              comp.stockpileByCountry[item.countryId] -= req.quantityPerUnit;
            }
          });
          
          item.totalTicksElapsed++;
          item.ticksRemainingCurrentUnit--;
          
          if (item.ticksRemainingCurrentUnit <= 0) {
            item.quantityCompleted++;
            item.ticksRemainingCurrentUnit = item.productionTicksPerUnit;
            // Unit added to militaryStore handled here or later.
            if (item.itemType === 'PLATFORM') {
                useConventionalOpsStore.getState().addUnit({
                    id: `U-${Date.now()}-${Math.floor(Math.random()*100)}`,
                    countryId: item.countryId,
                    family: 'ARMORED_BRIGADE', // Simplified mapping based on sector
                    domain: 'LAND',
                    designation: `${item.name} (${item.quantityCompleted})`,
                    attributes: { firepower: 50, maneuver: 40, protection: 60, sustainmentDemand: 5, readiness: 100, mobility: 'TRACKED', signature: 50, electronicWarfare: 10, airDefense: 10, intelligenceContribution: 5, specialCapabilities: [] },
                    currentRegion: 'HOME',
                    assignedObjectiveId: null,
                    assignedCampaignId: null,
                    currentStatus: 'READY',
                    attritionLevel: 0,
                    supplyLevel: 1.0,
                    maintenanceDebt: 0,
                    lastEngagedTick: 0,
                    isReserve: false,
                    isDeployed: false,
                    terrainPenalty: 0,
                    weatherPenalty: 0,
                    sigintExposure: 0.1,
                    deceptionCover: false,
                    notes: 'Newly produced unit'
                });
            }
            // Dispatch event to global event log if needed
          }
        }
      });
      
      if(qBlocked) {
        if(!draft.defenseAlerts.find(a => a.type === 'PRODUCTION_BLOCKED' && a.countryId === queue.countryId && a.tick > currentTick - 3)) {
          draft.defenseAlerts.unshift({
            id: `ALT-${Date.now()}-${Math.random()}`,
            type: 'PRODUCTION_BLOCKED', severity: 'HIGH',
            countryId: queue.countryId, details: 'Production queue blocked by component shortage.',
            tick: currentTick, acknowledged: false
          });
        }
      }
    });
  })),

  tickResearchProjects: (currentTick) => set(produce((draft: DefenseIndustryState) => {
    Object.values(draft.researchProjects).forEach(proj => {
      if (proj.status === 'ACTIVE') {
        proj.ticksElapsed++;
        proj.totalFundingInvested += proj.fundingPerTick;
        // Simple progress calc: 
        const progTick = (proj.fundingPerTick / proj.fundingRequired) * 100 * 0.1; 
        proj.progressPercent = Math.min(100, proj.progressPercent + progTick);
        proj.estimatedTicksRemaining = Math.max(0, Math.ceil((100 - proj.progressPercent) / (progTick || 1)));

        // Rolls
        if (proj.progressPercent > 70 && Math.random() < proj.breakthroughProbability) {
           proj.status = 'COMPLETE';
           proj.progressPercent = 100;
           proj.completedAtTick = currentTick;
           audio.playEWDetectionPulse(); // Breakthrough positive sound
           
           if (!draft.techGenerationByCountryAndSector[proj.countryId]) draft.techGenerationByCountryAndSector[proj.countryId] = {} as any;
           draft.techGenerationByCountryAndSector[proj.countryId][proj.sector] = Math.max(draft.techGenerationByCountryAndSector[proj.countryId][proj.sector] || 1, proj.targetGeneration);
           
           draft.defenseAlerts.unshift({
             id: `ALT-${Date.now()}`, type: 'RD_BREAKTHROUGH', severity: 'MEDIUM',
             countryId: proj.countryId, details: `R&D Breakthrough in ${proj.name}.`,
             tick: currentTick, acknowledged: false
           });
           
           setTimeout(() => {
              useWorldStore.getState().addGlobalEvent(`[DEFENSE] ${proj.countryId} achieved breakthrough in ${proj.sector.replace('_',' ')}: ${proj.name}.`, 'INFO');
           }, 0);
        } else if (Math.random() < proj.failureProbability) {
           proj.status = 'FAILED';
        } else if (Math.random() < proj.espionageVulnerability * 0.05) {
           proj.isStolen = true;
           audio.playEWSpoofSnap();
           draft.defenseAlerts.unshift({
             id: `ALT-${Date.now()}`, type: 'RD_STOLEN', severity: 'CRITICAL',
             countryId: proj.countryId, details: `R&D intelligence stolen for ${proj.name}.`,
             tick: currentTick, acknowledged: false
           });
        }
        
        if (proj.progressPercent >= 100) {
           proj.status = 'COMPLETE';
           proj.completedAtTick = currentTick;
           if (!draft.techGenerationByCountryAndSector[proj.countryId]) draft.techGenerationByCountryAndSector[proj.countryId] = {} as any;
           draft.techGenerationByCountryAndSector[proj.countryId][proj.sector] = Math.max(draft.techGenerationByCountryAndSector[proj.countryId][proj.sector] || 1, proj.targetGeneration);
        }
      }
    });
  })),

  tickComponentConsumption: (currentTick) => set(produce((draft: DefenseIndustryState) => {
    Object.values(draft.strategicComponents).forEach(comp => {
       // Slow decay logic or regeneration logic could go here globally
    });
  })),

  tickMobilizationStates: (currentTick) => set(produce((draft: DefenseIndustryState) => {
    Object.values(draft.mobilizationStates).forEach(mob => {
       if (mob.level !== 'PEACETIME') {
         mob.sustainabilityTicks = Math.max(0, mob.sustainabilityTicks - 1);
         mob.economicDistortionScore = Math.min(100, mob.economicDistortionScore + (mob.civilianIndustrialDiverted * 0.02));
         
         if (mob.sustainabilityTicks === 0) {
           mob.populationSupportScore -= 0.5;
         }
       }
    });
  })),

  tickExportContracts: (currentTick) => set(produce((draft: DefenseIndustryState) => {
    Object.values(draft.exportContracts).forEach(c => {
      if (c.isActive) {
        c.ticksElapsed++;
        c.deliverySchedule.forEach(m => {
          if (!m.delivered && currentTick >= m.tickTarget) {
            m.delivered = true;
            m.deliveredAtTick = currentTick;
          }
        });
        
        if (c.ticksElapsed >= c.durationTicks) {
           c.isActive = false; // complete
        }
      }
    });
  })),

  detectProductionSignals: (currentTick) => set(produce((draft: DefenseIndustryState) => {
    // If a country has PARTIAL or higher, and sigint captures it:
    Object.values(draft.mobilizationStates).forEach(mob => {
       if (mob.level === 'PARTIAL' || mob.level === 'FULL' || mob.level === 'TOTAL_WAR') {
         if (mob.countryId !== 'US') {
           if (!draft.procurementIntel[mob.countryId]) {
              draft.procurementIntel[mob.countryId] = {
                countryId: mob.countryId, observedPurchases: [], inferredProductionRamp: [], estimatedMobilizationLevel: 'PEACETIME',
                knownFacilities: [], rdBreakthroughsSuspected: [], supplyChainVulnerabilities: [],
                lastUpdatedTick: currentTick, confidenceScore: 50
              };
           }
           draft.procurementIntel[mob.countryId].estimatedMobilizationLevel = mob.level;
           draft.procurementIntel[mob.countryId].lastUpdatedTick = currentTick;
           // The event can be logged via worldStore externally
         }
       }
    });
  })),

  applyRDBreakthrough: (projectId, currentTick) => {
     get().completeResearchProject(projectId);
  },

  triggerCinematics: (currentTick) => {
     // Managed through cinematicsStore explicitly in tickEngine or here.
  },

  initializeStandardDataset: () => set(produce((draft: DefenseIndustryState) => {
     draft.strategicComponents['SEMICONDUCTOR_TIER_1'] = {
        id: 'SEMICONDUCTOR_TIER_1', name: 'Tier-1 Microprocessors', category: 'SEMICONDUCTOR',
        globalSupplyLevel: 80, primaryProducerCountries: ['TW', 'US', 'KR'],
        stockpileByCountry: { 'US': 10000, 'CN': 5000, 'RU': 500 },
        consumptionRateByCountry: { 'US': 100, 'CN': 80, 'RU': 5 },
        sanctionedFlows: ['US_RU', 'TW_RU'], alternativeSourceDifficulty: 90
     };
     draft.strategicComponents['RARE_EARTH_METALS'] = {
        id: 'RARE_EARTH_METALS', name: 'Processed Rare Earths', category: 'RARE_EARTH',
        globalSupplyLevel: 95, primaryProducerCountries: ['CN'],
        stockpileByCountry: { 'CN': 20000, 'US': 3000, 'EU': 2000 },
        consumptionRateByCountry: { 'US': 300, 'CN': 1000, 'EU': 200 },
        sanctionedFlows: [], alternativeSourceDifficulty: 80
     };
     
     draft.industrialCapacity['US'] = [
        { sectorId: 'AVIATION', countryId: 'US', baseCapacity: 100, currentCapacity: 100, mobilizationMultiplier: 1.0, utilizationRate: 40, workerCount: 120000, skillLevel: 95, sanctionDegradation: 0, supplyChainHealth: 90, lastUpdatedTick: 0 },
        { sectorId: 'NAVAL_SYSTEMS', countryId: 'US', baseCapacity: 60, currentCapacity: 60, mobilizationMultiplier: 1.0, utilizationRate: 85, workerCount: 80000, skillLevel: 90, sanctionDegradation: 0, supplyChainHealth: 85, lastUpdatedTick: 0 },
        { sectorId: 'MISSILES_MUNITIONS', countryId: 'US', baseCapacity: 200, currentCapacity: 200, mobilizationMultiplier: 1.0, utilizationRate: 90, workerCount: 45000, skillLevel: 88, sanctionDegradation: 0, supplyChainHealth: 75, lastUpdatedTick: 0 }
     ];
     draft.industrialCapacity['CN'] = [
        { sectorId: 'NAVAL_SYSTEMS', countryId: 'CN', baseCapacity: 180, currentCapacity: 180, mobilizationMultiplier: 1.0, utilizationRate: 95, workerCount: 220000, skillLevel: 85, sanctionDegradation: 0, supplyChainHealth: 95, lastUpdatedTick: 0 },
        { sectorId: 'ELECTRONICS_EW', countryId: 'CN', baseCapacity: 300, currentCapacity: 300, mobilizationMultiplier: 1.0, utilizationRate: 60, workerCount: 500000, skillLevel: 88, sanctionDegradation: 0, supplyChainHealth: 90, lastUpdatedTick: 0 }
     ];
  }))
}));
