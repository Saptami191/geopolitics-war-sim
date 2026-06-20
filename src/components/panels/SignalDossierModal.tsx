import React, { useEffect, useState } from 'react';
import { useSigintStore } from '../../store/sigintStore';
import { useWorldStore } from '../../store/worldStore';
import { useArachneStore } from '../../store/arachneStore';
import { useFinintStore } from '../../store/finintStore';
import { useMirrorStore } from '../../store/mirrorStore';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import { useBlackMarketStore } from '../../store/blackMarketStore';
import { getCorroborationTrail } from '../../utils/sigintCorroborationUtils';
import { audio } from '../../utils/audio';
import { SigintSignal } from '../../types';

interface SignalDossierModalProps {
  signal: SigintSignal;
  onClose: () => void;
}

export default function SignalDossierModal({ signal, onClose }: SignalDossierModalProps) {
  const store = useSigintStore();
  const currentTick = useWorldStore((s) => s.currentTick);
  const arachneFeeds = useArachneStore((s) => s.arachne_feeds || s.feed || []);
  const finintState = useFinintStore();
  const countries = useWorldStore((s) => s.countries);

  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [staticString, setStaticString] = useState('████ ████ ████ ████');

  // Static noise generator for HIDDEN signals
  useEffect(() => {
    if (signal.status !== 'HIDDEN') return;
    const interval = setInterval(() => {
      const chars = '█▒░▄▀■ ';
      let str = '';
      for (let i = 0; i < 40; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
      }
      setStaticString(str);
    }, 120);
    return () => clearInterval(interval);
  }, [signal.status]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const allSignals = store.u8200Signals;
  const nodes = getCorroborationTrail(signal, allSignals, arachneFeeds as any, finintState, currentTick);

  // Department Distribution Operations
  const handleRouteToDivision = (division: 'CIA' | 'CYBER' | 'MILITARY' | 'DIPLOMATIC') => {
    audio.sfxKeyClick();
    const formattedContent = signal.rawContent || `Intercept involving target space ${signal.sourceNationId}`;

    if (division === 'CIA') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → CIA] INTEL DEPLOYMENT: Formally routed CONFIRMED intercept from target ${signal.sourceNationId} [TICK ${currentTick}].`,
        'INFO'
      );
      useMirrorStore.getState().recordPlayerAction?.('COVERT', 15, currentTick);
    } else if (division === 'CYBER') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → CYBER] DATA HARVEST: Deployed network payload proxy routing for target ${signal.sourceNationId}.`,
        'INFO'
      );
      useMirrorStore.getState().recordPlayerAction?.('CYBER', 15, currentTick);
    } else if (division === 'MILITARY') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → MILITARY] COMBAT DIRECTIVE: Dispatched staging and force movement indicators for target ${signal.sourceNationId}.`,
        'INFO'
      );
      useMirrorStore.getState().recordPlayerAction?.('MILITARY', 15, currentTick);
    } else if (division === 'DIPLOMATIC') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → DIPLOMACY] ADVISORY FILED: Backchannel warning delivered concerning ${signal.sourceNationId} security patterns.`,
        'WARNING'
      );
      useMirrorStore.getState().recordPlayerAction?.('DIPLOMACY', 15, currentTick);
    }

    // Record cost in the consequence or oversight layers
    const oversightReason = `SIGINT transfer involving high security parameters for target ${signal.sourceNationId}`;
    try {
      // Small compliance penalty or blowback hazard for over-sharing of raw data
      useBlackMarketStore.getState().increaseSuspicion?.(2);
    } catch {
      // safe fallback
    }

    store.u8200MarkSignalTasked(signal.id, division);
    useUIStore?.getState()?.pushAlert?.({
      title: `${division} DIVISION TASKED`,
      message: `Operational security envelope processed. Target files delivered for routing to ${division}.`,
      type: 'INFO'
    });
  };

  const handleMarkAsAnomaly = () => {
    audio.sfxKeyClick();
    store.u8200MarkSignalAnomaly(signal.id);
  };

  const handleDismiss = () => {
    audio.sfxKeyClick();
    store.u8200DismissSignal(signal.id);
    onClose();
  };

  // Assessment generator based on category + channel combination
  const getAnalystAssessment = () => {
    const nat = countries[signal.sourceNationId]?.name || signal.sourceNationId;
    
    if (signal.category === 'WMD_INDICATOR') {
      return `PRIORITY ASSESSMENT // CLASS III: This intercept points to proliferation-adjacent activities inside ${nat}. Under nuclear non-proliferation and chemical transport parameters, this warrants immediate, heightened cross-referencing with local Arachne OSINT chains. Recommend routing to CIA covert operations to assess staging grounds. False positives carry severe reputational blowback in Allied councils.`;
    }

    if (signal.category === 'MILITARY_MOVEMENT' && (signal.channel === 'MILITARY' || signal.channel === 'IMAGERY')) {
      return `TACTICAL DEFENSE ASSESSMENT: Possible force mobilization or logistical alignment detected in the ${nat} sector. Heavy equipment moving in tactical stages suggests pre-conflict maneuvering or high-readiness posture. Route to MILITARY COMMAND to align intercept patterns with tactical navy patrols.`;
    }

    if (signal.category === 'LEADERSHIP_SIGNAL' && signal.channel === 'DIPLOMATIC') {
      return `STRATEGIC ASSESSMENT: Senior executive movements logged. Encrypted secure protocol activations suggest emergency war council sessions or off-grid communications inside ${nat}. Advise routing this to CIA and DIPLOMATIC CORPS concurrently for swift strategic assessment.`;
    }

    if (signal.category === 'ECONOMIC_ANOMALY') {
      return `FINANCIAL SHIELD ALERT: Massive capital deviations or atypical trade flows of bulk dual-use equipment logged. This frequently precedes procurement schemes or evasive movements around imposed financial embargos. Treat signal as a critical precursor for FININT cross-referencing.`;
    }

    if (signal.category === 'DIPLOMATIC_COMM' && signal.channel === 'TELECOM') {
      return `DIPLOMATIC SPECTRUM AUDIT: Active back-channel communications logged. This may indicate a secret bilateral initiative, or highly structured cyber-diversion / spoofing protocols. Route data with care until corroborating links are verified.`;
    }

    return `GENERAL INTELLIGENCE UPDATE: Collected data indicators show non-standard activity indices inside ${nat}. Continue monitoring pattern-of-life baselines. Do not action unilaterally until further corroborating evidence is mounted.`;
  };

  const statusColors = {
    HIDDEN: 'text-gray-500 bg-gray-950/40 border-gray-800',
    INFERRED: 'text-amber-500 bg-amber-950/20 border-amber-900/50',
    CONFIRMED: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/60 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
  };

  const channelColors = {
    DIPLOMATIC: 'text-blue-400 border-blue-900/50 bg-blue-950/10',
    TELECOM: 'text-purple-400 border-purple-900/50 bg-purple-950/10',
    MILITARY: 'text-red-400 border-red-900/50 bg-red-950/10',
    CYBER: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/10',
    COMMERCIAL: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/10',
    IMAGERY: 'text-sky-400 border-sky-900/50 bg-sky-950/10'
  };

  const isExpiringSoon = signal.expiresAtTick - currentTick < 5;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={() => onClose()}
    >
      <div 
        className="w-full max-w-3xl bg-[#030707] border border-cyan-900/60 shadow-[0_0_50px_rgba(0,180,180,0.2)] flex flex-col font-mono text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Classification Header */}
        <div className="flex justify-between items-center bg-[#061818]/60 border-b border-cyan-900/40 px-4 py-3 select-none">
          <div className="flex items-center gap-3">
            <span className="bg-red-950 text-red-500 border border-red-900 text-[9px] px-1.5 py-0.5 tracking-[0.25em] font-black">
              TOP SECRET // SIGINT
            </span>
            <span className="text-cyan-800 text-[10px] tracking-wider">
              ID: {signal.id}
            </span>
          </div>
          <button 
            onClick={() => { audio.sfxKeyClick(); onClose(); }}
            className="text-cyan-700 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest text-[9px] border border-cyan-900/40 px-2 py-0.5"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6 max-h-[80vh]">
          
          {/* SECTION 1: METADATA PANEL */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/50 border border-cyan-950/40 p-3">
            <div>
              <div className="text-[9px] text-cyan-800 tracking-wider">VISIBILITY TIER</div>
              <span className={`inline-block px-2 py-0.5 mt-1 border text-[9px] font-bold ${statusColors[signal.status]}`}>
                {signal.status}
              </span>
            </div>
            <div>
              <div className="text-[9px] text-cyan-800 tracking-wider">CONFIDENCE</div>
              <span className="inline-block mt-1 text-cyan-400 font-bold">
                {signal.confidence}
              </span>
            </div>
            <div>
              <div className="text-[9px] text-cyan-800 tracking-wider">SOURCE TARGET</div>
              <span className="inline-block mt-1 text-white font-bold tracking-widest">
                {countries[signal.sourceNationId]?.name || signal.sourceNationId} ({signal.sourceNationId})
              </span>
            </div>
            <div>
              <div className="text-[9px] text-cyan-800 tracking-wider">EXPIRATION CHRONO</div>
              <div className="mt-1 font-bold">
                {isExpiringSoon ? (
                  <span className="text-red-500 animate-pulse">EXPIRING IN {signal.expiresAtTick - currentTick}T</span>
                ) : (
                  <span className="text-cyan-600">{signal.expiresAtTick - currentTick} TICKS REMAIN</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-cyan-950/30 p-2.5 bg-cyan-950/5">
              <span className="text-[9px] text-cyan-800 uppercase block tracking-wider mb-1">LOGGED CHANNEL</span>
              <span className={`inline-block border px-2 py-0.5 text-[9px] font-bold ${channelColors[signal.channel]}`}>
                {signal.channel}
              </span>
            </div>
            <div className="border border-cyan-950/30 p-2.5 bg-cyan-950/5">
              <span className="text-[9px] text-cyan-800 uppercase block tracking-wider mb-1">SIGNAL CLASSIFICATION</span>
              <span className="inline-block text-amber-500 font-bold uppercase text-[9px]">
                {signal.category.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* SECTION 2: RAW MONOSPACE CONTENT */}
          <div className="space-y-2">
            <div className="text-cyan-600 font-extrabold tracking-widest uppercase border-b border-cyan-950/40 pb-1 text-[10px]">
              — INTERCEPT DECODING READOUT —
            </div>
            <div className="bg-[#020505] border border-cyan-900/35 p-4 rounded-none font-mono min-h-[70px] relative overflow-hidden flex items-center">
              {signal.status === 'HIDDEN' ? (
                <div className="w-full text-center text-cyan-900 text-sm select-none break-all select-none">
                  <span className="block text-[10px] uppercase text-cyan-800 mb-2">RECEIVING DECRYPTION STREAM...</span>
                  <p className="tracking-widest font-bold">{staticString}</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="text-[9px] text-cyan-800 mb-1 border-b border-cyan-950/20 pb-0.5 flex justify-between">
                    <span>{signal.status === 'CONFIRMED' ? '[ VERIFIED COGNITION SIGNATURE ]' : '[ RAW UNCONFIRMED INTERCEPT ]'}</span>
                    <span>TICK: {signal.detectedAtTick}</span>
                  </div>
                  <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed select-text font-bold text-sm">
                    {signal.rawContent}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: ANALYST INTELLIGENCE EVALUATION */}
          <div className="space-y-2">
            <div className="text-cyan-600 font-extrabold tracking-widest uppercase border-b border-cyan-950/40 pb-1 text-[10px]">
               — SIGINT OPERATIONS ASSESSMENT —
            </div>
            <div className="bg-black/40 border border-cyan-950/30 p-3 leading-relaxed text-gray-400 text-[11px] font-sans antialiased">
              {getAnalystAssessment()}
            </div>
          </div>

          {/* SECTION 4: EVIDENCE NODE CHRONOLOGY */}
          <div className="space-y-3">
            <div className="text-cyan-600 font-extrabold tracking-widest uppercase border-b border-cyan-900/20 pb-1 text-[10px]">
              — EVIDENCE CORROBORATION TRACK —
            </div>
            <div className="pl-4 border-l border-cyan-950/50 space-y-4 py-2 relative">
              {nodes.map((node, i) => {
                const nodeColors = {
                  SIGINT: 'text-cyan-400 border-cyan-900/50',
                  SIGINT_LINK: 'text-purple-400 border-purple-900/50',
                  ARACHNE: 'text-emerald-400 border-emerald-900/50',
                  FININT: 'text-amber-500 border-amber-900/30',
                  ANALYST_OVERRIDE: 'text-cyan-400 border-sky-900/50'
                };

                return (
                  <div key={i} className="relative flex items-start gap-3">
                    {/* Visual Connector Dot */}
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#030707] border border-cyan-600 z-10" />
                    
                    <div className="flex-1 border border-cyan-950/20 bg-black/40 p-2">
                      <div className="flex justify-between items-center text-[10px] mb-1 font-bold">
                        <span className={nodeColors[node.type]}>{node.label}</span>
                        <span className="text-[9px] text-cyan-800">TICK {node.tick}</span>
                      </div>
                      <p className="text-gray-500 text-[10px] leading-relaxed">
                        {node.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-black border-t border-cyan-950/50 p-4 shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          
          {/* Action Row A: Operational Routing */}
          {signal.status === 'CONFIRMED' && (
            <div className="flex-1 space-y-1.5">
              <span className="text-[9px] text-cyan-800 uppercase block tracking-wider">DISTRIBUTE OPERATIONAL INTELLIGENCE:</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleRouteToDivision('CIA')}
                  disabled={signal.taskedTo?.includes('CIA')}
                  className={`py-1.5 border text-[9px] font-bold tracking-widest text-center transition-all ${
                    signal.taskedTo?.includes('CIA') 
                      ? 'border-gray-900 text-gray-700 cursor-not-allowed bg-black' 
                      : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                  }`}
                  title="Route to Central Covert Intelligence Bureau"
                >
                  {signal.taskedTo?.includes('CIA') ? 'ROUTE (CIA)' : '→ CIA'}
                </button>
                <button
                  onClick={() => handleRouteToDivision('CYBER')}
                  disabled={signal.taskedTo?.includes('CYBER')}
                  className={`py-1.5 border text-[9px] font-bold tracking-widest text-center transition-all ${
                    signal.taskedTo?.includes('CYBER') 
                      ? 'border-gray-900 text-gray-700 cursor-not-allowed bg-black' 
                      : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                  }`}
                >
                  {signal.taskedTo?.includes('CYBER') ? 'ROUTE (CYB)' : '→ CYBER'}
                </button>
                <button
                  onClick={() => handleRouteToDivision('MILITARY')}
                  disabled={signal.taskedTo?.includes('MILITARY')}
                  className={`py-1.5 border text-[9px] font-bold tracking-widest text-center transition-all ${
                    signal.taskedTo?.includes('MILITARY') 
                      ? 'border-gray-900 text-gray-700 cursor-not-allowed bg-black' 
                      : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                  }`}
                >
                  {signal.taskedTo?.includes('MILITARY') ? 'ROUTE (MIL)' : '→ MILITARY'}
                </button>
                <button
                  onClick={() => handleRouteToDivision('DIPLOMATIC')}
                  disabled={signal.taskedTo?.includes('DIPLOMATIC')}
                  className={`py-1.5 border text-[9px] font-bold tracking-widest text-center transition-all ${
                    signal.taskedTo?.includes('DIPLOMATIC') 
                      ? 'border-gray-900 text-gray-700 cursor-not-allowed bg-black' 
                      : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                  }`}
                >
                  {signal.taskedTo?.includes('DIPLOMATIC') ? 'ROUTE (DIP)' : '→ DIPLOMACY'}
                </button>
              </div>
            </div>
          )}

          {/* Action Row B: Anomaly flagging and Dismissal */}
          <div className="flex gap-2 shrink-0 md:self-end">
            {!signal.anomalyFlag && (
              <button
                onClick={handleMarkAsAnomaly}
                className="px-3 py-1.5 border border-red-950 hover:bg-red-900/10 text-red-500 text-[9px] font-bold tracking-widest uppercase transition-all"
              >
                ⚠ MANIFEST ANOMALY
              </button>
            )}

            {confirmDismiss ? (
              <div className="flex gap-1.5">
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 bg-red-950 text-red-500 border border-red-800 text-[9px] font-bold uppercase"
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => { audio.sfxKeyClick(); setConfirmDismiss(false); }}
                  className="px-2.5 py-1.5 border border-gray-800 text-gray-500 text-[9px] font-bold uppercase hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => { audio.sfxKeyClick(); setConfirmDismiss(true); }}
                className="px-3 py-1.5 border border-gray-900 text-gray-600 hover:text-red-400 hover:border-red-950 transition-colors text-[9px] font-bold tracking-widest uppercase"
              >
                🗑 EXPUNGE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

