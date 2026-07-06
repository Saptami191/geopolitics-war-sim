// src/renderer/models/RendererCountry.ts
export interface RendererCountry {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stability: number;
  economy: number;
  military: number;
  color: string; // hex colour for visualisation
}
