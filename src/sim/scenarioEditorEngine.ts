import { Scenario, ScenarioEditor_Draft, Scenario_Objective } from '../types';

export function initEditorDraft(tick: number): ScenarioEditor_Draft {
  return {
    id: `DRAFT_${Date.now()}`,
    title: '',
    subtitle: '',
    classificationLevel: 'TOP_SECRET',
    briefingText: '',
    executiveSummaryText: '',
    availableRoles: ['SHADOW_DIRECTOR'],
    availableToneModes: ['REALISM'],
    primaryAdversaryNationId: '',
    keyNationIds: [],
    tickLimit: 50,
    objectives: [],
    startingConditions: [],
    restrictedInstruments: [],
    forcedEvents: [],
    historicalContext: '',
    createdAtTick: tick,
    lastModifiedAtTick: tick,
    validationStatus: 'ERROR',
    validationMessages: ['Title required', 'At least one PRIMARY objective required'],
    isPublished: false
  };
}

export function validateEditorDraft(draft: ScenarioEditor_Draft): { status: 'VALID' | 'WARNING' | 'ERROR', messages: string[] } {
    if (draft.title.length < 3) return { status: 'ERROR', messages: ['Title too short'] };
    return { status: 'VALID', messages: [] };
}
