import React, { useState } from 'react';
import { useDefenseIndustryStore } from '../../store/defenseIndustryStore';
import { useWorldStore } from '../../store/worldStore';
import { 
  Factory, Microscope, Cog, ArrowRightLeft, ShieldAlert, Cpu, AlertTriangle, 
  Activity, Play, Pause, Zap, CheckCircle2, Shield, Map 
} from 'lucide-react';
import { IndustrialSector, MobilizationLevel, ProductionItemType } from '../../types';

export default function DefenseIndustryPanel() {
  const [activeTab, setActiveTab] = useState<'QUEUES' | 'RD' | 'BASE' | 'SUPPLY' | 'EXPORT' | 'INTEL'>('QUEUES');
  const store = useDefenseIndustryStore();
  const currentTick = useWorldStore(s => s.currentTick);
  
  const [selectedCountryId, setSelectedCountryId] = useState('US');

  const queues = store.productionQueues[selectedCountryId]?.items || [];
  const research = Object.values(store.researchProjects).filter(p => p.countryId === selectedCountryId);
  const capacity = store.industrialCapacity[selectedCountryId] || [];
  const components = Object.values(store.strategicComponents);
  const exportContracts = Object.values(store.exportContracts);
  const intel = store.procurementIntel;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 font-mono text-sm relative">
      <div className="flex bg-slate-950 p-2 border-b border-slate-800 gap-2 shrink-0 overflow-x-auto">
        <button onClick={() => setActiveTab('QUEUES')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'QUEUES' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          <Factory size={16} /> QUEUES
        </button>
        <button onClick={() => setActiveTab('RD')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'RD' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          <Microscope size={16} /> R&D PIPELINE
        </button>
        <button onClick={() => setActiveTab('BASE')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'BASE' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          <Cog size={16} /> INDUSTRIAL BASE
        </button>
        <button onClick={() => setActiveTab('SUPPLY')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'SUPPLY' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          <Cpu size={16} /> SUPPLY CHAIN
        </button>
        <button onClick={() => setActiveTab('EXPORT')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'EXPORT' ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          <ArrowRightLeft size={16} /> EXPORT CONTROL
        </button>
        <button onClick={() => setActiveTab('INTEL')} className={`px-4 py-2 shrink-0 flex items-center gap-2 ${activeTab === 'INTEL' ? 'bg-rose-900 text-rose-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
          <ShieldAlert size={16} /> PROC INTEL
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'QUEUES' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-2">
              <div>
                <h3 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                  <Factory className="text-slate-500" />
                  ACTIVE PRODUCTION QUEUES
                </h3>
                <p className="text-slate-400 mt-1">Munitions, platforms, and component manufacturing operations.</p>
              </div>
              <select className="bg-slate-800 border border-slate-700 text-white p-1 rounded" value={selectedCountryId} onChange={e => setSelectedCountryId(e.target.value)}>
                <option value="US">UNITED STATES</option>
                <option value="CN">PEOPLE'S REPUBLIC OF CHINA</option>
                <option value="RU">RUSSIAN FEDERATION</option>
              </select>
            </div>

            {queues.length === 0 ? (
              <div className="border border-white/10 bg-slate-800/30 p-8 text-center text-slate-500 rounded">
                NO ACTIVE PRODUCTION
              </div>
            ) : (
              <div className="space-y-2">
                {(queues || []).map(q => (
                  <div key={q.id} className={`border p-3 rounded ${q.isBlocked ? 'bg-rose-900/20 border-rose-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-white tracking-wider flex items-center gap-2">
                        {q.name}
                        {q.isBlocked && <AlertTriangle size={14} className="text-rose-400" />}
                      </div>
                      <div className={`px-2 py-0.5 text-xs font-bold rounded ${q.priority === 'EMERGENCY' ? 'bg-rose-500 text-white' : q.priority === 'HIGH' ? 'bg-amber-500 text-black' : 'bg-slate-600 text-white'}`}>
                        {q.priority}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>QTY: {q.quantityCompleted} / {q.quantity}</span>
                      <span>{q.sector.replace('_', ' ')}</span>
                      <span>TICKS/UNIT: {q.productionTicksPerUnit}</span>
                    </div>
                    
                    <div className="h-1.5 bg-slate-900 overflow-hidden relative rounded">
                       <div className={`absolute top-0 left-0 bottom-0 ${q.isBlocked ? 'bg-rose-500/50' : 'bg-indigo-500'}`} 
                            style={{ width: `${(q.ticksRemainingCurrentUnit / q.productionTicksPerUnit) * 100}%` }} />
                    </div>

                    {q.isBlocked && (
                      <div className="mt-2 text-xs text-rose-400">
                        {q.blockReasons.join(' | ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <button className="w-full py-3 bg-slate-800 text-slate-300 font-bold tracking-widest border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
              + ALLOCATE NEW PRODUCTION
            </button>
          </div>
        )}

        {activeTab === 'RD' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                <Microscope className="text-indigo-400" />
                R&D PIPELINE
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
               {(research || []).map(r => (
                  <div key={r.id} className="border border-slate-700 bg-slate-800 p-3 rounded relative overflow-hidden">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <div className="text-white font-bold">{r.isClassified ? '█'.repeat(r.name.length) : r.name}</div>
                         <div className="text-xs text-slate-400">{r.category.replace('_', ' ')} | GEN {r.targetGeneration}</div>
                       </div>
                       <div className="flex gap-2">
                         {r.status === 'ACTIVE' && <button className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"><Pause size={14} /></button>}
                         {r.status === 'PAUSED' && <button className="p-1 bg-indigo-900/50 hover:bg-indigo-800 rounded text-indigo-300 border border-indigo-500/30"><Play size={14} /></button>}
                       </div>
                     </div>
                     
                     <div className="text-xs text-slate-500 mb-2">
                        FUNDING: {r.fundingPerTick}B/TICK | EST. {r.estimatedTicksRemaining} TICKS REMAINING
                     </div>

                     <div className="h-2 bg-slate-900 rounded mb-1 relative overflow-hidden">
                       <div className="absolute top-0 bottom-0 left-0 bg-indigo-500" style={{ width: `${r.progressPercent}%` }} />
                     </div>
                     
                     {r.status === 'STOLEN' && (
                       <div className="absolute top-2 right-2 px-2 py-1 bg-rose-900/80 text-rose-200 text-[10px] font-bold border border-rose-500/50">
                         COMPROMISED
                       </div>
                     )}
                     {r.status === 'COMPLETE' && (
                       <div className="absolute top-2 right-2 px-2 py-1 bg-teal-900/80 text-teal-200 text-[10px] font-bold border border-teal-500/50">
                         BREAKTHROUGH
                       </div>
                     )}
                  </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'BASE' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                <Cog className="text-amber-500" />
                INDUSTRIAL CAPACITY
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(capacity || []).map(c => (
                 <div key={c.sectorId} className="bg-slate-800 border border-slate-700 p-3 rounded">
                    <div className="text-[10px] font-bold text-indigo-400 mb-1">{c.sectorId.replace('_', ' ')}</div>
                    <div className="text-2xl text-white font-light tracking-tight">{c.currentCapacity.toFixed(0)} <span className="text-sm text-slate-500">U/MO</span></div>
                    <div className="mt-2 text-xs text-slate-400">UTILIZATION: <span className={c.utilizationRate > 90 ? 'text-rose-400' : 'text-emerald-400'}>{c.utilizationRate}%</span></div>
                    <div className="h-1 bg-slate-900 mt-1">
                      <div className={`h-full ${c.utilizationRate > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${c.utilizationRate}%` }} />
                    </div>
                    {c.mobilizationMultiplier > 1 && (
                       <div className="mt-2 text-[10px] text-amber-500 font-bold border border-amber-500/30 bg-amber-900/20 px-1 py-0.5 inline-block rounded">
                         +{((c.mobilizationMultiplier - 1) * 100).toFixed(0)}% WAR ECON
                       </div>
                    )}
                 </div>
              ))}
            </div>
            
            <div className="mt-6 border-t border-white/10 pt-4">
               <h4 className="text-white font-bold tracking-widest mb-4">MOBILIZATION POSTURE</h4>
               <div className="flex gap-2">
                 {['PEACETIME', 'ELEVATED', 'PARTIAL', 'FULL', 'TOTAL_WAR'].map(level => {
                   const curr = store.mobilizationStates[selectedCountryId]?.level === level;
                   let activeClasses = "bg-slate-800 text-slate-400 border-slate-700";
                   if (curr) {
                      if (level === 'PEACETIME') activeClasses = "bg-emerald-900/50 border-emerald-500 text-emerald-200";
                      else if (level.includes('WAR')) activeClasses = "bg-rose-900/50 border-rose-500 text-rose-200";
                      else activeClasses = "bg-amber-900/50 border-amber-500 text-amber-200";
                   }
                   
                   return (
                     <button key={level} 
                       className={`flex-1 py-3 text-xs font-bold tracking-wider border rounded transition-colors ${activeClasses}`}>
                        {level.replace('_', ' ')}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'SUPPLY' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                <Cpu className="text-blue-400" />
                STRATEGIC SUPPLY CHAIN
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(components || []).map(comp => {
                 const stockpile = comp.stockpileByCountry[selectedCountryId] || 0;
                 const consumption = comp.consumptionRateByCountry[selectedCountryId] || 0;
                 const monthsSupply = consumption > 0 ? (stockpile / consumption).toFixed(1) : '∞';
                 
                 return (
                   <div key={comp.id} className="bg-slate-800 border border-slate-700 p-4 rounded">
                      <div className="font-bold text-white mb-3 tracking-wide">{comp.name}</div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                         <div>
                            <div className="text-slate-500 text-[10px]">STOCKPILE</div>
                            <div className="text-white">{stockpile.toLocaleString()} <span className="text-slate-500 text-xs">UNITS</span></div>
                         </div>
                         <div>
                            <div className="text-slate-500 text-[10px]">EST. RUNWAY</div>
                            <div className={`font-bold ${parseFloat(monthsSupply as string) < 6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                               {monthsSupply} <span className="text-xs">MONTHS</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="text-xs text-slate-400 pt-2 border-t border-white/5">
                         PRIMARY SOURCE: {comp.primaryProducerCountries.join(', ')}
                      </div>
                      {comp.sanctionedFlows.length > 0 && (
                         <div className="text-[10px] text-rose-400 mt-2 flex gap-1 items-center">
                            <AlertTriangle size={12} /> SANCTIONED FLOWS ACTIVE
                         </div>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {activeTab === 'EXPORT' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                <ArrowRightLeft className="text-emerald-400" />
                FOREIGN MILITARY EXPORTS (FMS)
              </h3>
            </div>
            <div className="border border-white/10 bg-slate-800/30 p-8 text-center text-slate-500 rounded">
                NO ACTIVE EXPORT CONTRACTS
            </div>
          </div>
        )}

        {activeTab === 'INTEL' && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-xl font-bold text-rose-400 tracking-widest flex items-center gap-2">
                <ShieldAlert />
                PROCUREMENT INTELLIGENCE
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.values(intel).filter(i => i.countryId !== 'US').map(i => (
                  <div key={i.countryId} className="bg-slate-800 border border-slate-700 p-4 rounded">
                     <h4 className="text-white font-bold text-lg mb-2">{i.countryId}</h4>
                     
                     <div className="space-y-3">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold mb-1">EST. MOBILIZATION</div>
                          <div className="text-rose-400 font-bold">{i.estimatedMobilizationLevel.replace('_', ' ')}</div>
                        </div>
                        
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold mb-1">INFERRED RAMPS</div>
                          <div className="flex flex-wrap gap-1">
                            {(i.inferredProductionRamp || []).map(ramp => (
                               <span key={ramp} className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded">
                                 {ramp.replace('_', ' ')}
                               </span>
                            ))}
                            {i.inferredProductionRamp.length === 0 && <span className="text-xs text-slate-600">NO ANOMALIES</span>}
                          </div>
                        </div>
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
