import React, { useState } from 'react';
import { useHumintStore } from '../../store/humintStore';
import { useWorldStore } from '../../store/worldStore';
import { SourceCase, SourceType, SourceLifecyclePhase } from '../../types';

export default function SourceRegistryPanel() {
  const humStore = useHumintStore();
  const selectedSourceId = humStore.selectedSourceId;
  const source = selectedSourceId ? humStore.sources[selectedSourceId] : null;

  const [taskInput, setTaskInput] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateService, setCandidateService] = useState('GRU');
  const [candidateCountry, setCandidateCountry] = useState('RU');
  const [candidateAccess, setCandidateAccess] = useState('HIGH');
  const [candidateType, setCandidateType] = useState<SourceType>('MOLE');

  const handlerList = Object.values(humStore.handlers);

  const handleSpotCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName) return;
    const cleanId = `src_${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    humStore.spotPotentialSource({
      sourceId: cleanId,
      coverName: candidateName.toUpperCase(),
      hostileService: candidateService,
      hostileCountry: candidateCountry,
      accessLevel: candidateAccess,
      sourceType: candidateType
    });
    setCandidateName('');
  };

  const getPhaseColor = (phase: SourceLifecyclePhase) => {
    switch (phase) {
      case 'SPOTTED': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      case 'ASSESSED': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
      case 'DEVELOPING': return 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10';
      case 'RECRUITED': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case 'HANDLED': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'TASKED': return 'text-pink-500 border-pink-500/30 bg-pink-500/10 animatedPulse';
      case 'EXFILTRATED': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'BURNED': return 'text-red-500 border-red-500/30 bg-red-500/10 font-bold';
      case 'TERMINATED': return 'text-zinc-500 border-zinc-500/30 bg-zinc-500/10';
      default: return 'text-[#008ba8] border-[#008ba8]/30 bg-[#008ba8]/10';
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full overflow-hidden text-[#00ffcc] font-mono">
      {/* Target & Source Registry Directory */}
      <div className="col-span-4 border border-cyan-900/60 bg-black/80 rounded-lg p-3 flex flex-col justify-between h-full min-h-0">
        <div className="flex flex-col min-h-0">
          <h3 className="text-[11px] font-extrabold text-cyan-400 bg-cyan-950/20 p-2 border border-cyan-900/40 rounded uppercase tracking-widest mb-3">
            // OPERATIONAL REGISTER (ACTIVE SOURCES)
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
            {Object.values(humStore.sources).map((s) => {
              const active = selectedSourceId === s.identity.sourceId;
              const burnL = humStore.estimateSourceBurnLikelihood(s.identity.sourceId);
              const yieldP = humStore.calculateYieldPotential(s.identity.sourceId);
              return (
                <button
                  key={s.identity.sourceId}
                  onClick={() => humStore.setSelectedSourceId(s.identity.sourceId)}
                  className={`w-full text-left p-2.5 border transition-all rounded duration-150 flex flex-col gap-1.5 cursor-pointer
                    ${active 
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)] text-cyan-200' 
                      : 'border-cyan-900/30 bg-[#020b0b]/60 text-cyan-700 hover:border-cyan-700 hover:text-cyan-400'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-xs font-mono tracking-wider">
                      {s.identity.coverName} <span className="text-[9px] text-cyan-500/60 font-medium">({s.identity.sourceType})</span>
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 border uppercase tracking-wider rounded ${getPhaseColor(s.identity.currentPhase)}`}>
                      {s.identity.currentPhase}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] text-cyan-500/50 mt-0.5">
                    <span>SECTOR: {s.identity.hostileService} ({s.identity.hostileCountry})</span>
                    <span>ACCESS: <span className="text-cyan-400">{s.identity.accessLevel}</span></span>
                  </div>

                  {s.identity.currentPhase !== 'BURNED' && s.identity.currentPhase !== 'TERMINATED' && (
                    <div className="grid grid-cols-2 gap-2 text-[9px] mt-1 pt-1 border-t border-cyan-950/20">
                      <div className="flex justify-between">
                        <span>SURVIVAL:</span>
                        <span className={s.state.survivabilityScore < 40 ? 'text-red-400' : 'text-emerald-400'}>
                          {s.state.survivabilityScore}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>BURN LIKELIHOOD:</span>
                        <span className={burnL > 50 ? 'text-red-400' : 'text-cyan-400'}>
                          {burnL}%
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spot New Candidate Form */}
        <form onSubmit={handleSpotCandidate} className="border-t border-cyan-900/40 pt-3 mt-3 flex flex-col gap-2 shrink-0">
          <span className="text-[10px] text-cyan-500 uppercase tracking-wider font-extrabold bg-[#001014] p-1 border border-cyan-950 px-2 rounded">
            // INTEL SWEEP: SPOT SPECIFIC FILE
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="COVER NAME"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="px-2 py-1 bg-black border border-cyan-900 text-cyan-400 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 text-[10px] tracking-wider rounded"
            />
            <input
              type="text"
              placeholder="SERVICE (e.g. GRU)"
              value={candidateService}
              onChange={(e) => setCandidateService(e.target.value)}
              className="px-2 py-1 bg-black border border-cyan-900 text-cyan-400 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 text-[10px] tracking-wider rounded"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={candidateCountry}
              onChange={(e) => setCandidateCountry(e.target.value)}
              className="bg-black border border-cyan-900 text-cyan-400 text-[9px] py-1 px-1.5 focus:outline-none rounded"
            >
              <option value="RU">RUSSIA</option>
              <option value="CN">CHINA</option>
              <option value="IR">IRAN</option>
              <option value="KP">N.KOREA</option>
            </select>
            <select
              value={candidateAccess}
              onChange={(e) => setCandidateAccess(e.target.value)}
              className="bg-black border border-cyan-900 text-cyan-400 text-[9px] py-1 px-1.5 focus:outline-none rounded"
            >
              <option value="LOCAL">LOCAL</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CORE">CORE</option>
            </select>
            <select
              value={candidateType}
              onChange={(e) => setCandidateType(e.target.value as any)}
              className="bg-black border border-cyan-900 text-cyan-400 text-[9px] py-1 px-1.5 focus:outline-none rounded"
            >
              <option value="MOLE">MOLE</option>
              <option value="DOUBLE_AGENT">DOUBLE_G</option>
              <option value="DEFECTOR">DEFECTOR</option>
              <option value="WALK_IN">WALK_IN</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800 hover:border-cyan-400 tracking-widest text-[9px] uppercase font-bold py-1.5 transition-all rounded duration-100"
          >
            INITIALIZE BACKGROUND MONITORING
          </button>
        </form>
      </div>

      {/* Workspace Display Workspace panel */}
      <div className="col-span-8 flex flex-col uppercase text-xs h-full min-h-0 gap-4">
        {source ? (
          <div className="flex-1 border border-cyan-900/60 bg-black/90 p-4 rounded-lg flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Header Identity Display */}
            <header className="flex justify-between items-start border-b border-cyan-900/40 pb-3 shrink-0">
              <div>
                <h4 className="text-sm font-extrabold text-cyan-400 flex items-center gap-2 font-mono">
                  CLASSIFIED FILE: {source.identity.coverName} 
                  <span className="text-[10px] text-cyan-600">[{source.identity.sourceId}]</span>
                </h4>
                <div className="text-[10px] font-bold text-cyan-700/80 mt-1">
                  TRUE ID: <span className="text-cyan-500">{source.identity.trueIdentity || 'NON-OFFICIAL COVER OVERLAY'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[9px] text-[#00c8ff] font-bold mt-1 max-w-[320px]">
                  <span>ADVERSARY: {source.identity.hostileService} ({source.identity.hostileCountry})</span>
                  <span>PARADIGM: <span className="text-cyan-400">{source.identity.sourceType}</span></span>
                </div>
              </div>
              <span className={`text-[10px] px-3 py-1 border uppercase tracking-wider rounded font-extrabold ${getPhaseColor(source.identity.currentPhase)}`}>
                PHASE: {source.identity.currentPhase}
              </span>
            </header>

            {/* Core Metrics & Actions Grid */}
            <div className="grid grid-cols-2 gap-4 min-h-0 flex-1">
              {/* Profile Variables List */}
              <div className="border border-cyan-950 bg-[#010606] rounded p-3 overflow-y-auto scrollbar-thin">
                <span className="text-[10px] font-extrabold text-cyan-500 block border-b border-cyan-950 pb-1 mb-2 tracking-widest">
                  // BIOMETRIC AND COVERT PARADIGM STATES
                </span>

                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-600">LOYALTY RATING:</span>
                    <span className="font-extrabold text-cyan-300">{source.state.loyaltyScore}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/40 h-1.5 rounded overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${source.state.loyaltyScore}%` }} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-cyan-600">HANDLER MUTUAL TRUST:</span>
                    <span className="font-extrabold text-cyan-300">{source.state.handlerTrustScore}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/40 h-1.5 rounded overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all" style={{ width: `${source.state.handlerTrustScore}%` }} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-cyan-600">COMPROMISE RISK VECTOR:</span>
                    <span className="font-extrabold text-red-400">{source.state.compromiseRisk}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/40 h-1.5 rounded overflow-hidden">
                    <div className="bg-red-500 h-full transition-all" style={{ width: `${source.state.compromiseRisk}%` }} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-cyan-600">SURVIVABILITY MARGIN:</span>
                    <span className="font-extrabold text-emerald-400">{source.state.survivabilityScore}%</span>
                  </div>
                  <div className="w-full bg-cyan-950/40 h-1.5 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${source.state.survivabilityScore}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-cyan-950/40 text-[9px]">
                    <div className="flex justify-between text-cyan-600">
                      <span>YIELD POTENTIAL:</span>
                      <span className="text-cyan-300">{humStore.calculateYieldPotential(source.identity.sourceId)}%</span>
                    </div>
                    <div className="flex justify-between text-cyan-600">
                      <span>TASK PRESSURE:</span>
                      <span className="text-red-400">{humStore.calculateTaskingPressure(source.identity.sourceId)}%</span>
                    </div>
                    <div className="flex justify-between text-cyan-600">
                      <span>COMPARTMENTATION:</span>
                      <span className="text-cyan-400">{source.state.compartmentationLevel}%</span>
                    </div>
                    <div className="flex justify-between text-cyan-600">
                      <span>TRADECRAFT RISK:</span>
                      <span className="text-red-400">{source.state.tradecraftRisk}%</span>
                    </div>
                    <div className="flex justify-between text-cyan-600">
                      <span>ACCESS COOLDOWN:</span>
                      <span className="text-orange-400">{source.state.accessWindowRemaining} TICKS</span>
                    </div>
                    <div className="flex justify-between text-cyan-600">
                      <span>FRAGILITY INDEX:</span>
                      <span className="text-red-400 font-bold">{humStore.calculateSourceFragility(source.identity.sourceId)}%</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Handler */}
                <div className="mt-4 pt-3 border-t border-cyan-950 text-[10px]">
                  <span className="text-cyan-600 block mb-1.5 uppercase font-extrabold">// ATTACHED CASE HANDLER CASE OFFICER</span>
                  <select
                    id="select-source-handler"
                    value={(() => {
                      const h = handlerList.find(ha => ha.activeSources.includes(source.identity.sourceId));
                      return h ? h.handlerId : '';
                    })()}
                    onChange={(e) => humStore.assignSource(source.identity.sourceId, e.target.value || null)}
                    className="w-full bg-black border border-cyan-900 text-cyan-400 p-1.5 focus:outline-none text-[9px]"
                  >
                    <option value="">UNASSIGNED / INACTIVE MONITOR</option>
                    {(handlerList || []).map(h => (
                      <option key={h.handlerId} value={h.handlerId}>
                        CASE OFFICER: {h.alias} ({h.role}, LOAD: {h.sourceLoad}/3)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Suite & Communications log */}
              <div className="flex flex-col gap-3 h-full min-h-0">
                <div className="border border-cyan-950 bg-[#010606] rounded p-3 shrink-0">
                  <span className="text-[10px] font-extrabold text-cyan-500 block border-b border-cyan-950 pb-1 mb-2 tracking-widest">
                    // TACTICAL INSTRUCTION MODULE
                  </span>

                  {source.identity.currentPhase !== 'BURNED' && source.identity.currentPhase !== 'TERMINATED' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          id="input-task-content"
                          type="text"
                          placeholder="MISSION DECREE OBJECTIVE"
                          value={taskInput}
                          onChange={(e) => setTaskInput(e.target.value)}
                          className="flex-1 px-2 py-1 bg-black border border-cyan-900 text-cyan-400 focus:outline-none text-[10px] font-mono rounded"
                        />
                        <button
                          id="btn-sub-task"
                          onClick={() => {
                            if (!taskInput) return;
                            humStore.taskSource(source.identity.sourceId, taskInput);
                            setTaskInput('');
                          }}
                          className="bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold px-3 py-1 hover:bg-cyan-900 hover:text-cyan-100 transition-all text-[9px] tracking-wider rounded"
                        >
                          TASK
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => humStore.updateSourceRisk(source.identity.sourceId)}
                          className="py-1 border border-cyan-900 hover:border-cyan-400 bg-cyan-950/10 text-cyan-400 hover:text-cyan-200 text-[9px] font-bold uppercase transition-all rounded"
                        >
                          AUDIT TRADECRAFT
                        </button>
                        <button
                          onClick={() => humStore.updateRetroactiveDiscoveryRisk(source.identity.sourceId)}
                          className="py-1 border border-cyan-900 hover:border-cyan-400 bg-cyan-950/10 text-cyan-400 hover:text-cyan-200 text-[9px] font-bold uppercase transition-all rounded"
                        >
                          TRACE CORRELATION
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => humStore.exfiltrateSource(source.identity.sourceId)}
                          className="py-1.5 border border-purple-900 hover:border-purple-400 bg-purple-950/20 text-purple-400 hover:text-purple-200 text-[9px] font-bold uppercase transition-all rounded"
                        >
                          LAUNCH EXFILTRATION
                        </button>
                        <button
                          onClick={() => humStore.burnSource(source.identity.sourceId, 'Self-initiated safety purge regarding imminent risk exposure.')}
                          className="py-1.5 border border-red-900 hover:border-red-400 bg-red-950/20 text-red-400 hover:text-red-200 text-[9px] font-bold uppercase transition-all rounded"
                        >
                          BURN / ARCHIVE
                        </button>
                      </div>

                      <button
                        onClick={() => humStore.terminateSource(source.identity.sourceId)}
                        className="w-full py-1 border border-zinc-900 hover:border-zinc-400 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200 text-[9px] font-bold uppercase transition-all rounded mt-1.5"
                      >
                        RETIRE FILE & SHUT COMM CHANNELS
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-cyan-950/30 text-cyan-700 font-bold bg-[#010808]/50 text-[10px] rounded">
                      FILE DEACTIVATED OR TRUNCATED SECURE DIRECTIVE CHANNELS CLOSED.
                    </div>
                  )}
                </div>

                {/* Handlers notes log list */}
                <div className="flex-1 border border-cyan-950 bg-[#010505] p-3 rounded flex flex-col min-h-0">
                  <span className="text-[10px] font-extrabold text-cyan-500 block border-b border-cyan-950 pb-1 mb-2 tracking-widest shrink-0">
                    // HANDLER CHRONOLOGICAL DIARY LOG
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[9px] text-cyan-600 font-medium">
                    {(source.notes || []).map((n, i) => (
                      <div key={i} className="p-1 bg-[#020b0b]/30 border border-cyan-950/50 rounded leading-relaxed">
                        &gt; {n}
                      </div>
                    ))}
                    {(source.provenance || []).map((p, i) => (
                      <div key={`p-${i}`} className="p-1 bg-[#020b0b]/40 border border-cyan-950/70 rounded text-[#00ff99]/80 leading-relaxed italic">
                        PROVENANCE: {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-cyan-900/40 bg-black/70 rounded-lg flex items-center justify-center p-6 text-center text-cyan-800 text-[11px] font-bold tracking-[0.2em]">
            SELECT CLASSIFIED HUMAN ASSET FILE FROM REGISTER GRID TO WORKSPACE INGRESS COVERT CONTROLS.
          </div>
        )}
      </div>
    </div>
  );
}
