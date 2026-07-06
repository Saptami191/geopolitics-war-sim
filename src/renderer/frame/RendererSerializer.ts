import { RendererFrame } from './RendererFrame';

export class RendererSerializer {
  /** Serializes a RendererFrame into a plain JSON string */
  static serialize(frame: RendererFrame): string {
    return JSON.stringify(frame);
  }

  /** Deserializes a JSON string back into a RendererFrame DTO */
  static deserialize(json: string): RendererFrame {
    const parsed = JSON.parse(json) as RendererFrame;
    if (parsed.version !== 1) {
      console.warn(`RendererFrame Version Mismatch: Expected 1, Got ${parsed.version}`);
    }
    return parsed;
  }
}
