import { create } from 'zustand';
import { produce } from 'immer';
import { 
  OrderOfBattleUnit, 
  CampaignPlan, 
  SustainmentState, 
  SupplyRoute, 
  LogisticsNode, 
  RegionTerrainProfile, 
  RegionWeatherState, 
  CombatEngagement,
  CampaignStatus,
  ConventionalUnitStatus,
  EngagementOutcome,
  CampaignOutcome,
  CourseOfAction,
  CasualtyEstimate,
  TerrainType,
  UrbanDensity,
  WeatherCondition,
  GroundCondition,
  Season,
  UnitFamily,
  UnitDomain,
  SupportingFiresConfig,
  LogisticsConfig,
  RiskTolerance,
  CampaignObjective
} from '../types';
import { useWorldStore } from './worldStore';
import { useA2ADStore } from './a2adStore';
import { useEWStore } from './ewStore';
import { usePlayerStore } from './playerStore';
import { useLeaderMemoryStore } from './leaderMemoryStore';
import { useSigintStore } from './sigintStore';
import { useDeceptionStore } from './deceptionStore';
import { useDefconStore } from './defconStore';

interface ConventionalOpsState {
  units: OrderOfBattleUnit[];
  campaignPlans: CampaignPlan[];
  sustainment: Record<string, SustainmentState>;
  supplyRoutes: SupplyRoute[];
  logisticsNodes: LogisticsNode[];
  terrainProfiles: Record<string, RegionTerrainProfile>;
  weatherStates: Record<string, RegionWeatherState>;
  combatEngagements: CombatEngagement[];
  selectedUnitId: string | null;
  selectedCampaignId: string | null;
  isWargaming: boolean;
}

interface ConventionalOpsActions {
  addCampaignPlan: (plan: CampaignPlan) => void;
  updateCampaignPlan: (id: string, updater: (plan: CampaignPlan) => void) => void;
  startCampaign: (id: string) => void;
  abortCampaign: (id: string) => void;
  addUnit: (unit: OrderOfBattleUnit) => void;
  updateUnit: (id: string, updater: (unit: OrderOfBattleUnit) => void) => void;
  reconstituteUnit: (id: string) => void;
  assignUnitToObjective: (unitId: string, campaignId: string, objectiveId: string) => void;
  tickConventionalOps: (currentTick: number) => void;
  calculateTerrainPenalty: (unit: OrderOfBattleUnit, terrain: RegionTerrainProfile) => number;
  calculateWeatherPenalty: (unit: OrderOfBattleUnit, weather: RegionWeatherState) => number;
  runWargameCOASimulation: (campaignId: string, coa: Omit<CourseOfAction, 'id'>) => CourseOfAction;
  resolveEngagement: (engagement: CombatEngagement) => void;
  addLogisticsNode: (node: LogisticsNode) => void;
  updateLogisticsNode: (id: string, updater: (node: LogisticsNode) => void) => void;
  addSupplyRoute: (route: SupplyRoute) => void;
  updateSupplyRoute: (id: string, updater: (route: SupplyRoute) => void) => void;
  restockStockpile: (countryId: string, fuel: number, ammo: number, spares: number) => void;
  resetConventionalStore: () => void;
}

const DEFAULT_TERRAINS: Record<string, RegionTerrainProfile> = {
  US: { regionId: 'US', primaryTerrain: 'OPEN', secondaryTerrain: 'ROLLING', urbanDensity: 'URBAN', passability: 0.95, concealmentLevel: 0.2, defensibleTerrain: false, keyTerrainFeatures: ['AIRFIELD', 'PORT', 'INDUSTRIAL_COMPLEX'], hasMountainPasses: false, hasChokePoints: false, coastlineLength: 19924, majorRivers: 3 },
  CN: { regionId: 'CN', primaryTerrain: 'ROLLING', secondaryTerrain: 'MOUNTAIN', urbanDensity: 'URBAN', passability: 0.82, concealmentLevel: 0.4, defensibleTerrain: true, keyTerrainFeatures: ['COMMAND_BUNKER', 'RAILHEAD', 'PORT'], hasMountainPasses: true, hasChokePoints: true, coastlineLength: 14500, majorRivers: 2 },
  RU: { regionId: 'RU', primaryTerrain: 'WOODED', secondaryTerrain: 'ARCTIC', urbanDensity: 'SUBURBAN', passability: 0.68, concealmentLevel: 0.6, defensibleTerrain: true, keyTerrainFeatures: ['RAILHEAD', 'COMMAND_BUNKER', 'INDUSTRIAL_COMPLEX'], hasMountainPasses: false, hasChokePoints: false, coastlineLength: 37653, majorRivers: 4 },
  IR: { regionId: 'IR', primaryTerrain: 'DESERT', secondaryTerrain: 'MOUNTAIN', urbanDensity: 'URBAN', passability: 0.75, concealmentLevel: 0.5, defensibleTerrain: true, keyTerrainFeatures: ['COMMAND_BUNKER', 'CHOKE_POINT'], hasMountainPasses: true, hasChokePoints: true, coastlineLength: 2440, majorRivers: 1 },
  TW: { regionId: 'TW', primaryTerrain: 'COASTAL', secondaryTerrain: 'MOUNTAIN', urbanDensity: 'URBAN', passability: 0.60, concealmentLevel: 0.5, defensibleTerrain: true, keyTerrainFeatures: ['FORTIFIED_POSITION', 'PORT', 'AIRFIELD', 'CHOKE_POINT'], hasMountainPasses: true, hasChokePoints: true, coastlineLength: 1566, majorRivers: 1 },
  JP: { regionId: 'JP', primaryTerrain: 'ISLAND', secondaryTerrain: 'MOUNTAIN', urbanDensity: 'MEGACITY', passability: 0.70, concealmentLevel: 0.4, defensibleTerrain: true, keyTerrainFeatures: ['PORT', 'AIRFIELD', 'COMMAND_BUNKER'], hasMountainPasses: true, hasChokePoints: true, coastlineLength: 29751, majorRivers: 0 },
  IL: { regionId: 'IL', primaryTerrain: 'DESERT', secondaryTerrain: 'ROLLING', urbanDensity: 'URBAN', passability: 0.85, concealmentLevel: 0.3, defensibleTerrain: true, keyTerrainFeatures: ['FORTIFIED_POSITION', 'COMMAND_BUNKER', 'AIRFIELD'], hasMountainPasses: false, hasChokePoints: true, coastlineLength: 273, majorRivers: 1 },
  PS: { regionId: 'PS', primaryTerrain: 'ROLLING', secondaryTerrain: null, urbanDensity: 'URBAN', passability: 0.70, concealmentLevel: 0.6, defensibleTerrain: false, keyTerrainFeatures: ['TUNNEL_NETWORK' as any], hasMountainPasses: false, hasChokePoints: false, coastlineLength: 40, majorRivers: 0 },
  GB: { regionId: 'GB', primaryTerrain: 'ROLLING', secondaryTerrain: 'COASTAL', urbanDensity: 'URBAN', passability: 0.90, concealmentLevel: 0.3, defensibleTerrain: false, keyTerrainFeatures: ['PORT', 'AIRFIELD'], hasMountainPasses: false, hasChokePoints: true, coastlineLength: 12429, majorRivers: 2 }
};

const DEFAULT_WEATHER: Record<string, RegionWeatherState> = {
  US: { regionId: 'US', season: 'SUMMER', currentCondition: 'CLEAR', visibility: 1.0, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 12, temperature: 26, movementMultiplier: 1.0, firesAccuracy: 1.0, ewEffectiveness: 1.0, isrPenetration: 1.0, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  CN: { regionId: 'CN', season: 'SUMMER', currentCondition: 'OVERCAST', visibility: 0.9, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 15, temperature: 28, movementMultiplier: 0.95, firesAccuracy: 0.95, ewEffectiveness: 1.0, isrPenetration: 0.9, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  RU: { regionId: 'RU', season: 'AUTUMN', currentCondition: 'RAIN', visibility: 0.7, precipitationType: 'RAIN', precipitationIntensity: 0.4, groundCondition: 'MUD', windSpeed: 25, temperature: 6, movementMultiplier: 0.7, firesAccuracy: 0.8, ewEffectiveness: 0.9, isrPenetration: 0.75, mudSeason: true, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  IR: { regionId: 'IR', season: 'SUMMER', currentCondition: 'CLEAR', visibility: 0.98, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 20, temperature: 38, movementMultiplier: 0.98, firesAccuracy: 1.0, ewEffectiveness: 0.95, isrPenetration: 1.0, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  TW: { regionId: 'TW', season: 'SUMMER', currentCondition: 'FOG', visibility: 0.5, precipitationType: null, precipitationIntensity: 0, groundCondition: 'SOFT', windSpeed: 10, temperature: 30, movementMultiplier: 0.8, firesAccuracy: 0.85, ewEffectiveness: 0.9, isrPenetration: 0.6, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  JP: { regionId: 'JP', season: 'SUMMER', currentCondition: 'CLEAR', visibility: 1.0, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 10, temperature: 25, movementMultiplier: 1.0, firesAccuracy: 1.0, ewEffectiveness: 1.0, isrPenetration: 1.0, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  IL: { regionId: 'IL', season: 'SUMMER', currentCondition: 'CLEAR', visibility: 1.0, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 15, temperature: 34, movementMultiplier: 1.0, firesAccuracy: 1.0, ewEffectiveness: 1.0, isrPenetration: 1.0, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  PS: { regionId: 'PS', season: 'SUMMER', currentCondition: 'CLEAR', visibility: 1.0, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 12, temperature: 32, movementMultiplier: 1.0, firesAccuracy: 1.0, ewEffectiveness: 1.0, isrPenetration: 1.0, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 },
  GB: { regionId: 'GB', season: 'AUTUMN', currentCondition: 'OVERCAST', visibility: 0.85, precipitationType: null, precipitationIntensity: 0, groundCondition: 'FIRM', windSpeed: 18, temperature: 14, movementMultiplier: 0.95, firesAccuracy: 0.95, ewEffectiveness: 1.0, isrPenetration: 0.8, mudSeason: false, snowCover: false, stormSurge: false, lastUpdatedTick: 0 }
};

const INITIAL_UNITS: OrderOfBattleUnit[] = [
  // USA Units
  {
    id: 'US-UNIT-01',
    countryId: 'US',
    family: 'ARMORED_BRIGADE',
    domain: 'LAND',
    designation: '1st Armored Division Combat Group',
    attributes: { firepower: 85, maneuver: 75, protection: 80, sustainmentDemand: 30, readiness: 95, mobility: 'TRACKED', signature: 70, electronicWarfare: 45, airDefense: 55, intelligenceContribution: 20, specialCapabilities: ['CBRN', 'COUNTER_IED'] },
    currentRegion: 'US',
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
    notes: 'US Heavy armors spearheads. Full operational state.'
  },
  {
    id: 'US-UNIT-02',
    countryId: 'US',
    family: 'AIRBORNE',
    domain: 'LAND',
    designation: '82nd Airborne Division Brigade',
    attributes: { firepower: 65, maneuver: 90, protection: 50, sustainmentDemand: 20, readiness: 98, mobility: 'FOOT', signature: 40, electronicWarfare: 50, airDefense: 45, intelligenceContribution: 30, specialCapabilities: ['AIRBORNE_ASSAULT', 'URBAN_WARFARE'] },
    currentRegion: 'US',
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
    sigintExposure: 0.05,
    deceptionCover: false,
    notes: 'Rapid entry airborne element. Exceptionally high troop morale.'
  },
  {
    id: 'US-UNIT-03',
    countryId: 'US',
    family: 'CARRIER_STRIKE_GROUP',
    domain: 'MARITIME',
    designation: 'Carrier Strike Group 5 (USS Ronald Reagan)',
    attributes: { firepower: 95, maneuver: 65, protection: 90, sustainmentDemand: 50, readiness: 96, mobility: 'NAVAL_SURFACE', signature: 85, electronicWarfare: 80, airDefense: 95, intelligenceContribution: 75, specialCapabilities: ['DEEP_STRIKE', 'SEAD', 'ELECTRONIC_ATTACK'] },
    currentRegion: 'TW',
    assignedObjectiveId: null,
    assignedCampaignId: null,
    currentStatus: 'DEPLOYED',
    attritionLevel: 0,
    supplyLevel: 1.0,
    maintenanceDebt: 0,
    lastEngagedTick: 0,
    isReserve: false,
    isDeployed: true,
    terrainPenalty: 0,
    weatherPenalty: 0,
    sigintExposure: 0.15,
    deceptionCover: false,
    notes: 'Forward deployed in East Asia waters to project massive sovereign power.'
  },
  {
    id: 'US-UNIT-04',
    countryId: 'US',
    family: 'TACTICAL_FIGHTER_WING',
    domain: 'AIR',
    designation: '35th Fighter Wing (Misawa AB)',
    attributes: { firepower: 80, maneuver: 95, protection: 65, sustainmentDemand: 40, readiness: 92, mobility: 'FIXED_WING', signature: 30, electronicWarfare: 70, airDefense: 70, intelligenceContribution: 60, specialCapabilities: ['SEAD', 'ELECTRONIC_ATTACK'] },
    currentRegion: 'TW',
    assignedObjectiveId: null,
    assignedCampaignId: null,
    currentStatus: 'DEPLOYED',
    attritionLevel: 0,
    supplyLevel: 1.0,
    maintenanceDebt: 0,
    lastEngagedTick: 0,
    isReserve: false,
    isDeployed: true,
    terrainPenalty: 0,
    weatherPenalty: 0,
    sigintExposure: 0.08,
    deceptionCover: false,
    notes: 'F-16 Wild Weasels specialized in severe radar network neutralization.'
  },
  {
    id: 'US-UNIT-05',
    countryId: 'US',
    family: 'CYBER_COMMAND',
    domain: 'CYBER',
    designation: 'Cyber Mission Force - Team Alpha',
    attributes: { firepower: 70, maneuver: 100, protection: 95, sustainmentDemand: 5, readiness: 100, mobility: 'FIXED_WING', signature: 5, electronicWarfare: 90, airDefense: 20, intelligenceContribution: 95, specialCapabilities: ['CYBER_ATTACK'] },
    currentRegion: 'US',
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
    sigintExposure: 0.01,
    deceptionCover: false,
    notes: 'Digital infiltration task team targeting critical routing arrays.'
  },

  // Russian Units
  {
    id: 'RU-UNIT-01',
    countryId: 'RU',
    family: 'ARMORED_BRIGADE',
    domain: 'LAND',
    designation: '1st Guard Tank Army Brigade',
    attributes: { firepower: 88, maneuver: 70, protection: 85, sustainmentDemand: 35, readiness: 90, mobility: 'TRACKED', signature: 75, electronicWarfare: 40, airDefense: 60, intelligenceContribution: 15, specialCapabilities: ['CBRN'] },
    currentRegion: 'RU',
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
    sigintExposure: 0.12,
    deceptionCover: false,
    notes: 'Russian heavy shock assault armor groups.'
  },
  {
    id: 'RU-UNIT-02',
    countryId: 'RU',
    family: 'SUBMARINE_FORCE',
    domain: 'MARITIME',
    designation: 'Northern Fleet Attack Sub Group',
    attributes: { firepower: 85, maneuver: 80, protection: 75, sustainmentDemand: 25, readiness: 92, mobility: 'SUBSURFACE', signature: 15, electronicWarfare: 50, airDefense: 20, intelligenceContribution: 55, specialCapabilities: ['DEEP_STRIKE'] },
    currentRegion: 'RU',
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
    sigintExposure: 0.05,
    deceptionCover: false,
    notes: 'Silent subsurface asset equipped with long-range Kalibr cruise missiles.'
  },

  // Chinese Units
  {
    id: 'CN-UNIT-01',
    countryId: 'CN',
    family: 'ARMORED_BRIGADE',
    domain: 'LAND',
    designation: '73rd Group Army Armored Brigade',
    attributes: { firepower: 82, maneuver: 78, protection: 78, sustainmentDemand: 28, readiness: 94, mobility: 'TRACKED', signature: 68, electronicWarfare: 50, airDefense: 50, intelligenceContribution: 20, specialCapabilities: ['MOUNTAIN_WARFARE'] },
    currentRegion: 'CN',
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
    notes: 'Elite armor core situated directly across Taiwan Straits.'
  },
  {
    id: 'CN-UNIT-02',
    countryId: 'CN',
    family: 'AMPHIBIOUS_READINESS_GROUP',
    domain: 'MARITIME',
    designation: 'PLA amphibious Expeditionary Task Group',
    attributes: { firepower: 80, maneuver: 70, protection: 70, sustainmentDemand: 35, readiness: 95, mobility: 'AMPHIBIOUS', signature: 80, electronicWarfare: 60, airDefense: 75, intelligenceContribution: 45, specialCapabilities: ['AMPHIBIOUS_ASSAULT'] },
    currentRegion: 'TW',
    assignedObjectiveId: null,
    assignedCampaignId: null,
    currentStatus: 'DEPLOYED',
    attritionLevel: 0,
    supplyLevel: 1.0,
    maintenanceDebt: 0,
    lastEngagedTick: 0,
    isReserve: false,
    isDeployed: true,
    terrainPenalty: 0,
    weatherPenalty: 0,
    sigintExposure: 0.14,
    deceptionCover: false,
    notes: 'Optimized for high-risk seaside landing campaigns.'
  },

  // Iranian Units
  {
    id: 'IR-UNIT-01',
    countryId: 'IR',
    family: 'SPECIAL_FORCES',
    domain: 'SPECIAL_OPERATIONS',
    designation: 'IRGC Quds Commando Force',
    attributes: { firepower: 70, maneuver: 85, protection: 60, sustainmentDemand: 15, readiness: 95, mobility: 'WHEELED', signature: 10, electronicWarfare: 55, airDefense: 35, intelligenceContribution: 70, specialCapabilities: ['URBAN_WARFARE', 'PSYOP_CAPABILITY', 'DEEP_STRIKE'] },
    currentRegion: 'IR',
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
    sigintExposure: 0.03,
    deceptionCover: false,
    notes: 'Asymmetric specialists. Masters of proxy and logistics subversion.'
  }
];

const INITIAL_SUSTAINMENT = {
  US: { countryId: 'US', fuelStockpile: 8800, ammoStockpile: 6000, sparePartsStockpile: 4500, fuelConsumptionPerTick: 120, ammoConsumptionPerTick: 100, maintenanceCycleDebt: 0, supplyChainIntegrity: 0.98, daysOfSupplyRemaining: 60 },
  CN: { countryId: 'CN', fuelStockpile: 7200, ammoStockpile: 5000, sparePartsStockpile: 3800, fuelConsumptionPerTick: 110, ammoConsumptionPerTick: 90, maintenanceCycleDebt: 0, supplyChainIntegrity: 0.96, daysOfSupplyRemaining: 55 },
  RU: { countryId: 'RU', fuelStockpile: 5500, ammoStockpile: 4200, sparePartsStockpile: 2200, fuelConsumptionPerTick: 90, ammoConsumptionPerTick: 80, maintenanceCycleDebt: 2, supplyChainIntegrity: 0.85, daysOfSupplyRemaining: 40 },
  IR: { countryId: 'IR', fuelStockpile: 3200, ammoStockpile: 2500, sparePartsStockpile: 1200, fuelConsumptionPerTick: 50, ammoConsumptionPerTick: 40, maintenanceCycleDebt: 1, supplyChainIntegrity: 0.88, daysOfSupplyRemaining: 50 },
  TW: { countryId: 'TW', fuelStockpile: 1800, ammoStockpile: 1500, sparePartsStockpile: 1100, fuelConsumptionPerTick: 40, ammoConsumptionPerTick: 35, maintenanceCycleDebt: 0, supplyChainIntegrity: 0.92, daysOfSupplyRemaining: 45 },
  JP: { countryId: 'JP', fuelStockpile: 4100, ammoStockpile: 3000, sparePartsStockpile: 2500, fuelConsumptionPerTick: 60, ammoConsumptionPerTick: 50, maintenanceCycleDebt: 0, supplyChainIntegrity: 0.97, daysOfSupplyRemaining: 50 },
  IL: { countryId: 'IL', fuelStockpile: 2500, ammoStockpile: 2200, sparePartsStockpile: 1800, fuelConsumptionPerTick: 45, ammoConsumptionPerTick: 40, maintenanceCycleDebt: 0, supplyChainIntegrity: 0.99, daysOfSupplyRemaining: 52 }
};

export const useConventionalOpsStore = create<ConventionalOpsState & ConventionalOpsActions>((set, get) => ({
  units: INITIAL_UNITS,
  campaignPlans: [],
  sustainment: INITIAL_SUSTAINMENT,
  supplyRoutes: [
    { id: 'ROUTE-US-TW', name: 'US-Taiwan Sea Lane', fromRegionId: 'US', toRegionId: 'TW', type: 'sealane', capacityTons: 15000, currentThroughput: 8000, contestedLevel: 0.1, isActive: true, weatherDegradation: 0.05, terrainDegradation: 0.0, ewDegradation: 0.02, lastInterruptedTick: null },
    { id: 'ROUTE-CN-TW', name: 'Strait Landing Pipeline', fromRegionId: 'CN', toRegionId: 'TW', type: 'pipeline', capacityTons: 12000, currentThroughput: 4000, contestedLevel: 0.3, isActive: true, weatherDegradation: 0.0, terrainDegradation: 0.05, ewDegradation: 0.0, lastInterruptedTick: null }
  ],
  logisticsNodes: [
    { id: 'NODE-TW-PORT', regionId: 'TW', type: 'PORT', capacityTons: 8000, currentLoad: 4100, isContested: false, isDestroyed: false, repairProgress: 1.0 },
    { id: 'NODE-RU-RAIL', regionId: 'RU', type: 'RAILHEAD', capacityTons: 11000, currentLoad: 6800, isContested: false, isDestroyed: false, repairProgress: 1.0 }
  ],
  terrainProfiles: DEFAULT_TERRAINS,
  weatherStates: DEFAULT_WEATHER,
  combatEngagements: [],
  selectedUnitId: null,
  selectedCampaignId: null,
  isWargaming: false,

  addCampaignPlan: (plan) => set(produce((draft: ConventionalOpsState) => {
    draft.campaignPlans.push(plan);
  })),

  updateCampaignPlan: (id, updater) => set(produce((draft: ConventionalOpsState) => {
    const plan = draft.campaignPlans.find(p => p.id === id);
    if (plan) updater(plan);
  })),

  startCampaign: (id) => set(produce((draft: ConventionalOpsState) => {
    const plan = draft.campaignPlans.find(p => p.id === id);
    if (!plan) return;
    plan.status = 'EXECUTING';
    plan.launchedTick = useWorldStore.getState().currentTick;
    
    // Deploy all assigned units
    plan.assignedUnitIds.forEach((uid) => {
      const unit = draft.units.find(u => u.id === uid);
      if (unit) {
        unit.currentStatus = 'DEPLOYED';
        unit.assignedCampaignId = plan.id;
        unit.currentRegion = plan.objective.targetRegionId;
        unit.isDeployed = true;
      }
    });

    const plannerName = useWorldStore.getState().countries[plan.plannerCountryId]?.name || plan.plannerCountryId;
    useWorldStore.getState().addGlobalEvent(`MILITARY MOBILIZATION: ${plannerName} launched operation "${plan.name}" targeting ${plan.objective.targetRegionId}.`, 'WARNING');
  })),

  abortCampaign: (id) => set(produce((draft: ConventionalOpsState) => {
    const plan = draft.campaignPlans.find(p => p.id === id);
    if (!plan) return;
    plan.status = 'ABORTED';
    plan.completedTick = useWorldStore.getState().currentTick;
    plan.outcome = 'STALEMATE';

    // Disengage unit pointers
    plan.assignedUnitIds.forEach((uid) => {
      const unit = draft.units.find(u => u.id === uid);
      if (unit) {
        unit.currentStatus = 'READY';
        unit.assignedCampaignId = null;
        unit.assignedObjectiveId = null;
        unit.isDeployed = false;
      }
    });

    const plannerName = useWorldStore.getState().countries[plan.plannerCountryId]?.name || plan.plannerCountryId;
    useWorldStore.getState().addGlobalEvent(`TACTICAL ABORT: ${plannerName} cancelled military Campaign "${plan.name}". Forces returning to garrisons.`, 'INFO');
  })),

  addUnit: (unit) => set(produce((draft: ConventionalOpsState) => {
    draft.units.push(unit);
  })),

  updateUnit: (id, updater) => set(produce((draft: ConventionalOpsState) => {
    const unit = draft.units.find(u => u.id === id);
    if (unit) updater(unit);
  })),

  reconstituteUnit: (id) => set(produce((draft: ConventionalOpsState) => {
    const unit = draft.units.find(u => u.id === id);
    if (!unit) return;
    unit.attritionLevel = Math.max(0, unit.attritionLevel - 0.25);
    unit.supplyLevel = Math.min(1.0, unit.supplyLevel + 0.35);
    unit.currentStatus = 'RECONSTITUTING';
    unit.maintenanceDebt = Math.max(0, unit.maintenanceDebt - 1);
  })),

  assignUnitToObjective: (unitId, campaignId, objectiveId) => set(produce((draft: ConventionalOpsState) => {
    const unit = draft.units.find(u => u.id === unitId);
    if (unit) {
      unit.assignedCampaignId = campaignId;
      unit.assignedObjectiveId = objectiveId;
    }
    const plan = draft.campaignPlans.find(p => p.id === campaignId);
    if (plan && !plan.assignedUnitIds.includes(unitId)) {
      plan.assignedUnitIds.push(unitId);
    }
  })),

  calculateTerrainPenalty: (unit, terrain) => {
    // Terrain Passability Penalty calculation
    let mod = 1.0 - terrain.passability; // high passability = low penalty
    
    // Check specific terrain types matching unit mobility
    if (unit.attributes.mobility === 'TRACKED') {
      if (terrain.primaryTerrain === 'MOUNTAIN' || terrain.primaryTerrain === 'SWAMP') {
        mod += 0.3;
      }
    } else if (unit.attributes.mobility === 'WHEELED') {
      if (terrain.primaryTerrain === 'DESERT' || terrain.primaryTerrain === 'MOUNTAIN') {
        mod += 0.45;
      }
    } else if (unit.attributes.mobility === 'FOOT') {
      if (terrain.primaryTerrain === 'ARCTIC') {
        mod += 0.25;
      }
    }

    if (terrain.hasChokePoints) mod += 0.15;
    if (terrain.hasMountainPasses) mod += 0.1;
    return Math.min(0.8, Math.max(0, mod));
  },

  calculateWeatherPenalty: (unit, weather) => {
    let penalty = 0.0;
    if (weather.currentCondition === 'STORM' || weather.currentCondition === 'BLIZZARD') {
      penalty += 0.4;
    } else if (weather.currentCondition === 'FOG' || weather.currentCondition === 'RAIN') {
      penalty += 0.2;
    } else if (weather.currentCondition === 'SANDSTORM') {
      penalty += 0.35;
    }

    if (weather.groundCondition === 'MUD') {
      if (unit.attributes.mobility !== 'ROTARY' && unit.attributes.mobility !== 'FIXED_WING') {
        penalty += 0.25;
      }
    }

    // Air units extremely susceptible to ground visibility and storm systems
    if (unit.domain === 'AIR') {
      penalty *= 1.5;
    }

    return Math.min(0.85, penalty);
  },

  runWargameCOASimulation: (campaignId, coaIn) => {
    // Perform simulated trial combat calculations based on the COA
    const { units, terrainProfiles, weatherStates } = get();
    const campaign = get().campaignPlans.find(c => c.id === campaignId);
    const targetRegionId = campaign?.objective.targetRegionId || 'TW';
    
    const terrain = terrainProfiles[targetRegionId] || DEFAULT_TERRAINS['TW'];
    const weather = weatherStates[targetRegionId] || DEFAULT_WEATHER['TW'];

    let totalFirepower = 0;
    let averageSurvival = 0.7;

    coaIn.assignedUnits.forEach((uid) => {
      const u = units.find(unit => unit.id === uid);
      if (u) {
        let fp = u.attributes.firepower * (1.0 - u.attritionLevel);
        const tPenalty = get().calculateTerrainPenalty(u, terrain);
        const wPenalty = get().calculateWeatherPenalty(u, weather);
        fp *= (1.0 - tPenalty) * (1.0 - wPenalty);
        totalFirepower += fp;
      }
    });

    // Determine projected casualties and logistics feasibility
    const isHighRisk = coaIn.strategicRisk > 0.6 || coaIn.escalationRisk > 0.6;
    const computedSuccessProbability = Math.min(0.95, Math.max(0.15, (totalFirepower / 280) + (isHighRisk ? -0.15 : 0.05)));
    
    const isSeized = computedSuccessProbability > 0.65;
    
    const ownForcesModerate = Math.round((1.0 - computedSuccessProbability) * 1230 + 100);
    const ownForcesLight = Math.round(ownForcesModerate * 0.4);
    const ownForcesHeavy = Math.round(ownForcesModerate * 1.8);
    
    const coa: CourseOfAction = {
      ...coaIn,
      id: `COA-${Math.floor(Math.random() * 10000)}`,
      successProbability: computedSuccessProbability,
      logisticsFeasibility: Math.min(0.95, Math.max(0.2, 1.0 - (coaIn.assignedUnits.length * 0.15))),
      casualtyEstimate: {
        ownForcesLight,
        ownForcesModerate,
        ownForcesHeavy,
        enemyForces: Math.round(computedSuccessProbability * 1800),
        civilianEstimate: Math.round(totalFirepower * (terrain.urbanDensity === 'URBAN' ? 25 : 5)),
        equipmentLoss: Math.round(40 * (1 - computedSuccessProbability))
      }
    };
    return coa;
  },

  resolveEngagement: (eng) => set(produce((draft: ConventionalOpsState) => {
    draft.combatEngagements.push(eng);

    // Apply casualties attrition to active units directly
    eng.attackerUnitIds.forEach((uid) => {
      const unit = draft.units.find(u => u.id === uid);
      if (unit) {
        unit.attritionLevel = Math.min(1.0, unit.attritionLevel + eng.attackerAttrition);
        unit.supplyLevel = Math.max(0.0, unit.supplyLevel - 0.2);
        unit.lastEngagedTick = eng.tick;
        if (unit.attritionLevel >= 0.95) {
          unit.currentStatus = 'DESTROYED';
        } else {
          unit.currentStatus = 'ENGAGED';
        }
      }
    });

    eng.defenderUnitIds.forEach((uid) => {
      const unit = draft.units.find(u => u.id === uid);
      if (unit) {
        unit.attritionLevel = Math.min(1.0, unit.attritionLevel + eng.defenderAttrition);
        unit.supplyLevel = Math.max(0.0, unit.supplyLevel - 0.15);
        unit.lastEngagedTick = eng.tick;
        if (unit.attritionLevel >= 0.95) {
          unit.currentStatus = 'DESTROYED';
        } else {
          unit.currentStatus = 'ENGAGED';
        }
      }
    });
  })),

  addLogisticsNode: (node) => set(produce((draft: ConventionalOpsState) => {
    draft.logisticsNodes.push(node);
  })),

  updateLogisticsNode: (id, updater) => set(produce((draft: ConventionalOpsState) => {
    const node = draft.logisticsNodes.find(n => n.id === id);
    if (node) updater(node);
  })),

  addSupplyRoute: (route) => set(produce((draft: ConventionalOpsState) => {
    draft.supplyRoutes.push(route);
  })),

  updateSupplyRoute: (id, updater) => set(produce((draft: ConventionalOpsState) => {
    const route = draft.supplyRoutes.find(r => r.id === id);
    if (route) updater(route);
  })),

  restockStockpile: (countryId, fuel, ammo, spares) => set(produce((draft: ConventionalOpsState) => {
    const s = draft.sustainment[countryId];
    if (s) {
      s.fuelStockpile += fuel;
      s.ammoStockpile += ammo;
      s.sparePartsStockpile += spares;
      s.daysOfSupplyRemaining = Math.round((s.fuelStockpile + s.ammoStockpile) / (s.fuelConsumptionPerTick + s.ammoConsumptionPerTick + 1));
    }
  })),

  tickConventionalOps: (currentTick) => set(produce((draft: ConventionalOpsState) => {
    // 1. Process Weather drifts slowly over seasons
    Object.keys(draft.weatherStates).forEach((regionId) => {
      const rWeather = draft.weatherStates[regionId];
      if (!rWeather) return;
      rWeather.lastUpdatedTick = currentTick;

      // Random weather fluctuations
      const rand = Math.random();
      if (rand < 0.12) {
        const conds: WeatherCondition[] = ['CLEAR', 'OVERCAST', 'RAIN', 'STORM', 'FOG'];
        rWeather.currentCondition = conds[Math.floor(Math.random() * conds.length)];
        
        switch (rWeather.currentCondition) {
          case 'CLEAR':
            rWeather.visibility = 1.0;
            rWeather.precipitationType = null;
            rWeather.precipitationIntensity = 0;
            rWeather.groundCondition = 'FIRM';
            break;
          case 'OVERCAST':
            rWeather.visibility = 0.85;
            rWeather.precipitationType = null;
            rWeather.precipitationIntensity = 0;
            break;
          case 'RAIN':
            rWeather.visibility = 0.7;
            rWeather.precipitationType = 'RAIN';
            rWeather.precipitationIntensity = 0.2 + Math.random() * 0.4;
            rWeather.groundCondition = 'SOFT';
            break;
          case 'STORM':
            rWeather.visibility = 0.4;
            rWeather.precipitationType = 'RAIN';
            rWeather.precipitationIntensity = 0.7 + Math.random() * 0.3;
            rWeather.groundCondition = 'MUD';
            break;
          case 'FOG':
            rWeather.visibility = 0.3;
            rWeather.precipitationType = null;
            rWeather.precipitationIntensity = 0;
            break;
        }
      }
    });

    // 2. Compute logistics flow and sustainment consumption
    Object.keys(draft.sustainment).forEach((countryId) => {
      const sustain = draft.sustainment[countryId];
      if (!sustain) return;

      // Compute live consumption
      let activeFuelUsed = 0;
      let activeAmmoUsed = 0;

      draft.units.forEach((u) => {
        if (u.countryId === countryId && u.isDeployed && u.currentStatus !== 'DESTROYED') {
          activeFuelUsed += u.attributes.sustainmentDemand * 0.6;
          activeAmmoUsed += u.attributes.sustainmentDemand * 0.4;
        }
      });

      sustain.fuelConsumptionPerTick = sustain.fuelConsumptionPerTick * 0.8 + activeFuelUsed * 0.2;
      sustain.ammoConsumptionPerTick = sustain.ammoConsumptionPerTick * 0.8 + activeAmmoUsed * 0.2;

      // Deduct from national stockpile
      sustain.fuelStockpile = Math.max(0, sustain.fuelStockpile - sustain.fuelConsumptionPerTick);
      sustain.ammoStockpile = Math.max(0, sustain.ammoStockpile - sustain.ammoConsumptionPerTick);
      
      // Gradually heal maintenance cycle debt
      if (sustain.maintenanceCycleDebt > 0 && sustain.sparePartsStockpile > 100) {
        sustain.sparePartsStockpile -= 80;
        sustain.maintenanceCycleDebt = Math.max(0, sustain.maintenanceCycleDebt - 0.2);
      }

      sustain.daysOfSupplyRemaining = Math.max(
        0, 
        Math.round((sustain.fuelStockpile + sustain.ammoStockpile) / (sustain.fuelConsumptionPerTick + sustain.ammoConsumptionPerTick + 15))
      );

      // Low supply penalty application on associated units
      if (sustain.daysOfSupplyRemaining < 5) {
        draft.units.forEach((u) => {
          if (u.countryId === countryId && u.currentStatus !== 'DESTROYED') {
            u.supplyLevel = Math.max(0.1, u.supplyLevel - 0.15);
            u.attributes.readiness = Math.max(30, u.attributes.readiness - 10);
            u.currentStatus = 'DEGRADED';
          }
        });
      }
    });

    // 3. SEC 4.1: Compute tactical SIGINT overlap exposure
    const sigintStore = useSigintStore.getState();
    const deceptionStore = useDeceptionStore.getState();

    draft.units.forEach((unit) => {
      if (unit.currentStatus === 'DESTROYED') return;

      // SIGINT Overlays checks
      const activeCampaignsList = Object.values(sigintStore.campaigns || {});
      const hasSigintOverlay = activeCampaignsList.some(c => c.targetId === unit.currentRegion && c.status === 'ACTIVE');
      if (hasSigintOverlay) {
        unit.sigintExposure = Math.min(1.0, unit.sigintExposure + 0.15);
      } else {
        unit.sigintExposure = Math.max(0.02, unit.sigintExposure - 0.05);
      }

      // Check deception cover
      const activeDeceptionsList = Object.values(deceptionStore.campaigns || {});
      const hasDeception = activeDeceptionsList.some(d => d.active && d.linkedTargets.includes(unit.currentRegion));
      unit.deceptionCover = hasDeception;

      if (hasDeception) {
        unit.sigintExposure = Math.max(0.01, unit.sigintExposure - 0.3);
      }
    });

    // 4. SEC 4.2: Campaign Tick and Automatic Combat Engagements
    draft.campaignPlans.forEach((plan) => {
      if (plan.status !== 'EXECUTING') return;

      const targetRegionId = plan.objective.targetRegionId;
      const terrain = draft.terrainProfiles[targetRegionId] || DEFAULT_TERRAINS['TW'];
      const weather = draft.weatherStates[targetRegionId] || DEFAULT_WEATHER['TW'];

      // Gather deployed combat units in target region
      const allyUnitsInZone = draft.units.filter(u => u.assignedCampaignId === plan.id && u.currentStatus !== 'DESTROYED');
      
      // Hostile state is who owns or resides in targetRegionId
      const targetCountryId = targetRegionId; 
      const opponentUnitsInZone = draft.units.filter(u => u.countryId === targetCountryId && u.currentStatus !== 'DESTROYED');

      if (allyUnitsInZone.length > 0 && opponentUnitsInZone.length > 0) {
        // Run interactive engagement tick
        let allyFP = 0;
        let enemyFP = 0;
        const a2adState = useA2ADStore.getState();
        const ewState = useEWStore.getState();
        
        let allyEwPenalty = 0;
        let enemyEwPenalty = 0;
        
        const regionEwEffect = ewState.spectrumContention.find(e => e.regionId === targetRegionId && e.contentionLevel > 30);
        if (regionEwEffect) {
           if (regionEwEffect.dominantCountryId === targetCountryId) {
              allyEwPenalty = 0.25;
              if (regionEwEffect.effectsActive.includes('MISSILE_GUIDANCE_CORRUPTED')) allyEwPenalty = 0.40;
           } else {
              enemyEwPenalty = 0.25;
              if (regionEwEffect.effectsActive.includes('MISSILE_GUIDANCE_CORRUPTED')) enemyEwPenalty = 0.40;
           }
        }

        allyUnitsInZone.forEach((u) => {
          let fp = u.attributes.firepower * (1.0 - u.attritionLevel);
          const tPenalty = get().calculateTerrainPenalty(u, terrain);
          const wPenalty = get().calculateWeatherPenalty(u, weather);
          fp *= (1.0 - tPenalty) * (1.0 - wPenalty) * (1.0 - allyEwPenalty);

          // Apply A2AD Precision Munitions and C2 Degradation penalties
          const targetGpsZone = Object.values(a2adState.gpsDegradationZones).find(z => 
             // We estimate distance based on currentRegion vs zone center loosely. For now applying global degrading for simplicity if in zone or general penalty.
             true // just use the global degradation metrics generated by tickA2AD
          );
          fp *= (1.0 - a2adState.globalPrecisionMunitionsDegradation);
          fp *= (1.0 - a2adState.globalC2Degradation);

          // Support fires booster
          if (plan.supportingFiresConfig.airSupportEnabled) fp *= 1.15;
          if (plan.supportingFiresConfig.navalFiresEnabled) fp *= 1.10;
          if (plan.supportingFiresConfig.artilleryEnabled) fp *= 1.05;

          allyFP += fp;
        });

        opponentUnitsInZone.forEach((u) => {
          let fp = u.attributes.firepower * (1.0 - u.attritionLevel);
          const oppTerrain = draft.terrainProfiles[u.currentRegion] || terrain;
          const oppWeather = draft.weatherStates[u.currentRegion] || weather;
          const tPenalty = get().calculateTerrainPenalty(u, oppTerrain);
          const wPenalty = get().calculateWeatherPenalty(u, oppWeather);
          fp *= (1.0 - tPenalty) * (1.0 - wPenalty);
          fp *= (1.0 - a2adState.globalPrecisionMunitionsDegradation);
          fp *= (1.0 - a2adState.globalC2Degradation);
          
          enemyFP += fp;
        });

        // Compute casualties delta
        const defenderDmgMod = (allyFP / (enemyFP + 10)) * 0.05 + 0.02;
        const attackerDmgMod = (enemyFP / (allyFP + 10)) * 0.05 + 0.02;

        const isDecisive = allyFP > enemyFP * 1.5;
        const out: EngagementOutcome = isDecisive ? 'ATTACKER_ADVANCE' : (enemyFP > allyFP * 1.4 ? 'ATTACKER_REPELLED' : 'MUTUAL_ATTRITION');

        const newEng: CombatEngagement = {
          id: `ENG-${currentTick}-${Math.floor(Math.random() * 1000)}`,
          attackerUnitIds: allyUnitsInZone.map(u => u.id),
          defenderUnitIds: opponentUnitsInZone.map(u => u.id),
          regionId: targetRegionId,
          tick: currentTick,
          attackerFirepower: Math.round(allyFP),
          defenderFirepower: Math.round(enemyFP),
          terrainModifier: terrain.passability,
          weatherModifier: weather.movementMultiplier,
          isrModifier: weather.visibility,
          attackerAttrition: Math.min(0.12, attackerDmgMod),
          defenderAttrition: Math.min(0.12, defenderDmgMod),
          outcome: out,
          supplyConsumed: allyUnitsInZone.length * 15,
          maintenanceIncurred: allyUnitsInZone.length * 1
        };

        draft.combatEngagements.push(newEng);

        // Apply casualties attrition to active units directly
        allyUnitsInZone.forEach((u) => {
          u.attritionLevel = Math.min(1.0, u.attritionLevel + newEng.attackerAttrition);
          u.supplyLevel = Math.max(0.1, u.supplyLevel - 0.12);
          u.lastEngagedTick = currentTick;
          u.currentStatus = 'ENGAGED';
        });

        opponentUnitsInZone.forEach((u) => {
          u.attritionLevel = Math.min(1.0, u.attritionLevel + newEng.defenderAttrition);
          u.supplyLevel = Math.max(0.1, u.supplyLevel - 0.1);
          u.lastEngagedTick = currentTick;
          u.currentStatus = 'ENGAGED';
        });

        // Trigger leader cognitive warnings or grievances
        const plannerMemoryStore = useLeaderMemoryStore.getState();
        if (targetRegionId !== plan.plannerCountryId) {
          plannerMemoryStore.addMemory({
            nationId: targetRegionId,
            tick: currentTick,
            type: 'STRIKE',
            description: `Sovereign integrity breached by conventional joint forces from ${plan.plannerCountryId}.`,
            playerInitiated: plan.plannerCountryId === 'US',
            emotionalImpact: { fear: 20, anger: 35 },
            resentmentDelta: 40,
            trustDelta: -30
          });
        }

        // T7.1: Nuclear Escalation Check under high conventional fatigue
        const totalAttritionAlly = allyUnitsInZone.reduce((sum, u) => sum + u.attritionLevel, 0) / allyUnitsInZone.length;
        const totalAttritionEnemy = opponentUnitsInZone.reduce((sum, u) => sum + u.attritionLevel, 0) / opponentUnitsInZone.length;

        if (totalAttritionEnemy > 0.45 || totalAttritionAlly > 0.55) {
          // Check if nuclear escalation state gets activated inside defense/nuclear framework
          const nuclearStore = useWorldStore.getState();
          const currentDefcon = useDefconStore.getState().currentDefconLevel;
          if (currentDefcon > 2) {
            useDefconStore.getState().setDefconLevel(2, 'SYSTEM', 'Conventional combat casualties exceed escalation limits.', currentTick);
            nuclearStore.addGlobalEvent(`NUCLEAR WARNING: Conventional campaign causalities exceeded threshold. Nuclear posture raised to DEFCON 2.`, 'CRITICAL');
          }
        }

        // Advance phases
        const activePhase = plan.phases[plan.currentPhaseIndex];
        if (activePhase) {
          activePhase.duration--;
          if (activePhase.duration <= 0) {
            activePhase.isComplete = true;
            if (plan.currentPhaseIndex < plan.phases.length - 1) {
              plan.currentPhaseIndex++;
              useWorldStore.getState().addGlobalEvent(`MILITARY PROGRESS: Campaign "${plan.name}" entered Phase ${plan.currentPhaseIndex + 1}: ${plan.phases[plan.currentPhaseIndex].name}.`, 'INFO');
            } else {
              // Campaign complete
              plan.status = 'COMPLETED';
              plan.completedTick = currentTick;
              
              if (isDecisive) {
                plan.outcome = 'DECISIVE_VICTORY';
              } else {
                plan.outcome = 'OPERATIONAL_SUCCESS';
              }

              // Disengage unit pointers
              plan.assignedUnitIds.forEach((uid) => {
                const unit = draft.units.find(u => u.id === uid);
                if (unit) {
                  unit.currentStatus = 'READY';
                  unit.assignedCampaignId = null;
                  unit.assignedObjectiveId = null;
                  unit.isDeployed = false;
                }
              });

              useWorldStore.getState().addGlobalEvent(`CAMPAIGN RESOLVED: Operational task "${plan.name}" completed successfully. Objectives achieved.`, 'INFO');
            }
          }
        }
      } else {
        // No opponent forces, immediate passive seizure advance
        const activePhase = plan.phases[plan.currentPhaseIndex];
        if (activePhase) {
          activePhase.duration--;
          if (activePhase.duration <= 0) {
            activePhase.isComplete = true;
            if (plan.currentPhaseIndex < plan.phases.length - 1) {
              plan.currentPhaseIndex++;
            } else {
              plan.status = 'COMPLETED';
              plan.completedTick = currentTick;
              plan.outcome = 'DECISIVE_VICTORY';
              plan.assignedUnitIds.forEach((uid) => {
                const unit = draft.units.find(u => u.id === uid);
                if (unit) {
                  unit.currentStatus = 'READY';
                  unit.assignedCampaignId = null;
                  unit.assignedObjectiveId = null;
                  unit.isDeployed = false;
                }
              });
              useWorldStore.getState().addGlobalEvent(`CAMPAIGN SUCCESS: Territorial seizure "${plan.name}" completed without active resistance.`, 'INFO');
            }
          }
        }
      }
    });
  })),

  resetConventionalStore: () => set({
    units: INITIAL_UNITS,
    campaignPlans: [],
    sustainment: INITIAL_SUSTAINMENT,
    supplyRoutes: [
      { id: 'ROUTE-US-TW', name: 'US-Taiwan Sea Lane', fromRegionId: 'US', toRegionId: 'TW', type: 'sealane', capacityTons: 15000, currentThroughput: 8000, contestedLevel: 0.1, isActive: true, weatherDegradation: 0.05, terrainDegradation: 0.0, ewDegradation: 0.02, lastInterruptedTick: null },
      { id: 'ROUTE-CN-TW', name: 'Strait Landing Pipeline', fromRegionId: 'CN', toRegionId: 'TW', type: 'pipeline', capacityTons: 12000, currentThroughput: 4000, contestedLevel: 0.3, isActive: true, weatherDegradation: 0.0, terrainDegradation: 0.05, ewDegradation: 0.0, lastInterruptedTick: null }
    ],
    logisticsNodes: [
      { id: 'NODE-TW-PORT', regionId: 'TW', type: 'PORT', capacityTons: 8000, currentLoad: 4100, isContested: false, isDestroyed: false, repairProgress: 1.0 },
      { id: 'NODE-RU-RAIL', regionId: 'RU', type: 'RAILHEAD', capacityTons: 11000, currentLoad: 6800, isContested: false, isDestroyed: false, repairProgress: 1.0 }
    ],
    terrainProfiles: DEFAULT_TERRAINS,
    weatherStates: DEFAULT_WEATHER,
    combatEngagements: [],
    selectedUnitId: null,
    selectedCampaignId: null,
    isWargaming: false
  })
}));
