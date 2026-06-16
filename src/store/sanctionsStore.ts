import { create } from 'zustand';
import { produce } from 'immer';
import { 
  SanctionsCampaign, 
  SanctionsTierType, 
  SanctionsMeasure, 
  CoalitionMemberCommitment, 
  EvasionChannel, 
  SanctionTargetProfile, 
  SanctionsPreview, 
  SanctionsIncident 
} from '../types/sanctions';
import { useWorldStore } from './worldStore';
import { useArachneStore } from './arachneStore';
import { usePlayerStore } from './playerStore';

// ALL CANONICAL MEASURES WITH BASELINE IMPACTS
export const ALL_MEASURES: SanctionsMeasure[] = [
  {
    id: 'MEASURE_ELITE_DESIG',
    name: 'Oligarch & Elite Designation',
    tier: 'TIER_1_TARGETED',
    description: 'Targeted individual travel bans, personal asset listing, and isolation of leadership networks.',
    coerciveImpact: 8,
    blowbackCost: 1,
    riskOfRetaliation: 5,
    isActive: true
  },
  {
    id: 'MEASURE_ASSET_FREEZE',
    name: 'Targeted Sovereign Asset Freezes',
    tier: 'TIER_1_TARGETED',
    description: 'Holding of foreign-registered state assets, real estate property, and sovereign trust accounts.',
    coerciveImpact: 15,
    blowbackCost: 2,
    riskOfRetaliation: 12,
    isActive: true
  },
  {
    id: 'MEASURE_TECH_EXPORT',
    name: 'High-Tech & Semiconductor Export Controls',
    tier: 'TIER_2_SECTORAL',
    description: 'Export blockades on dual-use processors, robotics, high-grade aircraft parts, and industrial chips.',
    coerciveImpact: 35,
    blowbackCost: 10,
    riskOfRetaliation: 30,
    isActive: true
  },
  {
    id: 'MEASURE_ENERGY_IMPORT_BAN',
    name: 'Fossil Hydrocarbon Import Bans',
    tier: 'TIER_2_SECTORAL',
    description: 'Banning pipeline gas, liquefied natural gas (LNG), coal, and crude shipments from target territory.',
    coerciveImpact: 55,
    blowbackCost: 28,
    riskOfRetaliation: 75,
    isActive: true
  },
  {
    id: 'MEASURE_FIN_SWIFT_CUT',
    name: 'Exclusion from Switft Banking Rail',
    tier: 'TIER_3_FINANCIAL_TRADE',
    description: 'Disconnection of major target commercial banking institutions from global financial messaging networks.',
    coerciveImpact: 75,
    blowbackCost: 15,
    riskOfRetaliation: 90,
    isActive: true
  },
  {
    id: 'MEASURE_CENTRAL_BANK_FREEZE',
    name: 'Central Bank Capital Sanitization',
    tier: 'TIER_3_FINANCIAL_TRADE',
    description: 'Surgical freezing of central bank domestic accounts, gold bullion clearing pipelines, and liquid bond holdings.',
    coerciveImpact: 85,
    blowbackCost: 18,
    riskOfRetaliation: 110,
    isActive: true
  },
  {
    id: 'MEASURE_TOTAL_EXCLUSION',
    name: 'All-Sector Systemic Isolation & Secondary Blockade',
    tier: 'TIER_4_TOTAL_EXCLUSION',
    description: 'Near-comprehensive embargo with mandatory secondary sanctions enforcement on non-aligned swing partners.',
    coerciveImpact: 98,
    blowbackCost: 60,
    riskOfRetaliation: 150,
    isActive: true
  }
];

interface SanctionsStore {
  campaigns: Record<string, SanctionsCampaign>;
  incidents: SanctionsIncident[];
  selectedCampaignId: string | null;
  activeMapOverlay: string; // 'NONE' | 'PRESSURE' | 'FATIGUE' | 'EVASION'

  setSelectedCampaignId: (id: string | null) => void;
  setActiveMapOverlay: (overlay: string) => void;

  // Actions
  proposeCampaign: (
    name: string,
    initiatorId: string,
    targetIds: string[],
    legitimacy: 'HUMANITARIAN' | 'DEFENSIVE' | 'ALLIANCE_SOLIDARITY' | 'LAW_ENFORCEMENT' | 'UNILATERAL_PRESSURE',
    justification: string
  ) => void;

  assembleCoalitionSupport: (campaignId: string) => void;
  toggleMeasure: (campaignId: string, measureId: string) => void;
  escalateCampaignTier: (campaignId: string, tier: SanctionsTierType) => void;
  influenceCoalitionMember: (campaignId: string, countryId: string, policy: 'DIPLOMATIC_SWEETENER' | 'PUBLIC_PRESSURE' | 'COERCION') => void;
  
  // Dynamic evasion triggers
  deployEvasionChannel: (campaignId: string, channel: Omit<EvasionChannel, 'id' | 'activeSinceTick' | 'isShutDown'>) => void;
  shutDownEvasionChannel: (campaignId: string, channelId: string) => void;

  // Previews
  calculatePreview: (initiatorId: string, targetIds: string[], tier: SanctionsTierType, activeMeasureIds: string[]) => SanctionsPreview;

  // Game ticks
  tickSanctionsSystem: (currentTick: number) => void;
  clearAll: () => void;
}

// INITIAL SEEDED CAMPAIGNS FOR FULL SPECIFICATION COMPLIANCE
const initializeSeededCampaigns = (): Record<string, SanctionsCampaign> => {
  return {
    'campaign_ru_exclusion': {
      id: 'campaign_ru_exclusion',
      name: 'Operation Boreas: Comprehensive Arctic Exclusion',
      initiatorCountryId: 'US',
      targetCountryIds: ['RU'],
      status: 'ACTIVE',
      campaignTier: 'TIER_3_FINANCIAL_TRADE',
      activeMeasures: ['MEASURE_ELITE_DESIG', 'MEASURE_ASSET_FREEZE', 'MEASURE_TECH_EXPORT', 'MEASURE_ENERGY_IMPORT_BAN', 'MEASURE_CENTRAL_BANK_FREEZE'],
      coalitionSupportScore: 78,
      legitimacyPosture: 'DEFENSIVE',
      targetPressureScore: 65,
      sanctionerBlowbackScore: 42,
      allyFatigueScore: 48,
      complianceStrength: 72,
      evasionIntensity: 35,
      startTick: 12,
      lastUpdatedTick: 48,
      publicJustification: 'Containment of rogue Arctic expansionism and central bank asset freezes supporting buffer zones.',
      members: {
        'US': {
          countryId: 'US',
          role: 'LEAD_SPONSOR',
          alignmentAffinity: 100,
          economicExposureToTarget: 12,
          domesticSatisfactionImpact: 15,
          allyFatigueLevel: 5,
          participationWillingness: 100,
          isParticipating: true
        },
        'GB': {
          countryId: 'GB',
          role: 'FULL_PARTICIPANT',
          alignmentAffinity: 95,
          economicExposureToTarget: 18,
          domesticSatisfactionImpact: 20,
          allyFatigueLevel: 10,
          participationWillingness: 98,
          isParticipating: true
        },
        'FR': {
          countryId: 'FR',
          role: 'RELUCTANT_PARTICIPANT',
          alignmentAffinity: 82,
          economicExposureToTarget: 44,
          domesticSatisfactionImpact: 35,
          allyFatigueLevel: 58,
          participationWillingness: 72,
          isParticipating: true
        },
        'DE': {
          countryId: 'DE',
          role: 'RELUCTANT_PARTICIPANT',
          alignmentAffinity: 80,
          economicExposureToTarget: 68,
          domesticSatisfactionImpact: 52,
          allyFatigueLevel: 68, // Visible Ally Fatigue seeded
          participationWillingness: 65,
          isParticipating: true
        },
        'IN': {
          countryId: 'IN',
          role: 'PARTIAL_COMPLIANT',
          alignmentAffinity: 55,
          economicExposureToTarget: 75,
          domesticSatisfactionImpact: 10,
          allyFatigueLevel: 25,
          participationWillingness: 48,
          isParticipating: true
        },
        'CN': {
          countryId: 'CN',
          role: 'SPOILER_BLOCKER',
          alignmentAffinity: 15,
          economicExposureToTarget: 80,
          domesticSatisfactionImpact: 0,
          allyFatigueLevel: 0,
          participationWillingness: 5,
          isParticipating: false
        }
      },
      evasionChannels: [
        {
          id: 'evasion_gray_mkt_crude',
          name: 'Gray Market Seaborne Transshipments (Urals Crude)',
          type: 'GRAY_MARKET',
          partnerCountryId: 'IN', // target adapting via gray markets
          capacityMtoeOrValueB: 24,
          enforcementLeakagePct: 62,
          activeSinceTick: 15,
          isShutDown: false
        }
      ]
    },
    'campaign_cn_technology': {
      id: 'campaign_cn_technology',
      name: 'Pacific Semiconductor Containment Ring (PSCR)',
      initiatorCountryId: 'US',
      targetCountryIds: ['CN'],
      status: 'ASSEMBLING', // One shaky coalition under construction
      campaignTier: 'TIER_1_TARGETED',
      activeMeasures: ['MEASURE_ELITE_DESIG', 'MEASURE_TECH_EXPORT'],
      coalitionSupportScore: 42,
      legitimacyPosture: 'DEFENSIVE',
      targetPressureScore: 24,
      sanctionerBlowbackScore: 18,
      allyFatigueScore: 12,
      complianceStrength: 45,
      evasionIntensity: 62,
      startTick: 32,
      lastUpdatedTick: 48,
      publicJustification: 'Defensive encirclement of microelectronic lithography nodes and supply logistics protection.',
      members: {
        'US': {
          countryId: 'US',
          role: 'LEAD_SPONSOR',
          alignmentAffinity: 100,
          economicExposureToTarget: 38,
          domesticSatisfactionImpact: 10,
          allyFatigueLevel: 0,
          participationWillingness: 100,
          isParticipating: true
        },
        'JP': {
          countryId: 'JP',
          role: 'RELUCTANT_PARTICIPANT', // shaky reluctant participant
          alignmentAffinity: 78,
          economicExposureToTarget: 74, // High exposure makes them nervous
          domesticSatisfactionImpact: 28,
          allyFatigueLevel: 32,
          participationWillingness: 54,
          isParticipating: true
        },
        'KR': {
          countryId: 'KR',
          role: 'RELUCTANT_PARTICIPANT', // shaky reluctant participant
          alignmentAffinity: 75,
          economicExposureToTarget: 82, // Extremely sensitive to CN supply chain
          domesticSatisfactionImpact: 35,
          allyFatigueLevel: 38,
          participationWillingness: 51,
          isParticipating: true
        },
        'TW': {
          countryId: 'TW',
          role: 'FULL_PARTICIPANT',
          alignmentAffinity: 92,
          economicExposureToTarget: 58,
          domesticSatisfactionImpact: 15,
          allyFatigueLevel: 8,
          participationWillingness: 90,
          isParticipating: true
        }
      },
      evasionChannels: [
        {
          id: 'evasion_yuan_settlement',
          name: 'Alternative Cross-Border Settlement (CIPS Workaround)',
          type: 'PAYMENT_WORKAROUND', // target adapting via payment rerouting
          partnerCountryId: 'RU',
          capacityMtoeOrValueB: 45,
          enforcementLeakagePct: 80,
          activeSinceTick: 35,
          isShutDown: false
        }
      ]
    },
    'campaign_ir_pressure': {
      id: 'campaign_ir_pressure',
      name: 'Hormuz Nuclear Non-Proliferation Blockade',
      initiatorCountryId: 'US',
      targetCountryIds: ['IR'],
      status: 'ACTIVE',
      campaignTier: 'TIER_3_FINANCIAL_TRADE',
      activeMeasures: ['MEASURE_ELITE_DESIG', 'MEASURE_ASSET_FREEZE', 'MEASURE_ENERGY_IMPORT_BAN', 'MEASURE_FIN_SWIFT_CUT'],
      coalitionSupportScore: 82,
      legitimacyPosture: 'LAW_ENFORCEMENT',
      targetPressureScore: 78,
      sanctionerBlowbackScore: 12,
      allyFatigueScore: 18,
      complianceStrength: 85,
      evasionIntensity: 40,
      startTick: 5,
      lastUpdatedTick: 48,
      publicJustification: 'Enforcement of maritime transit rules and freezing nuclear-linked oligarch bank nodes.',
      members: {
        'US': {
          countryId: 'US',
          role: 'LEAD_SPONSOR',
          alignmentAffinity: 100,
          economicExposureToTarget: 2,
          domesticSatisfactionImpact: 2,
          allyFatigueLevel: 4,
          participationWillingness: 100,
          isParticipating: true
        },
        'GB': {
          countryId: 'GB',
          role: 'FULL_PARTICIPANT',
          alignmentAffinity: 90,
          economicExposureToTarget: 4,
          domesticSatisfactionImpact: 5,
          allyFatigueLevel: 8,
          participationWillingness: 92,
          isParticipating: true
        },
        'DE': {
          countryId: 'DE',
          role: 'FULL_PARTICIPANT',
          alignmentAffinity: 82,
          economicExposureToTarget: 8,
          domesticSatisfactionImpact: 8,
          allyFatigueLevel: 15,
          participationWillingness: 84,
          isParticipating: true
        },
        'FR': {
          countryId: 'FR',
          role: 'FULL_PARTICIPANT',
          alignmentAffinity: 84,
          economicExposureToTarget: 6,
          domesticSatisfactionImpact: 6,
          allyFatigueLevel: 12,
          participationWillingness: 86,
          isParticipating: true
        },
        'RU': {
          countryId: 'RU',
          role: 'SILENT_ENABLER', // Enabler of evasion
          alignmentAffinity: 25,
          economicExposureToTarget: 45,
          domesticSatisfactionImpact: 0,
          allyFatigueLevel: 0,
          participationWillingness: 10,
          isParticipating: false
        }
      },
      evasionChannels: [
        {
          id: 'evasion_hormuz_dark_fleet',
          name: 'Hormuz Strait Oil Reorientation Pipe',
          type: 'PARTNER_REORIENTATION', // target reorienting to alternative partners
          partnerCountryId: 'CN',
          capacityMtoeOrValueB: 18,
          enforcementLeakagePct: 75,
          activeSinceTick: 8,
          isShutDown: false
        }
      ]
    },
    'campaign_unilateral_blowback': {
      id: 'campaign_unilateral_blowback',
      name: 'Sovereign Lithium Enclosure Accords',
      initiatorCountryId: 'US',
      targetCountryIds: ['BR'],
      status: 'ACTIVE',
      campaignTier: 'TIER_2_SECTORAL',
      activeMeasures: ['MEASURE_TECH_EXPORT', 'MEASURE_ENERGY_IMPORT_BAN'],
      coalitionSupportScore: 35,
      legitimacyPosture: 'UNILATERAL_PRESSURE', // weak unilateral pressure
      targetPressureScore: 40,
      sanctionerBlowbackScore: 72, // Heavy sanctioner inflation blowback
      allyFatigueScore: 85, // Heavy ally fatigue
      complianceStrength: 30,
      evasionIntensity: 68,
      startTick: 20,
      lastUpdatedTick: 48,
      publicJustification: 'Unilateral control pathways for strategic lithium hydroxide shipments.',
      members: {
        'US': {
          countryId: 'US',
          role: 'LEAD_SPONSOR',
          alignmentAffinity: 100,
          economicExposureToTarget: 60, // Sanctioner suffering high input loss!
          domesticSatisfactionImpact: 65, // extreme citizen anger
          allyFatigueLevel: 80,
          participationWillingness: 100,
          isParticipating: true
        },
        'DE': {
          countryId: 'DE',
          role: 'RELUCTANT_PARTICIPANT',
          alignmentAffinity: 60,
          economicExposureToTarget: 72,
          domesticSatisfactionImpact: 55,
          allyFatigueLevel: 90, // ready to defect
          participationWillingness: 24,
          isParticipating: true
        },
        'FR': {
          countryId: 'FR',
          role: 'SILENT_ENABLER',
          alignmentAffinity: 55,
          economicExposureToTarget: 68,
          domesticSatisfactionImpact: 40,
          allyFatigueLevel: 85,
          participationWillingness: 28,
          isParticipating: false
        }
      },
      evasionChannels: [
        {
          id: 'evasion_lithium_triad',
          name: 'Mercosur Gray Customs Channels',
          type: 'GRAY_MARKET',
          partnerCountryId: 'RU',
          capacityMtoeOrValueB: 12,
          enforcementLeakagePct: 90,
          activeSinceTick: 22,
          isShutDown: false
        }
      ]
    }
  };
};

const INITIAL_INCIDENTS: SanctionsIncident[] = [
  {
    id: 'inc-0',
    tick: 12,
    type: 'SANCTIONS_CAMPAIGN_INITIATED',
    campaignId: 'campaign_ru_exclusion',
    actorId: 'US',
    targetId: 'RU',
    summary: 'Operation Boreas initiated. Central Bank reserve freezers designated globally with preliminary G7 consent.',
    severity: 'CRITICAL'
  },
  {
    id: 'inc-1',
    tick: 24,
    type: 'GRAY_MARKET_EVASION_DETECTED',
    campaignId: 'campaign_ru_exclusion',
    actorId: 'RU',
    targetId: 'IN',
    summary: 'Urals Crude gray market transshipment fleet detected in the Indian Ocean using non-dollar insurance contracts.',
    severity: 'WARNING'
  },
  {
    id: 'inc-2',
    tick: 35,
    type: 'ALTERNATIVE_PAYMENT_ROUTE_EXPANDING',
    campaignId: 'campaign_cn_technology',
    actorId: 'CN',
    targetId: 'RU',
    summary: 'Pacific Containment triggers CIPS and digital Yuan settlement channel growth with Russian commercial clusters.',
    severity: 'WARNING'
  },
  {
    id: 'inc-3',
    tick: 40,
    type: 'ALLY_FATIGUE_THRESHOLD_CROSSED',
    campaignId: 'campaign_ru_exclusion',
    actorId: 'DE',
    summary: 'German business union signs raw material inflation protest, pushing local ally fatigue to severe 68% index.',
    severity: 'WARNING'
  }
];

export const useSanctionsStore = create<SanctionsStore>()(
  (set, get) => ({
    campaigns: initializeSeededCampaigns(),
    incidents: INITIAL_INCIDENTS,
    selectedCampaignId: 'campaign_ru_exclusion',
    activeMapOverlay: 'NONE',

    setSelectedCampaignId: (id) => set({ selectedCampaignId: id }),
    setActiveMapOverlay: (overlay) => set({ activeMapOverlay: overlay }),

    proposeCampaign: (name, initiatorId, targetIds, legitimacy, justification) => {
      set(produce((state) => {
        const id = `campaign_${Math.random().toString(36).substr(2, 9)}`;
        
        // Populate potential coalition members based on world alignment
        const worldCountries = useWorldStore.getState().countries;
        const members: Record<string, CoalitionMemberCommitment> = {};

        Object.keys(worldCountries).forEach((cid) => {
          const c = worldCountries[cid];
          const isTarget = targetIds.includes(cid);
          
          let affinity = 50;
          let exposure = 30;

          if (cid === initiatorId) {
            affinity = 100;
            exposure = 0;
          } else if (isTarget) {
            affinity = 10;
            exposure = 100;
          } else {
            // compute affinity based on alliance block and opinions
            const blockMatch = c.allianceBlock === worldCountries[initiatorId]?.allianceBlock;
            const opToInitiator = c.opinions[initiatorId] ?? 50;
            affinity = Math.round(blockMatch ? Math.max(75, opToInitiator) : Math.max(30, opToInitiator));
            
            // exposure based on overall size / mock dependency
            exposure = Math.round((c.economic.gdpB % 40) + 10);
            if (c.allianceBlock === 'SCO' || c.allianceBlock === 'BRICS') exposure += 30;
          }

          const role = cid === initiatorId 
            ? 'LEAD_SPONSOR' 
            : affinity > 80 
              ? 'FULL_PARTICIPANT' 
              : affinity > 50 
                ? 'RELUCTANT_PARTICIPANT' 
                : 'SPOILER_BLOCKER';

          const willing = Math.max(0, Math.min(100, Math.round(affinity * 1.2 - exposure * 0.4)));

          members[cid] = {
            countryId: cid,
            role,
            alignmentAffinity: affinity,
            economicExposureToTarget: exposure,
            domesticSatisfactionImpact: 0,
            allyFatigueLevel: 0,
            participationWillingness: willing,
            isParticipating: cid === initiatorId ? true : false
          };
        });

        const newCampaign: SanctionsCampaign = {
          id,
          name,
          initiatorCountryId: initiatorId,
          targetCountryIds: targetIds,
          status: 'PROPOSED',
          campaignTier: 'TIER_1_TARGETED',
          activeMeasures: ['MEASURE_ELITE_DESIG'],
          coalitionSupportScore: 0,
          legitimacyPosture: legitimacy,
          targetPressureScore: 10,
          sanctionerBlowbackScore: 5,
          allyFatigueScore: 0,
          complianceStrength: 50,
          evasionIntensity: 10,
          startTick: useWorldStore.getState().currentTick,
          lastUpdatedTick: useWorldStore.getState().currentTick,
          publicJustification: justification,
          members,
          evasionChannels: []
        };

        state.campaigns[id] = newCampaign;
        state.selectedCampaignId = id;

        // Log initiation proposal
        state.incidents.unshift({
          id: `inc_${Date.now()}`,
          tick: useWorldStore.getState().currentTick,
          type: 'SANCTIONS_CAMPAIGN_INITIATED',
          campaignId: id,
          actorId: initiatorId,
          targetId: targetIds[0],
          summary: `New campaign proposed: "${name}" targeting ${targetIds.join(', ')}. Lobbying coalition began.`,
          severity: 'INFO'
        });
      }));
    },

    assembleCoalitionSupport: (campaignId) => {
      set(produce((state) => {
        const campaign: SanctionsCampaign = state.campaigns[campaignId];
        if (!campaign) return;

        let totalSupports = 0;
        let count = 0;

        Object.keys(campaign.members).forEach((cid) => {
          const m = campaign.members[cid];
          if (cid === campaign.initiatorCountryId) return;

          // random negotiation roll + willingness index
          const score = m.participationWillingness;
          if (score > 45) {
            m.isParticipating = true;
            m.role = score > 75 ? 'FULL_PARTICIPANT' : 'RELUCTANT_PARTICIPANT';
          } else {
            m.isParticipating = false;
            m.role = score > 20 ? 'PARTIAL_COMPLIANT' : 'SPOILER_BLOCKER';
          }

          if (m.isParticipating) {
            totalSupports += score;
            count++;
          }
        });

        campaign.status = 'ACTIVE';
        campaign.coalitionSupportScore = count > 0 ? Math.round(totalSupports / count) : 40;
        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;

        state.incidents.unshift({
          id: `inc_${Date.now()}`,
          tick: useWorldStore.getState().currentTick,
          type: 'COALITION_SUPPORT_RISING',
          campaignId,
          actorId: campaign.initiatorCountryId,
          summary: `Sovereign Coalition assembled for "${campaign.name}" with a support consensus rating of ${campaign.coalitionSupportScore}%.`,
          severity: 'INFO'
        });
      }));
    },

    toggleMeasure: (campaignId, measureId) => {
      set(produce((state) => {
        const campaign: SanctionsCampaign = state.campaigns[campaignId];
        if (!campaign) return;

        const index = campaign.activeMeasures.indexOf(measureId);
        if (index > -1) {
          campaign.activeMeasures.splice(index, 1);
        } else {
          campaign.activeMeasures.push(measureId);
        }

        // Determine campaign tier dynamically based on active measures
        const hasTier4 = campaign.activeMeasures.some(mId => ALL_MEASURES.find(m => m.id === mId)?.tier === 'TIER_4_TOTAL_EXCLUSION');
        const hasTier3 = campaign.activeMeasures.some(mId => ALL_MEASURES.find(m => m.id === mId)?.tier === 'TIER_3_FINANCIAL_TRADE');
        const hasTier2 = campaign.activeMeasures.some(mId => ALL_MEASURES.find(m => m.id === mId)?.tier === 'TIER_2_SECTORAL');

        campaign.campaignTier = hasTier4 
          ? 'TIER_4_TOTAL_EXCLUSION' 
          : hasTier3 
            ? 'TIER_3_FINANCIAL_TRADE' 
            : hasTier2 
              ? 'TIER_2_SECTORAL' 
              : 'TIER_1_TARGETED';

        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
      }));
    },

    escalateCampaignTier: (campaignId, tier) => {
      set(produce((state) => {
        const campaign: SanctionsCampaign = state.campaigns[campaignId];
        if (!campaign) return;

        campaign.campaignTier = tier;
        // activate all measures up to that tier
        const measuresInTier = ALL_MEASURES.filter(m => {
          if (tier === 'TIER_1_TARGETED') return m.tier === 'TIER_1_TARGETED';
          if (tier === 'TIER_2_SECTORAL') return m.tier === 'TIER_1_TARGETED' || m.tier === 'TIER_2_SECTORAL';
          if (tier === 'TIER_3_FINANCIAL_TRADE') return m.tier !== 'TIER_4_TOTAL_EXCLUSION';
          return true; // Tier 4
        });

        campaign.activeMeasures = measuresInTier.map(m => m.id);
        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;

        state.incidents.unshift({
          id: `inc_${Date.now()}`,
          tick: useWorldStore.getState().currentTick,
          type: 'SANCTIONS_TIER_ESCALATED',
          campaignId,
          actorId: campaign.initiatorCountryId,
          summary: `Campaign escalated to ${tier.replace('_', ' ')}. Broad economic warfare measures online.`,
          severity: 'CRITICAL'
        });
      }));
    },

    influenceCoalitionMember: (campaignId, countryId, policy) => {
      set(produce((state) => {
        const campaign: SanctionsCampaign = state.campaigns[campaignId];
        if (!campaign) return;
        const member = campaign.members[countryId];
        if (!member) return;

        if (policy === 'DIPLOMATIC_SWEETENER') {
          member.participationWillingness = Math.min(100, member.participationWillingness + 15);
          member.alignmentAffinity = Math.min(100, member.alignmentAffinity + 8);
          member.allyFatigueLevel = Math.max(0, member.allyFatigueLevel - 20);
        } else if (policy === 'PUBLIC_PRESSURE') {
          member.participationWillingness = Math.min(100, member.participationWillingness + 10);
          member.domesticSatisfactionImpact = Math.min(100, member.domesticSatisfactionImpact + 12);
        } else if (policy === 'COERCION') {
          member.participationWillingness = Math.min(100, member.participationWillingness + 25);
          member.alignmentAffinity = Math.max(0, member.alignmentAffinity - 15);
          member.allyFatigueLevel = Math.min(100, member.allyFatigueLevel + 10);
        }

        if (member.participationWillingness > 45 && !member.isParticipating) {
          member.isParticipating = true;
          member.role = 'RELUCTANT_PARTICIPANT';
        }

        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;
      }));
    },

    deployEvasionChannel: (campaignId, inputChannel) => {
      set(produce((state) => {
        const campaign: SanctionsCampaign = state.campaigns[campaignId];
        if (!campaign) return;

        const id = `evasion_${Math.random().toString(36).substr(2, 9)}`;
        const channel: EvasionChannel = {
          ...inputChannel,
          id,
          activeSinceTick: useWorldStore.getState().currentTick,
          isShutDown: false
        };

        campaign.evasionChannels.push(channel);
        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;

        state.incidents.unshift({
          id: `inc_${Date.now()}`,
          tick: useWorldStore.getState().currentTick,
          type: channel.type === 'GRAY_MARKET' 
            ? 'GRAY_MARKET_EVASION_DETECTED' 
            : channel.type === 'PAYMENT_WORKAROUND' 
              ? 'ALTERNATIVE_PAYMENT_ROUTE_EXPANDING' 
              : 'PARTNER_REORIENTATION_ACCELERATING',
          campaignId,
          actorId: campaign.targetCountryIds[0] || 'RU',
          targetId: channel.partnerCountryId,
          summary: `New strategic workaround: "${channel.name}" routed through ${channel.partnerCountryId}. Evasion intensity spiked.`,
          severity: 'WARNING'
        });
      }));
    },

    shutDownEvasionChannel: (campaignId, channelId) => {
      set(produce((state) => {
        const campaign: SanctionsCampaign = state.campaigns[campaignId];
        if (!campaign) return;

        const ch = campaign.evasionChannels.find(c => c.id === channelId);
        if (ch) {
          ch.isShutDown = true;
        }
        campaign.lastUpdatedTick = useWorldStore.getState().currentTick;

        state.incidents.unshift({
          id: `inc_${Date.now()}`,
          tick: useWorldStore.getState().currentTick,
          type: 'SANCTIONS_MITIGATED_OR_SUSPENDED',
          campaignId,
          actorId: campaign.initiatorCountryId,
          summary: `Intell intercepts successfully closed evasion conduit: "${ch?.name || 'conduit'}". Target pipeline choked.`,
          severity: 'INFO'
        });
      }));
    },

    calculatePreview: (initiatorId, targetIds, tier, activeMeasureIds) => {
      const activeMeasures = ALL_MEASURES.filter(m => activeMeasureIds.includes(m.id));
      const basePower = activeMeasures.reduce((sum, m) => sum + m.coerciveImpact, 0);
      const baseBlowback = activeMeasures.reduce((sum, m) => sum + m.blowbackCost, 0);

      // Simple prediction metrics
      const support = tier === 'TIER_1_TARGETED' 
        ? 85 
        : tier === 'TIER_2_SECTORAL' 
          ? 64 
          : tier === 'TIER_3_FINANCIAL_TRADE' 
            ? 48 
            : 22;

      const expectedLeakage = Math.min(80, Math.max(10, Math.round(50 - (support / 2))));
      const threatCoercion = Math.min(95, Math.max(5, Math.round((basePower / 2) - expectedLeakage * 0.3)));
      const blowback = Math.min(100, Math.max(2, Math.round(baseBlowback * 0.7 + (4 - activeMeasures.length) * 2)));

      return {
        tier,
        expectedCoalitionSupport: support,
        complianceStrengthAssumption: Math.round(support * 1.1),
        likelyTargetPressure: threatCoercion,
        expectedEvasionLeakage: expectedLeakage,
        sanctionerBlowback: blowback,
        allyFatigueRisk: Math.min(100, Math.round(blowback * 1.2)),
        gdpImpactOnTargetPct: Number((threatCoercion * 0.08).toFixed(1)),
        inflationImpactOnInitiatorPct: Number((blowback * 0.06).toFixed(1))
      };
    },

    tickSanctionsSystem: (currentTick) => {
      set(produce((state) => {
        const globalWorldState = useWorldStore.getState();
        const worldDraft = { ...globalWorldState }; // We will send updates to worldStore as well

        Object.keys(state.campaigns).forEach((cId) => {
          const camp: SanctionsCampaign = state.campaigns[cId];
          if (camp.status === 'PROPOSED' || camp.status === 'COLLAPSED' || camp.status === 'SUSPENDED') {
            return;
          }

          // Compute compliance, leakage, evasion
          // Leakage is sum of operational channels
          let totalLeakageCapacity = 0;
          camp.evasionChannels.forEach((ch) => {
            if (!ch.isShutDown) {
              totalLeakageCapacity += (ch.capacityMtoeOrValueB * ch.enforcementLeakagePct / 100);
            }
          });

          const activeMeasures = ALL_MEASURES.filter(m => camp.activeMeasures.includes(m.id));
          const totalCoerciveBaseline = activeMeasures.reduce((sum, m) => sum + m.coerciveImpact, 0);
          const totalBlowbackBaseline = activeMeasures.reduce((sum, m) => sum + m.blowbackCost, 0);

          // Dynamic evasion scaling
          camp.evasionIntensity = Math.min(100, Math.round(20 + totalLeakageCapacity * 1.2));
          
          // Compliance is strong if there's high coalition support and low evasion intensity
          camp.complianceStrength = Math.min(100, Math.max(5, Math.round(camp.coalitionSupportScore * 0.9 - camp.evasionIntensity * 0.2)));

          // Calculate direct pressure
          // Pressure is total capacity with a dampening factor from evasion
          const mitigatedPressure = totalCoerciveBaseline * (1 - camp.evasionIntensity / 220);
          camp.targetPressureScore = Math.min(100, Math.max(0, Math.round(mitigatedPressure)));

          // Fatigue engine: dynamic fatigue level scaling for each compliance state
          let cumulativeFatigue = 0;
          let participatingMembersCount = 0;

          Object.keys(camp.members).forEach((mId) => {
            const m = camp.members[mId];
            if (!m.isParticipating) return;

            participatingMembersCount++;

            // Fatigue builds up based on target exposure & active measures
            const escalationFactor = camp.campaignTier === 'TIER_4_TOTAL_EXCLUSION' 
              ? 2.8 
              : camp.campaignTier === 'TIER_3_FINANCIAL_TRADE' 
                ? 1.8 
                : camp.campaignTier === 'TIER_2_SECTORAL' 
                  ? 0.9 
                  : 0.2;

            const baseGain = (m.economicExposureToTarget / 50) * escalationFactor;
            const bufferJustification = camp.legitimacyPosture === 'HUMANITARIAN' || camp.legitimacyPosture === 'DEFENSIVE' ? 0.3 : 0.6;
            
            // Build up fatigue
            m.allyFatigueLevel = Math.min(100, Math.round(m.allyFatigueLevel + baseGain + bufferJustification));

            // Domestic dissatisfaction is a factor of fatiguing
            m.domesticSatisfactionImpact = Math.min(100, Math.round(m.allyFatigueLevel * 1.1));

            cumulativeFatigue += m.allyFatigueLevel;

            // AUTO DEFECTS IF FATIGUE CROSSES THE THRESHOLD OF STABILITY
            if (m.allyFatigueLevel > 85 && mId !== camp.initiatorCountryId) {
              m.isParticipating = false;
              m.role = 'SPOILER_BLOCKER';
              
              // Push defection alert to state
              state.incidents.unshift({
                id: `inc_${Date.now()}_def`,
                tick: currentTick,
                type: 'ALLY_FATIGUE_THRESHOLD_CROSSED',
                campaignId: cId,
                actorId: mId,
                summary: `🚨 DEFECTION: ${mId} has withdrawn completely from the coalition in "${camp.name}" citing unbearable energy/materials import inflation.`,
                severity: 'CRITICAL'
              });

              // Post warning on Arachne intel feed
              useArachneStore.getState().addLiveIntelItem({
                id: `intel-sanction-defect-${Date.now()}`,
                title: `Coalition Crack: ${mId} Defects`,
                summary: `Severe inflationary friction from trade curbs targeting ${camp.targetCountryIds.join(', ')} has shattered ${mId}'s domestic patience.`,
                fullBrief: `German, French, and G7 financial monitors intercept communication lines verifying ${mId}'s active defection from primary economic sanctions enforcement nodes due to trade and commodity distress.`,
                whyItMatters: `Coalition erosion weakens SWIFT bypass controls, opening strategic evasion pipelines for the target.`,
                countryIds: [mId],
                regionIds: [],
                relatedLeaderIds: [],
                themeTags: ['SANCTIONS', 'ECONOMIC', 'ALLIANCES'],
                urgency: 'CRITICAL',
                confidence: 'HIGH',
                sourceType: 'SIGINT',
                sourceLabel: 'SIGINT INTERCEPT',
                timestampTick: currentTick,
                freshnessState: 'BREAKING',
                linkedIntelFactIds: [],
                linkedWorldEventIds: [],
                linkedOperationIds: [],
                relatedTreatyIds: [],
                alertScore: 82
              });
            }
          });

          camp.allyFatigueScore = participatingMembersCount > 0 ? Math.round(cumulativeFatigue / participatingMembersCount) : 0;
          
          // Blowback to initiator is high if tier is extreme or measures are costly
          camp.sanctionerBlowbackScore = Math.min(100, Math.round(totalBlowbackBaseline * 0.9 + (camp.allyFatigueScore * 0.3)));

          // APPLY MACRO SYSTEM REPERCUSSIONS DIRECTLY TO canonical worldStore values!
          useWorldStore.setState(produce((wState: any) => {
            // Target Countries consequences
            camp.targetCountryIds.forEach((targetCid) => {
              const country = wState.countries[targetCid];
              if (country) {
                // GDP drag increases, inflation Spikes
                const drag = (camp.targetPressureScore / 100) * 0.3; // max -0.3% gdp per tick
                const infMultiplier = (camp.targetPressureScore / 100) * 1.5; // up to +1.5% inflation per tick
                
                country.economic.gdpGrowthRate = Math.max(-12, country.economic.gdpGrowthRate - drag);
                country.economic.inflationRate = Math.min(45, country.economic.inflationRate + infMultiplier);
                
                // Diminish sovereign reserves
                country.economic.treasuryCashB = Math.max(1, country.economic.treasuryCashB - (camp.targetPressureScore * 0.05));
                
                // Domestic stress and popular unrest triggers
                country.political.popularUnrest = Math.min(100, country.political.popularUnrest + Math.round(camp.targetPressureScore * 0.25));
                country.political.leaderApprovalRating = Math.max(10, country.political.leaderApprovalRating - Math.round(camp.targetPressureScore * 0.15));
                
                // Add to sanctioned list
                if (!country.economic.sanctionedBy.includes(camp.initiatorCountryId)) {
                  country.economic.sanctionedBy.push(camp.initiatorCountryId);
                }
              }
            });

            // Initiator/Coalition Countries consequences (Self-Harm blowback)
            const initiator = wState.countries[camp.initiatorCountryId];
            if (initiator) {
              const bRatio = camp.sanctionerBlowbackScore / 100;
              initiator.economic.inflationRate = Math.min(20, initiator.economic.inflationRate + Number((bRatio * 0.25).toFixed(2)));
              initiator.political.popularUnrest = Math.min(80, initiator.political.popularUnrest + Math.round(bRatio * 8));
              initiator.political.stabilityIndex = Math.max(10, initiator.political.stabilityIndex - Math.round(bRatio * 5));
            }

            // Other partners experience slight inflation
            Object.keys(camp.members).forEach((cid) => {
              const m = camp.members[cid];
              if (m.isParticipating && cid !== camp.initiatorCountryId) {
                const partner = wState.countries[cid];
                if (partner) {
                  const fatigue = m.allyFatigueLevel / 100;
                  partner.economic.inflationRate = Math.min(22, partner.economic.inflationRate + Number((fatigue * 0.2).toFixed(2)));
                  partner.political.stabilityIndex = Math.max(20, partner.political.stabilityIndex - Math.round(fatigue * 6));
                }
              }
            });
          }));

          // Emit warning if fatigue is extreme (e.g. > 50)
          if (camp.allyFatigueScore > 50 && camp.lastUpdatedTick + 2 < currentTick) {
            state.incidents.unshift({
              id: `inc_${Date.now()}_fatigue`,
              tick: currentTick,
              type: 'SANCTIONER_BLOWBACK_RISING',
              campaignId: cId,
              actorId: camp.initiatorCountryId,
              summary: `⚠️ WARNING: Asymmetric import costs are fueling severe coalition fatigue inside ${camp.name} (Fatigue Index: ${camp.allyFatigueScore}%).`,
              severity: 'WARNING'
            });
            camp.lastUpdatedTick = currentTick;
          }
        });
      }));
    },

    clearAll: () => set({ campaigns: initializeSeededCampaigns(), incidents: INITIAL_INCIDENTS })
  })
);
