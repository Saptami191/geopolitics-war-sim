import React, { useState } from 'react';
import SourceRegistryPanel from './SourceRegistryPanel';
import RecruitmentPipelinePanel from './RecruitmentPipelinePanel';
import DoubleAgentConsole from './DoubleAgentConsole';
import DefectorExfiltrationPanel from './DefectorExfiltrationPanel';
import DiscoveryRiskPanel from './DiscoveryRiskPanel';
import HandlerPsychologyPanel from './HandlerPsychologyPanel';

export default function HumintPenetrationSuite({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'PIPELINE' | 'DOUBLE_AGENT' | 'DEFECTOR' | 'DISCOVERY' | 'HANDLER'>('REGISTER');

  const tabs = [
    { id: 'REGISTER' as const, label: 'SOURCE REGISTER' },
    { id: 'PIPELINE' as const, label: 'RECRUIT FUNNEL' },
    { id: 'DOUBLE_AGENT' as const, label: 'DOUBLE AGENTS' },
    { id: 'DEFECTOR' as const, label: 'DEFECTOR TRANSIT' },
    { id: 'DISCOVERY' as const, label: 'FORENSIC ARCH' },
    { id: 'HANDLER' as const, label: 'HANDLER OFFICE' }
  ];

  return (
    <div className="absolute top-12 left-[15%] right-[15%] bottom-12 bg-[#020b0b]/95 border border-[#00ffcc]/30 shadow-[0_0_45px_rgba(0,255,200,0.12)] flex flex-col z-50 overflow-hidden font-mono text-xs p-4 rounded-xl">
      {/* Absolute top decorative overlay line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ffcc] to-transparent" />

      {/* Main Suite Header Grid */}
      <header className="shrink-0 flex justify-between items-center border-b border-cyan-900/60 pb-3.5 mb-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#00ffcc] animate-pulse rounded-full shadow-[0_0_8px_rgba(0,255,200,0.5)]" />
          <div>
            <h1 className="text-xs font-bold tracking-[0.2em] text-[#00ffcc] uppercase select-none">
              SOVEREIGN HUMAN INTELLIGENCE COMMAND // CODE: MIRROR VEIL
            </h1>
            <p className="text-[10px] text-cyan-600 font-bold uppercase mt-0.5 tracking-wider">
              LEVEL 4 SECURE INTERSTICES COVERT HANDLING ENGINE — MODULE 6.3
            </p>
          </div>
        </div>

        {/* Dynamic close and label button */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold tracking-widest text-[#008ba8] bg-[#002b33]/20 px-3 py-1 border border-[#005f73]/50 rounded select-none">
            DECEPTION MATRIX ACTIVE
          </span>
          <button 
            id="btn-close-humint"
            onClick={onClose} 
            className="text-cyan-800 hover:text-[#00ffcc] hover:border-[#00ffcc] px-3 py-1 border border-cyan-900 hover:bg-cyan-950/30 transition-all font-bold tracking-widest text-[9.5px]"
          >
            CLOSE
          </button>
        </div>
      </header>

      {/* Tab Navigation Controls */}
      <nav className="shrink-0 flex gap-1 bg-[#01090a] p-1 border border-cyan-950 rounded mb-4 overflow-x-auto scrollbar-none select-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-2 px-3 text-[10px] font-mono tracking-widest font-extrabold uppercase transition-all duration-150 rounded cursor-pointer min-w-[130px] border
                ${active
                  ? 'bg-gradient-to-r from-cyan-950 to-emerald-990/20 text-[#00ffcc] border-cyan-500/80 shadow-[0_0_12px_rgba(0,255,200,0.1)]'
                  : 'bg-transparent text-cyan-700 hover:text-cyan-400 border-transparent hover:bg-cyan-950/20'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Embedded active viewport */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === 'REGISTER' && <SourceRegistryPanel />}
        {activeTab === 'PIPELINE' && <RecruitmentPipelinePanel />}
        {activeTab === 'DOUBLE_AGENT' && <DoubleAgentConsole />}
        {activeTab === 'DEFECTOR' && <DefectorExfiltrationPanel />}
        {activeTab === 'DISCOVERY' && <DiscoveryRiskPanel />}
        {activeTab === 'HANDLER' && <HandlerPsychologyPanel />}
      </div>
    </div>
  );
}
