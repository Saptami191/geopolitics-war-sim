import React from 'react';
import { useTargetedOperationsStore } from '../../store/targetedOperationsStore';
import { useSigintStore } from '../../store/sigintStore';
import { useFinintStore } from '../../store/finintStore';
import { useWorldStore } from '../../store/worldStore';

export default function TargetDossierPanel() {
  const opStore = useTargetedOperationsStore();
  const sigintStore = useSigintStore();
  const finintStore = useFinintStore();
  const worldStore = useWorldStore();

  const selectedTargetId = opStore.selectedTargetId;
  const dossier = selectedTargetId ? opStore.dossiers[selectedTargetId] : null;

  // Compile all available signals/actors to select as potential targets
  const sigintTargets = Object.values(sigintStore.targets);
  const finintActors = finintStore.actors;

  // Consolidate target selection list
  const consolidatedTargets = React.useMemo(() => {
    const list: { id: string; name: string; source: 'SIGINT' | 'FININT' | 'OTHER' }[] = [];
    sigintTargets.forEach(t => {
      if (!list.some(item => item.id === t.id)) {
        list.push({ id: t.id, name: t.name, source: 'SIGINT' });
      }
    });
    finintActors.forEach(a => {
      if (!list.some(item => item.id === a.id)) {
        list.push({ id: a.id, name: a.name, source: 'FININT' });
      }
    });
    if (list.length === 0) {
      // Fallback seeds if lists are currently empty for demo
      list.push({ id: 'CN', name: 'CN Eastern command base', source: 'OTHER' });
      list.push({ id: 'RU', name: 'RU Black Sea command unit', source: 'OTHER' });
      list.push({ id: 'IR', name: 'IR Natanz centrifuge compound', source: 'OTHER' });
    }
    return list;
  }, [sigintTargets, finintActors]);

  const handleSelectTarget = (id: string) => {
    opStore.setSelectedTargetId(id);
    opStore.buildTargetDossier(id);
  };

  const scoreValue = dossier ? opStore.scoreTargetValue(dossier) : 0;
  const scoreRisk = dossier ? opStore.scoreTargetRisk(dossier) : 0;

  return (
    <div className="flex-1 bg-[#02080a] border border-[#003c4a] p-4 font-mono text-xs flex flex-col h-full rounded shadow-[0_0_20px_rgba(0,100,120,0.1)]">
      {/* Panel title */}
      <div className="border-b border-[#003c4a] pb-2 mb-3 flex justify-between items-center shrink-0">
        <h3 className="text-[#00d0ff] font-bold tracking-widest text-[11px] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#00d0ff] animate-pulse rounded-full" />
          TARGET DOSSIER SYSTEM
        </h3>
        <span className="text-[9px] text-[#006e87] uppercase font-bold">BLACK LANTERN MODULE</span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left column: Target Selector List */}
        <div className="col-span-4 border-r border-[#003c4a]/30 pr-3 flex flex-col min-h-0">
          <div className="text-[10px] text-[#0086a3] font-bold mb-2 uppercase tracking-wide">CONFIRMED ACTIVE INTEL RECORDS</div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {(consolidatedTargets || []).map((t) => {
              const active = selectedTargetId === t.id;
              const hasCompiledDossier = !!opStore.dossiers[t.id];
              return (
                <button
                  id={`target-selector-btn-${t.id}`}
                  key={t.id}
                  onClick={() => handleSelectTarget(t.id)}
                  className={`w-full text-left p-2 border transition-all flex flex-col hover:bg-[#002f3c]/20
                    ${active ? 'border-[#00ffff] bg-[#002f3c]/40 text-[#ffffff]' : 'border-[#003c4a]/40 bg-black/60 text-[#00d0ff]/70'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold truncate text-[11px]">{t.name}</span>
                    <span className="text-[8px] px-1 border border-[#00d0ff]/30 text-[#00d0ff] scale-90">{t.source}</span>
                  </div>
                  <div className="flex justify-between items-center w-full text-[9px] text-gray-500 mt-1">
                    <span>ID: {t.id}</span>
                    {hasCompiledDossier && (
                      <span className="text-emerald-500 flex items-center gap-1">● COMPILED</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Target Dossier Viewer */}
        <div className="col-span-8 flex flex-col min-h-0">
          {dossier ? (
            <div className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-4">
              {/* Target Header Status */}
              <div className="border border-[#003c4a] bg-black/80 p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 py-0.5 px-2 text-[9px] font-bold bg-[#00ffff]/15 text-[#00ffff] tracking-widest border-l border-b border-[#003c4a]">
                  {dossier.targetType}
                </div>
                <div className="text-[9px] text-[#00a3c2] uppercase font-bold tracking-widest mb-1">CLASSIFIED DOSSIER</div>
                <h4 className="text-white font-extrabold text-[15px] tracking-wide mb-1 uppercase">{dossier.name}</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span>Affiliation: <strong className="text-cyan-400">{dossier.affiliationCountryId}</strong></span>
                  <span>Last Observed Tick: <strong className="text-cyan-400 font-mono">T-{dossier.lastObservedTick}</strong></span>
                </div>
              </div>

              {/* Progress Gauges and scores */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="p-2 border border-[#003c4a]/40 bg-[#00141a]/40 flex flex-col justify-between">
                  <div className="text-[9px] text-[#008ba8] uppercase font-bold mb-1">ANALYST CONFIDENCE SCORE</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-[13px] ${dossier.confidenceScore > 75 ? 'text-emerald-400' : 'text-amber-500'}`}>{dossier.confidenceScore}%</span>
                    <span className="text-[9px] text-gray-500">THRESHOLD &gt; 70%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/60 rounded border border-[#003c4a]/30 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400" style={{ width: `${dossier.confidenceScore}%` }} />
                  </div>
                </div>

                <div className="p-2 border border-[#003c4a]/40 bg-[#00141a]/40 flex flex-col justify-between">
                  <div className="text-[9px] text-[#008ba8] uppercase font-bold mb-1">SURVEILLANCE VISIBILITY</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-[12px] uppercase ${dossier.visibilityTier === 'CONFIRMED' ? 'text-emerald-400' : 'text-amber-500'}`}>{dossier.visibilityTier}</span>
                    <span className="text-[8px] border border-cyan-800/40 px-1 text-cyan-600 font-bold">SOURCE VERIFIED</span>
                  </div>
                  <div className="flex gap-1 h-2.5 items-center">
                    <div className="h-1.5 flex-1 bg-cyan-900/30 border border-[#003c4a]/40 rounded-sm overflow-hidden">
                      <div className="h-full bg-[#00ffff]" style={{ width: dossier.visibilityTier === 'CONFIRMED' || dossier.visibilityTier === 'INFERRED' ? '100%' : '0%' }} />
                    </div>
                    <div className="h-1.5 flex-1 bg-cyan-900/30 border border-[#003c4a]/40 rounded-sm overflow-hidden">
                      <div className="h-full bg-[#00ffff]" style={{ width: dossier.visibilityTier === 'CONFIRMED' ? '100%' : '0%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pattern of Life profile & notes */}
              <div className="border border-[#003c4a]/30 p-2.5 bg-black/30 space-y-2">
                <div className="text-[9px] text-[#00d0ff] uppercase font-bold tracking-widest border-b border-[#003c4a]/20 pb-1">PATTERN-OF-LIFE ANALYSIS</div>
                <p className="text-gray-300 leading-relaxed text-[10px]">{dossier.patternOfLifeSummary}</p>
                <div className="text-[9px] text-cyan-700 font-bold">SURVEILLANCE GEOGRAPHIC LOGS:</div>
                <ul className="space-y-1 pl-2 text-[10px] text-gray-400 list-disc list-inside">
                  {(dossier.locationHistory || []).map((loc, idx) => (
                    <li key={idx} className="font-mono text-[9px]">{loc}</li>
                  ))}
                </ul>
              </div>

              {/* Threat assessments bento row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="border border-[#003c4a]/30 bg-black/50 p-2 text-center h-full flex flex-col justify-between">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block mb-1">OPERATIONAL VALUE</span>
                  <span id="dossier-calc-opval" className="text-white font-extrabold text-[15px]">{scoreValue}</span>
                  <span className="text-[8px] text-[#00a2cc]/60 mt-1 uppercase">MAX 1000</span>
                </div>
                <div className="border border-[#003c4a]/30 bg-black/50 p-2 text-center h-full flex flex-col justify-between">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block mb-1">PROTECTION LEVEL</span>
                  <span id="dossier-protection-lvl" className="text-amber-500 font-extrabold text-[15px]">{dossier.protectionLevel}%</span>
                  <span className="text-[8px] text-[#00a2cc]/60 mt-1 uppercase">DEFENSE INDEX</span>
                </div>
                <div className="border border-[#003c4a]/30 bg-black/50 p-2 text-center h-full flex flex-col justify-between">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block mb-1">EXPOSURE RISK</span>
                  <span id="dossier-exposure-risk" className="text-cyan-400 font-extrabold text-[15px]">{dossier.exposureRisk}%</span>
                  <span className="text-[8px] text-[#00a2cc]/60 mt-1 uppercase">SURVEILLANCE</span>
                </div>
                <div className="border border-[#003c4a]/30 bg-black/50 p-2 text-center h-full flex flex-col justify-between">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block mb-1">DOSSIER FRESHNESS</span>
                  <span id="dossier-freshness-pct" className={`font-extrabold text-[15px] ${dossier.dossierFreshness < 50 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>{dossier.dossierFreshness}%</span>
                  <span className="text-[8px] text-[#00a2cc]/60 mt-1 uppercase">DECAY WINDOW</span>
                </div>
              </div>

              {/* Actionability State Indicators */}
              <div className="border border-[#003c4a]/50 p-3 bg-[#001c24]/30 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 uppercase font-bold">Dossier Actionability Assessment:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dossier.isActionable ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-red-500'}`} />
                      <span className={`font-bold text-[11px] ${dossier.isActionable ? 'text-emerald-400' : 'text-red-500'}`}>
                        {dossier.isActionable ? 'ACTIONABLE DOSSIER' : 'UNACTIONABLE — CONFIDENCE BELOW 70%'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="action-force-actionable"
                      className="px-2 py-1 border border-cyan-500 text-cyan-400 text-[9px] font-bold hover:bg-cyan-500/20 active:scale-95 transition-all"
                      onClick={() => opStore.markDossierActionable(dossier.targetId)}
                    >
                      FORCE ACTIONABLE
                    </button>
                    <button
                      id="action-mark-stale"
                      className="px-2 py-1 border border-red-500 text-red-500 text-[9px] font-bold hover:bg-red-500/10 active:scale-95 transition-all"
                      onClick={() => opStore.markDossierStale(dossier.targetId)}
                    >
                      MARK STALE
                    </button>
                    <button
                      id="action-refresh-dossier"
                      className="px-2 py-1 border border-[#00ffc8] text-[#00ffc8] text-[9px] font-bold hover:bg-[#00ffc8]/10 active:scale-95 transition-all"
                      onClick={() => opStore.refreshTargetDossier(dossier.targetId)}
                    >
                      REFRESH DATA
                    </button>
                  </div>
                </div>
              </div>

              {/* Analyst notes & provenance markers */}
              <div className="text-[9px] text-gray-500 border-t border-[#003c4a]/20 pt-2 leading-relaxed">
                <strong>ANALYST BRIEFNOTE:</strong> {dossier.analystNotes}
                <div className="mt-1 flex gap-3 text-[8px] uppercase tracking-wider text-cyan-800">
                  <span>PROVENANCE: {dossier.linkedIntelligenceSources.join(', ')}</span>
                  <span>RECORD: COM_SEC_SYS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#003c4a]/30 rounded bg-black/25 p-8 text-center">
              <svg className="w-10 h-10 text-cyan-800/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h5 className="text-cyan-700 font-extrabold tracking-wider uppercase mb-1">SURVEILLANCE APERTURE SLEWING</h5>
              <p className="text-gray-600 max-w-sm text-[10px] leading-relaxed">
                Select an active target identifier from left intelligence registers to lock and synthesize tactical operational dossiers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
