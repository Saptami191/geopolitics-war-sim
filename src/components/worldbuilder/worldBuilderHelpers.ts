import { WorldConfig, Ideology, AllianceBlock, CountryStartConfig } from '../../types';
import { INITIAL_COUNTRIES } from '../../data/countries';

// Predefined base countries list
const COUNTRY_IDS = ['US', 'CN', 'RU', 'IN', 'PK', 'IL', 'IR', 'GB', 'FR', 'DE', 'JP', 'KR', 'SA', 'BR', 'ZA', 'AU', 'TR', 'EG', 'TW', 'PS'];

const BASE_POWER_RATING: Record<string, number> = {
  US: 95, CN: 88, RU: 90, IN: 72, PK: 55, IL: 78, IR: 60, GB: 70, FR: 68, DE: 62, JP: 58, KR: 60, SA: 65, BR: 48, ZA: 35, AU: 55, TR: 62, EG: 50, TW: 64, PS: 12
};

// Gets standard default baseline configuration
export function getBaselineWorldConfig(): WorldConfig {
  const config: WorldConfig = {};
  COUNTRY_IDS.forEach((id) => {
    const country = INITIAL_COUNTRIES[id];
    if (country) {
      config[id] = {
        ideology: country.political.ideology as Ideology,
        military: BASE_POWER_RATING[id] || 50,
        gdp: country.economic.gdpB,
        opinion: country.opinions['US'] || 0,
        alliance: country.allianceBlock as AllianceBlock,
        nuclear: country.arsenal.nuclearCapable,
      };
    }
  });
  return config;
}

// Preset Generative Algorithms

// 1. Default Baseline World
export function generateDefaultWorldPreset(): WorldConfig {
  return getBaselineWorldConfig();
}

// 2. Cold War (Bipolar) World Preset
export function generateColdWarPreset(): WorldConfig {
  const config = getBaselineWorldConfig();

  // Democratic Alliance camp
  const demoCamp = ['US', 'GB', 'FR', 'DE', 'JP', 'KR', 'AU'];
  // Authoritarian/Communist Alliance camp
  const authCamp = ['RU', 'CN', 'IR', 'PS', 'PK'];

  COUNTRY_IDS.forEach((id) => {
    if (config[id]) {
      if (demoCamp.includes(id)) {
        config[id].ideology = 'DEMOCRACY';
        config[id].alliance = id === 'US' || id === 'GB' || id === 'FR' || id === 'DE' ? 'NATO' : 'QUAD';
        config[id].opinion = id === 'US' ? 100 : 85;
      } else if (authCamp.includes(id)) {
        config[id].ideology = (id === 'CN' || id === 'RU') ? 'COMMUNISM' : (id === 'IR' ? 'THEOCRACY' : 'MILITARY_JUNTA');
        config[id].alliance = (id === 'RU' || id === 'CN') ? 'SCO' : 'BRICS';
        // Extreme hostility to democratic leader
        config[id].opinion = -85;
      } else {
        // Non-aligned states
        config[id].alliance = 'NEUTRAL';
        // Slide a few ideologies to keep it interesting
        if (id === 'TR') config[id].ideology = 'AUTOCRACY';
        if (id === 'EG') config[id].ideology = 'MILITARY_JUNTA';
        if (id === 'SA') config[id].ideology = 'MONARCHY';
        // Moderate distance / swing opinions
        config[id].opinion = 15;
      }

      // Restore strict historic Cold War nuclear capacities
      config[id].nuclear = ['US', 'RU', 'CN', 'GB', 'FR', 'IL'].includes(id);
    }
  });

  return config;
}

// 3. Multipolar Chaos World Preset
export function generateMultipolarChaosPreset(): WorldConfig {
  const config = getBaselineWorldConfig();

  // Fractured alliance blocks
  COUNTRY_IDS.forEach((id) => {
    if (config[id]) {
      // Elevate military ready metrics universally (+10) to represent chaos
      config[id].military = Math.min(100, config[id].military + 10);
      
      // Fractured Alliance assignments
      if (['US', 'GB', 'DE'].includes(id)) {
        config[id].alliance = 'NATO';
        config[id].opinion = 75;
      } else if (['CN', 'RU', 'TR', 'SA'].includes(id)) {
        // Turkey and Saudi Arabia swing to SCO/BRICS
        config[id].alliance = id === 'SA' ? 'GCC' : 'SCO';
        config[id].opinion = -45;
        if (id === 'SA') config[id].ideology = 'MONARCHY';
      } else if (['IN', 'BR', 'ZA', 'EG'].includes(id)) {
        config[id].alliance = 'BRICS';
        config[id].opinion = -10;
        if (id === 'BR') config[id].ideology = 'OLIGARCHY'; // Populist shift
      } else if (['JP', 'KR', 'FR', 'AU'].includes(id)) {
        config[id].alliance = 'QUAD';
        config[id].opinion = 45;
      } else {
        config[id].alliance = 'NEUTRAL';
        config[id].opinion = -20;
      }
      
      // Flipped opinions across the board (representation of suspicion)
      if (id !== 'US') {
        const randSuspicion = Math.floor(Math.sin(id.charCodeAt(0)) * 60); // deterministic pseudo-random
        config[id].opinion = Math.max(-90, Math.min(90, config[id].opinion + randSuspicion));
      }
    }
  });

  return config;
}

// 4. Nuclear Brink (Armed & Paranoid) Preset
export function generateNuclearBrinkPreset(): WorldConfig {
  const config = getBaselineWorldConfig();

  COUNTRY_IDS.forEach((id) => {
    if (config[id]) {
      // Extensive nuclear capacity seeding
      // Almost all major-to-medium systems acquired deterrents
      const nonEligibleNonNuke = ['PS']; // Only the weakest state fails to lock deterrent
      config[id].nuclear = !nonEligibleNonNuke.includes(id);

      // Substantially raised military capacity to represent mobilization
      config[id].military = Math.max(config[id].military, Math.min(100, config[id].military + 20));

      // Heavily depressed opinions toward player (US) representing high-alert standoff paranoia
      if (id !== 'US') {
        const isCloseAlly = ['GB', 'FR', 'JP', 'AU', 'DE', 'KR'].includes(id);
        config[id].opinion = isCloseAlly ? 35 : -70; // Even allies are distrustful
      }
    }
  });

  return config;
}

// 5. Non-Aligned World Preset
export function generateNonAlignedPreset(): WorldConfig {
  const config = getBaselineWorldConfig();

  COUNTRY_IDS.forEach((id) => {
    if (config[id]) {
      // Formal alliances heavily dissolved: set mostly to NEUTRAL
      const isSuperPowerCore = ['US', 'CN', 'RU'].includes(id);
      
      if (!isSuperPowerCore) {
        config[id].alliance = 'NEUTRAL';
      } else {
        config[id].alliance = id === 'US' ? 'NATO' : 'SCO';
      }

      // Diverse scatter of starting ideologies
      const moduloVal = id.charCodeAt(0) % 8;
      const IDG_LIST: Ideology[] = ['DEMOCRACY', 'AUTOCRACY', 'MILITARY_JUNTA', 'THEOCRACY', 'TECHNOCRACY', 'OLIGARCHY', 'COMMUNISM', 'MONARCHY'];
      if (!isSuperPowerCore) {
        config[id].ideology = IDG_LIST[moduloVal];
      }

      // Mixed moderate opinions
      if (id !== 'US') {
        config[id].opinion = 10 + (id.charCodeAt(0) % 25); // transactional neutral relations
      }
    }
  });

  return config;
}

// Plausible Geopolitical Randomizer
export function generatePlausibleRandomWorld(): WorldConfig {
  const config = getBaselineWorldConfig();

  // Pick a global posture regime context randomly
  const seedOptions = ['DEMOCRATIC_WAVE', 'AUTHORITARIAN_RISE', 'MULTIPOLAR_CONFLICT', 'TRANSACTIONAL_NEUTRALITY'];
  const moodSeed = seedOptions[Math.floor(Math.random() * seedOptions.length)];

  // Set up ideological rules
  const IDEOLOGIES: Ideology[] = [
    'DEMOCRACY', 'AUTOCRACY', 'MILITARY_JUNTA', 'THEOCRACY', 
    'TECHNOCRACY', 'OLIGARCHY', 'COMMUNISM', 'MONARCHY'
  ];

  COUNTRY_IDS.forEach((id) => {
    if (!config[id]) return;

    // 1. Ideology randomization centered on plausible seeds but high variance
    let ideology = config[id].ideology;
    const changeChance = Math.random();

    if (changeChance > 0.40) { // 60% chance to morph
      if (moodSeed === 'DEMOCRATIC_WAVE') {
        // High propensity to shift democratic or technocratic
        ideology = Math.random() > 0.3 ? 'DEMOCRACY' : 'TECHNOCRACY';
      } else if (moodSeed === 'AUTHORITARIAN_RISE') {
        // Shift authoritarian or military junta
        ideology = Math.random() > 0.4 ? 'AUTOCRACY' : 'MILITARY_JUNTA';
      } else {
        // Scattered selection matching the region
        if (['SA', 'IR'.includes(id) ? 'THEOCRACY' : 'MONARCHY'].includes(id)) {
          ideology = Math.random() > 0.5 ? 'THEOCRACY' : 'MONARCHY';
        } else {
          ideology = IDEOLOGIES[Math.floor(Math.random() * IDEOLOGIES.length)];
        }
      }
    }
    config[id].ideology = ideology;

    // 2. Derive alliance based strictly on ideology + regional affinity to avoid nonsensical pure-RNG blocs
    let alliance: AllianceBlock = 'NEUTRAL';
    if (ideology === 'DEMOCRACY' || ideology === 'TECHNOCRACY') {
      // Natural Western alignment
      if (['US', 'GB', 'FR', 'DE'].includes(id)) {
        alliance = 'NATO';
      } else if (['JP', 'KR', 'IN', 'AU'].includes(id)) {
        alliance = 'QUAD';
      } else {
        alliance = Math.random() > 0.5 ? 'NATO' : 'NEUTRAL';
      }
    } else if (ideology === 'AUTOCRACY' || ideology === 'COMMUNISM') {
      // Natural Eastern alignment
      if (['RU', 'CN', 'IR', 'PK'].includes(id)) {
        alliance = 'SCO';
      } else {
        alliance = Math.random() > 0.4 ? 'BRICS' : 'NEUTRAL';
      }
    } else if (id === 'SA' || (ideology === 'MONARCHY' && Math.random() > 0.4)) {
      alliance = 'GCC';
    } else {
      alliance = Math.random() > 0.6 ? 'BRICS' : 'NEUTRAL';
    }
    config[id].alliance = alliance;

    // 3. Economy & Military correlations
    // Strong economies (GDP) naturally correlate to strong military rating, with some random variation (underfunded vs overmilitarized)
    // Scale GDP factor gently (±30% variance)
    const originalGdp = config[id].gdp;
    const gdpVariance = 0.70 + Math.random() * 0.60; // 70% to 130%
    config[id].gdp = Math.max(10, Math.round(originalGdp * gdpVariance));

    // Base military strength directly on GDP tiers with noise
    let calculatedMili = 35;
    if (config[id].gdp > 10000) calculatedMili = 85;      // Mega powers
    else if (config[id].gdp > 3000) calculatedMili = 70;  // High-major powers
    else if (config[id].gdp > 1000) calculatedMili = 55;  // Regional powers
    else if (config[id].gdp > 300) calculatedMili = 45;   // Mid-tier powers

    // Add noise value of +20 / -15
    const miliNoise = Math.floor(Math.random() * 35) - 15;
    config[id].military = Math.max(10, Math.min(100, calculatedMili + miliNoise));

    // 4. Opinions aligned tightly which makes blocs highly readable
    // Democrats like democrats, dislike communist and autocrats, etc.
    if (id !== 'US') {
      let finalOpinion = 0;
      if (ideology === 'DEMOCRACY') {
        finalOpinion = 30 + Math.floor(Math.random() * 50); // Loves US (DEMOCRACY)
      } else if (ideology === 'COMMUNISM' || ideology === 'AUTOCRACY') {
        finalOpinion = -70 + Math.floor(Math.random() * 40); // Hostile to US
      } else if (ideology === 'THEOCRACY' || ideology === 'MILITARY_JUNTA') {
        finalOpinion = -30 + Math.floor(Math.random() * 40); // Suspect relations
      } else {
        finalOpinion = -10 + Math.floor(Math.random() * 30); // Ambivalent neutral relations
      }

      // Alliance adjustments
      if (alliance === 'NATO') finalOpinion += 15;
      if (alliance === 'SCO') finalOpinion -= 15;

      config[id].opinion = Math.max(-100, Math.min(100, finalOpinion));
    }

    // 5. Nuclear status
    // Standard major powers keep their nuclear capable unless specifically stripped, but random rich militarized states could acquire them
    const baseNuclearCapable = ['US', 'CN', 'RU', 'IN', 'PK', 'IL', 'GB', 'FR'].includes(id);
    let nuclear = baseNuclearCapable;
    if (baseNuclearCapable) {
      nuclear = Math.random() > 0.08; // 92% retention rate
    } else {
      // 8% chance to acquire if wealthy/extremely militaristic
      if (config[id].military > 65 && config[id].gdp > 400) {
        nuclear = Math.random() > 0.85;
      }
    }
    config[id].nuclear = nuclear;
  });

  return config;
}

// Serialization / Deserialization Utilities

// Encodes WorldConfig strictly into base64 format safely
export function serializeURIWorldConfig(config: WorldConfig): string {
  try {
    const rawJSON = JSON.stringify(config);
    // Use standard btoa with encodeUriconponent for URL safety
    const safeB64 = btoa(unescape(encodeURIComponent(rawJSON)));
    return safeB64;
  } catch (err) {
    console.error('[SERIALIZATION] Critical encoding failure captured:', err);
    return '';
  }
}

// Decodes and Normalizes malformed input records gracefully
export function deserializeURIWorldConfig(b64String: string): WorldConfig | null {
  if (!b64String) return null;
  try {
    const rawJSON = decodeURIComponent(escape(atob(b64String)));
    const parsedObj = JSON.parse(rawJSON);
    
    // Process through normalization validation filter to prevent malformed injections
    return validateWorldConfig(parsedObj);
  } catch (err) {
    console.error('[DESERIALIZATION] Failed to decode base64 URL sequence:', err);
    return null;
  }
}

// Checks and normalizes injected schema arrays to prevent runtime crashing
export function validateWorldConfig(input: any): WorldConfig | null {
  if (!input || typeof input !== 'object') return null;

  const validConfig: WorldConfig = {};
  const standardBaseline = getBaselineWorldConfig();

  // Loop through keys of standard baseline to ensure stable schema coverage
  COUNTRY_IDS.forEach((id) => {
    const baselineItem = standardBaseline[id];
    const incomingItem = input[id];

    if (!baselineItem) return;

    if (!incomingItem || typeof incomingItem !== 'object') {
      // Fallback cleanly to default baseline if missing
      validConfig[id] = { ...baselineItem };
      return;
    }

    // Validate and limit ideology
    let ideology: Ideology = 'DEMOCRACY';
    const IDEOLOGIES: Ideology[] = ['DEMOCRACY', 'AUTOCRACY', 'MILITARY_JUNTA', 'THEOCRACY', 'TECHNOCRACY', 'OLIGARCHY', 'COMMUNISM', 'MONARCHY'];
    if (IDEOLOGIES.includes(incomingItem.ideology)) {
      ideology = incomingItem.ideology;
    } else {
      ideology = baselineItem.ideology;
    }

    // Validate and limit military
    let military = typeof incomingItem.military === 'number' ? incomingItem.military : baselineItem.military;
    military = Math.max(1, Math.min(100, military));

    // Validate and limit GDP
    let gdp = typeof incomingItem.gdp === 'number' ? incomingItem.gdp : baselineItem.gdp;
    gdp = Math.max(1, Math.min(1000000, gdp));

    // Validate and limit opinion of player (US)
    let opinion = typeof incomingItem.opinion === 'number' ? incomingItem.opinion : baselineItem.opinion;
    opinion = Math.max(-100, Math.min(100, opinion));

    // Validate and limit alliances
    let alliance: AllianceBlock = 'NEUTRAL';
    const ALLIANCES: AllianceBlock[] = ['NATO', 'BRICS', 'GCC', 'QUAD', 'SCO', 'NEUTRAL'];
    if (ALLIANCES.includes(incomingItem.alliance)) {
      alliance = incomingItem.alliance;
    } else {
      alliance = baselineItem.alliance;
    }

    // Validate nuclear status boolean
    const nuclear = typeof incomingItem.nuclear === 'boolean' ? incomingItem.nuclear : baselineItem.nuclear;

    validConfig[id] = {
      ideology,
      military,
      gdp,
      opinion,
      alliance,
      nuclear,
    };
  });

  return validConfig;
}
