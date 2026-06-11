/**
 * SOVEREIGN COMMAND MAP - TACTICAL SYMBOLOGY LEDGER
 * Unified semantic icons and characters for map layer indicators, legends, and dashboards.
 */

export interface MapIconConfig {
  symbol: string;
  label: string;
  color: string;
  description: string;
}

export const TACTICAL_ICONS: Record<string, MapIconConfig> = {
  political: {
    symbol: '◈',
    label: 'POLITICAL OUTPOST',
    color: '#00e5c8',
    description: 'Sovereign nation borders, capitals, and diplomatic centers.',
  },
  military: {
    symbol: '▲',
    label: 'MILITARY HUB',
    color: '#f5a623',
    description: 'Strategic deployment bases, commands, and force hardware.',
  },
  conflicts: {
    symbol: '⚔',
    label: 'WARFIGHTING DECREE ZONE',
    color: '#ff3b4e',
    description: 'Active theatres of war, border disputes, or active combat.',
  },
  nuclear: {
    symbol: '☢',
    label: 'STRATEGIC SILO',
    color: '#00cfff',
    description: 'Nuclear launch complexes, exclusion zones, and facilities.',
  },
  economic: {
    symbol: '◉',
    label: 'TRADE MERIDIAN',
    color: '#39d98a',
    description: 'Major financial markets, deepwater trade routes, and pipelines.',
  },
  cyber: {
    symbol: '⬡',
    label: 'CYBER DOMAIN INTERCEPT',
    color: '#b87fff',
    description: 'Undersea optical fibre terminals and high-density supercomputers.',
  },
  population: {
    symbol: '●',
    label: 'CIVIL DISCONTENT',
    color: '#eec152',
    description: 'Urban population centers, refugee flows, or popular protests.',
  },
};

/**
 * Returns icon configuration for specified layer names.
 */
export function getTacticalIcon(layer: string): MapIconConfig {
  return TACTICAL_ICONS[layer.toLowerCase()] || {
    symbol: '▫',
    label: 'GENERIC MARKER',
    color: '#a1c2d6',
    description: 'Geospatial datum coordinates.',
  };
}
