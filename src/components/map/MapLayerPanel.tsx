import React from 'react';

export type LayerKey = 'political' | 'military' | 'conflicts' | 'economic' | 'nuclear' | 'cyber' | 'population' | 'isr' | 'radar' | 'logistics' | 'traces';

export interface LayerToggleState {
  political: boolean;
  military: boolean;
  conflicts: boolean;
  economic: boolean;
  nuclear: boolean;
  cyber: boolean;
  population: boolean;
  isr: boolean;
  radar: boolean;
  logistics: boolean;
  traces: boolean;
}

type LayerConfig = {
  key: LayerKey;
  label: string;
  color: string;
  icon: string;
  description: string;
};

const BASE_LAYER_CONFIG: LayerConfig[] = [
  { key: 'political',  label: 'POLITICAL DECREE', color: '#00e5c8', icon: '◈', description: 'Sovereign boundaries, regime blocks, and alignment.' },
  { key: 'conflicts',  label: 'COMBAT DOMAINS',  color: '#ff3b4e', icon: '⚔', description: 'Active conflicts, disputed territories, and flashpoints.' },
  { key: 'military',   label: 'MILITARY SHIELD',   color: '#f5a623', icon: '▲', description: 'Active bases, deployed divisions, and military indicators.' },
  { key: 'nuclear',    label: 'STRATEGIC SILOS', color: '#00cfff', icon: '☢', description: 'Thermo-nuclear facilities, launch complexes, and warning areas.' },
  { key: 'economic',   label: 'TRADE MERIDIANS', color: '#39d98a', icon: '◉', description: 'Major trade corridors, GDP zones, and resource pipelines.' },
  { key: 'cyber',      label: 'CYBER INTERCEPTS',   color: '#b87fff', icon: '⬡', description: 'Undersea optical fibre stations, and intrusion activities.' },
  { key: 'population', label: 'CIVIL DISCONTENT', color: '#eec152', icon: '●', description: 'Populated zones, displacement tracks, and civilian unrest.' },
];

const OPS_LAYER_CONFIG: LayerConfig[] = [
  { key: 'isr',        label: 'ISR SENSOR SPAN',  color: '#00ffaa', icon: '📡', description: 'Active satellite footprint swaths and scan sectors.' },
  { key: 'radar',      label: 'RADAR AD SHIELD',  color: '#ff7700', icon: '⚙', description: 'Tactical early-warning grids and dynamic coverage domes.' },
  { key: 'logistics',  label: 'LOGISTICS LANES',  color: '#00f0ff', icon: '⇄', description: 'Strategic commerce routes and maritime trade pipelines.' },
  { key: 'traces',     label: 'LIVE ASSET TRACES',color: '#ff0055', icon: '✈', description: 'Active operations, flight patrols, and weapon tracking vector paths.' },
];


interface MapLayerPanelProps {
  layers: LayerToggleState;
  onToggle: (key: LayerKey) => void;
  onAll: () => void;
  onClear: () => void;
  theme?: 'dark' | 'light';
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function MapLayerPanel({ 
  layers, 
  onToggle, 
  onAll, 
  onClear, 
  theme = 'dark',
  isOpen,
  onToggleOpen
}: MapLayerPanelProps) {
  const isDark = theme === 'dark';

  return (
    <div
      id="tactical-layer-control-panel"
      className={`absolute top-16 right-3 z-[110] flex select-none border backdrop-blur-md rounded-[1px] font-sans transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-8 opacity-0 pointer-events-none'}
        ${isDark 
          ? 'bg-slate-950/92 border-slate-900/95 text-slate-100' 
          : 'bg-white/95 border-zinc-350 text-zinc-900 shadow-xl'
        }
      `}
      style={{
        width: '210px',
        boxShadow: isDark 
          ? '0 4px 24px rgba(0,0,0,0.6), inset 0 0 12px rgba(92, 122, 140, 0.05)' 
          : '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col w-[210px]">
        {/* Dynamic Selector Header */}
        <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-slate-900/80' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(0,207,255,0.7)]' : 'bg-cyan-700'}`} />
            <span className={`text-[9.5px]/none font-bold tracking-widest font-display uppercase ${isDark ? 'text-slate-400' : 'text-zinc-650'}`}>
              INTEL LAYERS
            </span>
          </div>
          <button 
            onClick={onToggleOpen}
            className={`text-[9px] font-mono leading-none hover:opacity-80 px-1 py-0.5 rounded-[1px]
              ${isDark ? 'bg-slate-900/80 text-cyan-500/80' : 'bg-zinc-200 text-cyan-800'}
            `}
            title="Collapse Layers Panel"
          >
            ✕
          </button>
        </div>

        {/* Fast Action Buttons Section (ALL, CLEAR) */}
        <div className={`flex gap-1 p-2 border-b ${isDark ? 'border-slate-900/80 bg-slate-950/40' : 'border-zinc-150 bg-zinc-50'}`}>
          <button
            onClick={onAll}
            className={`flex-1 font-mono text-[8.5px] font-bold py-1 border transition-all rounded-[1px]
              ${isDark 
                ? 'bg-slate-900/55 border-slate-850 hover:bg-slate-900 hover:text-cyan-400' 
                : 'bg-zinc-100 border-zinc-250 hover:bg-zinc-200 hover:text-cyan-800 text-zinc-805'
              }
            `}
          >
            SELECT ALL
          </button>
          <button
            onClick={onClear}
            className={`flex-1 font-mono text-[8.5px] font-bold py-1 border transition-all rounded-[1px]
              ${isDark 
                ? 'bg-slate-900/55 border-slate-850 hover:bg-slate-900 hover:text-red-400' 
                : 'bg-zinc-100 border-zinc-250 hover:bg-zinc-200 hover:text-red-700 text-zinc-805'
              }
            `}
          >
            CLEAR ALL
          </button>
        </div>

        {/* Layer rows */}
        <div className="flex flex-col max-h-[420px] overflow-y-auto">
          <div className={`px-3 py-1 text-[8px] font-bold font-mono tracking-wider border-b ${isDark ? 'text-slate-500 bg-slate-950/50 border-slate-900/40' : 'text-zinc-400 bg-zinc-100/50 border-zinc-200'}`}>
            BASE THEMATIC MAP
          </div>
          {BASE_LAYER_CONFIG.map(({ key, label, color, icon, description }) => {
            const active = layers[key];
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                title={description}
                className={`flex items-center gap-3 px-3 py-1.5 border-b text-left outline-none transition-all duration-150 relative overflow-hidden group
                  ${isDark 
                    ? `border-slate-900/40 ${active ? 'bg-slate-900/40 text-slate-100' : 'bg-transparent hover:bg-slate-900/10 text-slate-400'}`
                    : `border-zinc-200 ${active ? 'bg-zinc-100/80 text-zinc-900' : 'bg-transparent hover:bg-zinc-50 text-zinc-500'}`
                  }
                `}
              >
                {/* Dynamic status line left */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2.5px]" style={{ backgroundColor: color }} />
                )}

                {/* Status color indicator box */}
                <div
                  className="w-2 h-2 flex-shrink-0 border transition-all duration-150 rounded-[1px]"
                  style={{
                    borderColor: color,
                    backgroundColor: active ? color : 'transparent',
                    boxShadow: active && isDark ? `0 0 6px ${color}` : 'none'
                  }}
                />

                {/* Semantic tactical icon */}
                <span className="font-mono text-[9px] font-bold shrink-0 text-center select-none w-3.5" style={{ color }}>
                  {icon}
                </span>

                {/* Text metadata */}
                <div className="flex-1 min-w-0 pr-1 select-none">
                  <p className={`text-[8.5px] font-bold font-display tracking-wider leading-none transition-colors duration-150
                    ${active 
                      ? (isDark ? 'text-slate-100' : 'text-zinc-900') 
                      : (isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-zinc-400 group-hover:text-zinc-650')
                    }
                  `}>
                    {label}
                  </p>
                </div>

                {/* Active Toggle Tag */}
                <span className={`font-mono text-[7.5px] font-bold tracking-tight transition-all duration-150
                  ${active 
                    ? (isDark ? 'text-cyan-400 opacity-100' : 'text-cyan-700 opacity-100') 
                    : (isDark ? 'text-slate-650 opacity-40 group-hover:opacity-75' : 'text-zinc-400 opacity-40 group-hover:opacity-75')
                  }
                `}>
                  {active ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}

          <div className={`px-3 py-1 text-[8px] font-bold font-mono tracking-wider border-b border-t ${isDark ? 'text-slate-500 bg-slate-950/50 border-slate-900/40' : 'text-zinc-400 bg-zinc-100/50 border-zinc-200'}`}>
            OPERATIONS DETECTORS
          </div>
          {OPS_LAYER_CONFIG.map(({ key, label, color, icon, description }) => {
            const active = layers[key];
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                title={description}
                className={`flex items-center gap-3 px-3 py-1.5 border-b text-left outline-none transition-all duration-150 relative overflow-hidden group
                  ${isDark 
                    ? `border-slate-900/40 ${active ? 'bg-slate-900/40 text-slate-100' : 'bg-transparent hover:bg-slate-900/10 text-slate-400'}`
                    : `border-zinc-200 ${active ? 'bg-zinc-100/80 text-zinc-900' : 'bg-transparent hover:bg-zinc-50 text-zinc-500'}`
                  }
                `}
              >
                {/* Dynamic status line left */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2.5px]" style={{ backgroundColor: color }} />
                )}

                {/* Status color indicator box */}
                <div
                  className="w-2 h-2 flex-shrink-0 border transition-all duration-150 rounded-[1px]"
                  style={{
                    borderColor: color,
                    backgroundColor: active ? color : 'transparent',
                    boxShadow: active && isDark ? `0 0 6px ${color}` : 'none'
                  }}
                />

                {/* Semantic tactical icon */}
                <span className="font-mono text-[9px] font-bold shrink-0 text-center select-none w-3.5" style={{ color }}>
                  {icon}
                </span>

                {/* Text metadata */}
                <div className="flex-1 min-w-0 pr-1 select-none">
                  <p className={`text-[8.5px] font-bold font-display tracking-wider leading-none transition-colors duration-150
                    ${active 
                      ? (isDark ? 'text-slate-100' : 'text-zinc-900') 
                      : (isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-zinc-400 group-hover:text-zinc-650')
                    }
                  `}>
                    {label}
                  </p>
                </div>

                {/* Active Toggle Tag */}
                <span className={`font-mono text-[7.5px] font-bold tracking-tight transition-all duration-150
                  ${active 
                    ? (isDark ? 'text-cyan-400 opacity-100' : 'text-cyan-700 opacity-100') 
                    : (isDark ? 'text-slate-650 opacity-40 group-hover:opacity-75' : 'text-zinc-400 opacity-40 group-hover:opacity-75')
                  }
                `}>
                  {active ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MapLayerPanel;
