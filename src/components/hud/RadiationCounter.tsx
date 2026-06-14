import React from 'react';
import { useNuclearStore } from '../../store/nuclearStore';
import { Radiation } from 'lucide-react';

export const RadiationCounter: React.FC = () => {
  const totalMegatons = useNuclearStore((state) => state.totalMegatons);

  const hasFallout = totalMegatons > 0;

  return (
    <div
      id="radiation-counter-root"
      className={`font-mono text-[9px] flex items-center gap-1.5 px-3 py-1 border rounded transition-all duration-500 select-none ${
        hasFallout
          ? 'bg-[#1a0505]/90 border-[#ff1111]/40 text-[#ff3333] shadow-[0_0_8px_rgba(255,17,17,0.2)] animate-pulse'
          : 'bg-[#020502]/60 border-white/5 text-gray-500'
      }`}
    >
      <Radiation
        id="radiation-icon"
        className={`w-3.5 h-3.5 ${hasFallout ? 'animate-spin text-[#ff2222]' : 'text-gray-600'}`}
        style={{
          animationDuration: hasFallout ? '3s' : '0s'
        }}
      />
      <div className="flex flex-col">
        <span className="text-[7.5px] font-extrabold tracking-widest text-[inherit] opacity-80 uppercase">
          {hasFallout ? '☢ CORRUPTED ATMOSPHERE DETECTED' : '☢ RADIATION LEDGER'}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`font-black tracking-widest text-[10px] ${hasFallout ? 'text-[#ff1111] font-black' : 'text-gray-400'}`}>
            {totalMegatons.toFixed(2)}
          </span>
          <span className="text-[7px] text-gray-600 font-extrabold uppercase">MT DETONATED</span>
        </div>
      </div>
    </div>
  );
};

export default RadiationCounter;
