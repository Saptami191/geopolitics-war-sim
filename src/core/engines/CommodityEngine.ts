import { WorldState } from '../../types';
import { ICommodityEngine } from './ICommodityEngine';
import { processMarkets } from '../../sim/commodityEngine';

export class CommodityEngine implements ICommodityEngine {
  step(worldDraft: WorldState): void {
    processMarkets(worldDraft);
  }
}
