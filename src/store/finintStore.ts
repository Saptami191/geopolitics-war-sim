import { create } from 'zustand';
import { produce } from 'immer';
import { 
  FinancialActor, 
  ShellEntity, 
  JurisdictionProfile, 
  CoerciveFinancialAction, 
  FinancialActionPreview, 
  FinancialIncident, 
  FinancialCoercionType
} from '../types/finint';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useArachneStore } from './arachneStore';
import { queueBusEvent } from '../sim/eventBus/dispatcher';
import { createBusEvent } from '../sim/eventBus/eventFactories';

interface FinintState {
  actors: FinancialActor[];
  shells: ShellEntity[];
  jurisdictions: JurisdictionProfile[];
  activeActions: CoerciveFinancialAction[];
  incidentsLog: FinancialIncident[];
  
  // Dynamic metrics of aggregated global blowback (0-100%)
  legitimacyDrain: number; 
  paymentFragmentationRisk: number;
  dollarDominanceErosion: number;
  globalAggregatedBlowback: number;

  // Selected entities for dossier detail panels
  selectedActorId: string | null;
  selectedJurisdictionId: string | null;
  selectedSidebarTab: 'capital' | 'jurisdictions' | 'coercion';
}

interface FinintActions {
  setSelectedActorId: (id: string | null) => void;
  setSelectedJurisdictionId: (id: string | null) => void;
  setSelectedSidebarTab: (tab: 'capital' | 'jurisdictions' | 'coercion') => void;
  
  // Coercion operations
  calculateFinancialPreview: (
    actionType: FinancialCoercionType,
    targetCountryId: string,
    targetActorId?: string,
    intensity?: number
  ) => FinancialActionPreview;

  executeFinancialAction: (
    actionType: FinancialCoercionType,
    targetCountryId: string,
    targetActorId?: string,
    intensity?: number
  ) => void;

  toggleShellStatus: (shellId: string) => void;
  updateJurisdictionCooperation: (jurisdictionId: string, value: number) => void;
  tickFinint: (currentTick: number) => void;
}

// Seeded Strategic Geopolitical Financial Scenarios
const SEEDED_ACTORS: FinancialActor[] = [
  {
    id: 'volkov_holding',
    name: 'Viktor Volkov (Siberian Steel Oligarch)',
    actorType: 'oligarch',
    linkedCountryId: 'RU',
    associatedSanctionStatus: 'PRIMARY_SANCTIONS',
    visibilityScore: 45,
    capitalWeight: 4200, // $4.2B estimated network
    jurisdictionIds: ['cyprus', 'cayman'],
    networkRole: 'Shadow Military Metals Sourcing & Real Estate',
    knownExposureLevel: 80,
    plausibleDeniabilityIndex: 30
  },
  {
    id: 'wong_procure',
    name: 'Wong Kin-Long (Dual-Use Electronics Broker)',
    actorType: 'covert_broker',
    linkedCountryId: 'CN',
    associatedSanctionStatus: 'MONITORED',
    visibilityScore: 85,
    capitalWeight: 1450, // $1.45B shadow pool
    jurisdictionIds: ['cayman', 'seychelles'],
    networkRole: 'Covert ASML Component Purchasing & Hardware Evasion',
    knownExposureLevel: 35,
    plausibleDeniabilityIndex: 75
  },
  {
    id: 'caracas_sovereign',
    name: 'Venz-Bolivar Sovereign Trust Fund',
    actorType: 'sovereign_wealth_fund',
    linkedCountryId: 'FR', // Hosted or routed via France/Europe reserves
    associatedSanctionStatus: 'MONITORED',
    visibilityScore: 20,
    capitalWeight: 9400, // $9.4B formal reserves
    jurisdictionIds: ['switzerland'],
    networkRole: 'State Petroleum Clearing Platform',
    knownExposureLevel: 95,
    plausibleDeniabilityIndex: 15
  },
  {
    id: 'kremlin_central',
    name: 'GosBank Federal Clearing Authority',
    actorType: 'central_bank',
    linkedCountryId: 'RU',
    associatedSanctionStatus: 'PRIMARY_SANCTIONS',
    visibilityScore: 10,
    capitalWeight: 125000, // $125B external capital weight
    jurisdictionIds: ['switzerland', 'cyprus'],
    networkRole: 'Sovereign Clearing & Foreign Exchanges reserves',
    knownExposureLevel: 100,
    plausibleDeniabilityIndex: 5
  },
  {
    id: 'sudan_gold',
    name: 'Al-Ababeel Mining Operations Vehicle',
    actorType: 'proxy_vehicle',
    linkedCountryId: 'UA', // Complex geopolitical proxy links
    associatedSanctionStatus: 'NONE',
    visibilityScore: 70,
    capitalWeight: 890, // $890M estimated raw liquidity
    jurisdictionIds: ['seychelles'],
    networkRole: 'Artisanal Gold Laundering & Anti-Sanction Clearing',
    knownExposureLevel: 15,
    plausibleDeniabilityIndex: 80
  }
];

const SEEDED_JURISDICTIONS: JurisdictionProfile[] = [
  {
    id: 'cayman',
    name: 'Cayman Islands Offshore Territory',
    secrecyRating: 'HIGH',
    compliancePosture: 'PARTIALLY_COOPERATIVE',
    enforcementRisk: 30, // Low direct enforcement risk
    attractivenessForShells: 95,
    sovereignShieldingPower: 60, // Protected indirectly by UK status
    currentCooperationMultiplier: 50
  },
  {
    id: 'cyprus',
    name: 'Republic of Cyprus Sector (EU)',
    secrecyRating: 'HIGH',
    compliancePosture: 'PARTIALLY_COOPERATIVE',
    enforcementRisk: 65, // Subject to EU directives
    attractivenessForShells: 85,
    sovereignShieldingPower: 70,
    currentCooperationMultiplier: 60
  },
  {
    id: 'switzerland',
    name: 'Berne Clearing Syndicate (Neutral)',
    secrecyRating: 'MEDIUM',
    compliancePosture: 'HIGHLY_COOPERATIVE',
    enforcementRisk: 85, // Highly strictly enforced legal mechanisms
    attractivenessForShells: 40,
    sovereignShieldingPower: 90,
    currentCooperationMultiplier: 85
  },
  {
    id: 'seychelles',
    name: 'Seychelles Archipelago Registry',
    secrecyRating: 'HIGH',
    compliancePosture: 'NON_COMPLIANT',
    enforcementRisk: 15, // Virtually immune to remote legal commands
    attractivenessForShells: 98,
    sovereignShieldingPower: 10, // Small sovereign footprint
    currentCooperationMultiplier: 25
  },
  {
    id: 'uk_city',
    name: 'London Square-Mile Trust Syndicate',
    secrecyRating: 'LOW',
    compliancePosture: 'HIGHLY_COOPERATIVE',
    enforcementRisk: 95,
    attractivenessForShells: 15,
    sovereignShieldingPower: 98, // Extreme sovereign backstop
    currentCooperationMultiplier: 95
  }
];

const SEEDED_SHELLS: ShellEntity[] = [
  {
    id: 'aethelgard_ltd',
    name: 'Aethelgard Maritime Holdings S.A.',
    linkedActorId: 'volkov_holding',
    jurisdictionId: 'cyprus',
    secrecyLevel: 75,
    assetClasses: ['Bulk Grain Freighters', 'Belgian Real Estate Portfolio'],
    exposureRisk: 65,
    status: 'FLAGGED',
    linkedRoutes: ['food-ru-eg'] // Interacts with Egypt grain shipments
  },
  {
    id: 'oceanic_vantage',
    name: 'Oceanic Vantage Semiconductors Fund',
    linkedActorId: 'wong_procure',
    jurisdictionId: 'cayman',
    secrecyLevel: 80,
    assetClasses: ['Silvaco Chip-Fab Options', 'EU Tech Shell Equities'],
    exposureRisk: 40,
    status: 'ACTIVE',
    linkedRoutes: ['semi-tw-us', 'rare-cn-us']
  },
  {
    id: 'krypton_trade',
    name: 'Krypton Global Procurement Vehicle',
    linkedActorId: 'volkov_holding',
    jurisdictionId: 'seychelles',
    secrecyLevel: 95,
    assetClasses: ['Titanium Forging Deposits', 'Physical Gold Bullion'],
    exposureRisk: 15,
    status: 'ACTIVE',
    linkedRoutes: ['strat-ru-us']
  },
  {
    id: 'gosbank_shadow_1',
    name: 'Crescent Moon Alpha Clearing Ltd',
    linkedActorId: 'kremlin_central',
    jurisdictionId: 'cyprus',
    secrecyLevel: 90,
    assetClasses: ['Foreign exchange swaps', 'Digital stablecoin reserves'],
    exposureRisk: 85,
    status: 'FLAGGED',
    linkedRoutes: ['oil-sa-jp']
  }
];

export const useFinintStore = create<FinintState & FinintActions>((set, get) => ({
  actors: SEEDED_ACTORS,
  jurisdictions: SEEDED_JURISDICTIONS,
  shells: SEEDED_SHELLS,
  activeActions: [],
  incidentsLog: [
    {
      tick: 1,
      actorId: 'system',
      actionType: 'DISCOVERY',
      title: 'CYPRIOT SHADOW NET EXPOSED',
      summary: 'Arachne signals suspect high-yield metal acquisitions routed via Aethelgard Maritime Holdings. High probability Volkov proxy.',
      severity: 'WARNING'
    }
  ],

  legitimacyDrain: 15,
  paymentFragmentationRisk: 18,
  dollarDominanceErosion: 10,
  globalAggregatedBlowback: 14,

  selectedActorId: null,
  selectedJurisdictionId: null,
  selectedSidebarTab: 'capital',

  setSelectedActorId: (id) => set({ selectedActorId: id, selectedJurisdictionId: null }),
  setSelectedJurisdictionId: (id) => set({ selectedJurisdictionId: id, selectedActorId: null }),
  setSelectedSidebarTab: (tab) => set({ selectedSidebarTab: tab }),

  calculateFinancialPreview: (actionType, targetCountryId, targetActorId, intensity = 50) => {
    const { actors, jurisdictions } = get();
    const actor = targetActorId ? actors.find(a => a.id === targetActorId) : null;
    
    let baseStrength = intensity;
    let baseAllianceDiscomfort = 0;
    let baseLegitimacyDrain = 0;
    let basePaymentFrag = 0;
    let baseDominanceErode = 0;
    
    let firstOrderFinancialImpact = '';
    let firstOrderStrategicRetaliationRisk = '';

    // Calculate baseline profiles by Coercion Tool Category
    switch (actionType) {
      case 'ASSET_FREEZE': {
        baseAllianceDiscomfort = Math.round(intensity * 0.4);
        baseLegitimacyDrain = Math.round(intensity * 0.3);
        basePaymentFrag = Math.round(intensity * 0.2);
        baseDominanceErode = Math.round(intensity * 0.25);
        
        const nameLabel = actor ? actor.name : `${targetCountryId} assets`;
        firstOrderFinancialImpact = `Complete seizure and freeze of matching correspondent custody reserves linked with ${nameLabel}. Eliminates shadow spending capabilities instantly.`;
        firstOrderStrategicRetaliationRisk = `Target sovereign and allied networks may retaliate via targeted asymmetric cyber campaigns against local clearing banks.`;
        break;
      }
      case 'RESERVE_ATTACK': {
        // High-intensity financial assault on Central Bank or sovereign funds
        baseAllianceDiscomfort = Math.round(intensity * 0.82);
        baseLegitimacyDrain = Math.round(intensity * 0.95);
        basePaymentFrag = Math.round(intensity * 0.7);
        baseDominanceErode = Math.round(intensity * 0.85);

        firstOrderFinancialImpact = `Direct attack on target central clearing assets. Strips liquidity to support the target nation's currency, causing massive retail inflation of +50%.`;
        firstOrderStrategicRetaliationRisk = `Extremely high. May trigger complete physical expropriation of national corporate properties located in target territory.`;
        break;
      }
      case 'DEBT_PRESSURE': {
        baseAllianceDiscomfort = Math.round(intensity * 0.3);
        baseLegitimacyDrain = Math.round(intensity * 0.4);
        basePaymentFrag = Math.round(intensity * 0.1);
        baseDominanceErode = Math.round(intensity * 0.15);

        firstOrderFinancialImpact = `Triggers immediate sovereign rating downgrades. Drives secondary rollover loan yields past +14%, choking off state municipal debt.`;
        firstOrderStrategicRetaliationRisk = `Target defaults on trade obligations with key allies, hurting allied commercial shipping banks.`;
        break;
      }
      case 'SWIFT_EXCLUSION': {
        baseAllianceDiscomfort = Math.round(intensity * 0.7);
        baseLegitimacyDrain = Math.round(intensity * 0.65);
        basePaymentFrag = Math.round(intensity * 0.95); // Extremely high de-dollarization threat
        baseDominanceErode = Math.round(intensity * 0.75);

        firstOrderFinancialImpact = `Complete cutoff from standard messaging. All cross-border trade transactions are delayed indefinitely, forcing reliance on raw trade-barter.`;
        firstOrderStrategicRetaliationRisk = `Forces target heavily into non-standard alternative platforms (CIPS/SPFS), permanently fragmenting Western central bank leverage.`;
        break;
      }
    }

    // Dynamic adjustment based on selected Actor's visibility or Plausible Deniability
    if (actor) {
      if (actor.visibilityScore > 60) {
        // Highly hidden hidden actor being pursued. High intelligence compromise cost!
        baseLegitimacyDrain += 12;
      }
      if (actor.plausibleDeniabilityIndex > 50) {
        // Strong deniability makes it politically very aggressive to attack
        baseAllianceDiscomfort += 15;
        baseLegitimacyDrain += 18;
      }
    }

    const cumulativeBlowback = Math.round((baseAllianceDiscomfort + baseLegitimacyDrain + basePaymentFrag + baseDominanceErode) / 4);

    return {
      actionType,
      targetCountryId,
      targetActorId,
      intendedStrength: intensity,
      expectedLeverageLevel: Math.round(intensity * 1.1),
      allianceDiscomfortPenalty: Math.min(100, baseAllianceDiscomfort),
      reputationalErosion: Math.min(100, baseLegitimacyDrain),
      paymentFragmentationRisk: Math.min(100, basePaymentFrag),
      dollarDominanceErosion: Math.min(100, baseDominanceErode),
      expectedTotalBlowback: Math.min(100, cumulativeBlowback),
      firstOrderFinancialImpact,
      firstOrderStrategicRetaliationRisk,
      confidenceScore: actor && actor.visibilityScore < 30 ? 'HIGH' : 'MEDIUM'
    };
  },

  executeFinancialAction: (actionType, targetCountryId, targetActorId, intensity = 50) => {
    set(produce((draft: FinintState) => {
      const currentTick = useWorldStore.getState().currentTick;
      const playerCountryId = usePlayerStore.getState().countryId || 'US';
      const actorObj = targetActorId ? draft.actors.find(a => a.id === targetActorId) : null;

      // 1. Calculate and add current exposure metrics
      const preview = get().calculateFinancialPreview(actionType, targetCountryId, targetActorId, intensity);
      
      draft.legitimacyDrain = Math.min(100, draft.legitimacyDrain + Math.round(preview.reputationalErosion * 0.35));
      draft.paymentFragmentationRisk = Math.min(100, draft.paymentFragmentationRisk + Math.round(preview.paymentFragmentationRisk * 0.3));
      draft.dollarDominanceErosion = Math.min(100, draft.dollarDominanceErosion + Math.round(preview.dollarDominanceErosion * 0.25));

      // 2. Track action inside active coercive state list
      const actionObj: CoerciveFinancialAction = {
        id: `finAction-${actionType}-${targetCountryId}-${currentTick}`,
        type: actionType,
        actorCountryId: playerCountryId,
        targetCountryId,
        targetActorId,
        intensityScore: intensity,
        activeTick: currentTick
      };
      
      draft.activeActions.push(actionObj);

      // 3. Dynamic secondary effects on actors and jurisdictions
      if (actorObj) {
        actorObj.associatedSanctionStatus = actionType === 'ASSET_FREEZE' ? 'FROZEN_ASSETS' : 'SECONDARY_REDUX';
        actorObj.knownExposureLevel = Math.min(100, actorObj.knownExposureLevel + 20);
        
        // Find matching shell companies of the actor and flag or freeze them too
        draft.shells.forEach(shell => {
          if (shell.linkedActorId === actorObj.id) {
            shell.status = actionType === 'ASSET_FREEZE' ? 'FROZEN' : 'FLAGGED';
            shell.exposureRisk = Math.min(100, shell.exposureRisk + 30);
          }
        });
      }

      // Add high level diagnostic summary event
      const actorNameLabel = actorObj ? actorObj.name : `Sovereign clearing of ${targetCountryId}`;
      const newIncident: FinancialIncident = {
        tick: currentTick,
        actorId: targetActorId || targetCountryId,
        actionType,
        title: `COERCIVE WEAPON DEPLOYED: [${actionType}]`,
        summary: `Coercive financial actions initiated by ${playerCountryId} targeting ${actorNameLabel}. Operational strength rated at ${intensity}/100. Expected leverage is high.`,
        severity: 'CRITICAL'
      };

      draft.incidentsLog.unshift(newIncident);

      // 4. Integrate with canonical world state event system & Arachne
      try {
        useWorldStore.setState(produce((worldDraft) => {
          let eventType: any = 'ECONOMIC_SANCTION_APPLIED'; // Map to appropriate Event Bus signature
          if (actionType === 'ASSET_FREEZE') eventType = 'ECONOMIC_SANCTION_APPLIED';
          else if (actionType === 'SWIFT_EXCLUSION') eventType = 'ECONOMIC_STRESS_CHANGED';
          else eventType = 'ENERGY_SUPPLY_DISRUPTED';

          const busEvt = createBusEvent({
            type: eventType,
            category: 'ECONOMIC',
            sourceSystem: playerCountryId,
            sourceEntityType: 'COUNTRY',
            sourceEntityId: playerCountryId,
            targetEntityType: 'COUNTRY',
            targetEntityIds: [targetCountryId],
            tick: currentTick,
            severity: 'CRITICAL',
            title: `FINANT STRATEGIC ATTACK: [${actionType}]`,
            summary: `Financial weapons deployed inside international clearing registries. Stripping access pools for ${actorNameLabel}.`
          });
          queueBusEvent(worldDraft.world, busEvt);
        }));

        useArachneStore.getState().addLiveIntelItem({
          title: `FINANCIAL CORRIDOR INTERDICTION COMMITTED`,
          summary: `SWIFT registries reports unilateral routing exclusion applied targeting ${actorNameLabel}. Monetary friction rising.`,
          themeTags: ['SANCTIONS'],
          urgency: 'HIGH',
          confidence: 'TOTAL',
          alertScore: 75,
          briefingCategory: 'ACTIVE_WATCH'
        });
      } catch (err) {
        console.warn('[FININT] Failed to send actions outward to systems:', err);
      }
    }));
  },

  toggleShellStatus: (shellId) => {
    set(produce((draft: FinintState) => {
      const shell = draft.shells.find(s => s.id === shellId);
      if (shell) {
        shell.status = shell.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
        const currentTick = useWorldStore.getState().currentTick;
        draft.incidentsLog.unshift({
          tick: currentTick,
          actorId: shellId,
          actionType: 'EXCLOSURE',
          title: `SHELL ASSET STATUS MODIFIED`,
          summary: `Control registries shifted offshore shell entity ${shell.name} status to ${shell.status}.`,
          severity: 'INFO'
        });
      }
    }));
  },

  updateJurisdictionCooperation: (jurisdictionId, value) => {
    set(produce((draft: FinintState) => {
      const jur = draft.jurisdictions.find(j => j.id === jurisdictionId);
      if (jur) {
        jur.currentCooperationMultiplier = value;
        // High cooperation posture lowers shell attractiveness
        jur.attractivenessForShells = Math.max(10, Math.round(95 - (value * 0.7)));
        jur.enforcementRisk = Math.min(100, Math.round(25 + (value * 0.75)));
      }
    }));
  },

  tickFinint: (currentTick) => {
    set(produce((draft: FinintState) => {
      // 1. Decay global exposure-risk over time if no new actions are taken
      if (draft.legitimacyDrain > 5) draft.legitimacyDrain -= 0.3;
      if (draft.paymentFragmentationRisk > 5) draft.paymentFragmentationRisk -= 0.15;
      if (draft.dollarDominanceErosion > 5) draft.dollarDominanceErosion -= 0.1;

      // Aggregated score
      draft.globalAggregatedBlowback = Math.round(
        (draft.legitimacyDrain + draft.paymentFragmentationRisk + draft.dollarDominanceErosion) / 3
      );

      // Decay duration of custom active actions or periodically trigger events
      if (currentTick % 8 === 0) {
        // Randomly simulate an offshore leakage report / discovery rumor
        const availableShells = draft.shells.filter(s => s.status === 'ACTIVE');
        if (availableShells.length > 0) {
          const randShell = availableShells[Math.floor(Math.random() * availableShells.length)];
          if (Math.random() > 0.45) {
            randShell.status = 'FLAGGED';
            randShell.exposureRisk = Math.min(100, randShell.exposureRisk + 25);
            draft.incidentsLog.unshift({
              tick: currentTick,
              actorId: randShell.id,
              actionType: 'DISCOVERY',
              title: `BENEFICIAL OWNER INFORMATION LEAK`,
              summary: `Leaks expose beneficial owners of ${randShell.name} inside the ${randShell.jurisdictionId} jurisdiction. Discoverability elevated.`,
              severity: 'WARNING'
            });
            
            try {
              useArachneStore.getState().addLiveIntelItem({
                title: `OFFSHORE DIRECTORY LEAK DETECTED`,
                summary: `Substantial files leaks decrypt shelter entities. Flagged beneficial node: ${randShell.name}.`,
                themeTags: ['COVERT_RISK'],
                urgency: 'MEDIUM',
                confidence: 'MEDIUM',
                alertScore: 55,
                briefingCategory: 'ACTIVE_WATCH'
              });
            } catch(e) {}
          }
        }
      }
    }));
  }
}));
