import React, { useState } from 'react';
import { useCovertFinanceStore } from '../../store/covertFinanceStore';
import { usePlayerStore } from '../../store/playerStore';
import { useCinematicsStore } from '../../store/cinematicsStore';

export default function CovertFinancePanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'SHELLS' | 'LOGISTICS' | 'BLOWBACK'>('SHELLS');
  const store = useCovertFinanceStore();
  const playerStore = usePlayerStore();

  const handleIncorporate = () => {
    store.incorporateShellCompany({
      jurisdiction: 'CAYMAN_ISLANDS',
      purpose: 'PROCUREMENT_FRONT',
      initialCapital: 0.5
    });
  };

  const tabs = [
    { id: 'SHELLS', label: 'SHELL ARCHITECTURE' },
    { id: 'LOGISTICS', label: 'HAWALA & ROUTES' },
    { id: 'BLOWBACK', label: 'RFI & TRACE' }
  ];

  return (
    <div className="absolute top-12 left-1/4 right-1/4 bottom-12 bg-[#020402] border border-purple-900 shadow-2xl flex flex-col z-50 overflow-hidden font-mono text-xs">
      {/* Header */}
      <header className="p-3 border-b border-purple-900 bg-purple-950/20 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-purple-400 font-black tracking-widest text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            COVERT FINANCE & DENIABLE LOGISTICS
          </h2>
          <div className="text-gray-500 mt-1 flex gap-4 text-[10px]">
            <span>COVERT RESERVES: <span className="text-purple-300 font-bold">${store.covertOperationalReserves.toFixed(2)}B</span></span>
            <span>RESERVE GEN/TICK: <span className="text-green-400 font-bold">+${store.reserveGenerationPerTick.toFixed(2)}B</span></span>
            <span>FATF STATUS: <span className={store.fatfWatchlistStatus === 'CLEAN' ? 'text-green-500' : 'text-red-500'}>{store.fatfWatchlistStatus}</span></span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white px-2 py-1 border border-transparent hover:border-gray-500 transition-colors">
          CLOSE COMMAND
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-purple-900/50 bg-black shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 font-bold tracking-wider text-[10px] transition-colors border-r border-purple-900/30
              ${activeTab === t.id ? 'bg-purple-900/20 text-purple-300 border-b-2 border-b-purple-400' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#010201] text-gray-300">
        
        {activeTab === 'SHELLS' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-black/40 p-3 border border-purple-900/30 rounded-sm">
                <div>
                   <h3 className="text-purple-400 font-bold uppercase mb-1">Incorporate Shell Entity</h3>
                   <p className="text-[10px] text-gray-500 max-w-md">Establishes a deniable corporate front for procurement or fund transfers. Capital deducted from covert reserves.</p>
                </div>
                <button 
                  onClick={handleIncorporate} 
                  className="px-4 py-2 border border-purple-500/50 text-purple-400 hover:bg-purple-900/30 font-bold active:bg-purple-900/70 transition-all uppercase"
                >
                  Setup Cayman LLC ($0.5B)
                </button>
            </div>

            <h3 className="text-purple-400 border-b border-purple-900/30 pb-1 mb-3">Active Shell Entities</h3>
            {Object.values(store.shellCompanies).length === 0 && (
                <div className="text-gray-500 italic text-[10px] p-4 text-center border border-dashed border-gray-800">
                    No active shell companies. Network footprint is zero.
                </div>
            )}
            <div className="grid grid-cols-2 gap-3">
               {Object.values(store.shellCompanies).map(c => (
                 <div key={c.id} className="border border-purple-900/20 bg-purple-950/10 p-3 flex flex-col relative text-[10px]">
                    {c.isCompromised && <div className="absolute top-0 left-0 w-full h-full bg-red-900/20 border-2 border-red-500/50 pointer-events-none" />}
                    <div className="flex justify-between mb-2">
                       <span className="font-bold text-gray-200">{c.codename}</span>
                       <span className="bg-gray-900 px-1 border border-gray-700">{c.jurisdiction}</span>
                    </div>
                    <div className="text-gray-500 space-y-1">
                       <div>Purpose: <span className="text-gray-400">{c.purpose}</span></div>
                       <div>Secrecy Score: <span className={`font-bold ${c.secrecyScore > 80 ? 'text-green-500' : c.secrecyScore < 50 ? 'text-red-500' : 'text-yellow-500'}`}>{c.secrecyScore}%</span></div>
                       <div>Trace Accum: <span className={`font-bold ${c.traceAccumulation > 50 ? 'text-red-500' : 'text-green-500'}`}>{c.traceAccumulation}</span> / 100</div>
                       <div>Capital Held: <span className="text-green-400">${c.currentBalance.toFixed(2)}B</span></div>
                       <div>Status: <span className={c.kycStatus === 'CLEAN' ? 'text-green-500' : 'text-red-500 font-bold'}>{c.kycStatus}</span></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-900/30 flex justify-between">
                       <button onClick={() => store.payShellMaintenance(c.id)} className="text-purple-400 hover:text-white uppercase transition-colors">Pay Fees</button>
                       <button onClick={() => store.dissolveShellCompany(c.id)} className="text-red-500 hover:text-red-400 uppercase transition-colors">Dissolve</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'LOGISTICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-purple-400 border-b border-purple-900/30 pb-1 mb-3">Hawala Transfer Nodes</h3>
                    {Object.values(store.hawalaNodes).length === 0 && <div className="text-gray-600 text-[10px] p-2">No active nodes. Use operative assets to establish nodes.</div>}
                    <div className="space-y-2">
                       {Object.values(store.hawalaNodes).map(n => (
                           <div key={n.id} className="border border-purple-900/20 bg-black p-2 text-[10px]">
                               <div className="font-bold text-gray-300">{n.nodeType.replace(/_/g, ' ')} <span className="text-gray-500">[{n.locationCountryId}]</span></div>
                               <div className="grid grid-cols-2 mt-1 text-gray-500">
                                   <div>Trust: <span className={n.trustScore > 70 ? 'text-green-500' : 'text-orange-500'}>{n.trustScore}</span></div>
                                   <div>Capacity: <span className="text-gray-300">${n.capacityPerTick}B/tk</span></div>
                                   <div>Transact: <span className="text-gray-300">{n.transactionCount}</span></div>
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-purple-400 border-b border-purple-900/30 pb-1 mb-3">Deniable Smuggling Routes</h3>
                    {Object.values(store.smuggleRoutes).length === 0 && <div className="text-gray-600 text-[10px] p-2">No active routes. Use operative assets to establish routes.</div>}
                    <div className="space-y-2">
                       {Object.values(store.smuggleRoutes).map(r => (
                           <div key={r.id} className="border border-purple-900/20 bg-black p-2 text-[10px]">
                               <div className="font-bold text-gray-300 flex justify-between">
                                  <span>{r.codename} <span className="text-gray-500">({r.routeType.replace(/_/g, ' ')})</span></span>
                                  {r.activeCargo ? <span className="text-blue-400 animate-pulse">CARGO ACTIVE</span> : <span className="text-gray-600">IDLE</span>}
                               </div>
                               <div className="grid grid-cols-2 mt-1 text-gray-500">
                                   <div className="col-span-2">Path: <span className="text-gray-300">{r.originCountryId} &rarr; {r.destinationCountryId}</span></div>
                                   <div>Risk: <span className={r.detectionRiskPerRun < 20 ? 'text-green-500' : 'text-red-500'}>{r.detectionRiskPerRun}%</span>/run</div>
                                   <div>Cost: <span className="text-gray-300">${r.costPerRun}B</span></div>
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
            </div>
            
            <h3 className="text-purple-400 border-b border-purple-900/30 pb-1 mb-3 mt-6">Active Procurement Orders</h3>
            {Object.values(store.activeProcurementOrders).length === 0 && <div className="text-gray-600 text-[10px] p-2">No active orders from Black Bazaar or covert modules.</div>}
            <div className="space-y-2">
               {Object.values(store.activeProcurementOrders).map(o => (
                   <div key={o.id} className="flex justify-between items-center bg-purple-900/10 border border-purple-900/30 p-2">
                       <div>
                           <span className="font-bold text-gray-200">Procurement Order: {o.contrabandCategory} (Qty: {o.quantity})</span>
                           <div className="text-gray-500 text-[10px]">Value: ${o.totalCost.toFixed(3)}B | Status: <span className="text-yellow-500">{o.status}</span></div>
                       </div>
                   </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'BLOWBACK' && (
          <div className="space-y-6">
             <div className="bg-black/40 p-4 border border-purple-900/30">
                 <h3 className="text-purple-400 font-bold mb-2">Global Trace Level</h3>
                 <div className="w-full bg-gray-900 h-2 rounded overflow-hidden">
                     <div 
                         className={`h-full transition-all ${store.globalTraceLevel > 80 ? 'bg-red-500 animate-pulse' : store.globalTraceLevel > 50 ? 'bg-amber-500' : 'bg-green-500'}`} 
                         style={{ width: `${store.globalTraceLevel}%` }} 
                     />
                 </div>
                 <div className="flex justify-between text-gray-500 mt-1">
                     <span>Safe</span>
                     <span>Monitored</span>
                     <span>Greylisted</span>
                     <span className="text-red-500 font-bold">Blacklisted</span>
                 </div>
             </div>

             <h3 className="text-purple-400 border-b border-purple-900/30 pb-1 mb-3">Active RFI Investigations & Traces</h3>
             {store.fundingTraces.length === 0 && (
                 <div className="text-gray-500 italic text-[10px] p-4 text-center border border-dashed border-gray-800">
                     No active financial investigations tracking player footprint.
                 </div>
             )}
             <div className="space-y-2">
               {(store.fundingTraces || []).map((trace, i) => (
                 <div key={trace.id || i} className="border border-red-900/20 bg-black p-3 relative text-[10px]">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-red-400">TRACE DETECTED: {trace.traceVector.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500">Targeting {trace.targetEntityType}</span>
                    </div>
                    <div className="mb-2">Investigator: <span className="font-bold text-gray-300">{trace.discoveredByEntity}</span></div>
                    <div className="w-full bg-gray-900 h-1.5 rounded overflow-hidden mb-1">
                        <div 
                            className="bg-red-500 h-full" 
                            style={{ width: `${trace.investigationProgressPercent}%` }} 
                        />
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Exposure Limit</span>
                        <span>{Math.floor(trace.investigationProgressPercent)}% / 100% (Publication threshold)</span>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-red-900/20 flex gap-2">
                        <button onClick={() => alert(store.playerCounterTrace(trace.id, 'DISSOLVE_ENTITY').msg)} className="text-[9px] uppercase px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600">Dissolve Entity</button>
                        <button onClick={() => alert(store.playerCounterTrace(trace.id, 'LEGAL_OBSTRUCTION').msg)} className="text-[9px] uppercase px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600">Legal Block (-$0.5B)</button>
                        <button onClick={() => alert(store.playerCounterTrace(trace.id, 'BRIBE_INVESTIGATOR').msg)} className="text-[9px] uppercase px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600">Bribe Investigator</button>
                        <button onClick={() => alert(store.playerCounterTrace(trace.id, 'DESTROY_RECORDS').msg)} className="text-[9px] uppercase px-2 py-1 bg-gray-800 hover:bg-red-900/50 text-gray-300 border border-gray-600">Destroy Records</button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
