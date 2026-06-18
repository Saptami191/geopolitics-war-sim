import React, { useState } from 'react';
import { useDeceptionStore } from '../../store/deceptionStore';
import { useWorldStore } from '../../store/worldStore';
import { DeceptionDomain, DeceptionObjective } from '../../types';

export default function DeceptionCampaignPanel() {
  const decStore = useDeceptionStore();
  const worldStore = useWorldStore();
  const campaignsList = Object.values(decStore.campaigns);
  const selectedCampaign = decStore.selectedCampaignId ? decStore.campaigns[decStore.selectedCampaignId] : null;

  // New campaign state form
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel] = useState('');
  const [domain, setDomain] = useState<DeceptionDomain>('CYBER');
  const [objective, setObjective] = useState<DeceptionObjective>('REDIRECT');
  const [targetBelief, setTargetBelief] = useState('');
  const [targetBehavior, setTargetBehavior] = useState('');
  const [intendedEffect, setIntendedEffect] = useState('');
  const [fallbackEffect, setFallbackEffect] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['RU']);

  // Packet deployment state
  const [showPlant, setShowPlant] = useState(false);
  const [packetSummary, setPacketSummary] = useState('');
  const [packetDetails, setPacketDetails] = useState('');
  const [packetRecipient, setPacketRecipient] = useState('');
  const [packetInterpretation, setPacketInterpretation] = useState('');
  const [packetCover, setPacketCover] = useState('');
  const [packetDomain, setPacketDomain] = useState<DeceptionDomain>('CYBER');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) return;
    const cleanLabel = label.trim();
    decStore.createDeceptionCampaign({
      label: cleanLabel,
      domain,
      objective,
      targetBeliefDesired: targetBelief || 'Classified belief',
      targetBehaviorDesired: targetBehavior || 'Divert attention',
      intendedEffect: intendedEffect || 'Protect main servers',
      fallbackEffect: fallbackEffect || 'Generic failure state',
      linkedTargets: selectedTargets
    });
    setLabel('');
    setTargetBelief('');
    setTargetBehavior('');
    setIntendedEffect('');
    setFallbackEffect('');
    setShowCreate(false);
  };

  const handlePlantPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !packetSummary) return;

    const detailsArray = packetDetails.split('\n').filter(l => l.trim().length > 0);
    const mockId = `pkt_${Date.now().toString().slice(-6)}`;

    decStore.plantFalseIntel(selectedCampaign.deceptionId, {
      packetId: mockId,
      deceptionId: selectedCampaign.deceptionId,
      sourceDomain: packetDomain,
      plantedTick: worldStore.currentTick,
      expirationTick: worldStore.currentTick + 80,
      payloadSummary: packetSummary,
      payloadDetails: detailsArray.length > 0 ? detailsArray : ['Trace metadata spoof set'],
      intendedRecipientProfile: packetRecipient || 'Analytical Command Cells',
      intendedInterpretation: packetInterpretation || 'Staged intrusion',
      coverStory: packetCover || 'Malware crash dump leak',
      visibleToPlayer: true,
      visibleToAdversary: true,
      contaminationRisk: 10 + Math.round(Math.random() * 20),
      exposureRisk: 15 + Math.round(Math.random() * 10)
    });

    // recalculate
    decStore.recalculateBelievability(selectedCampaign.deceptionId);
    decStore.evaluateContaminationRisk(selectedCampaign.deceptionId);
    decStore.updateBeliefState(selectedCampaign.deceptionId);

    setPacketSummary('');
    setPacketDetails('');
    setPacketRecipient('');
    setPacketInterpretation('');
    setPacketCover('');
    setShowPlant(false);
  };

  const getBeliefStateColor = (state: string) => {
    switch (state) {
      case 'UNSEEN': return 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5';
      case 'DISMISSED': return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
      case 'SUSPECTED': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'BELIEVED': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
      case 'OVERCONFIDENT': return 'text-emerald-200 border-emerald-200/20 bg-emerald-200/5 pulse';
      case 'CONTRADICTED': return 'text-pink-500 border-pink-500/20 bg-pink-500/10 font-bold';
      case 'REJECTED': return 'text-red-500 border-red-500/30 bg-red-500/10 font-bold';
      default: return 'text-cyan-500 border-cyan-500/20 bg-cyan-500/5';
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full text-[#38bdf8] font-mono select-none">
      {/* Campaign Directory */}
      <div className="col-span-4 border border-sky-900/40 bg-slate-950/90 rounded-lg p-3 flex flex-col justify-between h-full min-h-0">
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[11px] font-extrabold text-sky-400 tracking-wider">
              // DECEPTION DIRECTORY ({campaignsList.length})
            </h3>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="text-[9px] border border-sky-400/40 bg-sky-950/20 hover:bg-sky-400 hover:text-black py-0.5 px-2 rounded tracking-wider cursor-pointer transition-colors"
            >
              + NEW CAMPAIGN
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
            {campaignsList.map((c) => {
              const active = decStore.selectedCampaignId === c.deceptionId;
              return (
                <button
                  key={c.deceptionId}
                  onClick={() => decStore.selectCampaign(c.deceptionId)}
                  className={`w-full text-left p-2.5 border transition-all rounded duration-150 flex flex-col gap-1.5 cursor-pointer
                    ${active
                      ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)] text-sky-100'
                      : 'border-sky-950/50 bg-[#0d1624]/60 text-sky-700 hover:border-sky-800 hover:text-sky-300'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-xs tracking-wider truncate max-w-[150px]">
                      {c.label}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 border uppercase tracking-wider rounded ${getBeliefStateColor(c.beliefState)}`}>
                      {c.beliefState}
                    </span>
                  </div>

                  <div className="flex justify-between text-[9px] text-sky-500/60 mt-1">
                    <span>DOMAIN: <span className="text-sky-400">{c.domain}</span></span>
                    <span>TARGETS: <span className="text-sky-400">{c.linkedTargets.join(', ')}</span></span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-sky-950/30 pt-1.5 mt-1 text-sky-500/50">
                    <div className="flex justify-between">
                      <span>BELIEVABILITY:</span>
                      <span className={c.confidence.believabilityScore < 50 ? 'text-amber-500' : 'text-emerald-400'}>
                        {c.confidence.believabilityScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>CONTAM. RISK:</span>
                      <span className={c.confidence.contaminationRisk > 50 ? 'text-rose-500' : 'text-sky-400'}>
                        {c.confidence.contaminationRisk}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create Campaign Panel Overlay / Block */}
        {showCreate && (
          <form onSubmit={handleCreateCampaign} className="border-t border-sky-900/60 mt-3 pt-3 space-y-2 text-[10px]">
            <div className="flex flex-col gap-1">
              <label>CAMPAIGN CODENAME:</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="E.G. OPERATION BLACK SHROUD"
                className="bg-black/80 border border-sky-900 px-2 py-1 text-sky-300 w-full rounded focus:outline-none focus:border-sky-400 uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label>OPERATIONAL DOMAIN:</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as DeceptionDomain)}
                  className="bg-black border border-sky-900 px-1 py-1 text-sky-300 rounded focus:outline-none"
                >
                  <option value="CYBER">CYBER</option>
                  <option value="SIGINT">SIGINT</option>
                  <option value="HUMINT">HUMINT</option>
                  <option value="FININT">FININT</option>
                  <option value="IMAGERY">IMAGERY</option>
                  <option value="MILITARY">MILITARY</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label>OBJECTIVE TYPE:</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as DeceptionObjective)}
                  className="bg-black border border-sky-900 px-1 py-1 text-sky-300 rounded focus:outline-none"
                >
                  <option value="REDIRECT">REDIRECT</option>
                  <option value="HIDE">HIDE</option>
                  <option value="MISLEAD">MISLEAD</option>
                  <option value="FRAME">FRAME</option>
                  <option value="AMBIGUATE">AMBIGUATE</option>
                  <option value="SATURATE">SATURATE</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label>DESIRED COGNITIVE BELIEF:</label>
              <input
                type="text"
                value={targetBelief}
                onChange={(e) => setTargetBelief(e.target.value)}
                placeholder="Belief to induce in adversary..."
                className="bg-black/80 border border-sky-900 px-2 py-1 text-sky-300 rounded focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>TARGET NATION ID(S):</label>
              <input
                type="text"
                value={selectedTargets.join(', ')}
                onChange={(e) => setSelectedTargets(e.target.value.toUpperCase().split(',').map(s=>s.trim()))}
                placeholder="RU, CN"
                className="bg-black/80 border border-sky-900 px-2 py-1 text-sky-300 rounded focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="border border-red-900/60 bg-red-950/20 hover:bg-red-900 text-red-400 py-1 rounded cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="border border-sky-450 bg-sky-950/40 hover:bg-sky-400 hover:text-black py-1 rounded font-bold cursor-pointer"
              >
                DEPLOY
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Campaign Work Field */}
      <div className="col-span-8 flex flex-col h-full min-h-0 border border-sky-900/40 bg-slate-950/80 rounded-lg p-4">
        {selectedCampaign ? (
          <div className="flex flex-col min-h-0 flex-1 justify-between gap-3">
            {/* Header Identity banner */}
            <div className="min-h-0 flex flex-col gap-2">
              <div className="flex justify-between items-start border-b border-sky-900/30 pb-2">
                <div>
                  <h2 className="text-base font-extrabold text-sky-100 uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 bg-sky-500 rounded-sm animate-pulse" />
                    {selectedCampaign.label}
                  </h2>
                  <p className="text-[10px] text-sky-500/60 mt-0.5 uppercase">
                    ID: {selectedCampaign.deceptionId} // DOMAIN: {selectedCampaign.domain} // PRIMARY FOCUS: {selectedCampaign.objectiveProfile.objective}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-0.5 border rounded uppercase font-bold tracking-widest ${getBeliefStateColor(selectedCampaign.beliefState)}`}>
                    {selectedCampaign.beliefState}
                  </span>
                  <p className="text-[9px] text-sky-500/50 mt-1">LAST ADAPTATION TICK: {selectedCampaign.lastUpdatedTick}</p>
                </div>
              </div>

              {/* Profile details */}
              <div className="grid grid-cols-3 gap-3 text-[10px] bg-[#0c1624]/40 border border-sky-950/30 p-2.5 rounded">
                <div className="space-y-1">
                  <span className="text-sky-500 font-bold block">// TARGET COGNITIVE GOAL</span>
                  <p className="text-sky-200">{selectedCampaign.objectiveProfile.targetBeliefDesired}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sky-500 font-bold block">// TARGET BEHAVIOR SHIFT</span>
                  <p className="text-sky-200">{selectedCampaign.objectiveProfile.targetBehaviorDesired}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sky-500 font-bold block">// CORE OUTCOME INTENTION</span>
                  <p className="text-sky-200">{selectedCampaign.objectiveProfile.intendedEffect}</p>
                </div>
              </div>

              {/* Stat meters */}
              <div className="grid grid-cols-4 gap-3 text-[10px] pt-1">
                <div className="bg-[#0b1320]/80 border border-sky-950/40 p-2 rounded">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>BELIEVABILITY:</span>
                    <span className="text-emerald-400 font-bold">{selectedCampaign.confidence.believabilityScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${selectedCampaign.confidence.believabilityScore}%` }} />
                  </div>
                </div>

                <div className="bg-[#0b1320]/80 border border-sky-950/40 p-2 rounded">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>CONTAMINATION RISK:</span>
                    <span className="text-sky-400 font-bold">{selectedCampaign.confidence.contaminationRisk}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${selectedCampaign.confidence.contaminationRisk}%` }} />
                  </div>
                </div>

                <div className="bg-[#0b1320]/80 border border-sky-950/40 p-2 rounded">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>EXPOSURE RISK:</span>
                    <span className="text-rose-400 font-bold">{selectedCampaign.confidence.exposureRisk}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${selectedCampaign.confidence.exposureRisk}%` }} />
                  </div>
                </div>

                <div className="bg-[#0b1320]/80 border border-sky-950/40 p-2 rounded">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>AMBIGUITY LEVEL:</span>
                    <span className="text-sky-300 font-bold">{selectedCampaign.confidence.ambiguityScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div className="h-full bg-sky-300 transition-all duration-300" style={{ width: `${selectedCampaign.confidence.ambiguityScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Active False Intel Packets list */}
            <div className="flex-1 min-h-0 flex flex-col justify-between pt-1">
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-between items-center mb-1 pb-1 border-b border-sky-950/20">
                  <span className="text-[10px] font-extrabold text-sky-400 block tracking-wider uppercase">
                    // PLANTED EVIDENCE DATABASE ({selectedCampaign.packets.length})
                  </span>
                  {!showPlant && (
                    <button
                      onClick={() => setShowPlant(true)}
                      className="text-[9px] border border-sky-500/30 bg-sky-950/30 hover:bg-sky-400 hover:text-black py-0.5 px-2 rounded cursor-pointer"
                    >
                      + PLANT EVIDENCE TRACE
                    </button>
                  )}
                </div>

                {showPlant ? (
                  <form onSubmit={handlePlantPacket} className="bg-[#0c1624]/70 border border-sky-900/50 p-3 rounded space-y-2.5 text-[10px] overflow-y-auto max-h-[190px] scrollbar-thin">
                    <div className="flex justify-between items-center bg-sky-950/20 p-1 rounded font-bold border-b border-sky-900/20">
                      <span>PLANTING DIALOGUE ENGINE</span>
                      <button type="button" onClick={() => setShowPlant(false)} className="text-red-400 hover:underline">CLOSE</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-0.5">
                        <label>EVIDENCE PACKET SUMMARY:</label>
                        <input
                          type="text"
                          value={packetSummary}
                          onChange={(e) => setPacketSummary(e.target.value)}
                          placeholder="Brief diagnostic of trace..."
                          className="bg-black/90 border border-sky-950 px-2 py-1 text-sky-300 rounded focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label>INTENDED RECIPIENT TEAM:</label>
                        <input
                          type="text"
                          value={packetRecipient}
                          onChange={(e) => setPacketRecipient(e.target.value)}
                          placeholder="Forensic investigators, analyst cells..."
                          className="bg-black/90 border border-sky-950 px-2 py-1 text-sky-300 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-0.5">
                        <label>DESIRED COGNITIVE INTERPRETATION:</label>
                        <input
                          type="text"
                          value={packetInterpretation}
                          onChange={(e) => setPacketInterpretation(e.target.value)}
                          placeholder="Expected target interpretation..."
                          className="bg-black/90 border border-sky-950 px-2 py-1 text-sky-300 rounded focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label>INTELLIGENT COVER STORY:</label>
                        <input
                          type="text"
                          value={packetCover}
                          onChange={(e) => setPacketCover(e.target.value)}
                          placeholder="Faked slip-up story..."
                          className="bg-black/90 border border-sky-950 px-2 py-1 text-sky-300 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label>DETAILED DATA STRINGS (ONE PER LINE):</label>
                      <textarea
                        value={packetDetails}
                        onChange={(e) => setPacketDetails(e.target.value)}
                        placeholder="IP segments, compiler locals, hex headers..."
                        rows={3}
                        className="bg-black/90 border border-sky-950 px-2 py-1 text-sky-300 rounded focus:outline-none font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full border border-sky-400 bg-sky-950/50 hover:bg-sky-400 hover:text-black py-1.5 rounded font-extrabold cursor-pointer"
                    >
                      TRANSMIT SPOOFED LOG PACKET
                    </button>
                  </form>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin max-h-[190px]">
                    {selectedCampaign.packets.length === 0 ? (
                      <div className="text-center py-6 text-sky-700/60 text-[10px] border border-dashed border-sky-950/40 rounded bg-slate-950/20">
                        NO FALSE EVIDENCE DETECTED IN LOG HISTORY<br />
                        <span className="text-[9px]">PLANT METADATA RECURRINGLY TO FUEL THE TARGET NATION REDIRECTS</span>
                      </div>
                    ) : (
                      selectedCampaign.packets.map((p) => {
                        return (
                          <div key={p.packetId} className="border border-sky-950/50 bg-[#070e17]/80 rounded p-2.5 text-[10px] space-y-1">
                            <div className="flex justify-between items-center text-sky-400 border-b border-sky-950/20 pb-1 mb-1 font-bold">
                              <span>PACKET: {p.packetId} [{p.sourceDomain}]</span>
                              <span className="text-sky-500/60 font-medium">PLANTED: TICK {p.plantedTick} // EXPIRES: TICK {p.expirationTick}</span>
                            </div>
                            <p className="text-sky-200 font-bold">{p.payloadSummary}</p>
                            <div className="pl-3 border-l border-sky-900/40 text-[9px] text-sky-500 space-y-0.5">
                              {p.payloadDetails.map((det, i) => <div key={i}>&gt; {det}</div>)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[9px] text-sky-500/50 pt-1 border-t border-sky-950/10">
                              <div>INTENDED INTERPRETATION: <span className="text-sky-300">{p.intendedInterpretation}</span></div>
                              <div>COVER STORY: <span className="text-sky-300">{p.coverStory}</span></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Foot action controls */}
              <div className="flex gap-4 pt-2 border-t border-sky-950/30">
                <button
                  onClick={() => decStore.reinforceDeceptionCampaign(selectedCampaign.deceptionId)}
                  className="flex-1 py-1.5 border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-500 hover:text-black font-extrabold text-[10px] text-emerald-400 rounded cursor-pointer transition-colors text-center uppercase"
                >
                  REINFORCE EVIDENCE COVER STORY
                </button>
                <button
                  onClick={() => decStore.routeFalseSignal(selectedCampaign.deceptionId, 'SIGINT_PRIMARY')}
                  className="flex-1 py-1.5 border border-sky-500/40 bg-sky-950/20 hover:bg-sky-400 hover:text-black font-extrabold text-[10px] text-sky-300 rounded cursor-pointer transition-colors text-center uppercase"
                >
                  OVERRIDE TRANSIT DATA HEADERS
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-sky-800/60 uppercase text-[11px] font-bold">
            NO ACTIVE DECEPTION WORKSPACE LOADED.<br />
            <span className="text-[9px] font-medium mt-1">SELECT A CAMPAIGN TO TRANSMIT SYSTEM DATA SPOOFS</span>
          </div>
        )}
      </div>
    </div>
  );
}
