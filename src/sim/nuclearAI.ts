import { useNuclearStore } from '../store/nuclearStore';
import { useLeaderStore } from '../store/leaderStore';
import { useDefconStore } from '../store/defconStore';
import { useWorldStore } from '../store/worldStore';
import { useCinematicsStore } from '../store/cinematicsStore';
import { TriadPostureLevel } from '../types';
import { produce } from 'immer';

export function tickNuclearAI(currentTick: number): void {
  const adversaryCountryIds = ['RU', 'CN', 'KP'];
  const nuclearStore = useNuclearStore.getState();
  const defconStore = useDefconStore.getState();
  const worldStore = useWorldStore.getState();
  const leaderStore = useLeaderStore.getState();
  const cinematicsStore = useCinematicsStore.getState();

  const firstUseOccurred = nuclearStore.tabooState.firstUseOccurred;
  const playerDefcon = defconStore.currentDefconLevel;
  const globalTabooIntactness = nuclearStore.tabooState.globalTabooIntactness;

  adversaryCountryIds.forEach(countryId => {
    const leader = leaderStore.getLeader(countryId);
    const country = worldStore.countries[countryId];
    
    // STEP 1 — Assess threat level
    let retaliationPressure = 0;
    
    // - If player has used nuclear weapons (firstUseOccurred)
    if (firstUseOccurred) {
      retaliationPressure += 60;
    }
    // - If player DEFCON <= 2
    if (playerDefcon <= 2) {
      retaliationPressure += 20;
    }
    
    // - If adversary leader volatility / anxiety > 75
    if (leader) {
      const volatility = leader.psychology?.emotions.anxiety || Math.round(leader.riskTolerance * 100);
      if (volatility > 75) {
        retaliationPressure += 15;
      }
      
      // - If adversary leader humiliation > 70
      const humiliation = leader.psychology?.emotions.humiliation || 0;
      if (humiliation > 70) {
        retaliationPressure += 20;
      }
      
      // - If adversary leader emboldened > 80
      const emboldened = leader.psychology?.emotions.emboldenment || 0;
      if (emboldened > 80) {
        retaliationPressure += 10;
      }
    }
    
    // - If globalTabooIntactness < 50
    if (globalTabooIntactness < 50) {
      retaliationPressure += 25;
    }
    
    // - If adversary country stability < 30
    const stability = country?.political?.stabilityIndex || 50;
    if (stability < 30) {
      retaliationPressure += 10;
    }

    // Keep retaliation pressure between 0 and 100
    retaliationPressure = Math.max(0, Math.min(100, retaliationPressure));

    // Get current adversary posture
    const advPostureState = nuclearStore.getAdversaryPosture(countryId) || {
      countryId,
      posture: 'PEACETIME' as TriadPostureLevel,
      retaliationPressure: 0,
      lastEscalationTick: null,
      launchCommitted: false
    };

    const currentPosture = advPostureState.posture;
    let nextPosture = currentPosture;

    // STEP 2 — Posture escalation (or de-escalation)
    if (retaliationPressure > 30 && currentPosture === 'PEACETIME') {
      nextPosture = 'ELEVATED';
      worldStore.addGlobalEvent(`NATIONAL DEFENSE SENSING: Adversary ${countryId} scales strategic nuclear forces to ELEVATED alert level under perceived security threats.`, 'AMBER');
    } else if (retaliationPressure > 55 && currentPosture === 'ELEVATED') {
      nextPosture = 'SURGE';
      worldStore.addGlobalEvent(`NATIONAL DEFENSE SENSING: Adversary ${countryId} strategic rocket divisions deploy and submarines disperse under SURGE alert posture.`, 'RED');
    } else if (retaliationPressure > 80 && currentPosture === 'SURGE') {
      nextPosture = 'HAIR_TRIGGER';
      worldStore.addGlobalEvent(`CRITICAL WARNING: Adversary ${countryId} moves strategic posture to HAIR-TRIGGER. Command in-the-loop delegation is authorized.`, 'CRITICAL');
      
      cinematicsStore.queueScene({
        type: 'ADVERSARY_NUCLEAR_POSTURE_ESCALATION',
        totalPhases: 3,
        phaseDurationMs: 4000,
        blocksInput: true,
        isSkippable: true,
        autoAdvance: true,
        payload: { countryId, posture: 'HAIR_TRIGGER', retaliationPressure }
      });
    } else if (retaliationPressure < 25) {
      // STEP 4 — De-escalation
      if (currentPosture === 'HAIR_TRIGGER') {
        nextPosture = 'SURGE';
        worldStore.addGlobalEvent(`INTEL REPORT: Adversary ${countryId} de-escalates nuclear forces from Hair-Trigger back to Surge capability as pressures subside.`, 'AMBER');
      } else if (currentPosture === 'SURGE') {
        nextPosture = 'ELEVATED';
        worldStore.addGlobalEvent(`INTEL REPORT: Adversary ${countryId} returns deployed strategic ballistic missile submarines to base (ELEVATED).`, 'INFO');
      } else if (currentPosture === 'ELEVATED') {
        nextPosture = 'PEACETIME';
        worldStore.addGlobalEvent(`INTEL REPORT: Adversary ${countryId} strategic command returns to PEACETIME readiness levels. Forces standard reserve.`, 'GREEN');
      }
    }

    // Save state
    const updates: Partial<typeof advPostureState> = {
      retaliationPressure,
      posture: nextPosture
    };
    if (nextPosture !== currentPosture) {
      updates.lastEscalationTick = currentTick;
    }

    nuclearStore.updateAdversaryPosture(countryId, updates);

    // STEP 3 & ADVERSARY WEAPON BEHAVIOR — Launch decision
    if (retaliationPressure > 90 && firstUseOccurred && !advPostureState.launchCommitted) {
      // Adversary has weapons with status MATED or ON_ALERT
      const weapons = Object.values(nuclearStore.weapons).filter(w => 
        w.countryId === countryId && 
        (w.status === 'MATED' || w.status === 'ON_ALERT')
      );
      
      if (weapons.length > 0) {
        // Roll launch probability: Math.random() < 0.15 per tick
        if (Math.random() < 0.15) {
          const w = weapons[0];
          
          // Set to LAUNCHED
          useNuclearStore.setState(produce((draft: any) => {
            const draftW = draft.weapons[w.id];
            if (draftW) {
              draftW.status = 'LAUNCHED';
              draftW.launchedTick = currentTick;
              draftW.targetCountryId = 'US';
              draftW.targetLat = 38.9072;
              draftW.targetLon = -77.0369;
            }
            if (draft.adversaryPosture[countryId]) {
              draft.adversaryPosture[countryId].launchCommitted = true;
              draft.adversaryPosture[countryId].posture = 'LAUNCH_AUTHORIZED';
            }
          }));

          worldStore.addGlobalEvent(`WARNING: [${countryId} LAUNCH DETECTED] Strategic radar confirms outbound thermal ignition tracks. Threat class: ${w.class}. Target: USA.`, 'CRITICAL');

          cinematicsStore.queueScene({
            type: 'ADVERSARY_NUCLEAR_LAUNCH_DETECTED',
            totalPhases: 3,
            phaseDurationMs: 4000,
            blocksInput: true,
            isSkippable: false,
            autoAdvance: true,
            payload: { countryId, weaponClass: w.class, weaponId: w.id }
          });

          // Trigger warning assessment for player
          nuclearStore.initiateWarningAssessment(
            `${countryId} STRATEGIC BALLISTIC MISSILE INBOUND`,
            countryId,
            98, // 98% confidence
            currentTick
          );
        }
      }
    }
  });
}
