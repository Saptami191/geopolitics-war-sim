// src/renderer/models/RendererEvent.ts
export interface RendererEvent {
  // Simple DTO for renderer consumption
  id: string;
  tick: number;
  type: string;
  payload?: any;
}
