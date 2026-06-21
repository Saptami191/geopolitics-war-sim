import React, { useState, useMemo } from 'react';
import { PanelFxShell } from '../fx/PanelFxShell';
import { useSigintStore } from '../../store/sigintStore';
import { useWorldStore } from '../../store/worldStore';
import { useArachneStore } from '../../store/arachneStore';
import { useFinintStore } from '../../store/finintStore';
import { useMirrorStore } from '../../store/mirrorStore';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import { audio } from '../../utils/audio';
import { 
  SigintChannel, 
  SigintCategory, 
  SigintCollectionAsset, 
  SigintSignal, 
  SigintStatus 
} from '../../types';
import SignalDossierModal from './SignalDossierModal';
import { getCorroborationTrail } from '../../utils/sigintCorroborationUtils';

interface U8200CommandPanelProps {
  onClose: () => void;
}

export default function U8200CommandPanel({ onClose }: U8200CommandPanelProps) {
  const store = useSigintStore();
  const currentTick = useWorldStore((s) => s.currentTick);
  const countries = useWorldStore((s) => s.countries);
  const arachneFeeds = useArachneStore((s) => s.arachne_feeds || s.feed || []);
  const finintState = useFinintStore();

  const [activeTab, setActiveTab] = useState<'ASSETS' | 'SIGNALS' | 'PATTERNS' | 'ANOMALIES' | 'TASKING'>('SIGNALS');

  // Modal State
  const [selectedSignal, setSelectedSignal] = useState<SigintSignal | null>(null);

  // TAB 1: ASSETS States
  const [deployTarget, setDeployTarget] = useState<string>('');
  const [deployChannel, setDeployChannel] = useState<SigintChannel>('TELECOM');
  const [deployCoverage, setDeployCoverage] = useState<number>(50);
  const [assetConfirmRetractId, setAssetConfirmRetractId] = useState<string | null>(null);

  // TAB 2: SIGNALS Filters State
  const [searchNation, setSearchNation] = useState<string>('');
  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterAnomaliesOnly, setFilterAnomaliesOnly] = useState<boolean>(false);
  const [expandedTrailSignalId, setExpandedTrailSignalId] = useState<string | null>(null);

  // Notification Banner
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const activeAssets = store.u8200Assets.filter(a => a.isActive);

  // BUDGET Calculations & States
  const budget = store.u8200Budget;
  const budgetRatio = budget.totalAllocated > 0 ? (budget.remaining / budget.totalAllocated) * 100 : 0;
  const isBudgetCritical = budget.totalAllocated > 0 && (budget.remaining / budget.totalAllocated) < 0.20;

  // Asset Cost Formula
  const calculatedDeployDailyCost = Math.ceil(deployCoverage / 10);

  // Assets Declassification
  const handleDeployAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployTarget || deployCoverage <= 0) return;
    
    // Check min 5 ticks of dailyCost runway required
    if (budget.remaining < calculatedDeployDailyCost * 5) {
      audio.sfxKeyClick();
      showFeedback('INSUFFICIENT BUDGET: REQUIRES A MINIMUM 5-TICK OPERATION RUNWAY.');
      return;
    }

    audio.sfxKeyClick();
    store.u8200DeployAsset({
      targetNationId: deployTarget,
      channel: deployChannel,
      coverageLevel: deployCoverage,
      dailyCost: calculatedDeployDailyCost,
      isActive: true,
    }, currentTick);

    showFeedback('ASSET DEPLOYED. SPECIFIC SPECTRUM SCANNING INTIATED FOR THE COMING TICK.');
    setDeployTarget('');
    setDeployCoverage(50);
  };

  const handleRetractAssetConfirm = (assetId: string) => {
    audio.sfxKeyClick();
    store.u8200RetractAsset(assetId);
    setAssetConfirmRetractId(null);
    showFeedback('COLLECTION ASSET DISMANTLED. SPECTRUM SPEECH CHANNELS RETRACTED.');
  };

  const handleAllocateExtraBudget = () => {
    audio.sfxKeyClick();
    store.u8200AllocateBudget(100);
    showFeedback('BUDGET INCREASED BY 100 UNITS via OVERSIGHT APPROVAL ACTION.');
  };

  // TAB 2: SIGNALS Filter Logic
  const filteredSignals = useMemo(() => {
    return store.u8200Signals.filter(sig => {
      // Exclude expired
      if (sig.expiresAtTick <= currentTick) return false;

      // Search by Nation ID
      if (searchNation && !sig.sourceNationId.toLowerCase().includes(searchNation.toLowerCase())) return false;

      // Filter by Channel
      if (filterChannel !== 'ALL' && sig.channel !== filterChannel) return false;

      // Filter by Status
      if (filterStatus !== 'ALL' && sig.status !== filterStatus) return false;

      // Filter by Category
      if (filterCategory !== 'ALL' && sig.category !== filterCategory) return false;

      // Filter only anomalies
      if (filterAnomaliesOnly && !sig.anomalyFlag) return false;

      return true;
    }).slice().reverse(); // Show newest first
  }, [store.u8200Signals, searchNation, filterChannel, filterStatus, filterCategory, filterAnomaliesOnly, currentTick]);

  // Tab 3: Baselines activity summary calculations
  const baselinesLog = useMemo(() => {
    return (store.u8200Baselines || []).map(baseline => {
      // Signals count in last 10 ticks
      const signalCount = store.u8200Signals.filter(
        s => s.sourceNationId === baseline.nationId && currentTick - s.detectedAtTick <= 10
      ).length;

      let status: 'HIGH_ACTIVITY' | 'REDUCED_ACTIVITY' | 'NORMAL' = 'NORMAL';
      if (signalCount > baseline.baselineScore * 0.015) {
        status = 'HIGH_ACTIVITY';
      } else if (signalCount < baseline.baselineScore * 0.005) {
        status = 'REDUCED_ACTIVITY';
      }

      return {
        ...baseline,
        signalCount,
        status
      };
    });
  }, [store.u8200Baselines, store.u8200Signals, currentTick]);

  // Tab 4: Anomaly alert console
  const anomalyAlerts = useMemo(() => {
    return store.u8200Signals.filter(s => s.anomalyFlag === true && s.expiresAtTick > currentTick).slice().reverse();
  }, [store.u8200Signals, currentTick]);

  const unreviewedAnomaliesCount = anomalyAlerts.filter(s => !s.reviewed).length;

  const handleAnomalyGenuine = (sig: SigintSignal) => {
    audio.sfxKeyClick();
    store.u8200MarkSignalReviewed(sig.id);
    
    // Promote signal confidence one tier
    try {
      store.u8200Signals = (store.u8200Signals || []).map(s => {
        if (s.id === sig.id) {
          const confTierMap: Record<string, string> = {
            RUMINT: 'SIGINT',
            OSINT: 'SIGINT',
            SIGINT: 'CONFIRMED',
            CONFIRMED: 'CONFIRMED'
          };
          const visTierMap: Record<string, string> = {
            HIDDEN: 'INFERRED',
            INFERRED: 'CONFIRMED',
            CONFIRMED: 'CONFIRMED'
          };
          return {
            ...s,
            confidence: confTierMap[s.confidence] || 'CONFIRMED',
            status: visTierMap[s.status] || 'CONFIRMED',
            analystElevated: true
          } as SigintSignal;
        }
        return s;
      });
    } catch {
      // Safe fallback if manual mutate is blocked by store structure
    }

    showFeedback('ANALYST MANUAL ELEVATION EXECUTED. CONFIDENCE RATIO PROPAGATED.');

    // If signal promoted to confirmed, send OSINT item
    const verifyStatus = store.u8200Signals.find(s => s.id === sig.id)?.status === 'CONFIRMED' || sig.status === 'INFERRED';
    if (verifyStatus) {
      useArachneStore.getState().addLiveIntelItem({
        themeTags: ['INTELLIGENCE'],
        sourceType: 'SIGINT',
        urgency: 'HIGH',
        confidence: 'HIGH',
        freshnessState: 'BREAKING',
        title: `ANALYST OVERRIDE: VERIFIED ANOMALOUS FOOTPRINT`,
        summary: `Senior Unit 8200 review confirms structural deviation in target country [${sig.sourceNationId}].`,
        fullBrief: sig.rawContent,
        countryIds: [sig.sourceNationId],
        regionIds: [],
        relatedLeaderIds: []
      });
    }
  };

  const handleAnomalyDeceptive = (sigId: string) => {
    audio.sfxKeyClick();
    store.u8200MarkSignalReviewed(sigId);
    store.u8200SetSignalDeceptionFlag(sigId, true);
    showFeedback('SIGNAL MARKED DECEPTIVE AND ARCHIVED FOR POST-OPERATIONAL DEBRIEFING.');
  };

  const handleAnomalyHold = (sigId: string) => {
    audio.sfxKeyClick();
    store.u8200MarkSignalReviewed(sigId);
    showFeedback('DECISION PUT ON STANDBY. ADVISING GATHER OF ADDITIONAL EVIDENCE NODES.');
  };

  const handleDeceptionReinstate = (sigId: string) => {
    audio.sfxKeyClick();
    store.u8200SetSignalDeceptionFlag(sigId, false);
    showFeedback('DECEPTION ARCHIVE CLEARED. SIGNAL RETURNED TO QUEUE.');
  };

  // Tab 5: Confirmed signals for Export Tasking Layout
  const confirmedSignals = useMemo(() => {
    return store.u8200Signals.filter(s => s.status === 'CONFIRMED' && s.expiresAtTick > currentTick).slice().reverse();
  }, [store.u8200Signals, currentTick]);

  const handleRouteTasking = (sig: SigintSignal, division: 'CIA' | 'CYBER' | 'MILITARY' | 'DIPLOMATIC') => {
    audio.sfxKeyClick();
    if (division === 'CIA') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → CIA] INTELLIGENCE SHARING: Exchanged CONFIRMED signal dossier from target ${sig.sourceNationId}.`,
        'INFO'
      );
      useMirrorStore.getState().recordPlayerAction?.('COVERT', 15, currentTick);
    } else if (division === 'CYBER') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → CYBER] SIGNALS ENVELOPE SHARED: Decrypted cyber profile shared for targeting node ${sig.sourceNationId}.`,
        'INFO'
      );
      useMirrorStore.getState().recordPlayerAction?.('CYBER', 15, currentTick);
    } else if (division === 'MILITARY') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → MILITARY] FORCE PREPARATION DIRECTIVE: Staged telemetry and defense profiles for ${sig.sourceNationId}.`,
        'INFO'
      );
      useMirrorStore.getState().recordPlayerAction?.('MILITARY', 15, currentTick);
    } else if (division === 'DIPLOMATIC') {
      useWorldStore.getState().addGlobalEvent(
        `[U8200 → DIPLOMACY] CHIRAL ADVISORY TRIGGERED: Transmitted raw intercept telemetry details regarding ${sig.sourceNationId}.`,
        'WARNING'
      );
      useMirrorStore.getState().recordPlayerAction?.('DIPLOMACY', 15, currentTick);
    }

    store.u8200MarkSignalTasked(sig.id, division);
    showFeedback(`SIGNAL TASKED TO ${division} FOR COMPREHENSIVE COMBAT/DIPLOMATIC INTEGRATION.`);
  };

  const taskingHistory = useMemo(() => {
    return store.u8200Signals.filter(s => s.tasked === true).slice(-50).reverse();
  }, [store.u8200Signals]);

  return (
    <PanelFxShell panelId="U8200_COMMAND" relevantFxTypes={['CYBER_ATTACK']}>
      <div className="flex flex-col h-full bg-[#030606] text-gray-300 font-mono text-xs leading-relaxed overflow-hidden">
        
        {/* PANEL HEADER */}
        <header className="p-4 border-b border-cyan-900/60 bg-[#061515]/30 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 animate-pulse" />
              <h1 className="text-cyan-400 font-extrabold tracking-[0.25em] text-sm uppercase">
                COGNITIVE ECHO // UNIT 8200 COMMAND PANEL
              </h1>
            </div>
            
            {/* Feedback ticker */}
            <div className="text-[10px] text-cyan-700 font-bold mt-1 tracking-wider uppercase h-4 flex items-center">
              {feedbackMsg ? (
                <span className="text-amber-500 animate-pulse">◆ {feedbackMsg}</span>
              ) : (
                <span>SECURE CRYPTO CHANNEL ATTACHED // TICK: {currentTick}</span>
              )}
            </div>
          </div>

          <button 
            onClick={() => { audio.sfxKeyClick(); onClose(); }}
            className="text-cyan-800 hover:text-cyan-400 border border-cyan-900/50 hover:bg-cyan-950/20 px-3 py-1 transition-all uppercase font-bold tracking-widest text-[10px]"
          >
            DISCONNECT
          </button>
        </header>

        {/* TAB NAVIGATION CHASSIS */}
        <div className="flex border-b border-cyan-900/45 bg-black shrink-0 overflow-x-auto">
          {([
            { id: 'ASSETS', label: '1. COLLECTION ASSETS' },
            { id: 'SIGNALS', label: '2. SIGINT FEED' },
            { id: 'PATTERNS', label: '3. PATTERN ANALYSIS' },
            { id: 'ANOMALIES', label: `4. ANOMALIES (${unreviewedAnomaliesCount})` },
            { id: 'TASKING', label: '5. OPERATIONS TASKING' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              style={{ flexShrink: 0 }}
              onClick={() => { audio.sfxKeyClick(); setActiveTab(tab.id); }}
              className={`flex-1 py-3 px-4 min-w-[120px] font-bold tracking-wider text-[10px] transition-all border-r border-cyan-950/30 text-center uppercase
                ${activeTab === tab.id 
                  ? 'bg-cyan-950/35 text-cyan-400 border-b-2 border-b-cyan-400 shadow-[inset_0_-2px_15px_rgba(34,211,238,0.12)]' 
                  : 'text-cyan-900 hover:text-cyan-500 hover:bg-cyan-950/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB WORKSPACE */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 bg-[#010606] text-gray-400 space-y-6">

          {/* ======================================= */}
          {/* TAB 1: ASSETS */}
          {/* ======================================= */}
          {activeTab === 'ASSETS' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* HUD Budget Header */}
              <div className="border border-cyan-900/30 p-4 bg-black/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div>
                  <div className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest mb-1">UNIT 8200 FISCAL CAPACITORS</div>
                  <div className="text-sm font-extrabold text-white">
                    BUDGET: <span className="text-cyan-400">{budget.remaining}</span> / <span className="text-cyan-700">{budget.totalAllocated}</span> UNITS
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-cyan-800 uppercase font-bold tracking-wider mb-1">
                    <span>RUNWAY ENERGY</span>
                    {isBudgetCritical && <span className="text-red-500 animate-pulse tracking-widest font-black">⚠ BUDGET CRITICAL ⚠</span>}
                  </div>
                  <div className="h-2 w-full bg-cyan-950/20 border border-cyan-900/30 overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-300 ${isBudgetCritical ? 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-cyan-500'}`} 
                      style={{ width: `${budgetRatio}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <div className="text-right mr-3 text-[10px]">
                    <span className="text-cyan-800 block">DEPLOYED SATELLITES</span>
                    <span className="font-extrabold text-cyan-400">{activeAssets.length} ACTIVE</span>
                  </div>
                  <button
                    onClick={handleAllocateExtraBudget}
                    className="px-3 py-2 border border-cyan-600 text-cyan-400 hover:bg-cyan-950/30 text-[9px] font-bold tracking-widest uppercase transition-all"
                  >
                    +100 BUDGET
                  </button>
                </div>
              </div>

              {/* Grid: Assets lists & Deploy Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* List layout */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-cyan-600 font-extrabold uppercase tracking-widest border-b border-cyan-900/20 pb-1 text-[10px]">
                    — SYSTEM OPERATIONAL ASSETS LEDGER —
                  </h3>

                  <div className="space-y-3">
                    {store.u8200Assets.length === 0 && (
                      <div className="border border-cyan-950/30 border-dashed p-10 text-center text-cyan-900 uppercase tracking-wider">
                        No collection assets currently engineered. Deploy assets to listen in.
                      </div>
                    )}
                    
                    {(store.u8200Assets || []).map(asset => {
                      const tgtNation = countries[asset.targetNationId]?.name || asset.targetNationId;
                      const isRetractPending = assetConfirmRetractId === asset.id;

                      const colors = {
                        DIPLOMATIC: 'border-blue-900 text-blue-400 bg-blue-950/20',
                        TELECOM: 'border-purple-900 text-purple-400 bg-purple-950/20',
                        MILITARY: 'border-red-900 text-red-500 bg-red-950/10',
                        CYBER: 'border-emerald-900 text-emerald-400 bg-emerald-950/20',
                        COMMERCIAL: 'border-yellow-905 text-yellow-500 bg-yellow-950/10',
                        IMAGERY: 'border-sky-900 text-sky-400 bg-sky-950/20'
                      };

                      return (
                        <div 
                          key={asset.id} 
                          className={`border p-3 flex justify-between items-center transition-all bg-black/60 hover:bg-black ${
                            asset.isActive ? 'border-cyan-900/60' : 'border-gray-900 opacity-40'
                          }`}
                        >
                          <div className="space-y-1 select-none">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white uppercase tracking-widest">{tgtNation}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border ${colors[asset.channel]}`}>
                                {asset.channel}
                              </span>
                            </div>
                            <div className="text-[10px] text-cyan-800 leading-tight">
                              SPECTRUM LEVEL: <span className="text-cyan-400">{asset.coverageLevel}%</span> • COST: <span className="text-cyan-400">${asset.dailyCost}/TICK</span> • DEPLOYED: TICK {asset.deployedAtTick}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {asset.isActive ? (
                              isRetractPending ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleRetractAssetConfirm(asset.id)}
                                    className="px-2 py-1 bg-red-950 text-red-500 border border-red-800 text-[9px] font-bold"
                                  >
                                    CONFIRM
                                  </button>
                                  <button
                                    onClick={() => setAssetConfirmRetractId(null)}
                                    className="px-2 py-1 border border-gray-800 text-gray-500 text-[9px] font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAssetConfirmRetractId(asset.id)}
                                  className="px-2 py-1 bg-gray-950 text-gray-400 border border-cyan-950 hover:border-red-900 hover:text-red-500 transition-colors text-[9px] font-bold"
                                >
                                  RETRACT
                                </button>
                              )
                            ) : (
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider pr-3">RETRACTED</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deploy Form */}
                <div className="lg:col-span-4 bg-[#020707] border border-cyan-950/40 p-4">
                  <h3 className="text-cyan-500 font-extrabold uppercase tracking-widest mb-4 text-[10px] border-b border-cyan-950/40 pb-1">
                     INTEGRATE NEW COLLECTION ASSET
                  </h3>
                  
                  <form onSubmit={handleDeployAssetSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-cyan-700 font-bold uppercase tracking-wider block">TARGET COUNTRY KEY</label>
                      <select
                        value={deployTarget}
                        onChange={(e) => setDeployTarget(e.target.value)}
                        className="w-full bg-[#010404] border border-cyan-900/40 text-cyan-400 px-2 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
                        required
                      >
                        <option value="">-- SELECT TARGET COUNTRY --</option>
                        {Object.values(countries).map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-cyan-700 font-bold uppercase tracking-wider block">COLLECTION SPECTRUM</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['TELECOM', 'DIPLOMATIC', 'MILITARY', 'CYBER', 'COMMERCIAL', 'IMAGERY'] as const).map(ch => (
                          <button
                            type="button"
                            key={ch}
                            onClick={() => { audio.sfxKeyClick(); setDeployChannel(ch); }}
                            className={`py-1.5 border text-[9px] font-bold uppercase text-center transition-all ${
                              deployChannel === ch 
                                ? 'border-cyan-400 text-cyan-400 bg-cyan-900/10' 
                                : 'border-cyan-900/30 text-cyan-800 hover:text-cyan-500'
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-cyan-700 font-bold uppercase tracking-wider">
                        <span>SPECTRUM EXPONENT</span>
                        <span className="text-cyan-400">{deployCoverage}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="10"
                        value={deployCoverage}
                        onChange={(e) => setDeployCoverage(parseInt(e.target.value))}
                        className="w-full accent-cyan-600 cursor-pointer"
                      />
                      <span className="text-[8px] text-cyan-900 block mt-0.5 uppercase leading-snug">Higher levels boost intercept probability at greater tick rates</span>
                    </div>

                    <div className="pt-2 border-t border-cyan-950/40 grid grid-cols-2 items-center">
                      <div>
                        <span className="text-[8px] text-cyan-800 uppercase block">Daily ticks maintenance</span>
                        <span className="text-cyan-400 font-extrabold text-sm">${calculatedDeployDailyCost} BUDGET</span>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={!deployTarget}
                        className={`w-full py-2 border text-[9px] font-bold uppercase tracking-widest text-center transition-all ${
                          deployTarget 
                            ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-950/20' 
                            : 'border-gray-900 text-gray-700 cursor-not-allowed'
                        }`}
                      >
                        LAUNCH SPECTRUM
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: SIGNALS FEED */}
          {/* ======================================= */}
          {activeTab === 'SIGNALS' && (
            <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-full">
              
              {/* FILTERS PANEL */}
              <div className="border border-cyan-950/40 p-3 bg-black/40 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-cyan-800 uppercase tracking-widest font-black">Target Country</label>
                  <input
                    type="text"
                    value={searchNation}
                    onChange={(e) => setSearchNation(e.target.value)}
                    placeholder="Search nation..."
                    className="w-full bg-[#010404] border border-cyan-950 text-cyan-400 px-2 py-1 text-xs focus:outline-none focus:border-cyan-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-cyan-800 uppercase tracking-widest font-black">Channel Type</label>
                  <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="w-full bg-[#010404] border border-cyan-950 text-cyan-400 px-2 py-1 text-xs focus:outline-none focus:border-cyan-900"
                  >
                    <option value="ALL">ALL CHANNELS</option>
                    <option value="TELECOM">TELECOM</option>
                    <option value="DIPLOMATIC">DIPLOMATIC</option>
                    <option value="MILITARY">MILITARY</option>
                    <option value="CYBER">CYBER</option>
                    <option value="COMMERCIAL">COMMERCIAL</option>
                    <option value="IMAGERY">IMAGERY</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-cyan-800 uppercase tracking-widest font-black">Verification Level</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-[#010404] border border-cyan-950 text-cyan-400 px-2 py-1 text-xs focus:outline-none focus:border-cyan-900"
                  >
                    <option value="ALL">ALL LEVELS</option>
                    <option value="HIDDEN">HIDDEN</option>
                    <option value="INFERRED">INFERRED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4 justify-end">
                  <button
                    onClick={() => { audio.sfxKeyClick(); setFilterAnomaliesOnly(!filterAnomaliesOnly); }}
                    className={`px-3 py-1.5 border text-[9px] font-bold uppercase transition-all tracking-wider ${
                      filterAnomaliesOnly 
                        ? 'border-red-900 text-red-500 bg-red-950/20' 
                        : 'border-cyan-900/30 text-cyan-800 hover:text-cyan-500'
                    }`}
                  >
                    ⚠ ANOMALIES ONLY
                  </button>
                </div>
              </div>

              {/* STATS HEADER */}
              <div className="text-[10px] text-cyan-700 font-bold uppercase tracking-wider flex justify-between shrink-0 mb-2 select-none px-1">
                <span>{filteredSignals.length} FEED LOGS RETRIEVED</span>
                <span className="text-gray-600">EXPIRATION RETARD: 30 TICKS CYCLE</span>
              </div>

              {/* INTERCEPTS FEED */}
              <div className="space-y-3">
                {filteredSignals.length === 0 && (
                  <div className="border border-cyan-950/30 border-dashed p-12 text-center text-cyan-900 uppercase tracking-wider font-bold">
                    No decrypted logs match currently locked filtration targets.
                  </div>
                )}

                {(filteredSignals || []).map(sig => {
                  const hasTrail = expandedTrailSignalId === sig.id;
                  const isExpiring = sig.expiresAtTick - currentTick < 5;

                  const borderColors = {
                    HIDDEN: 'border-l-4 border-l-gray-800',
                    INFERRED: 'border-l-4 border-l-amber-600/75',
                    CONFIRMED: 'border-l-4 border-l-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  };

                  const tagColors = {
                    HIDDEN: 'text-gray-500 bg-black/40 border-gray-900',
                    INFERRED: 'text-amber-500 bg-amber-950/20 border-amber-900/40 animate-pulse',
                    CONFIRMED: 'text-cyan-400 bg-cyan-950/35 border-cyan-800/60'
                  };

                  return (
                    <div 
                      key={sig.id}
                      onClick={() => { audio.sfxKeyClick(); setSelectedSignal(sig); }}
                      className={`block bg-[#020505]/80 border border-cyan-950/30 p-3 select-none transition-all cursor-pointer hover:bg-black hover:border-cyan-900/40 relative ${borderColors[sig.status]}`}
                    >
                      {/* Row 1 Tags */}
                      <div className="flex justify-between items-start mb-2 shrink-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border tracking-wider ${tagColors[sig.status]}`}>
                            {sig.status}
                          </span>
                          <span className="px-1.5 py-0.5 text-[8px] border border-cyan-950 text-cyan-600 font-bold uppercase">
                            {sig.channel}
                          </span>
                          <span className="px-1.5 py-0.5 text-[8px] border border-cyan-950 text-gray-500 font-bold uppercase">
                            {sig.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-800 uppercase font-bold tracking-widest text-right">
                          TICK {sig.detectedAtTick}
                        </div>
                      </div>

                      {/* Row 2 Decrypted Content */}
                      <div className="mb-3">
                        {sig.status === 'HIDDEN' ? (
                          <div className="font-mono text-gray-700 tracking-widest select-none bg-black/30 p-1 font-bold text-[10px]">
                            [████ ████ ████ ████] CRYPTOGRAPHIC LOCK REMAINING
                          </div>
                        ) : (
                          <p className="text-gray-200 text-xs font-mono font-bold font-semibold tracking-wide">
                            {sig.rawContent}
                          </p>
                        )}
                      </div>

                      {/* Row 3 metadata */}
                      <div className="flex justify-between items-center text-[10px] text-cyan-800 border-t border-cyan-950/10 pt-2 flex-wrap gap-2">
                        <div className="flex gap-4">
                          <span>COUNTRY: <span className="text-cyan-600 font-bold">{sig.sourceNationId}</span></span>
                          <span>CONFIDENCE: <span className="text-cyan-500 font-semibold">{sig.confidence}</span></span>
                          {sig.patternOfLifeFlag && <span className="text-amber-500 font-extrabold flex items-center gap-1">◆ POL BASELINE</span>}
                          {sig.anomalyFlag && <span className="text-red-500 animate-pulse font-extrabold flex items-center gap-1">⚠ DEVIATION WARNING</span>}
                        </div>

                        <div className="flex items-center gap-3">
                          {isExpiring && <span className="text-red-500 animate-pulse font-bold">EXPIRING IN {sig.expiresAtTick - currentTick}T</span>}
                          
                          {sig.status === 'CONFIRMED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                audio.sfxKeyClick();
                                setExpandedTrailSignalId(hasTrail ? null : sig.id);
                              }}
                              className="text-cyan-500 hover:text-cyan-300 font-bold border border-cyan-950/40 px-2 py-0.5 text-[9px]"
                            >
                              {hasTrail ? 'HIDE CORROBORATION' : 'SHOW CORROBORATION'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Task 3 inside card Trail renderer */}
                      {sig.status === 'CONFIRMED' && hasTrail && (
                        <div 
                          className="mt-3 p-3 bg-black/60 border border-cyan-950/40 space-y-3"
                          onClick={(e) => e.stopPropagation()} // block click from going to dossier
                        >
                          <div className="text-[9px] text-cyan-700 font-extrabold uppercase tracking-widest border-b border-cyan-950/40 pb-1">
                            — CORROBORATION CONSTITUENCE —
                          </div>
                          
                          <div className="pl-3 border-l border-cyan-950/50 space-y-3 py-1 font-mono">
                            {getCorroborationTrail(sig, store.u8200Signals, arachneFeeds as any, finintState, currentTick).map((node, index) => {
                              const nodeColors = {
                                SIGINT: 'text-cyan-400',
                                SIGINT_LINK: 'text-purple-400',
                                ARACHNE: 'text-emerald-400',
                                FININT: 'text-amber-500',
                                ANALYST_OVERRIDE: 'text-cyan-400'
                              };

                              return (
                                <div key={index} className="text-[10px] flex items-start gap-1 justify-between">
                                  <div>
                                    <span className={`font-extrabold block uppercase ${nodeColors[node.type]}`}>│ █ {node.label}</span>
                                    <span className="text-gray-500 text-[9px] block pl-3">{node.detail}</span>
                                  </div>
                                  <span className="text-cyan-900 text-[8px] font-bold">TICK {node.tick}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 3: PATTERNS */}
          {/* ======================================= */}
          {activeTab === 'PATTERNS' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              <div className="bg-[#020707] border border-cyan-950/40 p-4">
                <h3 className="text-cyan-500 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                   PATTERN OF LIFE INTEGRATED RECORD
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-cyan-900/30 text-cyan-700 uppercase">
                        <th className="py-2 px-3 font-extrabold">NATION IDENT</th>
                        <th className="py-2 px-3 font-extrabold">BASELINE ACTIVITY SCALE (0-100)</th>
                        <th className="py-2 px-3 font-extrabold text-center">LAST COGNITION WINDOW</th>
                        <th className="py-2 px-3 font-extrabold text-center">RECENT VOLUME (10T)</th>
                        <th className="py-2 px-3 font-extrabold text-right">ACTIVITY DEVIATION STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-950/10">
                      {(baselinesLog || []).map(b => {
                        const tgtName = countries[b.nationId]?.name || b.nationId;

                        const badges = {
                          HIGH_ACTIVITY: 'text-amber-500 bg-amber-950/20 border-amber-900/40 animate-pulse',
                          REDUCED_ACTIVITY: 'text-sky-400 bg-sky-950/20 border-sky-900/30',
                          NORMAL: 'text-emerald-500 bg-emerald-950/10'
                        };

                        return (
                          <tr key={b.nationId} className="hover:bg-cyan-950/5">
                            <td className="py-2.5 px-3 font-bold text-white uppercase tracking-wider">{tgtName} ({b.nationId})</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-cyan-400 w-8">{b.baselineScore}</span>
                                <div className="h-1.5 w-32 bg-cyan-950/20 border border-cyan-900/20 overflow-hidden">
                                  <div className="h-full bg-cyan-600/75" style={{width: `${Math.min(100, b.baselineScore)}%`}} />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center text-cyan-700 font-semibold uppercase">TICK {b.lastUpdatedTick}</td>
                            <td className="py-2.5 px-3 text-center text-white font-bold">{b.signalCount} CALLS</td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`inline-block border px-2 py-0.5 text-[8px] font-bold uppercase ${badges[b.status]}`}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {baselinesLog.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-cyan-900 uppercase font-extrabold tracking-widest border border-dashed border-cyan-950/20">
                            No country baseline averages structured. Deploy components.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pattern Alerts and Blackout list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Alerts grouping */}
                <div className="bg-black/50 border border-cyan-950/30 p-4">
                  <h4 className="text-cyan-500 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                    ◆ REAL-TIME ACTIVITY CLUSTERS
                  </h4>

                  <div className="space-y-3">
                    {store.u8200Signals.filter(s => s.patternOfLifeFlag === true && s.expiresAtTick > currentTick).slice(-5).map(sig => {
                      const natName = countries[sig.sourceNationId]?.name || sig.sourceNationId;
                      return (
                        <div key={sig.id} className="p-2.5 border border-cyan-950/25 bg-black/40">
                          <div className="flex justify-between items-center text-[9px] mb-1.5">
                            <span className="font-extrabold text-white uppercase tracking-wider">{natName}</span>
                            <span className="text-cyan-700">TICK {sig.detectedAtTick}</span>
                          </div>
                          <p className="text-gray-400 text-[10px] tracking-wide mb-2 line-clamp-1">
                            {sig.rawContent}
                          </p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                audio.sfxKeyClick();
                                setSearchNation(sig.sourceNationId);
                                setActiveTab('SIGNALS');
                              }}
                              className="px-2 py-0.5 border border-cyan-900 text-cyan-500 text-[8px] font-extrabold uppercase tracking-widest hover:text-white transition-colors"
                            >
                              INVESTIGATE NATION
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {store.u8200Signals.filter(s => s.patternOfLifeFlag === true).length === 0 && (
                      <div className="text-[10px] text-cyan-800 text-center uppercase py-8">No clusters logged.</div>
                    )}
                  </div>
                </div>

                {/* Comms Blackout list */}
                <div className="bg-black/50 border border-cyan-950/30 p-4">
                  <h4 className="text-cyan-500 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                    ⚠ COMMS SILENCE / COVERT BLACKOUTS
                  </h4>

                  <div className="space-y-3">
                    {(baselinesLog || []).map(b => {
                      // If silence exceeds 15 ticks despite active assets scanning
                      const tgtAssetActive = store.u8200Assets.some(a => a.targetNationId === b.nationId && a.isActive);
                      const ticksSinceComms = currentTick - b.lastUpdatedTick;
                      const isBlackout = tgtAssetActive && ticksSinceComms > 15;

                      if (!isBlackout) return null;

                      return (
                        <div key={b.nationId} className="p-3 border border-red-950 bg-red-950/5">
                          <div className="text-red-500 font-bold text-[9px] mb-1 flex items-center gap-1.5 uppercase tracking-widest animate-pulse">
                            <span>⚠ BLACKOUT DETECTED: {countries[b.nationId]?.name || b.nationId}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 leading-snug mb-2">
                            Active assets tracking target but no signal logged for last {ticksSinceComms} ticks. High probability of active deception schemes or total military comms lock.
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-[#444] font-bold uppercase">FLAG DECEPTION REVIEW FOR DEV</span>
                            <button
                              onClick={() => {
                                audio.sfxKeyClick();
                                setSearchNation(b.nationId);
                                setFilterChannel('ALL');
                                setFilterStatus('ALL');
                                setActiveTab('ANOMALIES');
                              }}
                              className="px-2 py-0.5 border border-red-900/60 text-red-500 text-[8px] font-bold hover:bg-red-950/10"
                            >
                              FLAG FOR DECEPTION REVIEW
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {!baselinesLog.some(b => store.u8200Assets.some(a => a.targetNationId === b.nationId && a.isActive) && (currentTick - b.lastUpdatedTick) > 15) && (
                      <div className="text-[10px] text-cyan-800 text-center uppercase py-8">All spectral grids stable. No unexpected silent blackouts observed.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* TAB 4: ANOMALIES */}
          {/* ======================================= */}
          {activeTab === 'ANOMALIES' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              <div className="border border-cyan-950/40 p-4 bg-black/40">
                <h3 className="text-cyan-500 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                  ⚠ ANOMALY ALERT DISPOSITION CONSOLES
                </h3>

                <div className="space-y-3">
                  {anomalyAlerts.filter(a => !a.reviewed).length === 0 && (
                    <div className="border border-cyan-950/30 border-dashed p-12 text-center text-cyan-900 uppercase tracking-widest font-bold">
                       Current Collection Window shows stable cadence patterns. No unreviewed anomalies logged.
                    </div>
                  )}

                  {anomalyAlerts.filter(a => !a.reviewed).map(sig => {
                    const natName = countries[sig.sourceNationId]?.name || sig.sourceNationId;
                    return (
                      <div key={sig.id} className="p-4 border border-red-950 bg-[#120404]/25 relative">
                        <div className="flex justify-between items-start mb-2 select-none">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping shrink-0" />
                            <span className="text-white font-extrabold text-xs uppercase tracking-wider">{natName} ({sig.sourceNationId})</span>
                            <span className="px-1.5 py-0.5 border border-red-900 text-red-500 text-[8px] uppercase tracking-wide font-bold">
                              {sig.channel} // {sig.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-[9px] text-[#555] font-bold font-mono">
                            DETECTED TICK {sig.detectedAtTick}
                          </div>
                        </div>

                        <p className="text-[#ff9999] text-sm font-bold tracking-wide font-mono bg-black/40 p-2 border border-red-950/30 mb-4 select-text">
                          {sig.rawContent}
                        </p>

                        {/* Decisions panel inside anomaly cards */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-red-950/30 sm:justify-between sm:items-center">
                          <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-wider">CHOOSE OPERATIONAL DIRECTIVE:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAnomalyGenuine(sig)}
                              className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/10 text-[9px] font-bold tracking-widest uppercase transition-all"
                            >
                              [GENUINE — ACT ON IT]
                            </button>
                            <button
                              onClick={() => handleAnomalyDeceptive(sig.id)}
                              className="px-3 py-1.5 bg-red-950 text-red-500 border border-red-800 hover:bg-red-900/10 text-[9px] font-bold tracking-widest uppercase transition-all"
                            >
                              [DECEPTIVE — DISCARD]
                            </button>
                            <button
                              onClick={() => handleAnomalyHold(sig.id)}
                              className="px-3 py-1.5 border border-[#333] hover:border-gray-500 text-gray-400 text-[9px] font-bold tracking-widest uppercase transition-colors"
                            >
                              [HOLD — STANDBY]
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviewed Ledger */}
              <div className="border border-cyan-950/40 p-4 bg-black/20">
                <h3 className="text-cyan-700 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                   DECEPTION WATCH & ARCHIVED RECORD
                </h3>

                <div className="space-y-2">
                  {store.u8200Signals.filter(s => s.deceptionFlagged === true).map(sig => (
                    <div key={sig.id} className="p-2.5 border border-[#333] bg-black/40 flex justify-between items-center text-[10px]">
                      <div>
                        <span className="text-red-500 font-bold uppercase mr-2">[DISCARDED]</span>
                        <span className="text-white font-bold">{countries[sig.sourceNationId]?.name || sig.sourceNationId}</span> • <span className="text-gray-500">{sig.channel}</span> • <span className="text-[#cc5555] tracking-wide italic font-bold">"{sig.rawContent.slice(0, 45)}..."</span>
                      </div>
                      <button
                        onClick={() => handleDeceptionReinstate(sig.id)}
                        className="px-2 py-0.5 border border-[#444] text-white hover:border-cyan-500 font-bold text-[8px] uppercase tracking-wider"
                      >
                        REINSTATE
                      </button>
                    </div>
                  ))}
                  {store.u8200Signals.filter(s => s.deceptionFlagged === true).length === 0 && (
                    <div className="py-6 text-center text-[10px] text-gray-600 uppercase">No signals flagged as active deception counter-measures.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB 5: TASKING */}
          {/* ======================================= */}
          {activeTab === 'TASKING' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              <div className="border border-cyan-950/40 p-4 bg-black/40">
                <h3 className="text-cyan-500 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                  ROUTE CONFIRMED INTELLIGENCE DOSSIERS
                </h3>

                <div className="space-y-3">
                  {confirmedSignals.length === 0 && (
                    <div className="border border-cyan-950/30 border-dashed p-12 text-center text-cyan-900 uppercase tracking-widest font-bold">
                       No verified top-tier intelligence intercepts available. Ensure OSINT or FININT checks are active.
                    </div>
                  )}

                  {(confirmedSignals || []).map(sig => {
                    const natName = countries[sig.sourceNationId]?.name || sig.sourceNationId;
                    return (
                      <div key={sig.id} className="p-3 border border-cyan-900 bg-black/80">
                        <div className="flex justify-between text-[10px] mb-2 font-bold uppercase select-none">
                          <span className="text-white tracking-widest">{natName} ({sig.sourceNationId}) • {sig.channel}</span>
                          <span className="text-emerald-500 border border-emerald-900 px-1.5 py-0.2 bg-emerald-950/10">CONFIRMED PROFILE</span>
                        </div>

                        <p className="text-cyan-300 font-bold text-xs tracking-wide font-mono mb-4 select-text">
                          {sig.rawContent}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-cyan-950/45 pt-3">
                          <div>
                            <span className="text-[9px] text-cyan-800 block uppercase tracking-wider mb-1">ALREADY FORWARDED TO:</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {sig.taskedTo && sig.taskedTo.length > 0 ? (
                                (sig.taskedTo || []).map(div => (
                                  <span key={div} className="px-1.5 py-0.5 bg-cyan-950/35 border border-cyan-800 text-[8px] text-cyan-400 font-bold uppercase">
                                    → {div} COMMAND
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] text-[#555] font-bold uppercase">WAITING PIPELINE DISPOSITION</span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleRouteTasking(sig, 'CIA')}
                              disabled={sig.taskedTo?.includes('CIA')}
                              className={`px-3 py-1.5 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                                sig.taskedTo?.includes('CIA') 
                                  ? 'border-gray-900 text-gray-700 cursor-not-allowed' 
                                  : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                              }`}
                            >
                              CIA
                            </button>
                            <button
                              onClick={() => handleRouteTasking(sig, 'CYBER')}
                              disabled={sig.taskedTo?.includes('CYBER')}
                              className={`px-3 py-1.5 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                                sig.taskedTo?.includes('CYBER') 
                                  ? 'border-gray-900 text-gray-700 cursor-not-allowed' 
                                  : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                              }`}
                            >
                              CYBER
                            </button>
                            <button
                              onClick={() => handleRouteTasking(sig, 'MILITARY')}
                              disabled={sig.taskedTo?.includes('MILITARY')}
                              className={`px-3 py-1.5 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                                sig.taskedTo?.includes('MILITARY') 
                                  ? 'border-gray-900 text-gray-700 cursor-not-allowed' 
                                  : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                              }`}
                            >
                              MILITARY
                            </button>
                            <button
                              onClick={() => handleRouteTasking(sig, 'DIPLOMATIC')}
                              disabled={sig.taskedTo?.includes('DIPLOMATIC')}
                              className={`px-3 py-1.5 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                                sig.taskedTo?.includes('DIPLOMATIC') 
                                  ? 'border-gray-900 text-gray-700 cursor-not-allowed' 
                                  : 'border-cyan-800 text-cyan-400 hover:bg-cyan-950/30'
                              }`}
                            >
                              DIP
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasking History Logs */}
              <div className="border border-cyan-950/40 p-4 bg-black/20">
                <h3 className="text-cyan-700 font-extrabold uppercase tracking-widest mb-3 text-[10px] border-b border-cyan-950/40 pb-1">
                  ★ DISPATCH TASKING HISTORIC REGISTRY
                </h3>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {(taskingHistory || []).map(sig => (
                    <div key={sig.id} className="p-2 border border-cyan-950/20 bg-black/45 text-[9px] flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="text-cyan-600 font-bold block sm:inline mr-2">TICK {sig.detectedAtTick}</span>
                        <span className="text-white font-extrabold pr-2 uppercase">{countries[sig.sourceNationId]?.name || sig.sourceNationId}</span>
                        <span className="text-gray-500 font-mono">({sig.category.replace(/_/g, ' ')})</span>
                      </div>
                      <div className="flex gap-1.5">
                        {sig.taskedTo?.map(d => (
                          <span key={d} className="px-1 border border-cyan-950 text-cyan-500 text-[8px] uppercase tracking-wider font-bold">
                            FORWARDED → {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {taskingHistory.length === 0 && (
                    <div className="py-6 text-center text-gray-600 uppercase text-[9px]">No tasking distribution actions carried out.</div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* MODAL LEDGER COMPONENT INSIDE PORTFOLIO SQUARES */}
      {selectedSignal && (
        <SignalDossierModal 
          signal={selectedSignal} 
          onClose={() => setSelectedSignal(null)} 
        />
      )}
    </PanelFxShell>
  );
}

