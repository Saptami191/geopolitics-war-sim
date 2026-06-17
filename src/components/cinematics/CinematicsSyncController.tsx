import { useEffect, useRef } from 'react';
import { useCinematicsStore } from '../../store/cinematicsStore';
import { useDefconStore } from '../../store/defconStore';
import { useFxStore } from '../../store/fxStore';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { audio } from '../../utils/audio';

export function CinematicsSyncController() {
  const queueScene = useCinematicsStore((state) => state.queueScene);

  // Use refs to avoid double-firing or recursive loops
  const bootTriggered = useRef(false);
  const defcon1Triggered = useRef(false);
  const exchangeTriggered = useRef(false);
  const aftermathTriggered = useRef(false);
  const lastEventLoggedLength = useRef(0);
  const scenarioInitTriggered = useRef(false);

  // Cache previously processed event texts to limit duplicate triggers
  const processedEvents = useRef<string[]>([]);
  const processedFxIds = useRef<string[]>([]);

  // WATCHER 1: Boot Sequence on Core Mount
  useEffect(() => {
    if (!bootTriggered.current) {
      bootTriggered.current = true;
      const t = setTimeout(() => {
        queueScene({
          type: 'SCENARIO_BOOT',
          totalPhases: 3,
          isSkippable: false,
          blocksInput: true,
          phaseDurationMs: 2000,
          autoAdvance: true,
          payload: {}
        });
      }, 800);

      return () => clearTimeout(t);
    }
  }, [queueScene]);

  // WATCHER 2: DEFCON 1 Lockdown
  const currentDefcon = useDefconStore((state) => state.currentDefconLevel);
  const currentTick = useWorldStore((state) => state.currentTick);

  useEffect(() => {
    if (currentDefcon === 1 && !defcon1Triggered.current) {
      defcon1Triggered.current = true;
      queueScene({
        type: 'DEFCON_1_LOCKDOWN',
        totalPhases: 5,
        isSkippable: false,
        blocksInput: false,
        phaseDurationMs: 1200,
        autoAdvance: true,
        payload: {
          triggerReason: 'HOSTILE BLOCK INTERCEPT DETECTED — NUCLEAR STATUS ACTIVE',
          currentTick
        }
      });
    } else if (currentDefcon > 1) {
      // Allow re-escalation triggering if player/enemies step down and back up
      defcon1Triggered.current = false;
    }
  }, [currentDefcon, currentTick, queueScene]);

  // WATCHER 3: Nuclear Exchange Detection inside fxStore
  const activeFx = useFxStore((state) => state.activeFx);

  useEffect(() => {
    const catastrophicDetonation = (activeFx || []).find(
      (fx) => fx.type === 'NUCLEAR_DETONATION' && !processedFxIds.current.includes(fx.id)
    );

    if (catastrophicDetonation && !exchangeTriggered.current) {
      exchangeTriggered.current = true;
      processedFxIds.current.push(catastrophicDetonation.id);
      
      queueScene({
        type: 'NUCLEAR_EXCHANGE',
        totalPhases: 4,
        isSkippable: true,
        blocksInput: false,
        phaseDurationMs: 1600,
        autoAdvance: true,
        payload: {
          strikerCountry: catastrophicDetonation.sourceCountryId || 'COALITION SILO',
          targetCountry: catastrophicDetonation.targetCountryId || 'TARGET SECTOR',
          weaponCount: catastrophicDetonation.payload?.weaponCount || 24,
          estimatedYield: catastrophicDetonation.payload?.yield || '45.8MT'
        }
      });
    }
  }, [activeFx, queueScene]);

  // WATCHER 4 & 5: Regime Change and Ceasefire tracking in globalEventLog
  const globalEventLog = useWorldStore((state) => state.globalEventLog);

  useEffect(() => {
    if (!globalEventLog || globalEventLog.length === 0) return;

    const latestEvent = globalEventLog[0];
    const logLength = globalEventLog.length;

    if (logLength > lastEventLoggedLength.current) {
      lastEventLoggedLength.current = logLength;

      if (latestEvent && latestEvent.tick > 0 && !processedEvents.current.includes(latestEvent.text)) {
        processedEvents.current.push(latestEvent.text);
        const txt = latestEvent.text.toLowerCase();

        // Check for Coup / Regime Change patterns
        if (
          txt.includes('coup') || 
          txt.includes('regime change') || 
          txt.includes('deposed') || 
          txt.includes('government fell') || 
          txt.includes('regime collapsed')
        ) {
          // simple country parsing
          let extractedCountry = 'UNKNOWN SECTOR';
          const countries = useWorldStore.getState().countries;
          if (countries) {
            Object.values(countries).forEach((c: any) => {
              if (latestEvent.text.includes(c.name)) {
                extractedCountry = c.name;
              }
            });
          }

          queueScene({
            type: 'REGIME_CHANGE_SEQUENCE',
            totalPhases: 4,
            isSkippable: true,
            blocksInput: false,
            phaseDurationMs: 1400,
            autoAdvance: true,
            payload: {
              country: extractedCountry,
              method: txt.includes('coup') ? "COUP D'ÉTAT" : 'MILITARY TRANSITION',
              oldLeader: 'PREVIOUS EXECUTIVE REGIME',
              newLeader: 'JOINT CRISIS BOARD AUTHORITY',
              backingPower: 'FOREIGN CONFLICT INTELLIGENCE'
            }
          });
        }

        // Check for Ceasefire patterns
        if (txt.includes('ceasefire') || txt.includes('armistice') || txt.includes('peace treaty')) {
          queueScene({
            type: 'CEASEFIRE_EPILOGUE',
            totalPhases: 3,
            isSkippable: true,
            blocksInput: false,
            phaseDurationMs: 2200,
            autoAdvance: true,
            payload: {
              party1: 'COALITION DEFENSE FORCE',
              party2: 'RIVAL BLOC LEAGUE',
              conflictDuration: currentTick,
              terms: [
                'Complete termination of forward combat trajectories.',
                'Establish secure neutral boundaries mapped to current sectors.',
                'Joint radioactive monitoring coordinates initialized.'
              ]
            }
          });
        }
      }
    }
  }, [globalEventLog, currentTick, queueScene]);

  // WATCHER 6: Market Crash tracking from fxStore
  useEffect(() => {
    const marketCrashFx = (activeFx || []).find(
      (fx) => fx.type === 'MARKET_CRASH' && !processedFxIds.current.includes(fx.id)
    );

    if (marketCrashFx) {
      processedFxIds.current.push(marketCrashFx.id);
      queueScene({
        type: 'MARKET_CRASH_BROADCAST',
        totalPhases: 3,
        isSkippable: true,
        blocksInput: false,
        phaseDurationMs: 2000,
        autoAdvance: true,
        payload: {
          affectedMarkets: 'New York, London, Tokyo, Shanghai, Frankfurt',
          crashMagnitude: '24.9%',
          triggerEvent: 'Hyper-escalation risk indices exceeded threshold bounds'
        }
      });
    }
  }, [activeFx, queueScene]);

  // WATCHER 7: Aftermath
  const aftermathActive = usePlayerStore((state) => state.aftermathActive);
  const nuclearExchangeOccurred = useWorldStore((state) => state.nuclearExchangeOccurred);

  useEffect(() => {
    if ((aftermathActive || nuclearExchangeOccurred) && !aftermathTriggered.current) {
      aftermathTriggered.current = true;
      queueScene({
        type: 'NUCLEAR_AFTERMATH',
        totalPhases: 5,
        isSkippable: false,
        blocksInput: true,
        phaseDurationMs: 3200,
        autoAdvance: true,
        payload: {
          totalWarheads: 48,
          globalDamage: 84,
          outcome: aftermathActive ? 'MUTUAL DESTRUCTION' : 'PYRRHIC ESCALATION',
          currentTick
        }
      });
    }
  }, [aftermathActive, nuclearExchangeOccurred, currentTick, queueScene]);

  // WATCHER 8: Scenario Start
  const activeScenario = usePlayerStore((state) => state.activeScenario);
  const playerCountry = usePlayerStore((state) => state.countryId);
  const playerPersona = usePlayerStore((state) => state.pendingStrike); // Or default fallback

  useEffect(() => {
    // Detect scenario starting (when activeScenario is set and boot sequence has happened)
    if (activeScenario && !scenarioInitTriggered.current && bootTriggered.current) {
      scenarioInitTriggered.current = true;
      
      const scenarioNameMapped = activeScenario === 'MENA_SPARK' 
        ? 'Crisis in Jordan' 
        : activeScenario === 'STRAIT_CLOSURE' 
        ? 'Sovereign Drift' 
        : activeScenario === 'KASHMIR_FLASHPOINT' 
        ? 'Aperture DMZ'
        : 'Sovereign Operation';

      const briefingTxt = `Operational parameters require immediate cabinet assessment of diplomatic shield structures. Initiate tactical reconnaissance immediately.`;

      queueScene({
        type: 'SCENARIO_START',
        totalPhases: 4,
        isSkippable: true,
        blocksInput: false,
        phaseDurationMs: 2200,
        autoAdvance: true,
        payload: {
          scenarioName: scenarioNameMapped,
          year: '2026',
          playerCountry,
          playerPersona: 'EXECUTIVE SUPREME CHANCELLOR',
          briefingText: briefingTxt,
          threatLevel: 'ORANGE'
        }
      });
    }
  }, [activeScenario, playerCountry, playerPersona, queueScene]);

  return null;
}

export default CinematicsSyncController;
