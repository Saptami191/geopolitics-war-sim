import React from 'react';
import { useDeceptionStore } from '../../store/deceptionStore';
import { AmbiguityControlMode } from '../../types';

const SELECTABLE_MODES: { value: AmbiguityControlMode; label: string; desc: string; clarityPenalty: string }[] = [
  { value: 'SINGLE_NARRATIVE', label: 'SINGLE NARRATIVE FOCUS', desc: 'Focuses entirely on a single precise false flag trail with maximal direct direction clarity.', clarityPenalty: 'Exposes player if false flag contains minor tradecraft errors.' },
  { value: 'MULTIPLE_NARRATIVES', label: 'COMPETING MULTIPLE COVERS', desc: 'Splits adversary attention by planting multiple plausible causes (e.g. state agency + dissident cells).', clarityPenalty: 'Slightly reduces believability score of primary decoy trace.' },
  { value: 'CONTROLLED_NOISE', label: 'CONTROLLED INTERFERENCE NOISE', desc: 'Floods routing lines with systemic dummy connections, masking specific structural vectors.', clarityPenalty: 'Significantly dampens direct forensic focus, delaying confrontation.' },
  { value: 'SIGNATURE_BLENDING', label: 'SIGNATURE BLENDING / OVERLAP', desc: 'Overlaps indicators of different actors, giving fakes a messy hybrid appearance.', clarityPenalty: 'Leads to gridlock inside analyst divisions.' },
  { value: 'BELIEF_SATURATION', label: 'COGNITIVE BELIEF SATURATION', desc: 'Overwhelms targets with 15+ threat theories. Forces complete analytical paralysis.', clarityPenalty: 'Adversary stops acting entirely, but also dismisses simple decoy clues.' },
  { value: 'SELECTIVE_CLARITY', label: 'SELECTIVE LOGICAL CLARITY', desc: 'Dances between absolute silence and sudden sharp, clear decoy leaks.', clarityPenalty: 'Drives maximum target confidence when leak occurs.' }
];

export default function AmbiguityControlPanel() {
  const decStore = useDeceptionStore();
  const selectedCampaign = decStore.selectedCampaignId ? decStore.campaigns[decStore.selectedCampaignId] : null;

  // Sync mode and value
  const ambState = selectedCampaign ? (decStore.ambiguityModes[selectedCampaign.deceptionId] || { mode: 'SINGLE_NARRATIVE' as AmbiguityControlMode, value: 30 }) : null;

  const handleModeChange = (mode: AmbiguityControlMode) => {
    if (!selectedCampaign || !ambState) return;
    decStore.setAmbiguityMode(selectedCampaign.deceptionId, mode);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCampaign || !ambState) return;
    const val = parseInt(e.target.value, 10);
    decStore.setAmbiguityModeValue(selectedCampaign.deceptionId, ambState.mode, val);

    // Recalculately and update belief State
    decStore.recalculateBelievability(selectedCampaign.deceptionId);
    decStore.updateBeliefState(selectedCampaign.deceptionId);
  };

  return (
    <div className="flex flex-col h-full text-sky-400 font-mono select-none">
      {selectedCampaign && ambState ? (
        <div className="grid grid-cols-12 gap-4 h-full min-h-0 flex-1">
          
          {/* List of Ambiguity modes config */}
          <div className="col-span-8 border border-sky-900/40 bg-slate-950/90 rounded-lg p-3.5 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4 overflow-y-auto scrollbar-thin pr-1 flex-1">
              <div>
                <h3 className="text-xs font-extrabold text-sky-100 uppercase tracking-widest">
                  // COGNITIVE AMBIGUITY CONTROLS
                </h3>
                <p className="text-[10px] text-sky-500/50 mt-0.5 uppercase">
                  Regulate noise frequency to buffer targeted exposure risks and manage analyst focus.
                </p>
              </div>

              {/* Mode Selectors */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold tracking-wider text-sky-400 block">// SELECT COGNITIVE FOCUS Posture</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {SELECTABLE_MODES.map(m => {
                    const active = ambState.mode === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => handleModeChange(m.value)}
                        className={`text-left p-2.5 border rounded cursor-pointer transition-all flex flex-col gap-1
                          ${active 
                            ? 'bg-sky-950/30 border-sky-400 text-sky-100 shadow-[0_0_10px_rgba(56,189,248,0.1)]' 
                            : 'border-sky-950 bg-[#060c14]/60 text-sky-600 hover:border-sky-850'}`}
                      >
                        <span className="font-extrabold tracking-wide uppercase">{m.label}</span>
                        <p className="text-[8.5px] text-sky-500/50 leading-relaxed font-light">{m.desc}</p>
                        <p className="text-[8px] text-[#f43f5e]/80 mt-1 uppercase border-t border-sky-950/20 pt-1">
                          CRIT: {m.clarityPenalty}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Noise Multiplier Slider */}
            <div className="border-t border-sky-900/30 pt-3.5 mt-3 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="font-extrabold text-sky-400 uppercase">// STEP-REGULATE NOISE AMPLITUDE:</span>
                <span className="text-sky-100 font-bold">{ambState.value}% (DECIBELS)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ambState.value}
                onChange={handleSliderChange}
                className="w-full accent-sky-400 cursor-pointer bg-slate-900 h-1 rounded"
              />
              <div className="flex justify-between text-[8px] text-sky-650 uppercase">
                <span>0% Clarity (Concentrated Force)</span>
                <span>50% Balanced</span>
                <span>100% Saturation (Paralysis Zone)</span>
              </div>
            </div>
          </div>

          {/* Ambiguity Trade-offs and Interpretation Prediction */}
          <div className="col-span-4 border border-sky-900/40 bg-slate-950/90 rounded-lg p-3.5 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4">
              <h3 className="text-[11px] font-extrabold text-sky-100 uppercase tracking-widest border-b border-sky-900/20 pb-2">
                // ADVERSARY COGNITIVE MODEL
              </h3>

              {/* Dynamic Interpretation block */}
              <div className="bg-[#09111c]/80 border border-sky-955 p-3 rounded space-y-2 text-[10px]">
                <span className="text-sky-400 font-extrabold uppercase">// EXTRAPOLATED ADVERSARY RESPONSE</span>
                <p className="text-sky-200 leading-relaxed text-[9.5px]">
                  {decStore.modelAdversaryInterpretation(selectedCampaign.deceptionId)}
                </p>
              </div>

              {/* Projected belief spread list */}
              <div className="bg-[#09111c]/80 border border-sky-955 p-3 rounded space-y-2.5 text-[10px]">
                <span className="text-sky-450 font-extrabold uppercase">// ACTIVE BELIEF DISTRIBUTION</span>
                <div className="space-y-1.5">
                  {decStore.determineBeliefSpread(selectedCampaign.deceptionId).map((belief, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-sky-400 rounded-full" />
                      <span className="text-sky-300 font-mono text-[9px]">{belief}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade-off stats breakdown */}
              <div className="bg-[#09111c]/80 border border-sky-955 p-3 rounded text-[10px] space-y-1.5">
                <span className="text-sky-450 font-extrabold uppercase">// TRADEOFF RESOLUTION INDEX</span>
                {(() => {
                  const to = decStore.resolveAmbiguityTradeoff(selectedCampaign.deceptionId);
                  return (
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                      <div>
                        <span className="text-emerald-400 text-[8px] font-bold">SHIELD UTILITY:</span>
                        <p className="text-sky-200 mt-0.5">+{Math.round(to.utility)}% Protection</p>
                      </div>
                      <div>
                        <span className="text-pink-400 text-[8px] font-bold">BELIEVABILITY HIT:</span>
                        <p className="text-sky-200 mt-0.5">-{Math.round(to.noisePenalty)}% Decoy Focus</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Bottom standard layout mark */}
            <div className="text-[9.5px] text-sky-500/40 text-center leading-relaxed border-t border-sky-900/20 pt-3">
              INTELLIGENCE SENSOR ARCHETYPE MODEL<br />
              COGNITIVE NOISE SYSTEM V4.1
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full text-sky-800/60 uppercase text-[11px] font-bold">
          NO DECEPTION WORKSPACE LOADED. SELECT A CAMPAIGN TO ENGAGE STRATEGIC AMBIGUITY REGULATORS.
        </div>
      )}
    </div>
  );
}
