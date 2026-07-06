// src/renderer/bridge/IRendererBridge.ts
/**
 * Public contract for the Renderer Bridge.
 * Provides renderer‑friendly snapshots of the simulation world.
 */
import { RendererWorld } from '../models/RendererWorld';

export interface IRendererBridge {
  /**
   * Returns the current world data formatted for the renderer.
   * The method is async to allow future asynchronous data sources.
   */
  getRendererWorld(): Promise<RendererWorld>;

  /**
   * Subscribe to world changes. The listener is called with the latest
   * RendererWorld snapshot whenever the underlying SimulationRuntime emits
   * an event (e.g., tick, pause, resume). Returns an unsubscribe function.
   */
  subscribeToWorldChanges(
    listener: (world: RendererWorld) => void
  ): () => void;
}
