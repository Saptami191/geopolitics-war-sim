import React, { useState } from 'react';
import { useSigintStore } from '../../store/sigintStore';
import { CollectionBudgetChannel, SigintCollectionDomain, CadenceAnomalyType } from '../../types';

export default function SigintPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'BUDGET' | 'TARGETS' | 'POL' | 'ALERTS' | 'FUSION'>('BUDGET');
  const store = useSigintStore();

  const tabs = [
    { id: 'BUDGET', label: 'COLLECTION BUDGET' },
    { id: 'TARGETS', label: 'ACTIVE TARGETS' },
    { id: 'POL', label: 'PATTERN OF LIFE' },
    { id: 'ALERTS', label: 'ANOMALY ALERTS' },
    { id: 'FUSION', label: 'FUSION / VISIBILITY' }
  ];

  return (
    <div className="absolute top-12 left-64 right-64 bottom-12 bg-[#020b0b] border border-cyan-900 shadow-[0_0_40px_rgba(0,255,255,0.1)] flex flex-col z-50 overflow-hidden font-mono text-xs">
      {/* Header */}
      <header className="p-3 border-b border-cyan-900 bg-cyan-950/20 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-cyan-400 font-extrabold tracking-[0.2em] text-sm flex items-center gap-2">
             <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             ECHO GRID // UNIT 8200
          </h2>
          <div className="text-cyan-800 mt-1 flex gap-4 text-[10px] uppercase font-bold tracking-widest">
             <span>TOTAL BUDGET: <span className="text-cyan-400">${store.totalCollectionBudget}B</span></span>
             <span>ACTIVE TARGETS: <span className="text-cyan-400">{Object.keys(store.targets).length}</span></span>
             <span>UNREAD ALERTS: <span className="text-amber-500">{store.alerts.filter(a => !a.isAcknowledged).length}</span></span>
          </div>
        </div>
        <button onClick={onClose} className="text-cyan-800 hover:text-cyan-400 px-3 py-1 border border-cyan-900 hover:bg-cyan-950/30 transition-all font-bold tracking-widest">
          DISCONNECT
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-cyan-900/40 bg-black shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 font-bold tracking-widest text-[10px] transition-all border-r border-cyan-900/30
              ${activeTab === t.id ? 'bg-cyan-950/30 text-cyan-400 border-b-2 border-b-cyan-400 shadow-[inset_0_-2px_10px_rgba(0,255,255,0.1)]' : 'text-cyan-900 hover:text-cyan-600 hover:bg-cyan-950/10'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-[#010606] text-gray-400">
         
         {/* TAB: BUDGET */}
         {activeTab === 'BUDGET' && (
           <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-cyan-900/30 pb-2">
                 <h3 className="text-cyan-600 font-bold tracking-widest">COLLECTION SPECTRUM ALLOCATION</h3>
                 <span className="text-[10px] text-cyan-800">UNALLOCATED: ${store.totalCollectionBudget - Object.values(store.collectionBudgetByChannel).reduce((a,b)=>a+b,0)}B</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {Object.keys(store.collectionBudgetByChannel).map((ch) => {
                     const channel = ch as CollectionBudgetChannel;
                     const amt = store.collectionBudgetByChannel[channel];
                     return (
                         <div key={channel} className="bg-black border border-cyan-900/30 p-3 hover:border-cyan-800 transition-colors">
                             <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-wider text-cyan-500">
                                 <span>{channel.replace('_', ' ')}</span>
                                 <span className="text-cyan-300">${amt}B</span>
                             </div>
                             <input 
                                type="range" min="0" max={store.totalCollectionBudget} value={amt}
                                onChange={(e) => store.allocateCollectionBudget(channel, parseInt(e.target.value))}
                                className="w-full accent-cyan-600 cursor-pointer"
                             />
                             <div className="flex justify-between text-[8px] text-cyan-900 mt-1">
                                <span>MIN</span><span>MAX</span>
                             </div>
                         </div>
                     );
                 })}
              </div>
           </div>
         )}

         {/* TAB: TARGETS */}
         {activeTab === 'TARGETS' && (
            <div className="space-y-3">
                {Object.values(store.targets).map(tgt => (
                    <div key={tgt.id} className={`border p-3 grid grid-cols-12 gap-4 items-center ${tgt.visibilityTier === 'CONFIRMED' ? 'border-cyan-700 bg-cyan-950/10' : tgt.visibilityTier === 'INFERRED' ? 'border-cyan-900/50 bg-black' : 'border-gray-900 bg-black/50 text-gray-600'}`}>
                        <div className="col-span-3">
                           <div className="text-[9px] uppercase tracking-wider text-cyan-800">{tgt.targetType}</div>
                           <div className={`font-bold ${tgt.visibilityTier !== 'HIDDEN' ? 'text-cyan-400' : 'text-gray-500'}`}>{tgt.name}</div>
                        </div>
                        <div className="col-span-2">
                           <div className="text-[9px] text-cyan-800 tracking-wider">VISIBILITY</div>
                           <div className={`text-[10px] font-bold ${tgt.visibilityTier === 'CONFIRMED' ? 'text-green-500' : tgt.visibilityTier === 'INFERRED' ? 'text-amber-500' : 'text-gray-600'}`}>{tgt.visibilityTier}</div>
                        </div>
                        <div className="col-span-3">
                           <div className="flex justify-between text-[9px] text-cyan-800 mb-1"><span>CONFIDENCE</span><span>{Math.floor(tgt.analystConfidence)}%</span></div>
                           <div className="h-1.5 w-full bg-gray-900 rounded overflow-hidden">
                              <div className={`h-full ${tgt.analystConfidence > 70 ? 'bg-cyan-500' : tgt.analystConfidence > 30 ? 'bg-cyan-700' : 'bg-gray-700'}`} style={{width: `${tgt.analystConfidence}%`}} />
                           </div>
                        </div>
                        <div className="col-span-3 text-[9px] text-cyan-700 leading-tight">
                           CHANNELS: {tgt.discoveredThrough.length > 0 ? tgt.discoveredThrough.join(', ') : 'NONE'}
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <button className={`px-2 py-1 border text-[9px] font-bold ${tgt.isActionable ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-900/50' : 'border-gray-800 text-gray-700 cursor-not-allowed'}`}>
                               FUSE
                           </button>
                        </div>
                    </div>
                ))}
            </div>
         )}

         {/* TAB: PATTERN OF LIFE */}
         {activeTab === 'POL' && (
            <div className="grid grid-cols-2 gap-4">
               {Object.values(store.polProfiles).map(pol => {
                  const target = store.targets[pol.targetId];
                  if (!target) return null;
                  return (
                      <div key={pol.targetId} className="border border-cyan-900/40 bg-[#010808] p-4">
                         <div className="flex justify-between items-start border-b border-cyan-900/30 pb-2 mb-3">
                            <span className="font-bold text-cyan-400">{target.name}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${pol.state === 'STABLE' ? 'bg-cyan-900/50 text-cyan-300' : pol.state === 'ANOMALOUS' ? 'bg-amber-900/50 text-amber-500' : pol.state === 'SPOOFED' ? 'bg-red-900/50 text-red-500' : 'bg-gray-900 text-gray-500'}`}>
                               {pol.state}
                            </span>
                         </div>
                         <div className="flex justify-between items-end mb-4">
                            <div className="text-[10px]">
                               <span className="text-cyan-800 block mb-1">CADENCE BASELINE</span>
                               <span className="text-cyan-500 font-bold">{Math.floor(pol.baselineCadenceWindow[0])} - {Math.floor(pol.baselineCadenceWindow[1])} TICKS</span>
                            </div>
                            <div className="text-[10px] text-right">
                               <span className="text-cyan-800 block mb-1">LAST SIGNAL</span>
                               <span className={`font-bold ${pol.timeSinceLastNormalSignal > pol.baselineCadenceWindow[1] ? 'text-amber-500' : 'text-cyan-600'}`}>{pol.timeSinceLastNormalSignal} TICKS AGO</span>
                            </div>
                         </div>
                         {/* Sparkline approximation */}
                         <div className="flex items-end gap-1 h-8 mt-2 opacity-60">
                             {pol.cadenceHistory.slice(-20).map((h, i) => (
                                 <div key={i} className={`w-full bg-cyan-700 ${h > pol.baselineCadenceWindow[1] ? 'bg-amber-500' : ''}`} style={{ height: `${Math.min(100, (h / pol.baselineCadenceWindow[1]) * 50)}%` }} />
                             ))}
                          </div>
                      </div>
                  )
               })}
            </div>
         )}

         {/* TAB: ALERTS */}
         {activeTab === 'ALERTS' && (
            <div className="space-y-2">
                {store.alerts.length === 0 && <div className="text-center text-cyan-900 p-8">NO ANOMALIES DETECTED</div>}
                {(store.alerts || []).map(a => (
                    <div key={a.id} className={`border p-3 flex justify-between items-center bg-black ${!a.isAcknowledged ? (a.severity === 'CRITICAL' ? 'border-red-500 bg-red-950/10' : a.severity === 'HIGH' ? 'border-amber-500 bg-amber-950/10' : 'border-cyan-500') : 'border-cyan-900/30 opacity-50'}`}>
                       <div>
                          <div className={`text-[9px] font-bold mb-1 ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'text-amber-500' : 'text-cyan-500'}`}>
                             [ TICK {a.tickTriggered} ] {a.severity} SEVERITY
                          </div>
                          <div className="text-gray-300 font-bold">{a.description}</div>
                          <div className="text-cyan-700 mt-1 text-[10px]">TARGET: {store.targets[a.targetId]?.name || a.targetId}</div>
                       </div>
                       {!a.isAcknowledged && (
                           <button onClick={() => store.acknowledgeAlert(a.id)} className="px-3 py-1 border border-cyan-800 text-cyan-500 hover:bg-cyan-900/30 font-bold">ACKNOWLEDGE</button>
                       )}
                    </div>
                ))}
            </div>
         )}
         
         {/* TAB: FUSION */}
         {activeTab === 'FUSION' && (
            <div className="p-4 border border-cyan-900/30 bg-black text-center text-cyan-800 font-bold tracking-widest mt-8">
               AWAITING INTELLIGENCE PROMOTION PROTOCOL.<br/>CONFIRMED VISIBILITY TIERS WILL APPEAR HERE FOR MULTI-MODULE DISSEMINATION.
            </div>
         )}
         
      </div>
    </div>
  );
}
