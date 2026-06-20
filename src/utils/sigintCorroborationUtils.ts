import { SigintSignal, ArachneIntelItem } from '../types';

export type CorroborationNode = {
  type: 'SIGINT' | 'SIGINT_LINK' | 'ARACHNE' | 'FININT' | 'ANALYST_OVERRIDE';
  label: string;
  detail: string;
  tick: number;
};

export function getCorroborationTrail(
  signal: SigintSignal,
  allSignals: SigintSignal[],
  arachneFeeds: ArachneIntelItem[],
  finintState: any,
  currentTick: number
): CorroborationNode[] {
  const nodes: CorroborationNode[] = [];

  // NODE 1: Original collection
  nodes.push({
    type: 'SIGINT',
    label: `${signal.channel} INTERCEPT`,
    detail: `Original collection intercept from target nation. Detected at Tick ${signal.detectedAtTick}.`,
    tick: signal.detectedAtTick
  });

  // NODE 2: Linked SIGINT links
  if (signal.linkedSignalIds && signal.linkedSignalIds.length > 0) {
    const linkedCount = signal.linkedSignalIds.length;
    nodes.push({
      type: 'SIGINT_LINK',
      label: 'CORROBORATING INTERCEPTS',
      detail: `Corroborated by ${linkedCount} other raw signal(s) from identical target space within the past 10 ticks.`,
      tick: signal.detectedAtTick
    });
  }

  // NODE 3: Arachne OSINT matches
  const matchingArachne = arachneFeeds.find(
    (f) =>
      f.countryIds?.includes(signal.sourceNationId) &&
      (f.confidence === 'HIGH' || f.confidence === 'MEDIUM') &&
      Math.abs((f.timestampTick ?? currentTick) - currentTick) <= 10
  );
  if (matchingArachne) {
    nodes.push({
      type: 'ARACHNE',
      label: 'ARACHNE OSINT CORROBORATION',
      detail: `Matched corporate, procurement, or social record: "${matchingArachne.title}"`,
      tick: matchingArachne.timestampTick ?? currentTick
    });
  }

  // NODE 4: FININT corroboration check
  let matchedIncidentDetail = '';
  let incidentTick = currentTick;
  try {
    const incidents = finintState?.incidentsLog ?? [];
    const actors = finintState?.actors ?? [];
    const matchingIncident = incidents.find((incident: any) => {
      if (Math.abs(incident.tick - currentTick) > 5) return false;
      const actor = actors.find((a: any) => a.id === incident.actorId);
      return actor && actor.linkedCountryId === signal.sourceNationId;
    });

    if (matchingIncident) {
      matchedIncidentDetail = `Financial anomaly event logged matching actor trace on Tick ${matchingIncident.tick}.`;
      incidentTick = matchingIncident.tick;
    }
  } catch {
    // safe fallback
  }

  if (matchedIncidentDetail) {
    nodes.push({
      type: 'FININT',
      label: 'FININT FLOW EXPOSURE',
      detail: matchedIncidentDetail,
      tick: incidentTick
    });
  }

  // NODE 5: Analyst elevation override of the confidence/visibility
  if (signal.analystElevated) {
    nodes.push({
      type: 'ANALYST_OVERRIDE',
      label: 'ANALYST OVERRIDE',
      detail: 'Manual validation. Signal visibility elevated by Senior SIGINT Director.',
      tick: currentTick
    });
  }

  return nodes;
}
