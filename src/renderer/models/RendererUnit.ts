// src/renderer/models/RendererUnit.ts
export interface RendererUnit {
  id: string;
  countryId: string;
  latitude: number;
  longitude: number;
  type: string;
  health: number;
  status: string;
}
