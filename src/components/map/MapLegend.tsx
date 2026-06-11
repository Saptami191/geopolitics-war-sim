import React from 'react';
import { TACTICAL_ICONS } from './mapIcons';
import { MAP_THEME } from './mapStyles';
import { LayerToggleState } from './MapLayerPanel';

interface MapLegendProps {
  layers: LayerToggleState;
  theme?: 'dark' | 'light';
  isOpen: boolean;
  onClose: () => void;
}

export function MapLegend({ layers, theme = 'dark', isOpen, onClose }: MapLegendProps) {
  const isDark = theme === 'dark';

  // Get list of active layer keys
  const activeKeys = Object.entries(layers)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  return (
    <div
      id="tactical-legend-ledger"
      className={`absolute bottom-3 right-3 z-[110] flex flex-col w-[210px] max-h-[340px] overflow-y-auto select-none border backdrop-blur-md rounded-[1px] font-sans transition-all duration-305 ease-in-out
        ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none'}
        ${isDark
          ? 'bg-slate-950/90 border-slate-900/90 text-slate-100'
          : 'bg-white/95 border-zinc-350 text-zinc-900 shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
        }
      `}
      style={{ boxShadow: isDark ? 'inset 0 0 12px rgba(92, 122, 140, 0.05)' : 'none' }}
    >
      {/* Legend Title */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b ${isDark ? 'border-slate-900/80' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-orange-400 animate-pulse' : 'bg-orange-600'}`} />
          <span className={`text-[9px] font-bold tracking-widest uppercase font-display ${isDark ? 'text-slate-400' : 'text-zinc-650'}`}>
            SYMBOLOGY
          </span>
        </div>
        <button
          onClick={onClose}
          className={`text-[9px] font-mono leading-none hover:opacity-80 px-1 py-0.5 rounded-[1px]
            ${isDark ? 'bg-slate-900/85 text-orange-400' : 'bg-zinc-200 text-amber-900'}
          `}
          title="Close Symbology"
        >
          ✕
        </button>
      </div>

      {/* Layer Explanations (Dynamic list based on multiple active labels) */}
      <div className="p-3 flex flex-col gap-3">
        {activeKeys.length === 0 ? (
          <span className={`text-[8px] font-mono uppercase ${isDark ? 'text-slate-500' : 'text-zinc-400'}`}>
            NO ACTIVE LAYERS SELECTED
          </span>
        ) : (
          activeKeys.map((layerKey) => {
            const config = TACTICAL_ICONS[layerKey];
            if (!config) return null;
            return (
              <div key={layerKey} className="flex gap-2">
                <span
                  className={`font-mono text-xs font-bold shrink-0 text-center w-4 h-4 leading-4 border rounded-[1px]
                    ${isDark
                      ? 'border-slate-800/80 bg-slate-900/50'
                      : 'border-zinc-300 bg-zinc-200/50'
                    }
                  `}
                  style={{ color: config.color }}
                >
                  {config.symbol}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[9px] font-bold tracking-wider uppercase font-display ${isDark ? 'text-slate-200' : 'text-zinc-800'}`}>
                    {config.label}
                  </span>
                  <span className={`text-[8px] leading-normal ${isDark ? 'text-slate-400' : 'text-zinc-500'}`}>
                    {config.description}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Dynamic Details / National status legends */}
        <div className={`flex flex-col gap-1 border-t pt-2 text-[8px] font-mono leading-tight ${isDark ? 'border-slate-900/60' : 'border-zinc-200'}`}>
          <span className={`uppercase tracking-wider font-semibold font-sans mb-1 ${isDark ? 'text-slate-500' : 'text-zinc-500'}`}>
            Color Identifiers:
          </span>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: MAP_THEME.colors.playerNation }} />
            <span className={isDark ? 'text-slate-300' : 'text-zinc-700'}>PLAYER NATIONALS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: MAP_THEME.colors.targetNation }} />
            <span className={isDark ? 'text-slate-300' : 'text-zinc-700'}>TACTICAL INTRUSION TARGET</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: MAP_THEME.colors.allianceNATO }} />
            <span className={isDark ? 'text-slate-400' : 'text-zinc-650'}>NATO COALITIONS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: MAP_THEME.colors.allianceBRICS }} />
            <span className={isDark ? 'text-slate-400' : 'text-zinc-650'}>BRICS ALLIANCE</span>
          </div>

          {layers.conflicts && (
            <div className={`flex items-center gap-2 mt-1.5 py-0.5 px-1.5 font-semibold font-sans rounded-[1px] border
              ${isDark
                ? 'bg-red-950/20 border-red-900/40 text-red-400'
                : 'bg-red-50 border-red-200 text-red-650'
              }
            `}>
              <span className="animate-pulse">⚔</span>
              <span className="font-sans text-[7.5px] uppercase tracking-wider">ACTIVE COMBAT GEOMETRY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapLegend;
