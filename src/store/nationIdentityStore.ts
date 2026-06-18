import { create } from 'zustand';
import { NationMemoryEntry } from './leaderMemoryStore';

export interface SovereignAgendaItem {
  id: string;
  type: 'TERRITORIAL' | 'ECONOMIC' | 'MILITARY' | 'IDEOLOGICAL' | 'NUCLEAR' | 'DIPLOMATIC';
  description: string;
  priority: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  progress: number;        
  playerKnowledge: number; 
  tickInitiated: number;
}

export interface BilateralRelationship {
  withCountryId: string;
  relationshipScore: number;     
  trustLevel: number;            
  grievanceHistory: string[];    
  allianceStatus: 'ALLIED' | 'PARTNER' | 'NEUTRAL' | 'RIVAL' | 'ENEMY';
  activeAgreements: string[];
  outstandingDemands: string[];
}

export interface NationSovereignIdentity {
  countryId: string;
  
  // THE 5 PERMANENT IDENTITY VECTORS
  ideologyIndex: number;       // 0-100: Authoritarian -> Liberal Democratic
  economicModel: number;       // 0-100: Command Economy -> Free Market
  securityDoctrine: number;    // 0-100: Defensive -> Offensive Primacy
  hegemonicAmbition: number;   // 0-100: Isolationist -> Expansionist
  leaderVolatility: number;    // 0-100: Predictable -> Erratic
  
  nationalMood: {
    solidarity: number;        
    belligerence: number;      
    fearFactor: number;        
    grievanceAccumulation: number; 
  };
  
  currentPosture: 'COOPERATIVE' | 'CAUTIOUS' | 'COMPETITIVE' | 'HOSTILE' | 'AGGRESSIVE' | 'DESPERATE';
  
  agenda: SovereignAgendaItem[];
  bilateralRelations: Record<string, BilateralRelationship>;
}

interface NationIdentityStoreState {
  nationIdentities: Record<string, NationSovereignIdentity>;
}

interface NationIdentityStoreActions {
  initializeNationIdentities: (countries: string[]) => void;
  updateNationalMood: (countryId: string, event: 'MILITARY' | 'ECONOMIC_CRISIS' | 'DIPLOMATIC_VICTORY') => void;
  updateAgenda: (countryId: string, agendaItemId: string, progressDelta: number) => void;
  deriveCurrentPosture: (countryId: string) => NationSovereignIdentity['currentPosture'];
  getAgendaFor: (countryId: string) => SovereignAgendaItem[];
  getBilateralRelationship: (countryId: string, targetCountryId: string) => BilateralRelationship;
}

const PRNG = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    return (s = s * 16807 % 2147483647) / 2147483647;
  };
};

export const useNationIdentityStore = create<NationIdentityStoreState & NationIdentityStoreActions>((set, get) => ({
  nationIdentities: {},

  initializeNationIdentities: (countries) => set((state) => {
    const newIdens: Record<string, NationSovereignIdentity> = {};
    const historical: Record<string, Partial<NationSovereignIdentity>> = {
      'US': { ideologyIndex: 85, economicModel: 80, securityDoctrine: 65, hegemonicAmbition: 75, leaderVolatility: 35 },
      'CN': { ideologyIndex: 15, economicModel: 45, securityDoctrine: 70, hegemonicAmbition: 85, leaderVolatility: 25 },
      'RU': { ideologyIndex: 20, economicModel: 40, securityDoctrine: 80, hegemonicAmbition: 75, leaderVolatility: 55 },
      'IR': { ideologyIndex: 10, economicModel: 30, securityDoctrine: 75, hegemonicAmbition: 60, leaderVolatility: 65 },
      'KP': { ideologyIndex: 5, economicModel: 10, securityDoctrine: 90, hegemonicAmbition: 40, leaderVolatility: 85 },
      'IL': { ideologyIndex: 65, economicModel: 70, securityDoctrine: 85, hegemonicAmbition: 55, leaderVolatility: 45 },
      'SA': { ideologyIndex: 25, economicModel: 65, securityDoctrine: 55, hegemonicAmbition: 70, leaderVolatility: 30 },
      'IN': { ideologyIndex: 70, economicModel: 60, securityDoctrine: 60, hegemonicAmbition: 65, leaderVolatility: 40 },
      'PK': { ideologyIndex: 30, economicModel: 35, securityDoctrine: 70, hegemonicAmbition: 35, leaderVolatility: 75 }
    };

    const agendaTemplates: Record<string, SovereignAgendaItem[]> = {
      'CN': [
        { id: 'a1', type: 'TERRITORIAL', description: 'Taiwan Reintegration', priority: 'PRIMARY', progress: 15, playerKnowledge: 100, tickInitiated: 0 },
        { id: 'a2', type: 'MILITARY', description: 'South China Sea Dominance', priority: 'SECONDARY', progress: 40, playerKnowledge: 60, tickInitiated: 0 },
        { id: 'a3', type: 'ECONOMIC', description: 'Belt & Road Pacific Extension', priority: 'PRIMARY', progress: 60, playerKnowledge: 85, tickInitiated: 0 }
      ],
      'RU': [
        { id: 'a1', type: 'TERRITORIAL', description: 'Eastern European Buffer Zone', priority: 'PRIMARY', progress: 30, playerKnowledge: 90, tickInitiated: 0 },
        { id: 'a2', type: 'MILITARY', description: 'NATO Rollback', priority: 'SECONDARY', progress: 10, playerKnowledge: 50, tickInitiated: 0 },
        { id: 'a3', type: 'IDEOLOGICAL', description: 'Eurasian Union Consolidation', priority: 'TERTIARY', progress: 25, playerKnowledge: 40, tickInitiated: 0 }
      ],
      'IR': [
         { id: 'a1', type: 'NUCLEAR', description: 'Threshold Deterrence Capability', priority: 'PRIMARY', progress: 85, playerKnowledge: 70, tickInitiated: 0 },
         { id: 'a2', type: 'DIPLOMATIC', description: 'Sanctions Relief', priority: 'SECONDARY', progress: 10, playerKnowledge: 90, tickInitiated: 0 },
         { id: 'a3', type: 'IDEOLOGICAL', description: 'Regional Shia Crescent', priority: 'PRIMARY', progress: 55, playerKnowledge: 65, tickInitiated: 0 }
      ],
      'KP': [
         { id: 'a1', type: 'NUCLEAR', description: 'ICBM Second-Strike Viability', priority: 'PRIMARY', progress: 65, playerKnowledge: 80, tickInitiated: 0 },
         { id: 'a2', type: 'TERRITORIAL', description: 'Peninsula Unification', priority: 'SECONDARY', progress: 5, playerKnowledge: 100, tickInitiated: 0 },
         { id: 'a3', type: 'MILITARY', description: 'US Force Withdrawal', priority: 'TERTIARY', progress: 0, playerKnowledge: 90, tickInitiated: 0 }
      ],
      'IL': [
         { id: 'a1', type: 'MILITARY', description: 'Iranian Nuclear Interdiction', priority: 'PRIMARY', progress: 50, playerKnowledge: 80, tickInitiated: 0 },
         { id: 'a2', type: 'TERRITORIAL', description: 'West Bank Security', priority: 'SECONDARY', progress: 70, playerKnowledge: 90, tickInitiated: 0 },
         { id: 'a3', type: 'DIPLOMATIC', description: 'Abraham Accords Extension', priority: 'TERTIARY', progress: 40, playerKnowledge: 60, tickInitiated: 0 }
      ],
      'US': [
         { id: 'a1', type: 'MILITARY', description: 'Freedom of Navigation Assurance', priority: 'PRIMARY', progress: 80, playerKnowledge: 100, tickInitiated: 0 },
         { id: 'a2', type: 'DIPLOMATIC', description: 'Democratic Alliance', priority: 'SECONDARY', progress: 60, playerKnowledge: 100, tickInitiated: 0 },
         { id: 'a3', type: 'ECONOMIC', description: 'Supply Chain Resilience', priority: 'TERTIARY', progress: 45, playerKnowledge: 100, tickInitiated: 0 }
      ]
    };

    countries.forEach((cid, i) => {
      const rand = PRNG(cid.charCodeAt(0) + i * 10);
      const hist = historical[cid] || {
        ideologyIndex: Math.floor(rand() * 100),
        economicModel: Math.floor(rand() * 100),
        securityDoctrine: Math.floor(rand() * 100),
        hegemonicAmbition: Math.floor(rand() * 100),
        leaderVolatility: Math.floor(rand() * 100),
      };

      const agenda = agendaTemplates[cid] || [
        { id: 'a1', type: 'ECONOMIC', description: 'Regional Trade Dominance', priority: 'PRIMARY', progress: Math.floor(rand()*50), playerKnowledge: Math.floor(rand()*50), tickInitiated: 0 },
        { id: 'a2', type: 'MILITARY', description: 'Border Security Enhancement', priority: 'SECONDARY', progress: Math.floor(rand()*40), playerKnowledge: Math.floor(rand()*30), tickInitiated: 0 },
        { id: 'a3', type: 'DIPLOMATIC', description: 'Global Relevance Expansion', priority: 'TERTIARY', progress: Math.floor(rand()*30), playerKnowledge: Math.floor(rand()*40), tickInitiated: 0 }
      ];

      newIdens[cid] = {
        countryId: cid,
        ideologyIndex: hist.ideologyIndex!,
        economicModel: hist.economicModel!,
        securityDoctrine: hist.securityDoctrine!,
        hegemonicAmbition: hist.hegemonicAmbition!,
        leaderVolatility: hist.leaderVolatility!,
        nationalMood: {
          solidarity: 50 + Math.floor(rand() * 20),
          belligerence: Math.floor(rand() * 40) + (hist.securityDoctrine! / 4),
          fearFactor: Math.floor(rand() * 30),
          grievanceAccumulation: Math.floor(rand() * 40)
        },
        currentPosture: 'CAUTIOUS',
        agenda,
        bilateralRelations: {}
      };
    });

    return { nationIdentities: { ...state.nationIdentities, ...newIdens } };
  }),

  updateNationalMood: (countryId, event) => set((state) => {
    const iden = state.nationIdentities[countryId];
    if (!iden) return state;
    
    const newMood = { ...iden.nationalMood };
    if (event === 'MILITARY') { newMood.belligerence = Math.min(100, newMood.belligerence + 15); newMood.solidarity = Math.min(100, newMood.solidarity + 10); }
    if (event === 'ECONOMIC_CRISIS') { newMood.fearFactor = Math.min(100, newMood.fearFactor + 25); newMood.solidarity = Math.max(0, newMood.solidarity - 15); }
    if (event === 'DIPLOMATIC_VICTORY') { newMood.solidarity = Math.min(100, newMood.solidarity + 10); newMood.fearFactor = Math.max(0, newMood.fearFactor - 15); }
    
    return {
      nationIdentities: { ...state.nationIdentities, [countryId]: { ...iden, nationalMood: newMood } }
    };
  }),

  updateAgenda: (countryId, agendaItemId, progressDelta) => set((state) => {
    const iden = state.nationIdentities[countryId];
    if (!iden) return state;
    
    return {
      nationIdentities: {
        ...state.nationIdentities,
        [countryId]: {
          ...iden,
          agenda: iden.agenda.map(a => a.id === agendaItemId ? { ...a, progress: Math.max(0, Math.min(100, a.progress + progressDelta)) } : a)
        }
      }
    };
  }),

  deriveCurrentPosture: (countryId) => {
    const iden = get().nationIdentities[countryId];
    if (!iden) return 'CAUTIOUS';
    
    const { belligerence, fearFactor, grievanceAccumulation, solidarity } = iden.nationalMood;
    const { securityDoctrine, leaderVolatility } = iden;
    
    if (fearFactor > 80 && solidarity < 40) return 'DESPERATE';
    if (belligerence > 75 || (securityDoctrine > 80 && grievanceAccumulation > 70)) return 'AGGRESSIVE';
    if (grievanceAccumulation > 60 || belligerence > 50) return 'HOSTILE';
    if (securityDoctrine > 60 || solidarity > 60) return 'COMPETITIVE';
    if (iden.ideologyIndex > 60 && belligerence < 30) return 'COOPERATIVE';
    
    return 'CAUTIOUS';
  },

  getAgendaFor: (countryId) => {
    return get().nationIdentities[countryId]?.agenda || [];
  },

  getBilateralRelationship: (countryId, targetCountryId) => {
    const iden = get().nationIdentities[countryId];
    if (!iden) return { withCountryId: targetCountryId, relationshipScore: 0, trustLevel: 50, grievanceHistory: [], allianceStatus: 'NEUTRAL', activeAgreements: [], outstandingDemands: [] };
    
    return iden.bilateralRelations[targetCountryId] || {
      withCountryId: targetCountryId,
      relationshipScore: 0,
      trustLevel: 50,
      grievanceHistory: [],
      allianceStatus: 'NEUTRAL',
      activeAgreements: [],
      outstandingDemands: []
    };
  }
}));
