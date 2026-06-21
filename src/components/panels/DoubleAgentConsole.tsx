import React from 'react';
import { useHumintStore } from '../../store/humintStore';
import { useWorldStore } from '../../store/worldStore';

export default function DoubleAgentConsole() {
  const humStore = useHumintStore();
  const doubleAgentIds = Object.keys(humStore.doubleAgents);

  const activeSelectedId = humStore.selectedSourceId || doubleAgentIds[0] || null;
  const daState = activeSelectedId ? humStore.doubleAgents[activeSelectedId] : null;
  const s = activeSelectedId ? humStore.sources[activeSelectedId] : null;

  const handleTestCollapse = (daId: string) => {
    humStore.collapseDoubleAgent(daId);
  };

  const handleShiftLoyalty = (daId: string) => {
    humStore.updateDualLoyalty(daId);
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full overflow-hidden text-[#00ffcc] font-mono">
      {/* Side bar list of double agents */}
      <div className="col-span-4 border border-cyan-900/60 bg-black/80 p-3 rounded-lg flex flex-col h-full min-h-0">
        <h3 className="text-[11px] font-extrabold text-cyan-400 bg-cyan-950/20 p-2 border border-cyan-900/40 rounded uppercase tracking-widest mb-3">
          // DUAL-LOYALTY DIRECTORY
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
          {(doubleAgentIds || []).map(daId => {
            const src = humStore.sources[daId];
            const state = humStore.doubleAgents[daId];
            if (!src || !state) return null;
            const isSelected = activeSelectedId === daId;
            return (
              <button
                key={daId}
                onClick={() => humStore.setSelectedSourceId(daId)}
                className={`w-full text-left p-2.5 border transition-all rounded text-[10px] space-y-1.5 cursor-pointer
                  ${isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)] text-cyan-200'
                    : 'border-cyan-900/40 bg-[#020b0b]/60 text-cyan-700 hover:border-cyan-700 hover:text-cyan-400'}`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>{src.identity.coverName}</span>
                  <span className={`text-[8.5px] font-extrabold border px-1.5 ${src.identity.sourceType === 'REDOUBLED_AGENT' ? 'text-red-400 border-red-900 bg-red-950/20' : 'text-blue-400 border-blue-900 bg-blue-950/20'}`}>
                    {src.identity.sourceType}
                  </span>
                </div>
                <div className="text-[9px] text-cyan-600 font-medium">ADVERSARY: {src.identity.hostileService}</div>

                <div className="grid grid-cols-2 gap-2 text-[9px] pt-1.5 border-t border-cyan-950/30 font-medium text-cyan-500/80">
                  <div className="flex justify-between">
                    <span>STABILITY:</span>
                    <span className="text-[#00ff99] font-bold">{100 - state.instabilityScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PRESSURE:</span>
                    <span className="text-orange-400 font-bold">{state.performancePressure}%</span>
                  </div>
                </div>
              </button>
            );
          })}

          {doubleAgentIds.length === 0 && (
            <div className="text-center text-[10px] text-cyan-800 p-6 border-dashed border border-cyan-950/40 rounded italic mt-4">
              NO SOURCES CURRENT CLASSIFIED WITH ACTIVE DUAL-LOYAITY DECEPTION ROSTERS.
            </div>
          )}
        </div>
      </div>

      {/* Main Double Agent Console metrics */}
      <div className="col-span-8 border border-cyan-900/60 bg-black/90 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto scrollbar-thin h-full min-h-0">
        {s && daState ? (
          <div className="space-y-4 text-[11px]">
            <header className="border-b border-cyan-900/40 pb-3">
              <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                <span>DOUBLE-AGENT DECEPTION MATRIX: {s.identity.coverName}</span>
                <span className="text-[10px] text-red-500 font-bold tracking-normal">[STABILITY CODE: {100 - daState.instabilityScore}]</span>
              </h4>
              <p className="text-[9px] text-[#00b0ff] uppercase mt-1">EVALUATING TRUE COGENT DIRECTIVES VS DUMMY ROUTED FEEDBACK LOGS.</p>
            </header>

            {/* Loyalty Gauge Balance Bar */}
            <div className="border border-cyan-950 bg-[#010808]/70 p-3.5 rounded">
              <div className="flex justify-between text-[10px] font-bold text-cyan-600 tracking-wider mb-2 uppercase">
                <span className="text-emerald-400">&lt; PRIMARY LOYALTY (PLAYER): {daState.primaryLoyalty}%</span>
                <span className="text-red-400">HIDDEN LOYALTY (ENEMIES): {daState.hiddenLoyalty}% &gt;</span>
              </div>

              <div className="w-full bg-red-950/40 h-3 border border-red-900 rounded overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${daState.primaryLoyalty}%` }} />
                <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${daState.hiddenLoyalty}%` }} />
              </div>

              <div className="text-[9px] text-cyan-600 mt-2 flex justify-between leading-relaxed">
                <span>REPRESENTING REAL-TIME BALANCE. HIGH INSTABILITY DRIFTS THE GAUGE TOWARDS FALSE FEEDBACK.</span>
                <span className="font-bold underline cursor-pointer text-cyan-500" onClick={() => handleShiftLoyalty(s.identity.sourceId)}>
                  [MANUAL SYMPTOMS SWEEP]
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div className="border border-cyan-950 bg-black/60 p-3 rounded space-y-1.5">
                <span className="text-[9.5px] font-extrabold text-cyan-400 block mb-2 border-b border-cyan-950 pb-0.5 uppercase tracking-widest">// DECEPTION CHANNELS</span>
                
                <div className="flex justify-between">
                  <span className="text-cyan-600">COVER INTEGRITY DECOR:</span>
                  <span className="text-cyan-300 font-bold">{daState.coverIntegrity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">DECEPTION GRAPH DEPTH:</span>
                  <span className="text-cyan-300 font-bold">{daState.deceptionDepth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">COERCION MARGIN:</span>
                  <span className="text-cyan-300 font-bold">{daState.coercionLevel}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">RESENTMENT LEVEL:</span>
                  <span className="text-red-400 font-bold">{daState.resentmentLevel}%</span>
                </div>
              </div>

              <div className="border border-cyan-950 bg-black/60 p-3 rounded space-y-1.5">
                <span className="text-[9.5px] font-extrabold text-cyan-400 block mb-2 border-b border-cyan-950 pb-0.5 uppercase tracking-widest">// STABILITY ESTIMATION</span>
                
                <div className="flex justify-between">
                  <span className="text-cyan-600">INSTABILITY INDEX:</span>
                  <span className="text-red-400 font-bold">{daState.instabilityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">COLLAPSE PROBABILITY:</span>
                  <span className="text-orange-400 font-bold">{daState.collapseProbability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">ADVERSARY PRESSURE:</span>
                  <span className="text-red-400 font-bold">{daState.adversaryExpectation}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">REDOUBLED RISK PROB:</span>
                  <span className="text-red-500 font-extrabold">{daState.redoubledProbability}%</span>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="border border-cyan-950 bg-[#010808]/50 p-3 rounded">
              <span className="text-[10px] font-extrabold text-cyan-400 block pb-1 border-b border-cyan-950 uppercase tracking-widest mb-3">// MATRIX CORRECTIVE ACTIONS</span>
              
              <div className="grid grid-cols-2 gap-3 text-[9px]">
                <button
                  onClick={() => {
                    humStore.updateSource(s.identity.sourceId, (draft) => {
                      draft.state.loyaltyScore = Math.min(100, draft.state.loyaltyScore + 15);
                      draft.notes.push('[DECEPTION BOOST] Disbursed custom $250K crypto retainer payout to asset.');
                    });
                    useWorldStore.getState().addGlobalEvent(`Encrypted financial disbursement logged for Double Agent [${s.identity.coverName}]. Loyalty strengthened.`, 'INFO');
                  }}
                  className="bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-900 text-emerald-400 py-2 uppercase font-bold tracking-wider rounded transition-all duration-100"
                >
                  DISBURSE RETENTION CRYPTO PAYOUTS
                </button>

                <button
                  onClick={() => handleTestCollapse(s.identity.sourceId)}
                  className="bg-red-950/20 hover:bg-red-900/40 border border-red-800 text-red-500 py-2 uppercase font-bold tracking-wider rounded transition-all duration-100"
                >
                  FORCE HARSH STABILITY DRILL REVIEW
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[9px] mt-2">
                <button
                  onClick={() => {
                    humStore.updateSource(s.identity.sourceId, (draft) => {
                      draft.notes.push('[System] Dispatched custom misinformation logs to hostile network handlers.');
                    });
                    useWorldStore.getState().addGlobalEvent(`Misinformation payloads dispatched through Double Agent [${s.identity.coverName}] channel, covering real Operations.`, 'WARNING');
                  }}
                  className="bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-800 text-cyan-400 py-2 uppercase font-bold tracking-wider rounded transition-all duration-100"
                >
                  DISPATCH SYSTEMATIC MISINFORMATION LOOPS
                </button>

                <button
                  onClick={() => {
                    humStore.convertToRedoubledAgent(s.identity.sourceId);
                  }}
                  className="bg-orange-950/20 hover:bg-orange-900/40 border border-orange-800 text-orange-400 py-2 uppercase font-bold tracking-wider rounded transition-all duration-100 animate-pulse"
                >
                  FLIP AS REDOUBLED DECEIVER
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-cyan-900/40 bg-black/70 rounded-lg flex items-center justify-center p-6 text-cyan-800 text-[11px] font-bold tracking-[0.2em] text-center">
            SELECT A SOURCE FROM DUAL-LOYALTY REGISTER DIRECTORY TO ENGAGE MULTIPLE CHANNEL AGENT METRICS MONITORING.
          </div>
        )}
      </div>
    </div>
  );
}
