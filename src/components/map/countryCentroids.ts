/**
 * SOVEREIGN COMMAND MAP - GEOSPATIAL COORDINATES LEDGER
 * Accurate geographic center points (centroids) for countries simulated in the war room.
 * Mapped from ISO alpha 2 codes to standard [Longitude, Latitude] pairs.
 */

export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],  // United States
  CN: [104.1954, 35.8617],  // China
  IN: [78.9629, 20.5937],   // India
  PK: [69.3451, 30.3753],   // Pakistan
  IL: [34.8516, 31.0461],   // Israel
  PS: [35.2332, 31.9522],   // Palestine
  IR: [53.6880, 32.4279],   // Iran
  RU: [105.3188, 61.5240],  // Russia
  GB: [-1.4649, 54.2379],   // United Kingdom
  FR: [2.2137, 46.2276],    // France
  DE: [10.4515, 51.1657],   // Germany
  JP: [138.2529, 36.2048],  // Japan
  KR: [127.7669, 35.9078],  // South Korea
  SA: [45.0792, 23.8859],   // Saudi Arabia
  BR: [-51.9253, -14.2350], // Brazil
  ZA: [25.0471, -30.5595],  // South Africa
  AU: [133.7751, -25.2744], // Australia
  TR: [35.2433, 38.9637],   // Turkey
  EG: [30.8025, 26.8205],   // Egypt
  TW: [120.9605, 23.6978],  // Taiwan
  UA: [31.1656, 48.3794],   // Ukraine
  NG: [8.6753, 9.0820],     // Nigeria
  ID: [113.9213, -0.7893],  // Indonesia
  MX: [-102.5528, 23.6345], // Mexico
  VN: [108.2772, 14.0583],  // Vietnam
  PL: [19.1451, 51.9194],   // Poland
  NL: [5.2913, 52.1326],    // Netherlands
  ES: [-3.7492, 40.4637],   // Spain
  IT: [12.5674, 41.8719],   // Italy
  CA: [-106.3468, 56.1304], // Canada
  AR: [-38.4161, -34.9965], // Argentina
  CO: [-72.9301, 4.5709],   // Colombia
  ET: [40.4897, 9.1450],    // Ethiopia
  KE: [37.9062, -0.0236],   // Kenya
  MA: [-7.0926, 31.7917],   // Morocco
  DZ: [1.6596, 28.0339],    // Algeria
  LY: [17.2283, 26.3351],   // Libya
  SY: [38.9968, 34.8021],   // Syria
  IQ: [43.6793, 33.2232],   // Iraq
  YE: [48.5164, 15.5527],   // Yemen
  KZ: [66.9237, 48.0196],   // Kazakhstan
  UZ: [64.5853, 41.3775],   // Uzbekistan
  MM: [95.9560, 21.9162],   // Myanmar
  TH: [100.9925, 15.8700],  // Thailand
  MY: [101.9758, 4.2105],   // Malaysia
  BD: [90.3563, 23.6850],   // Bangladesh
  PH: [121.7740, 12.8797],  // Philippines
  FI: [25.7482, 61.9241],   // Finland
  SE: [18.6435, 60.1282],   // Sweden
  BY: [27.9534, 53.7098],   // Belarus
  RS: [21.0059, 44.0165],   // Serbia
  AZ: [47.5769, 40.1431],   // Azerbaijan
  AM: [45.0382, 40.0691],   // Armenia
};

/**
 * Returns the centroid coordinate [lng, lat] for a given country code, or [0,0] as fallback.
 */
export function getCentroid(countryId: string): [number, number] {
  return COUNTRY_CENTROIDS[countryId.toUpperCase()] || [0, 0];
}
