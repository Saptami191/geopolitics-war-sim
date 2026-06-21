import React from 'react';
import { useHumintStore } from '../../store/humintStore';
import { useWorldStore } from '../../store/worldStore';
import { SourceCase } from '../../types';

export default function RecruitmentPipelinePanel() {
  const humStore = useHumintStore();
  const sources = Object.values(humStore.sources);

  // Group sources by pipeline phase
  const spotted = sources.filter(s => s.identity.currentPhase === 'SPOTTED');
  const assessed = sources.filter(s => s.identity.currentPhase === 'ASSESSED');
  const developing = sources.filter(s => s.identity.currentPhase === 'DEVELOPING');
  const active = sources.filter(s => ['RECRUITED', 'HANDLED', 'TASKED'].includes(s.identity.currentPhase));

  const handleAdvance = (sourceId: string, currentPhase: string) => {
    if (currentPhase === 'SPOTTED') {
      humStore.assessSource(sourceId);
    } else if (currentPhase === 'ASSESSED') {
      humStore.developSource(sourceId);
    } else if (currentPhase === 'DEVELOPING') {
      humStore.recruitSource(sourceId);
    } else if (currentPhase === 'RECRUITED') {
      humStore.handleSource(sourceId);
    }
  };

  const renderCard = (s: SourceCase) => {
    return (
      <div 
        key={s.identity.sourceId} 
        onClick={() => humStore.setSelectedSourceId(s.identity.sourceId)}
        className="p-3 bg-[#030d0d]/70 border border-cyan-900/60 hover:border-cyan-400 rounded transition-all cursor-pointer text-[#00ffcc] text-[10px] space-y-2 flex flex-col justify-between"
      >
        <div>
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-cyan-300 font-mono tracking-wider">{s.identity.coverName}</span>
            <span className="text-[8px] px-1 bg-cyan-950 border border-cyan-800 text-cyan-400 uppercase tracking-wider rounded">{s.identity.accessLevel}</span>
          </div>
          <div className="text-[8px] text-cyan-600 font-medium mt-1 uppercase">
            TARGET: {s.identity.hostileService} ({s.identity.hostileCountry})
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-cyan-950/40 text-[9px]">
            <div>
              <span className="text-cyan-700 block uppercase">LOYALTY</span>
              <span className="text-cyan-400 font-bold">{s.state.loyaltyScore}%</span>
            </div>
            <div>
              <span className="text-cyan-700 block uppercase">STRESS FRAG</span>
              <span className="text-red-400 font-bold">{humStore.calculateSourceFragility(s.identity.sourceId)}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAdvance(s.identity.sourceId, s.identity.currentPhase);
          }}
          className="w-full bg-[#0a2024]/40 hover:bg-[#0c2f35] border border-cyan-800 hover:border-cyan-400 text-cyan-300 uppercase py-1 text-[8.5px] font-bold tracking-widest mt-2 rounded transition-all duration-100"
        >
          {s.identity.currentPhase === 'SPOTTED' && 'RUN ASSESSMENT MATCH'}
          {s.identity.currentPhase === 'ASSESSED' && 'CRAFT COVER DESIGNS'}
          {s.identity.currentPhase === 'DEVELOPING' && 'SECURE FORMAL RECRUIT'}
          {s.identity.currentPhase === 'RECRUITED' && 'INITIAL COMM HANDLING'}
          {!['SPOTTED', 'ASSESSED', 'DEVELOPING', 'RECRUITED'].includes(s.identity.currentPhase) && 'STABLE RUNNING'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-[#00ffcc] font-mono">
      <header className="shrink-0 bg-cyan-950/20 border border-cyan-900/40 rounded p-3 uppercase mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-cyan-400">// COVERT INGRESS FUNNEL</h3>
          <p className="text-[9px] text-[#00c0ff] mt-0.5">MANAGE TARGET ASSORTMENT PATHWAYS AND COMM MATRIX RECRUITMENT LIFE STAGES.</p>
        </div>
        <div className="flex gap-4 text-[9px] text-cyan-600 border-l border-cyan-900/60 pl-4">
          <span>SPOTTED: <span className="text-cyan-300">{spotted.length}</span></span>
          <span>DEVELOPING: <span className="text-cyan-300">{developing.length + assessed.length}</span></span>
          <span>OPERATIONAL: <span className="text-emerald-400">{active.length}</span></span>
        </div>
      </header>

      {/* Grid Columns */}
      <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden min-h-0">
        {/* Step 1: Spotted */}
        <div className="border border-cyan-950 bg-black/60 p-2.5 rounded flex flex-col min-h-0">
          <div className="shrink-0 flex justify-between items-center border-b border-cyan-950/60 pb-1 mb-3">
            <span className="text-[10px] font-bold text-cyan-400">// SPOTTED FILE</span>
            <span className="bg-[#002b33] px-1.5 py-0.5 text-[8.5px] font-bold text-[#00ffe6] rounded tracking-wider">{spotted.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
            {(spotted || []).map(renderCard)}
            {spotted.length === 0 && (
              <div className="text-center text-[9px] text-cyan-800 p-4 border border-cyan-950/30 rounded italic mt-4">
                NO SPOTTED COURIER CANDIDATES RECORDED.
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Assessed */}
        <div className="border border-cyan-950 bg-black/60 p-2.5 rounded flex flex-col min-h-0">
          <div className="shrink-0 flex justify-between items-center border-b border-cyan-950/60 pb-1 mb-3">
            <span className="text-[10px] font-bold text-orange-400">// PSYCH EVAL</span>
            <span className="bg-orange-950/40 border border-orange-900/50 px-1.5 py-0.5 text-[8.5px] font-bold text-orange-400 rounded tracking-wider">{assessed.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
            {(assessed || []).map(renderCard)}
            {assessed.length === 0 && (
              <div className="text-center text-[9px] text-cyan-800 p-4 border border-cyan-950/30 rounded italic mt-4">
                NO ASSETS CURRENT DEBRIEFING ASSESSMENT STAGE.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Developing */}
        <div className="border border-cyan-950 bg-black/60 p-2.5 rounded flex flex-col min-h-0">
          <div className="shrink-0 flex justify-between items-center border-b border-cyan-950/60 pb-1 mb-3">
            <span className="text-[10px] font-bold text-cyan-400">// ACTIVE DEV</span>
            <span className="bg-[#002b33] px-1.5 py-0.5 text-[8.5px] font-bold text-[#00ffe6] rounded tracking-wider">{developing.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
            {(developing || []).map(renderCard)}
            {developing.length === 0 && (
              <div className="text-center text-[9px] text-cyan-800 p-4 border border-cyan-950/30 rounded italic mt-4">
                NO ASSETS IN CLANDESTINE RECRUITMENT TRANSITS.
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Recruiting Ingress */}
        <div className="border border-cyan-950 bg-[#030c0c]/30 p-2.5 rounded flex flex-col min-h-0">
          <div className="shrink-0 flex justify-between items-center border-b border-cyan-950/60 pb-1 mb-3">
            <span className="text-[10px] font-bold text-emerald-400">// GRIDS INGRESS</span>
            <span className="bg-[#043321] px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-400 rounded tracking-wider">{active.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
            {(active || []).map(s => {
              return (
                <div 
                  key={s.identity.sourceId}
                  onClick={() => humStore.setSelectedSourceId(s.identity.sourceId)}
                  className="p-3 bg-emerald-950/10 border border-emerald-900/40 hover:border-emerald-400 rounded transition-all cursor-pointer text-emerald-400 text-[10px] space-y-2"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{s.identity.coverName}</span>
                    <span className="text-[8px] bg-emerald-950/60 px-1 py-0.5 rounded text-emerald-300 border border-emerald-800 uppercase tracking-widest">{s.identity.currentPhase}</span>
                  </div>
                  <div className="text-[8px] text-emerald-600 uppercase font-medium">
                    SERVICE: {s.identity.hostileService} ({s.identity.hostileCountry})
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[8px] text-emerald-500/80 pt-1.5 border-t border-emerald-950/40 font-mono">
                    <div>
                      <span>SURVIVABILITY:</span>
                      <span className="text-emerald-400 font-extrabold block">{s.state.survivabilityScore}%</span>
                    </div>
                    <div>
                      <span>YIELD CONFIDENCE:</span>
                      <span className="text-[#00ffcc] font-extrabold block">{humStore.calculateYieldPotential(s.identity.sourceId)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {active.length === 0 && (
              <div className="text-center text-[9px] text-[#00c8a8]/40 p-4 border border-dashed border-emerald-950/30 rounded italic mt-4">
                NO COMM NETWORKS ASSIGNED ACTIVE AGGRESSIVE HANDLING.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
