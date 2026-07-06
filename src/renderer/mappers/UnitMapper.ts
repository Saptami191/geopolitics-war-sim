import { BaseUnit } from '../../types';
import { RendererUnit } from '../models/RendererUnit';

export class UnitMapper {
  static map(unit: BaseUnit): RendererUnit {
    return {
      id: unit.id,
      countryId: unit.owner,
      latitude: unit.position?.lat ?? 0,
      longitude: unit.position?.lon ?? 0,
      type: unit.type,
      health: unit.health ?? 0,
      status: unit.status ?? 'UNKNOWN',
    };
  }
}
