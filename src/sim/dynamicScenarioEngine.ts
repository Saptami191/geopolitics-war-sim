import { DynamicScenarioTrigger, Dynamic_Scenario } from '../types';

export function checkDynamicScenarioTriggers(worldState: any, defconState: any): DynamicScenarioTrigger | null {
  if (defconState.currentDefconLevel <= 2) return 'DEFCON_SPIKE';
  return null;
}

export function generateDynamicScenario(trigger: DynamicScenarioTrigger, worldState: any, defconState: any, tick: number): Dynamic_Scenario {
  return {
    id: `dyn_${Date.now()}`,
    triggerType: trigger,
    generatedAtTick: tick,
    title: 'THRESHOLD ALERT',
    subtitle: `DEFCON has dropped to ${defconState.currentDefconLevel}. Control the timeline.`,
    briefingText: 'DEFCON has deteriorated without player authorization. A secondary state actor may be exploiting the alert window. Immediate de-escalation required before a momentum cascade locks in automatic responses.',
    objectives: [],
    tickLimit: 15,
    suggestedRole: 'CHIEF_OF_INTELLIGENCE',
    worldStateSnapshot: {},
    isAccepted: false,
    isDeclined: false,
    declinedConsequence: 'DEFCON escalation continues autonomously. Tension +20. AI nations enter heightened alert.'
  };
}
