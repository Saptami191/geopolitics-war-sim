import React from 'react';

export type MapThemeMode = 'dark' | 'light';

interface MapThemeToggleProps {
  theme: MapThemeMode;
  onToggle: (theme: MapThemeMode) => void;
}

export function MapThemeToggle({ theme, onToggle }: MapThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <div
      id="tactical-theme-selector"
      className={`absolute bottom-16 left-32 z-[110] flex gap-1 px-1.5 py-1.5 border backdrop-blur-md rounded-[1px] select-none transition-colors duration-200
        ${isDark 
          ? 'bg-slate-950/85 border-cyan-950/60' 
          : 'bg-zinc-100/95 border-zinc-300'
        }
      `}
    >
      {(['dark', 'light'] as const).map((t) => {
        const isActive = theme === t;
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={`font-display text-[9px] font-bold tracking-widest px-2.5 py-1 text-center uppercase transition-all duration-150 outline-none rounded-[1px]
              ${isActive
                ? isDark
                  ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                  : 'bg-zinc-200 text-zinc-900 border border-zinc-400/80 shadow-[0_0_6px_rgba(0,0,0,0.1)]'
                : isDark
                  ? 'text-slate-500 border border-transparent hover:text-slate-300'
                  : 'text-zinc-400 border border-transparent hover:text-zinc-600'
              }
            `}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export default MapThemeToggle;
