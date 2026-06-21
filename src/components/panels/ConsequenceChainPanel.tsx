import React, { useState } from 'react';
import { useTargetedOperationsStore } from '../../store/targetedOperationsStore';
import { useWorldStore } from '../../store/worldStore';

export default function ConsequenceChainPanel() {
  const opStore = useTargetedOperationsStore();
  const worldStore = useWorldStore();
  const currentTick = worldStore.currentTick;

  const chains = Object.values(opStore.consequenceChains);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  
  const activeChain = selectedChainId ? opStore.consequenceChains[selectedChainId] : (chains[0] || null);

  const handleResolveStep = (chainId: string, stepId: string) => {
    opStore.resolveConsequenceStep(chainId, stepId);
  };

  const handleTriggerEmit = (chainId: string, stepId: string) => {
    opStore.emitConsequenceEvent(chainId, stepId);
  };

  return (
    <div className="flex-1 bg-[#02080a] border border-[#003c4a] p-4 font-mono text-xs flex flex-col h-full rounded shadow-[0_0_20px_rgba(0,100,120,0.1)]">
      {/* Header */}
      <div className="border-b border-[#003c4a] pb-2 mb-3 flex justify-between items-center shrink-0">
        <h3 className="text-red-500 font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-red-600 animate-pulse rounded-full" />
          CONSEQUENCE CASCADE MONITOR
        </h3>
        <span className="text-[9px] text-[#006e87] uppercase font-bold text-red-600 font-mono">POST-STRIKE EVOLUTION</span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left side: Chains list */}
        <div className="col-span-4 border-r border-[#003c4a]/30 pr-3 flex flex-col min-h-0">
          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2">ACTIVE ESCALATION CHAINS</span>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {chains.length === 0 ? (
              <div className="text-gray-600 text-center py-8">
                No active consequence chains recorded. Initiate operations to plot response fallout sequences.
              </div>
            ) : (
              (chains || []).map((ch) => {
                const isSelected = selectedChainId === ch.chainId || (!selectedChainId && activeChain?.chainId === ch.chainId);
                return (
                  <button
                    id={`chain-btn-${ch.chainId}`}
                    key={ch.chainId}
                    onClick={() => setSelectedChainId(ch.chainId)}
                    className={`w-full text-left p-2 border transition-all flex flex-col hover:bg-[#002f3c]/20
                      ${isSelected ? 'border-red-500 bg-red-950/25 text-white' : 'border-[#003c4a]/40 bg-black/60 text-red-500/60'}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold text-[9px] uppercase">METHOD: {ch.methodId}</span>
                      <span className={`text-[8px] font-bold px-1 uppercase ${ch.isExpired ? 'bg-gray-800 text-gray-500' : 'bg-red-900/30 text-red-400'}`}>
                        {ch.isExpired ? 'EXPIRED' : 'FALLOUT ACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between w-full text-[9px] text-gray-500 mt-1">
                      <span>Chain ID: {ch.chainId}</span>
                      <span>Damage Score: <span className="text-red-500 font-extrabold">{ch.totalDamageScore}</span></span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right side: Chain flow timeline view */}
        <div className="col-span-8 flex flex-col min-h-0">
          {activeChain ? (
            <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
              {/* Chain General Headers */}
              <div className="border border-red-900 bg-black/80 p-3 flex justify-between items-center relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-[8px] text-red-500/50 font-bold uppercase tracking-widest">TACTICAL OUTCOME RETALIATION ANALYSIS</span>
                  <h4 className="text-white font-extrabold text-[13px] uppercase">CHAIN {activeChain.chainId} MATRIX</h4>
                  <div className="text-[10px] text-gray-400 flex gap-4 font-mono uppercase">
                    <span>Target ID: <strong className="text-red-400">{activeChain.targetId}</strong></span>
                    <span>Operation Code: <strong>{activeChain.operationId}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-gray-500 font-bold block mb-0.5">COMPOSITE SEVERITY INDEX</span>
                  <span id="chain-damage-value" className="text-red-500 font-extrabold text-[15px] bg-red-950/30 px-2 py-0.5 border border-red-900/40 rounded">
                    {activeChain.totalDamageScore} Pts
                  </span>
                </div>
              </div>

              {/* Chain steps visualization */}
              <div className="flex-1 flex flex-col space-y-3 min-h-0">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest border-b border-red-950/20 pb-1 mb-1 block">
                  CHRONOLOGICAL RESOLUTION STAGES
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                  {(activeChain.steps || []).map((step, idx) => {
                    const ticksRemaining = step.resolveTick - currentTick;
                    const isFuturistic = step.resolveTick > currentTick && !step.isResolved && !step.isHappening;
                    const isUpcomingActive = step.isHappening || (step.resolveTick <= currentTick && !step.isResolved);
                    
                    return (
                      <div
                        id={`consequence-step-card-${step.stepId}`}
                        key={step.stepId}
                        className={`border p-3 flex flex-col justify-between transition-all relative
                          ${step.isResolved 
                            ? 'border-gray-800 bg-gray-950/15 opacity-45' 
                            : isUpcomingActive 
                              ? 'border-red-500 bg-red-950/10 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                              : 'border-cyan-950/40 bg-black/60'}`}
                      >
                        {/* Step indicator tag */}
                        <div className="absolute top-0 right-0 text-[8px] px-1.5 border-l border-b border-[#003c4a]">
                          STAGE-0{idx + 1}
                        </div>

                        <div className="flex justify-between items-start mb-2 pr-12">
                          <div>
                            <span className="text-[9px] text-[#00d0ff] uppercase font-bold pr-2">STEP:</span>
                            <h5 className="text-white font-extrabold text-[11px] inline-block uppercase tracking-wide">{step.label}</h5>
                          </div>
                          
                          {/* Severity badge display */}
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 scale-90 select-none
                            ${step.severity === 'CRITICAL' ? 'bg-red-950/60 border border-red-500 text-red-400' :
                              step.severity === 'HIGH' ? 'bg-amber-950/60 border border-amber-500 text-amber-400' :
                              'bg-cyan-950/60 border border-cyan-500 text-cyan-400'}`}>
                            {step.severity}
                          </span>
                        </div>

                        <p className="text-gray-300 text-[10px] leading-relaxed mb-3">
                          {step.description}
                        </p>

                        <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-cyan-950/20 pt-2 font-mono uppercase">
                          <div>
                            Trigger: <strong className="text-cyan-600">{step.triggerCondition}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Resolve Ticking indicators */}
                            {step.isResolved ? (
                              <span className="text-emerald-400 font-extrabold">● RESOLVED</span>
                            ) : ticksRemaining > 0 ? (
                              <span className="text-amber-500 font-bold">EMISSION IN: {ticksRemaining} TICKS</span>
                            ) : (
                              <span className="text-red-500 font-extrabold animate-pulse">EMITTING CONCUSSION</span>
                            )}

                            {/* Testing Trigger Buttons per step */}
                            {!step.isResolved && (
                              <>
                                <button
                                  id={`btn-emit-consequence-${step.stepId}`}
                                  className="px-2 py-0.5 border border-amber-600 text-amber-500 hover:bg-amber-600/10 transition-all text-[8px] font-bold scale-90 active:scale-95"
                                  onClick={() => handleTriggerEmit(activeChain.chainId, step.stepId)}
                                >
                                  TEST ALARM
                                </button>
                                <button
                                  id={`btn-resolve-step-${step.stepId}`}
                                  className="px-2 py-0.5 border border-red-500 text-red-500 hover:bg-red-500/15 transition-all text-[8px] font-bold scale-90 active:scale-95"
                                  onClick={() => handleResolveStep(activeChain.chainId, step.stepId)}
                                >
                                  FORCE STEP
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#003c4a]/30 rounded bg-black/25 p-8 text-center">
              <svg className="w-9 h-9 text-red-800/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h5 className="text-red-700/80 font-bold uppercase tracking-wider mb-1">CASCADE MONITOR SLEEPING</h5>
              <p className="text-gray-600 max-w-sm text-[10px] leading-relaxed font-mono">
                Launch a targeted tactical action via Operation Planner to activate kinetic or cyber cascade chains and study dynamic sovereign fallout effects.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
