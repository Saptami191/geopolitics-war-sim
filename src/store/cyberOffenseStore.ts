import { create } from 'zustand';
import { produce } from 'immer';
import { 
  ZeroDay, MalwareSample, BotnetService, HackAndLeakOperation, ZeroDayListing, InfrastructureSector 
} from '../types';
import { useWorldStore } from './worldStore';
import { useFinintStore } from './finintStore';

export interface CyberOffenseState {
  zeroDayInventory: Record<string, ZeroDay>;
  malwareDevelopmentQueue: Record<string, MalwareSample>;
  completedMalware: Record<string, MalwareSample>;
  botnetServices: Record<string, BotnetService>;
  hackAndLeakOperations: Record<string, HackAndLeakOperation>;
  zeroDayMarketListings: ZeroDayListing[];
  cyberBudget: number;
  cyberBudgetAllocated: number;

  purchaseZeroDay: (listingId: string) => void;
  developZeroDay: (params: Partial<ZeroDay>) => string;
  developMalware: (params: Partial<MalwareSample>) => string;
  cancelMalwareDevelopment: (malwareId: string) => void;
  procureBotnetService: (params: Partial<BotnetService>) => string;
  terminateBotnetService: (botnetId: string) => void;
  planHackAndLeak: (operationId: string, params: Partial<HackAndLeakOperation>) => string;
  executeHackAndLeak: (hloId: string) => void;
  releaseLeakedData: (hloId: string, strategy: HackAndLeakOperation['releaseStrategy']) => void;
  tickCyberOffense: () => void;

  tickMalwareDevelopment: () => void;
  tickZeroDayPatchRisk: () => void;
  tickBotnetServices: () => void;
  resolveLeakImpact: (hloId: string) => void;
}

export const useCyberOffenseStore = create<CyberOffenseState>((set, get) => ({
  zeroDayInventory: {},
  malwareDevelopmentQueue: {},
  completedMalware: {},
  botnetServices: {},
  hackAndLeakOperations: {},
  zeroDayMarketListings: [],
  cyberBudget: 1000,
  cyberBudgetAllocated: 0,

  purchaseZeroDay: (listingId) => set(produce((state: CyberOffenseState) => {
    const listingIndex = state.zeroDayMarketListings.findIndex((l: ZeroDayListing) => l.id === listingId);
    if (listingIndex > -1) {
      const listing = state.zeroDayMarketListings[listingIndex];
      // Deduct budget
      state.cyberBudget -= listing.askingPrice;
      
      const id = `ZD-${Date.now()}`;
      state.zeroDayInventory[id] = {
        id,
        name: `0day_${listing.targetSystem}`,
        targetSystem: listing.targetSystem,
        exploitCategory: listing.exploitCategory,
        reliability: listing.reliability,
        detectability: listing.detectability,
        exclusivity: listing.exclusivityClaim ? 90 : 40,
        patchRisk: listing.patchRisk,
        marketValue: listing.askingPrice,
        acquiredFrom: 'PURCHASED',
        isPatched: !listing.isAuthentic, // Fake listings are immediately patched/worthless
        patchedAtTick: listing.isAuthentic ? null : useWorldStore.getState().currentTick
      };
      
      state.zeroDayMarketListings.splice(listingIndex, 1);
    }
  })),

  developZeroDay: (params) => {
    const id = `ZD-${Date.now()}`;
    set(produce((state: CyberOffenseState) => {
      state.zeroDayInventory[id] = {
        id,
        name: params.name || 'Custom 0-Day',
        targetSystem: params.targetSystem || 'Windows',
        exploitCategory: params.exploitCategory || 'REMOTE_CODE_EXEC',
        reliability: params.reliability || 90,
        detectability: params.detectability || 10,
        exclusivity: 100,
        patchRisk: 0.01,
        marketValue: 0,
        acquiredFrom: 'DEVELOPED',
        isPatched: false,
        patchedAtTick: null
      };
    }));
    return id;
  },

  developMalware: (params) => {
    const id = `MAL-${Date.now()}`;
    set(produce((state: CyberOffenseState) => {
      state.malwareDevelopmentQueue[id] = {
        id,
        name: params.name || 'New Malware',
        type: params.type || 'RAT',
        targetedSectors: params.targetedSectors || ['COMMUNICATIONS'],
        effectivenessScore: params.effectivenessScore || 50,
        stealthScore: params.stealthScore || 50,
        developmentTicksRequired: params.developmentTicksRequired || 10,
        developmentProgress: 0,
        isComplete: false,
        zeroDaysRequired: params.zeroDaysRequired || [],
        countermeasureResistance: params.countermeasureResistance || 50,
        deployedInOperations: []
      };
    }));
    return id;
  },

  cancelMalwareDevelopment: (malwareId) => set(produce((state: CyberOffenseState) => {
    delete state.malwareDevelopmentQueue[malwareId];
  })),

  procureBotnetService: (params) => {
    const id = `BOT-${Date.now()}`;
    set(produce((state: CyberOffenseState) => {
      state.botnetServices[id] = {
        id,
        provider: params.provider || 'Unknown Criminal',
        size: params.size || 10000,
        capabilities: params.capabilities || ['DDoS'],
        costPerTick: params.costPerTick || 5,
        detectionRisk: params.detectionRisk || 0.1,
        attributionDistance: params.attributionDistance || 3
      };
    }));
    return id;
  },

  terminateBotnetService: (botnetId) => set(produce((state: CyberOffenseState) => {
    delete state.botnetServices[botnetId];
  })),

  planHackAndLeak: (operationId, params) => {
    const id = `HLO-${Date.now()}`;
    set(produce((state: CyberOffenseState) => {
      state.hackAndLeakOperations[id] = {
        id,
        operationId,
        targetCountryId: params.targetCountryId || 'UNKNOWN',
        leakTarget: params.leakTarget || 'LEADER',
        dataVolume: params.dataVolume || 10,
        damageScore: params.damageScore || 50,
        releaseStrategy: params.releaseStrategy || 'IMMEDIATE',
        releaseTick: null,
        publicReactionScore: 0,
        legitimacyDamageDone: 0,
        unrestWindowDurationTicks: 0,
        isReleased: false,
        releasedAtTick: null,
        attributedTo: null
      };
    }));
    return id;
  },

  executeHackAndLeak: (hloId) => set(produce((state: CyberOffenseState) => {
    const hlo = state.hackAndLeakOperations[hloId];
    if (hlo && !hlo.isReleased) {
      hlo.isReleased = true;
      hlo.releasedAtTick = useWorldStore.getState().currentTick;
      get().resolveLeakImpact(hloId);
    }
  })),

  releaseLeakedData: (hloId, strategy) => set(produce((state: CyberOffenseState) => {
    const hlo = state.hackAndLeakOperations[hloId];
    if (hlo && !hlo.isReleased) {
      hlo.releaseStrategy = strategy;
      hlo.isReleased = true;
      hlo.releasedAtTick = useWorldStore.getState().currentTick;
      get().resolveLeakImpact(hloId);
    }
  })),

  tickCyberOffense: () => {
    get().tickMalwareDevelopment();
    get().tickZeroDayPatchRisk();
    get().tickBotnetServices();
  },

  tickMalwareDevelopment: () => set(produce((state: CyberOffenseState) => {
    Object.keys(state.malwareDevelopmentQueue).forEach(malId => {
      const mal = state.malwareDevelopmentQueue[malId];
      if (!mal.isComplete) {
        mal.developmentProgress += 10; // Simplified
        if (mal.developmentProgress >= mal.developmentTicksRequired * 10) {
          mal.isComplete = true;
          state.completedMalware[malId] = { ...mal };
          delete state.malwareDevelopmentQueue[malId];
        }
      }
    });
  })),

  tickZeroDayPatchRisk: () => set(produce((state: CyberOffenseState) => {
    Object.keys(state.zeroDayInventory).forEach(zdId => {
      const zd = state.zeroDayInventory[zdId];
      if (!zd.isPatched) {
        if (Math.random() < zd.patchRisk) {
          zd.isPatched = true;
          zd.patchedAtTick = useWorldStore.getState().currentTick;
        }
      }
    });
  })),

  tickBotnetServices: () => set(produce((state: CyberOffenseState) => {
    Object.keys(state.botnetServices).forEach(botId => {
      const bot = state.botnetServices[botId];
      // Deduct cost
      if (state.cyberBudget >= bot.costPerTick) {
        state.cyberBudget -= bot.costPerTick;
      } else {
        // Can't afford
        delete state.botnetServices[botId];
      }
    });
  })),

  resolveLeakImpact: (hloId) => set(produce((state: CyberOffenseState) => {
    const hlo = state.hackAndLeakOperations[hloId];
    if (hlo) {
      // Very simplifed impact resolution
      hlo.publicReactionScore = hlo.damageScore * (Math.random() * 0.5 + 0.5);
      hlo.legitimacyDamageDone = hlo.publicReactionScore * 0.8;
      
      if (hlo.legitimacyDamageDone > 40) {
        hlo.unrestWindowDurationTicks = Math.floor(hlo.legitimacyDamageDone / 5);
        useWorldStore.getState().addGlobalEvent(`[CYBER] Massive data leak causes unrest in ${hlo.targetCountryId}`, 'CRITICAL');
      } else {
        useWorldStore.getState().addGlobalEvent(`[CYBER] Data leaked regarding ${hlo.targetCountryId} ${hlo.leakTarget}`, 'WARNING');
      }
    }
  }))
}));
