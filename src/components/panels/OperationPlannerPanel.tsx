import React from 'react';
import { useTargetedOperationsStore } from '../../store/targetedOperationsStore';
import { MethodTradeoffs } from '../../types';

export default function OperationPlannerPanel() {
  const opStore = useTargetedOperationsStore();
  const selectedTargetId = opStore.selectedTargetId;
  const dossier = selectedTargetId ? opStore.dossiers[selectedTargetId] : null;

  const tradeoffs = React.useMemo(() => {
    if (!dossier) return {};
    return opStore.evaluateMethodTradeoffs(dossier);
  }, [dossier, opStore]);

  const recommendedMethods = React.useMemo(() => {
    if (!dossier) return [];
    return opStore.recommendMethodSet(dossier);
  }, [dossier, opStore]);

  const selectedMethodId = opStore.selectedMethodId;
  const activeMethodTradeoff = selectedMethodId && tradeoffs[selectedMethodId] ? tradeoffs[selectedMethodId] : null;

  const handleLaunch = () => {
    if (!selectedTargetId || !selectedMethodId) return;
    opStore.executeTargetedOperation(selectedTargetId, selectedMethodId);
  };

  return (
    <div className="flex-1 bg-[#01080a] border border-[#003c4a] p-4 font-mono text-xs flex flex-col h-full rounded shadow-[0_0_20px_rgba(0,100,120,0.1)]">
      {/* Header */}
      <div className="border-b border-[#003c4a] pb-2 mb-3 flex justify-between items-center shrink-0">
        <h3 className="text-[#00ffff] font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#00ffff] animate-ping rounded-full" />
          OPERATION PLANNER MAPPING
        </h3>
        <span className="text-[9px] text-[#006e87] uppercase font-bold text-cyan-600">TACTICAL TRADEOFF MATRIX</span>
      </div>

      {dossier ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="border border-[#003c4a]/50 bg-black/60 p-2 text-cyan-400">
            Selected target: <strong className="text-white uppercase font-extrabold">{dossier.name}</strong> (Confidence: {dossier.confidenceScore}%)
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
            {/* Left side: Method Tradeoff Selection List */}
            <div className="col-span-5 flex flex-col min-h-0 border-r border-[#003c4a]/30 pr-3">
              <span className="text-[10px] text-[#008ba8] font-bold uppercase tracking-wider mb-2">INTELLIGENCE METHODOLOGY RADIAL</span>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {(Object.values(tradeoffs) as MethodTradeoffs[]).map((m) => {
                  const isSelected = selectedMethodId === m.methodId;
                  const isRecommended = recommendedMethods.includes(m.methodId);
                  return (
                    <button
                      id={`method-btn-${m.methodId.replace(/\s+/g, '-')}`}
                      key={m.methodId}
                      onClick={() => opStore.setSelectedMethodId(m.methodId)}
                      className={`w-full text-left p-2 border transition-all flex flex-col relative overflow-hidden
                        ${isSelected ? 'border-[#00ffff] bg-[#002f3c]/40 text-white' : 'border-[#003c4a]/40 bg-black/50 text-[#00d0ff]/70 hover:bg-[#002f3c]/20'}`}
                    >
                      {isRecommended && (
                        <div className="absolute top-0 right-0 text-[7px] bg-teal-500/15 text-teal-400 px-1 border-l border-b border-[#004f5e]">
                          SUITABLE
                        </div>
                      )}
                      <div className="font-extrabold text-[11px] mb-1">{m.name}</div>
                      <div className="flex justify-between w-full text-[9px] text-gray-400">
                        <span>Cost: <strong className="text-cyan-400">${m.resourceCost}B</strong></span>
                        <span>Success Likelihood: <strong className="text-cyan-300">{m.likelihoodOfSuccess}%</strong></span>
                      </div>
                      {isSelected && m.blockerPenalties.length > 0 && (
                        <div className="mt-1 text-[8px] text-red-400 border-t border-[#004f5e]/50 pt-1 leading-tight">
                          ⚠️ {m.blockerPenalties[0]}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Method Tradeoff comparison metrics */}
            <div className="col-span-7 flex flex-col min-h-0">
              {activeMethodTradeoff ? (
                <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1 space-y-3">
                  <div className="border border-[#003c4a] bg-[#001014]/65 p-3">
                    <div className="text-[9px] text-[#008ba8] font-bold tracking-widest uppercase mb-1">SELECTED COVERT VECTOR</div>
                    <div className="font-extrabold text-[13px] text-white uppercase mb-2">{activeMethodTradeoff.name}</div>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      Assigned payload package targets critical infrastructure layers, utilizing optimized electronic injection matrices. Risk of civilian disruption mitigated to calculated tactical limits.
                    </p>
                  </div>

                  {/* Radial trade-offs bar graph specs */}
                  <div className="space-y-2 border border-[#003c4a]/20 p-2.5 bg-black/40">
                    <div className="text-[9px] text-cyan-600 tracking-wider font-extrabold uppercase mb-1">OPERATIONAL BAR PROFILE:</div>
                    
                    {/* Speed Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>ESTIMATED PAYLOAD SPEED / ACTION DELAY</span>
                        <span className="text-cyan-300 font-bold font-mono">{activeMethodTradeoff.speed}/100</span>
                      </div>
                      <div className="h-1 bg-[#001c24] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${activeMethodTradeoff.speed}%` }} />
                      </div>
                    </div>

                    {/* Stealth Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>SIGNAL STEALTH INDEX</span>
                        <span className="text-cyan-300 font-bold font-mono">{activeMethodTradeoff.stealth}/100</span>
                      </div>
                      <div className="h-1 bg-[#001c24] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${activeMethodTradeoff.stealth}%` }} />
                      </div>
                    </div>

                    {/* Attribution Risk Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>COUNTER-INTELLIGENCE ATTRIBUTION RISK</span>
                        <span className="text-cyan-300 font-bold font-mono">{activeMethodTradeoff.attributionRisk}/100</span>
                      </div>
                      <div className="h-1 bg-[#001c24] rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${activeMethodTradeoff.attributionRisk}%` }} />
                      </div>
                    </div>

                    {/* Collateral Risk Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>COLLATERAL STRUCTURAL DISRUPTION</span>
                        <span className="text-cyan-300 font-bold font-mono">{activeMethodTradeoff.collateralRisk}/100</span>
                      </div>
                      <div className="h-1 bg-[#001c24] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00c3ff]" style={{ width: `${activeMethodTradeoff.collateralRisk}%` }} />
                      </div>
                    </div>

                    {/* Reversibility Indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>OPERATIONAL REVERSIBILITY PROFILE</span>
                        <span className="text-cyan-300 font-bold font-mono">{activeMethodTradeoff.reversibility}/100</span>
                      </div>
                      <div className="h-1 bg-[#001c24] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${activeMethodTradeoff.reversibility}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Suitability readout */}
                  <div className="border border-[#003c4a]/50 bg-cyan-950/20 p-2 flex justify-between items-center text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-cyan-600 block font-bold">SUITABILITY SCORE</span>
                      <strong id="method-suitability-score" className="text-[#00ffff] font-extrabold text-[12px]">{activeMethodTradeoff.suitabilityScore} / 100</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-cyan-600 block font-bold">LIFETIME REVERSIBILITY</span>
                      <strong className="text-gray-300">{activeMethodTradeoff.reversibility > 60 ? 'HIGH' : activeMethodTradeoff.reversibility > 20 ? 'MODERATE' : 'IRREVERSIBLE'}</strong>
                    </div>
                  </div>

                  {/* EXECUTE TACTICAL STRIKE OPERATION BLOCK */}
                  <div className="pt-2">
                    <button
                      id="launch-oper-btn"
                      disabled={!dossier.isActionable}
                      onClick={handleLaunch}
                      className={`w-full py-2.5 font-bold tracking-widest text-[10px] uppercase border transition-all active:scale-95
                        ${dossier.isActionable 
                          ? 'border-[#00ffff] text-black bg-[#00ffff] hover:opacity-85 shadow-[0_0_15px_rgba(0,255,255,0.4)]' 
                          : 'border-gray-800 text-gray-600 bg-gray-950/50 cursor-not-allowed'}`}
                    >
                      {dossier.isActionable 
                        ? 'EXECUTE BLACK LANTERN STRIKE' 
                        : 'LOCKED // ACTIONABLE REQUIREMENT NOT MET'}
                    </button>
                    {!dossier.isActionable && (
                      <span className="text-[8px] text-red-400 text-center block mt-1">
                        ⚠️ TARGET DOSSIER CONFIDENCE LEVEL MUST REACH AT LEAST 70% SURVEILLANCE
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#003c4a]/30 rounded bg-black/25 p-7 text-center">
                  <svg className="w-8 h-8 text-cyan-800/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h6 className="text-[#0086a3] font-bold tracking-wide">VECTOR CALIBRATION ENVELOPE</h6>
                  <p className="text-gray-600 text-[10px] max-w-[200px] mt-1 leading-relaxed">
                    Select a methodology vector from left parameters to plot speed, stealth, and risks profile mapping.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-dashed border-[#003c4a]/30 bg-black/10 text-gray-600 p-8 text-center rounded">
          Waiting for target selector lock to synthesize tactical methodology comparisons.
        </div>
      )}
    </div>
  );
}
