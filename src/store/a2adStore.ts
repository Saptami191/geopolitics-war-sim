import { create } from 'zustand';
import { 
  A2ADSystem, 
  A2ADSystemCategory, 
  A2ADSystemStatus,
  CarrierStrikeGroup, 
  CSGPosture,
  BomberForce, 
  RefuelCorridor,
  MilitarySatellite, 
  SatelliteOrbitType, 
  SatelliteFunction, 
  SatelliteStatus,
  GPSDegradationZone, 
  GPSDegradationType,
  ASATStrike, 
  ASATMethod,
  MaritimePatrolAircraft,
  ComputedA2ADZone,
  ComputedCoverageArc,
  SEADCampaign
} from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useDefconStore } from './defconStore';
import { useDeceptionStore } from './deceptionStore';
import { useSigintStore } from './sigintStore';
import { useLeaderMemoryStore } from './leaderMemoryStore';
import { useConventionalOpsStore } from './conventionalOpsStore';
import { useNuclearStore } from './nuclearStore';
import { useFogOfWarStore } from './fogOfWarStore';
import { useCinematicsStore } from './cinematicsStore';

// Spherical law of cosines for geographic distance in Km
export function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's dynamic radius
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export interface A2ADActions {
  // initializers
  seedAllData: () => void;
  seedA2ADSystems: (nationId: string) => void;
  seedSatelliteConstellation: (nationId: string) => void;
  seedCarrierStrikeGroups: () => void;
  seedBomberForces: () => void;

  // core calculations
  computeA2ADZones: () => void;
  computeCoverageArcs: () => void;
  updateCarrierReach: (csgId: string) => void;
  calculateBomberPenetration: (
    bomberForceId: string, 
    targetLat: number, 
    targetLng: number
  ) => { penetrationProbability: number; expectedAttrition: number };

  // operational handlers
  deployA2ADSystem: (params: Omit<A2ADSystem, 'id' | 'deployedAtTick' | 'lastAttritionTick' | 'attritionLevel' | 'isPlayerVisible'>) => string;
  moveA2ADSystem: (systemId: string, newLat: number, newLng: number) => void;
  upgradeA2ADSystem: (systemId: string, upgradeType: 'RADAR_UPGRADE' | 'HARDENING' | 'SALVO_EXPANSION') => void;
  launchSEADCampaign: (params: Omit<SEADCampaign, 'id' | 'status'>) => string;
  launchASATStrike: (params: Omit<ASATStrike, 'id' | 'outcome' | 'debrisFieldCreated'>) => string;
  deployGPSJammer: (params: Omit<GPSDegradationZone, 'id' | 'deployedAtTick'>) => string;
  deployGPSSpoofing: (params: Omit<GPSDegradationZone, 'id' | 'deployedAtTick'>) => string;
  orderCarrierPosture: (csgId: string, posture: CSGPosture) => void;
  orderCarrierMove: (csgId: string, newLat: number, newLng: number) => void;
  activateMaritimePatrol: (aircraftId: string, centerLat: number, centerLng: number) => void;

  // tickers
  tickA2AD: (currentTick: number) => void;
}

export interface A2ADStoreState {
  a2adSystems: Record<string, A2ADSystem>;
  carrierStrikeGroups: Record<string, CarrierStrikeGroup>;
  bomberForces: Record<string, BomberForce>;
  satellites: Record<string, MilitarySatellite>;
  gpsDegradationZones: Record<string, GPSDegradationZone>;
  asatStrikes: ASATStrike[];
  maritimePatrolAircraft: Record<string, MaritimePatrolAircraft>;

  activeA2ADZones: ComputedA2ADZone[];
  activeCoverageArcs: ComputedCoverageArc[];
  gpsAccuracyByRegion: Record<string, number>;

  globalPrecisionMunitionsDegradation: number;
  globalNavigationDegradation: number;
  globalC2Degradation: number;
  spaceDebrisRisk: number;

  pendingASATStrikes: ASATStrike[];
  seadCampaigns: SEADCampaign[];
  lastTickProcessed: number;
}

export type A2ADStore = A2ADStoreState & A2ADActions;

export const useA2ADStore = create<A2ADStore>((set, get) => ({
  a2adSystems: {},
  carrierStrikeGroups: {},
  bomberForces: {},
  satellites: {},
  gpsDegradationZones: {},
  asatStrikes: [],
  maritimePatrolAircraft: {},

  activeA2ADZones: [],
  activeCoverageArcs: [],
  gpsAccuracyByRegion: {},

  globalPrecisionMunitionsDegradation: 0.0,
  globalNavigationDegradation: 0.0,
  globalC2Degradation: 0.0,
  spaceDebrisRisk: 0.0,

  pendingASATStrikes: [],
  seadCampaigns: [],
  lastTickProcessed: 0,

  seedAllData: () => {
    get().seedA2ADSystems('CN');
    get().seedA2ADSystems('RU');
    get().seedA2ADSystems('US');
    get().seedSatelliteConstellation('US');
    get().seedSatelliteConstellation('CN');
    get().seedSatelliteConstellation('RU');
    get().seedCarrierStrikeGroups();
    get().seedBomberForces();

    // Initial layer pre-computation
    get().computeA2ADZones();
    get().computeCoverageArcs();
  },

  seedA2ADSystems: (nationId) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    let systems: A2ADSystem[] = [];

    if (nationId === 'CN') {
      systems = [
        {
          id: 'sam_cn_hq9_1',
          name: 'HQ-9B Battery Long - Fujian Coast',
          ownerNationId: 'CN',
          category: 'SAM_LONG',
          status: 'ACTIVE',
          lat: 25.8,
          lng: 119.5,
          engagementRadiusKm: 250,
          trackingRadiusKm: 400,
          interceptProbabilityBase: 0.75,
          salvoCapacity: 16,
          reloadTicksRequired: 3,
          mobilityScore: 0.8,
          electronicVulnerability: 0.35,
          deceptionResistance: 0.6,
          linkedRadarId: 'cn_radar_long',
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'TW' // Taiwan Strait core
        },
        {
          id: 'sam_cn_hq9_2',
          name: 'HQ-9B Battery Long - Guangdong South',
          ownerNationId: 'CN',
          category: 'SAM_LONG',
          status: 'ACTIVE',
          lat: 22.3,
          lng: 114.2,
          engagementRadiusKm: 250,
          trackingRadiusKm: 400,
          interceptProbabilityBase: 0.75,
          salvoCapacity: 16,
          reloadTicksRequired: 3,
          mobilityScore: 0.8,
          electronicVulnerability: 0.35,
          deceptionResistance: 0.6,
          linkedRadarId: 'cn_radar_long',
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'CN'
        },
        {
          id: 'sam_cn_hq16_1',
          name: 'HQ-16D Battery Medium - Ningbo',
          ownerNationId: 'CN',
          category: 'SAM_MEDIUM',
          status: 'ACTIVE',
          lat: 29.8,
          lng: 121.5,
          engagementRadiusKm: 80,
          trackingRadiusKm: 180,
          interceptProbabilityBase: 0.8,
          salvoCapacity: 24,
          reloadTicksRequired: 2,
          mobilityScore: 0.9,
          electronicVulnerability: 0.25,
          deceptionResistance: 0.7,
          linkedRadarId: null,
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'CN'
        },
        {
          id: 'asbm_cn_df21d_1',
          name: 'DF-21D ASBM Launcher - Zhejiang Inland',
          ownerNationId: 'CN',
          category: 'ASBM',
          status: 'ACTIVE',
          lat: 29.0,
          lng: 119.0,
          engagementRadiusKm: 1500,
          trackingRadiusKm: 2200,
          interceptProbabilityBase: 0.65,
          salvoCapacity: 4,
          reloadTicksRequired: 8,
          mobilityScore: 0.7,
          electronicVulnerability: 0.4,
          deceptionResistance: 0.5,
          linkedRadarId: null,
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'TW'
        },
        {
          id: 'asbm_cn_df26_1',
          name: 'DF-26 Dual-Capable ASBM - Hainan Base',
          ownerNationId: 'CN',
          category: 'ASBM',
          status: 'ACTIVE',
          lat: 19.0,
          lng: 109.5,
          engagementRadiusKm: 4000,
          trackingRadiusKm: 5000,
          interceptProbabilityBase: 0.6,
          salvoCapacity: 2,
          reloadTicksRequired: 12,
          mobilityScore: 0.6,
          electronicVulnerability: 0.3,
          deceptionResistance: 0.55,
          linkedRadarId: null,
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'CN'
        },
        {
          id: 'ascm_cn_yj18_1',
          name: 'YJ-18 ASCM Coastal Battery - Hainan South',
          ownerNationId: 'CN',
          category: 'ASCM',
          status: 'ACTIVE',
          lat: 18.2,
          lng: 109.5,
          engagementRadiusKm: 540,
          trackingRadiusKm: 700,
          interceptProbabilityBase: 0.7,
          salvoCapacity: 12,
          reloadTicksRequired: 4,
          mobilityScore: 0.85,
          electronicVulnerability: 0.45,
          deceptionResistance: 0.65,
          linkedRadarId: null,
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'CN'
        }
      ];
    } else if (nationId === 'RU') {
      systems = [
        {
          id: 'sam_ru_s400_1',
          name: 'S-400 Triumf Battery - Kaliningrad',
          ownerNationId: 'RU',
          category: 'SAM_LONG',
          status: 'ACTIVE',
          lat: 54.7,
          lng: 20.5,
          engagementRadiusKm: 380,
          trackingRadiusKm: 600,
          interceptProbabilityBase: 0.82,
          salvoCapacity: 32,
          reloadTicksRequired: 4,
          mobilityScore: 0.5,
          electronicVulnerability: 0.3,
          deceptionResistance: 0.72,
          linkedRadarId: 'ru_kaliningrad_radar',
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'RU'
        },
        {
          id: 'sam_ru_s300_1',
          name: 'S-300PMU-2 - Primorsky Krai East',
          ownerNationId: 'RU',
          category: 'SAM_LONG',
          status: 'ACTIVE',
          lat: 43.1,
          lng: 131.9,
          engagementRadiusKm: 250,
          trackingRadiusKm: 400,
          interceptProbabilityBase: 0.7,
          salvoCapacity: 16,
          reloadTicksRequired: 4,
          mobilityScore: 0.65,
          electronicVulnerability: 0.38,
          deceptionResistance: 0.6,
          linkedRadarId: null,
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'RU'
        },
        {
          id: 'ascm_ru_bastion_1',
          name: 'K-300P Bastion-P Battery - Sevastopol',
          ownerNationId: 'RU',
          category: 'ASCM',
          status: 'ACTIVE',
          lat: 44.6,
          lng: 33.5,
          engagementRadiusKm: 500,
          trackingRadiusKm: 650,
          interceptProbabilityBase: 0.78,
          salvoCapacity: 8,
          reloadTicksRequired: 6,
          mobilityScore: 0.8,
          electronicVulnerability: 0.4,
          deceptionResistance: 0.7,
          linkedRadarId: null,
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: false,
          currentRegion: 'RU'
        }
      ];
    } else if (nationId === 'US') {
      systems = [
        {
          id: 'sam_us_patriot_1',
          name: 'Patriot PAC-3 - Okinawa Base',
          ownerNationId: 'US',
          category: 'SAM_MEDIUM',
          status: 'ACTIVE',
          lat: 26.3,
          lng: 127.8,
          engagementRadiusKm: 120,
          trackingRadiusKm: 250,
          interceptProbabilityBase: 0.82,
          salvoCapacity: 32,
          reloadTicksRequired: 3,
          mobilityScore: 0.7,
          electronicVulnerability: 0.2,
          deceptionResistance: 0.85,
          linkedRadarId: 'us_okinawa_radar',
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: true,
          currentRegion: 'JP'
        },
        {
          id: 'sam_us_thaad_1',
          name: 'THAAD Air Defense Battery - Guam',
          ownerNationId: 'US',
          category: 'SAM_LONG',
          status: 'ACTIVE',
          lat: 13.5,
          lng: 144.8,
          engagementRadiusKm: 200,
          trackingRadiusKm: 1000,
          interceptProbabilityBase: 0.9,
          salvoCapacity: 48,
          reloadTicksRequired: 4,
          mobilityScore: 0.4,
          electronicVulnerability: 0.15,
          deceptionResistance: 0.9,
          linkedRadarId: 'guam_radar',
          deployedAtTick: currentTick,
          lastAttritionTick: null,
          attritionLevel: 0,
          isPlayerVisible: true,
          currentRegion: 'US'
        }
      ];
    }

    set((state) => {
      const nextSystems = { ...state.a2adSystems };
      systems.forEach(s => {
        nextSystems[s.id] = s;
      });
      return { a2adSystems: nextSystems };
    });
  },

  seedSatelliteConstellation: (nationId) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    let sats: MilitarySatellite[] = [];

    if (nationId === 'US') {
      sats = [
        {
          id: 'sat_us_opt_1',
          name: 'KH-11 Keyhole Optical Elite',
          ownerNationId: 'US',
          orbitType: 'LEO',
          function: 'ISR_OPTICAL',
          status: 'OPERATIONAL',
          coverageArcDegrees: 12,
          revisitTimeHours: 1.5,
          resolutionMeters: 0.1,
          gpsContributionScore: 0.0,
          jammingResistance: 0.75,
          asatVulnerability: 0.65,
          currentGroundTrackLat: 34.0,
          currentGroundTrackLng: -118.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_us_rad_1',
          name: 'LACROSSE-5 Radar Recon',
          ownerNationId: 'US',
          orbitType: 'LEO',
          function: 'ISR_RADAR',
          status: 'OPERATIONAL',
          coverageArcDegrees: 18,
          revisitTimeHours: 2.0,
          resolutionMeters: 0.5,
          gpsContributionScore: 0.0,
          jammingResistance: 0.85,
          asatVulnerability: 0.6,
          currentGroundTrackLat: 35.8,
          currentGroundTrackLng: 104.2,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_us_gps_1',
          name: 'GPS III-SV03 NavStar',
          ownerNationId: 'US',
          orbitType: 'MEO',
          function: 'GPS_PNT',
          status: 'OPERATIONAL',
          coverageArcDegrees: 45,
          revisitTimeHours: 12.0,
          resolutionMeters: null,
          gpsContributionScore: 0.25,
          jammingResistance: 0.9,
          asatVulnerability: 0.35,
          currentGroundTrackLat: 0.0,
          currentGroundTrackLng: -95.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_us_gps_2',
          name: 'GPS III-SV04 NavStar',
          ownerNationId: 'US',
          orbitType: 'MEO',
          function: 'GPS_PNT',
          status: 'OPERATIONAL',
          coverageArcDegrees: 45,
          revisitTimeHours: 12.0,
          resolutionMeters: null,
          gpsContributionScore: 0.25,
          jammingResistance: 0.9,
          asatVulnerability: 0.35,
          currentGroundTrackLat: 30.0,
          currentGroundTrackLng: 34.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_us_gps_3',
          name: 'GPS III-SV05 NavStar',
          ownerNationId: 'US',
          orbitType: 'MEO',
          function: 'GPS_PNT',
          status: 'OPERATIONAL',
          coverageArcDegrees: 45,
          revisitTimeHours: 12.0,
          resolutionMeters: null,
          gpsContributionScore: 0.25,
          jammingResistance: 0.9,
          asatVulnerability: 0.35,
          currentGroundTrackLat: 45.0,
          currentGroundTrackLng: 105.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_us_gps_4',
          name: 'GPS III-SV06 NavStar',
          ownerNationId: 'US',
          orbitType: 'MEO',
          function: 'GPS_PNT',
          status: 'OPERATIONAL',
          coverageArcDegrees: 45,
          revisitTimeHours: 12.0,
          resolutionMeters: null,
          gpsContributionScore: 0.25,
          jammingResistance: 0.9,
          asatVulnerability: 0.35,
          currentGroundTrackLat: -20.0,
          currentGroundTrackLng: 133.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_us_sbirs_1',
          name: 'USA-273 SBIRS GEO-3',
          ownerNationId: 'US',
          orbitType: 'GEO',
          function: 'EARLY_WARNING',
          status: 'OPERATIONAL',
          coverageArcDegrees: 120,
          revisitTimeHours: 0.1,
          resolutionMeters: null,
          gpsContributionScore: 0.0,
          jammingResistance: 0.8,
          asatVulnerability: 0.1,
          currentGroundTrackLat: 0.0,
          currentGroundTrackLng: 110.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        }
      ];
    } else if (nationId === 'CN') {
      sats = [
        {
          id: 'sat_cn_yg_1',
          name: 'Yaogan-33 SAR SpySat',
          ownerNationId: 'CN',
          orbitType: 'LEO',
          function: 'ISR_RADAR',
          status: 'OPERATIONAL',
          coverageArcDegrees: 15,
          revisitTimeHours: 1.8,
          resolutionMeters: 0.3,
          gpsContributionScore: 0.0,
          jammingResistance: 0.7,
          asatVulnerability: 0.7,
          currentGroundTrackLat: 22.0,
          currentGroundTrackLng: 113.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        },
        {
          id: 'sat_cn_bd_1',
          name: 'BeiDou-3 G1 NavStar',
          ownerNationId: 'CN',
          orbitType: 'GEO',
          function: 'GPS_PNT',
          status: 'OPERATIONAL',
          coverageArcDegrees: 80,
          revisitTimeHours: 0.5,
          resolutionMeters: null,
          gpsContributionScore: 0.1,
          jammingResistance: 0.8,
          asatVulnerability: 0.25,
          currentGroundTrackLat: 0.0,
          currentGroundTrackLng: 105.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        }
      ];
    } else if (nationId === 'RU') {
      sats = [
        {
          id: 'sat_ru_p_1',
          name: 'Persona-3 Optical Scout',
          ownerNationId: 'RU',
          orbitType: 'LEO',
          function: 'ISR_OPTICAL',
          status: 'OPERATIONAL',
          coverageArcDegrees: 10,
          revisitTimeHours: 2.2,
          resolutionMeters: 0.3,
          gpsContributionScore: 0.0,
          jammingResistance: 0.6,
          asatVulnerability: 0.72,
          currentGroundTrackLat: 55.0,
          currentGroundTrackLng: 37.0,
          operationalSince: currentTick,
          lastDegradedTick: null
        }
      ];
    }

    set((state) => {
      const nextSats = { ...state.satellites };
      sats.forEach(s => {
        nextSats[s.id] = s;
      });
      return { satellites: nextSats };
    });
  },

  seedCarrierStrikeGroups: () => {
    const csgs: CarrierStrikeGroup[] = [
      {
        id: 'csg_us_pac',
        name: 'Carrier Strike Group 5 (USS Ronald Reagan)',
        ownerNationId: 'US',
        lat: 23.0,
        lng: 135.0, // Operating East of Taiwan
        aircraftCount: 75,
        aircraftBaseRangeKm: 850,
        tankerCount: 6,
        tankerMultiplier: 1.4,
        posture: 'STANDARD',
        fuelStatePercent: 100,
        a2adAttritionRisk: 0.0,
        effectiveStrikeRadiusKm: 1190, // 850 * 1.4 (will be computed dynamically)
        escortCapacity: 120,
        lastMovedTick: 1,
        isInA2ADZone: false,
        detectionRisk: 0.1
      },
      {
        id: 'csg_us_mid',
        name: 'Carrier Strike Group 11 (USS Nimitz)',
        ownerNationId: 'US',
        lat: 15.0,
        lng: 55.0, // Arabian Sea
        aircraftCount: 72,
        aircraftBaseRangeKm: 850,
        tankerCount: 4,
        tankerMultiplier: 1.25,
        posture: 'STANDARD',
        fuelStatePercent: 95,
        a2adAttritionRisk: 0.0,
        effectiveStrikeRadiusKm: 1062,
        escortCapacity: 110,
        lastMovedTick: 1,
        isInA2ADZone: false,
        detectionRisk: 0.05
      }
    ];

    set((state) => {
      const nextCsgs = { ...state.carrierStrikeGroups };
      csgs.forEach(c => {
        nextCsgs[c.id] = c;
      });
      return { carrierStrikeGroups: nextCsgs };
    });
  },

  seedBomberForces: () => {
    const bombers: BomberForce[] = [
      {
        id: 'bomber_us_b2a',
        name: '509th Bomb Wing (B-2A Spirit - Whiteman AFB)',
        ownerNationId: 'US',
        baseLocation: { lat: 38.72, lng: -93.56 },
        aircraftType: 'B-2A Spirit',
        combatRadiusKm: 11000,
        refuelCorridors: [
          { id: 'corridor_pac_1', waypointLat: 28.2, waypointLng: 138.5, rangeExtensionKm: 4000, isContested: false, asatRisk: 0.05 },
          { id: 'corridor_nor_1', waypointLat: 75.0, waypointLng: 15.0, rangeExtensionKm: 3000, isContested: false, asatRisk: 0.1 }
        ],
        stealthModifier: 0.85,
        penetrationProbability: 1.0,
        currentMission: 'STANDBY'
      },
      {
        id: 'bomber_us_b52h',
        name: '2nd Bomb Wing (B-52H Stratofortress - Barksdale AFB)',
        ownerNationId: 'US',
        baseLocation: { lat: 32.50, lng: -93.66 },
        aircraftType: 'B-52H',
        combatRadiusKm: 7200,
        refuelCorridors: [
          { id: 'corridor_pac_b52', waypointLat: 20.0, waypointLng: 140.0, rangeExtensionKm: 3000, isContested: false, asatRisk: 0.02 }
        ],
        stealthModifier: 0.1,
        penetrationProbability: 0.7,
        currentMission: 'STANDBY'
      }
    ];

    set((state) => {
      const nextBombers = { ...state.bomberForces };
      bombers.forEach(b => {
        nextBombers[b.id] = b;
      });
      return { bomberForces: nextBombers };
    });
  },

  computeA2ADZones: () => {
    const systems = get().a2adSystems;
    const computed: ComputedA2ADZone[] = [];

    const sysArray = Object.values(systems);

    sysArray.forEach((sys) => {
      if (sys.status === 'DESTROYED' || sys.status === 'REDEPLOYING' || sys.status === 'HIDDEN') {
        return;
      }

      // Check if overlapping exists with any sibling system
      const isOverlapping = sysArray.some((other) => {
        if (other.id === sys.id || other.status === 'DESTROYED') return false;
        const dist = computeDistanceKm(sys.lat, sys.lng, other.lat, other.lng);
        return dist < (sys.engagementRadiusKm + other.engagementRadiusKm);
      });

      // Calculate state-dependent penalty or active modifiers
      let currentInterceptScore = sys.interceptProbabilityBase;
      if (sys.status === 'DEGRADED') {
        currentInterceptScore *= 0.5;
      } else if (sys.status === 'SUPPRESSED') {
        currentInterceptScore = 0.0;
      }

      // Decrement probability slightly per attrition status
      currentInterceptScore *= (1.0 - sys.attritionLevel * 0.5);

      computed.push({
        systemId: sys.id,
        centerLat: sys.lat,
        centerLng: sys.lng,
        engagementRadiusKm: sys.engagementRadiusKm,
        trackingRadiusKm: sys.trackingRadiusKm,
        interceptProbability: Math.min(1.0, Math.max(0.0, currentInterceptScore)),
        category: sys.category,
        ownerNationId: sys.ownerNationId,
        status: sys.status,
        isOverlapping
      });
    });

    set({ activeA2ADZones: computed });
  },

  computeCoverageArcs: () => {
    const satellites = get().satellites;
    const trackingMPAs = get().maritimePatrolAircraft;
    const computed: ComputedCoverageArc[] = [];

    Object.values(satellites).forEach((sat) => {
      if (sat.status === 'DESTROYED') return;

      let quality = 1.0;
      if (sat.status === 'DEGRADED' || sat.status === 'JAMMED' || sat.status === 'SPOOFED') {
        quality = 0.3;
      }

      // Broaden footprint based on orbit type
      let radiusRadius = 300;
      if (sat.orbitType === 'MEO') radiusRadius = 1500;
      if (sat.orbitType === 'GEO') radiusRadius = 4000;

      computed.push({
        sourceId: sat.id,
        sourceType: 'SATELLITE',
        centerLat: sat.currentGroundTrackLat,
        centerLng: sat.currentGroundTrackLng,
        radiusKm: radiusRadius,
        coverageQuality: quality,
        ownerNationId: sat.ownerNationId,
        function: sat.function
      });
    });

    Object.values(trackingMPAs).forEach((mpa) => {
      if (!mpa.isActive) return;

      computed.push({
        sourceId: mpa.id,
        sourceType: 'MPA',
        centerLat: mpa.currentPatrolCenter.lat,
        centerLng: mpa.currentPatrolCenter.lng,
        radiusKm: mpa.patrolRadiusKm,
        coverageQuality: 0.85,
        ownerNationId: mpa.ownerNationId,
        function: 'MPA_PATROL'
      });
    });

    set({ activeCoverageArcs: computed });
  },

  updateCarrierReach: (csgId) => {
    set((state) => {
      const csg = state.carrierStrikeGroups[csgId];
      if (!csg) return {};

      // Posture effects
      let postureMod = 1.0;
      if (csg.posture === 'SURGE') postureMod = 1.25;
      if (csg.posture === 'DEFENSIVE') postureMod = 0.7;
      if (csg.posture === 'WITHDRAWN') postureMod = 0.4;

      // Fuel penalty
      const fuelMultiplier = csg.fuelStatePercent / 100;

      // Attrition Risk calculation from active zones
      let threatsFound = 0;
      state.activeA2ADZones.forEach((zone) => {
        if (zone.ownerNationId !== csg.ownerNationId && zone.category === 'ASBM') {
          const distance = computeDistanceKm(csg.lat, csg.lng, zone.centerLat, zone.centerLng);
          if (distance <= zone.engagementRadiusKm) {
            threatsFound += zone.interceptProbability;
          }
        }
      });

      const attritionRisk = Math.min(1.0, threatsFound * 0.3);

      // Final strike radius calculation
      const baseProduct = csg.aircraftBaseRangeKm * csg.tankerMultiplier * postureMod * fuelMultiplier;
      const finalRadius = baseProduct * (1.0 - attritionRisk * 0.4);

      const updated = {
        ...csg,
        a2adAttritionRisk: attritionRisk,
        effectiveStrikeRadiusKm: Math.round(finalRadius),
        isInA2ADZone: attritionRisk > 0.1,
        detectionRisk: Math.min(1.0, (attritionRisk > 0 ? 0.45 : 0.05) + (csg.posture === 'SURGE' ? 0.3 : 0.0))
      };

      return {
        carrierStrikeGroups: {
          ...state.carrierStrikeGroups,
          [csgId]: updated
        }
      };
    });
  },

  calculateBomberPenetration: (bomberForceId, targetLat, targetLng) => {
    const state = get();
    const bomber = state.bomberForces[bomberForceId];
    if (!bomber) return { penetrationProbability: 0, expectedAttrition: 1 };

    // Check distance between base and target
    const distanceToTarget = computeDistanceKm(bomber.baseLocation.lat, bomber.baseLocation.lng, targetLat, targetLng);

    // Identify refuel assistance extension
    let refuelBoost = 0;
    bomber.refuelCorridors.forEach(corrid => {
      if (!corrid.isContested) {
        refuelBoost += confidDistanceCheck(bomber.baseLocation.lat, bomber.baseLocation.lng, corrid.waypointLat, corrid.waypointLng) ? corrid.rangeExtensionKm : 0;
      }
    });

    function confidDistanceCheck(bLa: number, bLn: number, cLa: number, cLn: number) {
      return computeDistanceKm(bLa, bLn, cLa, cLn) < 6000;
    }

    if (distanceToTarget > (bomber.combatRadiusKm + refuelBoost)) {
      return { penetrationProbability: 0.0, expectedAttrition: 1.0 }; // Cannot reach
    }

    // Accumulate interdiction along path
    let interceptProduct = 1.0; 
    let samEncounters = 0;

    state.activeA2ADZones.forEach((zone) => {
      if (zone.ownerNationId !== bomber.ownerNationId && (zone.category === 'SAM_LONG' || zone.category === 'SAM_MEDIUM')) {
        // Approximate point-on-line intercept by checking distance of target or centerpoint
        const midpointLat = (bomber.baseLocation.lat + targetLat) / 2;
        const midpointLng = (bomber.baseLocation.lng + targetLng) / 2;
        const distanceTgt = computeDistanceKm(targetLat, targetLng, zone.centerLat, zone.centerLng);
        const distanceMid = computeDistanceKm(midpointLat, midpointLng, zone.centerLat, zone.centerLng);

        if (distanceTgt <= zone.engagementRadiusKm || distanceMid <= zone.engagementRadiusKm) {
          // Stealth reduces probability of intercept
          const adjustedProbability = zone.interceptProbability * (1.0 - bomber.stealthModifier);
          interceptProduct *= (1.0 - adjustedProbability);
          samEncounters++;
        }
      }
    });

    const penetrationChance = Math.min(1.0, Math.max(0.05, interceptProduct));
    const expectedAttrition = Math.min(1.0, (1.0 - penetrationChance) * (1.0 - bomber.stealthModifier * 0.5));

    return {
      penetrationProbability: Math.round(penetrationChance * 100) / 100,
      expectedAttrition: Math.round(expectedAttrition * 100) / 100
    };
  },

  deployA2ADSystem: (params) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    const generatedId = `sam_manual_${Date.now()}`;
    const newSys: A2ADSystem = {
      ...params,
      id: generatedId,
      deployedAtTick: currentTick,
      lastAttritionTick: null,
      attritionLevel: 0,
      isPlayerVisible: params.ownerNationId === 'US'
    };

    set((state) => ({
      a2adSystems: {
        ...state.a2adSystems,
        [generatedId]: newSys
      }
    }));

    get().computeA2ADZones();
    return generatedId;
  },

  moveA2ADSystem: (systemId, newLat, newLng) => {
    set((state) => {
      const sys = state.a2adSystems[systemId];
      if (!sys || sys.status === 'DESTROYED') return {};
      
      const updated: A2ADSystem = {
        ...sys,
        lat: newLat,
        lng: newLng,
        status: sys.mobilityScore > 0 ? 'REDEPLOYING' : sys.status
      };

      return {
        a2adSystems: {
          ...state.a2adSystems,
          [systemId]: updated
        }
      };
    });

    get().computeA2ADZones();
  },

  upgradeA2ADSystem: (systemId, upgradeType) => {
    set((state) => {
      const sys = state.a2adSystems[systemId];
      if (!sys) return {};

      let updated = { ...sys };
      if (upgradeType === 'RADAR_UPGRADE') {
        updated.trackingRadiusKm = Math.round(updated.trackingRadiusKm * 1.25);
        updated.engagementRadiusKm = Math.round(updated.engagementRadiusKm * 1.15);
      } else if (upgradeType === 'HARDENING') {
        updated.electronicVulnerability = Math.max(0.05, updated.electronicVulnerability - 0.15);
        updated.deceptionResistance = Math.min(0.95, updated.deceptionResistance + 0.15);
      } else if (upgradeType === 'SALVO_EXPANSION') {
        updated.salvoCapacity += 8;
        updated.interceptProbabilityBase = Math.min(0.95, updated.interceptProbabilityBase + 0.05);
      }

      return {
        a2adSystems: {
          ...state.a2adSystems,
          [systemId]: updated
        }
      };
    });

    get().computeA2ADZones();
  },

  launchSEADCampaign: (params) => {
    const generatedId = `sead_${Date.now()}`;
    const campaign: SEADCampaign = {
      ...params,
      id: generatedId,
      status: 'ACTIVE'
    };

    set((state) => ({
      seadCampaigns: [...state.seadCampaigns, campaign]
    }));

    useWorldStore.getState().addGlobalEvent(
      `MILITARY EMISSION: Allied commanders deploy dedicated SEAD flights targeting adversary SAM systems in region. EW coverage peaking.`, 
      'WARNING'
    );

    return generatedId;
  },

  launchASATStrike: (params) => {
    const generatedId = `asat_${Date.now()}`;
    const newStrike: ASATStrike = {
      ...params,
      id: generatedId,
      outcome: 'PENDING',
      debrisFieldCreated: false
    };

    set((state) => ({
      pendingASATStrikes: [...state.pendingASATStrikes, newStrike],
      asatStrikes: [...state.asatStrikes, newStrike]
    }));

    useWorldStore.getState().addGlobalEvent(
      `SPACE COMMAND WARNING: Anti-Satellite (ASAT) launch trajectory calculated. Initiator: ${params.initiatingNationId}. Target ID: ${params.targetSatelliteId}. Impact tracking active.`, 
      'CRITICAL'
    );

    // Play visual cue
    useCinematicsStore.getState().triggerCinematic('ASAT_STRIKE_DETECTED', {});

    return generatedId;
  },

  deployGPSJammer: (params) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    const generatedId = `gps_jam_${Date.now()}`;
    const newZone: GPSDegradationZone = {
      ...params,
      id: generatedId,
      deployedAtTick: currentTick
    };

    set((state) => ({
      gpsDegradationZones: {
        ...state.gpsDegradationZones,
        [generatedId]: newZone
      }
    }));

    useWorldStore.getState().addGlobalEvent(
      `SIGNAL INTEL INTEL: Active wideband GPS jamming envelope detected centering ${params.centerLat}°N, ${params.centerLng}°E. Navigation accuracy degrading rapidly.`, 
      'WARNING'
    );

    useCinematicsStore.getState().triggerCinematic('GPS_DEGRADATION_ACTIVE', {});

    return generatedId;
  },

  deployGPSSpoofing: (params) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    const generatedId = `gps_spoof_${Date.now()}`;
    const newZone: GPSDegradationZone = {
      ...params,
      id: generatedId,
      deployedAtTick: currentTick
    };

    set((state) => ({
      gpsDegradationZones: {
        ...state.gpsDegradationZones,
        [generatedId]: newZone
      }
    }));

    useWorldStore.getState().addGlobalEvent(
      `SIGNAL INTEL INTEL: Precision Spoofing vectors deployed. False coordinates injected into target military PNT terminals.`, 
      'WARNING'
    );

    useCinematicsStore.getState().triggerCinematic('GPS_DEGRADATION_ACTIVE', {});

    return generatedId;
  },

  orderCarrierPosture: (csgId, posture) => {
    set((state) => {
      const csg = state.carrierStrikeGroups[csgId];
      if (!csg) return {};
      return {
        carrierStrikeGroups: {
          ...state.carrierStrikeGroups,
          [csgId]: { ...csg, posture }
        }
      };
    });

    get().updateCarrierReach(csgId);
  },

  orderCarrierMove: (csgId, newLat, newLng) => {
    const currentTick = useWorldStore.getState().currentTick || 1;
    set((state) => {
      const csg = state.carrierStrikeGroups[csgId];
      if (!csg) return {};
      return {
        carrierStrikeGroups: {
          ...state.carrierStrikeGroups,
          [csgId]: { 
            ...csg, 
            lat: newLat, 
            lng: newLng, 
            lastMovedTick: currentTick,
            fuelStatePercent: Math.max(10, csg.fuelStatePercent - 8) // consumes fuel
          }
        }
      };
    });

    get().updateCarrierReach(csgId);
  },

  activateMaritimePatrol: (aircraftId, centerLat, centerLng) => {
    set((state) => {
      const mpa = state.maritimePatrolAircraft[aircraftId];
      if (!mpa) {
        // Create dynamic MPA asset if not existing yet matching the action
        const mockMpa: MaritimePatrolAircraft = {
          id: aircraftId,
          ownerNationId: 'US',
          baseLocation: { lat: 26.3, lng: 127.8 },
          currentPatrolCenter: { lat: centerLat, lng: centerLng },
          patrolRadiusKm: 600,
          loiterTimeHours: 8,
          detectionRangeSubmarineKm: 45,
          detectionRangeSurfaceKm: 120,
          isActive: true,
          nextPatrolTick: 1
        };
        return {
          maritimePatrolAircraft: {
            ...state.maritimePatrolAircraft,
            [aircraftId]: mockMpa
          }
        };
      }
      return {
        maritimePatrolAircraft: {
          ...state.maritimePatrolAircraft,
          [aircraftId]: {
            ...mpa,
            currentPatrolCenter: { lat: centerLat, lng: centerLng },
            isActive: true
          }
        }
      };
    });

    get().computeCoverageArcs();
  },

  tickA2AD: (currentTick) => {
    // 1. ADVANCE SAT ORBITS
    set((state) => {
      const updatedSats = { ...state.satellites };
      Object.keys(updatedSats).forEach((id) => {
        const sat = updatedSats[id];
        if (sat.status === 'DESTROYED') return;

        // Orbital wrapping speed
        const orbitalSpeed = sat.orbitType === 'LEO' ? 8 : (sat.orbitType === 'MEO' ? 2 : 0.5);
        let nextLng = sat.currentGroundTrackLng + orbitalSpeed;
        if (nextLng > 180) nextLng -= 360;

        let nextLat = sat.currentGroundTrackLat + Math.sin(currentTick * 0.1) * 3;
        if (nextLat > 80) nextLat = 80;
        if (nextLat < -80) nextLat = -80;

        updatedSats[id] = {
          ...sat,
          currentGroundTrackLng: Math.round(nextLng * 100) / 100,
          currentGroundTrackLat: Math.round(nextLat * 100) / 100
        };
      });
      return { satellites: updatedSats };
    });

    // 2. RESOLVE ASAT STRIKES
    const pending = get().pendingASATStrikes;
    const resolvedIds = new Set<string>();

    pending.forEach((strike) => {
      if (strike.expectedImpactTick <= currentTick) {
        resolvedIds.add(strike.id);

        set((state) => {
          const finishedIndex = state.asatStrikes.findIndex(as => as.id === strike.id);
          const targetSat = state.satellites[strike.targetSatelliteId];
          const strikeRoll = Math.random();
          const isSuccess = strikeRoll < strike.successProbability;

          let updatedStrike = { ...strike };
          let updatedSats = { ...state.satellites };
          let addedDebris = 0.0;

          if (isSuccess && targetSat) {
            updatedStrike.outcome = 'SUCCESS';
            updatedSats[strike.targetSatelliteId] = {
              ...targetSat,
              status: 'DESTROYED',
              lastDegradedTick: currentTick
            };

            useWorldStore.getState().addGlobalEvent(
              `SPACE IMPACT RESOLUTE: Kinetic/Cyber payload successfully disabled adversary satellite [${targetSat.name}] owned by ${targetSat.ownerNationId}!`,
              'CRITICAL'
            );

            useCinematicsStore.getState().triggerCinematic('SATELLITE_DESTROYED', {});

            // Debris Creation from kinetic strike
            if (strike.method === 'KINETIC_DIRECT_ASCENT' || strike.method === 'CO_ORBITAL_INTERCEPTOR') {
              updatedStrike.debrisFieldCreated = true;
              addedDebris = 0.08;
            }

            // DEFCON trigger review if attacking nuclear power's Early Warning satellite
            if (targetSat.function === 'EARLY_WARNING' && ['US', 'RU', 'CN'].includes(targetSat.ownerNationId)) {
              useDefconStore.getState().setDefconLevel(
                2, 
                'SYSTEM', 
                `Early warning satellite interception represents dangerous nuclear escalation pathways.`, 
                currentTick
              );
            }
          } else {
            updatedStrike.outcome = 'FAILURE';
            useWorldStore.getState().addGlobalEvent(
              `SPACE COMMAND TELEMETRY: ASAT interception failed against target orbit [${strike.targetSatelliteId}]. Payload missed.`,
              'WARNING'
            );
          }

          // Update histories
          const nextStrikes = [...state.asatStrikes];
          if (finishedIndex !== -1) {
            nextStrikes[finishedIndex] = updatedStrike;
          }

          return {
            asatStrikes: nextStrikes,
            satellites: updatedSats,
            spaceDebrisRisk: Math.min(1.0, state.spaceDebrisRisk + addedDebris)
          };
        });
      }
    });

    // Remove resolved strikes from pendings
    if (resolvedIds.size > 0) {
      set((state) => ({
        pendingASATStrikes: state.pendingASATStrikes.filter(s => !resolvedIds.has(s.id))
      }));
    }

    // 3. SEAD CAMPAIGN SYSTEM PROCESSING
    set((state) => {
      let campaignsChanged = false;
      const nextCampaigns = state.seadCampaigns.map((camp) => {
        if (camp.status !== 'ACTIVE') return camp;

        campaignsChanged = true;
        const roll = Math.random();
        if (roll < camp.suppressionProbabilityPerTick) {
          // Suppress target systems
          const updatedSystems = { ...state.a2adSystems };
          camp.targetA2ADSystemIds.forEach((sid) => {
            const sys = updatedSystems[sid];
            if (sys && sys.status !== 'DESTROYED') {
              updatedSystems[sid] = {
                ...sys,
                status: 'SUPPRESSED',
                lastAttritionTick: currentTick
              };
            }
          });

          useWorldStore.getState().addGlobalEvent(
            `SEAD MISSION REPORT: Radar emissions suppressed on defensive systems targeting ${camp.targetNationId}. Air corridors opened.`,
            'SYSTEM'
          );

          useCinematicsStore.getState().triggerCinematic('A2AD_UMBRELLA_SUPPRESSED', {});

          return { ...camp, status: 'COMPLETED' as const };
        }

        // Exhaust tick duration
        const expired = currentTick >= (camp.startTick + camp.durationTicks);
        if (expired) {
          return { ...camp, status: 'COMPLETED' as const };
        }

        return camp;
      });

      return campaignsChanged ? { seadCampaigns: nextCampaigns } : {};
    });

    // 4. GPS DEGRADATION ZONE AND RE-CALCULATE ACCURACY FLOWS
    const activeZones = get().gpsDegradationZones;
    let gpsMap: Record<string, number> = {
      US: 1.0, CN: 1.0, RU: 1.0, TW: 1.0, IL: 1.0, IR: 1.0
    };

    // Calculate baseline GPS accuracy based on active GPS satellites
    let operationalGpsSatsCount = 0;
    Object.values(get().satellites).forEach((sat) => {
      if (sat.function === 'GPS_PNT' && sat.status === 'OPERATIONAL') {
        operationalGpsSatsCount++;
      }
    });

    // Baseline precision factor (24 is absolute perfect standard)
    const baseGpsFactor = Math.min(1.0, 0.4 + (operationalGpsSatsCount / 8) * 0.6);
    Object.keys(gpsMap).forEach((r) => {
      gpsMap[r] = baseGpsFactor;
    });

    // Evaluate jammers or spoofing regions
    Object.values(activeZones).forEach((zone) => {
      if (zone.expiresAtTick !== null && currentTick >= zone.expiresAtTick) {
        // Expired zone
        set((state) => {
          const nextZones = { ...state.gpsDegradationZones };
          delete nextZones[zone.id];
          return { gpsDegradationZones: nextZones };
        });
      } else {
        // Jamming covers regions
        // For simplicity inside layout context, apply to the deploying adversary's targets
        // e.g. US jammer covers TW or RU jammer covers Europe (RU)
        const regionTarget = zone.deployedByNationId === 'US' ? 'TW' : 'US';
        gpsMap[regionTarget] = Math.max(0.1, gpsMap[regionTarget] - zone.severity * 0.7);
      }
    });

    // Compute cascading metrics
    const averageTotalAccuracy = Object.values(gpsMap).reduce((a, b) => a + b, 0) / Object.keys(gpsMap).length;
    const precisionMunitionsDegradation = Math.max(0.0, 1.0 - averageTotalAccuracy);
    const navigationDegradation = precisionMunitionsDegradation * 0.8;
    const c2Degradation = precisionMunitionsDegradation * 0.9;

    // Apply cascading penalties directly on stores!
    // Precise integration rule!
    if (precisionMunitionsDegradation > 0.3) {
      // Degrades CEP of nuclear storage systems in nuclearStore
      const nuclearStore = useNuclearStore.getState();
      if (nuclearStore && typeof (nuclearStore as any).applyPntDegradation === 'function') {
        (nuclearStore as any).applyPntDegradation(precisionMunitionsDegradation);
      }
      // Apply conventional combat payload offsets
      const conventionalStore = useConventionalOpsStore.getState();
      if (conventionalStore && typeof (conventionalStore as any).notifyGpsOutage === 'function') {
        (conventionalStore as any).notifyGpsOutage(precisionMunitionsDegradation);
      }
    }

    // 5. CARRIER & SPACE DEBRIS UPDATE
    Object.keys(get().carrierStrikeGroups).forEach((id) => {
      get().updateCarrierReach(id);
    });

    // Random orbit failure roll due to Space Debris Risk
    if (get().spaceDebrisRisk > 0.3) {
      Object.values(get().satellites).forEach((sat) => {
        if (sat.status === 'OPERATIONAL' && sat.orbitType === 'LEO' && Math.random() < (get().spaceDebrisRisk * 0.04)) {
          set((state) => {
            const nextSats = { ...state.satellites };
            nextSats[sat.id] = {
              ...sat,
              status: 'DEGRADED',
              lastDegradedTick: currentTick
            };
            return { satellites: nextSats };
          });
          useWorldStore.getState().addGlobalEvent(
            `SPACE DEBRIS CASCADE: Orbital collision debris collides with satellite [${sat.name}] causing system sensor degradation.`,
            'WARNING'
          );
        }
      });
    }

    // 6. ADVERSARY AI REACTIONS
    const securityDoctrines: Record<string, number> = {
      CN: 0.85,
      RU: 0.9,
      US: 0.65
    };

    // Responsive repositioning of coastal launchers
    Object.values(get().carrierStrikeGroups).forEach((csg) => {
      if (csg.ownerNationId === 'US') {
        // Check distance of carrier to adversary coasts
        const cnCentroid: [number, number] = [104.1954, 35.8617];
        const distanceToChina = computeDistanceKm(csg.lat, csg.lng, cnCentroid[1], cnCentroid[0]);

        if (distanceToChina < 1200) {
          // China AI shifts coastal launchers
          set((state) => {
            const nextSystems = { ...state.a2adSystems };
            const mobileLaunchers = Object.values(nextSystems).filter(s => s.ownerNationId === 'CN' && s.mobilityScore > 0.5);
            mobileLaunchers.forEach((launcher) => {
              if (Math.random() < 0.25) { // Responsive displacement trigger
                nextSystems[launcher.id] = {
                  ...launcher,
                  lat: launcher.lat + (Math.random() - 0.5) * 0.8,
                  lng: launcher.lng + (Math.random() - 0.5) * 0.8,
                  status: 'ACTIVE'
                };
              }
            });
            return { a2adSystems: nextSystems };
          });
        }
      }
    });

    // 7. COMPUTE SIGINT PLAYER VISIBILITY OVERRIDES
    const activeCampaignsList = Object.values(useSigintStore.getState().campaigns || {});
    set((state) => {
      const nextSystems = { ...state.a2adSystems };
      let changed = false;

      Object.values(nextSystems).forEach((sys) => {
        if (sys.ownerNationId === 'US') return;

        // Visual or SIGINT cover override check
        const hasIntelCoverage = activeCampaignsList.some(
          (campaign) => campaign.targetId === sys.currentRegion && campaign.status === 'ACTIVE'
        );

        if (hasIntelCoverage && !sys.isPlayerVisible) {
          nextSystems[sys.id].isPlayerVisible = true;
          changed = true;
          useWorldStore.getState().addGlobalEvent(
            `INTELLIGENCE FEED: High-altitude imagery confirms precise location of hostile battery [${sys.name}]. Targeting parameters synced.`,
            'INFO'
          );
        }
      });

      return changed ? { a2adSystems: nextSystems } : {};
    });

    // Recover redeploying systems
    set((state) => {
      const nextSystems = { ...state.a2adSystems };
      let changed = false;
      Object.keys(nextSystems).forEach((id) => {
        const sys = nextSystems[id];
        if (sys.status === 'REDEPLOYING' && Math.random() < 0.4) {
          nextSystems[id] = {
            ...sys,
            status: 'ACTIVE'
          };
          changed = true;
        }
      });
      return changed ? { a2adSystems: nextSystems } : {};
    });

    // Recover suppressed systems back to degraded/active
    set((state) => {
      const nextSystems = { ...state.a2adSystems };
      let changed = false;
      Object.keys(nextSystems).forEach((id) => {
        const sys = nextSystems[id];
        if (sys.status === 'SUPPRESSED' && sys.lastAttritionTick && (currentTick - sys.lastAttritionTick > 4)) {
          nextSystems[id] = {
            ...sys,
            status: 'DEGRADED'
          };
          changed = true;
        } else if (sys.status === 'DEGRADED' && sys.lastAttritionTick && (currentTick - sys.lastAttritionTick > 10)) {
          nextSystems[id] = {
            ...sys,
            status: 'ACTIVE'
          };
          changed = true;
        }
      });
      return changed ? { a2adSystems: nextSystems } : {};
    });

    set({
      gpsAccuracyByRegion: gpsMap,
      globalPrecisionMunitionsDegradation: precisionMunitionsDegradation,
      globalNavigationDegradation: navigationDegradation,
      globalC2Degradation: c2Degradation,
      lastTickProcessed: currentTick
    });

    get().computeA2ADZones();
    get().computeCoverageArcs();
  }
}));
