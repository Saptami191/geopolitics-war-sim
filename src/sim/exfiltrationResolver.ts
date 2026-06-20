import { CIAOperative, CIAOperation, CIAStation, ExfiltrationResult, CIAOperativeStatus } from '../types';

export function resolveExfiltration(
  operative: CIAOperative,
  operation: CIAOperation | null,
  station: CIAStation | null,
  currentTick: number
): ExfiltrationResult {
  // 1. Determine Method
  let method: 'STATION_CHANNEL' | 'EMERGENCY_PICKUP' | 'COVER_IDENTITY' | 'WALK_IN' = 'EMERGENCY_PICKUP';

  // Last resort: if heat is extremely critical and operative decides to surrender/go rogue
  if (operative.heatLevel > 85 && Math.random() < 0.35) {
    method = 'WALK_IN';
  } else if (station && !station.isCompromised) {
    method = 'STATION_CHANNEL';
  } else if (operative.coverIntegrity > 50) {
    method = 'COVER_IDENTITY';
  } else {
    method = 'EMERGENCY_PICKUP';
  }

  let success = false;
  let heatReduction = 0;
  let coverImpact = 0;
  let newStatus: CIAOperativeStatus = 'EXTRACTED';
  let durationTicks = 10;
  let notes = '';

  const rand = Math.random() * 100;

  switch (method) {
    case 'STATION_CHANNEL':
      // High success (95%)
      success = rand < 95;
      heatReduction = Math.round(operative.heatLevel * 0.75); // high reduction
      coverImpact = -5; // very safe, small cost
      durationTicks = 10; // safe channels take time
      if (success) {
        newStatus = 'EXTRACTED';
        notes = `${operative.codename} extracted cleanly via Station Channel in ${operative.nationId}. Safe house networks worked flawlessly.`;
      } else {
        newStatus = 'DETAINED';
        notes = `CRITICAL FAILURE: Safe house network compromised during extraction. ${operative.codename} captured was imprisoned by foreign services.`;
      }
      break;

    case 'COVER_IDENTITY':
      // Moderate success (80%)
      success = rand < 80;
      heatReduction = Math.round(operative.heatLevel * 0.4); // modest reduction
      coverImpact = -30; // burns cover to slip through border
      durationTicks = 5; // rapid transit
      if (success) {
        newStatus = 'EXTRACTED';
        notes = `${operative.codename} exfiltrated under cover fallback legends. Border security bypassed successfully.`;
      } else {
        newStatus = 'DETAINED';
        notes = `BORDER CAPTURE: ${operative.codename}'s legend collapsed under deep counter-intelligence vetting. Agent is detained.`;
      }
      break;

    case 'EMERGENCY_PICKUP':
      // Lower success chance (70%)
      success = rand < 70;
      heatReduction = 5; // loud and hot, heat remains
      coverImpact = -50; // completely burns the identity
      durationTicks = 12; // tactical exfil takes preparation
      if (success) {
        newStatus = 'EXTRACTED';
        notes = `TACTICAL SUCCESS: Low-level helicopters or maritime insertion successfully snatched ${operative.codename} from extraction point. Noisy but complete.`;
      } else {
        // High risk failure on emergency pickup
        const deathRoll = Math.random() * 100;
        if (deathRoll < 15) {
          newStatus = 'KIA';
          notes = `Lethal firefight at extraction point. Operative ${operative.codename} confirmed Killed in Action.`;
        } else if (deathRoll < 35) {
          newStatus = 'DOUBLED';
          notes = `Operative ${operative.codename} went dark during ambush and is believed to have defected to target host state.`;
        } else {
          newStatus = 'DETAINED';
          notes = `Extraction team was forced to pull back under heavy fire. ${operative.codename} was captured and detained.`;
        }
      }
      break;

    case 'WALK_IN':
      // Last resort surrendered
      success = rand < 50;
      heatReduction = 100; // no longer hunted
      coverImpact = -100; // completely unmasked
      durationTicks = 20; // diplomatic negotiations or deep processing
      if (success) {
        newStatus = 'EXTRACTED';
        notes = `Operative ${operative.codename} surrendered to local authorities, subsequently traded in a clandestine prisoner exchange.`;
      } else {
        newStatus = 'DOUBLED';
        notes = `Operative ${operative.codename} broke under interrogation pressure or voluntarily aligned with local agencies, turning against the Agency.`;
      }
      break;
  }

  return {
    success,
    method,
    heatReduction,
    coverIntegrityImpact: coverImpact,
    newStatus,
    durationTicks,
    notes
  };
}

export function resolveEmergencyExtraction(
  operatives: CIAOperative[],
  station: CIAStation | null,
  currentTick: number
): ExfiltrationResult[] {
  return operatives.map(op => resolveExfiltration(op, null, station, currentTick));
}
