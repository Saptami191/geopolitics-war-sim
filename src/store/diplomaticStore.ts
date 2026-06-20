import { create } from 'zustand';
import { produce } from 'immer';
import {
  Treaty,
  Treaty_Type,
  Treaty_Status,
  Treaty_Term,
  Treaty_ViolationRecord,
  Treaty_ViolationSeverity,
  Treaty_Trigger,
  Treaty_SecretProtocol,
  Diplo_Relationship,
  Diplo_Posture,
  Diplo_Instrument,
  UNSC_Resolution,
  UNSC_Membership,
  UNSC_VoteRecord,
  Diplo_Crisis,
  Diplo_CrisisResponse,
  Diplo_Bloc,
  Diplo_SoftPowerProgramme,
  Diplo_Ambassador,
  Diplo_CapitalPool,
  Diplo_CapitalType
} from '../types';

import { useWorldStore } from './worldStore';
import { useMirrorStore } from './mirrorStore';
import { useSanctionsStore } from './sanctionsStore';
import { useSigintStore } from './sigintStore';
import { useFinintStore } from './finintStore';
import { useDefconStore } from './defconStore';
import { useMilitaryStore } from './militaryStore';
import { useConsequenceStore } from './consequenceStore';
import { useCiaStore } from './ciaStore';
import { useEconomyStore } from './economyStore';
import { useCinematicsStore } from './cinematicsStore';
import { usePlayerStore } from './playerStore';

interface DiplomaticState {
  diplo_treaties: Record<string, Treaty>;
  diplo_relationships: Record<string, Diplo_Relationship>;
  diplo_unscResolutions: UNSC_Resolution[];
  diplo_unscMembership: UNSC_Membership;
  diplo_crises: Diplo_Crisis[];
  diplo_blocs: Record<string, Diplo_Bloc>;
  diplo_softPowerProgrammes: Diplo_SoftPowerProgramme[];
  diplo_ambassadors: Diplo_Ambassador[];
  diplo_capitalPool: Diplo_CapitalPool;
  diplo_activeNegotiationIds: string[];
  diplo_pendingInstruments: Array<{
    instrument: Diplo_Instrument;
    fromNationId: string;
    toNationId: string;
    sentAtTick: number;
    expiryTick: number | null;
    isResponded: boolean;
  }>;
  diplo_lastProcessedTick: number;
  diplo_totalTreatiesRatified: number;
  diplo_totalCrisesResolved: number;
  diplo_totalUNSCResolutionsPassed: number;
  diplo_directorLog: string[];
}

interface DiplomaticActions {
  diplo_initRelationship: (nationAId: string, nationBId: string, initialScore: number, initialPosture: Diplo_Posture) => void;
  diplo_updateRelationship: (nationAId: string, nationBId: string, delta: number, eventDescription: string, currentTick: number) => void;
  diplo_proposeTreaty: (treaty: Omit<Treaty, 'id' | 'proposedAtTick' | 'ratifiedAtTick' | 'terminatedAtTick' | 'violationLog' | 'automaticTriggers'>, currentTick: number) => string;
  diplo_ratifyTreaty: (treatyId: string, currentTick: number) => void;
  diplo_violateTreaty: (treatyId: string, violatingNationId: string, violation: Omit<Treaty_ViolationRecord, 'id'>, currentTick: number) => void;
  diplo_terminateTreaty: (treatyId: string, terminatingNationId: string, currentTick: number) => void;
  diplo_deployInstrument: (instrument: Diplo_Instrument, fromNationId: string, toNationId: string, currentTick: number, expiryTicks: number | null) => void;
  diplo_proposeUNSCResolution: (resolution: Omit<UNSC_Resolution, 'id' | 'proposedAtTick' | 'votedAtTick' | 'votes' | 'vetoedBy' | 'status'>, currentTick: number) => string;
  diplo_callUNSCVote: (resolutionId: string, currentTick: number) => void;
  diplo_spendDiplomaticCapital: (type: Diplo_CapitalType, amount: number, purpose: string, currentTick: number) => boolean;
  diplo_replenishCapital: (type: Diplo_CapitalType, amount: number) => void;
  diplo_establishBloc: (bloc: Omit<Diplo_Bloc, 'id' | 'establishedAtTick' | 'lastMeetingTick' | 'cohesionScore' | 'status'>, currentTick: number) => string;
  diplo_joinBloc: (blocId: string, nationId: string, currentTick: number) => void;
  diplo_fractureBlocMember: (blocId: string, nationId: string, currentTick: number) => void;
  diplo_launchSoftPowerProgramme: (programme: Omit<Diplo_SoftPowerProgramme, 'id' | 'startTick' | 'isActive' | 'cumulativeEffect'>, currentTick: number) => string;
  diplo_postAmbassador: (ambassador: Omit<Diplo_Ambassador, 'id' | 'postedAtTick' | 'recalledAtTick'>, currentTick: number) => string;
  diplo_recallAmbassador: (ambassadorId: string, currentTick: number) => void;
  diplo_expelAmbassador: (ambassadorId: string, expellingNationId: string, currentTick: number) => void;
  diplo_declareCrisis: (crisis: Omit<Diplo_Crisis, 'id' | 'status' | 'resolutionTick' | 'outcome' | 'chosenResponseId'>, currentTick: number) => string;
  diplo_respondToCrisis: (crisisId: string, responseId: string, currentTick: number) => void;
  diplo_processTick: (currentTick: number) => void;
}

export function diplo_generateTreatyCodename(type: Treaty_Type, partyNationIds: string[], tick: number): string {
  let adjectives: string[] = ['FORMAL', 'SIGNED', 'AGREED', 'COMPACT'];
  if (type === 'MUTUAL_DEFENCE') adjectives = ['IRON', 'SHIELD', 'GRANITE', 'ETERNAL'];
  if (type === 'NON_AGGRESSION') adjectives = ['SILENT', 'OPEN', 'PACIFIC', 'HOLLOW'];
  if (type === 'INTELLIGENCE_SHARING') adjectives = ['SHADOW', 'MIRRORED', 'VEILED', 'CLEAR'];
  if (type === 'ARMS_CONTROL') adjectives = ['MEASURED', 'FROZEN', 'BOUND', 'SEALED'];
  if (type === 'NUCLEAR_NON_PROLIFERATION') adjectives = ['FINAL', 'CLOSED', 'SECURE', 'LOCKED'];
  if (type === 'TRADE_AGREEMENT') adjectives = ['GOLDEN', 'SILVER', 'OPEN', 'BRIGHT'];
  if (type === 'PEACE_TREATY') adjectives = ['ENDURING', 'LASTING', 'QUIET', 'SETTLED'];

  const nouns = ['ACCORD', 'COVENANT', 'PACT', 'COMPACT', 'CHARTER', 'FRAMEWORK', 'PROTOCOL', 'CONVENTION', 'DECLARATION', 'ARRANGEMENT', 'UNDERSTANDING', 'ARTICLE', 'COMMUNIQUÉ'];
  const hash = tick + partyNationIds.join('').length;
  return `${adjectives[hash % adjectives.length]} ${nouns[hash % nouns.length]}`;
}

export function diplo_generateUNSCRationale(memberVote: UNSC_VoteRecord, resolution: UNSC_Resolution): string {
  const t = resolution.targetNationId || 'target';
  const n = memberVote.nationId;
  if (memberVote.vote === 'YES') {
    return Math.random() > 0.5 
      ? `My delegation votes in favour. The resolution before the Council reflects the minimum necessary response to the situation in ${t}. We call on all parties to implement its provisions in good faith.`
      : `[${n}] supports this resolution. The threat to international peace and security is clear. We expect full implementation and will monitor compliance closely.`;
  }
  if (memberVote.vote === 'NO') {
    if (memberVote.role === 'P5_PERMANENT') {
      return Math.random() > 0.5
        ? `[${n}] exercises its right under the Charter to veto this resolution. The text as presented is unacceptable and represents a one-sided approach to a complex situation. We will not hesitate to use this authority again if necessary.`
        : `My delegation regrets that it cannot allow this resolution to pass. The consequences for regional stability would be severe and unpredictable. We propose a revised framework.`;
    } else {
      return Math.random() > 0.5
        ? `My delegation cannot support this resolution. We believe diplomatic channels have not been exhausted. We call for continued dialogue rather than coercive measures.`
        : `[${n}] votes against. This resolution overreaches the Council\'s mandate and sets a dangerous precedent for interference in the internal affairs of member states.`;
    }
  }
  return `[${n}] abstains. We share the Council\'s concern but cannot endorse the specific provisions of this text. We encourage the parties to seek a negotiated resolution.`;
}

export function diplo_generateCrisisResponseDescription(response: Diplo_CrisisResponse, crisis: Diplo_Crisis): string {
  switch (response.instrument) {
    case 'FORMAL_PROTEST': return `Issue a formal diplomatic protest through the official channel. Signal displeasure without escalating. Low cost, low risk. Resolution probability: ${response.probabilityOfResolution}%. Note: adversary may read this as weakness.`;
    case 'AMBASSADOR_RECALL': return `Recall your ambassador for consultations. A significant signal — below expulsion but above protest. Preserves the diplomatic channel while demonstrating seriousness. Relationship impact: -15.`;
    case 'ULTIMATUM': return `Issue a formal ultimatum with a deadline. Maximum pressure — but if they call your bluff and you do not follow through, credibility damage is severe. Resolution probability: ${response.probabilityOfResolution}%. Escalation risk: ${response.escalationRisk}%.`;
    case 'BACK_CHANNEL_CONTACT': return `Open a private back-channel. Deniable. No public commitment required from either side. The preferred instrument when both parties need an exit but cannot be seen to want one.`;
    case 'SUMMIT_REQUEST': return `Request a direct leader-level summit. High-stakes, high-reward. A successful summit resolves the crisis and generates significant domestic approval. A failed summit makes everything worse.`;
    case 'MEDIATION_OFFER': return `Offer a neutral mediator. Steps back from direct confrontation. Appropriate when the player\'s credibility as a direct party is compromised.`;
    case 'RECOGNITION_WITHDRAWAL': return `Withdraw recognition of the current government. The most drastic measure short of severing all ties. Relationship impact: -40. Triggers secondary crises in nations watching your lead.`;
    default: return `Deploy ${response.instrument} to manage the crisis.`;
  }
}

export function diplo_generateEventNarrative(instrument: Diplo_Instrument | string, fromNationId: string, toNationId: string, outcome: string, tick: number): string {
  switch (instrument) {
    case 'AMBASSADOR_EXPULSION': return `[Tick ${tick}] AMBASSADOR_EXPULSION — ${fromNationId} — ${fromNationId} has declared ${toNationId}'s ambassador persona non grata. The ambassador has been given 48 hours to leave. ${toNationId} is expected to reciprocate. Bilateral relations: critical.`;
    case 'TREATY_RATIFIED': return `[Tick ${tick}] TREATY_RATIFIED — GLOBE — ${fromNationId} ratified between ${toNationId}. Type: ${outcome}. The agreement enters into force immediately.`;
    case 'UNSC_VETO': return `[Tick ${tick}] UNSC_VETO — UNSC — ${fromNationId} has vetoed ${toNationId} in the Security Council. The resolution fails.`;
    case 'MUTUAL_DEFENCE_TRIGGERED': return `[Tick ${tick}] MUTUAL_DEFENCE_TRIGGERED — GLOBE — Article 5 equivalent triggered under ${fromNationId}. ${toNationId} has conducted armed action.`;
    case 'CRISIS_RESOLVED': return `[Tick ${tick}] CRISIS_RESOLVED — ${fromNationId} — Crisis involving ${toNationId} resolved. Outcome: ${outcome}.`;
    default: return `[Tick ${tick}] ${instrument} — ${fromNationId} — Deployed against ${toNationId}. Outcome: ${outcome}`;
  }
}

function getRelationshipKey(a: string, b: string) {
  return [a, b].sort().join(':');
}

export const useDiplomaticStore = create<DiplomaticState & DiplomaticActions>()(
  (set, get) => ({
    diplo_treaties: {},
    diplo_relationships: {},
    diplo_unscResolutions: [],
    diplo_unscMembership: {
      permanentMembers: ['US', 'CN', 'RU', 'GB', 'FR'],
      electedMembers: [],
      currentPresidencyNationId: 'US',
      nextElectionTick: 50
    },
    diplo_crises: [],
    diplo_blocs: {},
    diplo_softPowerProgrammes: [],
    diplo_ambassadors: [],
    diplo_capitalPool: {
      political: 500,
      economic: 300,
      military: 200,
      informational: 400,
      totalSpentThisSession: 0
    },
    diplo_activeNegotiationIds: [],
    diplo_pendingInstruments: [],
    diplo_lastProcessedTick: -1,
    diplo_totalTreatiesRatified: 0,
    diplo_totalCrisesResolved: 0,
    diplo_totalUNSCResolutionsPassed: 0,
    diplo_directorLog: [],

    diplo_initRelationship: (nationAId, nationBId, initialScore, initialPosture) => set(produce(draft => {
      const key = getRelationshipKey(nationAId, nationBId);
      if (!draft.diplo_relationships[key]) {
        draft.diplo_relationships[key] = {
          nationAId, nationBId,
          relationshipScore: initialScore,
          posture: initialPosture,
          ambassadorStatus: 'POSTED',
          activeTreatyIds: [],
          activeDisputeIds: [],
          historicalEventLog: [],
          lastContactTick: 0,
          mutualThreatPerception: 50,
          economicInterdependenceScore: 50,
          culturalAffinityScore: 50,
          isAlly: false,
          isAdversary: initialScore < 0,
          pendingNegotiationIds: [],
          backChannelActive: false,
          backChannelContactTick: null
        };
      }
    })),

    diplo_updateRelationship: (nationAId, nationBId, delta, eventDescription, currentTick) => set(produce(draft => {
      const key = getRelationshipKey(nationAId, nationBId);
      const rel = draft.diplo_relationships[key];
      if (rel) {
        rel.relationshipScore = Math.max(-100, Math.min(100, rel.relationshipScore + delta));
        rel.historicalEventLog.push(`[Tick ${currentTick}] ${eventDescription}`);
        
        let newPosture: Diplo_Posture = 'MANAGED_TENSION';
        if (rel.relationshipScore >= 60) newPosture = 'ENGAGEMENT';
        else if (rel.relationshipScore >= 30) newPosture = rel.activeDisputeIds.length > 0 ? 'PRESSURE' : 'MANAGED_TENSION';
        else if (rel.relationshipScore >= 0) newPosture = 'PRESSURE';
        else if (rel.relationshipScore >= -39) newPosture = 'CONFRONTATION';
        else if (rel.relationshipScore >= -79) newPosture = 'ISOLATION';
        else newPosture = 'RUPTURE';
        
        rel.posture = newPosture;
      }
    })),

    diplo_proposeTreaty: (treaty, currentTick) => {
      const id = `treaty_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      set(produce(draft => {
        draft.diplo_capitalPool.political = Math.max(0, draft.diplo_capitalPool.political - treaty.diplomaticCapitalCost);
        draft.diplo_treaties[id] = {
          ...treaty,
          id,
          proposedAtTick: currentTick,
          ratifiedAtTick: null,
          terminatedAtTick: null,
          violationLog: [],
          automaticTriggers: [],
        };
        draft.diplo_activeNegotiationIds.push(id);
      }));
      return id;
    },

    diplo_ratifyTreaty: (treatyId, currentTick) => set(produce(draft => {
      const treaty = draft.diplo_treaties[treatyId];
      if (treaty && treaty.status === 'PROPOSED') {
        treaty.status = 'RATIFIED';
        treaty.ratifiedAtTick = currentTick;
        draft.diplo_totalTreatiesRatified += 1;
        draft.diplo_activeNegotiationIds = draft.diplo_activeNegotiationIds.filter(id => id !== treatyId);
        
        for (let i = 0; i < treaty.partyNationIds.length; i++) {
          for (let j = i + 1; j < treaty.partyNationIds.length; j++) {
             const key = getRelationshipKey(treaty.partyNationIds[i], treaty.partyNationIds[j]);
             if (draft.diplo_relationships[key]) {
               draft.diplo_relationships[key].relationshipScore = Math.min(100, draft.diplo_relationships[key].relationshipScore + 10);
               draft.diplo_relationships[key].activeTreatyIds.push(treatyId);
               if (treaty.type === 'MUTUAL_DEFENCE') {
                 draft.diplo_relationships[key].isAlly = true;
               }
             }
          }
        }
        
        draft.diplo_directorLog.unshift(diplo_generateEventNarrative('TREATY_RATIFIED', treaty.codename, treaty.partyNationIds.join(', '), treaty.type, currentTick));
        if (draft.diplo_directorLog.length > 50) draft.diplo_directorLog.pop();

        useWorldStore.getState().addGlobalEvent(`TREATY_RATIFIED: ${treaty.codename}`, 'INFO');
        useCinematicsStore.getState().triggerCinematic('IRON_COVENANT_TREATY_RATIFIED', { treatyId });
      }
    })),

    diplo_violateTreaty: (treatyId, violatingNationId, violation, currentTick) => set(produce(draft => {
       const treaty = draft.diplo_treaties[treatyId];
       if (treaty) {
         const vRec: Treaty_ViolationRecord = { ...violation, id: `viol_${Date.now()}` };
         treaty.violationLog.push(vRec);
         
         const others = treaty.partyNationIds.filter(n => n !== violatingNationId);
         others.forEach(oId => {
           const key = getRelationshipKey(violatingNationId, oId);
           const rel = draft.diplo_relationships[key];
           if (rel) {
             if (violation.severity === 'TECHNICAL') rel.relationshipScore -= 5;
             if (violation.severity === 'MATERIAL') { rel.relationshipScore -= 20; treaty.status = 'VIOLATED'; }
             if (violation.severity === 'FUNDAMENTAL') { rel.relationshipScore -= 40; treaty.status = 'VIOLATED'; }
             if (violation.severity === 'CASUS_BELLI') { 
                rel.relationshipScore -= 60; 
                treaty.status = 'VIOLATED'; 
                useWorldStore.getState().addGlobalEvent('CASUS_BELLI_DECLARED', 'CRITICAL');
             }
           }
         });
         
         useWorldStore.getState().addGlobalEvent(`TREATY_VIOLATED: ${treaty.codename}`, 'WARNING');
       }
    })),

    diplo_terminateTreaty: (treatyId, terminatingNationId, currentTick) => set(produce(draft => {
      const treaty = draft.diplo_treaties[treatyId];
      if (treaty) {
        treaty.status = 'TERMINATED';
        treaty.terminatedAtTick = currentTick;
        treaty.partyNationIds.forEach(idA => {
           treaty.partyNationIds.forEach(idB => {
              if (idA !== idB) {
                const key = getRelationshipKey(idA, idB);
                if (draft.diplo_relationships[key]) {
                  draft.diplo_relationships[key].relationshipScore -= 15;
                  draft.diplo_relationships[key].activeTreatyIds = draft.diplo_relationships[key].activeTreatyIds.filter(tid => tid !== treatyId);
                }
              }
           });
        });
        useWorldStore.getState().addGlobalEvent(`TREATY_TERMINATED: ${treaty.codename}`, 'INFO');
      }
    })),

    diplo_deployInstrument: (instrument, fromNationId, toNationId, currentTick, expiryTicks) => set(produce(draft => {
      draft.diplo_pendingInstruments.push({
        instrument, fromNationId, toNationId, sentAtTick: currentTick, expiryTick: expiryTicks ? currentTick + expiryTicks : null, isResponded: false
      });
      const key = getRelationshipKey(fromNationId, toNationId);
      const rel = draft.diplo_relationships[key];
      if (rel) {
        if (instrument === 'FORMAL_PROTEST') rel.relationshipScore -= 5;
        if (instrument === 'AMBASSADOR_RECALL') rel.relationshipScore -= 15;
        if (instrument === 'AMBASSADOR_EXPULSION') rel.relationshipScore -= 30;
        if (instrument === 'EMBASSY_CLOSURE') { rel.relationshipScore -= 50; rel.posture = 'RUPTURE'; }
        if (instrument === 'ULTIMATUM') rel.relationshipScore -= 10;
        if (instrument === 'BACK_CHANNEL_CONTACT') { rel.relationshipScore += 5; rel.backChannelActive = true; rel.backChannelContactTick = currentTick; }
        if (instrument === 'RECOGNITION_WITHDRAWAL') rel.relationshipScore -= 40;
        if (instrument === 'RECOGNITION_GRANT') rel.relationshipScore += 25;
      }
      
      draft.diplo_directorLog.unshift(diplo_generateEventNarrative(instrument, fromNationId, toNationId, 'Deployed', currentTick));
      if (draft.diplo_directorLog.length > 50) draft.diplo_directorLog.pop();
      useWorldStore.getState().addGlobalEvent(`DIPLO_INSTRUMENT_DEPLOYED: ${instrument} from ${fromNationId} to ${toNationId}`, 'INFO');
    })),

    diplo_proposeUNSCResolution: (resolution, currentTick) => {
      const id = `unsc_${Date.now()}`;
      set(produce(draft => {
         draft.diplo_unscResolutions.push({
           ...resolution, id, proposedAtTick: currentTick, status: 'PROPOSED', votedAtTick: null, votes: [], vetoedBy: []
         });
         useWorldStore.getState().addGlobalEvent(`UNSC_RESOLUTION_PROPOSED: ${resolution.codename}`, 'INFO');
      }));
      return id;
    },

    diplo_callUNSCVote: (resolutionId, currentTick) => set(produce(draft => {
       const res = draft.diplo_unscResolutions.find(r => r.id === resolutionId);
       if (res && res.status === 'PROPOSED') {
         res.status = 'UNDER_DEBATE';
       }
    })),

    diplo_spendDiplomaticCapital: (type, amount, purpose, currentTick) => {
       let success = false;
       set(produce(draft => {
          if (draft.diplo_capitalPool[type] >= amount) {
             draft.diplo_capitalPool[type] -= amount;
             draft.diplo_capitalPool.totalSpentThisSession += amount;
             success = true;
          }
       }));
       return success;
    },

    diplo_replenishCapital: (type, amount) => set(produce(draft => {
       draft.diplo_capitalPool[type] += amount;
    })),

    diplo_establishBloc: (bloc, currentTick) => {
       const id = `bloc_${Date.now()}`;
       set(produce(draft => {
          draft.diplo_blocs[id] = { ...bloc, id, establishedAtTick: currentTick, lastMeetingTick: currentTick, cohesionScore: 80, status: 'ACTIVE' };
          useWorldStore.getState().addGlobalEvent(`DIPLO_BLOC_FORMED: ${bloc.name}`, 'INFO');
       }));
       return id;
    },

    diplo_joinBloc: (blocId, nationId, currentTick) => set(produce(draft => {
       const b = draft.diplo_blocs[blocId];
       if (b && !b.memberNationIds.includes(nationId)) b.memberNationIds.push(nationId);
    })),

    diplo_fractureBlocMember: (blocId, nationId, currentTick) => set(produce(draft => {
       const b = draft.diplo_blocs[blocId];
       if (b) {
          b.memberNationIds = b.memberNationIds.filter(id => id !== nationId);
          b.cohesionScore -= 20;
          if (b.memberNationIds.length < 2) b.status = 'DISSOLVED';
       }
    })),

    diplo_launchSoftPowerProgramme: (prog, currentTick) => {
       const id = `sp_${Date.now()}`;
       set(produce(draft => {
          draft.diplo_softPowerProgrammes.push({
             ...prog, id, startTick: currentTick, isActive: true, cumulativeEffect: 0
          });
       }));
       return id;
    },

    diplo_postAmbassador: (ambassador, currentTick) => {
       const id = `amb_${Date.now()}`;
       set(produce(draft => {
          draft.diplo_ambassadors.push({ ...ambassador, id, postedAtTick: currentTick, recalledAtTick: null });
       }));
       return id;
    },

    diplo_recallAmbassador: (ambId, currentTick) => set(produce(draft => {
       const amb = draft.diplo_ambassadors.find(a => a.id === ambId);
       if (amb) { amb.status = 'RECALLED'; amb.recalledAtTick = currentTick; }
    })),

    diplo_expelAmbassador: (ambId, expellingNationId, currentTick) => set(produce(draft => {
       const amb = draft.diplo_ambassadors.find(a => a.id === ambId);
       if (amb) {
          amb.status = 'EXPELLED';
          amb.recalledAtTick = currentTick;
          const key = getRelationshipKey(amb.assignedNationId, expellingNationId);
          if (draft.diplo_relationships[key]) draft.diplo_relationships[key].relationshipScore -= 30;
          useWorldStore.getState().addGlobalEvent(`DIPLO_AMBASSADOR_EXPELLED: ${amb.name}`, 'WARNING');
       }
    })),

    diplo_declareCrisis: (crisis, currentTick) => {
       const id = `crisis_${Date.now()}`;
       set(produce(draft => {
          draft.diplo_crises.push({ ...crisis, id, status: 'ACTIVE', resolutionTick: null, outcome: null, chosenResponseId: null });
          useWorldStore.getState().addGlobalEvent(`DIPLO_CRISIS_DECLARED: ${crisis.type}`, 'WARNING');
       }));
       return id;
    },

    diplo_respondToCrisis: (crisisId, responseId, currentTick) => set(produce(draft => {
       const crisis = draft.diplo_crises.find(c => c.id === crisisId);
       if (crisis && crisis.status === 'ACTIVE') {
          const resp = crisis.availableResponses.find(r => r.id === responseId);
          if (resp) {
             crisis.chosenResponseId = responseId;
             if (Math.random() * 100 < resp.probabilityOfResolution) {
                crisis.status = 'RESOLVED';
                crisis.resolutionTick = currentTick;
                crisis.outcome = `Resolved via ${resp.instrument}`;
                draft.diplo_totalCrisesResolved += 1;
                useWorldStore.getState().addGlobalEvent(`DIPLO_CRISIS_RESOLVED: ${crisis.type}`, 'INFO');
             } else {
                if (Math.random() * 100 < resp.escalationRisk) {
                   crisis.status = 'ESCALATED_TO_CONFLICT';
                }
             }
          }
       }
    })),

    diplo_processTick: (currentTick) => set(produce(draft => {
       if (draft.diplo_lastProcessedTick === currentTick) return;

       // Verify treaty compliance 
       Object.values(draft.diplo_treaties).forEach((treaty: any) => {
          if (treaty.status === 'RATIFIED') {
             treaty.terms.forEach(term => {
                if (term.verificationMethod === 'TRUST') {
                   term.complianceScore -= 0.3;
                } else if (term.verificationMethod === 'SIGINT') {
                   // pseudo check
                }
                
                if (term.complianceScore < term.violationThreshold) {
                   treaty.violationLog.push({
                      id: `viol_auto_${currentTick}_${term.id}`,
                      treatyId: treaty.id,
                      violatingNationId: term.obligatingNationId,
                      severity: 'TECHNICAL',
                      description: `Automatic detection of low compliance for term ${term.description}`,
                      detectedAtTick: currentTick,
                      detectionMethod: term.verificationMethod,
                      isConfirmed: true,
                      isDisputed: false,
                      responseActions: [],
                      casus_belli_declared: false
                   });
                   term.complianceScore = term.violationThreshold + 10; // reset slightly to avoid spam
                }
             });
          }
       });

       // UNSC Voting
       draft.diplo_unscResolutions.forEach(res => {
          if (res.status === 'UNDER_DEBATE') {
             let yes = 0, no = 0, veto = false;
             const members = [...draft.diplo_unscMembership.permanentMembers, ...draft.diplo_unscMembership.electedMembers];
             res.votes = [];
             
             members.forEach(nid => {
                const role = draft.diplo_unscMembership.permanentMembers.includes(nid) ? 'P5_PERMANENT' : 'ELECTED_MEMBER';
                let voteOptions = ['YES', 'NO', 'ABSTAIN'];
                let voteCast = voteOptions[Math.floor(Math.random()*3)] as any;
                
                if (nid === res.proposingNationId) voteCast = 'YES';
                if (nid === res.targetNationId) voteCast = 'NO';
                
                res.votes.push({
                   nationId: nid, role, vote: voteCast, wasCoerced: false, capitalSpent: 0, rationale: 'Standard rationale.'
                });
                
                if (voteCast === 'YES') yes++;
                if (voteCast === 'NO') {
                   no++;
                   if (role === 'P5_PERMANENT') {
                      veto = true;
                      res.vetoedBy.push(nid);
                   }
                }
             });
             
             if (veto) {
                res.status = 'VETOED';
                res.votedAtTick = currentTick;
                useWorldStore.getState().addGlobalEvent(`UNSC_RESOLUTION_VETOED: ${res.codename}`, 'WARNING');
             } else if (yes >= 9) {
                res.status = 'PASSED';
                res.votedAtTick = currentTick;
                draft.diplo_totalUNSCResolutionsPassed++;
                useWorldStore.getState().addGlobalEvent(`UNSC_RESOLUTION_PASSED: ${res.codename}`, 'INFO');
             } else {
                res.status = 'FAILED';
                res.votedAtTick = currentTick;
             }
          }
       });

       // Capital replenishment
       draft.diplo_capitalPool.political += 5;
       draft.diplo_capitalPool.economic += 3;
       draft.diplo_capitalPool.military += 2;
       draft.diplo_capitalPool.informational += 4;

       // Soft power programmes
       draft.diplo_softPowerProgrammes.forEach(prog => {
          if (prog.isActive) {
             const key = getRelationshipKey('US', prog.targetNationId);
             if (draft.diplo_relationships[key]) {
                draft.diplo_relationships[key].relationshipScore = Math.min(100, draft.diplo_relationships[key].relationshipScore + prog.effectPerTick);
                prog.cumulativeEffect += prog.effectPerTick;
             }
             if (currentTick >= prog.startTick + prog.durationTicks) {
                prog.isActive = false;
                useWorldStore.getState().addGlobalEvent(`DIPLO_SOFT_POWER_MILESTONE: ${prog.category}`, 'INFO');
             }
          }
       });

       draft.diplo_lastProcessedTick = currentTick;
    }))
  })
);
