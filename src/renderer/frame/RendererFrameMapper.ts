import { CanonicalMapState } from '../../components/map/mapWorldState';
import { RendererFrame, RendererFrameCountry, RendererFrameUnit, RendererFrameStrike, RendererFrameTether } from './RendererFrame';

export class RendererFrameMapper {
  /** Map CanonicalMapState to plain serializable RendererFrame DTO */
  static map(state: CanonicalMapState): RendererFrame {
    const countries: Record<string, RendererFrameCountry> = {};
    for (const [id, c] of Object.entries(state.countries)) {
      countries[id] = {
        id: c.id,
        name: c.name,
        centroid: c.centroid,
        allianceBlock: c.allianceBlock,
        atWar: c.atWar,
        atWarWith: c.atWarWith,
        isPlayer: c.isPlayer,
        isTarget: c.isTarget,
        threatLevel: c.threatLevel,
        gdpB: c.gdpB,
        unrestPct: c.unrestPct,
        firewallLevel: c.firewallLevel,
        nuclearCapable: c.nuclearCapable,
        totalPowerRating: c.totalPowerRating,
      };
    }

    const units: Record<string, RendererFrameUnit> = {};
    for (const [id, u] of Object.entries(state.units)) {
      units[id] = {
        id: u.id,
        name: u.name,
        type: u.type,
        owner: u.owner,
        position: { lat: u.position.lat, lon: u.position.lon },
        status: u.status,
        health: u.health ?? 100,
        fuel: u.fuel ?? 100,
      };
    }

    const activeStrikes: RendererFrameStrike[] = state.activeStrikes.map((s) => ({
      id: s.id,
      sourceId: s.sourceId,
      targetId: s.targetId,
      sourceCentroid: s.sourceCentroid,
      targetCentroid: s.targetCentroid,
      weaponType: s.weaponType,
      progressPct: s.progressPct,
      status: s.status,
      isNuclear: s.isNuclear,
      yieldMT: s.yieldMT,
    }));

    const activeTethers: RendererFrameTether[] = state.activeTethers.map((t) => ({
      id: t.id,
      sourceId: t.sourceId,
      targetId: t.targetId,
      sourceCentroid: t.sourceCentroid,
      targetCentroid: t.targetCentroid,
      type: t.type,
    }));

    return {
      version: 1,
      tick: state.currentTick,
      theme: state.theme,
      activeLayer: state.activeLayer,
      activeHudMode: state.activeHudMode,
      globalThreatLevel: state.globalThreatLevel,
      nuclearExchangeOccurred: state.nuclearExchangeOccurred,
      playerCountryId: state.playerCountryId,
      targetCountryId: state.targetCountryId,
      countries,
      units,
      activeStrikes,
      activeTethers,
    };
  }
}
