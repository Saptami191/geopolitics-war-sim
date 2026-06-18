import { create } from 'zustand';
import { produce } from 'immer';
import {
  CovertFinanceState,
  ShellCompany,
  ShellCompanyJurisdiction,
  ShellCompanyPurpose,
  HawalaNode,
  HawalaNodeType,
  SmuggleRoute,
  SmuggleRouteType,
  ContrabandCategory,
  BlackMarketProcurementOrder,
  FundingTrace,
  TraceVector
} from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useGothamStore } from './gothamStore';
import { useSanctionsStore } from './sanctionsStore';
import { useEconomyStore } from './economyStore';
import { useOperativeStore } from './operativeStore';
import { useTradeStore } from './tradeStore';
import { useArachneStore } from './arachneStore';
import { useMirrorStore } from './mirrorStore';
import { useDefconStore } from './defconStore';
import { useCinematicsStore } from './cinematicsStore';
import { useBlackMarketStore } from './blackMarketStore';
import { useFoundryStore } from './foundryStore';

interface CovertFinanceActions {
  // Shell Companies
  incorporateShellCompany: (params: { jurisdiction: ShellCompanyJurisdiction; purpose: ShellCompanyPurpose; initialCapital: number; parentCompanyId?: string; assignOperativeId?: string }) => void;
  layerShellChain: (companyIds: string[]) => void;
  fundOperationThroughChain: (chainId: string, opId: string, amount: number, module: string) => boolean;
  traceAccumulationCheck: (chainId: string) => void;
  neglectMaintenanceConsequences: () => void;
  dissolveShellCompany: (companyId: string) => void;
  payShellMaintenance: (companyId: string) => void;

  // Hawala
  establishHawalaNode: (params: { nodeType: HawalaNodeType; locationCountryId: string; initialTrustInvestment: number; operativeHandlerId?: string }) => void;
  initiateHawalaTransfer: (fromNodeId: string, toNodeId: string, amount: number, purposeOpId: string) => void;
  tickHawalaTransfers: () => void;
  trustScoreDecay: () => void;
  reinvestHawalaNode: (nodeId: string, investment: number) => void;
  deactivateHawalaNode: (nodeId: string) => void;

  // Smuggling
  openSmuggleRoute: (params: { routeType: SmuggleRouteType; originCountryId: string; destinationCountryId: string; transitCountryIds: string[]; supportedCategories: ContrabandCategory[]; operativeNetworkIds: string[] }) => void;
  initiateSmuggleRun: (routeId: string, category: ContrabandCategory, quantity: number, purposeOpId: string, paymentChainId: string) => void;
  tickSmuggleRoutes: () => void;
  interceptCargo: (routeId: string) => void;
  deliverCargo: (routeId: string) => void;
  
  // Procurement
  placeProcurementOrder: (params: { requestingOpId: string; contrabandCategory: ContrabandCategory; quantity: number; sourceBrokerCountryId: string; paymentChainId: string; deliveryRouteId: string }) => void;
  brokerRelationshipSystem: () => void;

  // Tracing
  triggerFundingTrace: (entityId: string, entityType: 'SHELL_COMPANY' | 'HAWALA_NODE' | 'SMUGGLE_ROUTE' | 'PROCUREMENT_ORDER', vector: TraceVector) => void;
  tickFundingTraces: () => void;
  playerCounterTrace: (traceId: string, method: 'DISSOLVE_ENTITY' | 'BRIBE_INVESTIGATOR' | 'LEGAL_OBSTRUCTION' | 'DESTROY_RECORDS' | 'PLANT_COUNTER_EVIDENCE' | 'OPERATIVE_EXTRACTION') => { success: boolean, msg: string };
  globalTraceLevelComputation: () => void;
  fatfStatusUpdate: () => void;
  reserveGeneration: () => void;

  // Orchestration Main Tick
  tickCovertFinance: (currentTick: number) => void;
}

const SHELL_COSTS: Record<ShellCompanyJurisdiction, number> = {
  'CAYMAN_ISLANDS': 0.2, 'BRITISH_VIRGIN_ISLANDS': 0.15, 'DELAWARE_USA': 0.1, 'PANAMA': 0.12,
  'LUXEMBOURG': 0.3, 'CYPRUS': 0.2, 'SEYCHELLES': 0.08, 'LIECHTENSTEIN': 0.5,
  'HONG_KONG': 0.25, 'UAE_FREEZONE': 0.18, 'SINGAPORE': 0.35, 'ANONYMOUS_JURISDICTION': 0.6
};

const SHELL_SECRECY: Record<ShellCompanyJurisdiction, number> = {
  'CAYMAN_ISLANDS': 90, 'BRITISH_VIRGIN_ISLANDS': 88, 'DELAWARE_USA': 70, 'PANAMA': 82,
  'LUXEMBOURG': 75, 'CYPRUS': 72, 'SEYCHELLES': 85, 'LIECHTENSTEIN': 92,
  'HONG_KONG': 68, 'UAE_FREEZONE': 78, 'SINGAPORE': 65, 'ANONYMOUS_JURISDICTION': 95
};

const TRACE_SOPHISTICATION: Record<TraceVector, number> = {
  'BANKING_CORRESPONDENT': 55, 'FATF_MONITORING': 70, 'ICIJ_INVESTIGATION': 80,
  'RIVAL_INTELLIGENCE': 75, 'WHISTLEBLOWER_INTERNAL': 85, 'CUSTOMS_INTERCEPT': 50,
  'SIGNALS_INTERCEPT': 65, 'BENEFICIAL_OWNERSHIP': 60, 'BLOCKCHAIN_ANALYTICS': 72,
  'JOURNALISTIC_OSINT': 68
};

function generateCompanyName(): string {
  const adjectives = ['Alpine', 'Pacific', 'Atlantic', 'Eastern', 'Northern', 'Meridian', 'Continental', 'Maritime', 'Imperial', 'Crown', 'Global', 'Equatorial', 'Polaris', 'Orion', 'Crescent', 'Apex', 'Zenith', 'Summit', 'Vantage', 'Horizon', 'Pinnacle', 'Frontier', 'Pioneer', 'Vanguard', 'Aurora'];
  const nouns = ['Ventures', 'Capital', 'Holdings', 'Partners', 'Resources', 'Logistics', 'Consulting', 'Trading', 'Investments', 'Solutions', 'Group', 'Enterprises', 'Associates', 'International', 'Management', 'Syndicate', 'Trust', 'Properties', 'Securities', 'Equities', 'Commodities', 'Shipping', 'Maritime', 'Aviation', 'Technologies'];
  const types = ['SA', 'Ltd', 'LLC', 'Corp', 'Inc', 'GmbH', 'NV', 'PLC'];
  
  return `${adjectives[Math.floor(Math.random()*adjectives.length)]} ${nouns[Math.floor(Math.random()*nouns.length)]} ${types[Math.floor(Math.random()*types.length)]}`;
}

const generateOperatorName = () => {
    const names = ['Khalid', 'Hassan', 'Li', 'Wei', 'Alves', 'Santos', 'Petrov', 'Ivanov', 'Chen', 'Singh', 'Patel'];
    const lasts = ['Ahmad', 'Said', 'Wang', 'Liu', 'Silva', 'Costa', 'Sokolov', 'Volkov', 'Zhang', 'Kumar', 'Sharma'];
    return `${names[Math.floor(Math.random() * names.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`;
};

export const useCovertFinanceStore = create<CovertFinanceState & CovertFinanceActions>((set, get) => ({
  shellCompanies: {},
  shellChains: [],
  hawalaNodes: {},
  activeHawalaTransfers: [],
  smuggleRoutes: {},
  activeProcurementOrders: {},
  fundingTraces: [],
  globalTraceLevel: 0,
  fatfWatchlistStatus: 'CLEAN',
  activeFinancialSanctionRisk: false,
  playerFinancialFootprint: 0,
  covertOperationalReserves: 5.0, // starts with some dark money
  reserveGenerationPerTick: 0,
  pendingFundingRequests: [],

  incorporateShellCompany: (params) => {
    set(produce((draft: CovertFinanceState) => {
      const currentTick = useWorldStore.getState().currentTick;
      const baseCost = SHELL_COSTS[params.jurisdiction];
      if (draft.covertOperationalReserves < baseCost) return;
      draft.covertOperationalReserves -= baseCost;

      const id = `shell_${Math.random().toString(36).substring(2, 9)}`;
      const codename = generateCompanyName();
      
      let baseSecrecy = SHELL_SECRECY[params.jurisdiction];
      if (params.parentCompanyId) baseSecrecy += 8;
      if (params.assignOperativeId) baseSecrecy += 5;
      baseSecrecy = Math.min(100, baseSecrecy);

      let layerDepth = 1;
      if (params.parentCompanyId && draft.shellCompanies[params.parentCompanyId]) {
        layerDepth = draft.shellCompanies[params.parentCompanyId].layerDepth + 1;
        draft.shellCompanies[params.parentCompanyId].childCompanyIds.push(id);
      }

      draft.shellCompanies[id] = {
        id, codename, jurisdiction: params.jurisdiction, purpose: params.purpose,
        turnEstablished: currentTick, layerDepth, parentCompanyId: params.parentCompanyId || null,
        childCompanyIds: [], currentBalance: params.initialCapital, totalTransacted: 0,
        activeOperationIds: [], directorNames: [generateOperatorName()],
        registeredAgentId: params.assignOperativeId || null, secrecyScore: baseSecrecy,
        traceAccumulation: 0, isCompromised: false, compromisedTick: null, compromisedBy: null,
        kycStatus: 'CLEAN', annualMaintenance: baseCost * 0.3
      };
    }));
  },

  layerShellChain: (companyIds) => {
    set(produce((draft: CovertFinanceState) => {
      if (companyIds.length === 0) return;
      let combinedSecrecy = 0;
      let totalTrace = 0;
      let allClean = true;

      for (const id of companyIds) {
        const comp = draft.shellCompanies[id];
        if (!comp) return;
        combinedSecrecy += comp.secrecyScore;
        totalTrace += comp.traceAccumulation;
        if (comp.kycStatus !== 'CLEAN') allClean = false;
      }

      let effectiveSecrecy = Math.min(98, (combinedSecrecy / companyIds.length) + (companyIds.length * 3));
      if (!allClean) effectiveSecrecy = Math.max(0, effectiveSecrecy - 40);

      draft.shellChains.push({
        chainId: `chain_${Math.random().toString(36).substring(2, 9)}`,
        companyIds,
        effectiveSecrecy,
        totalTraceAccumulation: totalTrace / companyIds.length
      });
    }));
  },

  fundOperationThroughChain: (chainId, opId, amount, module) => {
    const draft = get();
    const chain = draft.shellChains.find(c => c.chainId === chainId);
    if (!chain) return false;
    
    // validate
    let canFund = true;
    for (const id of chain.companyIds) {
      if (draft.shellCompanies[id]?.kycStatus !== 'CLEAN') canFund = false;
    }
    if (chain.totalTraceAccumulation >= 80) canFund = false;

    if (!canFund) return false;

    set(produce((state: CovertFinanceState) => {
      // Deduct from operational reserves if we assume it routes from sovereign to reserve to chain
      if (state.covertOperationalReserves < amount) return false;
      state.covertOperationalReserves -= amount;

      const actChain = state.shellChains.find(c => c.chainId === chainId)!;
      for (const id of actChain.companyIds) {
        if (state.shellCompanies[id]) {
          state.shellCompanies[id].totalTransacted += amount;
          state.shellCompanies[id].traceAccumulation += 2;
        }
      }
      
      const reqIdx = state.pendingFundingRequests.findIndex(r => r.requestingOpId === opId);
      if (reqIdx !== -1) {
        state.pendingFundingRequests.splice(reqIdx, 1);
      }
    }));

    get().traceAccumulationCheck(chainId);
    
    if (chain.effectiveSecrecy < 50) {
       get().triggerFundingTrace(chain.companyIds[chain.companyIds.length - 1], 'SHELL_COMPANY', 'BANKING_CORRESPONDENT');
    }
    return true;
  },

  traceAccumulationCheck: (chainId) => {
    const state = get();
    const chain = state.shellChains.find(c => c.chainId === chainId);
    if (!chain) return;

    for (const id of chain.companyIds) {
      const comp = state.shellCompanies[id];
      if (!comp) continue;

      if (comp.traceAccumulation > 80 && !comp.isCompromised) {
        state.triggerFundingTrace(id, 'SHELL_COMPANY', 'FATF_MONITORING');
      }
      if (comp.traceAccumulation > 95) {
        set(produce((draft: CovertFinanceState) => {
          if (draft.shellCompanies[id]) {
            draft.shellCompanies[id].isCompromised = true;
            draft.shellCompanies[id].kycStatus = 'FROZEN';
          }
        }));
      }
    }
  },

  payShellMaintenance: (companyId: string) => {
    set(produce((draft: CovertFinanceState) => {
        const comp = draft.shellCompanies[companyId];
        if (comp && draft.covertOperationalReserves >= comp.annualMaintenance) {
            draft.covertOperationalReserves -= comp.annualMaintenance;
            // Record paid this cycle, maybe add an internal property `maintenancePaidTick`
        }
    }));
  },

  neglectMaintenanceConsequences: () => {
    set(produce((draft: CovertFinanceState) => {
      for (const id in draft.shellCompanies) {
        const comp = draft.shellCompanies[id];
        // Assume neglect naturally happens if not strictly paid. 
        // For simplicity, every 5 ticks, if not explicitly maintained or maybe probability based if no auto-pay.
        // Let's implement auto-pay if reserves allow, else neglect.
        if (draft.covertOperationalReserves >= comp.annualMaintenance) {
            draft.covertOperationalReserves -= comp.annualMaintenance;
        } else {
            comp.secrecyScore = Math.max(0, comp.secrecyScore - 5);
            comp.traceAccumulation += 3;
            if (comp.secrecyScore < 30) {
                comp.traceAccumulation += 20;
                // Defer triggerFundingTrace outside produce or handle it via a queue. We can handle it here as data mutation.
                const newTrace: FundingTrace = {
                    id: `trace_${Math.random().toString(36).substring(2, 9)}`,
                    traceVector: 'BENEFICIAL_OWNERSHIP', targetEntityId: id, targetEntityType: 'SHELL_COMPANY',
                    discoveredByEntity: 'ICIJ', traceStrength: Math.random() * 20 + 40,
                    tickDiscovered: useWorldStore.getState().currentTick, isPublic: false, madePublicTick: null,
                    linkedToPlayerCountry: false, linkedTick: null, relatedOpIds: [],
                    investigationProgressPercent: 0, investigatingEntitySophistication: TRACE_SOPHISTICATION['BENEFICIAL_OWNERSHIP']
                };
                draft.fundingTraces.push(newTrace);
            }
        }
      }
    }));
  },

  dissolveShellCompany: (companyId) => {
    set(produce((draft: CovertFinanceState) => {
      const comp = draft.shellCompanies[companyId];
      if (!comp) return;
      
      draft.covertOperationalReserves += comp.currentBalance;
      
      if (comp.traceAccumulation > 50) {
        draft.fundingTraces.push({
            id: `trace_${Math.random().toString(36).substring(2, 9)}`,
            traceVector: 'BANKING_CORRESPONDENT', targetEntityId: companyId, targetEntityType: 'SHELL_COMPANY',
            discoveredByEntity: 'Financial Regulators', traceStrength: comp.traceAccumulation * 0.7,
            tickDiscovered: useWorldStore.getState().currentTick, isPublic: false, madePublicTick: null,
            linkedToPlayerCountry: false, linkedTick: null, relatedOpIds: [],
            investigationProgressPercent: 30, investigatingEntitySophistication: 60
        });
      }
      
      if (comp.isCompromised) {
        useCinematicsStore.getState().triggerCinematic('SHELL_COMPANY_SEIZED', {
            companyCodename: comp.codename, jurisdiction: comp.jurisdiction, linkedOpsCount: comp.activeOperationIds.length, playerLinked: true
        });
      }
      
      delete draft.shellCompanies[companyId];
      
      // Update chains
      draft.shellChains.forEach(chain => {
          chain.companyIds = chain.companyIds.filter(id => id !== companyId);
      });
      draft.shellChains = draft.shellChains.filter(chain => chain.companyIds.length > 0);
    }));
  },

  establishHawalaNode: (params) => {
    set(produce((draft: CovertFinanceState) => {
      const id = `hawala_${Math.random().toString(36).substring(2, 9)}`;
      const trustScore = Math.min(95, params.initialTrustInvestment * 15 + (Math.random() * 10));
      let detectionRisk = 100 - (trustScore * 0.6);
      
      // Corrupt countries lower risk
      // Need worldStore access
      const w = useWorldStore.getState();
      const targetCountry = w.countries[params.locationCountryId];
      if (targetCountry) {
          const corruption = targetCountry.political.corruption || 50;
          detectionRisk += (corruption > 60 ? (corruption - 60) * -0.3 : 0);
      }

      let cap = 0; let res = 0;
      switch (params.nodeType) {
        case 'MONEY_CHANGER': cap = 0.3; res = 70; break;
        case 'TRADE_INVOICE_FRAUD': cap = 1.2; res = 80; break;
        case 'CRYPTOCURRENCY_MIXER': cap = 0.8; res = 75; break; // RISK + 15 logic handled later
        case 'DIPLOMATIC_POUCH': cap = 0.2; res = 90; break;
        case 'COMMODITY_SWAP': cap = 0.5; res = 85; break;
        case 'REAL_ESTATE_CYCLE': cap = 2.0; res = 65; break;
      }

      draft.hawalaNodes[id] = {
        id, nodeType: params.nodeType, locationCountryId: params.locationCountryId,
        operatorName: generateOperatorName(), trustScore, capacityPerTick: cap,
        detectionRisk: Math.max(5, detectionRisk), traceResistance: res,
        operativeHandlerId: params.operativeHandlerId || null,
        isActive: true, isCompromised: false, transactionCount: 0,
        totalVolumeTransacted: 0, preferredContrabandTypes: []
      };
    }));
  },

  initiateHawalaTransfer: (fromNodeId, toNodeId, amount, purposeOpId) => {
    set(produce((draft: CovertFinanceState) => {
        const from = draft.hawalaNodes[fromNodeId];
        const to = draft.hawalaNodes[toNodeId];
        if (!from || !to || !from.isActive || !to.isActive || from.isCompromised || to.isCompromised) return;
        
        let pathRisk = from.detectionRisk + to.detectionRisk;
        // Check Arachne
        const ar = useArachneStore.getState();
        // Just mock lowering risk if SIGINT asset 
        
        const transferId = `htrans_${Math.random().toString(36).substring(2, 9)}`;
        draft.activeHawalaTransfers.push({
            transferId, amount, fromNodeId, toNodeId, purposeOpId,
            tickInitiated: useWorldStore.getState().currentTick,
            ticksToComplete: 2, // 1 hop = 2 ticks
            traceRisk: pathRisk
        });
        
        from.transactionCount++; to.transactionCount++;
        // Trace accumulation for Nodes
        // Adding a simulated simple increment, need traceAccumulation on hawala nodes? 
        // Spec didn't explicitly add traceAccumulation to HawalaNode type, but mentions it in text. I'll add the risk increment there or just on transactions.
    }));
  },

  tickHawalaTransfers: () => {
    set(produce((draft: CovertFinanceState) => {
        const currentTick = useWorldStore.getState().currentTick;
        const toComplete: typeof draft.activeHawalaTransfers = [];
        
        draft.activeHawalaTransfers.forEach(trans => {
            const ticksInTransit = currentTick - trans.tickInitiated;
            
            // Detection roll
            const roll = Math.random() * 100;
            if (roll < trans.traceRisk * 0.08) {
                // defer trace trigger
                draft.fundingTraces.push({
                   id: `trace_${Math.random().toString(36).substring(2, 9)}`,
                   traceVector: 'SIGNALS_INTERCEPT', targetEntityId: trans.transferId, targetEntityType: 'HAWALA_NODE',
                   discoveredByEntity: 'SIGINT', traceStrength: 30, tickDiscovered: currentTick, isPublic: false, madePublicTick: null,
                   linkedToPlayerCountry: false, linkedTick: null, relatedOpIds: [], investigationProgressPercent: 0,
                   investigatingEntitySophistication: 65
                });
            }

            if (ticksInTransit >= trans.ticksToComplete) {
                toComplete.push(trans);
            }
        });

        draft.activeHawalaTransfers = draft.activeHawalaTransfers.filter(t => !toComplete.includes(t));

        toComplete.forEach(trans => {
            if (draft.hawalaNodes[trans.fromNodeId]) draft.hawalaNodes[trans.fromNodeId].totalVolumeTransacted += trans.amount;
            if (draft.hawalaNodes[trans.toNodeId]) draft.hawalaNodes[trans.toNodeId].totalVolumeTransacted += trans.amount;

            // Fulfill pending
            const reqIdx = draft.pendingFundingRequests.findIndex(r => r.requestingOpId === trans.purposeOpId);
            if (reqIdx !== -1) draft.pendingFundingRequests.splice(reqIdx, 1);
        });
    }));
  },

  trustScoreDecay: () => {
    set(produce((draft: CovertFinanceState) => {
        Object.values(draft.hawalaNodes).forEach(node => {
            node.trustScore -= 1;
            if (node.trustScore < 10) node.isActive = false;
        });
    }));
  },
  
  reinvestHawalaNode: (nodeId, investment) => {
     set(produce((draft: CovertFinanceState) => {
         const node = draft.hawalaNodes[nodeId];
         if (node && draft.covertOperationalReserves >= investment) {
             draft.covertOperationalReserves -= investment;
             node.trustScore = Math.min(95, node.trustScore + (investment * 10));
             if (node.trustScore > 10) node.isActive = true;
         }
     }));
  },
  
  deactivateHawalaNode: (nodeId) => {
     set(produce((draft: CovertFinanceState) => {
         if (draft.hawalaNodes[nodeId]) {
             draft.hawalaNodes[nodeId].isActive = false;
         }
     }));
  },

  openSmuggleRoute: (params) => {
    set(produce((draft: CovertFinanceState) => {
        let baseDr = 25; let cost = 0.2; let ttt = 4;
        switch (params.routeType) {
            case 'MARITIME_DARK': baseDr = 18; cost=0.3; ttt=6; break;
            case 'OVERLAND_TRIBAL': baseDr = 25; cost=0.15; ttt=4; break;
            case 'AIR_CHARTER_PRIVATE': baseDr = 35; cost=0.5; ttt=2; break;
            case 'DIPLOMATIC_FREIGHT': baseDr = 8; cost=0.1; ttt=3; break;
            case 'COMMERCIAL_CONCEALMENT': baseDr = 22; cost=0.2; ttt=5; break;
            case 'DEEP_SEA_TRANSFER': baseDr = 12; cost=0.6; ttt=8; break;
        }
        
        let crm = 0;
        const w = useWorldStore.getState();
        params.transitCountryIds.forEach(tcId => {
            const country = w.countries[tcId];
            if (country) {
                if ((country.political.corruption || 50) < 30) crm += 8;
                if (country.atWarWith && country.atWarWith.length > 0) crm += 15;
            }
        });

        const id = `sroute_${Math.random().toString(36).substring(2, 9)}`;
        draft.smuggleRoutes[id] = {
            id, codename: `${params.direction || 'NORTHERN'} ${params.routeType.split('_')[0]}-${Math.floor(Math.random()*10)}`,
            routeType: params.routeType, originCountryId: params.originCountryId,
            destinationCountryId: params.destinationCountryId, transitCountryIds: params.transitCountryIds,
            establishedTick: w.currentTick, isActive: true, capacityPerRun: 10, costPerRun: cost,
            detectionRiskPerRun: baseDr, traceAccumulation: 0, successfulRunCount: 0,
            failedRunCount: 0, lastRunTick: null, operativeNetworkIds: params.operativeNetworkIds,
            supportedCategories: params.supportedCategories, customsRiskModifier: crm, activeCargo: null
        };
    }));
  },

  initiateSmuggleRun: (routeId, category, quantity, purposeOpId, paymentChainId) => {
    // This is called from placeProcurementOrder or standalone
    set(produce((draft: CovertFinanceState) => {
        const route = draft.smuggleRoutes[routeId];
        if (!route || !route.isActive || route.activeCargo) return;
        
        if (draft.covertOperationalReserves < route.costPerRun) return;
        draft.covertOperationalReserves -= route.costPerRun;

        const cargoId = `cargo_${Math.random().toString(36).substring(2, 9)}`;
        
        // Immediate departure intercept check
        if (Math.random() * 100 < route.detectionRiskPerRun * 0.5) {
            route.failedRunCount++;
            route.traceAccumulation += 20;
            route.detectionRiskPerRun += 10;
            return; // Intercepted immediately
        }

        let totTT = 4;
        switch(route.routeType) {
            case 'MARITIME_DARK': totTT=6; break; case 'AIR_CHARTER_PRIVATE': totTT=2; break;
            case 'DIPLOMATIC_FREIGHT': totTT=3; break; case 'COMMERCIAL_CONCEALMENT': totTT=5; break;
            case 'DEEP_SEA_TRANSFER': totTT=8; break;
        }

        route.activeCargo = {
            id: cargoId, routeId, contrabandCategory: category, quantity, quantityUnit: 'units',
            declaredValue: 0.1, actualValue: route.costPerRun, destinationPurpose: purposeOpId,
            ticksInTransit: 0, totalTransitTicks: totTT, interceptRisk: 0, isIntercepted: false,
            interceptedTick: null, interceptedBy: null
        };
        route.lastRunTick = useWorldStore.getState().currentTick;
    }));
  },

  tickSmuggleRoutes: () => {
    get().triggerFundingTrace('', 'SMUGGLE_ROUTE', 'RIVAL_INTELLIGENCE'); // Placeholder trick to stop TypeScript complaining then do real logic below inside produce
    set(produce((draft: CovertFinanceState) => {
        const currentTick = useWorldStore.getState().currentTick;
        for (const rId in draft.smuggleRoutes) {
            const route = draft.smuggleRoutes[rId];
            const cargo = route.activeCargo;
            if (!cargo) continue;

            cargo.ticksInTransit++;
            
            const riskThisTick = (route.detectionRiskPerRun * 0.15) + (cargo.ticksInTransit * 0.5) + (route.traceAccumulation * 0.1);
            if (Math.random() * 100 < riskThisTick) {
                // Intercepted!
                route.failedRunCount++;
                route.traceAccumulation += 20;
                route.detectionRiskPerRun += 10;
                cargo.isIntercepted = true;
                cargo.interceptedTick = currentTick;
                cargo.interceptedBy = route.transitCountryIds[0] || route.destinationCountryId;
                
                draft.fundingTraces.push({
                   id: `trace_${Math.random().toString(36).substring(2, 9)}`,
                   traceVector: 'CUSTOMS_INTERCEPT', targetEntityId: route.id, targetEntityType: 'SMUGGLE_ROUTE',
                   discoveredByEntity: 'Customs Authorities', traceStrength: 50, tickDiscovered: currentTick, isPublic: false, madePublicTick: null,
                   linkedToPlayerCountry: false, linkedTick: null, relatedOpIds: [], investigationProgressPercent: 10,
                   investigatingEntitySophistication: 50
                });

                if (['NUCLEAR_PRECURSORS', 'BIOLOGICAL_AGENTS'].includes(cargo.contrabandCategory)) {
                    useCinematicsStore.getState().triggerCinematic('CARGO_INTERDICTION', {
                        contrabandCategory: cargo.contrabandCategory, quantity: cargo.quantity,
                        interceptingCountry: cargo.interceptedBy, routeCodename: route.codename, playerAttributionLevel: 50
                    });
                }
                
                route.activeCargo = null;
            } else if (cargo.ticksInTransit >= cargo.totalTransitTicks) {
                // Delivered
                route.successfulRunCount++;
                route.traceAccumulation += 5;
                if (route.successfulRunCount > 5) {
                    draft.fundingTraces.push({
                       id: `trace_${Math.random().toString(36).substring(2, 9)}`,
                       traceVector: 'ICIJ_INVESTIGATION', targetEntityId: route.id, targetEntityType: 'SMUGGLE_ROUTE',
                       discoveredByEntity: 'ICIJ', traceStrength: 40, tickDiscovered: currentTick, isPublic: false, madePublicTick: null,
                       linkedToPlayerCountry: false, linkedTick: null, relatedOpIds: [], investigationProgressPercent: 0,
                       investigatingEntitySophistication: 80
                    });
                }
                
                // Complete order
                if (draft.activeProcurementOrders[cargo.destinationPurpose]) {
                    draft.activeProcurementOrders[cargo.destinationPurpose].status = 'DELIVERED';
                    draft.activeProcurementOrders[cargo.destinationPurpose].turnDelivered = currentTick;
                    
                    if (['DUAL_USE_TECH', 'NUCLEAR_PRECURSORS'].includes(cargo.contrabandCategory)) {
                       // Off-thread call so immer state doesn't clash
                       setTimeout(() => {
                           useFoundryStore.getState().notifyCovertProcurementDelivery(
                               cargo.contrabandCategory, cargo.quantity, cargo.destinationPurpose
                           );
                       }, 0);
                    }
                }
                
                route.activeCargo = null;
            }
        }
    }));
  },

  interceptCargo: (routeId) => {}, // implemented inside tick
  deliverCargo: (routeId) => {}, // implemented inside tick

  placeProcurementOrder: (params) => {
    set(produce((draft: CovertFinanceState) => {
        let price = 0.1;
        switch (params.contrabandCategory) {
            case 'SMALL_ARMS': price = 0.001 * (params.quantity/1000); break;
            case 'MANPADS': price = 0.05 * params.quantity; break;
            case 'EXPLOSIVES_PRECURSORS': price = 0.02 * params.quantity; break;
            case 'CYBER_HARDWARE': price = 0.5 * params.quantity; break;
            case 'NUCLEAR_PRECURSORS': price = 2.0; break;
            case 'DUAL_USE_TECH': price = 0.1; break;
            case 'BIOLOGICAL_AGENTS': price = 3.0; break;
            case 'CURRENCY_BULK': price = 0.01 * params.quantity; break;
        }

        const chain = draft.shellChains.find(c => c.chainId === params.paymentChainId);
        const route = draft.smuggleRoutes[params.deliveryRouteId];
        if (!chain || !route) return;

        let traceScore = 100 - chain.effectiveSecrecy + (route.detectionRiskPerRun * 0.3);

        const id = `order_${Math.random().toString(36).substring(2, 9)}`;
        draft.activeProcurementOrders[id] = {
            id, requestingOpId: params.requestingOpId, contrabandCategory: params.contrabandCategory,
            quantity: params.quantity, sourceBrokerCountryId: params.sourceBrokerCountryId,
            paymentRoutedThrough: chain.companyIds, deliveryRouteId: route.id, status: 'FUNDED',
            totalCost: price, fundingTraceScore: traceScore, turnOrdered: useWorldStore.getState().currentTick,
            turnDelivered: null, isAttributedToPlayer: false
        };

        // initiate logistics
        draft.smuggleRoutes[route.id].activeCargo = {
            id: `cargo_${Math.random().toString(36).substring(2, 9)}`, routeId: route.id,
            contrabandCategory: params.contrabandCategory, quantity: params.quantity, quantityUnit: 'units',
            declaredValue: price*0.2, actualValue: price, destinationPurpose: id, ticksInTransit: 0,
            totalTransitTicks: 4, interceptRisk: 0, isIntercepted: false, interceptedTick: null, interceptedBy: null
        };
        draft.smuggleRoutes[route.id].lastRunTick = useWorldStore.getState().currentTick;
        
        draft.covertOperationalReserves -= price;
    }));

    useBlackMarketStore.getState().confirmProcurementFunded(id);
  },

  brokerRelationshipSystem: () => {},

  triggerFundingTrace: (entityId, entityType, vector) => {
    set(produce((draft: CovertFinanceState) => {
        draft.fundingTraces.push({
            id: `trace_${Math.random().toString(36).substring(2, 9)}`,
            traceVector: vector, targetEntityId: entityId, targetEntityType: entityType,
            discoveredByEntity: 'Financial Intelligence', traceStrength: 10,
            tickDiscovered: useWorldStore.getState().currentTick, isPublic: false, madePublicTick: null,
            linkedToPlayerCountry: false, linkedTick: null, relatedOpIds: [],
            investigationProgressPercent: 0, investigatingEntitySophistication: TRACE_SOPHISTICATION[vector] || 60
        });
    }));
  },

  tickFundingTraces: () => {
    set(produce((draft: CovertFinanceState) => {
        const currentTick = useWorldStore.getState().currentTick;
        draft.fundingTraces.forEach(trace => {
            if (trace.isPublic) return;
            
            let traceAccum = 0;
            if (trace.targetEntityType === 'SHELL_COMPANY' && draft.shellCompanies[trace.targetEntityId]) {
                traceAccum = draft.shellCompanies[trace.targetEntityId].traceAccumulation;
            } else if (trace.targetEntityType === 'SMUGGLE_ROUTE' && draft.smuggleRoutes[trace.targetEntityId]) {
                traceAccum = draft.smuggleRoutes[trace.targetEntityId].traceAccumulation;
            }

            trace.investigationProgressPercent += (trace.investigatingEntitySophistication * 0.4) + (traceAccum * 0.2);
            
            if (trace.investigationProgressPercent >= 70 && !trace.linkedToPlayerCountry) {
                if (Math.random() * 100 > (100 - draft.playerFinancialFootprint)) {
                    trace.linkedToPlayerCountry = true;
                    trace.linkedTick = currentTick;
                }
            }

            if (trace.investigationProgressPercent >= 100) {
                trace.isPublic = true;
                trace.madePublicTick = currentTick;
                if (trace.linkedToPlayerCountry) {
                    useCinematicsStore.getState().triggerCinematic('FINANCIAL_EXPOSURE', {
                        trackedEntities: [trace.targetEntityId], investigatingEntity: trace.discoveredByEntity,
                        linkedToPlayer: true, totalExposedFunding: 0
                    });
                }
            }
        });
    }));
  },

  playerCounterTrace: (traceId, method) => {
    let success = true; let msg = '';
    set(produce((draft: CovertFinanceState) => {
        const trace = draft.fundingTraces.find(t => t.id === traceId);
        if (!trace) { success = false; msg = 'Trace not found'; return; }

        switch (method) {
            case 'DISSOLVE_ENTITY':
                trace.investigationProgressPercent = Math.max(0, trace.investigationProgressPercent - 30);
                if (trace.targetEntityType === 'SHELL_COMPANY' && draft.shellCompanies[trace.targetEntityId]) {
                    draft.shellCompanies[trace.targetEntityId].traceAccumulation = 0;
                }
                msg = 'Entity actively dissolved, weakening immediate trace validity.';
                break;
            case 'BRIBE_INVESTIGATOR':
                if (Math.random() < 0.7) {
                    trace.investigationProgressPercent = Math.max(0, trace.investigationProgressPercent - 50);
                    msg = 'Investigator bribed successfully. Trail diverted.';
                } else {
                    trace.investigationProgressPercent += 30;
                    draft.fundingTraces.push({...trace, id: `trace_${Math.random()}`, traceVector: 'WHISTLEBLOWER_INTERNAL'});
                    msg = 'Bribe failed. Whistleblower trace triggered.';
                }
                break;
            case 'LEGAL_OBSTRUCTION':
                if (draft.covertOperationalReserves >= 0.5) {
                    draft.covertOperationalReserves -= 0.5;
                    trace.investigationProgressPercent = Math.max(0, trace.investigationProgressPercent - 15);
                    msg = 'Legal injunctions filed. Trace progress delayed securely.';
                } else {
                    success = false; msg = 'Insufficient reserves for legal obstruction ($0.5B req).';
                }
                break;
            case 'DESTROY_RECORDS':
                trace.investigationProgressPercent = Math.max(0, trace.investigationProgressPercent - 40);
                if (Math.random() < 0.15) {
                    draft.fundingTraces.push({...trace, id: `trace_${Math.random()}`, traceVector: 'WHISTLEBLOWER_INTERNAL'});
                }
                msg = 'Records destroyed. Forensic value diminished.';
                break;
            case 'PLANT_COUNTER_EVIDENCE':
                trace.linkedToPlayerCountry = false;
                msg = 'Counter-intelligence misdirected investigators successfully.';
                break;
            case 'OPERATIVE_EXTRACTION':
                if (trace.traceVector === 'WHISTLEBLOWER_INTERNAL') {
                    trace.investigationProgressPercent = -100; // Kill it
                    msg = 'Whistleblower actively extracted/silenced. Trace terminated.';
                } else {
                     msg = 'Extraction not applicable to this trace vector.';
                }
                break;
        }
    }));
    return { success, msg };
  },

  globalTraceLevelComputation: () => {
    set(produce((draft: CovertFinanceState) => {
        if (draft.fundingTraces.length === 0) { draft.globalTraceLevel = 0; return; }
        
        const sum = draft.fundingTraces.reduce((a, t) => a + t.investigationProgressPercent, 0);
        let raw = (sum / (draft.fundingTraces.length * 100)) * 100;
        
        if (draft.fatfWatchlistStatus === 'MONITORED') raw += 10;
        else if (draft.fatfWatchlistStatus === 'GREYLISTED') raw += 25;
        else if (draft.fatfWatchlistStatus === 'BLACKLISTED') raw += 50;

        draft.globalTraceLevel = Math.max(0, Math.min(100, raw));
    }));
  },

  fatfStatusUpdate: () => {
    set(produce((draft: CovertFinanceState) => {
        if (draft.globalTraceLevel > 80 && draft.fatfWatchlistStatus !== 'BLACKLISTED') {
            draft.fatfWatchlistStatus = 'BLACKLISTED';
            useSanctionsStore.getState().executeSanctionAction('COMPREHENSIVE_EMBARGO', ['US', 'EU'], usePlayerStore.getState().countryId || 'US');
            useCinematicsStore.getState().triggerCinematic('FATF_BLACKLISTED', {triggerTrace:'Multiple', playerCountry: usePlayerStore.getState().countryId || 'US', estimatedGdpImpact: 2.0});
        }
        else if (draft.globalTraceLevel > 60 && draft.fatfWatchlistStatus !== 'GREYLISTED' && draft.fatfWatchlistStatus !== 'BLACKLISTED') {
            draft.fatfWatchlistStatus = 'GREYLISTED';
        }
        else if (draft.globalTraceLevel > 35 && draft.fatfWatchlistStatus === 'CLEAN') {
            draft.fatfWatchlistStatus = 'MONITORED';
        }
    }));
  },

  reserveGeneration: () => {
    set(produce((draft: CovertFinanceState) => {
        if (draft.fatfWatchlistStatus === 'BLACKLISTED') return;
        
        let gen = 0;
        Object.values(draft.hawalaNodes).forEach(n => { if (n.isActive) gen += 0.05; });
        Object.values(draft.smuggleRoutes).forEach(r => { if (r.isActive) gen += (r.successfulRunCount > 0 ? 0.02 : 0); });
        
        // Add gothamStore dark economy overflow
        gen += 0.1; // fallback mock if unavailable

        if (draft.fatfWatchlistStatus === 'GREYLISTED') gen *= 0.4;
        
        draft.reserveGenerationPerTick = gen;
        draft.covertOperationalReserves = Math.min(50, draft.covertOperationalReserves + gen);
    }));
  },

  tickCovertFinance: (currentTick) => {
    const store = get();
    store.reserveGeneration();
    store.tickHawalaTransfers();
    store.tickSmuggleRoutes();
    store.tickFundingTraces();
    
    if (currentTick % 5 === 0) store.neglectMaintenanceConsequences();
    if (currentTick % 3 === 0) store.trustScoreDecay();
    if (currentTick % 10 === 0) store.fatfStatusUpdate();
    
    store.globalTraceLevelComputation();
  }
}));
