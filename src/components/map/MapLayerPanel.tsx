import React from 'react';
import { LayerKey, LayerToggleState } from './mapTypes';

export type { LayerKey, LayerToggleState };

interface MapLayerPanelProps {
  layers: LayerToggleState;
  onToggle: (key: LayerKey) => void;
  onAll: () => void;
  onClear: () => void;
  theme?: 'dark' | 'light';
  isOpen: boolean;
  onToggleOpen: () => void;
}

type LayerItem = {
  key: LayerKey;
  label: string;
  color: string;
};

const SEVEN_LAYERS: LayerItem[] = [
  { key: 'political', label: 'POLITICAL', color: '#00e5c8' },
  { key: 'military', label: 'MILITARY', color: '#f5a623' },
  { key: 'conflicts', label: 'CONFLICTS', color: '#ff3b4e' },
  { key: 'economic', label: 'ECONOMIC', color: '#39d98a' },
  { key: 'nuclear', label: 'NUCLEAR', color: '#00cfff' },
  { key: 'cyber', label: 'CYBER', color: '#b87fff' },
  { key: 'population', label: 'POPULATION', color: '#7ee787' },
];

const EXTENDED_OPS_LAYERS: LayerItem[] = [
  { key: 'isr', label: 'ISR COVERAGE', color: '#00ffaa' },
  { key: 'radar', label: 'RADAR SHIELD', color: '#ff7700' },
  { key: 'logistics', label: 'LOGISTICS LINES', color: '#00f0ff' },
  { key: 'traces', label: 'ASSET TRACES', color: '#ff0055' },
];

export function MapLayerPanel({
  layers,
  onToggle,
  onAll,
  onClear,
  theme = 'dark',
  isOpen,
  onToggleOpen,
}: MapLayerPanelProps) {
  const isDark = theme === 'dark';

  return (
    <div
      id="tactical-layer-control-panel"
      className={`absolute top-16 right-3 z-[120] flex flex-col select-none border backdrop-blur-md rounded-[1px] transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-8 opacity-0 pointer-events-none'}
        ${isDark
          ? 'bg-[#0a0f10]/92 border-[#1e3540] text-[#e8f0f2]'
          : 'bg-white/95 border-zinc-300 text-zinc-900 shadow-xl'
        }
      `}
      style={{
        width: '220px',
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.8), inset 0 0 12px rgba(0, 229, 200, 0.05)'
          : '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header with Small Glowing Dot */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-[#1e3540]/80' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#00e5c8] animate-pulse shadow-[0_0_8px_#00e5c8]' : 'bg-[#00e5c8] shadow-sm'}`} />
          <span className="chrome-header text-[10px] tracking-widest uppercase">
            INTELLIGENCE LAYERS
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          className={`chrome text-[9px] hover:opacity-80 px-1 py-0.5 rounded-[1px]
            ${isDark ? 'bg-[#111c20] text-[#00e5c8]/80' : 'bg-zinc-200 text-cyan-800'}
          `}
          title="Collapse Layers Panel"
        >
          ✕
        </button>
      </div>

      {/* Quick Action Toggle Buttons */}
      <div className={`flex gap-1.5 p-2 border-b ${isDark ? 'border-[#1e3540]/60 bg-[#0d1418]/60' : 'border-zinc-200 bg-zinc-50'}`}>
        <button
          onClick={onAll}
          className={`flex-1 chrome text-[8.5px] py-1 border transition-all rounded-[1px]
            ${isDark
              ? 'bg-[#111c20] border-[#1e3540] hover:bg-[#0d1418] hover:text-[#00e5c8] text-[#8aa4ad]'
              : 'bg-zinc-100 border-zinc-250 hover:bg-zinc-200 hover:text-cyan-800 text-zinc-800'
            }
          `}
        >
          SELECT ALL
        </button>
        <button
          onClick={onClear}
          className={`flex-1 chrome text-[8.5px] py-1 border transition-all rounded-[1px]
            ${isDark
              ? 'bg-[#111c20] border-[#1e3540] hover:bg-[#0d1418] hover:text-[#ff3b4e] text-[#8aa4ad]'
              : 'bg-zinc-100 border-zinc-250 hover:bg-zinc-200 hover:text-red-700 text-zinc-800'
            }
          `}
        >
          CLEAR ALL
        </button>
      </div>

      {/* Layer Rows Category */}
      <div className="flex flex-col max-h-[460px] overflow-y-auto">
        <div className={`px-3 py-1 text-[8px] font-bold tracking-wider border-b ${isDark ? 'chrome-subtle text-[#8aa4ad] bg-[#0d1418]/40 border-[#1e3540]/30' : 'chrome-subtle text-zinc-400 bg-zinc-100/50 border-zinc-200'}`}>
          THEMATIC MONITORS
        </div>

        {SEVEN_LAYERS.map(({ key, label, color }) => {
          const active = !!layers[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`flex items-center gap-3 px-3 py-2 border-b text-left outline-none transition-all duration-150 relative overflow-hidden group
                ${isDark
                  ? `border-[#1e3540]/30 ${active ? 'bg-[#111c20]/60 text-[#e8f0f2]' : 'bg-transparent hover:bg-[#00e5c8]/5 text-[#8aa4ad]'}`
                  : `border-zinc-200 ${active ? 'bg-zinc-100/80 text-zinc-900' : 'bg-transparent hover:bg-zinc-50 text-zinc-500'}`
                }
              `}
            >
              {/* Colored Indicator Strip on active */}
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-[2.5px]" style={{ backgroundColor: color }} />
              )}

              {/* Status color indicator box */}
              <div
                className="w-2.5 h-2.5 flex-shrink-0 border transition-all duration-150 rounded-[1px]"
                style={{
                  borderColor: color,
                  backgroundColor: active ? color : 'transparent',
                  boxShadow: active && isDark ? `0 0 6px ${color}` : 'none',
                }}
              />

              {/* Text label with Chakra Petch typeface */}
              <div className="flex-1 min-w-0 pr-1 select-none">
                <p className={`chrome text-[9px] transition-colors duration-150
                  ${active
                    ? 'text-[#e8f0f2]'
                    : (isDark ? 'text-[#8aa4ad] group-hover:text-[#e8f0f2]' : 'text-zinc-650')
                  }
                `}>
                  {label}
                </p>
              </div>

              {/* ON/OFF indicators in JetBrains Mono */}
              <span className={`data-inline text-[8px] transition-all duration-150
                ${active
                  ? (isDark ? 'text-[#00e5c8]' : 'text-teal-700')
                  : 'text-slate-650 opacity-40 group-hover:opacity-80'
                }
              `}>
                {active ? 'ON' : 'OFF'}
              </span>
            </button>
          );
        })}

        {/* Operational Detectors Section */}
        <div className={`px-3 py-1 text-[8px] font-bold tracking-wider border-b border-t ${isDark ? 'chrome-subtle text-[#8aa4ad] bg-[#0d1418]/40 border-[#1e3540]/30' : 'chrome-subtle text-zinc-400 bg-zinc-100/50 border-zinc-200'}`}>
          OPERATIONAL DETECTORS
        </div>

        {EXTENDED_OPS_LAYERS.map(({ key, label, color }) => {
          const active = !!layers[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`flex items-center gap-3 px-3 py-2 border-b text-left outline-none transition-all duration-150 relative overflow-hidden group
                ${isDark
                  ? `border-[#1e3540]/30 ${active ? 'bg-[#111c20]/60 text-[#e8f0f2]' : 'bg-transparent hover:bg-[#00e5c8]/5 text-[#8aa4ad]'}`
                  : `border-zinc-200 ${active ? 'bg-zinc-100/80 text-zinc-900' : 'bg-transparent hover:bg-zinc-50 text-zinc-500'}`
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-[2.5px]" style={{ backgroundColor: color }} />
              )}

              <div
                className="w-2.5 h-2.5 flex-shrink-0 border transition-all duration-150 rounded-[1px]"
                style={{
                  borderColor: color,
                  backgroundColor: active ? color : 'transparent',
                  boxShadow: active && isDark ? `0 0 6px ${color}` : 'none',
                }}
              />

              <div className="flex-1 min-w-0 pr-1 select-none">
                <p className={`chrome text-[9px] transition-colors duration-150
                  ${active
                    ? 'text-[#e8f0f2]'
                    : (isDark ? 'text-[#8aa4ad] group-hover:text-[#e8f0f2]' : 'text-zinc-650')
                  }
                `}>
                  {label}
                </p>
              </div>

              <span className={`data-inline text-[8px] transition-all duration-150
                ${active
                  ? (isDark ? 'text-[#00e5c8]' : 'text-teal-700')
                  : 'text-slate-650 opacity-40 group-hover:opacity-80'
                }
              `}>
                {active ? 'ON' : 'OFF'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MapLayerPanel;
