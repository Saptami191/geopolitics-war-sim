import React, { useState, useEffect } from 'react';
import { useNuclearStore } from '../../store/nuclearStore';
import { useDefconStore } from '../../store/defconStore';
import { useWorldStore } from '../../store/worldStore';
import { useLeaderStore } from '../../store/leaderStore';
import { 
  AlertOctagon, 
  Clock, 
  Activity, 
  CornerDownRight, 
  Shield, 
  UserX,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function FalseAlarmDecisionPanel() {
  const currentTick = useWorldStore((s) => s.currentTick);
  const currentDefconLevel = useDefconStore((s) => s.currentDefconLevel);
  const globalEventLog = useWorldStore((s) => s.globalEventLog);
  
  const {
    launchAuthority,
    falseAlarmHistory,
    nc3System,
    decisionClockActive,
    decisionClockExpiryTick,
    completeAssessmentPhase
  } = useNuclearStore();

  const [confirmState, setConfirmState] = useState<'DORMANT' | 'CONFIRMING_GENUINE' | 'CONFIRMING_FALSE' | 'SUCCESS_BANNER'>('DORMANT');
  const [countdown, setCountdown] = useState(3);
  const [doubleClickError, setDoubleClickError] = useState(false);

  // Trigger conditions check
  const showPanel = launchAuthority.status === 'WARNING_RECEIVED' && !launchAuthority.assessmentComplete;

  const warningConfidence = launchAuthority.warningConfidence;
  const perceiveCountryId = launchAuthority.initiatedByWarning?.toUpperCase().includes('CN') ? 'CN' : launchAuthority.initiatedByWarning?.toUpperCase().includes('KP') ? 'KP' : 'RU';

  const priorAlarm = falseAlarmHistory.find(
    (a) => !a.wasCorrectlyResolved && a.perceivedThreatFromCountryId === perceiveCountryId
  );

  const adversaryLeader = useLeaderStore.getState().getLeader(perceiveCountryId);
  const volatility = adversaryLeader 
    ? (adversaryLeader.psychology?.emotions.anxiety || Math.round(adversaryLeader.riskTolerance * 100))
    : 50;
  const humiliation = adversaryLeader?.psychology?.emotions.humiliation || 0;
  const behaviorAnomalous = volatility > 75 || humiliation > 70;

  // Filter global events related to threat country
  const threatCountryName = perceiveCountryId === 'RU' ? 'RUSSIA' : perceiveCountryId === 'CN' ? 'CHINA' : 'KOREA';
  const relatedEvents = globalEventLog
    .filter(e => e.text.toUpperCase().includes(perceiveCountryId) || e.text.toUpperCase().includes(threatCountryName))
    .slice(0, 3);

  // Sound effects & clock ticking in background while modal is shown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPanel && confirmState === 'DORMANT') {
      interval = setInterval(() => {
        // Play tick sound
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(600, audioContext.currentTime);
          gain.gain.setValueAtTime(0.02, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
          osc.start();
          osc.stop(audioContext.currentTime + 0.12);
        } catch (e) {
          // ignore
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showPanel, confirmState]);

  // Handle Double-click safety warning
  const [lastGenuineClicked, setLastGenuineClicked] = useState(0);

  const handleGenuineClick = () => {
    const now = Date.now();
    if (now - lastGenuineClicked < 800) {
      // Successful double click! Start countdown
      setConfirmState('CONFIRMING_GENUINE');
      setCountdown(3);
      setDoubleClickError(false);
    } else {
      setLastGenuineClicked(now);
      setDoubleClickError(true);
      setTimeout(() => setDoubleClickError(false), 2000);
    }
  };

  const handleFalseClick = () => {
    setConfirmState('CONFIRMING_FALSE');
    setCountdown(2);
  };

  // Timer run loop for dialog countdowns
  useEffect(() => {
    if (confirmState === 'CONFIRMING_GENUINE' || confirmState === 'CONFIRMING_FALSE') {
      if (countdown > 0) {
        const t = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(t);
      } else {
        // Expiry reached! Submit actual decision
        if (confirmState === 'CONFIRMING_GENUINE') {
          completeAssessmentPhase(true, warningConfidence, currentTick);
          setConfirmState('DORMANT');
        } else if (confirmState === 'CONFIRMING_FALSE') {
          setConfirmState('SUCCESS_BANNER');
        }
      }
    }
  }, [confirmState, countdown]);

  // Display success banner for 3s before closing
  useEffect(() => {
    if (confirmState === 'SUCCESS_BANNER') {
      const t = setTimeout(() => {
        completeAssessmentPhase(false, warningConfidence, currentTick);
        setConfirmState('DORMANT');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [confirmState]);

  if (!showPanel) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none font-mono">
      
      {/* Red vignette border style for extreme stress */}
      <div className="absolute inset-0 border-[16px] border-red-950/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,13,13,0.15),transparent_75%)] pointer-events-none" />
      {/* Scanline pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-[#0b0c0e] border-2 border-red-800 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.25)] flex flex-col overflow-hidden text-gray-200">
        
        {/* HEADER */}
        <div className="bg-[#1f0909] p-4 border-b border-red-950 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/60 border border-red-800 rounded animate-pulse">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <div className="text-red-500 font-extrabold text-sm tracking-widest uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                ⚠ FLASH PRECEDENCE — NUCLEAR WARNING RECEIVED
              </div>
              <div className="text-xs text-gray-400 mt-1">
                RADAR: <span className="text-gray-200 font-bold">{launchAuthority.initiatedByWarning || 'STRATEGIC ATTACK PROFILE'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* DEFCON Badge */}
            <div className="px-3 py-1.5 bg-[#141212] border border-red-950 rounded text-center">
              <span className="text-[10px] text-red-600 uppercase block font-bold">DEFCON LEVEL</span>
              <span className="font-sans font-extrabold text-lg text-red-500">{currentDefconLevel}</span>
            </div>

            {/* Warning Confidence */}
            <div className={`px-3 py-1.5 bg-[#141212] border border-red-950 rounded text-center`}>
              <span className="text-[10px] text-gray-500 uppercase block font-bold">WARNING CONFIDENCE</span>
              <span className={`font-extrabold text-lg ${
                warningConfidence > 80 ? 'text-red-500 animate-pulse' : warningConfidence >= 50 ? 'text-amber-500' : 'text-yellow-500'
              }`}>
                {warningConfidence}%
              </span>
            </div>
          </div>
        </div>

        {/* DECISION COUNTDOWN BAR */}
        {decisionClockActive && decisionClockExpiryTick !== null && (
          <div className="bg-[#240808]/40 px-4 py-2 border-b border-red-950/40 flex items-center justify-between text-xs text-red-400 font-bold">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 animate-spin-slow" />
              Strategic Response Countdown:
            </span>
            <span className={`text-sm tracking-widest ${(decisionClockExpiryTick - currentTick) < 3 ? 'text-red-500 animate-pulse' : ''}`}>
              {Math.max(0, decisionClockExpiryTick - currentTick)} Ticks Remaining
            </span>
          </div>
        )}

        {/* DIALOG COUNTDOWN ACTIVE OVERLAYS */}
        {confirmState === 'CONFIRMING_GENUINE' && (
          <div className="absolute inset-x-0 bottom-0 top-[60px] bg-red-950/95 z-[99] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Flame className="w-16 h-16 text-red-500 animate-bounce" />
            <h3 className="text-xl font-black text-red-400 uppercase tracking-widest">
              TRANSMITTING THREAT ASSIGNMENT
            </h3>
            <p className="max-w-md text-sm text-red-200 leading-relaxed">
              You are confirming this warning as a genuine strategic attack. This will lock in a state of Nuclear Consultation and launch-mode preparation. This action is irreversible.
            </p>
            <div className="text-6xl font-extrabold text-red-100 animate-ping">
              {countdown}s
            </div>
            <button
              onClick={() => setConfirmState('DORMANT')}
              className="px-5 py-2 bg-gray-900 border border-gray-800 text-gray-300 font-bold hover:bg-gray-800 hover:text-white rounded text-xs tracking-wider"
            >
              ABORT ESCALATION
            </button>
          </div>
        )}

        {confirmState === 'CONFIRMING_FALSE' && (
          <div className="absolute inset-x-0 bottom-0 top-[60px] bg-amber-950/95 z-[99] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Shield className="w-16 h-16 text-amber-500 animate-pulse" />
            <h3 className="text-xl font-black text-amber-400 uppercase tracking-widest">
              FORCES DE-ESCALATION IN PROGRESS
            </h3>
            <p className="max-w-md text-sm text-amber-200 leading-relaxed">
              You are declaring the warning to be a FALSE ALARM. Strategic defensive commands will stand down and reset launch authority circuits back to standby.
            </p>
            <div className="text-6xl font-extrabold text-amber-100">
              {countdown}s
            </div>
            <button
              onClick={() => setConfirmState('DORMANT')}
              className="px-5 py-2 bg-gray-950 border border-gray-800 text-gray-400 font-bold hover:bg-gray-900 hover:text-white rounded text-xs tracking-wider"
            >
              ABORT DE-ESCALATION
            </button>
          </div>
        )}

        {confirmState === 'SUCCESS_BANNER' && (
          <div className="absolute inset-0 bg-[#071d0d] z-[999] flex flex-col items-center justify-center p-8 text-center space-y-4">
            <CheckCircle2 className="w-20 h-20 text-emerald-400 animate-ping mb-2" />
            <h2 className="text-3xl font-black text-emerald-400 uppercase tracking-widest">
              FALSE ALARM RESOLVED
            </h2>
            <div className="px-4 py-2 border border-emerald-800 bg-emerald-950/40 text-emerald-300 rounded font-sans text-sm max-w-sm">
              FORCES STOOD DOWN — Positive status checks complete. System restored to baseline dormant.
            </div>
          </div>
        )}

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          
          {/* SECTION 1: SENSOR INTELLIGENCE */}
          <div className="p-4 bg-[#101216] border border-gray-800 rounded space-y-4">
            <h3 className="text-xs uppercase text-gray-400 pb-2 border-b border-gray-800 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500" />
              1. SENSOR TELEMETRY & INTEL
            </h3>

            {/* NC3 INTEGRITY CARD */}
            <div className="space-y-1.5 p-2.5 bg-[#0a0c0e] rounded border border-gray-900">
              <span className="text-xs text-gray-500">NC3 Network Connectivity:</span>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-300">{nc3System.overallIntegrity}% integrity</span>
                <span className={`px-1.5 py-0.2 rounded-sm text-[10px] font-bold ${
                  nc3System.overallIntegrity >= 60 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400 animate-pulse'
                }`}>
                  {nc3System.overallIntegrity >= 60 ? 'SECURE' : 'SYSTEM DEGRADED'}
                </span>
              </div>
              {nc3System.overallIntegrity < 60 && (
                <span className="block text-[11px] text-red-400 mt-1 font-bold">
                  ⚠ NC3 DEGRADED — Warning reliability reduced
                </span>
              )}
            </div>

            {/* PREVIOUS ALARM WARNING */}
            {priorAlarm && (
              <div className="p-3 bg-amber-950/20 border border-amber-900 rounded text-xs space-y-1">
                <div className="text-amber-500 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  CAUTION: Prior unresolved detection event
                </div>
                <p className="text-gray-400 text-[11px]">
                  Unresolved false alarm trace matches: <strong className="text-amber-400 text-uppercase">{priorAlarm.type}</strong>. System may be recycling stale radar packets.
                </p>
              </div>
            )}

            {/* ALARM LOGS */}
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Recent False Alarm History logs:</span>
              <div className="space-y-1.5">
                {falseAlarmHistory.slice(-2).map((a) => (
                  <div key={a.id} className="text-[11px] bg-black/60 p-2 border border-gray-900 rounded text-gray-400 flex items-center justify-between">
                    <span>{a.type}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Averted
                    </span>
                  </div>
                ))}
                {falseAlarmHistory.length === 0 && (
                  <span className="text-xs text-gray-600 italic block font-sans">No prior alerts recorded in active cache.</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: ADVERSARY PSYCHOLOGY */}
          <div className="p-4 bg-[#101216] border border-gray-800 rounded space-y-4">
            <h3 className="text-xs uppercase text-gray-400 pb-2 border-b border-gray-800 font-bold flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-amber-500" />
              2. ADVERSARY INTEL ANALYSIS
            </h3>

            {/* PSYCHOLOGY METER */}
            <div className="p-3 bg-black/50 border border-gray-900 rounded space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Target: <strong className="text-gray-200">{threatCountryName}</strong> leadership
                </span>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold border ${
                  behaviorAnomalous 
                    ? 'bg-amber-950/40 text-amber-500 border-amber-900 animate-pulse' 
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                }`}>
                  {behaviorAnomalous ? 'HIGH RISK VOLATILITY' : 'NORMAL POSTURE'}
                </span>
              </div>

              {adversaryLeader ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 text-[11px]">Leader Name:</span>
                    <div className="text-gray-300 font-bold">{adversaryLeader.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#0b0c0e] p-1.5 border border-gray-900 rounded">
                      <span className="text-gray-500 block">Anxiety:</span>
                      <span className={`font-bold ${volatility > 70 ? 'text-red-400' : 'text-gray-300'}`}>{volatility}%</span>
                    </div>
                    <div className="bg-[#0b0c0e] p-1.5 border border-gray-900 rounded">
                      <span className="text-gray-500 block">Humiliation:</span>
                      <span className={`font-bold ${humiliation > 60 ? 'text-red-400' : 'text-gray-300'}`}>{humiliation}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-gray-500 italic text-xs font-sans">Leader dossier offline or inaccessible.</span>
              )}
            </div>

            {/* ADVERSARY RELATED GLOBAL EVENTS */}
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Related global communications log:</span>
              <div className="space-y-1.5 text-[11px]">
                {relatedEvents.map((ev, idx) => (
                  <div key={idx} className="bg-black/40 p-2 border border-gray-900 rounded text-gray-400 leading-relaxed font-sans flex gap-1.5 items-start">
                    <CornerDownRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-600" />
                    <span>{ev.text}</span>
                  </div>
                ))}
                {relatedEvents.length === 0 && (
                  <span className="text-xs text-gray-600 italic block font-sans">No recent satellite transmissions or intercepted backchannels regarding {threatCountryName}.</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* DECISION BUTTONS FOOTER */}
        <div className="bg-[#141519] p-5 border-t border-gray-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="text-xs text-gray-500 max-w-sm font-sans tracking-wide">
            WARNING: Committing an incorrect genuine command triggers nuclear war preparation. Declaring an incorrect stand-down stops strategic responses during incoming flights.
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* STAND DOWN BUTTON */}
            <button
              onClick={handleFalseClick}
              className="w-full sm:w-auto px-6 py-3 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800 hover:border-amber-600 text-amber-200 font-bold transition-all rounded shadow-md text-xs tracking-wider uppercase select-none cursor-pointer"
            >
              [DECLARE FALSE ALARM — STAND DOWN]
            </button>

            {/* GENUINE CONFIRM BUTTON */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={handleGenuineClick}
                className="w-full sm:w-auto px-6 py-3 bg-red-950 hover:bg-red-900 border border-red-800 hover:border-red-600 text-red-200 font-extrabold transition-all rounded shadow-md text-xs tracking-wider uppercase select-none cursor-pointer"
              >
                [CONFIRM GENUINE THREAT]
              </button>
              {doubleClickError && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-950 border border-red-800 text-red-400 font-bold text-[10px] px-3 py-1 rounded shadow-lg whitespace-nowrap animate-bounce uppercase">
                  ⚠ DOUBLE_CLICK SAFETY TRIGGERED 
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
