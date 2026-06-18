import { create } from 'zustand';
import { produce } from 'immer';
import {
  OversightState, Scandal, LeakEvent, MediaOutlet,
  CongressionalHearing, HearingWitness, HearingTestimony,
  WhistleblowerEvent, InternationalBlowbackEvent, HistoricalEvents,
  PoliticalCapitalPool, ScandalOrigin, LeakSourceType,
  MediaOutletAlignment, HearingType, ScandalTier, ScandalResolutionPath
} from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useConsequenceStore } from './consequenceStore';
import { useRegimePressureStore } from './regimePressureStore';
import { usePsyopStore } from './psyopStore';
import { useCovertFinanceStore } from './covertFinanceStore';
import { useOperativeStore } from './operativeStore';
import { useLeaderMemoryStore } from './leaderMemoryStore';
import { useMirrorStore } from './mirrorStore';
import { useArachneStore } from './arachneStore';
import { useDiplomaticStore } from './diplomaticStore';
import { useEconomyStore } from './economyStore';
import { useSanctionsStore } from './sanctionsStore';
import { useCinematicsStore } from './cinematicsStore';

interface OversightActions {
  initializePoliticalCapital: () => void;
  tickPoliticalCapital: () => void;
  politicalCapitalCheck: (opType: string, pool: PoliticalCapitalPool, threshold: number) => { success: boolean; msg: string };
  
  tickLeakGeneration: () => void;
  generateLeak: (sourceId: string, origin: ScandalOrigin, sourceType: LeakSourceType, classified: boolean, classificationLevel: any) => void;
  publishLeak: (leakId: string) => void;
  
  createScandal: (leakEvent: LeakEvent) => void;
  escalateScandal: (scandalId: string) => void;
  tickScandalDrain: () => void;
  
  initializeMediaOutlets: () => void;
  tickMediaInvestigations: () => void;
  suppressLeak: (leakId: string, method: string) => { success: boolean; msg: string };
  
  generateWhistleblower: (scandalId: string) => void;
  respondToWhistleblower: (whistleblowerId: string, response: any) => void;
  
  checkHearingTrigger: (scandalId: string) => void;
  scheduleHearing: (scandalId: string, hearingType: HearingType) => void;
  conductHearingTick: (hearingId: string) => void;
  resolveHearing: (hearingId: string) => void;
  
  checkInternationalBlowback: (scandalId: string) => void;
  generateBlowback: (scandalId: string, countryId: string) => void;
  resolveInternationalBlowback: (blowbackId: string, method: string) => { success: boolean; msg: string };
  
  playerResolutionAction: (scandalId: string | null, path: string, targetId?: string) => { success: boolean; msg: string };
  
  tickOversight: (currentTick: number) => void;
}

const INITIAL_CAPITAL = {
  DOMESTIC_EXECUTIVE: 85, LEGISLATIVE: 70, INTELLIGENCE_COMMUNITY: 80,
  MILITARY_COMMAND: 75, ALLIED_DIPLOMATIC: 65, PUBLIC_LEGITIMACY: 72
};
const MAX_CAPITAL = {
  DOMESTIC_EXECUTIVE: 100, LEGISLATIVE: 100, INTELLIGENCE_COMMUNITY: 100,
  MILITARY_COMMAND: 100, ALLIED_DIPLOMATIC: 100, PUBLIC_LEGITIMACY: 100
};
const REG_RATES = {
  DOMESTIC_EXECUTIVE: 0.8, LEGISLATIVE: 0.5, INTELLIGENCE_COMMUNITY: 1.0,
  MILITARY_COMMAND: 0.7, ALLIED_DIPLOMATIC: 0.6, PUBLIC_LEGITIMACY: 0.4
};

function generateScandalCodename() {
  const adjectives = ['MIDNIGHT', 'SHADOW', 'BROKEN', 'SILENT', 'GOLDEN', 'DARK', 'DISTANT', 'BURIED', 'FALLEN', 'IRON', 'COPPER', 'BURNED', 'HOLLOW', 'PALE'];
  const nouns = ['ATLAS', 'LEDGER', 'HORIZON', 'ARCHIVE', 'MIRROR', 'CIRCUIT', 'HARVEST', 'MERIDIAN', 'COMPASS', 'ANCHOR', 'LANTERN', 'TOWER', 'BRIDGE'];
  return `OPERATION ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

export const useOversightStore = create<OversightState & OversightActions>((set, get) => ({
  politicalCapital: {
    pools: { ...INITIAL_CAPITAL },
    poolMaxima: { ...MAX_CAPITAL },
    poolRegenerationRates: { ...REG_RATES },
    totalPoliticalCapital: 75,
    isInCrisisMode: false,
    isInCollapseMode: false,
    totalDrainedAllTime: 0
  },
  activeScandals: {}, resolvedScandals: [],
  scandalHistory: { totalScandals: 0, mostDamagingId: null, totalCapitalDrained: 0 },
  pendingLeaks: [], publishedLeaks: [],
  mediaOutlets: {}, activeInvestigations: [],
  activeHearings: {}, completedHearings: [],
  activeWhistleblowers: [], internationalBlowback: [],
  specialCounselActive: false, specialCounselTicksRemaining: null, specialCounselScandalIds: [], specialCounselFindingsPublished: false,
  suppressionBudgetRemaining: 2.0,

  initializePoliticalCapital: () => {
    // Already populated with defaults, could calibrate based on worldStore later
  },

  tickPoliticalCapital: () => {
    set(produce((draft: OversightState) => {
      let isCrisis = false;
      Object.keys(draft.politicalCapital.pools).forEach(p => {
        const pool = p as PoliticalCapitalPool;
        draft.politicalCapital.pools[pool] += draft.politicalCapital.poolRegenerationRates[pool];
        
        Object.values(draft.activeScandals).forEach(scandal => {
           draft.politicalCapital.pools[pool] -= (scandal.politicalCapitalDamagePerTick[pool] || 0);
           draft.politicalCapital.totalDrainedAllTime += (scandal.politicalCapitalDamagePerTick[pool] || 0) / 6; // Rough average
        });

        if (draft.specialCounselActive) draft.politicalCapital.pools[pool] -= 0.5;
        
        draft.politicalCapital.pools[pool] = Math.max(0, Math.min(draft.politicalCapital.pools[pool], draft.politicalCapital.poolMaxima[pool]));
        if (draft.politicalCapital.pools[pool] < 20) isCrisis = true;
      });

      const p = draft.politicalCapital.pools;
      draft.politicalCapital.totalPoliticalCapital = 
        (p.PUBLIC_LEGITIMACY * 0.3) + (p.DOMESTIC_EXECUTIVE * 0.2) + 
        (p.LEGISLATIVE * 0.15) + (p.ALLIED_DIPLOMATIC * 0.15) + 
        (p.INTELLIGENCE_COMMUNITY * 0.12) + (p.MILITARY_COMMAND * 0.08);

      draft.politicalCapital.isInCrisisMode = isCrisis;
      draft.politicalCapital.isInCollapseMode = p.PUBLIC_LEGITIMACY < 10;
    }));
  },

  politicalCapitalCheck: (opType, pool, threshold) => {
    const val = get().politicalCapital.pools[pool];
    if (val >= threshold) return { success: true, msg: '' };
    return { success: false, msg: `Insufficient Political Capital (${pool}). Needed: ${threshold}, Have: ${Math.floor(val)}.` };
  },

  tickLeakGeneration: () => {
    const { generateLeak } = get();
    // In a real implementation we would scan regimePressureStore etc.
    const rpStore = useRegimePressureStore.getState();
    const psStore = usePsyopStore.getState();
    const cfStore = useCovertFinanceStore.getState();
    const opStore = useOperativeStore.getState();
    
    // Regime Pressure Ops
    const coupOps = rpStore.activeCoupOps || {};
    const protestOps = rpStore.activeProtestCampaigns || {};
    const electionOps = rpStore.activeElectionOps || {};

    const checkRpOp = (op: any, type: string) => {
       if (op && op.attributionRisk > 75 && op.isAttributed && Math.random() < 0.08) {
           generateLeak(op.id, 'COVERT_OP_EXPOSED', 'ANONYMOUS_OFFICIAL', false, null);
       }
    };

    Object.values(coupOps).forEach(o => checkRpOp(o, 'COUP'));
    Object.values(protestOps).forEach(o => checkRpOp(o, 'PROTEST'));
    Object.values(electionOps).forEach(o => checkRpOp(o, 'ELECTION'));

    // Psyop Store
    const psCampaigns = psStore.narrativeCampaigns || {};
    Object.values(psCampaigns).forEach(cam => {
       if (cam && cam.discoveryRisk > 80 && cam.playerFingerprint > 50 && Math.random() < 0.08) {
           generateLeak(cam.id, 'PSYOP_ATTRIBUTED', 'INTERCEPT_PUBLISHED', false, null);
       }
    });

    // Covert Finance Shell traces
    if (cfStore.globalTraceLevel > 70 && Math.random() < 0.15) {
       generateLeak(`trace_${Math.floor(Math.random()*1000)}`, 'FINANCIAL_TRACE_LEAKED', 'DOCUMENTS_OBTAINED', true, 'SECRET');
    }
  },

  generateLeak: (sourceId, origin, sourceType, classified, classificationLevel) => {
    set(produce((draft: OversightState) => {
      const outlets = Object.values(draft.mediaOutlets);
      if (outlets.length === 0) return;
      const outlet = outlets[Math.floor(Math.random() * outlets.length)];
      
      let baseDmg = 50;
      if (origin === 'OPERATIVE_TURNED') baseDmg = 70;
      if (origin === 'FOREIGN_INTELLIGENCE_DROP') baseDmg = 80;
      if (classified) baseDmg += 15;
      if (classificationLevel === 'TS_SCI') baseDmg += 20;

      draft.pendingLeaks.push({
        id: `leak_${Math.random().toString(36).substring(2,9)}`,
        sourceOpId: sourceId, scandalOrigin: origin, leakSourceType: sourceType,
        leakerIdentity: Math.random() < 0.5 ? null : 'Deep Source',
        leakerIsOperative: false, leakerOperativeId: null,
        outletPublishingId: outlet.id, tickLeaked: useWorldStore.getState().currentTick,
        classifiedDocumentsExposed: classified, documentClassificationLevel: classificationLevel,
        initialDamageScore: baseDmg, isActive: true, suppressionAttempted: false, suppressionSucceeded: null
      });

      draft.activeInvestigations.push({
         outletId: outlet.id, scandalId: `temp_${Math.random()}`, progressPercent: 0, 
         ticksUntilBreaking: outlet.alignment === 'DOMESTIC_HOSTILE' ? 2 : 4
      });
    }));
  },

  publishLeak: (leakId) => {
    set(produce((draft: OversightState) => {
      const idx = draft.pendingLeaks.findIndex(l => l.id === leakId);
      if (idx === -1) return;
      const leak = draft.pendingLeaks[idx];
      draft.pendingLeaks.splice(idx, 1);
      draft.publishedLeaks.push(leak);
      
      if (leak.documentClassificationLevel === 'TS_SCI') {
         draft.politicalCapital.pools.INTELLIGENCE_COMMUNITY -= 15;
      }
    }));
    const leak = get().publishedLeaks.find(l => l.id === leakId);
    if (leak) get().createScandal(leak);
  },

  createScandal: (leakEvent) => {
    set(produce((draft: OversightState) => {
      const id = `scandal_${Math.random().toString(36).substring(2,9)}`;
      
      let tier: ScandalTier = 'TIER_1_RUMOR';
      if (leakEvent.initialDamageScore > 90) tier = 'TIER_5_HISTORIC';
      else if (leakEvent.initialDamageScore > 70) tier = 'TIER_4_PROVEN';
      else if (leakEvent.initialDamageScore > 50) tier = 'TIER_3_EVIDENCE';
      else if (leakEvent.initialDamageScore > 30) tier = 'TIER_2_ALLEGATION';

      const outlet = draft.mediaOutlets[leakEvent.outletPublishingId];
      const alignment = outlet ? outlet.alignment : 'DOMESTIC_NEUTRAL';

      const dmg = { DOMESTIC_EXECUTIVE: 0, LEGISLATIVE: 0, INTELLIGENCE_COMMUNITY: 0, MILITARY_COMMAND: 0, ALLIED_DIPLOMATIC: 0, PUBLIC_LEGITIMACY: 0 };
      if (tier === 'TIER_1_RUMOR') { Object.keys(dmg).forEach(k => dmg[k as keyof typeof dmg] = 0.3); }
      if (tier === 'TIER_2_ALLEGATION') { Object.keys(dmg).forEach(k => dmg[k as keyof typeof dmg] = 0.8); dmg.PUBLIC_LEGITIMACY = 1.2; }
      if (tier === 'TIER_3_EVIDENCE') { Object.keys(dmg).forEach(k => dmg[k as keyof typeof dmg] = 1.5); dmg.LEGISLATIVE = 2.0; }
      if (tier === 'TIER_4_PROVEN') { Object.keys(dmg).forEach(k => dmg[k as keyof typeof dmg] = 2.5); dmg.PUBLIC_LEGITIMACY = 3.5; dmg.ALLIED_DIPLOMATIC = 3.0; }
      if (tier === 'TIER_5_HISTORIC') { Object.keys(dmg).forEach(k => dmg[k as keyof typeof dmg] = 4.0); }

      draft.activeScandals[id] = {
        id, codename: generateScandalCodename(), origin: leakEvent.scandalOrigin, tier,
        sourceOpIds: [leakEvent.sourceOpId], triggeringLeakId: leakEvent.id, tickBorn: useWorldStore.getState().currentTick,
        tickResolved: null, isActive: true, headlineText: `SCANDAL EXPOSED: ${leakEvent.scandalOrigin.replace(/_/g, ' ')}`,
        outletAlignment: alignment, publicNarrativeSummary: "A new leak threatens the administration's credibility.",
        politicalCapitalDamagePerTick: dmg, totalPoliticalCapitalDrained: 0, publicAwarenessPercent: 10,
        internationalAwarenessPercent: 5, evidenceStrength: leakEvent.initialDamageScore, hasTriggeredHearing: false,
        hearingId: null, hasTriggeredInternationalBlowback: false, blowbackCountryIds: [], cascadedToAllies: false,
        alliesWhoCondemned: [], resolutionPath: null, sacrificedOperativeIds: [], sacrificedCabinetPositions: [],
        activeSuppression: null
      };
      
      draft.scandalHistory.totalScandals++;
      useCinematicsStore.getState().triggerCinematic('SCANDAL_BREAKING', {
         scandalCodename: draft.activeScandals[id].codename, headlineText: draft.activeScandals[id].headlineText,
         outletName: outlet?.name || 'Media', tier, origin: leakEvent.scandalOrigin, documentClassificationLevel: leakEvent.documentClassificationLevel
      });
      useWorldStore.getState().addGlobalEvent(`BREAKING: ${draft.activeScandals[id].headlineText}`, 'CRITICAL');
      
      setTimeout(() => {
          useConsequenceStore.getState().registerScandalConsequence(id, tier, dmg);
      }, 0);
    }));
  },

  escalateScandal: (scandalId) => {
    set(produce((draft: OversightState) => {
       const scandal = draft.activeScandals[scandalId];
       if (!scandal) return;
       const tiers: ScandalTier[] = ['TIER_1_RUMOR', 'TIER_2_ALLEGATION', 'TIER_3_EVIDENCE', 'TIER_4_PROVEN', 'TIER_5_HISTORIC'];
       const idx = tiers.indexOf(scandal.tier);
       if (idx < 4) {
          scandal.tier = tiers[idx+1];
          Object.keys(scandal.politicalCapitalDamagePerTick).forEach(k => scandal.politicalCapitalDamagePerTick[k as keyof typeof scandal.politicalCapitalDamagePerTick] *= 1.5);
       }
       if (scandal.tier === 'TIER_5_HISTORIC') {
          Object.keys(draft.politicalCapital.poolMaxima).forEach(k => Math.max(60, draft.politicalCapital.poolMaxima[k as keyof typeof draft.politicalCapital.poolMaxima] -= 10));
       }
    }));
  },

  tickScandalDrain: () => {
    set(produce((draft: OversightState) => {
       Object.values(draft.activeScandals).forEach(scandal => {
          scandal.publicAwarenessPercent = Math.min(100, scandal.publicAwarenessPercent + 5);
          scandal.internationalAwarenessPercent = Math.min(100, scandal.internationalAwarenessPercent + 2);
          
          if (scandal.publicAwarenessPercent > 40 && scandal.evidenceStrength > 50 && scandal.tier === 'TIER_2_ALLEGATION') get().escalateScandal(scandal.id);
          else if (scandal.publicAwarenessPercent > 65 && scandal.evidenceStrength > 65 && scandal.tier === 'TIER_3_EVIDENCE') get().escalateScandal(scandal.id);
       });
    }));
  },

  initializeMediaOutlets: () => {
    set(produce((draft: OversightState) => {
       for (let i = 0; i < 12; i++) {
          const names = ['The Tribune', 'Global Post', 'National Observer', 'Daily Chronicle', 'The Dispatch', 'World Review'];
          const alignments: MediaOutletAlignment[] = ['DOMESTIC_FRIENDLY', 'DOMESTIC_HOSTILE', 'DOMESTIC_NEUTRAL', 'FOREIGN_WESTERN', 'FOREIGN_ADVERSARIAL', 'INTERNATIONAL_WIRE'];
          const id = `media_${i}`;
          draft.mediaOutlets[id] = {
             id, name: names[i%names.length], alignment: alignments[i%alignments.length],
             investigativeCapacity: Math.floor(Math.random() * 60 + 30), reachScore: Math.floor(Math.random() * 55 + 40),
             credibilityScore: Math.floor(Math.random() * 45 + 50), isCurrentlyInvestigating: false,
             activeInvestigationScandalId: null, bribeAttempted: false, bribeSucceeded: null,
             injunctionFiled: false, injunctionSucceeded: null, ticksUntilPublication: null, countryId: 'US'
          };
       }
    }));
  },

  tickMediaInvestigations: () => {
    set(produce((draft: OversightState) => {
       const toPublish: string[] = [];
       draft.activeInvestigations.forEach(inv => {
          if (!draft.mediaOutlets[inv.outletId]?.injunctionSucceeded) {
             inv.progressPercent += draft.mediaOutlets[inv.outletId].investigativeCapacity * 0.3;
             inv.ticksUntilBreaking -= 1;
             if (inv.ticksUntilBreaking <= 0) {
                 const leak = draft.pendingLeaks.find(l => l.outletPublishingId === inv.outletId);
                 if (leak) toPublish.push(leak.id);
             }
          }
       });
       draft.activeInvestigations = draft.activeInvestigations.filter(i => i.ticksUntilBreaking > 0);
       toPublish.forEach(id => get().publishLeak(id));
    }));
  },

  suppressLeak: (leakId, method) => {
     let success = true; let msg = 'Suppressed successfully.';
     set(produce((draft: OversightState) => {
        const leak = draft.pendingLeaks.find(l => l.id === leakId);
         if (!leak) { success = false; msg = 'Leak not found.'; return; }
         if (method === 'LEGAL_INJUNCTION') {
             if (draft.politicalCapital.pools.LEGISLATIVE >= 40) {
                 draft.suppressionBudgetRemaining -= 0.3;
                 // Delay
                 const inv = draft.activeInvestigations.find(i => i.outletId === leak.outletPublishingId);
                 if (inv) inv.ticksUntilBreaking += 8;
                 draft.mediaOutlets[leak.outletPublishingId].injunctionFiled = true;
             } else {
                 success = false; msg = 'Insufficient Legislative capital.';
             }
         } else if (method === 'BRIBE_OUTLET') {
             if (Math.random() > 0.5) {
                 draft.pendingLeaks = draft.pendingLeaks.filter(l => l.id !== leakId);
             } else {
                 success = false; msg = 'Bribe failed. Crisis escalating.';
                 leak.initialDamageScore += 20;
             }
         } else if (method === 'DENY_AND_ATTACK') {
             msg = 'Denial issued. Public narrative contested.';
         }
     }));
     return { success, msg };
  },

  generateWhistleblower: (scandalId) => {},
  respondToWhistleblower: (wId, resp) => {},

  checkHearingTrigger: (scandalId) => {},
  scheduleHearing: (sId, type) => {},
  conductHearingTick: (hId) => {},
  resolveHearing: (hId) => {},

  checkInternationalBlowback: (scId) => {},
  generateBlowback: (sId, cId) => {},
  resolveInternationalBlowback: (bId, m) => { return { success: true, msg: 'Resolved.' }; },

  playerResolutionAction: (scandalId, path, targetId) => {
     set(produce((draft: OversightState) => {
         if (path === 'SCAPEGOAT_SACRIFICE' && scandalId) {
             const sc = draft.activeScandals[scandalId];
             if (sc) {
                 if (sc.tier === 'TIER_3_EVIDENCE' || sc.tier === 'TIER_2_ALLEGATION') sc.tier = 'TIER_1_RUMOR';
                 sc.publicAwarenessPercent = Math.max(0, sc.publicAwarenessPercent - 20);
             }
         }
     }));
     return { success: true, msg: `${path} executed.` };
  },

  tickOversight: (currentTick) => {
    const s = get();
    s.tickPoliticalCapital();
    s.tickLeakGeneration();
    s.tickMediaInvestigations();
    s.tickScandalDrain();
    
    // Auto-init media if empty
    if (Object.keys(s.mediaOutlets).length === 0) s.initializeMediaOutlets();

    // Check political collapse
    if (s.politicalCapital.isInCollapseMode) {
       // Suspend ops, etc.
    }
  }
}));
