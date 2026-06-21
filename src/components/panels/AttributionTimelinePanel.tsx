import React, { useState } from 'react';
import { useTargetedOperationsStore } from '../../store/targetedOperationsStore';

export default function AttributionTimelinePanel() {
  const opStore = useTargetedOperationsStore();
  const cases = Object.values(opStore.attributionCases);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const activeCase = selectedCaseId ? opStore.attributionCases[selectedCaseId] : (cases[0] || null);

  const handleInjectFalseFlag = () => {
    if (!activeCase) return;
    opStore.challengeAttributionCase(activeCase.caseId, {
      sourceType: 'FORENSICS',
      description: 'Routing server arrays updated with spoofed cryptographic headers aligned with third-party signatures.',
      credibilityScore: 80,
      weight: 75,
      associatedArtifacts: ['decoy_routing_table']
    });
  };

  const handleInvestigateAdd = () => {
    if (!activeCase) return;
    opStore.addAttributionEvidence(activeCase.caseId, {
      sourceType: 'FININT',
      description: 'Financial wire logs trace payments directly to shell front entities registered in offshore bank networks.',
      credibilityScore: 70,
      weight: 60,
      associatedArtifacts: ['wire_transit_header']
    });
  };

  const handleResolve = () => {
    if (!activeCase) return;
    opStore.resolveAttributionCase(activeCase.caseId);
  };

  return (
    <div className="flex-1 bg-[#010708] border border-[#003c4a] p-4 font-mono text-xs flex flex-col h-full rounded shadow-[0_0_20px_rgba(0,100,120,0.1)]">
      {/* Header */}
      <div className="border-b border-[#003c4a] pb-2 mb-3 flex justify-between items-center shrink-0">
        <h3 className="text-amber-500 font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-500 animate-pulse rounded-full" />
          ATTRIBUTION & FORENSICS TRACKER
        </h3>
        <span className="text-[9px] text-[#006e87] uppercase font-bold text-amber-600">COUNTER-INTELLIGENCE MATRIX</span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left side: Case selectors */}
        <div className="col-span-4 border-r border-[#003c4a]/30 pr-3 flex flex-col min-h-0">
          <span className="text-[10px] text-amber-500/70 font-bold uppercase tracking-wider mb-2">ACTIVE FORENSICS DOSSIERS</span>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {cases.length === 0 ? (
              <div className="text-gray-600 text-center py-8">
                No forensic cases registered on the active grid yet. Execute an operation to open a tracking trace.
              </div>
            ) : (
              (cases || []).map((c) => {
                const isSelected = selectedCaseId === c.caseId || (!selectedCaseId && activeCase?.caseId === c.caseId);
                return (
                  <button
                    id={`case-btn-${c.caseId}`}
                    key={c.caseId}
                    onClick={() => setSelectedCaseId(c.caseId)}
                    className={`w-full text-left p-2 border transition-all flex flex-col hover:bg-[#002f3c]/20
                      ${isSelected ? 'border-amber-500 bg-amber-950/25 text-white' : 'border-[#003c4a]/40 bg-black/60 text-amber-500/60'}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold text-[11px] uppercase">{c.operationType}</span>
                      <span className={`text-[8px] font-bold px-1 uppercase ${c.isResolved ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-400'}`}>
                        {c.isResolved ? 'RESOLVED' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between w-full text-[9px] text-gray-500 mt-1">
                      <span>ID: {c.caseId}</span>
                      <span>Level: <span className="text-amber-500 font-extrabold">{c.phase}</span></span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right side: Case details panel */}
        <div className="col-span-8 flex flex-col min-h-0">
          {activeCase ? (
            <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
              {/* Header metrics */}
              <div className="border border-amber-900 bg-black/80 p-3 flex justify-between items-center relative overflow-hidden">
                <div className="space-y-1">
                  <div className="text-[8px] text-amber-500/60 font-bold uppercase tracking-widest">CLASSIFIED FORENSIC DEBRIS</div>
                  <h4 className="text-white font-extrabold text-[13px] uppercase">{activeCase.operationType} TRACE RECORD</h4>
                  <div className="text-[10px] text-gray-400 flex gap-3 font-mono">
                    <span>Case ID: <strong>{activeCase.caseId}</strong></span>
                    <span>Confidence: <strong className="text-amber-500">{activeCase.confidence}%</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-gray-500 font-bold block mb-0.5">CURRENT DIAGNOSTIC LEVEL</span>
                  <span id="case-phase-display" className="text-amber-400 font-extrabold text-[13px] uppercase tracking-wide bg-amber-950/30 border border-amber-800/40 px-2 py-0.5">
                    {activeCase.phase}
                  </span>
                </div>
              </div>

              {/* Progress gauge confidence */}
              <div className="p-2 border border-amber-900/40 bg-amber-950/10 rounded">
                <div className="flex justify-between text-[9px] mb-1 font-bold">
                  <span className="text-amber-500/70">PROBABLE SPONSOR ASSOCIATION</span>
                  <span className="text-amber-400">US NATION CONFIDENCE: {activeCase.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-black/60 rounded border border-amber-900/20 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400" style={{ width: `${activeCase.confidence}%` }} />
                </div>
              </div>

              {/* Sponsor percentages & falsehoods bento split */}
              <div className="grid grid-cols-2 gap-3 min-h-0 flex-1">
                {/* Collected Evidence Logs */}
                <div className="border border-[#003c4a]/30 p-2.5 bg-black/30 flex flex-col h-full min-h-0">
                  <span className="text-[9px] text-[#00d0ff] uppercase font-bold tracking-widest border-b border-[#003c4a]/20 pb-1 mb-2 block">
                    FORENSIC EVIDENCE SPECIMENS ({activeCase.evidencePieces.length})
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none scrollbar-thin">
                    {(activeCase.evidencePieces || []).map((e, idx) => (
                      <div key={idx} className="border border-cyan-900/30 p-2 bg-cyan-950/10 text-[9px]">
                        <div className="flex justify-between uppercase font-bold text-[8px] text-[#00d0ff]/75 mb-1">
                          <span>{e.sourceType} SPECIMEN</span>
                          <span>T-{e.tickAdded}</span>
                        </div>
                        <p className="text-gray-300 leading-tight mb-1">{e.description}</p>
                        <div className="text-[8px] text-gray-500 flex justify-between font-mono">
                          <span>Credibility: {e.credibilityScore}</span>
                          <span>Weight: {e.weight}</span>
                        </div>
                      </div>
                    ))}
                    {activeCase.evidencePieces.length === 0 && (
                      <span className="text-gray-600 block text-center py-6 text-[10px]">No core prosecution forensic evidence isolated yet.</span>
                    )}
                  </div>
                </div>

                {/* Cyber Deception / Counter-trace */}
                <div className="border border-amber-950/30 p-2.5 bg-black/30 flex flex-col h-full min-h-0">
                  <span className="text-[9px] text-amber-500 uppercase font-bold tracking-widest border-b border-amber-950/20 pb-1 mb-2 block">
                    INJECTED FALSE DECORATIONS ({activeCase.contradictoryEvidence.length})
                  </span>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none scrollbar-thin">
                    {(activeCase.contradictoryEvidence || []).map((e, idx) => (
                      <div key={idx} className="border border-amber-900/30 p-2 bg-amber-950/10 text-[9px]">
                        <div className="flex justify-between uppercase font-bold text-[8px] text-amber-500/75 mb-1">
                          <span>DECEPTION INJECTION</span>
                          <span>T-{e.tickAdded}</span>
                        </div>
                        <p className="text-gray-300 leading-tight mb-1">{e.description}</p>
                        <div className="text-[8px] text-gray-500 flex justify-between font-mono">
                          <span>Credibility: {e.credibilityScore}</span>
                          <span>Dilation: -{Math.floor(e.credibilityScore * (e.weight / 100.0) * 0.5)} pts</span>
                        </div>
                      </div>
                    ))}
                    {activeCase.contradictoryEvidence.length === 0 && (
                      <span className="text-gray-600 block text-center py-6 text-[10px]">No decoy patterns uploaded. Forensic path remains clear.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Journal chronological timeline */}
              <div className="border border-[#003c4a]/20 p-2.5 bg-black/45 space-y-1.5 shrink-0 max-h-[100px] overflow-y-auto rounded scrollbar-thin">
                <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1">CHRONOLOGICAL INVESTIGATIONAL JOURNAL:</span>
                {(activeCase.chronologicalJournal || []).map((log, idx) => (
                  <div key={idx} className="text-[9px] text-[#00c3ff]/75 leading-snug border-l border-cyan-800/40 pl-1.5 font-mono">
                    {log}
                  </div>
                ))}
              </div>

              {/* Case Action buttons for Counter-intel */}
              <div className="border border-[#003c4a]/40 bg-[#001014] p-3 flex justify-between items-center shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block">CASE VERDICT WORKFLOW</span>
                  <span className="text-gray-400 font-bold">Sponsor Prob: {activeCase.possibleSponsors.find(s=>s.countryId==='US')?.probability || 0}% US, 20% RU, 20% CN</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="evidence-inject-contradictory"
                    className="px-2.5 py-1.5 border border-amber-500 text-amber-500 font-extrabold text-[9px] hover:bg-amber-500/20 rounded active:scale-95 transition-all"
                    onClick={handleInjectFalseFlag}
                  >
                    FABRICATE SPOOFED CELL SIGNATURES
                  </button>
                  <button
                    id="case-escalate-evidence"
                    className="px-2.5 py-1.5 border border-[#00d0ff] text-[#00d0ff] font-extrabold text-[9px] hover:bg-[#00d0ff]/20 rounded active:scale-95 transition-all"
                    onClick={handleInvestigateAdd}
                  >
                    DISCOVER TRACE WIRE LOGS
                  </button>
                  <button
                    id="case-action-resolve"
                    disabled={activeCase.isResolved}
                    className={`px-3 py-1.5 font-extrabold text-[9px] rounded transition-all active:scale-95
                      ${activeCase.isResolved 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-transparent' 
                        : 'bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}
                    onClick={handleResolve}
                  >
                    RESOLVE CASE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#003c4a]/30 rounded bg-black/25 p-8 text-center">
              <svg className="w-9 h-9 text-amber-800/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h5 className="text-amber-700/80 font-bold uppercase tracking-wider mb-1">NO FORENSIC CASES IN RECON</h5>
              <p className="text-gray-600 max-w-sm text-[10px] leading-relaxed">
                Execute tactical targeted operations or let adversarial units attempt intrusions to open active cyber investigation timeline records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
