import { WorldState } from '../../types';
import { IFiscalEngine } from './IFiscalEngine';
import { processFiscal } from '../../sim/fiscalEngine';

export class FiscalEngine implements IFiscalEngine {
  step(worldDraft: WorldState): void {
    processFiscal(worldDraft);
  }
}
