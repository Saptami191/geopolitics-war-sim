import React from 'react';

interface MapModeToggleProps {
  mode: '2d' | '3d';
  onToggle: (newMode: '2d' | '3d') => void;
}

export function MapModeToggle({ mode, onToggle }: MapModeToggleProps) {
  return (
    <div
      id="tactical-projection-selector"
      className="absolute bottom-16 left-3 z-[120] flex gap-2 bg-[#0a0f10]/92 px-2 py-1.5 border border-[#1e3540] backdrop-blur-md rounded-[1px] select-none"
      style={{
        fontFamily: "'Chakra Petch', monospace",
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
      }}
    >
      <button
        onClick={() => onToggle('2d')}
        className={`font-semibold text-[9px] tracking-widest px-3 py-1 cursor-pointer transition-all duration-200 outline-none rounded-[1px]
          ${mode === '2d'
            ? 'bg-[#111c20] text-[#00e5c8] border border-[#00e5c8] shadow-[0_0_8px_rgba(0,229,200,0.35)]'
            : 'text-[#8aa4ad] border border-transparent hover:text-[#e8f0f2] hover:bg-[#111c20]/50'
          }
        `}
      >
        FLAT MAP
      </button>
      <button
        onClick={() => onToggle('3d')}
        className={`font-semibold text-[9px] tracking-widest px-3 py-1 cursor-pointer transition-all duration-200 outline-none rounded-[1px]
          ${mode === '3d'
            ? 'bg-[#111c20] text-[#00e5c8] border border-[#00e5c8] shadow-[0_0_8px_rgba(0,229,200,0.35)]'
            : 'text-[#8aa4ad] border border-transparent hover:text-[#e8f0f2] hover:bg-[#111c20]/50'
          }
        `}
      >
        3D GLOBE
      </button>
    </div>
  );
}

export default MapModeToggle;
