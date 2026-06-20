import { 
  Cyber_SupplyChainImplant,
  SupplyChainImplantTarget
} from '../types';

export function createSupplyChainImplant(sponsoringNationId: string, implantType: SupplyChainImplantTarget, targetVendorId: string, affectedNationIds: string[], accessLevel: 'READ_ONLY' | 'LATERAL_ACCESS' | 'FULL_CONTROL', tick: number): Cyber_SupplyChainImplant {
  const codename = `SUPPLY_${Date.now()}`;
  const dormantRisk = 2.0;

  return {
    id: `impl_${Date.now()}`,
    codename,
    implantType,
    sponsoringNationId,
    targetVendorId,
    affectedNationIds,
    isActivated: false,
    dormantSince: tick,
    activatedAtTick: null,
    dormantDetectionRiskPerTick: dormantRisk,
    activeDetectionRiskPerTick: dormantRisk * 8,
    accessLevel,
    currentCompromisedNodeIds: [],
    exfiltrationBandwidth: 5,
    isDiscovered: false,
    discoveredAtTick: null,
    estimatedDuration: 50
  };
}
