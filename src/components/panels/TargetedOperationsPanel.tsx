import React, { useState } from 'react';
import TargetDossierPanel from './TargetDossierPanel';
import OperationPlannerPanel from './OperationPlannerPanel';
import AttributionTimelinePanel from './AttributionTimelinePanel';
import ConsequenceChainPanel from './ConsequenceChainPanel';

export default function TargetedOperationsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'DOSSIERS' | 'PLANNER' | 'ATTRIBUTION' | 'CONSEQUENCES'>('DOSSIERS');

  const tabs = [
    { id: 'DOSSIERS', label: 'TARGET DOSSIERS' },
    { id: 'PLANNER', label: 'TACTICAL MATRIX PLANNER' },
    { id: 'ATTRIBUTION', label: 'FORENSIC INVESTIGATOR' },
    { id: 'CONSEQUENCES', label: 'FALLOUT CASCADE MONITOR' }
  ];

  return (
    <div className="absolute top-12 left-32 right-32 bottom-12 bg-[#020b0b] border border-cyan-900 shadow-[0_0_45px_rgba(0,255,255,0.15)] flex flex-col z-50 overflow-hidden font-mono text-xs rounded-lg select-none">
      {/* Header */}
      <header className="p-3 border-b border-cyan-900 bg-cyan-950/20 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping" />
          <div>
            <h2 id="lantern-master-title" className="text-cyan-400 font-extrabold tracking-[0.25em] text-sm flex items-center gap-1.5 uppercase">
              BLACK LANTERN // TARGETED OPERATIONS SUITE
            </h2>
            <div className="text-cyan-800 mt-0.5 text-[10px] uppercase font-bold tracking-wider">
              AUTHORIZATION LEVEL: <span className="text-cyan-400">COVERT CHIEF SPECIAL SERVICES</span>
            </div>
          </div>
        </div>
        <button 
          id="btn-disconnect-lantern"
          onClick={onClose} 
          className="text-cyan-800 hover:text-red-400 font-extrabold tracking-widest text-[10px] uppercase px-3 py-1.5 border border-cyan-900 hover:border-red-900 bg-black/40 hover:bg-red-950/20 transition-all active:scale-95 duration-150"
        >
          DISCONNECT SECURE LINK
        </button>
      </header>

      {/* Tabs list bar */}
      <div className="flex border-b border-cyan-900/40 bg-black shrink-0 overflow-x-auto">
        {tabs.map(t => (
          <button
            id={`tab-btn-${t.id.toLowerCase()}`}
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            style={{ flexShrink: 0 }}
            className={`flex-1 py-3 px-4 min-w-[120px] font-extrabold tracking-widest text-[10px] transition-all border-r border-[#003c4a]/30 uppercase
              ${activeTab === t.id 
                ? 'bg-cyan-950/40 text-cyan-400 border-b-2 border-b-cyan-400 shadow-[inset_0_-2px_12px_rgba(0,255,255,0.1)]' 
                : 'text-cyan-950 hover:text-cyan-500 hover:bg-cyan-950/10'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active panel workspace views */}
      <div className="flex-1 overflow-hidden p-4 bg-[#010606] flex flex-col min-h-0">
        {activeTab === 'DOSSIERS' && <TargetDossierPanel />}
        {activeTab === 'PLANNER' && <OperationPlannerPanel />}
        {activeTab === 'ATTRIBUTION' && <AttributionTimelinePanel />}
        {activeTab === 'CONSEQUENCES' && <ConsequenceChainPanel />}
      </div>
    </div>
  );
}
