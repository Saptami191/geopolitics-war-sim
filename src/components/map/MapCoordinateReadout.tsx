import { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';

interface CoordinateReadoutProps {
  map: maplibregl.Map | null;
  theme?: 'dark' | 'light';
}

export function MapCoordinateReadout({ map, theme = 'dark' }: CoordinateReadoutProps) {
  const [coords, setCoords] = useState<[number, number]>([0, 0]);
  const [gridZone, setGridZone] = useState<string>('32T LN 4390');
  const [elevation, setElevation] = useState<number>(142);

  useEffect(() => {
    if (!map) return;

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;
      setCoords([lng, lat]);

      // Dynamic UTM approximation calculation
      const zone = Math.floor((lng + 180) / 6) + 1;
      const letter = lat >= 0 ? 'N' : 'S';
      const easting = Math.floor(Math.abs(lng * 10000) % 100000);
      const northing = Math.floor(Math.abs(lat * 10000) % 100000);
      setGridZone(`${zone}${letter} UX ${easting.toString().padStart(5, '0')} ${northing.toString().padStart(5, '0')}`);

      // Dynamic elevation approximation
      const elev = Math.abs(Math.sin(lat) * Math.cos(lng) * 1200 + 40);
      setElevation(Math.floor(elev));
    };

    map.on('mousemove', handleMouseMove);

    return () => {
      map.off('mousemove', handleMouseMove);
    };
  }, [map]);

  const fmtCoord = (val: number, isLng: boolean) => {
    const dir = isLng ? (val >= 0 ? 'E' : 'W') : (val >= 0 ? 'N' : 'S');
    const displayVal = Math.max(-180, Math.min(180, val));
    return `${Math.abs(displayVal).toFixed(4)}° ${dir}`;
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="tactical-coordinate-ledger"
      className={`absolute bottom-3 left-3 z-[110] flex select-none items-center gap-4 px-3 py-2 border backdrop-blur-md rounded-[1px] font-mono text-[9px] tracking-wide transition-colors duration-200
        ${isDark
          ? 'bg-slate-950/85 border-cyan-950/70 text-cyan-400'
          : 'bg-zinc-100/95 border-zinc-300 text-zinc-800 shadow-md'
        }
      `}
      style={{ boxShadow: isDark ? 'inset 0 0 10px rgba(0, 207, 255, 0.05)' : 'none' }}
    >
      <div className={`flex flex-col gap-0.5 border-r pr-3 ${isDark ? 'border-slate-800/60' : 'border-zinc-300'}`}>
        <span className={`${isDark ? 'text-slate-500' : 'text-zinc-500'} font-sans font-semibold text-[8px] tracking-wider uppercase`}>SAT RECON GRID</span>
        <span className={`font-bold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{gridZone}</span>
      </div>

      <div className={`flex flex-col gap-0.5 border-r pr-3 ${isDark ? 'border-slate-800/60' : 'border-zinc-300'}`}>
        <span className={`${isDark ? 'text-slate-500' : 'text-zinc-500'} font-sans font-semibold text-[8px] tracking-wider uppercase`}>GEOGRAPHIC COORDS</span>
        <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-zinc-700'}`}>
          {fmtCoord(coords[1], false)} / {fmtCoord(coords[0], true)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 pr-1">
        <span className={`${isDark ? 'text-slate-500' : 'text-zinc-500'} font-sans font-semibold text-[8px] tracking-wider uppercase`}>ELEVATION datum</span>
        <span className={`font-semibold ${isDark ? 'text-cyan-400/90' : 'text-cyan-600'}`}>{elevation} m ASL</span>
      </div>
    </div>
  );
}
