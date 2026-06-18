import React from 'react';
import { useOversightStore } from '../../store/oversightStore';

export default function PoliticalCapitalBar({ onClick }: { onClick: () => void }) {
  const { politicalCapital } = useOversightStore();
  
  const pct = politicalCapital.totalPoliticalCapital;
  const isCollapse = politicalCapital.isInCollapseMode;
  const isCrisis = politicalCapital.isInCrisisMode;
  
  const color = pct > 60 ? 'bg-green-500 text-green-500' : pct > 30 ? 'bg-amber-500 text-amber-500' : 'bg-red-500 text-red-500';
  const pulse = isCollapse ? 'animate-pulse border-red-500' : isCrisis ? 'border-amber-500' : 'border-gray-800';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 bg-black border cursor-pointer hover:bg-gray-900 transition-colors ${pulse}`}
      title="Political Capital: Represents your domestic and international mandate to govern."
    >
      <span className="text-[9px] font-bold text-gray-400">POL CAP</span>
      <div className="w-24 h-2 bg-gray-900 rounded-sm overflow-hidden flex-shrink-0">
        <div className={`h-full ${color.split(' ')[0]} transition-all`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <span className={`text-[10px] font-mono font-bold w-6 ${color.split(' ')[1]}`}>
        {Math.floor(pct)}
      </span>
    </div>
  );
}
