import { create } from 'zustand';
import { produce } from 'immer';
import { Unit, UnitType, UnitStatus, UnitMissionType, MissionTarget, UnitRoute, CarrierGroupUnit, SubmarineUnit, ICBMSiloUnit, AirWingUnit, SpecForceUnit } from '../types';
import { COUNTRY_CENTROIDS } from '../components/map/countryCentroids';
import { interpolateGreatCircle, generateGreatCirclePath, calculateHaversineDistanceKm } from '../utils/routeMath';
import { useWorldStore } from './worldStore';

interface UnitState {
  units: Unit[];
  selectedUnitId: string | null;
  selectedUnitTypeTab: UnitType;
}

interface UnitActions {
  initializeUnits: () => void;
  selectUnit: (id: string | null) => void;
  setSelectedUnitTypeTab: (type: UnitType) => void;
  deployCarrierGroup: (unitId: string, destLat: number, destLon: number, destName: string, targetCountryId?: string) => void;
  setStrikeMission: (unitId: string, targetName: string, lat: number, lon: number, countryId?: string) => void;
  clearMission: (unitId: string) => void;
  updateUnitPositions: (currentTick: number) => void;
  getUnitsByType: (type: UnitType) => Unit[];
  getUnitsByOwner: (owner: string) => Unit[];
  getMovingUnits: () => Unit[];
  resetUnits: () => void;
}

const MAJOR_POWERS = ['US', 'CN', 'RU', 'GB', 'FR', 'IN', 'PK', 'IL'];

// Static sub starting coords
const SUBMARINE_START_COORDS: Record<string, [number, number][]> = {
  US: [[-140.0, 35.0], [-60.0, 32.0], [-120.0, 15.0], [-40.0, 45.0]],
  CN: [[125.0, 25.0], [115.0, 12.0], [135.0, 18.0], [110.0, 5.0]],
  RU: [[150.0, 48.0], [40.0, 75.0], [30.0, 72.0], [145.0, 55.0]],
  GB: [[-22.0, 50.0], [-15.0, 60.0], [-5.0, 48.0], [-35.0, 40.0]],
  FR: [[-18.0, 42.0], [5.0, 38.0], [-30.0, 30.0], [55.0, -15.0]],
  IN: [[65.0, 12.0], [85.0, 10.0], [78.0, 5.0], [90.0, -5.0]],
  PK: [[62.0, 21.0], [64.0, 18.0], [66.0, 15.0], [61.0, 19.0]],
  IL: [[33.5, 32.0], [34.0, 31.5], [34.5, 33.0], [33.0, 31.0]]
};

const CARRIER_START_COORDS: Record<string, [number, number][]> = {
  US: [[-123.5, 30.0], [-75.0, 35.0], [-157.8, 20.0]],
  CN: [[123.0, 28.0], [115.0, 15.0], [126.0, 22.0]],
  RU: [[33.0, 69.2], [132.0, 43.1], [36.0, 44.5]],
  GB: [[2.0, 56.0], [-15.0, 45.0], [15.0, 35.0]],
  FR: [[6.0, 42.0], [-5.0, 47.0], [65.0, -10.0]],
  IN: [[68.0, 15.0], [88.0, 15.0], [75.0, -5.0]],
  PK: [[62.0, 23.0], [66.5, 24.5], [65.0, 20.0]],
  IL: [[34.0, 32.5], [34.9, 28.5], [33.0, 33.0]]
};

export const useUnitStore = create<UnitState & UnitActions>((set, get) => ({
  units: [],
  selectedUnitId: null,
  selectedUnitTypeTab: 'CarrierGroup',

  initializeUnits: () => {
    // Prevent duplicate initialization
    if (get().units.length > 0) return;

    const initialUnits: Unit[] = [];

    MAJOR_POWERS.forEach((countryId) => {
      const centroid = COUNTRY_CENTROIDS[countryId] || [0, 0];

      // 1. Seed 3 Carrier Groups per major power in oceanic sectors
      const carrierNames = {
        US: ['CVN-68 Nimitz', 'CVN-78 Gerald Ford', 'CVN-72 Abraham Lincoln'],
        CN: ['Liaoning Type 001', 'Shandong Type 002', 'Fujian Type 003'],
        RU: ['Kuznetsov Carrier Taskforce', 'Pacific Escort Group Alpha', 'Northern Sea Fleet Strike Group'],
        GB: ['HMS Queen Elizabeth', 'HMS Prince of Wales', 'Royal Navy Detachment Beta'],
        FR: ['Charles de Gaulle R91', 'Biscay Escort Escadrille', 'Indian Ocean Patrol Force'],
        IN: ['INS Vikramaditya', 'INS Vikrant', 'Indian Ocean Strike Group Charlie'],
        PK: ['PNS Babur taskgroup', 'PNS Tippu Sultan Fleet', 'Arabian Escort Saber-5'],
        IL: ['Sovereign Resolute Strike Team', 'Red Sea Taskforce', 'Eilat Defense Patrol']
      }[countryId as 'US'] || ['Naval Guard Alpha', 'Naval Guard Beta', 'Naval Guard Gamma'];

      const carrierCoords = CARRIER_START_COORDS[countryId] || [[centroid[0] + 5, centroid[1] - 5], [centroid[0] + 10, centroid[1] - 10], [centroid[0] - 5, centroid[1] + 5]];

      for (let i = 0; i < 3; i++) {
        const coord = carrierCoords[i];
        const carrier: CarrierGroupUnit = {
          id: `${countryId}_carrier_${i + 1}`,
          name: carrierNames[i] || `Carrier Strike Group ${i + 1}`,
          type: 'CarrierGroup',
          owner: countryId,
          position: { lat: coord[1], lon: coord[0] },
          status: 'IDLE',
          missionTarget: null,
          missionType: 'NONE',
          eta: null,
          route: null,
          health: 100,
          fuel: 100,
          recentActivity: ['Carrier commissioned. Systems nominal.'],
          embarkedAirWings: 4,
          strikeCapacity: 120,
          wakeTrail: [[coord[0], coord[1]]]
        };
        initialUnits.push(carrier);
      }

      // 2. Seed 7 ICBM Silos per major power spread around interiors
      const siloNames = {
        US: ['Minot AFB Silo 01', 'F.E. Warren AFB Silo 02', 'Malmstrom AFB Silo 03', 'Grand Forks Vault', 'Silo Sector Charlie', 'Cheyenne Complex', 'Rocky Mountain Silo'],
        CN: ['Lop Nur Silo 1', 'Wuzhai Rocket Sector', 'Yulin Launch Bay 3', 'Gobi Desert Battery B', 'Xichang Deep-Silo', 'Central China Reserve 4', 'Northwest Launchpad Delta'],
        RU: ['Kozelsk Strategic Base', 'Tatishchevo Complex', 'Uzhur Underground Silo', 'Dombarovsky Bay 1', 'Yaroslavl Silo Grid', 'Siberia Deep-Silo Zone 5', 'Kamchatka Launch Complex'],
        GB: ['Orkney Deep Bunker', 'Cumbria Strategic Launch Area', 'Cornwall Silo-HQ', 'Gibraltar Garrison Vault', 'Shetland Escarpment Sub-Silo', 'Cotswold Redoubt', 'Falkland Outpost Array'],
        FR: ['Plateau d\'Albion Silo 1', 'Brest Sentinel Complex', 'Toulon Garrison Array', 'Dijon Subterranean Vault', 'Pyrenees Redoubt Zone 7', 'Gironde Fortified Silo', 'Corsica Shore Battery'],
        IN: ['Pokhran Launch Base 01', 'Balasore Range Silo 02', 'Thar Desert Sub-Grid', 'Deccan Fortified Battery', 'AP Coastal Reserve Silo', 'Assam Fortress Sector', 'Kashmir Safeguard Silo'],
        PK: ['Chagai Hills Silo Alpha', 'Sargodha Sector Beta', 'Kahuta Launchpad 03', 'Balochistan Deep Bunker', 'Rawalpindi Strategic Shield', 'Thar Edge Fortress', 'Peshawar Sentinel Vault'],
        IL: ['Sdot Micha Silo A', 'Palmahim Beach Battery', 'Negev Range 03', 'Judean Foothills Vault', 'Galilee Redoubt Sector', 'Ramon Cryptic Silo', 'Eilat Coastal Sentinel']
      }[countryId as 'US'] || Array.from({ length: 7 }, (_, i) => `Fortress launchpad Silo #${i + 1}`);

      for (let i = 0; i < 7; i++) {
        // compute offset coordinates
        const angles = [0, 50, 100, 150, 200, 250, 310];
        const rad = angles[i] * Math.PI / 180;
        // spread from centroid between 1.2 and 4.2 degrees distance
        const dist = 1.3 + (i * 0.45);
        const latOffset = Math.sin(rad) * (dist * 0.4);
        const lonOffset = Math.cos(rad) * dist;

        const silo: ICBMSiloUnit = {
          id: `${countryId}_silo_${i + 1}`,
          name: siloNames[i],
          type: 'ICBMSilo',
          owner: countryId,
          position: { lat: centroid[1] + latOffset, lon: centroid[0] + lonOffset },
          status: 'DEPLOYED',
          missionTarget: null,
          missionType: 'NONE',
          eta: null,
          route: null,
          health: 100,
          fuel: 100,
          recentActivity: ['Hardened missile silo established.', 'Abm shield grid links functional.'],
          missileReadiness: 100,
          warheadType: 'TRIDENT TRIPLE-WARHEAD MIRV',
          hardened: true
        };
        initialUnits.push(silo);
      }

      // 3. Seed 4 Submarines per major power in oceans
      const subCoords = SUBMARINE_START_COORDS[countryId] || [[centroid[0] - 8, centroid[1] + 8]];
      subCoords.forEach((coord, idx) => {
        const sub: SubmarineUnit = {
          id: `${countryId}_sub_${idx + 1}`,
          name: `SSN Class Hunter-Killer Sub #${idx + 1}`,
          type: 'Submarine',
          owner: countryId,
          position: { lat: coord[1], lon: coord[0] },
          status: 'PATROL',
          missionTarget: null,
          missionType: 'PATROL',
          eta: null,
          route: null,
          health: 100,
          fuel: 100,
          recentActivity: ['Submerged deep stealth patrol active.'],
          stealthProfile: 92,
          missileCapacity: 16
        };
        initialUnits.push(sub);
      });

      // 4. Seed 5 Air Wings per major power at airbase structures
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72) * Math.PI / 180;
        const rad = 0.8 + i * 0.3;
        const airPoint = {
          lat: centroid[1] + Math.sin(angle) * rad * 0.4,
          lon: centroid[0] + Math.cos(angle) * rad
        };

        const airWing: AirWingUnit = {
          id: `${countryId}_airwing_${i + 1}`,
          name: `Strategic Fighter Squadron Wing #${i + 1}`,
          type: 'AirWing',
          owner: countryId,
          position: airPoint,
          status: 'IDLE',
          missionTarget: null,
          missionType: 'NONE',
          eta: null,
          route: null,
          health: 100,
          fuel: 100,
          recentActivity: ['Air patrol flight readiness verified.'],
          aircraftCount: 45,
          rangeKm: 2500,
          homeBase: `Base Strategic Sector ${i + 1}`
        };
        initialUnits.push(airWing);
      }

      // 5. Seed 3 SpecForces units per major power
      for (let i = 0; i < 3; i++) {
        const angle = (i * 120 + 30) * Math.PI / 180;
        const rad = 0.4 + i * 0.2;
        const sfPoint = {
          lat: centroid[1] + Math.sin(angle) * rad * 0.4,
          lon: centroid[0] + Math.cos(angle) * rad
        };

        const specForce: SpecForceUnit = {
          id: `${countryId}_specforce_${i + 1}`,
          name: `Command Special Operations Squad #${i + 1}`,
          type: 'SpecForce',
          owner: countryId,
          position: sfPoint,
          status: 'IDLE',
          missionTarget: null,
          missionType: 'NONE',
          eta: null,
          route: null,
          health: 100,
          fuel: 100,
          recentActivity: ['Stealth staging recon validated.'],
          squadSize: 85,
          infiltrationState: 'STAGED',
          stagingArea: 'Frontier Staging Outpost'
        };
        initialUnits.push(specForce);
      }
    });

    set({ units: initialUnits });
  },

  selectUnit: (id) => set({ selectedUnitId: id }),

  setSelectedUnitTypeTab: (type) => set({ selectedUnitTypeTab: type }),

  deployCarrierGroup: (unitId, destLat, destLon, destName, targetCountryId) => set(produce((draft: UnitState) => {
    const unitIndex = draft.units.findIndex((u) => u.id === unitId);
    if (unitIndex === -1) return;
    const unit = draft.units[unitIndex];
    if (unit.type !== 'CarrierGroup') return;

    // Haversine Distance computation
    const distanceKm = calculateHaversineDistanceKm(
      unit.position.lat,
      unit.position.lon,
      destLat,
      destLon
    );

    // Dynamic scale so representative transoceanic (approx 8,000 km crossing) takes almost exactly 8 ticks
    // Mathematically: distanceKm / 1000 bounds. Say 8000km / 1000 = 8 ticks.
    const totalTravelTicks = Math.max(3, Math.min(15, Math.round(distanceKm / 1000)));

    const currentTick = useWorldStore.getState().currentTick;
    const startTick = currentTick;
    const endTick = currentTick + totalTravelTicks;

    // Generate great-circle path steps for high-fidelity geodesic motion tracing over ticks
    const pathSteps = generateGreatCirclePath(
      unit.position.lat,
      unit.position.lon,
      destLat,
      destLon,
      totalTravelTicks
    );

    const route: UnitRoute = {
      source: { lat: unit.position.lat, lon: unit.position.lon },
      destination: { lat: destLat, lon: destLon },
      startTick: startTick,
      endTick: endTick,
      totalTicks: totalTravelTicks,
      path: pathSteps
    };

    unit.route = route;
    unit.status = 'MOVING';
    unit.missionType = 'PATROL';
    unit.missionTarget = {
      name: destName,
      lat: destLat,
      lon: destLon,
      countryId: targetCountryId
    };
    unit.eta = totalTravelTicks;
    unit.recentActivity = unit.recentActivity || [];
    unit.recentActivity.unshift(`Ordered transoceanic deployment towards: ${destName}. Dist: ${Math.round(distanceKm)} km.`);

    useWorldStore.getState().addGlobalEvent(
      `NAV_LOG: Carrier Strike Group ${unit.name} of ${unit.owner} mobilized under high-priority maritime deployment towards region: [${destName}]. ETA: ${totalTravelTicks} ticks.`,
      'INFO'
    );
  })),

  setStrikeMission: (unitId, targetName, lat, lon, countryId) => set(produce((draft: UnitState) => {
    const unit = draft.units.find((u) => u.id === unitId);
    if (!unit) return;

    unit.status = 'ON_MISSION';
    unit.missionType = 'STRIKE';
    unit.missionTarget = { name: targetName, lat, lon, countryId };
    unit.recentActivity = unit.recentActivity || [];
    unit.recentActivity.unshift(`Locked missile batteries on target: ${targetName} (${countryId || 'AOI'}).`);

    if (unit.type === 'ICBMSilo') {
      unit.missileReadiness = 30; // missile expended, needs reload cooling
    }
  })),

  clearMission: (unitId) => set(produce((draft: UnitState) => {
    const unit = draft.units.find((u) => u.id === unitId);
    if (!unit) return;

    unit.status = 'IDLE';
    unit.missionType = 'NONE';
    unit.missionTarget = null;
    unit.eta = null;
    unit.route = null;
  })),

  updateUnitPositions: (currentTick) => set(produce((draft: UnitState) => {
    draft.units.forEach((unit) => {
      // 1. Recover fuel/readiness parameters over ticks
      if (unit.fuel < 100 && unit.status !== 'MOVING') {
        unit.fuel = Math.min(100, unit.fuel + 4);
      }
      if (unit.health < 100) {
        unit.health = Math.min(100, unit.health + 2); // repairs
      }
      if (unit.type === 'ICBMSilo' && unit.missileReadiness < 100) {
        unit.missileReadiness = Math.min(100, unit.missileReadiness + 10); // reloading
      }

      // 2. Mobile tick progress
      if (unit.status === 'MOVING' && unit.route) {
        const route = unit.route;
        const progressStepsDone = currentTick - route.startTick;

        if (progressStepsDone >= route.totalTicks) {
          // Arrived!
          unit.position = { lat: route.destination.lat, lon: route.destination.lon };
          unit.status = 'DEPLOYED';
          unit.eta = null;
          unit.route = null;
          unit.recentActivity = unit.recentActivity || [];
          unit.recentActivity.unshift(`Success: Arrived at deployment region [${unit.missionTarget?.name}]. Standing by.`);

          if (unit.type === 'CarrierGroup') {
            unit.wakeTrail = unit.wakeTrail || [];
            unit.wakeTrail.push([route.destination.lon, route.destination.lat]);
            if (unit.wakeTrail.length > 12) unit.wakeTrail.shift();
          }

          useWorldStore.getState().addGlobalEvent(
            `NAV_LOG: Carrier Strike Group ${unit.name} of ${unit.owner} has arrived in theatre: [${unit.missionTarget?.name}] and deployed auxiliary radar grids.`,
            'INFO'
          );
        } else {
          // Progress location coords indexing
          unit.eta = route.endTick - currentTick;
          if (unit.fuel > 0) {
            unit.fuel = Math.max(10, unit.fuel - 3);
          }

          // Use the generated step coordinate from our path array
          const stepIndex = progressStepsDone;
          if (route.path && route.path[stepIndex]) {
            const [lon, lat] = route.path[stepIndex];
            unit.position = { lat, lon };

            if (unit.type === 'CarrierGroup') {
              unit.wakeTrail = unit.wakeTrail || [];
              unit.wakeTrail.push([lon, lat]);
              if (unit.wakeTrail.length > 12) unit.wakeTrail.shift();
            }
          } else {
            // fallback: direct interpolate
            const fraction = progressStepsDone / route.totalTicks;
            const [lon, lat] = interpolateGreatCircle(
              route.source.lat,
              route.source.lon,
              route.destination.lat,
              route.destination.lon,
              fraction
            );
            unit.position = { lat, lon };

            if (unit.type === 'CarrierGroup') {
              unit.wakeTrail = unit.wakeTrail || [];
              unit.wakeTrail.push([lon, lat]);
              if (unit.wakeTrail.length > 12) unit.wakeTrail.shift();
            }
          }
        }
      }
    });
  })),

  getUnitsByType: (type) => {
    return get().units.filter((u) => u.type === type);
  },

  getUnitsByOwner: (owner) => {
    return get().units.filter((u) => u.owner === owner);
  },

  getMovingUnits: () => {
    return get().units.filter((u) => u.status === 'MOVING');
  },

  resetUnits: () => set({
    units: [],
    selectedUnitId: null,
    selectedUnitTypeTab: 'CarrierGroup'
  })
}));
