/**
 * SOVEREIGN COMMAND MAP - GEOSPATIAL COORDINATES LEDGER
 * Mapped accurate geographic center points (centroids) for countries simulated in the game.
 * Supports both 3-letter (standard ledger requirement) and 2-letter (internal game engines) lookups.
 */

export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  // 3-Letter ISO Centroids (Mandatory Required Entries)
  USA: [-95.7129, 37.0902],
  CAN: [-106.3468, 56.1304],
  MEX: [-102.5528, 23.6345],
  BRA: [-51.9253, -14.2350],
  ARG: [-63.6167, -38.4161],
  GBR: [-3.4360, 55.3781],
  FRA: [2.2137, 46.2276],
  DEU: [10.4515, 51.1657],
  ESP: [-3.7492, 40.4637],
  ITA: [12.5674, 41.8719],
  RUS: [105.3188, 61.5240],
  UKR: [31.1656, 48.3794],
  TUR: [35.2433, 38.9637],
  SAU: [45.0792, 23.8859],
  IRN: [53.6880, 32.4279],
  ISR: [34.8516, 31.0461],
  EGY: [30.8025, 26.8206],
  NGA: [8.6753, 9.0820],
  ZAF: [22.9375, -30.5595],
  IND: [78.9629, 20.5937],
  PAK: [69.3451, 30.3753],
  CHN: [104.1954, 35.8617],
  JPN: [138.2529, 36.2048],
  KOR: [127.7669, 35.9078],
  PRK: [127.5101, 40.3399],
  AUS: [133.7751, -25.2744],

  // 2-Letter Mapping for internal game backwards-compatibility
  US: [-95.7129, 37.0902],   // USA Map Match
  CA: [-106.3468, 56.1304],  // Canada Map Match
  MX: [-102.5528, 23.6345],  // Mexico Map Match
  BR: [-51.9253, -14.2350],  // Brazil Map Match
  AR: [-63.6167, -38.4161],  // Argentina Map Match
  GB: [-3.4360, 55.3781],    // United Kingdom Map Match
  FR: [2.2137, 46.2276],     // France Map Match
  DE: [10.4515, 51.1657],    // Germany Map Match
  ES: [-3.7492, 40.4637],    // Spain Map Match
  IT: [12.5674, 41.8719],    // Italy Map Match
  RU: [105.3188, 61.5240],   // Russia Map Match
  UA: [31.1656, 48.3794],    // Ukraine Map Match
  TR: [35.2433, 38.9637],    // Turkey Map Match
  SA: [45.0792, 23.8859],    // Saudi Arabia Map Match
  IR: [53.6880, 32.4279],    // Iran Map Match
  IL: [34.8516, 31.0461],    // Israel Map Match
  EG: [30.8025, 26.8206],    // Egypt Map Match
  NG: [8.6753, 9.0820],      // Nigeria Map Match
  ZA: [22.9375, -30.5595],   // South Africa Map Match
  IN: [78.9629, 20.5937],    // India Map Match
  PK: [69.3451, 30.3753],    // Pakistan Map Match
  CN: [104.1954, 35.8617],   // China Map Match
  JP: [138.2529, 36.2048],   // Japan Map Match
  KR: [127.7669, 35.9078],   // South Korea Map Match
  KP: [127.5101, 40.3399],   // North Korea Map Match
  AU: [133.7751, -25.2744],  // Australia Map Match

  // Additional 2-letter fallback entries from the old file
  PS: [35.2332, 31.9522],    // Palestine
  CO: [-72.9301, 4.5709],    // Colombia
  ET: [40.4897, 9.1450],     // Ethiopia
  KE: [37.9062, -0.0236],    // Kenya
  MA: [-7.0926, 31.7917],    // Morocco
  DZ: [1.6596, 28.0339],     // Algeria
  LY: [17.2283, 26.3351],    // Libya
  SY: [38.9968, 34.8021],    // Syria
  IQ: [43.6793, 33.2232],    // Iraq
  YE: [48.5164, 15.5527],    // Yemen
  KZ: [66.9237, 48.0196],    // Kazakhstan
  UZ: [64.5853, 41.3775],    // Uzbekistan
  MM: [95.9560, 21.9162],    // Myanmar
  TH: [100.9925, 15.8700],   // Thailand
  MY: [101.9758, 4.2105],    // Malaysia
  BD: [90.3563, 23.6850],    // Bangladesh
  PH: [121.7740, 12.8797],   // Philippines
  FI: [25.7482, 61.9241],    // Finland
  SE: [18.6435, 60.1282],    // Sweden
  BY: [27.9534, 53.7098],    // Belarus
  RS: [21.0059, 44.0165],    // Serbia
  AZ: [47.5769, 40.1431],    // Azerbaijan
  AM: [45.0382, 40.0691],    // Armenia
};

export function getCentroid(countryId: string): [number, number] {
  return COUNTRY_CENTROIDS[countryId.toUpperCase()] || [0, 0];
}

export function getCountryCentroid(countryId: string): [number, number] {
  return COUNTRY_CENTROIDS[countryId.toUpperCase()] || [0, 0];
}
