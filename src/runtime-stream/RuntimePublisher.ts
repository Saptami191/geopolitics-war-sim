import { CanonicalMapState } from '../components/map/mapWorldState';
import { RendererFrameMapper } from '../renderer/frame/RendererFrameMapper';
import { RendererSerializer } from '../renderer/frame/RendererSerializer';

/**
 * Handles converting CanonicalMapState into its serialized RendererFrame representation
 * using the existing engine-independent mappers and serializers.
 */
export class RuntimePublisher {
  /**
   * Compiles the canonical world state and returns its serialized JSON string.
   * Pure mapper utility.
   */
  static publish(state: CanonicalMapState): string {
    const frame = RendererFrameMapper.map(state);
    return RendererSerializer.serialize(frame);
  }
}
