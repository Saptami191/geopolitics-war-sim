import { ISimulationRuntime } from '../../core/api/ISimulationRuntime';
import { RendererWorld } from '../models/RendererWorld';
import { WorldMapper } from '../mappers/WorldMapper';
import { IRuntimeEvent, RuntimeEventType } from '../../core/events/IRuntimeEvent';
import { IRendererBridge } from './IRendererBridge';

/**
 * RendererBridge fetches data from the SimulationRuntime via the public API
 * and maps it to renderer‑friendly DTOs. It also provides a subscription
 * mechanism for world updates.
 */
export class RendererBridge implements IRendererBridge {
  private readonly runtime: ISimulationRuntime;

  constructor(runtime: ISimulationRuntime) {
    this.runtime = runtime;
  }

  async getRendererWorld(): Promise<RendererWorld> {
    const world = this.runtime.getWorld();
    return WorldMapper.map(world);
  }

  /**
   * Subscribes to runtime events (tick, pause, resume, stop) and invokes the
   * listener with the latest mapped world after each tick.
   * Returns an unsubscribe function.
   */
  subscribeToWorldChanges(
    listener: (world: RendererWorld) => void
  ): () => void {
    const handler = (event: IRuntimeEvent) => {
      if (event.type === RuntimeEventType.SimulationTickCompleted) {
        const latestWorld = this.runtime.getWorld();
        listener(WorldMapper.map(latestWorld));
      }
    };
    this.runtime.subscribe(handler);
    return () => this.runtime.unsubscribe(handler);
  }
}
