import { create } from 'zustand';
import { produce } from 'immer';
import { 
  CommodityType, 
  RouteMode, 
  RouteStatus, 
  ChokepointStatus, 
  CommodityFlow, 
  Chokepoint, 
  SupplyDependencyRecord, 
  DisruptionSignal, 
  ImpactPreview 
} from '../types/foundry';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useArachneStore } from './arachneStore';
import { queueBusEvent } from '../sim/eventBus/dispatcher';
import { createBusEvent } from '../sim/eventBus/eventFactories';
import { BusEvent } from '../sim/eventBus/types';

interface FoundryState {
  flows: CommodityFlow[];
  chokepoints: Chokepoint[];
  dependencies: SupplyDependencyRecord[];
  disruptionSignals: DisruptionSignal[];
  changeLog: { tick: number; entityId: string; type: 'ROUTE' | 'CHOKEPOINT'; summary: string }[];
  
  // Controls
  selectedFlowId: string | null;
  selectedChokepointId: string | null;
  activeCommodity: CommodityType | 'ALL';
  selectedCountryId: string | null; // Filter to show routes touching this country
  minVolumeThreshold: number;
  showOnlyStressed: boolean;
}

interface FoundryActions {
  setSelectedFlowId: (id: string | null) => void;
  setSelectedChokepointId: (id: string | null) => void;
  setActiveCommodity: (commodity: CommodityType | 'ALL') => void;
  setSelectedCountryId: (countryId: string | null) => void;
  setFilters: (updates: Partial<Pick<FoundryState, 'minVolumeThreshold' | 'showOnlyStressed' | 'activeCommodity' | 'selectedCountryId'>>) => void;
  
  // Coercive actions
  calculatePreActionImpact: (
    actionType: 'EMBARGO' | 'SANCTION' | 'INTERDICTION' | 'ROUTE_CLOSURE',
    actor: string,
    target: string,
    commodities: CommodityType[]
  ) => ImpactPreview;
  
  executeCoerciveAction: (
    actionType: 'EMBARGO' | 'SANCTION' | 'INTERDICTION' | 'ROUTE_CLOSURE',
    actor: string,
    target: string,
    commodities: CommodityType[]
  ) => void;
  
  toggleChokepointStatus: (chokepointId: string) => void;
  tickFoundry: (currentTick: number) => void;
}

// Initial Core Seeded Content
const INITIAL_CHOKEPOINTS: Chokepoint[] = [
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    coordinates: { x: 50.8, y: 31.0 }, // Maps in our custom projection near long: 55, lat: 26
    chokepointType: 'strait',
    connectedCommodities: ['oil', 'gas'],
    throughputImportance: 95,
    exposureScore: 65,
    controllingCountryIds: ['SA', 'IR'],
    vulnerabilityTags: ['ASYMMETRIC_THREAT', 'SHORE_BATTERIES', 'MINE_WARFARE'],
    currentDisruptionStatus: 'SECURE',
    strategicSummary: 'Handles 21 million barrels of crude oil per day (20% of global petroleum consumption) and vast LNG volumes from Gulf producers.'
  },
  {
    id: 'malacca',
    name: 'Strait of Malacca',
    coordinates: { x: 101.5, y: 2.5 }, // Near long: 102, lat: 2
    chokepointType: 'strait',
    connectedCommodities: ['oil', 'semiconductors', 'strategic'],
    throughputImportance: 90,
    exposureScore: 50,
    controllingCountryIds: ['IN', 'CN', 'US'], // Strategic buffer adjacent
    vulnerabilityTags: ['CONGESTION_RISK', 'PIRACY_DENSITY', 'COERCIVE_BLOCKADE'],
    currentDisruptionStatus: 'SECURE',
    strategicSummary: 'Primary maritime gateway connecting the Indian Ocean & South China Sea. Vital for East Asian energy supply and shipping of tech hardware.'
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    coordinates: { x: 32.5, y: 30.0 }, // Near long: 32, lat: 30
    chokepointType: 'canal',
    connectedCommodities: ['oil', 'gas', 'food', 'rareearths', 'strategic'],
    throughputImportance: 85,
    exposureScore: 55,
    controllingCountryIds: ['EG'],
    vulnerabilityTags: ['PHYSICAL_CONGESTION', 'MISSILE_TARGETING', 'REGULATORY_TOLLS'],
    currentDisruptionStatus: 'SECURE',
    strategicSummary: 'Artificial sea-level waterway in Egypt, cutting transit times between Europe and Asia by 14 days. Highly vulnerable to regional proxy conflicts.'
  },
  {
    id: 'taiwan_strait',
    name: 'Taiwan Strait',
    coordinates: { x: 120.5, y: 24.0 }, // Near long: 120, lat: 24
    chokepointType: 'strait',
    connectedCommodities: ['semiconductors', 'rareearths', 'strategic'],
    throughputImportance: 98,
    exposureScore: 80,
    controllingCountryIds: ['TW', 'CN'],
    vulnerabilityTags: ['HIGH_INTENSITY_WARZONE', 'FAB_CONCENTRATION', 'AMPHIBIOUS_BLOCKADE'],
    currentDisruptionStatus: 'SECURE',
    strategicSummary: 'The nerve center of the modern electronics world. Hosts advanced chip foundries responsible for over 90% of global state-of-the-art processors.'
  },
  {
    id: 'bab_el_mandeb',
    name: 'Bab-el-Mandeb',
    coordinates: { x: 43.5, y: 12.5 }, // Near long: 43, lat: 12.5
    chokepointType: 'strait',
    connectedCommodities: ['oil', 'gas', 'food'],
    throughputImportance: 80,
    exposureScore: 70,
    controllingCountryIds: ['SA', 'EG'],
    vulnerabilityTags: ['PROXY_DRONES', 'UNSTABLE_SHORELINES', 'SHIPPING_REROUTING'],
    currentDisruptionStatus: 'SECURE',
    strategicSummary: 'The gateway between the Horn of Africa and Middle East linking the Red Sea to the Gulf of Aden. Under constant threat from asymmetric drone units.'
  }
];

const INITIAL_FLOWS: CommodityFlow[] = [
  // Oil flows
  {
    id: 'oil-sa-jp',
    commodityType: 'oil',
    sourceCountryId: 'SA',
    destinationCountryId: 'JP',
    transitPath: ['IN'],
    transitChokepointIds: ['hormuz', 'malacca'],
    mode: 'maritime',
    volumeScore: 85,
    strategicImportance: 95,
    substitutability: 25,
    disruptionSensitivity: 60,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Japan relies on Persian Gulf crude for over 80% of its petroleum refining. Route forces dependency on both Strait of Hormuz and Malacca.'
  },
  {
    id: 'oil-sa-us',
    commodityType: 'oil',
    sourceCountryId: 'SA',
    destinationCountryId: 'US',
    transitPath: ['EG'],
    transitChokepointIds: ['hormuz', 'suez'],
    mode: 'maritime',
    volumeScore: 40,
    strategicImportance: 45,
    substitutability: 80,
    disruptionSensitivity: 40,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Strategic reserve cushion and long-term bilateral arrangements. US can substitute with domestic fracking production and Canadian imports.'
  },
  {
    id: 'oil-ru-cn',
    commodityType: 'oil',
    sourceCountryId: 'RU',
    destinationCountryId: 'CN',
    transitPath: [],
    transitChokepointIds: [],
    mode: 'pipeline',
    volumeScore: 75,
    strategicImportance: 80,
    substitutability: 45,
    disruptionSensitivity: 20,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Siberian pipeline bypasses ocean corridors entirely, ensuring high reliability for China even during West-Pacific maritime blockade scenarios.'
  },
  // Gas flows
  {
    id: 'gas-ru-de',
    commodityType: 'gas',
    sourceCountryId: 'RU',
    destinationCountryId: 'DE',
    transitPath: ['UA'],
    transitChokepointIds: [],
    mode: 'pipeline',
    volumeScore: 65,
    strategicImportance: 85,
    substitutability: 30,
    disruptionSensitivity: 80,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Pipeline transit through Eastern European land corridors. Highly susceptible to combat interdiction and pipeline sabotage.'
  },
  // Semiconductor flows
  {
    id: 'semi-tw-us',
    commodityType: 'semiconductors',
    sourceCountryId: 'TW',
    destinationCountryId: 'US',
    transitPath: ['JP'],
    transitChokepointIds: ['taiwan_strait'],
    mode: 'maritime',
    volumeScore: 95,
    strategicImportance: 98,
    substitutability: 10,
    disruptionSensitivity: 85,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'The primary silicon pipeline for AI hardware, defense micro-electronics, and aerospace instrumentation. Overwhelming dependency.'
  },
  {
    id: 'semi-tw-de',
    commodityType: 'semiconductors',
    sourceCountryId: 'TW',
    destinationCountryId: 'DE',
    transitPath: ['CN', 'IN'],
    transitChokepointIds: ['taiwan_strait', 'malacca', 'suez'],
    mode: 'mixed',
    volumeScore: 75,
    strategicImportance: 90,
    substitutability: 15,
    disruptionSensitivity: 75,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Fuels the advanced automation and automotive sectors in Germany. Route spans multiple critical geo-chokepoints.'
  },
  // Food flows
  {
    id: 'food-us-jp',
    commodityType: 'food',
    sourceCountryId: 'US',
    destinationCountryId: 'JP',
    transitPath: [],
    transitChokepointIds: [],
    mode: 'maritime',
    volumeScore: 70,
    strategicImportance: 75,
    substitutability: 50,
    disruptionSensitivity: 30,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Japan relies heavily on grain and protein imports from US agricultural centers to sustain public caloric requirements.'
  },
  {
    id: 'food-ru-eg',
    commodityType: 'food',
    sourceCountryId: 'RU',
    destinationCountryId: 'EG',
    transitPath: ['TR'],
    transitChokepointIds: ['suez'],
    mode: 'maritime',
    volumeScore: 80,
    strategicImportance: 92,
    substitutability: 20,
    disruptionSensitivity: 70,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Egypt is the largest wheat importer on earth. Disruptions to Black Sea grain vessels threaten immediate bread riots and government overthrow in Cairo.'
  },
  // Rare Earths flows
  {
    id: 'rare-cn-us',
    commodityType: 'rareearths',
    sourceCountryId: 'CN',
    destinationCountryId: 'US',
    transitPath: [],
    transitChokepointIds: [],
    mode: 'maritime',
    volumeScore: 90,
    strategicImportance: 95,
    substitutability: 12,
    disruptionSensitivity: 75,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Neodymium, dysprosium, and lanthanum processed in Sichuan are required for advanced missile guidance steering, stealth skins, and EV magnets.'
  },
  // Strategic Materials
  {
    id: 'strat-ru-us',
    commodityType: 'strategic',
    sourceCountryId: 'RU',
    destinationCountryId: 'US',
    transitPath: ['GB'],
    transitChokepointIds: [],
    mode: 'maritime',
    volumeScore: 55,
    strategicImportance: 70,
    substitutability: 35,
    disruptionSensitivity: 50,
    routeStatus: 'STABLE',
    linkedTreatyIds: [],
    linkedWorldEventIds: [],
    linkedIntelFactIds: [],
    lastChangedTick: 1,
    dependenciesSummary: 'Palladium supply chain for computer chip coatings and titanium forgings. Russia holds highly coercive control over advanced aerospace inputs.'
  }
];

const INITIAL_DEPENDENCIES: SupplyDependencyRecord[] = [
  {
    countryId: 'JP',
    commodityType: 'oil',
    dependenceRatio: 92,
    primarySourceCountryId: 'SA',
    primaryRouteId: 'oil-sa-jp',
    chokepointExposureScore: 85,
    substituteAvailability: 'LIMITED',
    resilienceRating: 35 // Stockpile only holds 90 days
  },
  {
    countryId: 'US',
    commodityType: 'semiconductors',
    dependenceRatio: 88,
    primarySourceCountryId: 'TW',
    primaryRouteId: 'semi-tw-us',
    chokepointExposureScore: 90,
    substituteAvailability: 'NONE',
    resilienceRating: 15 // Tech manufacturing breaks within 3 weeks
  },
  {
    countryId: 'DE',
    commodityType: 'gas',
    dependenceRatio: 78,
    primarySourceCountryId: 'RU',
    primaryRouteId: 'gas-ru-de',
    chokepointExposureScore: 30,
    substituteAvailability: 'LIMITED',
    resilienceRating: 45 // LNG storage terminals provide temporary relief
  },
  {
    countryId: 'EG',
    commodityType: 'food',
    dependenceRatio: 85,
    primarySourceCountryId: 'RU',
    primaryRouteId: 'food-ru-eg',
    chokepointExposureScore: 75,
    substituteAvailability: 'NONE',
    resilienceRating: 10 // Immediate bread scarcity risk
  },
  {
    countryId: 'US',
    commodityType: 'rareearths',
    dependenceRatio: 94,
    primarySourceCountryId: 'CN',
    primaryRouteId: 'rare-cn-us',
    chokepointExposureScore: 50,
    substituteAvailability: 'LIMITED',
    resilienceRating: 20 // Defense stockpiles are severely depleted
  }
];

export const useFoundryStore = create<FoundryState & FoundryActions>((set, get) => ({
  flows: INITIAL_FLOWS,
  chokepoints: INITIAL_CHOKEPOINTS,
  dependencies: INITIAL_DEPENDENCIES,
  disruptionSignals: [],
  changeLog: [],
  
  selectedFlowId: null,
  selectedChokepointId: null,
  activeCommodity: 'ALL',
  selectedCountryId: null,
  minVolumeThreshold: 0,
  showOnlyStressed: false,

  setSelectedFlowId: (id) => set({ selectedFlowId: id, selectedChokepointId: null }),
  setSelectedChokepointId: (id) => set({ selectedChokepointId: id, selectedFlowId: null }),
  setActiveCommodity: (commodity) => set({ activeCommodity: commodity }),
  setSelectedCountryId: (countryId) => set({ selectedCountryId: countryId }),
  
  setFilters: (updates) => set((state) => ({ ...state, ...updates })),

  calculatePreActionImpact: (actionType, actor, target, commodities) => {
    const { flows, dependencies } = get();
    
    // Find all flows matching the actor/target parameters
    const applicableFlows = flows.filter(
      f => (f.sourceCountryId === target || f.destinationCountryId === target) &&
           (commodities.length === 0 || commodities.includes(f.commodityType))
    );
    
    let baseDisruptionSeverity = 0;
    let fallbackRerouting = true;
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
    
    if (actionType === 'EMBARGO') {
      baseDisruptionSeverity = 70;
      fallbackRerouting = false;
    } else if (actionType === 'SANCTION') {
      baseDisruptionSeverity = 45;
      fallbackRerouting = true;
    } else if (actionType === 'INTERDICTION') {
      baseDisruptionSeverity = 85;
      fallbackRerouting = false;
      confidence = 'MEDIUM';
    } else if (actionType === 'ROUTE_CLOSURE') {
      baseDisruptionSeverity = 95;
      fallbackRerouting = true;
    }

    const affectedCommodityList = commodities.length > 0 
      ? commodities 
      : (applicableFlows.length > 0 ? Array.from(new Set(applicableFlows.map(f => f.commodityType))) : ['oil'] as CommodityType[]);

    // Calculate dynamic severity based on substitutability
    let adjustedSeverity = baseDisruptionSeverity;
    if (applicableFlows.length > 0) {
      const avgSubstitute = applicableFlows.reduce((sum, f) => sum + (100 - f.substitutability), 0) / applicableFlows.length;
      adjustedSeverity = Math.round((baseDisruptionSeverity + avgSubstitute) / 2);
    }

    // Determine affected allies
    const affectedAlliesSet = new Set<string>();
    applicableFlows.forEach(f => {
      if (f.destinationCountryId !== actor && f.destinationCountryId !== target) {
        affectedAlliesSet.add(f.destinationCountryId);
      }
    });

    // Compute first order impact summaries
    let firstOrderEconomicImpact = `Immediate supply shock to ${target}. `;
    if (affectedCommodityList.includes('semiconductors')) {
      firstOrderEconomicImpact += `Advanced silicon manufacturing pipelines experience immediate component shortages, locking up industrial IoT and consumer manufacturing.`;
    } else if (affectedCommodityList.includes('oil') || affectedCommodityList.includes('gas')) {
      firstOrderEconomicImpact += `Energy retail prices skyrocket by an estimated +40%, putting massive inflationary loads on the country's central bank and currency.`;
    } else if (affectedCommodityList.includes('food')) {
      firstOrderEconomicImpact += `Direct threat to calorie supplies. Likely to trigger grain speculation, grocery hoard panics, and civil worker walkouts.`;
    } else {
      firstOrderEconomicImpact += `Severe industrial material crunch, degrading downstream hardware foundries and chemical processing operations.`;
    }

    let firstOrderMilitaryImpact = 'Logistical buffers remain operational temporarily. ';
    if (actionType === 'INTERDICTION') {
      firstOrderMilitaryImpact = `High-altitude escort rules required. Navy surface groups in regional basins must switch to Active Defense postures to survive retaliatory strikes.`;
    } else if (affectedCommodityList.includes('rareearths') || affectedCommodityList.includes('strategic')) {
      firstOrderMilitaryImpact = `Aero-defense replacement inventories are constrained. Precision guidance missile replacement schedules fall back by 12 months.`;
    } else if (affectedCommodityList.includes('semiconductors')) {
      firstOrderMilitaryImpact = `Drone assembly plants or high-technology target-acquisition systems experience integrated circuit bottlenecks within 30 days.`;
    }

    const firstAlly = Array.from(affectedAlliesSet)[0];
    const diploFallout: 'LOW' | 'MEDIUM' | 'HIGH' = 
      actionType === 'INTERDICTION' ? 'HIGH' :
      firstAlly ? 'MEDIUM' : 'LOW';

    return {
      actionType,
      actorCountryId: actor,
      targetCountryId: target,
      affectedCommodities: affectedCommodityList,
      disruptionSeverity: Math.min(100, Math.max(0, adjustedSeverity)),
      firstOrderEconomicImpact,
      firstOrderMilitaryImpact,
      diplomaticFalloutRisk: diploFallout,
      affectedAllies: Array.from(affectedAlliesSet),
      expectRerouting: fallbackRerouting,
      reroutingDelayTicks: fallbackRerouting ? (actionType === 'SANCTION' ? 4 : 8) : 0,
      confidenceLabel: confidence
    };
  },

  executeCoerciveAction: (actionType, actor, target, commodities) => {
    set(produce((draft: FoundryState) => {
      const currentTick = useWorldStore.getState().currentTick;
      const targetFlows = draft.flows.filter(
        f => (f.sourceCountryId === target || f.destinationCountryId === target) &&
             (commodities.length === 0 || commodities.includes(f.commodityType))
      );

      // 1. Change target flow statuses to BLOCKED or STRESSED depending on action
      const newStatus: RouteStatus = 
        actionType === 'EMBARGO' ? 'BLOCKED' :
        actionType === 'INTERDICTION' ? 'BLOCKED' :
        'STRESSED';

      targetFlows.forEach(f => {
        const index = draft.flows.findIndex(o => o.id === f.id);
        if (index !== -1) {
          draft.flows[index].routeStatus = newStatus;
          draft.flows[index].lastChangedTick = currentTick;
          
          draft.changeLog.unshift({
            tick: currentTick,
            entityId: f.id,
            type: 'ROUTE',
            summary: `COERCIVE FORCE [${actionType}] applied by ${actor} on ${target}. Sector route status shifted to ${newStatus}.`
          });
        }
      });

      // 2. Adjust controlling chokepoints exposure scores based on local tension/blockade
      draft.chokepoints.forEach(choke => {
        if (choke.controllingCountryIds.includes(target) || choke.controllingCountryIds.includes(actor)) {
          choke.exposureScore = Math.min(100, choke.exposureScore + 25);
          if (choke.currentDisruptionStatus === 'SECURE') {
            choke.currentDisruptionStatus = 'CONGESTED';
          }
        }
      });

      // 3. Emit matching Disruption Signals
      const preview = get().calculatePreActionImpact(actionType, actor, target, commodities);
      
      preview.affectedCommodities.forEach(com => {
        let signalType: DisruptionSignal['type'] = 'COMMODITY_SHORTAGE_RISK_RISING';
        if (com === 'oil' || com === 'gas') signalType = 'ENERGY_FLOW_IMPAIRED';
        else if (com === 'food') signalType = 'FOOD_IMPORT_VULNERABILITY_SPIKE';
        else if (com === 'semiconductors') signalType = 'SEMICONDUCTOR_CHAIN_STRAIN';
        else if (com === 'rareearths' || com === 'strategic') signalType = 'STRATEGIC_MATERIAL_BOTTLENECK';

        const newSignal: DisruptionSignal = {
          id: `disrupt-${com}-${target}-${currentTick}`,
          type: signalType,
          countryId: target,
          commodityType: com,
          severity: preview.disruptionSeverity,
          durationTicks: actionType === 'SANCTION' ? 12 : 24,
          sourceId: targetFlows[0]?.id || 'direct-interdiction',
          description: `Strategic flow of ${com} restricted because of ${actionType} coercion by ${actor}. Volume is impaired.`,
          affectedSystems: ['GDP_OUTPUT', 'POPULAR_STABILITY', 'MILITARY_READINESS']
        };

        draft.disruptionSignals.unshift(newSignal);
      });

      // Recalculate country dependency records
      draft.dependencies.forEach(dep => {
        if (dep.countryId === target && commodities.includes(dep.commodityType)) {
          dep.resilienceRating = Math.max(10, dep.resilienceRating - 15);
          dep.chokepointExposureScore = Math.min(100, dep.chokepointExposureScore + 20);
        }
      });
    }));

    // Trigger audible click feedback and add intelligence item into Arachne
    try {
      const preview = get().calculatePreActionImpact(actionType, actor, target, commodities);
      const currentTick = useWorldStore.getState().currentTick;
      
      preview.affectedCommodities.forEach(com => {
        useWorldStore.setState(produce((worldDraft) => {
          const busEvt = createBusEvent({
            type: 'ENERGY_SUPPLY_DISRUPTED', // Map to matching category in eventBus types.ts
            category: 'ECONOMIC',
            sourceSystem: actor,
            sourceEntityType: 'COUNTRY',
            sourceEntityId: actor,
            targetEntityType: 'COUNTRY',
            targetEntityIds: [target],
            tick: currentTick,
            severity: preview.disruptionSeverity > 70 ? 'CRITICAL' : 'WARNING',
            title: `COMMODITY INTERDICTION: ${actor} triggers ${actionType} on ${com} supplies`,
            summary: `The logistical corridor supplying ${com} to ${target} is heavily compromised. Coercive interdiction rating is projected at ${preview.disruptionSeverity}% priority. Affected regional nodes: ${preview.affectedAllies.join(', ') || 'None'}.`
          });
          queueBusEvent(worldDraft.world, busEvt);
        }));
      });

      useArachneStore.getState().addLiveIntelItem({
        title: `LOGISTICAL INTERDICTION WARNING: BLOCKADE TRIGGERED`,
        summary: `Coercive embargo guidelines deployed by ${actor} targeting ${target} commodity lanes.`,
        themeTags: ['SANCTIONS'],
        urgency: 'HIGH',
        confidence: 'TOTAL',
        alertScore: 78,
        briefingCategory: 'ACTIVE_WATCH'
      });
    } catch(err) {
      console.warn('[FOUNDRY] Failed to add live intel/events:', err);
    }
  },

  toggleChokepointStatus: (chokepointId) => {
    set(produce((draft: FoundryState) => {
      const choke = draft.chokepoints.find(c => c.id === chokepointId);
      if (choke) {
        const nextStatus: ChokepointStatus = 
          choke.currentDisruptionStatus === 'SECURE' ? 'CONGESTED' :
          choke.currentDisruptionStatus === 'CONGESTED' ? 'BLOCKED' :
          'SECURE';
        choke.currentDisruptionStatus = nextStatus;
        
        const tick = useWorldStore.getState().currentTick;
        draft.changeLog.unshift({
          tick,
          entityId: chokepointId,
          type: 'CHOKEPOINT',
          summary: `${choke.name} operational status updated to ${nextStatus}. Impacting linked transit lanes.`
        });

        // Loop through flows and mark them stressed or rerouted if they cross this chokepoint
        draft.flows.forEach(flow => {
          if (flow.transitChokepointIds.includes(chokepointId)) {
            if (nextStatus === 'BLOCKED') {
              flow.routeStatus = flow.substitutability > 50 ? 'REROUTED' : 'BLOCKED';
            } else if (nextStatus === 'CONGESTED') {
              flow.routeStatus = 'STRESSED';
            } else {
              flow.routeStatus = 'STABLE';
            }
            flow.lastChangedTick = tick;
          }
        });
      }
    }));
  },

  tickFoundry: (currentTick) => {
    set(produce((draft: FoundryState) => {
      // 1. Decay duration of disruption signals
      draft.disruptionSignals.forEach((sig, idx) => {
        sig.durationTicks--;
      });

      // Remove signals that have fully dried out
      draft.disruptionSignals = draft.disruptionSignals.filter(sig => sig.durationTicks > 0);

      // Periodically trigger ambient log warnings (e.g., random cargo vessel stress or canal regulatory strain)
      if (currentTick % 5 === 0) {
        // Find a random secure and non-blocked chokepoint to add slight congestion stress
        const activeChokes = draft.chokepoints.filter(c => c.currentDisruptionStatus === 'SECURE');
        if (activeChokes.length > 0) {
          const targetChoke = activeChokes[Math.floor(Math.random() * activeChokes.length)];
          if (Math.random() > 0.5) {
            targetChoke.currentDisruptionStatus = 'CONGESTED';
            draft.changeLog.unshift({
              tick: currentTick,
              entityId: targetChoke.id,
              type: 'CHOKEPOINT',
              summary: `${targetChoke.name} reports temporary maritime congestion. Vessel queue depth expanded.`
            });
          }
        }
      }
    }));
  }
}));
