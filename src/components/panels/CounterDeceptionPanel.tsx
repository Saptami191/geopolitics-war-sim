import React from 'react';
import { useDeceptionStore } from '../../store/deceptionStore';

export default function CounterDeceptionPanel() {
  const decStore = useDeceptionStore();
  const selectedCampaign = decStore.selectedCampaignId ? decStore.campaigns[decStore.selectedCampaignId] : null;

  // Findings list for the selected campaign
  const findingsList = selectedCampaign ? (decStore.findings[selectedCampaign.deceptionId] || []) : [];

  const handleAuditCampaign = () => {
    if (!selectedCampaign) return;
    // Explicit check and generate newest findings
    decStore.generateCounterDeceptionFindings(selectedCampaign.deceptionId);
  };

  const getSeverityColor = (sev: number) => {
    if (sev >= 60) return 'text-red-500 bg-red-950/20 border-red-900/40';
    if (sev >= 30) return 'text-amber-500 bg-amber-950/20 border-amber-900/40';
    return 'text-sky-400 bg-sky-950/20 border-sky-900/40';
  };

  return (
    <div className="flex flex-col h-full text-pink-400 font-mono select-none">
      {selectedCampaign ? (
        <div className="grid grid-cols-12 gap-4 h-full min-h-0 flex-1">
          
          {/* List of findings and contradictions detected */}
          <div className="col-span-8 border border-pink-900/40 bg-slate-950/90 rounded-lg p-3.5 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4 overflow-y-auto scrollbar-thin pr-1 flex-1">
              <div className="flex justify-between items-start pb-2 border-b border-pink-900/20">
                <div>
                  <h3 className="text-xs font-extrabold text-pink-100 uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-pink-500 rounded-sm animate-pulse" />
                    // COUNTER-DECEPTION AUDITING LOGS
                  </h3>
                  <p className="text-[10px] text-pink-500/50 mt-0.5 uppercase">
                    Examine planted payloads for tradecraft leaks, structural mismatches, or chronological anomalies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAuditCampaign}
                  className="text-[9px] border border-pink-400/40 bg-pink-950/20 hover:bg-pink-400 hover:text-black py-0.5 px-2 rounded tracking-wider cursor-pointer transition-colors"
                >
                  RUN DEVIATION AUDIT
                </button>
              </div>

              {/* Contradiction list */}
              <div className="space-y-2.5">
                {findingsList.length === 0 ? (
                  <div className="text-center py-10 text-pink-900/50 text-[10px] border border-dashed border-pink-950/40 rounded bg-[#0b0c16]/30">
                    NO ACTIVE CONTRADICTIONS DETECTED IN WORKSPACE LOBBY<br />
                    <span className="text-[9px] font-medium mt-1 inline-block">THE ATTRIBUTION DECOY HAS DEPLOYED NOMINALLY</span>
                  </div>
                ) : (
                  findingsList.map(find => {
                    return (
                      <div key={find.findingId} className={`border rounded p-3 text-[10px] space-y-1.5 ${getSeverityColor(find.severity)}`}>
                        <div className="flex justify-between items-center font-bold pb-1 border-b border-pink-900/10">
                          <span className="uppercase">{find.contradictionType.replace(/_/g, ' ')} [SEV: {find.severity}]</span>
                          <span className="text-pink-500/50 font-normal">TICK: {find.createdTick}</span>
                        </div>
                        <p className="text-pink-200 leading-relaxed">{find.description}</p>
                        <p className="text-[9px] text-pink-400/70 italic bg-black/30 p-1.5 rounded">
                          &gt; ANALYST: {find.analystNote}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Force purge control */}
            <div className="border-t border-pink-900/30 pt-3.5 mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => decStore.markCampaignCompromised(selectedCampaign.deceptionId)}
                className="py-1.5 border border-red-500/40 bg-red-950/20 hover:bg-red-500 hover:text-black font-extrabold text-[10px] text-red-500 rounded cursor-pointer transition-colors text-center uppercase"
              >
                FLAG COMPROMISED (KILL SWITCH)
              </button>
              <button
                type="button"
                onClick={() => decStore.disableCampaign(selectedCampaign.deceptionId)}
                className="py-1.5 border border-pink-500/40 bg-pink-950/20 hover:bg-pink-400 hover:text-black font-extrabold text-[10px] text-pink-300 rounded cursor-pointer transition-colors text-center uppercase"
              >
                DAMPEN OPERATIONAL EMISSION
              </button>
            </div>
          </div>

          {/* Audit Metrics & AI Advisers */}
          <div className="col-span-4 border border-pink-900/40 bg-slate-950/90 rounded-lg p-3.5 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4">
              <h3 className="text-[11px] font-extrabold text-pink-100 uppercase tracking-widest border-b border-pink-900/20 pb-2">
                // COMPROMISE PROBABILITY
              </h3>

              {/* Coherence display stats */}
              <div className="space-y-3.5 text-[10px]">
                <div className="bg-[#160a0f]/80 border border-pink-950/50 p-2.5 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span>OVERALL SUSPICION TREND:</span>
                    <span className="text-red-400 font-bold">{decStore.computeAdversarySuspicion(selectedCampaign.deceptionId)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${decStore.computeAdversarySuspicion(selectedCampaign.deceptionId)}%` }} />
                  </div>
                  <span className="text-[8.5px] text-pink-500/50 mt-1 block">Chance adversary intelligence triggers deep verification probe.</span>
                </div>

                <div className="bg-[#160a0f]/80 border border-pink-950/50 p-2.5 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span>EXPOSURE RATE:</span>
                    <span className="text-pink-400 font-bold">{selectedCampaign.confidence.exposureRisk}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${selectedCampaign.confidence.exposureRisk}%` }} />
                  </div>
                  <span className="text-[8.5px] text-pink-500/50 mt-0.5 block">Natural decay of cover system integrity over duration ticks.</span>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-[#140b0f]/80 border border-pink-955 p-3 rounded space-y-2 text-[10px]">
                <span className="text-pink-400 font-extrabold uppercase block">// MITIGATION STRATEGY ADVISORY</span>
                <p className="text-pink-200 leading-relaxed text-[9.5px]">
                  {decStore.recommendDeceptionAdjustment(selectedCampaign.deceptionId)}
                </p>
              </div>

              {/* Compromise state banner */}
              {selectedCampaign.beliefState === 'REJECTED' && (
                <div className="border border-red-500/60 bg-red-950/40 text-red-100 p-3 rounded text-[10px] space-y-1 py-4 text-center pulse border-2 animate-bounce">
                  <span className="font-extrabold uppercase text-xs block text-red-500">❌ SYSTEM COMPROMISED</span>
                  The adversary possesses definitive counter-evidence. Active redirection campaigns have dissolved. Further plantings under this key signature will automatically fail.
                </div>
              )}
            </div>

            {/* Bottom active state indicator */}
            <div className="text-[9.5px] text-pink-500/40 text-center leading-relaxed border-t border-pink-900/20 pt-3">
              AUDITING UNIT: MIRROR COUNTER INTELLIGENCE<br />
              SYS LEVEL: SECURE CORE ALPHA4
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full text-pink-800/60 uppercase text-[11px] font-bold">
          NO DECEPTION WORKSPACE LOADED. SELECT A CAMPAIGN TO DEPLOY AUDIT SENSORS.
        </div>
      )}
    </div>
  );
}
