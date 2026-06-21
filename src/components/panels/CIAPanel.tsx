import React, { useState } from 'react';
import { useCiaStore } from '../../store/ciaStore';
import { useWorldStore } from '../../store/worldStore';

export default function CIAPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'OPS' | 'OPERATIVES' | 'ASSETS' | 'STATIONS' | 'BLOWBACK' | 'OVERSIGHT'>('OPS');

  const {
      cia_operations, cia_operatives, cia_assets, cia_stations, cia_blowbackEvents, cia_oversight, cia_covertBudget, cia_directorBriefingLog,
      cia_abortOperation, cia_notifyOversight, cia_retractOperative, cia_deployOperative, cia_resolveBlowback, cia_allocateBudget
  } = useCiaStore();

  const currentTick = useWorldStore(s => s.currentTick);
  const countries = useWorldStore((s: any) => Object.values(s.countries));

  const tabs = [
    { id: 'OPS' as const, label: 'OPERATIONS CENTER' },
    { id: 'OPERATIVES' as const, label: 'CLANDESTINE PERSONNEL' },
    { id: 'ASSETS' as const, label: 'HUMAN SOURCES' },
    { id: 'STATIONS' as const, label: 'OVERSEAS STATIONS' },
    { id: 'BLOWBACK' as const, label: 'CONSEQUENCE MANAGEMENT' },
    { id: 'OVERSIGHT' as const, label: 'CONGRESSIONAL OVERSIGHT' }
  ];

  const handleLaunchMock = () => {
    // Basic interaction mock
  };

  return (
    <div className="absolute top-12 left-[15%] right-[15%] bottom-12 bg-[#020302]/95 border border-[#ff3333]/30 shadow-[0_0_45px_rgba(255,50,50,0.12)] flex flex-col z-50 overflow-hidden font-mono text-xs p-4 rounded-xl">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff3333] to-transparent" />

      <header className="shrink-0 flex justify-between items-center border-b border-red-900/60 pb-3.5 mb-4 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#ff3333] animate-pulse rounded-full shadow-[0_0_8px_rgba(255,50,50,0.5)]" />
          <div>
            <h1 className="text-xs font-bold tracking-[0.2em] text-[#ff3333] uppercase select-none">
              CENTRAL INTELLIGENCE AGENCY // CLANDESTINE OPERATIONS
            </h1>
            <p className="text-[10px] text-red-600 font-bold uppercase mt-0.5 tracking-wider">
              CARDINAL SHADOW // HUMINT DOCTRINE FRAMEWORK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-right">
              <span className="text-gray-500 text-[10px] uppercase">COVERT BUDGET</span>
              <span className="text-[#00ffcc] font-bold text-sm select-all">${cia_covertBudget.remaining}M</span>
           </div>
           <button 
             onClick={onClose}
             className="px-4 py-1.5 border border-red-900/50 hover:bg-red-900/20 text-red-500 uppercase font-bold tracking-wider transition-colors select-none"
           >
             CLOSE [ESC]
           </button>
        </div>
      </header>

      <div className="flex gap-1 shrink-0 mb-4 px-1 pb-2 border-b border-[#1a1a1a] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{ flexShrink: 0 }}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 uppercase tracking-wide text-[10px] font-bold transition-all border shrink-0 ${
              activeTab === tab.id
                ? 'bg-red-900/40 text-[#ffaaaa] border-red-500 shadow-[0_0_15px_rgba(255,50,50,0.2)]'
                : 'bg-transparent text-gray-500 border-transparent hover:text-red-400 hover:border-red-900/50 hover:bg-[#111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 relative min-h-0">
         {activeTab === 'OPS' && (
             <div className="grid grid-cols-2 gap-4 h-full">
                 <div className="flex flex-col gap-4 border-r border-[#1a1a1a] pr-4">
                     <h2 className="text-[#ff3333] font-bold tracking-widest text-xs uppercase border-b border-red-900/50 pb-2">ACTIVE OPERATIONS</h2>
                     <div className="space-y-3 overflow-y-auto pr-2">
                         {(cia_operations || []).filter(o => o.status === 'ACTIVE').length === 0 && (
                            <div className="text-xs text-gray-500 opacity-60">NO ACTIVE OPS</div>
                         )}
                         {(cia_operations || []).filter(o => o.status === 'ACTIVE').map(op => (
                             <div key={op.id} className="border border-red-900/50 bg-[#0a0202] p-3 text-[10px] flex flex-col gap-2 relative overflow-hidden group">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2 items-center">
                                       <span className="bg-[#cc2222] text-white px-2 py-0.5 rounded-sm animate-pulse">{op.status}</span>
                                       <span className="text-[#ff5555] font-bold">TOP SECRET // {op.codename}</span>
                                    </div>
                                    <span className="text-gray-400">Target: {op.targetNationId}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                     <span className="text-gray-500">SUCCESS PROBABILITY</span>
                                     <div className="h-1 bg-black w-full border border-gray-800 mt-1"><div className="h-full bg-green-500" style={{width: `${op.successProbability}%`}}/></div>
                                  </div>
                                  <div>
                                     <span className="text-gray-500">DETECTION RISK</span>
                                     <div className="h-1 bg-black w-full border border-gray-800 mt-1"><div className="h-full bg-red-500" style={{width: `${op.detectionRisk}%`}}/></div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-end mt-2 pt-2 border-t border-red-900/30">
                                   <div className="text-gray-500">Duration: {currentTick - op.startTick} / {op.estimatedDurationTicks} ticks</div>
                                   <div className="flex gap-2">
                                     {!op.oversightNotified && <button onClick={() => cia_notifyOversight(op.id)} className="px-2 py-1 bg-yellow-900/30 text-yellow-500 border border-yellow-900/50 hover:bg-yellow-900/50">NOTIFY OVERSIGHT</button>}
                                     <button onClick={() => cia_abortOperation(op.id, currentTick)} className="px-2 py-1 bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-900/50">ABORT</button>
                                   </div>
                                </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 <div className="flex flex-col gap-4 pl-2">
                     <h2 className="text-[#ff3333] font-bold tracking-widest text-xs uppercase border-b border-red-900/50 pb-2">LAUNCH OPERATION</h2>
                     <div className="bg-[#050505] border border-[#222] p-4 text-[10px] space-y-4">
                        <p className="text-gray-500 leading-relaxed max-w-lg mb-4">Operations require target assignment, operatives, and supporting assets. Risk levels are compounded by execution time and target CI status.</p>
                        {/* Placeholder visual form for launch operations */}
                        <button className="px-4 py-2 border border-red-500 bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 w-full mt-4">INITIALIZE PLAN</button>
                     </div>
                     <div className="mt-4">
                        <h2 className="text-[#ff3333] font-bold tracking-widest text-xs uppercase border-b border-red-900/50 pb-2">RECENT OUTCOMES</h2>
                        <div className="space-y-2 mt-3 max-h-[150px] overflow-y-auto text-[10px]">
                            {cia_operations.filter(o => o.status !== 'ACTIVE' && o.status !== 'PLANNING').map(op => (
                               <div key={op.id} className="border border-[#222] bg-[#000] p-2 flex flex-col">
                                   <div className="flex justify-between text-gray-400">
                                      <span>{op.codename}</span>
                                      <span className={op.status === 'SUCCEEDED' ? 'text-green-500' : 'text-red-500'}>{op.status}</span>
                                   </div>
                               </div>
                            ))}
                        </div>
                     </div>
                 </div>
             </div>
         )}
         {activeTab === 'OPERATIVES' && (
             <div className="flex flex-col h-full">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="text-gray-500 border-b border-[#222]">
                            <th className="py-2 pl-2">CODENAME</th><th className="py-2">COVER</th><th className="py-2">NATION</th><th className="py-2">STATUS</th><th className="py-2">HEAT</th><th className="py-2">INTEGRITY</th>
                         </tr>
                     </thead>
                     <tbody>
                         {cia_operatives.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-600">NO OPERATIVES DEPLOYED</td></tr>}
                         {(cia_operatives || []).map(o => (
                             <tr key={o.id} className="border-b border-[#111] hover:bg-[#111]">
                                 <td className="py-3 pl-2 text-[#ffcc00] font-bold">{o.codename}</td>
                                 <td className="py-3 text-gray-400">{o.coverType}</td>
                                 <td className="py-3 text-gray-300">{o.nationId}</td>
                                 <td className="py-3 text-[#00ffcc]">{o.status}</td>
                                 <td className="py-3"><div className="w-20 h-1.5 bg-[#222] border border-black"><div className={`h-full ${o.heatLevel > 70 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} style={{width: `${o.heatLevel}%`}}></div></div></td>
                                 <td className="py-3"><div className="w-20 h-1.5 bg-[#222] border border-black"><div className="h-full bg-blue-500" style={{width: `${o.coverIntegrity}%`}}></div></div></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}
         {activeTab === 'ASSETS' && (
             <div className="flex flex-col h-full">
                 <table className="w-full text-left border-collapse">
                     <thead>
                         <tr className="text-gray-500 border-b border-[#222]">
                            <th className="py-2 pl-2">CODENAME</th><th className="py-2">POSITION</th><th className="py-2">NATION</th><th className="py-2">STATUS</th><th className="py-2">MOTIVATION</th><th className="py-2">RISK</th>
                         </tr>
                     </thead>
                     <tbody>
                         {cia_assets.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-600">NO HUMAN SOURCES RECRUITED</td></tr>}
                         {(cia_assets || []).map(a => (
                             <tr key={a.id} className={`border-b border-[#111] hover:bg-[#111] ${a.status === 'BURNED' ? 'opacity-50 grayscale' : ''} ${a.status === 'DOUBLED' ? 'border-red-900/80 bg-red-900/10' : ''}`}>
                                 <td className="py-3 pl-2 text-[#00aaff] font-bold">{a.codename}</td>
                                 <td className="py-3 text-gray-300 max-w-[200px] truncate">{a.position}</td>
                                 <td className="py-3 text-gray-400">{a.nationId}</td>
                                 <td className="py-3 text-[#ffcc00]">{a.status}</td>
                                 <td className="py-3 text-gray-400">{a.motivation}</td>
                                 <td className="py-3"><div className="w-20 h-1.5 bg-[#222] border border-black"><div className="h-full bg-red-500" style={{width: `${a.compromiseRisk}%`}}></div></div></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}
         {activeTab === 'STATIONS' && (
             <div className="grid grid-cols-3 gap-4">
                 {cia_stations.length === 0 && <div className="text-gray-600 col-span-3 text-center mt-10">NO OVERSEAS STATIONS ESTABLISHED</div>}
                 {(cia_stations || []).map(s => (
                     <div key={s.id} className="border border-[#333] bg-[#0a0a0a] p-3 text-[10px] relative">
                        {s.isCompromised && <div className="absolute top-0 right-0 bg-red-500 text-white px-2 uppercase font-bold animate-pulse">COMPROMISED</div>}
                        <h3 className="text-[#ffcc00] font-bold text-xs">{s.nationId}</h3>
                        <p className="text-gray-500 mt-1">{s.coverOrganisation}</p>
                        <div className="mt-3 flex justify-between">
                            <span className="text-gray-400">Operatives</span>
                            <span className="text-white">{s.currentOperativeCount} / {s.capacity}</span>
                        </div>
                     </div>
                 ))}
             </div>
         )}
         {activeTab === 'BLOWBACK' && (
             <div className="flex flex-col gap-4 h-full">
                 <h2 className="text-[#ff3333] font-bold tracking-widest text-xs uppercase border-b border-red-900/50 pb-2">UNRESOLVED INCIDENTS</h2>
                 <div className="space-y-3 shrink-0">
                     {cia_blowbackEvents.filter(b => !b.isResolved).length === 0 && <div className="text-gray-600">ALL INCIDENTS CONTAINED.</div>}
                     {cia_blowbackEvents.filter(b => !b.isResolved).sort((a,b)=> b.diplomaticDamage - a.diplomaticDamage).map(bb => (
                         <div key={bb.id} className="border border-red-900 bg-[#1a0505] p-4 text-[10px]">
                            <div className="flex gap-3 mb-2">
                               <span className="bg-red-600 text-black px-2 py-0.5 font-bold uppercase">{bb.severity}</span>
                               <span className="text-red-400 font-bold">{bb.nationId} OPERATION COMPROMISED</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed my-2">{bb.description}</p>
                            <div className="grid grid-cols-4 gap-2 mt-4 text-gray-400 border-t border-red-900/30 pt-3">
                                <div>DIPLOMATIC DMG: <span className="text-red-500">-{bb.diplomaticDamage}</span></div>
                                <div>ALLIANCE DMG: <span className="text-orange-500">-{bb.allianceDamage}</span></div>
                                <div>MEDIA EXP: <span className={bb.mediaExposure ? "text-red-500" : "text-gray-500"}>{bb.mediaExposure ? "YES" : "NO"}</span></div>
                                <div>OVERSIGHT: <span className={bb.oversightEscalation ? "text-red-500" : "text-gray-500"}>{bb.oversightEscalation ? "ESCALATED" : "NO"}</span></div>
                            </div>
                            <div className="mt-4 flex gap-2">
                               <button onClick={() => cia_resolveBlowback(bb.id, currentTick)} className="px-3 py-1.5 bg-[#331111] text-red-300 hover:bg-[#551111] border border-[#551111]">ACKNOWLEDGE & RESOLVE</button>
                            </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}
         {activeTab === 'OVERSIGHT' && (
             <div className="grid grid-cols-2 gap-4 h-full">
                 <div className="flex flex-col gap-4 border-r border-[#1a1a1a] pr-4">
                     <h2 className="text-[#aaddee] font-bold tracking-widest text-xs uppercase border-b border-[#224455] pb-2">CONGRESSIONAL RELATIONS</h2>
                     <div className="mt-2 text-[10px] space-y-4">
                         <div className="flex items-center justify-between border-b border-[#112222] pb-3">
                             <div className="text-gray-500 uppercase tracking-widest">Current Status</div>
                             <div className={`px-3 py-1 font-bold ${['CLEAR', 'MONITORING'].includes(cia_oversight.status) ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10 animate-pulse'}`}>{cia_oversight.status}</div>
                         </div>
                         <div>
                            <div className="text-gray-500 uppercase tracking-widest mb-2">Restricted Activities</div>
                            {cia_oversight.restrictedOperationTypes.length === 0 ? <div className="text-gray-600">NONE</div> : 
                                <div className="flex flex-col gap-1">{(cia_oversight.restrictedOperationTypes || []).map(r => <span key={r} className="text-red-400 opacity-80">{r}</span>)}</div>
                            }
                         </div>
                         <div>
                            <div className="text-gray-500 uppercase tracking-widest mb-2">Legal Counsel Notes</div>
                            <p className="text-gray-400 bg-[#050a0a] border border-[#112222] p-3 leading-relaxed">{cia_oversight.legalCounselNotes}</p>
                         </div>
                     </div>
                 </div>
                 <div className="flex flex-col gap-4 pl-2 h-full">
                     <h2 className="text-[#aaddee] font-bold tracking-widest text-xs uppercase border-b border-[#224455] pb-2">DIRECTOR BRIEFING LOG</h2>
                     <div className="flex-1 overflow-y-auto space-y-2 pb-4">
                          {cia_directorBriefingLog.length === 0 && <div className="text-gray-600">NO LOGS AVAILABLE</div>}
                          {(cia_directorBriefingLog || []).map((log, i) => (
                              <div key={i} className="text-[10px] font-mono whitespace-pre-wrap px-2 py-1 bg-[#050505] text-[#7788aa] border-l-2 border-[#224455] mb-1">
                                 {log}
                              </div>
                          ))}
                     </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
}
