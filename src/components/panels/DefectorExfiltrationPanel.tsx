import React from 'react';
import { useHumintStore } from '../../store/humintStore';
import { useWorldStore } from '../../store/worldStore';

export default function DefectorExfiltrationPanel() {
  const humStore = useHumintStore();
  const defectorList = Object.values(humStore.defectors);

  const activeSelectedId = humStore.selectedSourceId || defectorList[0]?.defectorId || null;
  const defCase = defectorList.find(d => d.defectorId === activeSelectedId);

  const getSafetyStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PLACE': return 'bg-amber-950/40 text-amber-400 border-amber-900 border animate-pulse';
      case 'MOVING': return 'bg-cyan-950/40 text-cyan-400 border-cyan-800 border';
      case 'EXFILTRATED': return 'bg-emerald-950/40 text-[#00ff99] border-emerald-900 border';
      case 'COMPROMISED': return 'bg-red-950/40 text-red-500 border-red-900 border font-bold';
      case 'SEALED': return 'bg-purple-950/40 text-purple-400 border-purple-850 border';
      default: return 'bg-zinc-950 text-zinc-400 border-zinc-900 border';
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full overflow-hidden text-[#00ffcc] font-mono">
      {/* Side bar directory of defector cases */}
      <div className="col-span-4 border border-cyan-900/60 bg-black/80 p-3 rounded-lg flex flex-col h-full min-h-0">
        <h3 className="text-[11px] font-extrabold text-cyan-400 bg-cyan-950/20 p-2 border border-cyan-900/40 rounded uppercase tracking-widest mb-3">
          // DEFECTOR FILES
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
          {defectorList.map(def => {
            const isSelected = activeSelectedId === def.defectorId;
            return (
              <button
                key={def.defectorId}
                onClick={() => humStore.setSelectedSourceId(def.defectorId)}
                className={`w-full text-left p-2.5 border transition-all rounded text-[10px] space-y-1.5 cursor-pointer
                  ${isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)] text-cyan-200'
                    : 'border-cyan-900/40 bg-[#020b0b]/60 text-cyan-700 hover:border-cyan-700 hover:text-cyan-400'}`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>ID: {def.defectorId.toUpperCase()}</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${getSafetyStatusBadge(def.currentSafetyStatus)}`}>
                    {def.currentSafetyStatus}
                  </span>
                </div>
                <div className="text-[9px] text-cyan-600 font-medium">ORIGIN: {def.originService}</div>

                <div className="grid grid-cols-2 gap-2 text-[9px] pt-1.5 border-t border-cyan-950/30 font-medium text-cyan-500/80">
                  <div className="flex justify-between">
                    <span>TRANSIT RISK:</span>
                    <span className="text-red-400 font-bold">{def.transitRisk}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COOLDOWN:</span>
                    <span className="text-orange-400 font-bold">{def.extractionWindowTicks} TICKS</span>
                  </div>
                </div>
              </button>
            );
          })}

          {defectorList.length === 0 && (
            <div className="text-center text-[10px] text-cyan-800 p-6 border-dashed border border-cyan-950/40 rounded italic mt-4">
              NO ACTIVE DEFEDTOR DOSSIERS LOGGED.
            </div>
          )}
        </div>
      </div>

      {/* Main Defector Exfiltration Console */}
      <div className="col-span-8 border border-cyan-900/60 bg-black/90 p-4 rounded-lg flex flex-col gap-4 overflow-y-auto scrollbar-thin h-full min-h-0">
        {defCase ? (
          <div className="space-y-4 text-[11px]">
            <header className="border-b border-cyan-900/40 pb-3 flex justify-between items-start">
              <div>
                <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">
                  DEFECTOR TRANSIT MODULE: {defCase.defectorId.toUpperCase()}
                </h4>
                <div className="text-[9px] text-[#00b0ff] uppercase mt-1">
                  ORIGIN LANDSCAPE: {defCase.originService} ({defCase.originCountry})
                </div>
              </div>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase ${getSafetyStatusBadge(defCase.currentSafetyStatus)}`}>
                STATUS: {defCase.currentSafetyStatus}
              </span>
            </header>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-cyan-950 bg-black/50 p-2.5 rounded text-center">
                <span className="text-cyan-600 block text-[9px] uppercase tracking-wider">VERIFICATION</span>
                <span className={`text-md font-extrabold block mt-1 ${defCase.verificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`}>
                  {defCase.verificationStatus}
                </span>
                <button
                  onClick={() => humStore.verifyDefector(defCase.defectorId)}
                  disabled={defCase.verificationStatus === 'VERIFIED'}
                  className="mt-1.5 w-full bg-[#0a2024]/40 hover:bg-[#0c2f35] border border-cyan-800 text-cyan-300 text-[8.5px] font-bold py-0.5 rounded transition-all disabled:opacity-40"
                >
                  VERIFY TRACE
                </button>
              </div>

              <div className="border border-cyan-950 bg-black/50 p-2.5 rounded text-center">
                <span className="text-cyan-600 block text-[9px] uppercase tracking-wider">ALIAS READYNESS</span>
                <span className="text-md font-extrabold block mt-1 text-cyan-400">
                  {defCase.aliasReadiness}%
                </span>
                <button
                  onClick={() => humStore.planExfiltration(defCase.defectorId)}
                  className="mt-1.5 w-full bg-[#0a2024]/40 hover:bg-[#0c2f35] border border-cyan-800 text-cyan-300 text-[8.5px] font-bold py-0.5 rounded transition-all"
                >
                  PLAN EXFIL LAB
                </button>
              </div>

              <div className="border border-cyan-950 bg-black/50 p-2.5 rounded text-center">
                <span className="text-cyan-600 block text-[9px] uppercase tracking-wider">BURST VALUE</span>
                <span className="text-md font-extrabold block mt-1 text-yellow-400">
                  +{defCase.intelligenceBurstValue} INFL
                </span>
                <button
                  onClick={() => {
                    humStore.updateSource(defCase.defectorId, (draft) => {
                      draft.notes.push('[System] Dispatched custom intelligence burst files directly to high command.');
                    });
                    useWorldStore.getState().addGlobalEvent(`Preliminary intelligence files exported for defector [${defCase.defectorId}]. Burst payload queued.`, 'INFO');
                  }}
                  className="mt-1.5 w-full bg-[#0a2024]/40 hover:bg-[#0c2f35] border border-cyan-800 text-cyan-300 text-[8.5px] font-bold py-0.5 rounded transition-all"
                >
                  DUMP PRELIM INTEL
                </button>
              </div>
            </div>

            {/* In depth Stats Display slider */}
            <div className="border border-cyan-950 bg-[#010808]/70 p-3 rounded space-y-2">
              <span className="text-[10px] font-extrabold text-cyan-400 block pb-1 border-b border-cyan-950 uppercase tracking-widest mb-2">// COVERT OPERATIONAL RISKS</span>
              
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-cyan-500 mb-1">
                    <span>TRANSIT LEAK HAZARD:</span>
                    <span className="text-red-400 font-bold">{defCase.transitRisk}%</span>
                  </div>
                  <div className="w-full bg-cyan-950 h-1 rounded overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${defCase.transitRisk}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-cyan-500 mb-1">
                    <span>FAMILY EXPOSURE RISK (BLOWBACK):</span>
                    <span className="text-red-400 font-bold">{defCase.familyExposureRisk}%</span>
                  </div>
                  <div className="w-full bg-cyan-950 h-1 rounded overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${defCase.familyExposureRisk}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-cyan-500 mb-1">
                    <span>RETROACTIVE DISCOVERY RISK:</span>
                    <span className="text-orange-400 font-bold">{defCase.retroactiveDiscoveryRisk}%</span>
                  </div>
                  <div className="w-full bg-cyan-950 h-1 rounded overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: `${defCase.retroactiveDiscoveryRisk}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[9px] pt-2 text-cyan-600 border-t border-cyan-950/40">
                  <div className="flex justify-between">
                    <span>RESETTLEMENT PRESSURE:</span>
                    <span className="text-cyan-400 font-bold">{defCase.resettlementPressure}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EXTRACTION TICK WINDOW COOLDOWN:</span>
                    <span className="text-amber-400 font-bold">{defCase.extractionWindowTicks} TICKS LEFT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Exfiltration Panel Panel buttons */}
            <div className="border border-cyan-950 bg-[#010808]/50 p-3 rounded">
              <span className="text-[10px] font-extrabold text-cyan-400 block pb-1 border-b border-cyan-950 uppercase tracking-widest mb-3">// ACTION CONTROL ENVELOPE</span>
              
              <div className="grid grid-cols-2 gap-3 text-[9px]">
                <button
                  onClick={() => humStore.executeExfiltration(defCase.defectorId)}
                  disabled={defCase.currentSafetyStatus !== 'IN_PLACE' && defCase.currentSafetyStatus !== 'MOVING'}
                  className="bg-purple-950/20 hover:bg-purple-900/40 border border-purple-800 text-purple-400 py-2.5 uppercase font-extrabold tracking-wider rounded transition-all duration-100 disabled:opacity-30"
                >
                  EXECUTE CLANDESTINE EXFILTRATION TRANSIT
                </button>

                <button
                  onClick={() => humStore.resettleDefector(defCase.defectorId)}
                  disabled={defCase.currentSafetyStatus !== 'EXFILTRATED'}
                  className="bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-800 text-emerald-400 py-2.5 uppercase font-extrabold tracking-wider rounded transition-all duration-100 disabled:opacity-30"
                >
                  RESETTLE DEFECTOR UNDER SYNTHETIC IDENTITY
                </button>
              </div>
              <div className="text-[8.5px] text-cyan-700/80 uppercase mt-2.5 leading-relaxed">
                * COMMITMENT RECONNAISSANCE MUST HIGHLIGHT ENVELOPE TRANSIT BIAS REDUCTIONS FIRST. A FAILED EXFILTRATION DIRECTLY COLLAPSES EXPOSURES AND CREATES MASSIVE LOCAL MAP BLOWBACK.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-cyan-900/40 bg-black/70 rounded-lg flex items-center justify-center p-6 text-cyan-800 text-[11px] font-bold tracking-[0.2em] text-center">
            SELECT A ACTIVE DEFECTOR FILE TO COMMAND REARRANGEMENT EXFILTRATION LOGISTICS OR ACCESS PAYROLL DEBRIEF INSTRUCTIONS.
          </div>
        )}
      </div>
    </div>
  );
}
