export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class FrameValidator {
  /**
   * Validates a parsed JSON object against the RendererFrame protocol.
   * Does not throw; returns a detailed list of validation errors.
   */
  static validate(frame: any): ValidationResult {
    const errors: string[] = [];

    if (!frame || typeof frame !== 'object') {
      errors.push('Frame is not a valid JSON object');
      return { valid: false, errors };
    }

    // 1. Version validation
    if (typeof frame.version !== 'number') {
      errors.push(`Invalid version: expected number, got ${typeof frame.version}`);
    } else if (frame.version !== 1) {
      errors.push(`Unsupported protocol version: ${frame.version}`);
    }

    // 2. Tick validation
    if (typeof frame.tick !== 'number') {
      errors.push(`Invalid tick: expected number, got ${typeof frame.tick}`);
    } else if (frame.tick < 0 || !Number.isInteger(frame.tick)) {
      errors.push(`Invalid tick value (must be non-negative integer): ${frame.tick}`);
    }

    // 3. Theme
    if (frame.theme !== 'dark' && frame.theme !== 'light') {
      errors.push(`Invalid theme: ${frame.theme}`);
    }

    // 4. activeLayer
    if (typeof frame.activeLayer !== 'string') {
      errors.push(`Invalid activeLayer: expected string, got ${typeof frame.activeLayer}`);
    }

    // 5. activeHudMode
    const validHudModes = ['STATE', 'WAR_ROOM', 'ANALYST'];
    if (!validHudModes.includes(frame.activeHudMode)) {
      errors.push(`Invalid activeHudMode: ${frame.activeHudMode}`);
    }

    // 6. globalThreatLevel
    const validThreatLevels = ['GREEN', 'YELLOW', 'ORANGE', 'RED', 'BLACK'];
    if (!validThreatLevels.includes(frame.globalThreatLevel)) {
      errors.push(`Invalid globalThreatLevel: ${frame.globalThreatLevel}`);
    }

    // 7. nuclearExchangeOccurred
    if (typeof frame.nuclearExchangeOccurred !== 'boolean') {
      errors.push(`Invalid nuclearExchangeOccurred: expected boolean, got ${typeof frame.nuclearExchangeOccurred}`);
    }

    // 8. playerCountryId
    if (typeof frame.playerCountryId !== 'string') {
      errors.push(`Invalid playerCountryId: expected string, got ${typeof frame.playerCountryId}`);
    }

    // 9. targetCountryId (optional string)
    if (frame.targetCountryId !== undefined && frame.targetCountryId !== null && typeof frame.targetCountryId !== 'string') {
      errors.push(`Invalid targetCountryId: expected string or undefined, got ${typeof frame.targetCountryId}`);
    }

    // 10. Countries validation
    if (!frame.countries || typeof frame.countries !== 'object') {
      errors.push('Countries record is missing or invalid');
    } else {
      for (const [key, country] of Object.entries(frame.countries)) {
        this.validateCountry(key, country, errors);
      }
    }

    // 11. Units validation
    if (!frame.units || typeof frame.units !== 'object') {
      errors.push('Units record is missing or invalid');
    } else {
      for (const [key, unit] of Object.entries(frame.units)) {
        this.validateUnit(key, unit, errors);
      }
    }

    // 12. Active Strikes validation
    if (!Array.isArray(frame.activeStrikes)) {
      errors.push('activeStrikes is not an array');
    } else {
      frame.activeStrikes.forEach((strike: any, index: number) => {
        this.validateStrike(index, strike, errors);
      });
    }

    // 13. Active Tethers validation
    if (!Array.isArray(frame.activeTethers)) {
      errors.push('activeTethers is not an array');
    } else {
      frame.activeTethers.forEach((tether: any, index: number) => {
        this.validateTether(index, tether, errors);
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private static validateCountry(key: string, country: any, errors: string[]): void {
    const prefix = `Country [${key}]`;
    if (!country || typeof country !== 'object') {
      errors.push(`${prefix} is not an object`);
      return;
    }

    if (country.id !== key) {
      errors.push(`${prefix} id mismatch: key is ${key}, but id is ${country.id}`);
    }
    if (typeof country.name !== 'string') {
      errors.push(`${prefix} name is not a string`);
    }
    if (!Array.isArray(country.centroid) || country.centroid.length !== 2 || typeof country.centroid[0] !== 'number' || typeof country.centroid[1] !== 'number') {
      errors.push(`${prefix} centroid is not a [number, number] array`);
    }
    if (typeof country.allianceBlock !== 'string') {
      errors.push(`${prefix} allianceBlock is not a string`);
    }
    if (typeof country.atWar !== 'boolean') {
      errors.push(`${prefix} atWar is not a boolean`);
    }
    if (!Array.isArray(country.atWarWith) || !country.atWarWith.every((id: any) => typeof id === 'string')) {
      errors.push(`${prefix} atWarWith is not an array of strings`);
    }
    if (typeof country.isPlayer !== 'boolean') {
      errors.push(`${prefix} isPlayer is not a boolean`);
    }
    if (typeof country.isTarget !== 'boolean') {
      errors.push(`${prefix} isTarget is not a boolean`);
    }
    const validThreatLevels = ['GREEN', 'YELLOW', 'ORANGE', 'RED', 'BLACK'];
    if (!validThreatLevels.includes(country.threatLevel)) {
      errors.push(`${prefix} threatLevel is invalid: ${country.threatLevel}`);
    }
    if (typeof country.gdpB !== 'number') {
      errors.push(`${prefix} gdpB is not a number`);
    }
    if (typeof country.unrestPct !== 'number') {
      errors.push(`${prefix} unrestPct is not a number`);
    }
    if (typeof country.firewallLevel !== 'number') {
      errors.push(`${prefix} firewallLevel is not a number`);
    }
    if (typeof country.nuclearCapable !== 'boolean') {
      errors.push(`${prefix} nuclearCapable is not a boolean`);
    }
    if (typeof country.totalPowerRating !== 'number') {
      errors.push(`${prefix} totalPowerRating is not a number`);
    }
  }

  private static validateUnit(key: string, unit: any, errors: string[]): void {
    const prefix = `Unit [${key}]`;
    if (!unit || typeof unit !== 'object') {
      errors.push(`${prefix} is not an object`);
      return;
    }

    if (unit.id !== key) {
      errors.push(`${prefix} id mismatch: key is ${key}, but id is ${unit.id}`);
    }
    if (typeof unit.name !== 'string') {
      errors.push(`${prefix} name is not a string`);
    }
    if (typeof unit.type !== 'string') {
      errors.push(`${prefix} type is not a string`);
    }
    if (typeof unit.owner !== 'string') {
      errors.push(`${prefix} owner is not a string`);
    }
    if (!unit.position || typeof unit.position.lat !== 'number' || typeof unit.position.lon !== 'number') {
      errors.push(`${prefix} position is invalid: must have lat (number) and lon (number)`);
    }
    if (typeof unit.status !== 'string') {
      errors.push(`${prefix} status is not a string`);
    }
    if (typeof unit.health !== 'number') {
      errors.push(`${prefix} health is not a number`);
    }
    if (typeof unit.fuel !== 'number') {
      errors.push(`${prefix} fuel is not a number`);
    }
  }

  private static validateStrike(index: number, strike: any, errors: string[]): void {
    const prefix = `Strike at index [${index}]`;
    if (!strike || typeof strike !== 'object') {
      errors.push(`${prefix} is not an object`);
      return;
    }

    if (typeof strike.id !== 'string') {
      errors.push(`${prefix} id is not a string`);
    }
    if (typeof strike.sourceId !== 'string') {
      errors.push(`${prefix} sourceId is not a string`);
    }
    if (typeof strike.targetId !== 'string') {
      errors.push(`${prefix} targetId is not a string`);
    }
    if (!Array.isArray(strike.sourceCentroid) || strike.sourceCentroid.length !== 2 || typeof strike.sourceCentroid[0] !== 'number' || typeof strike.sourceCentroid[1] !== 'number') {
      errors.push(`${prefix} sourceCentroid is not a [number, number] array`);
    }
    if (!Array.isArray(strike.targetCentroid) || strike.targetCentroid.length !== 2 || typeof strike.targetCentroid[0] !== 'number' || typeof strike.targetCentroid[1] !== 'number') {
      errors.push(`${prefix} targetCentroid is not a [number, number] array`);
    }
    if (typeof strike.weaponType !== 'string') {
      errors.push(`${prefix} weaponType is not a string`);
    }
    if (typeof strike.progressPct !== 'number') {
      errors.push(`${prefix} progressPct is not a number`);
    }
    if (typeof strike.status !== 'string') {
      errors.push(`${prefix} status is not a string`);
    }
    if (typeof strike.isNuclear !== 'boolean') {
      errors.push(`${prefix} isNuclear is not a boolean`);
    }
    if (typeof strike.yieldMT !== 'number') {
      errors.push(`${prefix} yieldMT is not a number`);
    }
  }

  private static validateTether(index: number, tether: any, errors: string[]): void {
    const prefix = `Tether at index [${index}]`;
    if (!tether || typeof tether !== 'object') {
      errors.push(`${prefix} is not an object`);
      return;
    }

    if (typeof tether.id !== 'string') {
      errors.push(`${prefix} id is not a string`);
    }
    if (typeof tether.sourceId !== 'string') {
      errors.push(`${prefix} sourceId is not a string`);
    }
    if (typeof tether.targetId !== 'string') {
      errors.push(`${prefix} targetId is not a string`);
    }
    if (!Array.isArray(tether.sourceCentroid) || tether.sourceCentroid.length !== 2 || typeof tether.sourceCentroid[0] !== 'number' || typeof tether.sourceCentroid[1] !== 'number') {
      errors.push(`${prefix} sourceCentroid is not a [number, number] array`);
    }
    if (!Array.isArray(tether.targetCentroid) || tether.targetCentroid.length !== 2 || typeof tether.targetCentroid[0] !== 'number' || typeof tether.targetCentroid[1] !== 'number') {
      errors.push(`${prefix} targetCentroid is not a [number, number] array`);
    }
    if (typeof tether.type !== 'string') {
      errors.push(`${prefix} type is not a string`);
    }
  }
}
