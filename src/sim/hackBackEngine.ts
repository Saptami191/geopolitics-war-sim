import { 
  HackBackAuthorityLevel,
  Cyber_HackBackEvent,
  Cyber_TargetType
} from '../types';

export function executeHackBack(authorityLevel: HackBackAuthorityLevel, incident: any, playerAptGroups: any[], playerZeroDays: any[], tick: number): Cyber_HackBackEvent {
    return {
        id: `hb_${Date.now()}`,
        triggeringIncidentId: incident.id,
        authorityLevel,
        targetNationId: incident.attackingNationId,
        targetNodeType: incident.affectedNodeId,
        launchedAtTick: tick,
        effectMagnitude: 50,
        wasSuccessful: true,
        isAttributed: false,
        escalationRisk: 30,
        narrativeDescription: 'Hack-back initiated.'
    }
}
