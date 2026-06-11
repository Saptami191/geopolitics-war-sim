import React from 'react';

export function MapModeToggle({ mode, onToggle }: { mode: '2d' | '3d'; onToggle: (m: '2d' | '3d') => void }) {
  return (
    <div 
      id="tactical-projection-selector"
      className="absolute bottom-16 left-3 z-[110] flex gap-1 bg-slate-950/85 px-1.5 py-1.5 border border-cyan-950/60 backdrop-blur-md rounded-[1px] select-none"
    >
      {(['2d', '3d'] as const).map(m => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            onClick={() => onToggle(m)}
            className={`font-display text-[9px] font-bold tracking-widest px-2.5 py-1 text-center uppercase transition-all duration-150 outline-none rounded-[1px]
              ${isActive 
                ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.3)]' 
                : 'text-slate-500 border border-transparent hover:text-slate-300'
              }
            `}
          >
            {m === '2d' ? 'ORBITAL 2D' : 'PROJECTION 3D'}
          </button>
        );
      })}
    </div>
  );
}
