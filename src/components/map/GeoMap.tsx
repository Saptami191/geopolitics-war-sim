import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, ArcLayer, IconLayer } from '@deck.gl/layers';

// Zustand stores
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { useLinkedAnalysisStore } from '../../store/linkedAnalysisStore';
import { useCanonicalMapState } from './mapSelectors';

// Types and helper files
import { LayerKey, LayerToggleState } from './mapTypes';
import { getCentroid } from './countryCentroids';
import { MapCoordinateReadout } from './MapCoordinateReadout';
import MapLayerPanel from './MapLayerPanel';
import MapModeToggle from './MapModeToggle';
import { InGameGlobe } from './InGameGlobe';

// CARTO Dark Matter raster base tiles style
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
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster' as const,
      source: 'carto-dark',
      paint: {
        'raster-saturation': -0.7,
        'raster-hue-rotate': 190,
        'raster-contrast': 0.15,
        'raster-brightness-min': 0,
        'raster-brightness-max': 0.7,
      }
    }
  ]
};

// Simple visual SVGs URL-encoded to feed directly into deck.gl's IconLayer
const MILITARY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="%23f5a623" stroke="%23ffebc2" stroke-width="2"><polygon points="12,2 22,12 12,22 2,12" /></svg>`;
const MILITARY_ICON_DATA = `data:image/svg+xml;utf8,${encodeURIComponent(MILITARY_SVG)}`;

const CYBER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="%23b87fff" stroke-width="2"><polygon points="12,2 22,8 22,16 12,22 2,16 2,8" /></svg>`;
const CYBER_ICON_DATA = `data:image/svg+xml;utf8,${encodeURIComponent(CYBER_SVG)}`;

interface GeoMapProps {
  mode: '2d' | '3d';
  layers: LayerToggleState;
  theme?: 'dark' | 'light';
}

export function GeoMap({ mode: initialMode, layers: initialLayers, theme = 'dark' }: GeoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const deckRef = useRef<Deck | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<'2d' | '3d'>(initialMode);
  const [localLayers, setLocalLayers] = useState<LayerToggleState>({
    political: true,
    military: true,
    conflicts: true,
    economic: false,
    nuclear: true,
    cyber: false,
    population: false,
    ...initialLayers,
  });

  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(true);
  const [animationTick, setAnimationTick] = useState(0);

  // Synchronized stores variables
  const countries = useWorldStore((s) => s.countries);
  const activeStrikes = useWorldStore((s) => s.activeStrikes);
  
  // Use map canonical selectors
  const mapState = useCanonicalMapState(localLayers, theme);
  const playerCountryId = mapState.playerCountryId;
  const targetCountryId = mapState.targetCountryId;

  // Track ticker and animation loops for pulsing overlay circles
  useEffect(() => {
    let frameId: number;
    const updateAnimations = () => {
      setAnimationTick((prev) => prev + 1);
      frameId = requestAnimationFrame(updateAnimations);
    };
    frameId = requestAnimationFrame(updateAnimations);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Update layout when mode prop updates
  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  // MapLibre and Deck.gl Initialization Cycle
  useEffect(() => {
    if (activeMode !== '2d' || !mapContainerRef.current) return;

    setIsLoading(true);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DARK_BASEMAP_STYLE,
      center: [20, 28],
      zoom: 1.8,
      minZoom: 1.1,
      maxZoom: 7,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      const deck = new Deck({
        canvas: 'deck-canvas',
        width: '100%',
        height: '100%',
        initialViewState: {
          longitude: 20,
          latitude: 28,
          zoom: 1.8,
        } as any,
        controller: true,
        onViewStateChange: ({ viewState }: any) => {
          map.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing ?? 0,
            pitch: viewState.pitch ?? 0,
          });
        },
        layers: [],
      });

      deckRef.current = deck;
      setIsLoading(false);

      // MapLibre input interaction camera events updates deck.gl state
      map.on('move', () => {
        const center = map.getCenter();
        deck.setProps({
          viewState: {
            longitude: center.lng,
            latitude: center.lat,
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch(),
          } as any
        });
      });
    });

    return () => {
      deckRef.current?.finalize();
      mapRef.current?.remove();
      deckRef.current = null;
      mapRef.current = null;
    };
  }, [activeMode]);

  // Synchronize dynamic Deck overlays in real-time
  useEffect(() => {
    if (activeMode !== '2d' || !deckRef.current) return;

    const activeDeckLayers: any[] = [];

    // --- Interactive overlay handler helper ---
    const handleItemClick = (info: any) => {
      if (info.object && info.object.id) {
        useLinkedAnalysisStore.getState().selectCountry(info.object.id);
      }
    };

    // --- 1. POLITICAL INTEL LAYER ---
    if (localLayers.political) {
      const politicalPoints = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const isPlayer = id === playerCountryId;
        const isTarget = id === targetCountryId;
        return {
          id,
          name: country.name || id,
          coordinates: centroid,
          isPlayer,
          isTarget,
        };
      }).filter(d => d.coordinates[0] !== 0 || d.coordinates[1] !== 0);

      activeDeckLayers.push(
        new ScatterplotLayer({
          id: 'political-centroids',
          data: politicalPoints,
          getPosition: (d: any) => d.coordinates,
          getRadius: (d: any) => d.isPlayer ? 180000 : (d.isTarget ? 150000 : 70000),
          getFillColor: (d: any) => d.isPlayer ? [0, 229, 200, 230] : (d.isTarget ? [255, 59, 78, 230] : [0, 229, 200, 75]),
          getLineColor: (d: any) => d.isPlayer ? [0, 255, 170, 255] : [0, 229, 200, 180],
          lineWidthMinPixels: 1,
          stroked: true,
          pickable: true,
          onClick: handleItemClick,
          updateTriggers: {
            getFillColor: [playerCountryId, targetCountryId],
            getRadius: [playerCountryId, targetCountryId]
          }
        })
      );
    }

    // --- 2. MILITARY LAYER ---
    if (localLayers.military) {
      const militaryNodes = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const powerRating = country.arsenal?.totalPowerRating ?? 0;
        return {
          id,
          name: country.name,
          coordinates: centroid,
          powerRating,
        };
      }).filter(d => d.coordinates[0] !== 0 && d.powerRating > 30);

      activeDeckLayers.push(
        new IconLayer({
          id: 'military-assets',
          data: militaryNodes,
          getIcon: () => ({
            url: MILITARY_ICON_DATA,
            width: 24,
            height: 24,
            mask: false,
          }),
          getPosition: (d: any) => d.coordinates,
          getSize: (d: any) => Math.min(22, Math.max(12, d.powerRating * 0.05)),
          pickable: true,
          onClick: handleItemClick,
        })
      );
    }

    // --- 3. CONFLICTS LAYER ---
    if (localLayers.conflicts) {
      const conflictNodes = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const hasWar = country.atWarWith && country.atWarWith.length > 0;
        return {
          id,
          name: country.name,
          coordinates: centroid,
          hasWar,
        };
      }).filter(d => d.coordinates[0] !== 0 && d.hasWar);

      const pulseFactor = 1 + 0.35 * Math.sin(animationTick * 0.08);

      activeDeckLayers.push(
        new ScatterplotLayer({
          id: 'conflict-pulse-outer',
          data: conflictNodes,
          getPosition: (d: any) => d.coordinates,
          getRadius: () => 160000 * pulseFactor,
          getFillColor: [255, 59, 78, 35],
          getLineColor: [255, 59, 78, 225],
          lineWidthMinPixels: 1.5,
          stroked: true,
          pickable: true,
          onClick: handleItemClick,
        }),
        new ScatterplotLayer({
          id: 'conflict-pulse-inner',
          data: conflictNodes,
          getPosition: (d: any) => d.coordinates,
          getRadius: 70000,
          getFillColor: [255, 59, 78, 255],
          stroked: false,
          pickable: true,
          onClick: handleItemClick,
        })
      );
    }

    // --- 4. ECONOMIC LAYER ---
    if (localLayers.economic) {
      const economicNodes = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const gdp = country.economic?.gdpB ?? 0;
        return {
          id,
          name: country.name,
          coordinates: centroid,
          gdp,
        };
      }).filter(d => d.coordinates[0] !== 0 && d.gdp > 10);

      activeDeckLayers.push(
        new ScatterplotLayer({
          id: 'economic-markers',
          data: economicNodes,
          getPosition: (d: any) => d.coordinates,
          getRadius: (d: any) => Math.min(300000, Math.max(55000, d.gdp * 45)),
          getFillColor: [57, 217, 138, 110],
          getLineColor: [57, 217, 138, 230],
          lineWidthMinPixels: 1,
          stroked: true,
          pickable: true,
          onClick: handleItemClick,
        })
      );
    }

    // --- 5. NUCLEAR LAYER ---
    if (localLayers.nuclear) {
      const nuclearNodes = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const isCapable = country.arsenal?.nuclearCapable ?? false;
        return {
          id,
          name: country.name,
          coordinates: centroid,
          isCapable,
        };
      }).filter(d => d.coordinates[0] !== 0 && d.isCapable);

      activeDeckLayers.push(
        new ScatterplotLayer({
          id: 'nuclear-warning-rings',
          data: nuclearNodes,
          getPosition: (d: any) => d.coordinates,
          getRadius: 280000,
          getFillColor: [0, 207, 255, 25],
          getLineColor: [0, 207, 255, 220],
          lineWidthMinPixels: 1.8,
          stroked: true,
          pickable: true,
          onClick: handleItemClick,
        })
      );
    }

    // --- 6. CYBER LAYER ---
    if (localLayers.cyber) {
      const cyberNodes = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const level = country.intelligence?.cyberFirewallLevel ?? 1;
        return {
          id,
          name: country.name,
          coordinates: centroid,
          level,
        };
      }).filter(d => d.coordinates[0] !== 0);

      activeDeckLayers.push(
        new IconLayer({
          id: 'cyber-intercept-points',
          data: cyberNodes,
          getIcon: () => ({
            url: CYBER_ICON_DATA,
            width: 24,
            height: 24,
            mask: false,
          }),
          getPosition: (d: any) => d.coordinates,
          getSize: (d: any) => 15 + d.level * 2,
          pickable: true,
          onClick: handleItemClick,
        })
      );
    }

    // --- 7. POPULATION LAYER ---
    if (localLayers.population) {
      const populationNodes = Object.entries(countries).map(([id, country]: [string, any]) => {
        const centroid = getCentroid(id);
        const popM = country.demographic?.populationM ?? 5;
        return {
          id,
          name: country.name,
          coordinates: centroid,
          popM,
        };
      }).filter(d => d.coordinates[0] !== 0);

      activeDeckLayers.push(
        new ScatterplotLayer({
          id: 'population-density',
          data: populationNodes,
          getPosition: (d: any) => d.coordinates,
          getRadius: (d: any) => Math.min(420000, Math.max(65000, d.popM * 520)),
          getFillColor: [126, 231, 135, 80],
          stroked: false,
          pickable: true,
          onClick: handleItemClick,
        })
      );
    }

    // --- STRIKE ARCS BASELINE ---
    const liveStrikes = activeStrikes.filter((s: any) => s.status === 'IN_FLIGHT' || s.progressPct < 100);

    activeDeckLayers.push(
      new ArcLayer({
        id: 'strike-arcs',
        data: liveStrikes,
        getSourcePosition: (d: any) => getCentroid(d.sourceCountryId),
        getTargetPosition: (d: any) => getCentroid(d.targetCountryId),
        getSourceColor: [255, 59, 78, 225],
        getTargetColor: [255, 59, 78, 65],
        getWidth: 3,
        greatCircle: true,
        pickable: true,
      })
    );

    deckRef.current.setProps({ layers: activeDeckLayers });
  }, [activeMode, countries, activeStrikes, localLayers, playerCountryId, targetCountryId, animationTick]);

  const handleToggleLayer = (key: LayerKey) => {
    setLocalLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAllLayers = () => {
    setLocalLayers({
      political: true,
      military: true,
      conflicts: true,
      economic: true,
      nuclear: true,
      cyber: true,
      population: true,
    });
  };

  const handleClearLayers = () => {
    setLocalLayers({
      political: false,
      military: false,
      conflicts: false,
      economic: false,
      nuclear: false,
      cyber: false,
      population: false,
    });
  };

  if (activeMode === '3d') {
    return (
      <div className="absolute inset-0 w-full h-full relative overflow-hidden bg-slate-950">
        {/* Render 3D Earth Globe with the shared state */}
        <InGameGlobe theme={theme} layers={localLayers} />

        {/* Tactical Layer Toggle Panels and map widgets floating on core 3D scene */}
        <MapLayerPanel
          layers={localLayers}
          onToggle={handleToggleLayer}
          onAll={handleAllLayers}
          onClear={handleClearLayers}
          theme={theme}
          isOpen={isLayerPanelOpen}
          onToggleOpen={() => setIsLayerPanelOpen(prev => !prev)}
        />

        <MapModeToggle mode={activeMode} onToggle={(m) => setActiveMode(m)} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950" id="geo-map-frame" style={{ position: 'relative' }}>
      
      {/* HUD Radar Pulse effect */}
      <div className="absolute inset-0 pointer-events-none z-[10] border border-cyan-800/10 bg-[radial-gradient(ellipse_at_top,rgba(0,229,200,0.012)_0%,rgba(0,0,0,0)_100%)] select-none mix-blend-screen animate-pulse" />

      {/* Sensor establishment loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center font-mono gap-3 select-none bg-slate-950/92">
          <div className="w-10 h-10 border-2 rounded-full animate-spin border-cyan-500/10 border-t-cyan-400" />
          <span className="text-[10px] font-bold tracking-widest animate-pulse uppercase text-cyan-400 font-sans">
            ESTABLISHING ORBITAL SENSOR FEED...
          </span>
        </div>
      )}

      {/* MapLibre Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ position: 'absolute' }} />

      {/* Passive high-perf deck.gl overlay canvas */}
      <canvas
        id="deck-canvas"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 20
        }}
      />

      {/* Coordinates status readouts */}
      <MapCoordinateReadout map={mapRef.current} theme={theme} />

      {/* Floating Panel Widgets */}
      <MapLayerPanel
        layers={localLayers}
        onToggle={handleToggleLayer}
        onAll={handleAllLayers}
        onClear={handleClearLayers}
        theme={theme}
        isOpen={isLayerPanelOpen}
        onToggleOpen={() => setIsLayerPanelOpen(prev => !prev)}
      />

      {/* 2D Flat vs 3D Globe Projection Select */}
      <MapModeToggle mode={activeMode} onToggle={(m) => setActiveMode(m)} />
    </div>
  );
}

export default GeoMap;
