import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { BallisticStrike, Country } from '../../types';
import { audio } from '../../utils/audio';
import { fmtCoord } from '../../utils/format';

interface WorldMapProps {
  activeLayer: 'POLITICAL' | 'MILITARY' | 'ECONOMIC' | 'CYBER' | 'WEATHER' | 'PROPAGANDA' | 'POPULATION';
}

const NUM_TO_ALPHA2: Record<number, string> = {
  840: 'US', 156: 'CN', 356: 'IN', 586: 'PK', 376: 'IL', 275: 'PS', 364: 'IR', 643: 'RU',
  826: 'GB', 250: 'FR', 276: 'DE', 392: 'JP', 410: 'KR', 682: 'SA', 76: 'BR', 710: 'ZA',
  36: 'AU', 792: 'TR', 818: 'EG', 158: 'TW',
  804: 'UA', 566: 'NG', 360: 'ID', 484: 'MX', 704: 'VN', 616: 'PL', 528: 'NL', 724: 'ES',
  380: 'IT', 124: 'CA', 32: 'AR', 170: 'CO', 231: 'ET', 404: 'KE', 504: 'MA', 12: 'DZ',
  434: 'LY', 760: 'SY', 368: 'IQ', 887: 'YE', 398: 'KZ', 860: 'UZ', 104: 'MM', 764: 'TH',
  458: 'MY', 50: 'BD', 608: 'PH', 246: 'FI', 752: 'SE', 112: 'BY', 688: 'RS', 31: 'AZ',
  51: 'AM'
};

const ALPHA2_TO_COORD: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902], CN: [104.1954, 35.8617], IN: [78.9629, 20.5937], PK: [69.3451, 30.3753],
  IL: [34.8516, 31.0461], PS: [35.2332, 31.9522], IR: [53.6880, 32.4279], RU: [105.3188, 61.5240],
  GB: [-1.4649, 54.2379], FR: [2.2137, 46.2276], DE: [10.4515, 51.1657], JP: [138.2529, 36.2048],
  KR: [127.7669, 35.9078], SA: [45.0792, 23.8859], BR: [-51.9253, -14.2350], ZA: [25.0471, -30.5595],
  AU: [133.7751, -25.2744], TR: [35.2433, 38.9637], EG: [30.8025, 26.8205], TW: [120.9605, 23.6978],
  UA: [31.1656, 48.3794], NG: [8.6753, 9.0820], ID: [113.9213, -0.7893], MX: [-102.5528, 23.6345],
  VN: [108.2772, 14.0583], PL: [19.1451, 51.9194], NL: [5.2913, 52.1326], ES: [-3.7492, 40.4637],
  IT: [12.5674, 41.8719], CA: [-106.3468, 56.1304], AR: [-38.4161, -34.9965], CO: [-72.9301, 4.5709],
  ET: [40.4897, 9.1450], KE: [37.9062, -0.0236], MA: [-7.0926, 31.7917], DZ: [1.6596, 28.0339],
  LY: [17.2283, 26.3351], SY: [38.9968, 34.8021], IQ: [43.6793, 33.2232], YE: [48.5164, 15.5527],
  KZ: [66.9237, 48.0196], UZ: [64.5853, 41.3775], MM: [95.9560, 21.9162], TH: [100.9925, 15.8700],
  MY: [101.9758, 4.2105], BD: [90.3563, 23.6850], PH: [121.7740, 12.8797], FI: [25.7482, 61.9241],
  SE: [18.6435, 60.1282], BY: [27.9534, 53.7098], RS: [21.0059, 44.0165], AZ: [47.5769, 40.1431],
  AM: [45.0382, 40.0691]
};

export default function WorldMap({ activeLayer }: WorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const countries = useWorldStore((s) => s.countries);
  const activeStrikes = useWorldStore((s) => s.activeStrikes);
  const currentTick = useWorldStore((s) => s.currentTick);

  const playerCountryId = usePlayerStore((s) => s.countryId);
  const hudMode = usePlayerStore((s) => s.hudMode);
  const selectedTargetId = usePlayerStore((s) => s.selectedTargetCountryId);
  const setTargetCountry = usePlayerStore((s) => s.setTargetCountry);

  const setCountryInspector = useUIStore((s) => s.setCountryInspector);

  const [mapData, setMapData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [showGlobe, setShowGlobe] = useState(false);

  // Resize observer
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: width || 1000, height: height || 500 });
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch world map TopoJSON once
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => res.json())
      .then((data) => {
        setMapData(data);
      })
      .catch((err) => console.error('Failed to load world TopoJSON map', err));
  }, []);

  // Setup D3 Zoom & Pan
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });
    svg.call(zoom);
  }, []);

  if (!mapData) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center font-mono text-[#00ff44] bg-[#020402]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-t-2 border-[#00ff44] rounded-full animate-spin" />
          <span>ESTABLISHING SATELLITE COMMUNICATIONS LINK...</span>
        </div>
      </div>
    );
  }

  // Define D3 Projection
  const projection = showGlobe
    ? d3.geoOrthographic()
        .scale(Math.min(dimensions.width, dimensions.height) * 0.45)
        .translate([dimensions.width / 2, dimensions.height / 2])
        .rotate([currentTick * 0.4, -15]) // auto rotating globe
    : d3.geoNaturalEarth1()
        .fitSize([dimensions.width, dimensions.height], topojson.feature(mapData, mapData.objects.countries));

  const pathGenerator = d3.geoPath().projection(projection);

  // Parse countries features
  const geoFeatures = topojson.feature(mapData, mapData.objects.countries) as any;

  // Render country fill color based on state
  const getCountryFill = (id: string, country: Country | undefined) => {
    if (!country) return 'rgba(10, 20, 10, 0.2)';
    const isPlayer = id === playerCountryId;
    const isSelected = id === selectedTargetId;
    const isAtWar = country.atWarWith.length > 0;

    if (isPlayer) return 'rgba(0, 255, 68, 0.15)';
    if (isSelected) return 'rgba(255, 179, 0, 0.25)';

    // Layer styles
    if (activeLayer === 'POLITICAL') {
      if (isAtWar) return 'rgba(255, 34, 68, 0.22)';
      if (country.opinions[playerCountryId] > 60) return 'rgba(0, 229, 255, 0.15)'; // Allied Blue
      if (country.opinions[playerCountryId] < -50) return 'rgba(255, 34, 68, 0.12)'; // Hostile Red
      return 'rgba(10, 35, 10, 0.35)'; // neutral
    }

    if (activeLayer === 'MILITARY') {
      const powerPct = Math.min(100, (country.arsenal.totalPowerRating || 0) / 100);
      return `rgba(255, 34, 68, ${0.05 + powerPct * 0.0035})`;
    }

    if (activeLayer === 'ECONOMIC') {
      const stress = country.economic.debtStressIndex || 0;
      if (stress > 70) return 'rgba(255, 34, 68, 0.25)';
      const gdpRel = Math.min(1, (country.economic.gdpB || 0) / 25000);
      return `rgba(0, 229, 255, ${0.05 + gdpRel * 0.3})`;
    }

    if (activeLayer === 'POPULATION') {
      const density = Math.min(1, (country.population || 0) / 1000);
      return `rgba(136, 255, 170, ${0.05 + density * 0.35})`;
    }

    return 'rgba(10, 35, 10, 0.35)';
  };

  const getCountryStroke = (id: string, country: Country | undefined) => {
    if (id === playerCountryId) return 'var(--green-100)';
    if (id === selectedTargetId) return 'var(--amber-300)';
    if (country?.atWarWith.length ? country.atWarWith.length > 0 : false) return 'var(--red-300)';
    return 'var(--green-700)';
  };

  const getCountryStrokeWidth = (id: string) => {
    if (id === playerCountryId) return '1.5';
    if (id === selectedTargetId) return '1.5';
    return '0.3';
  };

  const handleCountryClick = (id: string) => {
    audio.sfxKeyClick();
    if (hudMode === 'WAR_ROOM') {
      if (id !== playerCountryId) {
        setTargetCountry(id);
      }
    } else {
      setCountryInspector(id);
    }
  };

  // Bezier missile path curves calculator
  const getBezierCurvePoints = (strike: BallisticStrike) => {
    const src = ALPHA2_TO_COORD[strike.sourceCountryId];
    const tgt = ALPHA2_TO_COORD[strike.targetCountryId];
    if (!src || !tgt) return null;

    const start = projection(src as [number, number]);
    const end = projection(tgt as [number, number]);
    if (!start || !end) return null;

    const controlX = (start[0] + end[0]) / 2;
    const controlY = Math.min(start[1], end[1]) - 80;

    return {
      startX: start[0],
      startY: start[1],
      controlX,
      controlY,
      endX: end[0],
      endY: end[1]
    };
  };

  return (
    <div ref={mapContainerRef} className="w-full h-full relative overflow-hidden bg-black panel">
      {/* HUD Header Bar inside map */}
      <div className="absolute top-2 left-3 z-10 flex gap-4 text-[9px] font-mono select-none tracking-wider text-[#00ff44] opacity-80 pointer-events-none">
        <span>THEATER GRID COMPASS: WGS-84</span>
        <span>PROJECTION: {showGlobe ? 'ORTHOGRAPHICS 3D GLOBE' : 'NATURAL EARTH MERCATOR'}</span>
        <span>SCALE: {zoomTransform.k.toFixed(1)}X</span>
      </div>

      {/* Manual toggle projection buttons */}
      <div className="absolute top-2 right-3 z-10 flex gap-1 select-none">
        <button
          onClick={() => { audio.sfxKeyClick(); setShowGlobe(false); }}
          className={`px-2 py-0.5 border text-[9px] font-mono cursor-pointer rounded ${!showGlobe ? 'bg-[#0d2e0d] border-[#00ff44] text-[#00ff44]' : 'bg-[#030603] border-gray-800 text-gray-500 hover:text-white'}`}
        >
          FLAT MAP
        </button>
        <button
          onClick={() => { audio.sfxKeyClick(); setShowGlobe(true); }}
          className={`px-2 py-0.5 border text-[9px] font-mono cursor-pointer rounded ${showGlobe ? 'bg-[#0d2e0d] border-[#00ff44] text-[#00ff44]' : 'bg-[#030603] border-gray-800 text-gray-500 hover:text-white'}`}
        >
          3D GLOBE
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full select-none cursor-grab active:cursor-grabbing"
      >
        <defs>
          <pattern id="crosshatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(204,136,255,0.2)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Outer Background Void */}
        <rect width="100%" height="100%" fill="var(--bg-void)" />

        {/* Map transform group */}
        <g transform={zoomTransform.toString()}>
          {/* Natural Earth Ocean background subtle circular frame if showing 3D globe */}
          {showGlobe && (
            <circle
              cx={dimensions.width / 2}
              cy={dimensions.height / 2}
              r={Math.min(dimensions.width, dimensions.height) * 0.45}
              fill="rgba(2, 8, 2, 0.9)"
              stroke="var(--green-900)"
              strokeWidth="1"
            />
          )}

          {/* D3 Geographic Lat/Lon Graticule Lines */}
          <g>
            <path
              d={d3.geoPath().projection(projection)(d3.geoGraticule().step([15, 15])()) || undefined}
              fill="none"
              stroke="var(--green-900)"
              strokeWidth="0.4"
              opacity="0.3"
            />
          </g>

          {/* TopoJSON Country Polygons Path Drawing */}
          <g id="data-countries">
            {geoFeatures.features.map((feature: any, idx: number) => {
              const numericId = Number(feature.id);
              const countryId = NUM_TO_ALPHA2[numericId];
              const country = countries[countryId];
              
              // Skip if not recognized in game
              if (!countryId || !country) return null;

              return (
                <path
                  key={`prov-path-${idx}`}
                  d={pathGenerator(feature) || undefined}
                  fill={getCountryFill(countryId, country)}
                  stroke={getCountryStroke(countryId, country)}
                  strokeWidth={getCountryStrokeWidth(countryId)}
                  onClick={() => handleCountryClick(countryId)}
                  className="transition-colors duration-200 hover:fill-green-950/40 cursor-pointer"
                />
              );
            })}
          </g>

          {/* HAARP storms radar clouds layer */}
          {activeLayer === 'WEATHER' && (
            <g opacity="0.6">
              {Object.keys(countries).map((id) => {
                const c = countries[id];
                if (c && c.haarpActive && c.haarpTargetCountryId) {
                  const targetCoord = ALPHA2_TO_COORD[c.haarpTargetCountryId];
                  if (targetCoord) {
                    const mappedPt = projection(targetCoord as [number, number]);
                    if (mappedPt) {
                      return (
                        <g key={`weather-haarp-${id}`} className="animate-pulse">
                          <circle
                            cx={mappedPt[0]}
                            cy={mappedPt[1]}
                            r="35"
                            fill="rgba(0, 229, 255, 0.08)"
                            stroke="#00e5ff"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={mappedPt[0]}
                            y={mappedPt[1] - 5}
                            fill="#00e5ff"
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            HAARP CORONA
                          </text>
                        </g>
                      );
                    }
                  }
                }
                return null;
              })}
            </g>
          )}

          {/* Cyber hacker compromised links vectors map */}
          {activeLayer === 'CYBER' && (
            <g opacity="0.8">
              {Object.keys(countries).map((id) => {
                const c = countries[id];
                if (c && c.intelligence.activeCovertOps.length > 0) {
                  return c.intelligence.activeCovertOps.map((op) => {
                    const srcCoord = ALPHA2_TO_COORD[id];
                    const tgtCoord = ALPHA2_TO_COORD[op.targetCountryId];
                    if (srcCoord && tgtCoord) {
                      const start = projection(srcCoord as [number, number]);
                      const end = projection(tgtCoord as [number, number]);
                      if (start && end) {
                        return (
                          <g key={`cyber-op-${op.id}`}>
                            <line
                              x1={start[0]}
                              y1={start[1]}
                              x2={end[0]}
                              y2={end[1]}
                              stroke="var(--color-cyan)"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                            <circle cx={end[0]} cy={end[1]} r="4" fill="none" stroke="var(--color-cyan)" strokeWidth="1" className="animate-ping" />
                          </g>
                        );
                      }
                    }
                    return null;
                  });
                }
                return null;
              })}
            </g>
          )}

          {/* MISSILES / BALLISTIC STRIKES ARCS INTERACTIVES */}
          <g id="strikes-arcs">
            {activeStrikes.map((strike) => {
              if (strike.status !== 'IN_FLIGHT') return null;

              const points = getBezierCurvePoints(strike);
              if (!points) return null;

              const progress = strike.progressPct / 100;
              const tX = (1 - progress) * (1 - progress) * points.startX + 2 * (1 - progress) * progress * points.controlX + progress * progress * points.endX;
              const tY = (1 - progress) * (1 - progress) * points.startY + 2 * (1 - progress) * progress * points.controlY + progress * progress * points.endY;

              const isNuke = !!strike.warheadYieldMT;
              const pathColor = isNuke ? 'var(--red-300)' : 'var(--amber-300)';

              return (
                <g key={`strike-map-${strike.id}`}>
                  {/* Trajectory vector arc path line */}
                  <path
                    d={`M ${points.startX},${points.startY} Q ${points.controlX},${points.controlY} ${points.endX},${points.endY}`}
                    fill="none"
                    stroke={pathColor}
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    style={{ animation: 'dash-march 0.5s linear infinite' }}
                  />

                  {/* Laser pulsing dot guide tip */}
                  <circle cx={tX} cy={tY} r="3" fill={isNuke ? '#ff2244' : '#ffb300'} />

                  {/* Warning dynamic telemetry floating tags */}
                  <text
                    x={tX + 8}
                    y={tY - 4}
                    fill={isNuke ? '#ff2244' : '#ffb300'}
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    {strike.weaponType} ({Math.round(strike.progressPct)}%)
                  </text>
                </g>
              );
            })}
          </g>

          {/* Detonation Explosions pulsings */}
          <g>
            {activeStrikes
              .filter((s) => s.status === 'IMPACT')
              .map((strike) => {
                const coord = ALPHA2_TO_COORD[strike.targetCountryId];
                if (!coord) return null;

                const mappedPt = projection(coord as [number, number]);
                if (!mappedPt) return null;

                return (
                  <g key={`detonation-${strike.id}`}>
                    <circle cx={mappedPt[0]} cy={mappedPt[1]} r="40" fill="none" stroke="#ff2244" strokeWidth="2" className="origin-center animate-[ping_1.5s_infinite]" />
                    <circle cx={mappedPt[0]} cy={mappedPt[1]} r="10" fill="rgba(255, 34, 68, 0.75)" className="animate-ping" />
                  </g>
                );
              })}
          </g>

          {/* Capital cities flag emoji centroids pointers */}
          <g id="country-pins" opacity="0.8">
            {Object.keys(countries).map((id) => {
              const coord = ALPHA2_TO_COORD[id];
              const country = countries[id];
              if (!coord || !country) return null;

              const mappedPt = projection(coord as [number, number]);
              if (!mappedPt) return null;

              const isPlayer = id === playerCountryId;
              const isSelected = id === selectedTargetId;

              return (
                <g key={`pin-${id}`}>
                  <text
                    x={mappedPt[0] - 8}
                    y={mappedPt[1] + 4}
                    fontSize="11"
                    className="select-none pointer-events-none select-none"
                  >
                    {country.flagEmoji}
                  </text>

                  {/* Highlight flashing outline coordinates mark */}
                  {(isPlayer || isSelected) && (
                    <circle
                      cx={mappedPt[0]}
                      cy={mappedPt[1]}
                      r="16"
                      fill="none"
                      stroke={isPlayer ? 'var(--green-100)' : 'var(--amber-300)'}
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                      className="origin-center animate-spin"
                      style={{ animationDuration: '10s' }}
                    />
                  )}

                  {/* ISO Identifier overlay labels */}
                  {zoomTransform.k > 2 && (
                    <text
                      x={mappedPt[0]}
                      y={mappedPt[1] + 16}
                      fill={isPlayer ? '#00ff44' : isSelected ? '#ffb300' : 'rgba(0,255,68,0.5)'}
                      fontSize="7"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {id}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
