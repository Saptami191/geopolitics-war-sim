import React, { useState } from 'react';
import { useOversightStore } from '../../store/oversightStore';
import SuppressionModal from '../popups/SuppressionModal';
import ScapegoatModal from '../popups/ScapegoatModal';

export default function OversightPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'CAPITAL' | 'SCANDALS' | 'MEDIA' | 'HEARINGS' | 'BLOWBACK'>('CAPITAL');
  const [suppressScandalId, setSuppressScandalId] = useState<string | null>(null);
  const [scapegoatScandalId, setScapegoatScandalId] = useState<string | null>(null);
  const store = useOversightStore();

  const tabs = [
    { id: 'CAPITAL', label: 'POLITICAL CAPITAL DASHBOARD' },
    { id: 'SCANDALS', label: 'ACTIVE SCANDALS' },
    { id: 'MEDIA', label: 'MEDIA & LEAKS' },
    { id: 'HEARINGS', label: 'HEARINGS & WHISTLEBLOWERS' },
    { id: 'BLOWBACK', label: 'INTERNATIONAL BLOWBACK' }
  ];

  return (
    <div className="absolute top-12 left-1/4 right-1/4 bottom-12 bg-[#020402] border border-orange-900 shadow-2xl flex flex-col z-50 overflow-hidden font-mono text-xs">
      {/* Header */}
      <header className="p-3 border-b border-orange-900 bg-orange-950/20 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-orange-400 font-black tracking-widest text-sm flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
             OVERSIGHT & SCANDAL
          </h2>
          <div className="text-gray-500 mt-1 flex gap-4 text-[10px]">
             <span className={store.politicalCapital.isInCrisisMode ? 'text-red-500 animate-pulse' : 'text-orange-300'}>
                 STATUS: {store.politicalCapital.isInCollapseMode ? 'CONSTITUTIONAL CRISIS' : store.politicalCapital.isInCrisisMode ? 'CRISIS MODE' : 'NOMINAL'}
             </span>
             <span>SCANDALS: <span className="font-bold text-white">{Object.keys(store.activeScandals).length}</span></span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white px-2 py-1 border border-transparent hover:border-gray-500 transition-colors">
          CLOSE COMMAND
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-orange-900/50 bg-black shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 font-bold tracking-wider text-[10px] transition-colors border-r border-orange-900/30
              ${activeTab === t.id ? 'bg-orange-900/20 text-orange-300 border-b-2 border-b-orange-400' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-[#010201] text-gray-300">
         {activeTab === 'CAPITAL' && (
           <div className="space-y-6">
              <div className="grid grid-cols-6 gap-2">
                 {Object.entries(store.politicalCapital.pools).map(([poolName, value]) => {
                     const maximum = store.politicalCapital.poolMaxima[poolName as keyof typeof store.politicalCapital.poolMaxima];
                     const pct = (value / maximum) * 100;
                     const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-amber-500' : 'bg-red-500';
                     return (
                         <div key={poolName} className="flex flex-col items-center bg-black border border-orange-900/30 p-2">
                            <div className="h-32 w-10 bg-gray-900 relative rounded-sm overflow-hidden border border-gray-800">
                               <div className={`absolute bottom-0 w-full ${color} transition-all`} style={{ height: `${pct}%` }} />
                               <div className="absolute w-full h-px bg-white/50" style={{ bottom: `${(maximum/100)*100}%` }} />
                            </div>
                            <span className="text-[9px] mt-2 text-center text-gray-500 leading-tight">
                               {poolName.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-bold mt-1 text-white">{Math.floor(value)} / {maximum}</span>
                         </div>
                     );
                 })}
              </div>
              
              <div className="bg-black/50 p-4 border border-orange-900/40">
                  <h3 className="text-orange-400 font-bold mb-2 text-sm tracking-widest">TOTAL POLITICAL CAPITAL</h3>
                  <div className={`h-6 w-full rounded overflow-hidden relative ${store.politicalCapital.isInCollapseMode ? 'animate-pulse' : ''}`}>
                      <div className="absolute inset-0 bg-gray-900" />
                      <div className={`h-full transition-all ${store.politicalCapital.totalPoliticalCapital > 60 ? 'bg-green-600' : store.politicalCapital.totalPoliticalCapital > 20 ? 'bg-amber-500' : 'bg-red-600'}`} style={{ width: `${store.politicalCapital.totalPoliticalCapital}%` }} />
                  </div>
              </div>
           </div>
         )}
         
         {activeTab === 'SCANDALS' && (
           <div className="space-y-4">
               {Object.values(store.activeScandals).length === 0 && (
                   <div className="text-green-500 italic text-[10px] p-4 text-center border border-dashed border-green-900/50">
                       NO ACTIVE OVERSIGHT EVENTS. OPERATIONAL SECURITY NOMINAL.
                   </div>
               )}
               {Object.values(store.activeScandals).map(scandal => (
                   <div key={scandal.id} className="border border-orange-900/30 bg-black/60 p-4 relative">
                       {scandal.tier === 'TIER_5_HISTORIC' && <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none border border-red-500" />}
                       <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-orange-400 text-sm tracking-widest leading-none">{scandal.codename}</h3>
                           <span className="text-[9px] bg-orange-950 px-2 py-0.5 text-orange-300 font-bold">{scandal.tier.replace(/_/g, ' ')}</span>
                       </div>
                       <blockquote className="text-gray-400 border-l-2 border-orange-500/50 pl-3 italic mb-3">"{scandal.headlineText}"</blockquote>
                       
                       <div className="grid grid-cols-2 gap-4 text-[10px]">
                           <div>
                               <div className="flex justify-between text-gray-500 mb-1"><span>PUBLIC AWARENESS</span><span>{Math.floor(scandal.publicAwarenessPercent)}%</span></div>
                               <div className="h-1.5 w-full bg-gray-800 rounded"><div className="h-full bg-amber-500" style={{ width: `${scandal.publicAwarenessPercent}%` }} /></div>
                           </div>
                           <div>
                               <div className="flex justify-between text-gray-500 mb-1"><span>EVIDENCE STRENGTH</span><span>{Math.floor(scandal.evidenceStrength)}%</span></div>
                               <div className="h-1.5 w-full bg-gray-800 rounded"><div className="h-full bg-red-500" style={{ width: `${scandal.evidenceStrength}%` }} /></div>
                           </div>
                       </div>
                       
                       <div className="mt-4 flex gap-2">
                           <button onClick={() => setSuppressScandalId(scandal.id)} className="px-3 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 font-bold">SUPPRESS</button>
                           <button onClick={() => setScapegoatScandalId(scandal.id)} className="px-3 py-1 bg-red-950/30 hover:bg-red-900/50 border border-red-900 text-red-400 font-bold">SACRIFICE SCAPEGOAT</button>
                       </div>
                   </div>
               ))}
           </div>
         )}

         {activeTab === 'MEDIA' && (
           <div className="grid grid-cols-2 gap-6">
              <div>
                 <h3 className="text-orange-400 border-b border-orange-900/30 pb-1 mb-3 font-bold">MEDIA ECOSYSTEM</h3>
                 <div className="space-y-2">
                     {Object.values(store.mediaOutlets).map(outlet => (
                         <div key={outlet.id} className="border border-gray-800 p-2 bg-black text-[10px]">
                             <div className="flex justify-between mb-1 text-gray-300 font-bold"><span>{outlet.name}</span><span className="text-gray-500 font-normal">{outlet.alignment.replace('DOMESTIC_', '')}</span></div>
                             <div className="flex gap-4 text-gray-500">
                                <span>Investigative: {outlet.investigativeCapacity}</span>
                                <span>Reach: {outlet.reachScore}</span>
                             </div>
                         </div>
                     ))}
                 </div>
              </div>
              <div>
                 <h3 className="text-orange-400 border-b border-orange-900/30 pb-1 mb-3 font-bold">LEAK FEED</h3>
                 <div className="space-y-2">
                     {(store.pendingLeaks || []).map(leak => (
                         <div key={leak.id} className="border border-red-900/50 bg-red-950/10 p-2 text-[10px]">
                            <div className="text-red-400 font-bold">PENDING LEAK: {leak.scandalOrigin.replace(/_/g, ' ')}</div>
                            <div className="text-gray-400 mt-1">Investigating Outlet: {store.mediaOutlets[leak.outletPublishingId]?.name}</div>
                            <div className="text-gray-500 mt-1 flex justify-between items-center">
                               <span>Classification: <span className="text-amber-500">{leak.documentClassificationLevel}</span></span>
                               <button onClick={() => alert(store.suppressLeak(leak.id, 'LEGAL_INJUNCTION').msg)} className="text-[9px] border border-gray-700 bg-gray-800 px-2 py-0.5 hover:bg-gray-700">INJUNCTION</button>
                               <button onClick={() => alert(store.suppressLeak(leak.id, 'BRIBE_OUTLET').msg)} className="text-[9px] border border-gray-700 bg-gray-800 px-2 py-0.5 hover:bg-gray-700">BRIBE</button>
                            </div>
                         </div>
                     ))}
                     {(store.publishedLeaks || []).map(leak => (
                         <div key={leak.id} className="border border-gray-800 p-2 text-[10px] text-gray-500">
                             PUBLISHED: {leak.scandalOrigin} via {store.mediaOutlets[leak.outletPublishingId]?.name}
                         </div>
                     ))}
                 </div>
              </div>
           </div>
         )}

         {(activeTab === 'HEARINGS' || activeTab === 'BLOWBACK') && (
            <div className="text-center text-gray-500 p-8 border border-dashed border-gray-800">
                Data feeds offline. Awaiting further scandal escalation.
            </div>
         )}
      </div>

      {suppressScandalId && <SuppressionModal scandalId={suppressScandalId} onClose={() => setSuppressScandalId(null)} />}
      {scapegoatScandalId && <ScapegoatModal scandalId={scapegoatScandalId} onClose={() => setScapegoatScandalId(null)} />}
    </div>
  );
}
