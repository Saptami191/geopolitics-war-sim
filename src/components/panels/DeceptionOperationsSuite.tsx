import React, { useState } from 'react';
import DeceptionCampaignPanel from './DeceptionCampaignPanel';
import FalseFlagArchitectPanel from './FalseFlagArchitectPanel';
import AmbiguityControlPanel from './AmbiguityControlPanel';
import CounterDeceptionPanel from './CounterDeceptionPanel';

export default function DeceptionOperationsSuite({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'FALSE_FLAGS' | 'AMBIGUITY' | 'AUDIT'>('CAMPAIGNS');

  const tabs = [
    { id: 'CAMPAIGNS' as const, label: 'DECEPTION CAMPAIGNS' },
    { id: 'FALSE_FLAGS' as const, label: 'FALSE FLAG ARCHITECT' },
    { id: 'AMBIGUITY' as const, label: 'AMBIGUITY CONTROL' },
    { id: 'AUDIT' as const, label: 'COUNTER-DECEPTION AUDIT' }
  ];

  return (
    <div className="absolute top-12 left-[15%] right-[15%] bottom-12 bg-slate-950/95 border border-sky-500/30 shadow-[0_0_45px_rgba(56,189,248,0.12)] flex flex-col z-50 overflow-hidden font-mono text-xs p-4 rounded-xl">
      {/* Absolute top decorative overlay line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

      {/* Main Suite Header Grid */}
      <header className="shrink-0 flex justify-between items-center border-b border-sky-900/60 pb-3.5 mb-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-sky-400 animate-pulse rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
          <div>
            <h1 className="text-xs font-bold tracking-[0.2em] text-sky-300 uppercase select-none">
              SOVEREIGN DECEPTION OPERATIONS CENTER // CODE: MIRROR SHROUD
            </h1>
            <p className="text-[10px] text-sky-500 font-bold uppercase mt-0.5 tracking-wider">
              LEVEL 4 GEO-STRATEGIC DENIAL AND DECEPTION ENGAGEMENT SYSTEM — MODULE 6.4
            </p>
          </div>
        </div>

        {/* Dynamic close and label button */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold tracking-widest text-sky-500 bg-sky-950/20 px-3 py-1 border border-sky-900/40 rounded select-none">
            DENIAL ARCHITECTURE ACTIVE
          </span>
          <button 
            id="btn-close-deception"
            onClick={onClose} 
            className="text-sky-400 hover:text-sky-200 hover:border-sky-300 px-3 py-1 border border-sky-900 hover:bg-sky-950/30 transition-all font-bold tracking-widest text-[9.5px]"
          >
            CLOSE
          </button>
        </div>
      </header>

      {/* Tab Navigation Controls */}
      <nav className="shrink-0 flex gap-1 bg-slate-900/80 p-1 border border-sky-950 rounded mb-4 overflow-x-auto scrollbar-none select-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-2 px-3 text-[10px] font-mono tracking-widest font-extrabold uppercase transition-all duration-150 rounded cursor-pointer min-w-[200px] border
                ${active
                  ? 'bg-gradient-to-r from-sky-950 to-indigo-990/20 text-sky-200 border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.1)]'
                  : 'bg-transparent text-sky-700 hover:text-sky-400 border-transparent hover:bg-sky-950/20'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Embedded active viewport */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'CAMPAIGNS' && <DeceptionCampaignPanel />}
        {activeTab === 'FALSE_FLAGS' && <FalseFlagArchitectPanel />}
        {activeTab === 'AMBIGUITY' && <AmbiguityControlPanel />}
        {activeTab === 'AUDIT' && <CounterDeceptionPanel />}
      </div>
    </div>
  );
}
