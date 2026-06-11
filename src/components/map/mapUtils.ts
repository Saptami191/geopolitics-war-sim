/**
 * SOVEREIGN COMMAND MAP - HIGH-END OPERATIONS UTILITIES
 * Computational helpers for geospatial transforms, data normalization,
 * and high-fidelity rendering calculations on the 2D and 3D screens.
 */

import { MAP_THEME } from './mapStyles';

/**
 * Calculates a curve height multiplier based on geographical distance.
 * Prevents flat or overly tall ballistic flight arcs.
 */
export function calculateArcHeight(startX: number, startY: number, endX: number, endY: number): number {
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.min(2.5, Math.max(0.2, distance * 0.12));
}

/**
 * Converts alliance blocks into specific rgb/hex color codes.
 */
export function getAllianceColor(alliance: string): string {
  switch (alliance) {
    case 'NATO':
      return MAP_THEME.colors.allianceNATO;
    case 'BRICS':
      return MAP_THEME.colors.allianceBRICS;
    case 'GCC':
      return MAP_THEME.colors.allianceGCC;
    case 'QUAD':
      return MAP_THEME.colors.allianceQUAD;
    case 'SCO':
      return MAP_THEME.colors.allianceSCO;
    default:
      return MAP_THEME.colors.allianceNEUTRAL;
  }
}

/**
 * Converts alliance block to RGB Array for deck.gl integration.
 */
export function getAllianceColorRGB(alliance: string): [number, number, number] {
  const hex = getAllianceColor(alliance);
  return hexToRGB(hex);
}

/**
 * Helper to convert HEX colors to RGB number arrays.
 */
export function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/**
 * Normalizes GDP values to log scale values for responsive base sizes.
 */
export function gdpToRadius(gdp: number): number {
  if (gdp <= 0) return 1;
  // Natural scaling for display weights (typically range 10M to 300M meters)
  return Math.log10(gdp) * 45000 + 10000;
}

/**
 * Normalizes missile payload sizes or weapon counts to visual line-widths.
 */
export function powerToLineWidth(power: number): number {
  return Math.min(5, Math.max(1, Math.sqrt(power) * 0.3));
}

/**
 * Performs Geodesic linear interpolation between two coordinates.
 */
export function interpolateCoords(
  start: [number, number],
  end: [number, number],
  pct: number
): [number, number] {
  const lng = start[0] + (end[0] - start[0]) * pct;
  const lat = start[1] + (end[1] - start[1]) * pct;
  return [lng, lat];
}
