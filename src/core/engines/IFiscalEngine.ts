import { WorldState } from '../../types';

export interface IFiscalEngine {
  step(worldDraft: WorldState): void;
}
