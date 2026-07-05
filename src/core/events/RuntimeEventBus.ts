import { IRuntimeEvent } from './IRuntimeEvent';
import { RuntimeEventListener } from './IRuntimeEventListener';

/**
 * Simple event bus for runtime events. Allows listeners to subscribe, unsubscribe,
 * and receive events synchronously. Lightweight and framework‑agnostic.
 */
export class RuntimeEventBus {
  private readonly listeners: Set<RuntimeEventListener> = new Set();

  /** Register a listener for runtime events */
  subscribe(listener: RuntimeEventListener): void {
    this.listeners.add(listener);
  }

  /** Unregister a previously registered listener */
  unsubscribe(listener: RuntimeEventListener): void {
    this.listeners.delete(listener);
  }

  /** Publish an event to all current listeners */
  publish(event: IRuntimeEvent): void {
    const current = Array.from(this.listeners);
    for (const listener of current) {
      try {
        listener(event);
      } catch (e) {
        console.error('RuntimeEventBus listener error:', e);
      }
    }
  }
}
