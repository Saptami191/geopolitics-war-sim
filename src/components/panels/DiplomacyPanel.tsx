import React, { useState } from 'react';
import { useDiplomaticStore, diplo_generateTreatyCodename, diplo_generateCrisisResponseDescription } from '../../store/diplomaticStore';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { PanelFxShell } from '../fx/PanelFxShell';
import { 
  Globe, 
  BookOpen, 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Treaty_Type, Diplo_CapitalType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function DiplomacyPanel() {
  const { 
    diplo_relationships, 
    diplo_treaties, 
    diplo_crises, 
    diplo_unscResolutions,
    diplo_unscMembership,
    diplo_blocs,
    diplo_softPowerProgrammes,
    diplo_ambassadors,
    diplo_capitalPool,
    diplo_directorLog,
    diplo_deployInstrument
  } = useDiplomaticStore();

  const countries = useWorldStore(s => s.countries);
  
  const [activeTab, setActiveTab] = useState<'RELATIONS' | 'TREATIES' | 'UNSC' | 'CRISES' | 'BLOCS' | 'SOFT_POWER' | 'CORPS'>('RELATIONS');
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);

  const renderRelationsTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">BILATERAL RELATIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded p-4 h-[600px] overflow-y-auto">
            <h4 className="text-xs font-mono text-slate-500 mb-4">GLOBAL MATRIX</h4>
            <div className="flex flex-col gap-2">
              {Object.keys(countries).map(countryId => {
                const key = ['US', countryId].sort().join(':');
                const rel = diplo_relationships[key];
                const score = rel ? rel.relationshipScore : 0;
                let bgState = 'bg-slate-700';
                if (score > 30) bgState = 'bg-emerald-600';
                else if (score < -30) bgState = 'bg-red-800';

                return (
                  <button 
                    key={countryId} 
                    onClick={() => setSelectedNationId(countryId)}
                    className={`flex items-center justify-between p-2 rounded border border-slate-800 hover:border-slate-600 transition-colors ${selectedNationId === countryId ? 'ring-1 ring-slate-400' : ''}`}
                  >
                    <span className="font-mono text-sm">{countries[countryId].name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-slate-500">{rel?.posture || 'NEUTRAL'}</span>
                      <div className="w-16 h-2 bg-slate-950 rounded overflow-hidden">
                        <div className={`h-full ${bgState}`} style={{ width: `${Math.min(100, Math.max(0, (score + 100) / 2))}%`}}></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-4">
            {selectedNationId ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">FLAG</div>
                  <div>
                    <h2 className="text-xl font-bold font-serif">{countries[selectedNationId].name}</h2>
                    <span className="text-[10px] uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {diplo_relationships[['US', selectedNationId].sort().join(':')]?.posture || 'NOT ENGAGED'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
                  <span className="font-mono text-slate-500 uppercase text-xs">Net Score</span>
                  <span className="font-bold text-2xl font-mono">
                    {diplo_relationships[['US', selectedNationId].sort().join(':')]?.relationshipScore || 0}
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded p-2">
                   <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Diplomatic Actions</h4>
                   <div className="grid grid-cols-2 gap-2">
                      <button className="bg-slate-800 hover:bg-slate-700 p-2 text-xs font-mono rounded" onClick={() => diplo_deployInstrument('SUMMIT_REQUEST', 'US', selectedNationId, 0, null)}>Request Summit</button>
                      <button className="bg-slate-800 hover:bg-slate-700 p-2 text-xs font-mono rounded text-amber-500" onClick={() => diplo_deployInstrument('FORMAL_PROTEST', 'US', selectedNationId, 0, null)}>Formal Protest</button>
                      <button className="bg-slate-800 hover:bg-slate-700 p-2 text-xs font-mono rounded text-red-400" onClick={() => diplo_deployInstrument('AMBASSADOR_RECALL', 'US', selectedNationId, 0, null)}>Recall Ambassador</button>
                      <button className="bg-slate-800 hover:bg-slate-700 p-2 text-xs font-mono rounded text-red-600" onClick={() => diplo_deployInstrument('AMBASSADOR_EXPULSION', 'US', selectedNationId, 0, null)}>Expel Ambassador</button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs uppercase">
                Select a nation to view relationship detail
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTreatiesTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">TREATY ARCHITECTURE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2">
             {Object.values(diplo_treaties).map(treaty => (
               <div key={treaty.id} className="bg-slate-900 border border-slate-700 p-4 rounded shadow">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <span className="text-[10px] uppercase bg-slate-800 text-slate-300 px-2 py-0.5 mr-2 rounded">{treaty.type}</span>
                     <h4 className="font-serif font-bold text-lg text-slate-200">{treaty.codename}</h4>
                   </div>
                   <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${treaty.status === 'RATIFIED' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-500'}`}>
                     {treaty.status}
                   </span>
                 </div>
                 <div className="text-xs text-slate-400 mt-2 font-mono">
                   Parties: {treaty.partyNationIds.join(', ')}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUNSCTab = () => {
    return (
      <div className="flex flex-col gap-4">
         <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">SECURITY COUNCIL</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded">
               <h4 className="text-xs font-mono text-slate-500 mb-4 uppercase">Chamber Composition</h4>
               <div className="flex flex-col gap-2">
                 <div className="text-[10px] text-amber-500 font-bold uppercase mb-1">P5 PERMANENT MEMBERS</div>
                 {diplo_unscMembership.permanentMembers.map(m => (
                   <div key={m} className="p-2 border border-slate-800 bg-slate-950 font-mono text-xs flex justify-between items-center rounded">
                     {countries[m]?.name || m}
                     <span className="text-[10px] shadow bg-amber-950 text-amber-500 px-1 rounded">VETO</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="flex flex-col gap-4">
               {diplo_unscResolutions.map(res => (
                 <div key={res.id} className="bg-slate-900 border border-slate-800 p-4 rounded">
                    <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-2 rounded mb-2 inline-block">{res.type}</span>
                    <h4 className="font-serif font-bold text-slate-200">{res.codename}</h4>
                    <p className="font-mono text-xs text-slate-500 mt-2">Target: {res.targetNationId}</p>
                    <div className="mt-4 flex gap-2">
                       <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-[10px] uppercase text-slate-300 rounded font-bold">
                         STATUS: {res.status}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    );
  };

  const renderCrisesTab = () => {
     return (
       <div className="flex flex-col gap-4">
          <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">DIPLOMATIC CRISES</h3>
          <div className="grid grid-cols-1 gap-4">
            {diplo_crises.length === 0 ? (
              <div className="text-sm font-mono text-slate-500 p-4 text-center border border-slate-800 rounded bg-slate-900">
                NO ACTIVE CRISES
              </div>
            ) : (
              diplo_crises.map(crisis => (
                 <div key={crisis.id} className="bg-slate-900 border-l-4 border-l-red-500 border-t border-b border-r border-slate-800 p-4 rounded-r">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-serif font-bold text-red-400 text-lg uppercase">{crisis.type.replace(/_/g, ' ')}</h4>
                       <span className="text-xs font-mono bg-red-950 text-red-400 px-2 py-1 rounded">URGENCY: {crisis.urgencyScore}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-4 font-mono">Involving: {crisis.involvedNationIds.join(', ')}</div>
                    
                    {crisis.status === 'ACTIVE' && (
                      <div className="flex flex-col gap-2">
                        {crisis.availableResponses.map(resp => (
                           <div key={resp.id} className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-600 transition-colors rounded flex justify-between items-center">
                              <div>
                                <h5 className="font-xs font-bold font-mono text-slate-300">{resp.instrument}</h5>
                                <p className="text-[10px] text-slate-500 mt-1 max-w-md">{diplo_generateCrisisResponseDescription(resp, crisis)}</p>
                              </div>
                              <button className="bg-slate-800 text-[10px] text-white px-3 py-1 font-mono hover:bg-slate-700 uppercase rounded">Deploy</button>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>
              ))
            )}
          </div>
       </div>
     );
  };

  const renderBlocsTab = () => {
     return (
        <div className="flex flex-col gap-4">
           <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">BLOC DYNAMICS</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.values(diplo_blocs).map(bloc => (
                  <div key={bloc.id} className="bg-slate-900 border border-slate-700 p-4 rounded">
                     <h4 className="font-serif font-bold text-lg mb-2">{bloc.name}</h4>
                     <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-400">{bloc.status}</span>
                        <div className="text-[10px] font-mono text-slate-500">Cohesion: {bloc.cohesionScore}%</div>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {bloc.memberNationIds.map(mid => (
                           <span key={mid} className="px-2 py-1 bg-slate-950 border border-slate-800 text-[10px] rounded">{mid}</span>
                        ))}
                     </div>
                  </div>
               ))}
           </div>
        </div>
     );
  };

  const renderSoftPowerTab = () => {
     return (
        <div className="flex flex-col gap-4">
           <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">SOFT POWER OPERATIONS</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diplo_softPowerProgrammes.map(prog => (
                 <div key={prog.id} className="bg-slate-900 border border-slate-700 p-4 rounded">
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-500 px-2 py-0.5 uppercase mb-2 inline-block rounded">{prog.category.replace(/_/g, ' ')}</span>
                    <h4 className="font-mono text-xs text-slate-300 mb-2">Target: {prog.targetNationId}</h4>
                    <div className="text-[10px] text-slate-500 uppercase flex gap-4">
                       <span>Budget: ${prog.budgetAllocated}M</span>
                       <span>Yield: +{prog.cumulativeEffect} Total</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     );
  };

  const renderCorpsTab = () => {
     return (
        <div className="flex flex-col gap-4">
           <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">AMBASSADOR NETWORK</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diplo_ambassadors.map(amb => (
                 <div key={amb.id} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center">
                    <div>
                      <div className="font-serif font-bold text-slate-200">{amb.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">{amb.specialisation} | POSTED: {amb.assignedNationId}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${amb.status === 'POSTED' ? 'bg-emerald-950 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                      {amb.status}
                    </span>
                 </div>
              ))}
           </div>

           <div className="mt-8">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-500 mb-2">Director Briefing Log</h4>
              <div className="bg-[#050505] p-4 text-[10px] font-mono overflow-y-auto max-h-[300px] border border-[#222]">
                 {diplo_directorLog.map((log, i) => (
                    <div key={i} className="mb-2 text-slate-400 border-b border-slate-900 pb-2">
                       {log}
                    </div>
                 ))}
                 {diplo_directorLog.length === 0 && <span className="text-slate-600">No recent diplomatic dispatches.</span>}
              </div>
           </div>
        </div>
     );
  };

  return (
    <PanelFxShell panelId="diplomacy" relevantFxTypes={[]}>
      <div className="bg-[#0f0f12] h-[800px] flex flex-col font-sans relative overflow-hidden">
         {/* Top nav */}
         <div className="flex bg-[#050505] border-b border-[#222]">
           {[
             { id: 'RELATIONS', label: 'RELATIONS' },
             { id: 'TREATIES', label: 'TREATIES' },
             { id: 'UNSC', label: 'UNSC' },
             { id: 'CRISES', label: 'CRISES' },
             { id: 'BLOCS', label: 'BLOCS' },
             { id: 'SOFT_POWER', label: 'SOFT PWR' },
             { id: 'CORPS', label: 'CORPS' },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-4 py-3 text-xs font-mono font-bold uppercase transition-colors ${
                 activeTab === tab.id 
                   ? 'border-b-2 border-red-800 text-red-100 bg-red-950/20' 
                   : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
               }`}
             >
               {tab.label}
             </button>
           ))}
         </div>

         {/* Capital Pool Strip */}
         <div className="bg-slate-900/50 border-b border-[#222] p-2 flex items-center justify-between font-mono text-[10px] uppercase text-slate-500">
            <span className="font-bold border-r border-[#333] pr-4">Capital Reserves</span>
            <div className="flex gap-6 pr-4">
               <div>POL <span className="text-blue-400">{diplo_capitalPool.political}</span></div>
               <div>ECO <span className="text-emerald-400">{diplo_capitalPool.economic}</span></div>
               <div>MIL <span className="text-red-400">{diplo_capitalPool.military}</span></div>
               <div>INF <span className="text-purple-400">{diplo_capitalPool.informational}</span></div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0f0f12] to-[#0a0a0c]">
            {activeTab === 'RELATIONS' && renderRelationsTab()}
            {activeTab === 'TREATIES' && renderTreatiesTab()}
            {activeTab === 'UNSC' && renderUNSCTab()}
            {activeTab === 'CRISES' && renderCrisesTab()}
            {activeTab === 'BLOCS' && renderBlocsTab()}
            {activeTab === 'SOFT_POWER' && renderSoftPowerTab()}
            {activeTab === 'CORPS' && renderCorpsTab()}
         </div>
      </div>
    </PanelFxShell>
  );
}
