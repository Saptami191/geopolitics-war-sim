import React, { useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { createBusEvent } from '../../sim/eventBus/eventFactories';
import { queueBusEvent, processBusEventQueue } from '../../sim/eventBus/dispatcher';
import { BusEvent, BusEventType } from '../../sim/eventBus/types';
import { audio } from '../../utils/audio';
import { 
  Activity, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  Globe, 
  ChevronRight, 
  ChevronDown, 
  Terminal,
  Send,
  HelpCircle
} from 'lucide-react';

export default function CommandEventBusPanel() {
  const worldState = useWorldStore();
  const currentTick = worldState.currentTick;
  const canonicalWorld = worldState.world;
  const countries = worldState.countries;

  const [selectedTarget, setSelectedTarget] = useState('RU');
  const [selectedCascade, setSelectedCascade] = useState('SANCTIONS');
  const [executionMode, setExecutionMode] = useState('INSTANT');
  const [selectedTrace, setSelectedTrace] = useState<BusEvent | null>(null);
  const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({});

  // Gather list of non-player country IDs
  const countryIds = Object.keys(countries).filter(id => id !== 'US');

  // Queued & history events
  const queuedEvents = canonicalWorld?.busEventQueue || [];
  const historyEvents = canonicalWorld?.busEventHistory || [];

  // Group history events by correlation ID to show trigger chains
  const chains: Record<string, BusEvent[]> = {};
  historyEvents.forEach(evt => {
    if (!chains[evt.correlationId]) {
      chains[evt.correlationId] = [];
    }
    // Maintain chronological oder (or reverse) within the chain
    chains[evt.correlationId].push(evt);
  });

  const toggleChain = (chainId: string) => {
    setExpandedChains(prev => ({
      ...prev,
      [chainId]: !prev[chainId]
    }));
  };

  const handleLaunchCascade = () => {
    audio.playPhaseReveal();

    worldState.applyTickDelta((draft) => {
      if (!draft.world) return;

      let primaryEvent: BusEvent;

      if (selectedCascade === 'SANCTIONS') {
        primaryEvent = createBusEvent({
          type: 'ECONOMIC_SANCTION_APPLIED',
          category: 'ECONOMIC',
          sourceSystem: 'PLAYER_COMMAND_DECK',
          sourceEntityType: 'COUNTRY',
          sourceEntityId: 'US',
          targetEntityType: 'COUNTRY',
          targetEntityIds: [selectedTarget],
          tick: draft.currentTick,
          severity: 'CRITICAL',
          visibility: 'PUBLIC',
          title: `Coercive Embargo Initiated`,
          summary: `The Department of the Treasury issued high-impact economic sanctions targeting ${selectedTarget} assets and debt operations.`,
          payload: { severity: 25, sanctionScope: 'GLOBAL_TRADE' }
        });
      } else if (selectedCascade === 'CYBER') {
        primaryEvent = createBusEvent({
          type: 'CYBER_INTRUSION_DETECTED',
          category: 'CYBER',
          sourceSystem: 'PLAYER_COMMAND_DECK',
          sourceEntityType: 'COUNTRY',
          sourceEntityId: 'US',
          targetEntityType: 'COUNTRY',
          targetEntityIds: [selectedTarget],
          tick: draft.currentTick,
          severity: 'CRITICAL',
          visibility: 'PUBLIC',
          title: `Malware Footprint Discovered`,
          summary: `Cyber Command payload signature 'AegisGrip' detected inside the electrical grid of ${selectedTarget}.`,
          payload: { malwareSignature: 'AEGIS_GRIP', targetSubgrid: 'MUNICIPAL' }
        });
      } else {
        // TREATY CEASEFIRE VIOLATION
        // Find or create a treaty
        const treatyKey = Object.keys(draft.world.treatiesById)[0] || 'TREATY-CEASEFIRE-01';
        if (!draft.world.treatiesById[treatyKey]) {
          draft.world.treatiesById[treatyKey] = {
            id: treatyKey,
            name: 'Pact of Geneva Ceasefire',
            type: 'CEASE_FIRE',
            signatoryCountryIds: ['US', selectedTarget],
            obligations: ['Demilitarized Border Zone', 'Mutual Surveillance Access'],
            enforcementStrength: 70,
            secrecyLevel: 0,
            startTick: 0,
            expirationTick: null,
            complianceByCountry: { US: 100, [selectedTarget]: 100 },
            violationHistory: [],
            status: 'ACTIVE',
            blocEffects: {},
            tags: ['CEASE_FIRE', 'MIDDLE_EAST_AGREEMENT']
          };
        }

        primaryEvent = createBusEvent({
          type: 'TREATY_VIOLATED',
          category: 'DIPLOMATIC',
          sourceSystem: 'PLAYER_COMMAND_DECK',
          sourceEntityType: 'COUNTRY',
          sourceEntityId: 'US',
          targetEntityType: 'TREATY',
          targetEntityIds: [selectedTarget],
          tick: draft.currentTick,
          severity: 'CRITICAL',
          visibility: 'PUBLIC',
          title: `Sigint Treaty Breach Triggered`,
          summary: `High-altitude drone surveillance declassified forward tactical maneuvers violating terms of the ${draft.world.treatiesById[treatyKey].name}.`,
          payload: { treatyId: treatyKey, violatorId: selectedTarget, severity: 40 }
        });
      }

      // Add to queue
      queueBusEvent(draft.world, primaryEvent);

      // If instant, process right now in this atomic block!
      if (executionMode === 'INSTANT') {
        const result = processBusEventQueue(draft.world, draft.countries, draft.currentTick);
        result.logs.forEach(log => {
          draft.globalEventLog.unshift({
            tick: draft.currentTick,
            text: log,
            severity: 'SYSTEM'
          });
        });
      }
    });
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="bg-red-950/40 text-red-400 border border-red-800/50 px-1 text-[8px] font-bold rounded">CRITICAL</span>;
      case 'WARNING':
        return <span className="bg-amber-950/40 text-amber-400 border border-amber-800/40 px-1 text-[8px] font-bold rounded">WARN</span>;
      default:
        return <span className="bg-blue-950/40 text-blue-400 border border-blue-800/30 px-1 text-[8px] font-bold rounded">INFO</span>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'ECONOMIC': return <TrendingUp className="w-3 px-0.5 text-emerald-400 inline-block mr-1" />;
      case 'MILITARY': return <ShieldAlert className="w-3 px-0.5 text-rose-500 inline-block mr-1" />;
      case 'COVERT': return <Layers className="w-3 px-0.5 text-fuchsia-400 inline-block mr-1" />;
      case 'CYBER': return <Zap className="w-3 px-0.5 text-cyan-400 inline-block mr-1" />;
      default: return <Cpu className="w-3 px-0.5 text-amber-400 inline-block mr-1" />;
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-[10px] text-gray-300 bg-[#020502]/95 border-t border-[#1a5c1a] relative select-none">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1a5c1a]/40 bg-[#050f05] px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#00ff44] animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-white uppercase">CLASSIFIED GEOPOLITICAL SIGNAL PIPELINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-gray-500 uppercase">SYS_TRACE: ONLINE</span>
          <div className="h-1.5 w-1.5 rounded-full bg-[#00ff44]" />
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div className="flex flex-1 overflow-hidden divide-x divide-[#1a5c1a]/40 h-full">
        
        {/* Left Side: Controlled Emulator Deck */}
        <div className="w-2/5 p-3 flex flex-col justify-between overflow-y-auto min-h-0 bg-[#030903]/40">
          <div className="space-y-4">
            <div>
              <h2 className="text-[9px] font-bold text-white tracking-wider mb-2 border-b border-[#1a5c1a]/30 pb-1 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#00ff44]" /> Event Trigger Deck
              </h2>
              <p className="text-[8px] text-gray-500 leading-relaxed mb-3">
                Simulate targeted geopolitical operations to deconstruct, seed, and analyze cross-domain cascade pathways.
              </p>
            </div>

            {/* Target Select */}
            <div className="space-y-1.5">
              <label className="text-[8.5px] text-gray-400 uppercase font-semibold">1. Select Target Sovereign</label>
              <select 
                value={selectedTarget} 
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full bg-[#050f05] text-[#00ff44] border border-[#1a5c1a]/55 rounded px-2 py-1 text-[10px] font-mono outline-none cursor-pointer hover:border-[#00ff44]"
              >
                {countryIds.map(id => (
                  <option key={id} value={id}>
                    {id} - {countries[id]?.political?.leaderName || 'Autonomous Regime'}
                  </option>
                ))}
              </select>
            </div>

            {/* Cascade Chain Type */}
            <div className="space-y-2">
              <label className="text-[8.5px] text-gray-400 uppercase font-semibold">2. Operational Cascade Chain</label>
              
              <div className="space-y-1.5">
                {/* Sanctions cascade */}
                <div 
                  onClick={() => { audio.sfxKeyClick(); setSelectedCascade('SANCTIONS'); }}
                  className={`border p-2 rounded cursor-pointer transition-all ${
                    selectedCascade === 'SANCTIONS' 
                      ? 'bg-[#1a5c1a]/15 border-[#00ff44] text-white' 
                      : 'bg-black/35 border-[#1a5c1a]/40 text-gray-400 hover:border-[#1a5c1a]'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-[9px]">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Sanctions Coercion Cascade
                  </div>
                  <div className="text-[8px] text-gray-500 mt-1 pl-4">
                    Embargo → Elevates Stress → Spikes Discontent (Unrest) → Triggers AI Threat Perceptions
                  </div>
                </div>

                {/* Cyber cascade */}
                <div 
                  onClick={() => { audio.sfxKeyClick(); setSelectedCascade('CYBER'); }}
                  className={`border p-2 rounded cursor-pointer transition-all ${
                    selectedCascade === 'CYBER' 
                      ? 'bg-[#1a5c1a]/15 border-[#00ff44] text-white' 
                      : 'bg-black/35 border-[#1a5c1a]/40 text-gray-400 hover:border-[#1a5c1a]'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-[9px]">
                    <Zap className="w-3 h-3 text-cyan-400" /> Cyber Forensics Cascade
                  </div>
                  <div className="text-[8px] text-gray-500 mt-1 pl-4">
                    Grid Breach → Drops Infrastructure Health → Decrypts Signals Intelligence → Alters AI Strategy
                  </div>
                </div>

                {/* Standoff cascade */}
                <div 
                  onClick={() => { audio.sfxKeyClick(); setSelectedCascade('DIPLOMACY'); }}
                  className={`border p-2 rounded cursor-pointer transition-all ${
                    selectedCascade === 'DIPLOMACY' 
                      ? 'bg-[#1a5c1a]/15 border-[#00ff44] text-white' 
                      : 'bg-black/35 border-[#1a5c1a]/40 text-gray-400 hover:border-[#1a5c1a]'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-[9px]">
                    <ShieldAlert className="w-3 h-3 text-rose-500" /> Standoff Ceasefire Breach
                  </div>
                  <div className="text-[8px] text-gray-500 mt-1 pl-4">
                    Violate Treaty Terms → Degrades Compliance → Tanks Mutual Trust → Escalates Border Hostility
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Mode */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[8.5px] text-gray-400 uppercase font-semibold">3. Execution Vector</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { audio.sfxKeyClick(); setExecutionMode('INSTANT'); }}
                  className={`py-1 border rounded text-[9px] font-bold uppercase transition-all ${
                    executionMode === 'INSTANT'
                      ? 'bg-[#00ff44]/10 border-[#00ff44] text-[#00ff44]'
                      : 'bg-black/40 border-[#1a5c1a]/40 text-gray-500 hover:border-[#1a5c1a]/80'
                  }`}
                >
                  ⚡ Instant Resolution
                </button>
                <button
                  type="button"
                  onClick={() => { audio.sfxKeyClick(); setExecutionMode('SIMULATED'); }}
                  className={`py-1 border rounded text-[9px] font-bold uppercase transition-all ${
                    executionMode === 'SIMULATED'
                      ? 'bg-[#00ff44]/10 border-[#00ff44] text-[#00ff44]'
                      : 'bg-black/40 border-[#1a5c1a]/40 text-gray-500 hover:border-[#1a5c1a]/80'
                  }`}
                >
                  ⏳ Queue on Sim Tick
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchCascade}
            className="w-full mt-4 py-2 bg-[#0c240c] border border-[#00ff44] text-[#00ff44] hover:bg-[#1a5c1a]/40 font-bold tracking-widest text-[10px] uppercase rounded flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" /> INITIATE GEOPOLITICAL CASCADE
          </button>
        </div>

        {/* Right Side: Log Tracer Feed */}
        <div className="w-3/5 p-3 flex flex-col justify-between overflow-y-auto min-h-0 bg-black/60">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            
            {/* Sections Tab or title */}
            <div>
              <h2 className="text-[9px] font-bold text-white tracking-wider mb-2 border-b border-[#1a5c1a]/30 pb-1 uppercase flex items-center justify-between">
                <span>🛰️ ACTIVE BUS TRACE</span>
                <span className="text-[7.5px] bg-[#122e12] border border-[#1a5c1a] px-1 text-[#00ff44] font-normal uppercase">
                  Tick {currentTick}
                </span>
              </h2>
            </div>

            {/* Pending signals section */}
            {queuedEvents.length > 0 && (
              <div className="shrink-0 bg-[#0f0702] border border-amber-900/30 p-2 rounded mb-1">
                <div className="text-amber-400 font-bold mb-1 text-[8px] tracking-wider uppercase flex items-center gap-1">
                  <span className="animate-pulse">●</span> PENDING SIGNAL BUFFER ({queuedEvents.length})
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto scrollbar-thin">
                  {queuedEvents.map((evt) => (
                    <div key={evt.id} className="flex justify-between items-center bg-black/35 px-1.5 py-0.5 border border-amber-950/40 rounded-sm">
                      <span className="text-yellow-500 text-[8px] font-bold">{evt.type}</span>
                      <span className="text-gray-500 text-[7px]">Target: {evt.targetEntityIds?.join(',') || 'Global'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cascade trigger chains view */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin min-h-[140px]">
              {historyEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 border border-[#1a5c1a]/15 rounded bg-black/25 p-4 py-8">
                  <Terminal className="w-5 h-5 text-gray-600 mb-2" />
                  <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1">No Trace Pulses Recorded</p>
                  <p className="text-[8px] text-gray-600 text-center max-w-[190px]">
                    Trigger an operation using the deck or advance world simulation steps to generate signal reactions.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.keys(chains).map((chainId) => {
                    const chainEvts = chains[chainId];
                    const originEvt = chainEvts[chainEvts.length - 1]; // First in time (usually last in unshifted log Array)
                    const isExpanded = !!expandedChains[chainId];
                    const numReactions = chainEvts.length - 1;

                    return (
                      <div key={chainId} className="border border-[#1a5c1a]/30 rounded bg-black/40 overflow-hidden">
                        
                        {/* Chain Header */}
                        <div 
                          onClick={() => toggleChain(chainId)}
                          className={`flex items-center justify-between p-1.5 px-2 cursor-pointer select-none transition-all ${
                            isExpanded ? 'bg-[#0f1d0f]' : 'bg-black hover:bg-[#071307]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {isExpanded ? <ChevronDown className="w-3 text-gray-400 shrink-0" /> : <ChevronRight className="w-3 text-gray-400 shrink-0" />}
                            <span className="text-[#00ff44] text-[8.5px] font-extrabold uppercase shrink-0">CHAIN {chainId.substring(5, 10)}</span>
                            <div className="h-3 w-[1px] bg-[#1a5c1a]/30 shrink-0" />
                            <span className="text-white text-[8px] font-bold truncate pl-0.5 uppercase">
                              {originEvt?.title || 'Unknown Cascade'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0 pl-1">
                            {numReactions > 0 && (
                              <span className="bg-[#132c13] text-[#00ff44] px-1 text-[7.5px] rounded border border-[#1a401a]">
                                +{numReactions} REACTION{numReactions > 1 ? 'S' : ''}
                              </span>
                            )}
                            <span className="text-gray-500 text-[8px]">T:{originEvt?.tick}</span>
                          </div>
                        </div>

                        {/* Chain Events List */}
                        {isExpanded && (
                          <div className="divide-y divide-[#1a5c1a]/15 bg-[#030603]/80 p-1.5 space-y-1">
                            {chainEvts.slice().reverse().map((evt, idx) => {
                              const isLeaf = idx > 0;
                              return (
                                <div 
                                  key={evt.id} 
                                  onClick={() => setSelectedTrace(evt)}
                                  className={`p-1.5 rounded cursor-pointer border border-transparent transition-all hover:bg-black/40 ${
                                    selectedTrace?.id === evt.id ? 'border-[#00ff44] bg-[#112911]/30' : ''
                                  } ${isLeaf ? 'ml-3 border-l-2 border-l-[#1a5c1a]/50 pl-2 bg-black/10' : ''}`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-1 overflow-hidden truncate">
                                      {getCategoryIcon(evt.category)}
                                      <span className={`font-bold text-[8.5px] truncate uppercase ${isLeaf ? 'text-[#8eff92]' : 'text-white'}`}>
                                        {evt.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-1">
                                      {getSeverityBadge(evt.severity)}
                                      <span className="text-gray-600 text-[6.5px] font-mono">ID:{evt.id.substring(evt.id.length - 4)}</span>
                                    </div>
                                  </div>
                                  <p className="text-[8px] text-gray-500 leading-normal pl-3 truncate">
                                    {evt.summary}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom visual trace details inspector */}
            {selectedTrace && (
              <div className="shrink-0 bg-[#050c05] border border-[#1a5c1a]/60 rounded-sm p-2 text-[8px] space-y-1.5 scrollbar-none relative overflow-hidden">
                <div className="flex justify-between items-center font-bold text-[#fafafa] border-b border-[#1a5c1a]/40 pb-1">
                  <span className="uppercase text-[8.5px] text-[#00ff44]">Payload Inspector</span>
                  <button 
                    onClick={() => setSelectedTrace(null)}
                    className="text-gray-500 hover:text-white font-bold cursor-pointer text-[10px]"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <div><span className="text-gray-400">EVENT ID:</span> <span className="font-bold text-gray-300">{selectedTrace.id}</span></div>
                  <div><span className="text-gray-400">TYPE:</span> <span className="font-bold text-[#ffd03a]">{selectedTrace.type}</span></div>
                  <div><span className="text-gray-400 font-semibold text-[8px]">SOURCE SYS:</span> <span className="font-bold text-gray-300">{selectedTrace.sourceSystem}</span></div>
                  <div><span className="text-gray-400">CORRELATION:</span> <span className="font-bold text-gray-300">{selectedTrace.correlationId.substring(0, 12)}</span></div>
                  <div><span className="text-gray-400">SOURCE ENTITY:</span> <span className="font-bold text-gray-500">{selectedTrace.sourceEntityType} ({selectedTrace.sourceEntityId})</span></div>
                  <div><span className="text-gray-400">TARGET:</span> <span className="font-bold text-gray-500">{selectedTrace.targetEntityType || 'GLOBAL'} ({selectedTrace.targetEntityIds?.join(',') || 'ALL'})</span></div>
                </div>
                <div className="border-t border-[#1a5c1a]/20 pt-1.5">
                  <div className="text-gray-400 font-bold mb-0.5">PAYLOAD DATA STRUCTS:</div>
                  <pre className="p-1 px-1.5 bg-black/40 border border-[#1a5c1a]/30 text-gray-400 rounded-sm text-[7px] max-h-16 overflow-y-auto scrollbar-thin">
                    {JSON.stringify(selectedTrace.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
