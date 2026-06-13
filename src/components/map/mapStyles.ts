/**
 * SOVEREIGN COMMAND MAP - GEOSPATIAL DESIGN SYSTEM
 * Highly polished theme variables, color tokens, and font specifications for the WorldMonitor interface.
 */

export const MAP_THEME = {
  colors: {
    // Core brand spectrum
    voidBg: '#020508',
    chromeBorder: '#1a3540',
    chromeBorderMuted: '#0f242e',
    chromeMid: '#5c7a8c',
    chromeBright: '#a1c2d6',
    chromeDim: '#3a5360',

    // Layer-specific operational hues (Intel colors)
    political: '#00e5c8', // Soft high-density teal
    conflicts: '#ff3b4e', // Critical threat red
    military: '#f5a623',  // Warning indicator amber
    nuclear: '#00cfff',   // Strategic alert cyan
    economic: '#39d98a',  // Secondary numeric green
    cyber: '#b87fff',     // Cyber network violet
    population: '#eec152', // Demographic amber-gold

    // RGBA arrays for deck.gl rendering [R, G, B, A]
    politicalRGB: [0, 229, 200],
    conflictsRGB: [255, 59, 78],
    militaryRGB: [245, 166, 35],
    nuclearRGB: [0, 207, 255],
    economicRGB: [57, 217, 138],
    cyberRGB: [184, 127, 255],
    populationRGB: [238, 193, 82],

    // Selection highlights
    playerNation: '#00ffaa',
    targetNation: '#ff1e46',
    allianceNATO: '#0090ff',
    allianceBRICS: '#ff4d00',
    allianceGCC: '#ffd400',
    allianceQUAD: '#00ffb7',
    allianceSCO: '#ae00ff',
    allianceNEUTRAL: '#7d8e95',
  },

  fonts: {
    display: '"Chakra Petch", sans-serif',
    mono: '"JetBrains Mono", SFMono-Regular, monospace',
  },

  glows: {
    political: '0 0 8px rgba(0,229,200,0.5)',
    conflicts: '0 0 10px rgba(255,59,78,0.7)',
    military: '0 0 8px rgba(245,166,35,0.5)',
    nuclear: '0 0 12px rgba(0,207,255,0.8)',
    economic: '0 0 8px rgba(57,217,138,0.5)',
    cyber: '0 0 8px rgba(184,127,255,0.6)',
    population: '0 0 8px rgba(238,193,82,0.4)',
  }
};

// MapLibre-compliant basemap configuration using CartoDB dark matter raster tiles as fallback
export const DARK_BASEMAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© CARTO © OpenStreetMap contributors',
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster' as const,
      source: 'carto-dark',
      paint: {
        'raster-saturation': -0.8,
        'raster-brightness-min': 0,
        'raster-brightness-max': 0.6,
        'raster-hue-rotate': 195,
        'raster-contrast': 0.1,
      }
    }
  ]
};

export const LIGHT_BASEMAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-light': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© CARTO © OpenStreetMap contributors',
    }
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster' as const,
      source: 'carto-light',
      paint: {
        'raster-saturation': -0.9,
        'raster-brightness-min': 0.1,
        'raster-brightness-max': 0.95,
        'raster-contrast': 0,
      }
    }
  ]
};

