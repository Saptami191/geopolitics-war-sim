import React, { useState } from 'react';
import { PanelFxShell } from '../fx/PanelFxShell';
import { motion } from 'motion/react';
import {
  Server, Shield, Target, Activity, Lock, Unlock, AlertTriangle, Play, Pause, ChevronDown, CheckCircle, XCircle
} from 'lucide-react';
import { useCyberStore } from '../../store/cyberStore';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';

export default function CyberPanel() {
  const { 
     cyber_aptOperations, cyber_zeroDays, cyber_tools, cyber_infrastructure, cyber_incidents,
     cyber_defenceOperations, cyber_aptGroups, cyber_defencePosture, cyber_budget,
     cyber_zeroDay_market, cyber_attributionQueue, cyber_directorLog, cyber_launchAPTOperation,
     cyber_setDefencePosture
  } = useCyberStore();

  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'ARSENAL' | 'DEFENCE' | 'INCIDENTS' | 'THREAT_INTEL' | 'LOG'>('OPERATIONS');

  return (
    <PanelFxShell panelId="cyber" relevantFxTypes={['CYBER_ATTACK']}>
      <div className="bg-[#050a05] h-[800px] flex flex-col font-mono text-[#00ff41] relative overflow-hidden border border-[#00ff41]/20">
        
        {/* HEADER */}
        <div className="flex bg-[#020502] border-b border-[#00ff41]/30 p-2 items-center justify-between">
           <div className="flex items-center gap-2">
             <Server className="w-5 h-5" />
             <h2 className="font-bold tracking-widest text-lg">GHOST PROTOCOL // CYBER</h2>
           </div>
           <div className="flex gap-4 text-xs font-bold px-4">
             <div>BUDGET: <span className="text-[#00ff41]">${cyber_budget.remaining}M</span></div>
             <div>INCIDENTS: <span className={cyber_incidents.filter(i=>!i.resolvedAtTick).length > 0 ? "text-red-500" : ""}>{cyber_incidents.filter(i=>!i.resolvedAtTick).length}</span></div>
           </div>
        </div>

        {/* TABS */}
        <div className="flex bg-[#030803] border-b border-[#00ff41]/20 text-xs">
          {['OPERATIONS', 'ARSENAL', 'DEFENCE', 'INCIDENTS', 'THREAT_INTEL', 'LOG'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 border-r border-[#00ff41]/20 hover:bg-[#00ff41]/10 ${activeTab === tab ? 'bg-[#00ff41]/20 font-bold text-white' : 'text-[#00ff41]/70'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {activeTab === 'OPERATIONS' && (
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-[#020502] p-2 border border-[#00ff41]/20">
                 <div className="font-bold">ACTIVE APT OPERATIONS ({cyber_aptOperations.filter(o=>o.status==='ACTIVE').length})</div>
                 <button className="bg-[#00ff41]/20 px-3 py-1 text-xs font-bold hover:bg-[#00ff41]/40 border border-[#00ff41]/40">+ LAUNCH OPERATION</button>
               </div>
               <div className="grid gap-4">
                 {(cyber_aptOperations || []).map(op => (
                   <div key={op.id} className={`border p-3 ${op.status==='ACTIVE'?'border-[#00ff41]/50':'border-gray-600'} bg-[#020502]`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-sm">{op.codename} <span className="text-gray-500 text-xs">// {op.targetNationId} : {op.targetType}</span></div>
                        <div className="text-xs font-bold border px-1 border-[#00ff41]/20">{op.status}</div>
                      </div>
                      
                      <div className="flex gap-1 mb-2">
                        {['RECONNAISSANCE', 'INITIAL_ACCESS', 'PERSISTENCE', 'LATERAL_MOVEMENT', 'PRIVILEGE_ESCALATION', 'EXECUTION', 'EXFILTRATION', 'IMPACT'].map((phase, i) => {
                          const isComplete = op.completedPhases.includes(phase as any);
                          const isCurrent = op.currentPhase === phase;
                          return (
                            <div key={phase} className={`h-2 flex-1 ${isComplete ? 'bg-[#00ff41]' : isCurrent ? 'bg-[#00ff41] animate-pulse glow' : 'bg-[#00ff41]/10'}`} title={phase} />
                          )
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 mb-2">CURRENT: {op.currentPhase.replace('_', ' ')}</div>

                      <div className="flex justify-between text-[10px]">
                        <div>SUCCESS PROB: <span className="text-[#00ff41]">{Math.floor(op.successProbability)}%</span></div>
                        <div>DETECTION RISK: <span className={op.detectionRisk > 50 ? "text-amber-500" : "text-[#00ff41]"}>{Math.floor(op.detectionRisk)}%</span></div>
                        {op.isDefenderAware && <div className="text-amber-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> DETECTED</div>}
                        {op.status === 'ATTRIBUTED' && <div className="text-red-500 font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> ATTRIBUTED</div>}
                      </div>
                   </div>
                 ))}
                 {(cyber_aptOperations || []).length === 0 && (
                   <div className="text-xs text-gray-500 opacity-60">NO ACTIVE OPS</div>
                 )}
               </div>
            </div>
          )}

          {activeTab === 'ARSENAL' && (
            <div className="space-y-6">
              <div>
                <div className="font-bold border-b border-[#00ff41]/20 pb-2 mb-2">ZERO-DAYS: {cyber_zeroDays.filter(z=>z.status==='CLASSIFIED').length} CLASSIFIED / {cyber_zeroDays.filter(z=>z.status==='DEPLOYED').length} DEPLOYED</div>
                <div className="grid grid-cols-2 gap-4">
                  {(cyber_zeroDays || []).map(zd => (
                    <div key={zd.id} className="border border-[#00ff41]/20 bg-[#020502] p-3 text-xs">
                       <div className="flex justify-between">
                         <div className="font-bold text-[#41c7ff]">{zd.codename}</div>
                         <div className={`px-1 border ${zd.status==='CLASSIFIED'?'border-[#41c7ff] text-[#41c7ff]':zd.status==='BURNED'?'border-red-500 text-red-500':'border-amber-500 text-amber-500'}`}>{zd.status}</div>
                       </div>
                       <div className="text-gray-400 mt-1">TARGET: {zd.targetSystem}</div>
                       <div className="flex justify-between mt-2">
                         <div>EXPL: {zd.exploitabilityScore}/100</div>
                         <div>STEALTH: {zd.detectionDifficulty}/100</div>
                       </div>
                    </div>
                  ))}
                  {cyber_zeroDays.length === 0 && <div className="col-span-2 text-[#00ff41]/40 text-xs text-center p-4">NO ZERO-DAYS IN ARSENAL</div>}
                </div>
              </div>

              <div>
                <div className="font-bold border-b border-[#00ff41]/20 pb-2 mb-2">ZERO-DAY MARKETPLACE</div>
                <div className="grid grid-cols-2 gap-4">
                  {(cyber_zeroDay_market.availableZeroDays || []).map(zd => (
                    <div key={zd.id} className="border border-purple-500/30 bg-[#0a0510] p-3 text-xs text-purple-400">
                       <div className="flex justify-between">
                         <div className="font-bold">{zd.codename}</div>
                         <div>${zd.acquisitionCost}M</div>
                       </div>
                       <div className="text-gray-500 mt-1">TARGET: {zd.targetSystem}</div>
                       <div className="flex justify-between mt-2">
                         <div>EXPL: {zd.exploitabilityScore}/100</div>
                         <div>STEALTH: {zd.detectionDifficulty}/100</div>
                       </div>
                       <button className="mt-2 w-full py-1 bg-purple-900/30 font-bold hover:bg-purple-900/60 border border-purple-500/50">ACQUIRE ASSET</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DEFENCE' && (
             <div className="space-y-6">
                <div>
                  <div className="font-bold text-sm mb-2">DEFENCE POSTURE</div>
                  <div className="flex gap-2 text-xs">
                     {['PASSIVE', 'ACTIVE_DEFENCE', 'HARDENED', 'OFFENSIVE_DEFENCE', 'CRISIS_LOCKDOWN'].map(p => (
                       <button
                         key={p}
                         onClick={() => cyber_setDefencePosture(p as any)}
                         className={`px-3 py-1 border ${cyber_defencePosture === p ? 'border-[#00ff41] bg-[#00ff41]/20 font-bold text-white' : 'border-[#00ff41]/30 hover:bg-[#00ff41]/10 text-gray-400'}`}
                       >
                         {p.replace('_', ' ')}
                       </button>
                     ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-sm mb-2">CRITICAL INFRASTRUCTURE STATUS</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {(cyber_infrastructure || []).map(node => (
                       <div key={node.id} className={`p-2 text-xs border ${node.status==='SECURE'?'border-[#00ff41]/30 bg-[#020502] text-[#00ff41]':node.status==='COMPROMISED'?'border-red-500/50 bg-red-950/20 text-red-500':'border-amber-500/50 bg-amber-950/20 text-amber-500'}`}>
                         <div className="font-bold truncate" title={node.targetType}>{node.targetType}</div>
                         <div className="mt-1 flex justify-between">
                           <div>VULN: {Math.floor(node.vulnerabilityScore)}</div>
                           <div>{node.status}</div>
                         </div>
                       </div>
                    ))}
                    {cyber_infrastructure.length === 0 && <div className="text-gray-500 text-xs col-span-4 py-8 text-center border border-[#00ff41]/10 border-dashed">NO INFRASTRUCTURE NODES CONFIGURED</div>}
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'INCIDENTS' && (
            <div className="space-y-6">
               {(cyber_attributionQueue.length > 0) && (
                 <div className="border border-red-500 p-3 bg-red-950/20">
                    <div className="font-bold text-red-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> ATTRIBUTION DECISIONS REQUIRED</div>
                    <div className="space-y-2">
                       {cyber_incidents.filter(i => cyber_attributionQueue.includes(i.id)).map(inc => (
                         <div key={inc.id} className="border border-red-500/30 p-2 text-xs">
                            <div className="font-bold">{inc.type} — affected node: {inc.affectedNodeId}</div>
                            <div className="flex justify-between text-gray-300 mt-1">
                              <div>CONFIDENCE: <span className="font-bold text-red-400">{inc.attributionConfidence}</span></div>
                              <div>ADVERSARY: {inc.attackingAPTGroupId || 'UNKNOWN'}</div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              {(inc.responseOptions || []).map(ro => (
                                 <button key={ro.id} className="px-2 py-1 bg-red-900/30 hover:bg-red-900/60 border border-red-500/50 text-red-300">
                                   [{ro.type}]
                                 </button>
                              ))}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               <div>
                 <div className="font-bold border-b border-[#00ff41]/20 pb-2 mb-2">ACTIVE INCIDENTS ({cyber_incidents.filter(i=>!i.resolvedAtTick).length})</div>
                 {cyber_incidents.filter(i=>!i.resolvedAtTick).map(inc => (
                   <div key={inc.id} className="border border-amber-500/30 p-2 text-xs mb-2 bg-[#050402]">
                     <div className="flex justify-between font-bold text-amber-500">
                       <div>{inc.type}</div>
                       <div>TICK: {inc.detectedAtTick}</div>
                     </div>
                     <div className="text-gray-400 my-1">{inc.description}</div>
                     <div className="text-amber-500/70">DAMAGE SCORE: {inc.damageScore} / 100</div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'THREAT_INTEL' && (
             <div className="space-y-6">
               <div className="font-bold text-sm mb-2">KNOWN APT GROUPS ({cyber_aptGroups.filter(g=>g.isAttributed).length})</div>
               <div className="grid grid-cols-2 gap-4">
                 {cyber_aptGroups.filter(g=>g.isAttributed).map(group => (
                   <div key={group.id} className="border border-gray-600 p-3 bg-[#020305] text-xs">
                     <div className="font-bold text-[#41c7ff] text-sm">{group.codename}</div>
                     <div className="text-gray-400 my-1">SPONSOR: {group.nationId}</div>
                     <div className="flex justify-between mt-2">
                       <div>SOPHISTICATION: {Math.floor(group.sophisticationScore)}</div>
                       <div>SUCCESS RATE: {group.successRate}%</div>
                     </div>
                     <div className="mt-2 text-gray-500 truncate">TTPs: {group.knownTtps.join(', ') || 'NONE LOGGED'}</div>
                   </div>
                 ))}
                 {cyber_aptGroups.filter(g=>g.isAttributed).length === 0 && (
                   <div className="text-gray-500 py-6 text-center col-span-2">NO ATTRIBUTED APT GROUPS</div>
                 )}
               </div>
             </div>
          )}

          {activeTab === 'LOG' && (
            <div className="font-mono text-xs">
               {(cyber_directorLog || []).map((log, i) => {
                 let colorClass = "text-gray-300";
                 if (log.includes('EXFILTRATION') || log.includes('SUCCEEDED') || log.includes('LAUNCHED')) colorClass = "text-[#00ff41]";
                 if (log.includes('ATTRIBUTED') || log.includes('ATTRIBUTION')) colorClass = "text-purple-400";
                 if (log.includes('DESTROYED') || log.includes('FAILED') || log.includes('CRITICAL')) colorClass = "text-red-500";
                 if (log.includes('ZERO-DAY') || log.includes('CLASSIFIED')) colorClass = "text-[#41c7ff]";
                 
                 return (
                   <div key={i} className={`mb-1 ${colorClass}`}>
                     {log}
                   </div>
                 )
               })}
               {cyber_directorLog.length === 0 && <div className="text-gray-500">Log is empty.</div>}
            </div>
          )}
          
        </div>
      </div>
    </PanelFxShell>
  );
}
