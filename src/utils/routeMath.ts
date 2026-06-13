/**
 * ROUTE MATH UTILITY
 * Mathematical core for great-circle navigation interpolation.
 * Essential for accurate long-haul oceanic crossings.
 */

/**
 * Degrees to Radians
 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Radians to Degrees
 */
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Interpolates a point along a great-circle path between start and end.
 * @param startLat Latitude of start point in degrees
 * @param startLon Longitude of start point in degrees
 * @param endLat Latitude of end point in degrees
 * @param endLon Longitude of end point in degrees
 * @param f Fraction of travel (0 to 1)
 * @returns [longitude, latitude] in degrees
 */
export function interpolateGreatCircle(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  f: number
): [number, number] {
  if (f <= 0) return [startLon, startLat];
  if (f >= 1) return [endLon, endLat];

  const la1 = toRad(startLat);
  const lo1 = toRad(startLon);
  const la2 = toRad(endLat);
  const lo2 = toRad(endLon);

  const dLo = lo2 - lo1;

  // Angular distance between points
  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((la2 - la1) / 2) ** 2 +
        Math.cos(la1) * Math.cos(la2) * Math.sin(dLo / 2) ** 2
    )
  );

  if (Math.abs(d) < 0.0001) {
    // Points are nearly identical; do linear interpolation
    const lat = startLat + (endLat - startLat) * f;
    const lon = startLon + (endLon - startLon) * f;
    return [lon, lat];
  }

  const sinD = Math.sin(d);
  const A = Math.sin((1 - f) * d) / sinD;
  const B = Math.sin(f * d) / sinD;

  const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
  const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
  const z = A * Math.sin(la1) + B * Math.sin(la2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);

  return [toDeg(lon), toDeg(lat)];
}

/**
 * Generates an array of points along the great-circle path.
 * @returns Array of [longitude, latitude]
 */
export function generateGreatCirclePath(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  steps: number = 20
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    points.push(interpolateGreatCircle(startLat, startLon, endLat, endLon, i / steps));
  }
  return points;
}

/**
 * Calculate distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
