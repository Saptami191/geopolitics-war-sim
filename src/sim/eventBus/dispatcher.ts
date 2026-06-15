import { BusEvent } from './types';
import { CanonicalWorld, Country } from '../../types';
import { handleEconomyEvent } from './handlers/economyHandlers';
import { handleTreatyEvent } from './handlers/treatyHandlers';
import { handleOperationEvent } from './handlers/operationHandlers';
import { handleIntelEvent } from './handlers/intelHandlers';
import { handleMilitaryEvent } from './handlers/militaryHandlers';
import { handleCyberEvent } from './handlers/cyberHandlers';
import { handleAIEvent } from './handlers/aiHandlers';
import { handleTimelineEvent } from './handlers/timelineHandlers';
import { HandlerResult, HandlerContext } from './handlers/types';

// Enqueue event onto canonical world queue
export function queueBusEvent(world: CanonicalWorld, event: BusEvent) {
  if (!world.busEventQueue) world.busEventQueue = [];
  world.busEventQueue.push(event);
}

// Global dispatcher that processes the queue in sequential, deterministic order
export function processBusEventQueue(
  world: CanonicalWorld,
  rawCountries: Record<string, Country>,
  currentTick: number
): { logs: string[] } {
  const globalLogs: string[] = [];

  if (!world.busEventQueue) world.busEventQueue = [];
  if (!world.busEventHistory) world.busEventHistory = [];

  let safetyCounter = 0;
  const MAX_EVENTS_PER_TICK = 100;

  // Process queue elements sequentially
  while (world.busEventQueue.length > 0 && safetyCounter < MAX_EVENTS_PER_TICK) {
    const event = world.busEventQueue.shift();
    if (!event) continue;

    safetyCounter++;
    event.status = 'PROCESSED';
    event.processedAtTick = currentTick;

    // Collect into history
    world.busEventHistory.unshift(event);
    if (world.busEventHistory.length > 250) {
      world.busEventHistory.pop();
    }

    const ctx: HandlerContext = { worldState: world, rawCountries };

    // Invoke domain handlers
    const results: HandlerResult[] = [];

    try {
      results.push(handleEconomyEvent(event, ctx));
      results.push(handleTreatyEvent(event, ctx));
      results.push(handleOperationEvent(event, ctx));
      results.push(handleIntelEvent(event, ctx));
      results.push(handleMilitaryEvent(event, ctx));
      results.push(handleCyberEvent(event, ctx));
      results.push(handleAIEvent(event, ctx));
      results.push(handleTimelineEvent(event, ctx));
    } catch (err: any) {
      console.error(`[EVENT BUS ERROR] Handler failed on event type ${event.type}`, err);
      event.status = 'FAILED';
      globalLogs.push(`SYSTEM ERROR: Fault in handler processing for event type ${event.type}: ${err.message || err}`);
      continue;
    }

    // Collect logs and queue derived events
    results.forEach((res) => {
      if (res.logs) {
        globalLogs.push(...res.logs);
      }
      if (res.derivedEvents) {
        res.derivedEvents.forEach((derived) => {
          // Safeguard: Ensure derived event carries parent coordinates
          derived.parentEventId = event.id;
          derived.correlationId = event.correlationId;
          derived.tick = currentTick;
          derived.createdAtTick = currentTick;

          // Queue onto active stack
          world.busEventQueue!.push(derived);
        });
      }
    });
  }

  if (safetyCounter >= MAX_EVENTS_PER_TICK) {
    globalLogs.push(`SYSTEM WARNING: Safety capacity reached! Event-chain queue terminated to prevent recursion.`);
    console.warn(`[EVENT BUS SAFEGUARD] Maximum events per tick threshold exceeded (${MAX_EVENTS_PER_TICK}).`);
  }

  return { logs: globalLogs };
}
