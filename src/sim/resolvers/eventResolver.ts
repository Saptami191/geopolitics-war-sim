import { CanonicalWorld, WorldEvent } from '../../types';

export function resolveEvents(world: CanonicalWorld, currentTick: number): { updatedEvents: Record<string, WorldEvent>; logs: string[] } {
  const updatedEvents = { ...world.eventsById };
  const logs: string[] = [];

  Object.keys(updatedEvents).forEach((id) => {
    const event = { ...updatedEvents[id] };

    // Lifecycle: active / emerging / resolved / archived
    if (event.status === 'emerging') {
      event.status = 'active';
      logs.push(`Crisis Emerging: "${event.title}" is now active in ${event.involvedCountryIds.join(', ')}.`);
    } else if (event.status === 'active') {
      // Escalation and severity drift over time
      if (event.severity === 'CRITICAL') {
        event.escalationPotential = Math.min(100, event.escalationPotential + Math.floor(Math.random() * 3) + 1);
        if (event.escalationPotential >= 95 && Math.random() < 0.15) {
          logs.push(`Flashpoint Escalate: Regional standoff around "${event.title}" reached critical threshold!`);
        }
      } else if (event.severity === 'WARNING') {
        event.escalationPotential = Math.min(100, event.escalationPotential + (Math.random() > 0.5 ? 1 : 0));
      } else {
        event.escalationPotential = Math.max(0, event.escalationPotential - 1);
      }

      // Check auto resolution
      if (event.endTick !== null && currentTick >= event.endTick) {
        event.status = 'resolved';
        event.escalationPotential = Math.max(0, event.escalationPotential - 30);
        logs.push(`Crisis Resolved: Tension mitigated on event "${event.title}".`);
      }
    } else if (event.status === 'resolved') {
      // Archive after 10 ticks
      if (currentTick - (event.endTick || currentTick) > 10) {
        event.status = 'archived';
        logs.push(`Archive Report: Action logs for "${event.title}" archived for historical records.`);
      }
    }

    updatedEvents[id] = event;
  });

  // Dynamic dynamic event trigger seed proof
  if (currentTick > 0 && currentTick % 12 === 0) {
    const freshId = `evt_spontaneous_${currentTick}`;
    const dynamicEvent: WorldEvent = {
      id: freshId,
      type: 'ECONOMIC',
      title: 'Strait of Malacca Congestion Blockade',
      description: 'Localized shipping lanes clogged following a minor littoral collision; logistics risks elevated.',
      severity: 'WARNING',
      status: 'active',
      visibility: 'PUBLIC',
      startTick: currentTick,
      endTick: currentTick + 15,
      involvedCountryIds: ['CN', 'US'],
      involvedLeaderIds: [],
      originatingSystem: 'NAVIGATIONAL_COMPASS',
      effects: ['Cargo shipping rates increased +30%'],
      tags: ['REGIONAL_CONGESTION', 'TRADE_CHOKEPOINT'],
      linkedOperationIds: [],
      linkedIntelFactIds: [],
      escalationPotential: 40,
      historicalLogEntries: ['Collision registered at nautical mile marker 115.'],
    };
    updatedEvents[freshId] = dynamicEvent;
    logs.push(`Dynamic Event: Clogged shipping logistics lanes registered near Strait of Malacca.`);
  }

  return { updatedEvents, logs };
}
