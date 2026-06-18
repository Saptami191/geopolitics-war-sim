import React, { useState } from 'react';
import useCounterProliferationStore from '../../store/counterProliferationStore';
import ProliferationNetworkPanel from './ProliferationNetworkPanel';
import VerificationThresholdPanel from './VerificationThresholdPanel';
import InterdictionPlannerPanel from './InterdictionPlannerPanel';
import LegalBlowbackPanel from './LegalBlowbackPanel';
import { Layers, Gavel, Radio, Compass, ShieldAlert, Award, FileText } from 'lucide-react';

export default function CounterProliferationSuite({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'NETWORK' | 'VERIFICATION' | 'PLANNER' | 'BLOWBACK'>('NETWORK');
  const { logs, networks, selectedNetworkId, selectNetwork } = useCounterProliferationStore();

  const tabs = [
    { id: 'NETWORK' as const, label: 'WMD NETWORK TRACKER', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'VERIFICATION' as const, label: 'VERIFICATION TIERS', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'PLANNER' as const, label: 'INTERDICTION PLANNER', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'BLOWBACK' as const, label: 'LEGAL BLOWBACK', icon: <Gavel className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="absolute top-12 left-[12%] right-[12%] bottom-12 bg-slate-950/95 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.08)] flex flex-col z-50 overflow-hidden font-mono text-xs p-4 rounded-xl">
      {/* Top decorative overlay glow line (Module specific: Red color for WMD & interdiction focus) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

      {/* Main Suite Header Grid */}
      <header className="shrink-0 flex justify-between items-center border-b border-slate-900 pb-3.5 mb-4 font-mono select-none">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-red-500 animate-pulse rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
          <div>
            <h1 className="text-xs font-bold tracking-[0.25em] text-red-400 uppercase leading-none">
              COUNTER-PROLIFERATION COMMAND SUITE // CODE: IRON VEIL
            </h1>
            <p className="text-[9.5px] text-slate-500 font-extrabold uppercase mt-1.5 tracking-wider">
              JOINT THEATRE WMD TRACKING, INTERDICTION, AND MARITIME EMBARGO CONTROL SECTOR — MODULE 6.5
            </p>
          </div>
        </div>

        {/* Action closures and target dropdown */}
        <div className="flex items-center gap-3">
          {/* Target Network selector */}
          <select 
            value={selectedNetworkId || ''} 
            onChange={(e) => selectNetwork(e.target.value || null)}
            className="bg-slate-900/80 border border-slate-800 text-[9.5px] font-bold text-slate-300 px-2 py-1 rounded cursor-pointer uppercase focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {Object.values(networks).map((net) => (
              <option key={net.networkId} value={net.networkId}>
                {net.label}
              </option>
            ))}
          </select>

          <span className="text-[9px] font-black tracking-widest text-[#00ffcc] bg-emerald-950/20 px-3 py-1 border border-emerald-900/30 rounded">
            CYBER-SIGINT LINKED
          </span>
          <button 
            id="btn-close-proliferation"
            onClick={onClose} 
            className="text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 hover:bg-red-950/20 px-3.5 py-1 text-[9.5px] font-black tracking-widest transition-all cursor-pointer"
          >
            DISCONNECT
          </button>
        </div>
      </header>

      {/* Tab Navigation Controls */}
      <nav className="shrink-0 flex gap-1 bg-slate-900/70 p-1 border border-slate-900 rounded mb-4 select-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-mono tracking-widest font-black uppercase transition-all duration-150 rounded cursor-pointer border
                ${active
                  ? 'border-red-500/30 bg-red-950/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/40'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Primary Tab Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col mb-4">
        {activeTab === 'NETWORK' && <ProliferationNetworkPanel />}
        {activeTab === 'VERIFICATION' && <VerificationThresholdPanel />}
        {activeTab === 'PLANNER' && <InterdictionPlannerPanel />}
        {activeTab === 'BLOWBACK' && <LegalBlowbackPanel />}
      </div>

      {/* Tactical Store Event Logs footer ticker - keeps it ultra realistic & engaging */}
      <footer className="shrink-0 border-t border-slate-900 pt-3 flex items-center gap-2 select-none h-10">
        <div className="flex items-center gap-1.5 text-slate-500 font-extrabold uppercase text-[9px] shrink-0">
          <Award className="w-3.5 h-3.5 text-slate-500" />
          CP LOGS TICKER:
        </div>
        <div className="flex-1 bg-slate-900/30 border border-slate-950 px-3 py-1 rounded text-[9.5px] text-slate-400 truncate font-mono">
          {logs[0] || 'No immediate cyber-sigint intercepts.'}
        </div>
      </footer>
    </div>
  );
}
