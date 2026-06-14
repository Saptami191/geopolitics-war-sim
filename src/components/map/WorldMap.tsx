import React, { useState, useEffect } from 'react';
import { GeoMap } from './GeoMap';
import { InGameGlobe } from './InGameGlobe';
import { MapLayerPanel, LayerToggleState, LayerKey } from './MapLayerPanel';
import { MapLegend } from './MapLegend';
import { useUIStore } from '../../store/uiStore';

interface WorldMapProps {
  activeLayer?: 'POLITICAL' | 'MILITARY' | 'ECONOMIC' | 'CYBER' | 'WEATHER' | 'PROPAGANDA' | 'POPULATION';
}

export default function WorldMap({ activeLayer }: WorldMapProps) {
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const isDossierOpen = useUIStore((s) => s.countryInspectorId !== null);

  // Control draw levels
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  // Multi-select Tactical Layers state starting with ALL layers active by default
  const [layers, setLayers] = useState<LayerToggleState>({
    political: true,
    military: true,
    conflicts: true,
    economic: true,
    nuclear: true,
    cyber: true,
    population: true,
    isr: true,
    radar: true,
    logistics: true,
    traces: true,
    propaganda: true,
  });

  // Count active layers
  const activeCount = Object.values(layers).filter(Boolean).length;

  // Synchronize parent overrides with the multi-select state
  useEffect(() => {
    if (activeLayer) {
      const mappedKey = activeLayer.toLowerCase() as any;
      const validKeys: LayerKey[] = ['political', 'military', 'conflicts', 'economic', 'nuclear', 'cyber', 'population', 'propaganda'];
      if (validKeys.includes(mappedKey)) {
        setLayers((prev) => ({
          ...prev,
          [mappedKey]: true,
        }));
      }
    }
  }, [activeLayer]);

  // Toggle individual layer
  const onLayerToggle = (key: LayerKey) => {
    setLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Turn all layers ON
  const onLayerAll = () => {
    setLayers({
      political: true,
      military: true,
      conflicts: true,
      economic: true,
      nuclear: true,
      cyber: true,
      population: true,
      isr: true,
      radar: true,
      logistics: true,
      traces: true,
      propaganda: true,
    });
  };

  // Turn all layers OFF
  const onLayerClear = () => {
    setLayers({
      political: false,
      military: false,
      conflicts: false,
      economic: false,
      nuclear: false,
      cyber: false,
      population: false,
      isr: false,
      radar: false,
      logistics: false,
      traces: false,
      propaganda: false,
    });
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className={`w-full h-full relative transition-colors duration-200 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-zinc-100'}`} 
      id="world-map-wrapper"
    >
      {/* Basemap System (2D MapLibre / 3D Globe representation) */}
      {mode === '2d' ? (
        <GeoMap mode={mode} layers={layers} theme={theme} />
      ) : (
        <InGameGlobe theme={theme} layers={layers} />
      )}

      {/* PRIMARY COMMAND CONTROL BAR (Console) */}
      {!isDossierOpen && (
        <div
          id="tactical-command-console-bar"
          className={`absolute top-3 left-3 z-[130] flex items-center gap-3 px-3 py-2 border backdrop-blur-md rounded-[1px] shadow-lg transition-all duration-200 select-none
            ${isDark
              ? 'bg-slate-950/90 border-cyan-950/70 text-slate-100'
              : 'bg-white/95 border-zinc-300 text-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
            }
          `}
        >
          {/* Identifier Badge */}
          <div className="flex items-center gap-2 border-r pr-3 border-current/25">
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-600'}`} />
            <span className="font-display text-[10px] font-extrabold tracking-widest uppercase">
              Sovereign Command
            </span>
          </div>

          {/* View Mode Select */}
          <div className="flex items-center gap-1.5 border-r pr-3 border-current/25">
            <span className="text-[8px] font-mono text-current/50 font-bold uppercase">PROJECTION:</span>
            <div className="flex gap-0.5 bg-current/5 p-0.5 rounded-[1px]">
              <button
                onClick={() => setMode('2d')}
                className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-[1px] transition-all
                  ${mode === '2d'
                    ? (isDark ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30' : 'bg-cyan-700 text-white')
                    : 'text-current/60 hover:text-current border border-transparent'
                  }
                `}
              >
                2D FLAT
              </button>
              <button
                onClick={() => setMode('3d')}
                className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-[1px] transition-all
                  ${mode === '3d'
                    ? (isDark ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30' : 'bg-cyan-700 text-white')
                    : 'text-current/60 hover:text-current border border-transparent'
                  }
                `}
              >
                3D GLOBE
              </button>
            </div>
          </div>

          {/* Map Theme Toggle */}
          <div className="flex items-center gap-1.5 border-r pr-3 border-current/25">
            <span className="text-[8px] font-mono text-current/50 font-bold uppercase">THEME:</span>
            <div className="flex gap-0.5 bg-current/5 p-0.5 rounded-[1px]">
              <button
                onClick={() => setTheme('dark')}
                className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-[1px] transition-all
                  ${isDark
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-400/30'
                    : 'text-zinc-500 hover:text-zinc-850'
                  }
                `}
              >
                DARK HUD
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-[1px] transition-all
                  ${!isDark
                    ? 'bg-zinc-200 text-cyan-800 border border-zinc-400/40'
                    : 'text-slate-400 hover:text-slate-100'
                  }
                `}
              >
                LIGHT MAP
              </button>
            </div>
          </div>

          {/* Intelligence Controllers */}
          <div className="flex items-center gap-1">
            {/* Layers Toggle Button */}
            <button
              onClick={() => setIsLayerPanelOpen(prev => !prev)}
              className={`font-display text-[9.5px] font-bold tracking-wider px-2.5 py-1 rounded-[1px] border flex items-center gap-1 transition-all
                ${isLayerPanelOpen
                  ? (isDark ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/80' : 'bg-cyan-700 text-white border-cyan-800')
                  : (isDark ? 'bg-transparent border-slate-800/80 text-slate-400 hover:text-slate-100 hover:border-slate-700' : 'bg-zinc-200/55 border-zinc-350 text-zinc-700 hover:text-zinc-900')
                }
              `}
            >
              <span>LAYERS</span>
              <span className={`text-[8.5px] leading-none px-1 rounded-full ${isLayerPanelOpen ? 'bg-cyan-400/30 text-current' : 'bg-current/10'}`}>
                {activeCount}
              </span>
            </button>

            {/* Symbology Toggle Button */}
            <button
              onClick={() => setIsLegendOpen(prev => !prev)}
              className={`font-display text-[9.5px] font-bold tracking-wider px-2.5 py-1 rounded-[1px] border flex items-center gap-1 transition-all
                ${isLegendOpen
                  ? (isDark ? 'bg-orange-500/20 text-orange-400 border-orange-400/80 shadow-md' : 'bg-amber-700 text-white border-amber-800')
                  : (isDark ? 'bg-transparent border-slate-800/80 text-slate-400 hover:text-slate-100 hover:border-slate-700' : 'bg-zinc-200/55 border-zinc-350 text-zinc-700 hover:text-zinc-900')
                }
              `}
            >
              📊 SYMBOLOGY
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Collapsible Intelligence command drawer */}
      {!isDossierOpen && (
        <MapLayerPanel 
          layers={layers} 
          onToggle={onLayerToggle} 
          onAll={onLayerAll}
          onClear={onLayerClear}
          theme={theme}
          isOpen={isLayerPanelOpen}
          onToggleOpen={() => setIsLayerPanelOpen(prev => !prev)}
        />
      )}

      {/* Unified tactical symbology legers (Collapsible & Dismissible) */}
      {!isDossierOpen && (
        <MapLegend 
          layers={layers} 
          theme={theme} 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      )}
    </div>
  );
}

export { WorldMap };
