import { IRuntimeEvent } from '../../core/events/IRuntimeEvent';
import { RendererEvent } from '../models/RendererEvent';
import { v4 as uuidv4 } from 'uuid';

export class EventMapper {
  static map(event: IRuntimeEvent, tick: number): RendererEvent {
    return {
      id: uuidv4(),
      tick,
      type: event.type,
      payload: event.payload,
    };
  }
}
