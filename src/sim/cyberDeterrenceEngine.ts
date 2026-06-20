import { 
  Cyber_DeterrenceRecord,
  CyberDeterrenceSignalType
} from '../types';

export function issueDeterrenceSignal(playerNationId: string, targetNationId: string, signalType: CyberDeterrenceSignalType, cyberCapabilityScore: number, tick: number): Cyber_DeterrenceRecord {
  return {
    id: `det_${Date.now()}`,
    playerNationId,
    targetNationId,
    signalType,
    issuedAtTick: tick,
    credibilityScore: 70,
    deterrenceEffect: 50,
    counterpartAcknowledged: false,
    isActive: true,
    expiresAtTick: tick + 30
  };
}
