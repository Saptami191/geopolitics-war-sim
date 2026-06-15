import { BusEvent } from '../types';
import { HandlerContext, HandlerResult } from './types';

export function handleTimelineEvent(event: BusEvent, ctx: HandlerContext): HandlerResult {
  const result: HandlerResult = { derivedEvents: [], logs: [] };
  const { worldState } = ctx;

  if (event.visibility === 'PUBLIC') {
    if (!worldState.timeline) {
      worldState.timeline = [];
    }

    const alreadyExists = worldState.timeline.some(
      entry => entry.tick === event.tick && entry.desc.includes(event.title)
    );

    if (!alreadyExists) {
      worldState.timeline.unshift({
        tick: event.tick,
        desc: `[${event.category}] ${event.title} - ${event.summary}`,
        category: event.category
      });

      // Maintain a maximum of 100 timeline entries
      if (worldState.timeline.length > 100) {
        worldState.timeline = worldState.timeline.slice(0, 100);
      }
    }
  }

  return result;
}
