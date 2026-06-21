import React from 'react';
import { useCiaStore } from '../../store/ciaStore';
import { useUIStore } from '../../store/uiStore';

export default function CIAStatusWidget() {
  const { cia_operations, cia_blowbackEvents, cia_oversight, cia_operatives } = useCiaStore();
  const setActivePanelId = useUIStore(s => s.setActivePanelId);
  const activeOps = cia_operations.filter(o => o.status === 'ACTIVE').length;
  const highHeatOps = cia_operatives.filter(o => o.status === 'ACTIVE' && o.heatLevel >= 80).length;
  const unresolvedBlowback = cia_blowbackEvents.filter(b => !b.isResolved);
  
  const hasExposedIncident = unresolvedBlowback.some(b => b.severity === 'EXPOSED' || b.severity === 'CATASTROPHIC');
  const hasOversightIssue = ['INQUIRY', 'RESTRICTED', 'SUSPENDED'].includes(cia_oversight.status);

  return (
    <div style={{ minHeight: '80px', position: 'relative' }}>
      <div 
        onClick={() => setActivePanelId('cia')}
        className="pointer-events-auto cursor-pointer bg-black/60 backdrop-blur-sm border border-red-900/40 p-2 text-[10px] font-mono flex flex-col items-end gap-1 hover:bg-black/80 hover:border-red-500/50 transition-colors w-48 shadow-[0_0_15px_rgba(255,20,20,0.1)] group relative h-full"
      >
        <div className="absolute top-0 right-0 w-8 h-[1px] bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
          <span className="text-red-500 font-bold uppercase tracking-widest text-[9px] select-none">CARDINAL SHADOW</span>
        </div>
        
        <div className="flex justify-between w-full text-gray-500">
          <span>ACTIVE OPS:</span>
          <span className="text-gray-300 font-bold">{activeOps}</span>
        </div>

        <div className="flex justify-between w-full text-gray-500">
          <span>FIELD HEAT:</span>
          <span className={highHeatOps > 0 ? "text-red-400 font-bold animate-pulse" : "text-gray-300"}>
            {highHeatOps > 0 ? `${highHeatOps} CRITICAL` : 'NOMINAL'}
          </span>
        </div>

        <div className="flex justify-between w-full text-gray-500 mt-1 border-t border-red-900/30 pt-1">
          <div className="flex items-center gap-1">
             {unresolvedBlowback.length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${hasExposedIncident ? 'bg-red-500 hover:animate-ping' : 'bg-orange-500'}`} title="Incident unresolved" />}
             {hasOversightIssue && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" title="Oversight investigation" />}
          </div>
          <span className="text-gray-400 text-[8px] uppercase">{cia_oversight.status}</span>
        </div>
      </div>
    </div>
  );
}
