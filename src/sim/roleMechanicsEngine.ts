import { Role_Type, Role_PowerRecord, RolePower } from '../types';

export function initRolePowers(role: Role_Type): Role_PowerRecord[] {
  if (role === 'SHADOW_DIRECTOR') return [
    { power: 'EXECUTIVE_OVERRIDE', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 15, activeDurationTicks: null, activeSince: null, usesRemaining: 2, totalUses: 2, narrativeDescription: 'Override all oversight and blowback checks for one action.', mechanicalEffect: 'Next CIA/Covert op bypasses congressional check and attribution risk set to 0 for 1 tick.' },
    { power: 'DEEP_COVER_NETWORK', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 30, activeDurationTicks: 20, activeSince: null, usesRemaining: 1, totalUses: 1, narrativeDescription: 'Activate full deep cover network. All operative tradecraft elevated.', mechanicalEffect: 'All CIA operatives: tradecraftScore +2 for 20 ticks; cover stories auto-maintained.' },
    { power: 'PLAUSIBLE_DENIABILITY_FIELD', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 10, activeDurationTicks: 5, activeSince: null, usesRemaining: 3, totalUses: 3, narrativeDescription: 'Full deniability envelope activated across all covert channels.', mechanicalEffect: 'attributionRisk on all active covert ops reduced by 30% for 5 ticks.' }
  ];
  if (role === 'SUPREME_COMMANDER') return [
    { power: 'DIRECT_COMMAND_CHANNEL', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 8, activeDurationTicks: null, activeSince: null, usesRemaining: 3, totalUses: 3, narrativeDescription: 'Issue direct operational orders without diplomatic clearance.', mechanicalEffect: 'Next kinetic conventional op requires no diplomatic authorization check.' },
    { power: 'FORCE_POSTURE_SHIFT', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 20, activeDurationTicks: null, activeSince: null, usesRemaining: 2, totalUses: 2, narrativeDescription: 'Shift national force posture without triggering automatic world event.', mechanicalEffect: 'DEFCON changes by ±1 without triggering AI reaction or tension spike for 1 tick.' },
    { power: 'BATTLEFIELD_MOMENTUM', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 15, activeDurationTicks: 10, activeSince: null, usesRemaining: 2, totalUses: 2, narrativeDescription: 'Exploit operational momentum across all theater commands.', mechanicalEffect: 'All conventional ops successProbability +20% for 10 ticks.' }
  ];
  return [
    { power: 'EYES_ON_EVERYTHING', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 12, activeDurationTicks: 5, activeSince: null, usesRemaining: 3, totalUses: 3, narrativeDescription: 'Surge all collection platforms to maximum capacity.', mechanicalEffect: 'All SIGINT collection tick yields ×1.5 for 5 ticks.' },
    { power: 'NATIONAL_TECHNICAL_MEANS', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 25, activeDurationTicks: null, activeSince: null, usesRemaining: 2, totalUses: 2, narrativeDescription: 'Deploy national technical means against priority target.', mechanicalEffect: 'One fully hidden nation stat revealed and set to CONFIRMED in SIGINT.' },
    { power: 'DOUBLE_AGENT_FLIP', role, status: 'AVAILABLE', cooldownTicks: 0, totalCooldownDuration: 40, activeDurationTicks: null, activeSince: null, usesRemaining: 1, totalUses: 1, narrativeDescription: 'Turn a known adversary operative to your service.', mechanicalEffect: 'Selects highest-value known adversary operative; status flipped to TURNED; feeds disinformation back to adversary.' }
  ];
}
