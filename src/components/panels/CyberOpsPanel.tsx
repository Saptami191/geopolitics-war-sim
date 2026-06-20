import React, { useState } from 'react';
import { useAPTStore } from '../../store/aptStore';
import { useCyberOffenseStore } from '../../store/cyberOffenseStore';
import { useCyberDefenseStore } from '../../store/cyberDefenseStore';
import { useWorldStore } from '../../store/worldStore';
import { 
  ShieldAlert, Activity, Map, Settings, Search, AlertTriangle, 
  Terminal, ServerCrash, Skull, Bug, Network, Shield, Target, Play 
} from 'lucide-react';
import { CyberGroup, InfrastructureSector, KillChainStage } from '../../types';

export const CyberOpsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'APT' | 'INFRA' | 'OFFENSE' | 'HLO' | 'DEFENSE' | 'NORMS' | 'INTEL'>('APT');

  return (
    <div className="absolute inset-x-0 bottom-0 top-[280px] bg-slate-950/95 border-t border-slate-800 text-slate-200 flex flex-col font-mono text-sm overflow-hidden z-40 shadow-2xl shadow-indigo-900/10">
      
      {/* Header & Navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-indigo-500/20 bg-slate-900/80">
         <div className="flex items-center gap-3">
           <Terminal className="text-emerald-500" size={20} />
           <h2 className="text-lg font-bold text-white tracking-widest">CYBER COMMAND CENTER</h2>
         </div>
         
         <div className="flex gap-1 overflow-x-auto">
            <button onClick={() => setActiveTab('APT')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'APT' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <Network size={16} /> APT OPS
            </button>
            <button onClick={() => setActiveTab('INFRA')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'INFRA' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <ServerCrash size={16} /> INFRASTRUCTURE
            </button>
            <button onClick={() => setActiveTab('OFFENSE')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'OFFENSE' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <Bug size={16} /> TOOLKIT
            </button>
            <button onClick={() => setActiveTab('HLO')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'HLO' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <Target size={16} /> HACK & LEAK
            </button>
            <button onClick={() => setActiveTab('DEFENSE')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'DEFENSE' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <ShieldAlert size={16} /> DEFENSE
            </button>
            <button onClick={() => setActiveTab('NORMS')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'NORMS' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <Map size={16} /> NORMS
            </button>
            <button onClick={() => setActiveTab('INTEL')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'INTEL' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
              <Search size={16} /> ATTRIBUTION
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        {activeTab === 'APT' && <APTOpsTab />}
        {activeTab === 'INFRA' && <InfraTab />}
        {activeTab === 'OFFENSE' && <OffenseTab />}
        {activeTab === 'HLO' && <HLOTab />}
        {activeTab === 'DEFENSE' && <DefenseTab />}
        {activeTab === 'NORMS' && <NormsTab />}
        {activeTab === 'INTEL' && <IntelTab />}
      </div>
    </div>
  );
};

const APTOpsTab: React.FC = () => {
    const aptStore = useAPTStore();
    const ops = Object.values(aptStore.killChainOperations);
    const groups = Object.values(aptStore.cyberGroups);

    return (
        <div className="flex gap-6 h-full">
            <div className="w-1/3 border-r border-white/10 pr-6">
                <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><Network size={16} /> CYBER GROUPS</h3>
                <div className="space-y-4">
                    {groups.map(g => (
                        <div key={g.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white">{g.name}</span>
                                <span className="text-xs bg-slate-800 px-2 py-1 rounded">{g.archetype.replace('_', ' ')}</span>
                            </div>
                            <div className="text-xs text-slate-400">Tech Level: {g.techLevel} | Ops: {g.currentOperations.length} | Burn Risk: {Math.round(g.burnProbabilityPerTick * 100)}%</div>
                        </div>
                    ))}
                    {groups.length === 0 && <div className="text-slate-500 italic">No Groups Active</div>}
                </div>
            </div>
            <div className="w-2/3">
                <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2"><Activity size={16} /> ACTIVE OPERATIONS</h3>
                <div className="space-y-4">
                    {ops.map(op => (
                        <div key={op.id} className="p-4 bg-slate-900/80 border border-slate-700 rounded relative overflow-hidden">
                           {op.isDetected && <div className="absolute top-0 right-0 bg-red-600/20 text-red-400 text-xs px-2 py-1 flex items-center gap-1 border-b border-l border-red-500/20"><AlertTriangle size={12}/> DETECTED</div>}
                           <div className="font-bold text-white mb-1">OP: {op.id} <span className="text-slate-400 font-normal">→ {op.targetCountryId} ({op.targetSector})</span></div>
                           <div className="text-xs text-slate-300 mb-3">Obj: {op.objectiveType.replace(/_/g, ' ')} | Dwell: {op.dwellTicksAccumulated} ticks</div>
                           
                           {/* Kill Chain Visualizer */}
                           <div className="flex justify-between items-center text-[10px] mt-4 relative">
                               <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-800 -z-10" />
                               {['RECON', 'WEAPON', 'DELIVER', 'EXPLOIT', 'INSTALL', 'C2', 'ACTION'].map((stage, i) => {
                                   const isPast = op.stagesCompleted.length > i;
                                   const isCurrent = ['RECONNAISSANCE','WEAPONIZATION','DELIVERY','EXPLOITATION','INSTALLATION','COMMAND_AND_CONTROL','ACTIONS_ON_OBJECTIVES'].indexOf(op.currentStage) === i;
                                   return (
                                       <div key={stage} className={`flex flex-col items-center gap-1 ${isPast ? 'text-emerald-500' : isCurrent ? 'text-amber-500 font-bold' : 'text-slate-500'}`}>
                                           <div className={`w-3 h-3 rounded-full border border-current ${isPast ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-900'}`} />
                                           <span>{stage}</span>
                                       </div>
                                   )
                               })}
                           </div>
                           <div className="mt-4 flex gap-2">
                             <button className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded text-xs transition-colors" onClick={() => aptStore.abortOperation(op.id)}>ABORT</button>
                             {op.currentStage !== 'ACTIONS_ON_OBJECTIVES' && <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs transition-colors" onClick={() => aptStore.advanceKillChain(op.id)}>FORCE ADVANCE</button>}
                           </div>
                        </div>
                    ))}
                    {ops.length === 0 && <div className="text-slate-500 italic p-6 text-center border border-dashed border-slate-800">No active operations.</div>}
                </div>
            </div>
        </div>
    );
};

const InfraTab: React.FC = () => {
    return <div className="text-center text-slate-500 p-10"><ServerCrash size={48} className="mx-auto mb-4 opacity-50" />Infrastructure Grid View Initializing...</div>;
};
const OffenseTab: React.FC = () => {
    return <div className="text-center text-slate-500 p-10"><Bug size={48} className="mx-auto mb-4 opacity-50" />Offensive Toolkit Market Initializing...</div>;
};
const HLOTab: React.FC = () => {
    return <div className="text-center text-slate-500 p-10"><Target size={48} className="mx-auto mb-4 opacity-50" />Hack-and-Leak Organizer Initializing...</div>;
};
const DefenseTab: React.FC = () => {
    return <div className="text-center text-slate-500 p-10"><ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />Defense Posture Initializing...</div>;
};
const NormsTab: React.FC = () => {
    return <div className="text-center text-slate-500 p-10"><Map size={48} className="mx-auto mb-4 opacity-50" />Cyber Norms Treaties Initializing...</div>;
};
const IntelTab: React.FC = () => {
    return <div className="text-center text-slate-500 p-10"><Search size={48} className="mx-auto mb-4 opacity-50" />Attribution Investigations Initializing...</div>;
};
