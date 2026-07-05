import { WorldState } from '../../types';

export interface ICommodityEngine {
  step(worldDraft: WorldState): void;
}
