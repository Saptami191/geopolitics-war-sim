export const fmtB = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return "$0.00B";
  if (Math.abs(n) >= 1000) return `$${(n/1000).toFixed(2)}T`;
  if (Math.abs(n) >= 1) return `$${n.toFixed(2)}B`;
  return `$${(n * 1000).toFixed(0)}M`;
};

export const fmtPct = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return "0.0%";
  return `${n.toFixed(1)}%`;
};

export const fmtK = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return "0";
  return n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${Math.round(n)}`;
};

export const fmtM = (n: number | undefined | null): string => {
  if (n === undefined || n === null) return "0.0M";
  return `${n.toFixed(1)}M`;
};

export const fmtCoord = (lat: number, lon: number): string =>
  `${Math.abs(lat).toFixed(2)}°${lat>=0?'N':'S'} ${Math.abs(lon).toFixed(2)}°${lon>=0?'E':'W'}`;

export const fmtTick = (t: number): string => `T+${String(t).padStart(4,'0')}`;
