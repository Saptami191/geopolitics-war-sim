import React from 'react';
import { produce } from 'immer';
import { useHumintStore } from '../../store/humintStore';
import { useWorldStore } from '../../store/worldStore';
import { HandlerCase } from '../../types';

export default function HandlerPsychologyPanel() {
  const humStore = useHumintStore();
  const handlers = Object.values(humStore.handlers);

  const activeSelectedId = humStore.selectedHandlerId || handlers[0]?.handlerId || null;
  const hCase = handlers.find(h => h.handlerId === activeSelectedId);

  const handleCreateHandler = () => {
    const cleanId = `hnd_${Math.random().toString(36).substring(2, 6)}`;
    const randomName = `OPERATOR_${Math.floor(100 + Math.random() * 900)}`;
    humStore.addHandler({
      handlerId: cleanId,
      alias: randomName,
      role: 'CASE_OFFICER',
      psychology: {
        trustPropensity: 50,
        suspicionBias: 50,
        patience: 60,
        aggression: 50,
        controlNeed: 50,
        empathy: 50,
        compartmentationDiscipline: 70,
        operationalHubris: 30,
        emotionalAttachment: 25,
        riskAversion: 50,
        sourceFetishization: 15,
        moralCompromise: 40,
        improvisationSkill: 65,
        burnoutRisk: 10,
        deceptionSensitivity: 60,
        betrayalTolerance: 40
      },
      sourceLoad: 0,
      activeSources: [],
      trustHistory: [50],
      paranoiaHistory: [30],
      compromiseConcern: 15,
      operationalEmpathy: 50,
      controlCompulsion: 45,
      riskBias: 40,
      attachmentRisk: 20,
      fatigueLevel: 5,
      deceptionTolerance: 50,
      decisionStyle: 'BALANCED',
      lastInteractionTick: useWorldStore.getState().currentTick
    });
    useWorldStore.getState().addGlobalEvent(`[OFFICER ENGAGE] Initial training and compartment alignment finalized for Case Officer: [${randomName}].`, 'INFO');
  };

  const handleUpdateStyle = (style: any) => {
    if (!hCase) return;
    humStore.updateHandlerPsychology(hCase.handlerId);
    useHumintStore.setState(produce((draft) => {
      const hObj = draft.handlers[hCase.handlerId];
      if (hObj) {
        hObj.decisionStyle = style;
        
        // Alter some stats dynamically based on styled strategy
        if (style === 'AGGRESSIVE') {
          hObj.psychology.aggression = 85;
          hObj.psychology.riskAversion = 20;
          hObj.psychology.trustPropensity = 75;
        } else if (style === 'CAUTIOUS') {
          hObj.psychology.aggression = 25;
          hObj.psychology.riskAversion = 85;
          hObj.psychology.trustPropensity = 40;
        } else if (style === 'PARANOID') {
          hObj.psychology.suspicionBias = 85;
          hObj.psychology.trustPropensity = 20;
          hObj.compromiseConcern = 75;
        } else if (style === 'PRAGMATIC') {
          hObj.psychology.moralCompromise = 85;
          hObj.psychology.compartmentationDiscipline = 60;
        }
      }
    }));
    useWorldStore.getState().addGlobalEvent(`Case Officer [${hCase.alias}] reassigned tactical behavior directive: "${style}".`, 'INFO');
  };

  const handleResetFatigue = (hId: string) => {
    useHumintStore.setState(produce((draft) => {
      const hObj = draft.handlers[hId];
      if (hObj) {
        hObj.fatigueLevel = Math.max(0, hObj.fatigueLevel - 40);
        hObj.activeSources.forEach(sId => {
          const s = draft.sources[sId];
          if (s) {
            s.notes.push('[System] Handler completed mandatory stress relief rest sequence.');
          }
        });
      }
    }));
    useWorldStore.getState().addGlobalEvent(`Case Officer [${hCase?.alias}] ordered to stand down for decompression. Fatigue reduced.`, 'INFO');
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full overflow-hidden text-[#00ffcc] font-mono">
      {/* Side bar directory of Case Officers / Handlers Handlers list */}
      <div className="col-span-4 border border-cyan-900/60 bg-black/80 p-3 rounded-lg flex flex-col justify-between h-full min-h-0">
        <div className="flex flex-col min-h-0 shrink">
          <h3 className="text-[11px] font-extrabold text-cyan-400 bg-cyan-950/20 p-2 border border-cyan-900/40 rounded uppercase tracking-widest mb-3">
            // STATION DIRECTORY
          </h3>

          <div className="overflow-y-auto space-y-2.5 scrollbar-thin flex-1 max-h-[170px] pr-0.5">
            {(handlers || []).map(h => {
              const isSelected = activeSelectedId === h.handlerId;
              return (
                <button
                  key={h.handlerId}
                  onClick={() => humStore.setSelectedHandlerId(h.handlerId)}
                  className={`w-full text-left p-2 border transition-all rounded text-[10px] space-y-1 cursor-pointer
                    ${isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)] text-cyan-200'
                      : 'border-cyan-900/30 bg-[#020b0b]/60 text-cyan-700 hover:border-cyan-700 hover:text-cyan-400'}`}
                >
                  <div className="flex justify-between font-extrabold">
                    <span>OFFICER: {h.alias}</span>
                    <span className="text-cyan-500 text-[8.5px] font-medium">({h.role})</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-cyan-600 uppercase font-medium">
                    <span>ACTIVE LOAD: {h.sourceLoad} SOURCES</span>
                    <span>STYLE: <span className="text-cyan-300 font-bold">{h.decisionStyle}</span></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCreateHandler}
          className="mt-3 w-full bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-800 hover:border-cyan-400 text-cyan-300 tracking-widest text-[9.5px] uppercase font-bold py-1.5 transition-all rounded"
        >
          TRAIN COVER NEW CASE OFFICER
        </button>
      </div>

      {/* Main Console details */}
      <div className="col-span-8 border border-cyan-900/60 bg-black/90 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto scrollbar-thin h-full min-h-0">
        {hCase ? (
          <div className="space-y-4 text-[11px]">
            <header className="border-b border-cyan-900/40 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
                  OFFICER PROFILE: {hCase.alias}
                </h4>
                <div className="text-[9px] text-[#00b0ff] uppercase mt-1">
                  ROLE ASSIGNMENT: {hCase.role} // STYLE TEMPLATE: {hCase.decisionStyle}
                </div>
              </div>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase border flex flex-col items-center ${hCase.fatigueLevel > 60 ? 'text-red-400 border-red-900' : 'text-emerald-400 border-emerald-900'}`}>
                <span>FATIGUE INDEX: {hCase.fatigueLevel}%</span>
              </span>
            </header>

            {/* Psychology metrics bar breakdowns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-cyan-950 bg-black/60 p-3 rounded space-y-1.5 text-[10px]">
                <span className="text-[9.5px] font-extrabold text-cyan-400 block mb-2 border-b border-cyan-950 pb-0.5 uppercase tracking-widest">// PSYCHOMETRIC COEFFICIENTS</span>
                
                <div className="flex justify-between">
                  <span className="text-cyan-600">TRUST PROPENSITY:</span>
                  <span className="text-cyan-300 font-bold">{hCase.psychology.trustPropensity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">SUSPICION BIAS GAP:</span>
                  <span className="text-cyan-300 font-bold">{hCase.psychology.suspicionBias}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">AGGRESSION INDEX:</span>
                  <span className="text-cyan-300 font-bold">{hCase.psychology.aggression}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">COMPARTMENTATION DRIL:</span>
                  <span className="text-cyan-300 font-bold">{hCase.psychology.compartmentationDiscipline}%</span>
                </div>
              </div>

              <div className="border border-cyan-950 bg-black/60 p-3 rounded space-y-1.5 text-[10px]">
                <span className="text-[9.5px] font-extrabold text-cyan-400 block mb-2 border-b border-cyan-950 pb-0.5 uppercase tracking-widest">// INTERACTIVE ATTACHMENTS</span>
                
                <div className="flex justify-between">
                  <span className="text-cyan-600">EMOTIONAL RISK INDEX:</span>
                  <span className="text-cyan-300 font-bold">{hCase.psychology.emotionalAttachment}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">COMPROMISE ANXIETY:</span>
                  <span className="text-red-400 font-bold">{hCase.compromiseConcern}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">ATTACHMENT COEFFICIENT:</span>
                  <span className="text-cyan-300 font-bold">{hCase.attachmentRisk}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">ACTIVE SOURCES LISTED:</span>
                  <span className="text-[#00ffcc] font-extrabold">{hCase.activeSources.length} SOURCES</span>
                </div>
              </div>
            </div>

            {/* Linked sources */}
            <div className="border border-cyan-950 bg-black/40 p-2.5 rounded text-[10px]">
              <span className="text-cyan-500 font-extrabold uppercase text-[9px] block border-b border-cyan-950 pb-1 mb-2 tracking-widest">// OPERATIONAL COVER LINKS HANDLED</span>
              {hCase.activeSources.length > 0 ? (
                <div className="flex gap-2.5 overflow-x-auto select-none rounded">
                  {(hCase.activeSources || []).map(sId => {
                    const activeSrcObj = humStore.sources[sId];
                    return activeSrcObj ? (
                      <span key={sId} className="px-2.5 py-1 bg-cyan-950/20 border border-cyan-900 rounded font-semibold text-cyan-300 text-[9px]">
                        {activeSrcObj.identity.coverName} ({activeSrcObj.identity.sourceType})
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-cyan-800 text-[9px] italic p-1">NO INGRESS ASSETS ATTACHED CURRENTLY.</div>
              )}
            </div>

            {/* Directive styles choices */}
            <div className="border border-cyan-950 bg-[#010808]/50 p-2.5 rounded">
              <span className="text-[10px] font-extrabold text-cyan-400 block pb-1 border-b border-cyan-950 uppercase tracking-widest mb-2.5">// ADJUST BEHAVIOR STYLE DIRECTIVES</span>
              
              <div className="grid grid-cols-4 gap-2 text-[8.5px]">
                <button
                  onClick={() => handleUpdateStyle('BALANCED')}
                  className={`py-1 border rounded uppercase font-bold transition-all ${hCase.decisionStyle === 'BALANCED' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-cyan-950 text-cyan-600 hover:text-cyan-300'}`}
                >
                  BALANCED
                </button>
                <button
                  onClick={() => handleUpdateStyle('AGGRESSIVE')}
                  className={`py-1 border rounded uppercase font-bold transition-all ${hCase.decisionStyle === 'AGGRESSIVE' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-cyan-950 text-cyan-600 hover:text-cyan-300'}`}
                >
                  AGGRESSIVE
                </button>
                <button
                  onClick={() => handleUpdateStyle('CAUTIOUS')}
                  className={`py-1 border rounded uppercase font-bold transition-all ${hCase.decisionStyle === 'CAUTIOUS' ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'border-cyan-950 text-cyan-600 hover:text-cyan-300'}`}
                >
                  CAUTIOUS
                </button>
                <button
                  onClick={() => handleUpdateStyle('PARANOID')}
                  className={`py-1 border rounded uppercase font-bold transition-all ${hCase.decisionStyle === 'PARANOID' ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-extrabold' : 'border-cyan-950 text-cyan-600 hover:text-cyan-300'}`}
                >
                  PARANOID
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-3.5 pt-2.5 border-t border-cyan-950/40">
                <button
                  onClick={() => handleResetFatigue(hCase.handlerId)}
                  className="w-full bg-[#0a2024]/40 hover:bg-[#0c2f35] border border-cyan-800 text-cyan-300 text-[9px] py-1.5 uppercase font-bold tracking-widest rounded"
                >
                  ORDER COMPULSORY OPERATING STAND DOWN FOR REST & DECOMPRESSION
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-cyan-900/40 bg-black/70 rounded-lg flex items-center justify-center p-6 text-cyan-800 text-[11px] font-bold tracking-[0.2em] text-center">
            SELECT A INSTANCE CASE OFFICER TO INSPECT COMPARTMENT PSYCHOLOGY AND OVERLAY DIRECTIVE STYLE REGULATORS.
          </div>
        )}
      </div>
    </div>
  );
}
