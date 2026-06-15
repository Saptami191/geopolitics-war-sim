import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { useClockStore } from '../../store/clockStore';
import { useFogOfWarStore } from '../../store/fogOfWarStore';
import { useDefconStore } from '../../store/defconStore';
import { useConsequenceStore } from '../../store/consequenceStore';
import { audio } from '../../utils/audio';
import WorldMap from '../map/WorldMap';
import { IDEOLOGIES, AllianceBlock, Ideology } from '../../types';
import { INITIAL_COUNTRIES } from '../../data/countries';
import { 
  X, Check, AlertTriangle, Shield, Flag, Landmark, Atom, 
  Coins, Swords, RefreshCw, ChevronRight, Sliders, Calendar, Info,
  Share2, Copy, Sparkles, Dices, Lock
} from 'lucide-react';
import { 
  generateDefaultWorldPreset, 
  generateColdWarPreset, 
  generateMultipolarChaosPreset, 
  generateNuclearBrinkPreset, 
  generateNonAlignedPreset, 
  generatePlausibleRandomWorld, 
  serializeURIWorldConfig, 
  deserializeURIWorldConfig 
} from './worldBuilderHelpers';

interface WorldBuilderProps {
  onLaunchSandbox: (selectedCountryId: string, options: any) => void;
  onBack: () => void;
}

export default function WorldBuilder({ onLaunchSandbox, onBack }: WorldBuilderProps) {
  const worldBuilderConfig = useWorldStore((s) => s.worldBuilderConfig) || {};
  const updateCountryConfig = useWorldStore((s) => s.updateWorldBuilderCountryConfig);
  const resetAllConfigs = useWorldStore((s) => s.resetWorldBuilderConfig);

  const inspectedCountryId = useUIStore((s) => s.countryInspectorId);
  const playerCountryId = usePlayerStore((s) => s.countryId) || 'US';

  const handleSetPlayerCountry = (id: string) => {
    audio.sfxKeyClick();
    usePlayerStore.setState({ countryId: id });
  };

  const [activeTab, setActiveTab] = useState<'NATIONS' | 'GLOBALS'>('NATIONS');

  // Premium scramble visual states
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleMessage, setScrambleMessage] = useState('');

  const triggerScramble = (message: string) => {
    setIsScrambling(true);
    setScrambleMessage(message);
    setTimeout(() => {
      setIsScrambling(false);
    }, 850);
  };

  // Import / Export UX controllers
  const [shareUrl, setShareUrl] = useState('');
  const [clipboardStatus, setClipboardStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [importErrorMsg, setImportErrorMsg] = useState('');

  // Auto URL deep configuration payload importer
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const worldParam = params.get('world');
    if (worldParam) {
      const decodedConfig = deserializeURIWorldConfig(worldParam);
      if (decodedConfig) {
        audio.sfxKlaxon();
        triggerScramble('DECRYPTING CLOUD SCENARIO PROTOCOL...');
        useWorldStore.getState().setWorldBuilderConfig(decodedConfig);
        
        // Wipe parameter silently from address bar without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleApplyPreset = (presetKey: 'DEFAULT' | 'COLD_WAR' | 'MULTIPOLAR' | 'NUCLEAR_BRINK' | 'NON_ALIGNED') => {
    audio.sfxKlaxon();
    let config;
    let title = 'COGNATE CORE WORLD BASELINE RECOILED';
    switch (presetKey) {
      case 'COLD_WAR':
        config = generateColdWarPreset();
        title = 'LAUNCHING BIPOLAR STANDOFF MATRIX CONTROLLA';
        break;
      case 'MULTIPOLAR':
        config = generateMultipolarChaosPreset();
        title = 'IGNITING MULTIPOLAR CHAO INTEL MODEL';
        break;
      case 'NUCLEAR_BRINK':
        config = generateNuclearBrinkPreset();
        title = 'ENGAGING CO-ASSURED BRINKMANSHIP HYDRAULIC';
        break;
      case 'NON_ALIGNED':
        config = generateNonAlignedPreset();
        title = 'DEVISING NON-ALIGNED TRANSACTION CONSTITUENT';
        break;
      case 'DEFAULT':
      default:
        config = generateDefaultWorldPreset();
    }
    triggerScramble(title);
    useWorldStore.getState().setWorldBuilderConfig(config);
  };

  const handleApplyRandomization = () => {
    audio.sfxKlaxon();
    triggerScramble('COMPUTING STOCHASTIC PLAUSIBILITY SCALING...');
    const randomConfig = generatePlausibleRandomWorld();
    useWorldStore.getState().setWorldBuilderConfig(randomConfig);
  };

  const handleGenerateShareUrl = () => {
    audio.sfxKeyClick();
    const currentConfig = useWorldStore.getState().worldBuilderConfig;
    if (!currentConfig) return;
    const b64 = serializeURIWorldConfig(currentConfig);
    const fullLink = `${window.location.origin}${window.location.pathname}?world=${b64}`;
    setShareUrl(fullLink);

    try {
      navigator.clipboard.writeText(fullLink);
      setClipboardStatus('SUCCESS');
      setTimeout(() => setClipboardStatus('IDLE'), 4000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      setClipboardStatus('ERROR');
      setTimeout(() => setClipboardStatus('IDLE'), 4000);
    }
  };

  const handleManualImport = () => {
    audio.sfxKeyClick();
    if (!importText.trim()) return;

    let targetB64 = importText.trim();
    if (targetB64.includes('?world=')) {
      targetB64 = targetB64.split('?world=')[1] || '';
    }

    const decoded = deserializeURIWorldConfig(targetB64);
    if (decoded) {
      audio.sfxKlaxon();
      triggerScramble('LOADING INJECTED SCENARIO MAP MODEL...');
      useWorldStore.getState().setWorldBuilderConfig(decoded);
      setImportStatus('SUCCESS');
      setImportText('');
      setImportErrorMsg('');
      setTimeout(() => setImportStatus('IDLE'), 3000);
    } else {
      setImportStatus('ERROR');
      setImportErrorMsg('CORRUPTED OR MALFORMED DECRYPTION SEQUENCE');
      setTimeout(() => {
        setImportStatus('IDLE');
        setImportErrorMsg('');
      }, 5000);
    }
  };

  // Global SIM parameters (preserved from previous version)
  const [tensionPreset, setTensionPreset] = useState<'COLD_PEACE' | 'SIMMERING' | 'WORLD_ON_EDGE' | 'INFERNO'>('SIMMERING');
  const [multiplier, setMultiplier] = useState<'REALISTIC' | 'EMPOWERED' | 'CRISIS'>('REALISTIC');
  const [aiAggression, setAiAggression] = useState(2); 
  const [substateActivity, setSubstateActivity] = useState<'DORMANT' | 'ACTIVE' | 'SURGING'>('ACTIVE');

  const [durationMode, setDurationMode] = useState<'SCENARIO' | 'TIMED' | 'ENDLESS'>('ENDLESS');
  const [timedTicks, setTimedTicks] = useState(150);
  const [tickScale, setTickScale] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [startDate, setStartDate] = useState('2027-01-15');

  // Synchronize on inspected change to trigger gentle key-clicks
  useEffect(() => {
    if (inspectedCountryId) {
      audio.sfxKeyClick();
    }
  }, [inspectedCountryId]);

  const handleLaunch = () => {
    audio.sfxKlaxon();

    // 1. Setup clock parameters
    useClockStore.getState().initClock(
      startDate,
      durationMode,
      tickScale,
      durationMode === 'TIMED' ? timedTicks : 100
    );

    // 2. Setup Fog Of War
    useFogOfWarStore.getState().initFog(playerCountryId, [], 'PARTIAL');

    // 3. Reset DEFCON level
    useDefconStore.getState().resetDefcon();
    useConsequenceStore.getState().resetScars();

    // Apply the customised world configuration matrix properties directly to live objects
    useWorldStore.getState().applyWorldBuilderConfig(playerCountryId);

    onLaunchSandbox(playerCountryId, {
      tensionPreset,
      spendingMultiplier: multiplier === 'EMPOWERED' ? 3.0 : multiplier === 'CRISIS' ? 0.5 : 1.0,
      aiAggression,
      substateActivity
    });
  };

  const handleReset = () => {
    audio.sfxKlaxon();
    resetAllConfigs();
  };

  // Helper labels for military ratings
  const getMilitaryLabel = (rating: number) => {
    if (rating < 30) return { label: 'DEFENSE OUTPOST', color: 'text-gray-500' };
    if (rating < 55) return { label: 'REGIONAL GARRISON', color: 'text-amber-500' };
    if (rating < 85) return { label: 'REGIONAL SUPERPOWER', color: 'text-orange-500' };
    return { label: 'GLOBAL MONOLITHIC HEGEMONY', color: 'text-red-500 font-bold animate-pulse' };
  };

  // Helper labels for relations sentiment
  const getRelationLabel = (sentiment: number) => {
    if (sentiment < -50) return { title: 'HOSTILE ENEMY', color: 'text-red-500' };
    if (sentiment < -10) return { title: 'COOL ANTAGONISM', color: 'text-orange-400' };
    if (sentiment < 10) return { title: 'STRICT NEUTRALITY', color: 'text-gray-400' };
    if (sentiment < 50) return { title: 'FAVORABLE POSTURE', color: 'text-teal-400' };
    return { title: 'UNSHAKABLE ALLY', color: 'text-green-400 font-bold' };
  };

  // Human descriptive names for Ideologies with custom hex visual cues
  const getIdeologyMeta = (id: Ideology) => {
    const meta: Record<Ideology, { label: string; bg: string; text: string; glow: string }> = {
      DEMOCRACY: { label: 'DEMOCRACY', bg: 'bg-blue-950/40 border-blue-600', text: 'text-blue-400', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
      AUTOCRACY: { label: 'AUTOCRACY', bg: 'bg-red-950/40 border-red-700', text: 'text-red-400', glow: 'shadow-[0_0_8px_rgba(185,28,28,0.3)]' },
      MILITARY_JUNTA: { label: 'MILITARY JUNTA', bg: 'bg-amber-950/40 border-amber-600', text: 'text-amber-400', glow: 'shadow-[0_0_8px_rgba(217,119,6,0.3)]' },
      THEOCRACY: { label: 'THEOCRACY', bg: 'bg-purple-950/40 border-purple-600', text: 'text-purple-400', glow: 'shadow-[0_0_8px_rgba(147,51,234,0.3)]' },
      TECHNOCRACY: { label: 'TECHNOCRACY', bg: 'bg-cyan-950/40 border-cyan-500', text: 'text-cyan-400', glow: 'shadow-[0_0_8px_rgba(6,182,212,0.3)]' },
      OLIGARCHY: { label: 'OLIGARCHY', bg: 'bg-yellow-950/40 border-yellow-600', text: 'text-yellow-400', glow: 'shadow-[0_0_8px_rgba(234,179,8,0.3)]' },
      COMMUNISM: { label: 'COMMUNISM', bg: 'bg-rose-950/40 border-rose-700', text: 'text-rose-400', glow: 'shadow-[0_0_8px_rgba(225,29,72,0.3)]' },
      MONARCHY: { label: 'MONARCHY', bg: 'bg-orange-950/40 border-amber-800', text: 'text-amber-500', glow: 'shadow-[0_0_8px_rgba(146,64,14,0.3)]' },
    };
    return meta[id] || { label: id, bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400', glow: '' };
  };

  const currentCountryConfig = inspectedCountryId ? worldBuilderConfig[inspectedCountryId] : null;
  const inspectedCountryData = inspectedCountryId ? INITIAL_COUNTRIES[inspectedCountryId] : null;

  return (
    <div id="world-matrix-builder-container" className="absolute inset-0 bg-[#020402] flex flex-col justify-between overflow-hidden select-none text-green-400 font-mono">
      <div className="scanlines absolute inset-0 pointer-events-none z-10 opacity-[0.25]" />

      {/* Top Header Panel */}
      <header id="world-matrix-builder-header" className="flex justify-between items-center border-b border-[#1a5c1a] p-4 bg-black/90 backdrop-blur shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <button
            id="return-lobby-btn"
            onClick={() => { audio.sfxKeyClick(); onBack(); }}
            className="text-gray-500 hover:text-white px-2 py-1 border border-[#0d2e0d] hover:border-[#1a5c1a] text-[10px] uppercase font-bold transition-all bg-[#030603]"
          >
            &lt; BACK TO LOBBY
          </button>
          <div className="h-6 w-[1px] bg-[#1a5c1a]" />
          <div>
            <h1 className="text-white text-xs md:text-sm font-bold font-display uppercase tracking-widest flex items-center gap-1.5">
              <span className="text-[#00ff44] animate-pulse">■</span>
              PRE-GAME WORLD MATRIX CONFIGURATOR
            </h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-tight mt-0.5">
              Adjust starting variables & ideological frameworks globally before strategic integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            id="reset-matrix-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold border border-red-900/60 text-red-400 hover:bg-red-950/20 hover:border-red-500 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            RESET ENTIRE MATRIX
          </button>
          <span className="text-[9px] text-[#00e5ff] tracking-widest font-bold hidden md:inline">
            CLEARANCE: COSMIC TOP SECRET
          </span>
        </div>
      </header>

      {/* Main Structural Body */}
      <div id="world-matrix-builder-body" className="flex-1 flex relative overflow-hidden min-h-0">
        
        {/* Full Viewport 2D Map Container */}
        <main id="world-matrix-map-layer" className="flex-1 h-full relative overflow-hidden bg-[#010401]">
          {/* We render the core canonical geographic map, configured in political centroid layer layout */}
          <WorldMap activeLayer="POLITICAL" />

          {/* Premium Scrambler Visualizer Overlay */}
          {isScrambling && (
            <div className="absolute inset-0 bg-[#020d02]/85 md:bg-[#020c02]/80 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center border border-[#00ff44]/30 animate-pulse">
              <RefreshCw className="w-10 h-10 text-[#00ff44] animate-spin mb-3 duration-500" />
              <span className="text-[10px] font-bold tracking-widest text-[#00ff44] animate-pulse uppercase font-mono px-4 text-center">
                {scrambleMessage}
              </span>
              <span className="text-[7.5px] text-gray-500 mt-2 uppercase tracking-tight">
                SOVEREIGN DATABASE OVERWRITE & ALIGNMENT IN PROGRESS
              </span>
            </div>
          )}

          {/* Floating Instructions Legend Banner */}
          <div className="absolute left-4 top-4 bg-black/85 border border-[#1a5c1a] px-3 py-2 rounded text-[10px] space-y-1 z-20 pointer-events-none max-w-xs shadow-lg">
            <div className="font-bold text-[#00e5ff] uppercase flex items-center gap-1 mb-1">
              <Info className="w-3.5 h-3.5" />
              INTELLIGENCE OVERLAY MANUAL
            </div>
            <p className="text-gray-400 uppercase leading-snug">
              Click any nation centroid on the world map to inspect, assign protagonist role, or overwrite standard starting characteristics.
            </p>
            <div className="pt-1.5 border-t border-[#0d2e0d] flex flex-col gap-1 text-[9px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00e5c8]" />
                <span className="text-gray-400 uppercase">Interactive Nation Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ffaa] animate-pulse" />
                <span className="text-gray-400 uppercase">Current Playable Protagonist (Cognate)</span>
              </div>
            </div>
          </div>
        </main>

        {/* Tactical Right Sidebar Drawer */}
        <aside
          id="world-matrix-side-drawer"
          className="w-full md:w-[380px] bg-black/95 border-l border-[#1a5c1a] shadow-inner backdrop-blur z-20 flex flex-col overflow-hidden relative"
        >
          {/* Tab Selector Header */}
          <div className="flex border-b border-[#1a5c1a] shrink-0 bg-[#030603]">
            <button
              onClick={() => { audio.sfxKeyClick(); setActiveTab('NATIONS'); }}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'NATIONS' ? 'bg-black text-[#00ff44] border-b-2 border-b-[#00ff44]' : 'text-gray-500 hover:text-white'}`}
            >
              <Landmark className="w-3.5 h-3.5" />
              COUNTRY EDITOR
            </button>
            <button
              onClick={() => { audio.sfxKeyClick(); setActiveTab('GLOBALS'); }}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'GLOBALS' ? 'bg-black text-[#00ff44] border-b-2 border-b-[#00ff44]' : 'text-gray-500 hover:text-white'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              GLOBAL POSTURES
            </button>
          </div>

          {/* Drawer Scrollable Pane */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            
            {activeTab === 'NATIONS' ? (
              // Country Editor Panel
              currentCountryConfig && inspectedCountryData && inspectedCountryId ? (
                <div id="country-config-workspace" className="space-y-5">
                  
                  {/* Selected Country Badge details */}
                  <div className="border border-[#1a5c1a] bg-[#030603] p-4 rounded relative overflow-hidden">
                    <button
                      onClick={() => useUIStore.getState().setCountryInspector(null)}
                      className="absolute right-2 top-2 p-1 text-gray-500 hover:text-white border border-transparent hover:border-[#1a5c1a] rounded transition-all"
                      title="Clear Selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl" role="img" aria-label={inspectedCountryData.name}>
                        {inspectedCountryData.flagEmoji}
                      </span>
                      <div>
                        <div className="text-[8px] bg-[#1a4a1a] text-[#00ff44] px-1.5 py-0.5 font-bold rounded w-max uppercase tracking-widest">
                          {inspectedCountryId} // INSG
                        </div>
                        <h2 className="text-sm font-bold text-white uppercase mt-0.5 font-display tracking-wide">
                          {inspectedCountryData.name}
                        </h2>
                        <span className="text-[9px] text-gray-400 block uppercase tracking-tight">
                          {inspectedCountryData.continent} Region
                        </span>
                      </div>
                    </div>

                    {/* Choose Protagonist Button */}
                    <div className="mt-4 pt-4 border-t border-[#0f340f]">
                      {playerCountryId === inspectedCountryId ? (
                        <div className="flex items-center gap-2 bg-[#00ff44]/15 border border-[#00ff44]/60 px-3 py-2 rounded text-[10px] text-[#00ff44] font-bold">
                          <Check className="w-4 h-4 shrink-0" />
                          <span className="uppercase tracking-wider">COGNATE SOVEREIGN PROTAGONIST</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSetPlayerCountry(inspectedCountryId)}
                          className="w-full py-2 bg-[#040f04] hover:bg-[#082208] border border-[#1a5c1a] hover:border-[#00ff44] text-[10px] font-bold uppercase tracking-wider text-[#00ff44] transition-all cursor-pointer rounded"
                        >
                          ASSIGN AS SOVEREIGN PROTAGONIST
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Operational Settings Form */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] text-[#00e5ff] uppercase font-bold border-b border-[#1a5c1a] pb-1 tracking-wider">
                      STATISTICAL MATRIX CALIBRATION
                    </h3>

                    {/* 1. IDEOLOGY SELECTION GRID */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 uppercase tracking-tight block">
                        Ideological Constitution Block:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {IDEOLOGIES.map((idg) => {
                          const meta = getIdeologyMeta(idg);
                          const isActive = currentCountryConfig.ideology === idg;
                          return (
                            <button
                              key={idg}
                              onClick={() => {
                                audio.sfxKeyClick();
                                updateCountryConfig(inspectedCountryId, { ideology: idg });
                              }}
                              className={`border px-2 py-1.5 text-left rounded text-[9px] transition-all relative ${isActive ? `${meta.bg} ${meta.text} ${meta.glow} border-2` : 'bg-black/40 border-[#0d2e0d] text-gray-500 hover:border-[#1a5c1a] hover:text-gray-300'}`}
                            >
                              <div className="font-bold truncate">{meta.label}</div>
                              {isActive && (
                                <div className="absolute right-1 top-1 w-1 h-1 rounded-full bg-current" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. MILITARY CAPACITY DESIGN SLIDER */}
                    <div className="space-y-1 p-2 bg-[#030603] border border-[#0d2e0d] rounded">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                        <span className="text-gray-400">Military Strength Index:</span>
                        <span className={`${getMilitaryLabel(currentCountryConfig.military).color}`}>
                          {currentCountryConfig.military} / 100
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={currentCountryConfig.military}
                        onChange={(e) => updateCountryConfig(inspectedCountryId, { military: parseInt(e.target.value) })}
                        className="w-full accent-[#00ff44] bg-[#071307] h-1.5 rounded outline-none cursor-pointer"
                      />
                      <div className="text-[8px] text-gray-500 uppercase tracking-tighter mt-1 italic">
                        Class: {getMilitaryLabel(currentCountryConfig.military).label}
                      </div>
                    </div>

                    {/* 3. GDP CAPACITY SLIDER */}
                    <div className="space-y-1 p-2 bg-[#030603] border border-[#0d2e0d] rounded">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                        <span className="text-gray-400">Economic GDP Power:</span>
                        <span className="text-emerald-400">
                          {currentCountryConfig.gdp >= 1000 
                            ? `$${(currentCountryConfig.gdp / 1000).toFixed(1)} Trillion` 
                            : `$${currentCountryConfig.gdp} Billion`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50000"
                        step="100"
                        value={currentCountryConfig.gdp}
                        onChange={(e) => updateCountryConfig(inspectedCountryId, { gdp: parseInt(e.target.value) })}
                        className="w-full accent-[#39d98a] bg-[#071307] h-1.5 rounded outline-none cursor-pointer"
                      />
                      <div className="text-[8px] text-gray-500 uppercase tracking-tighter mt-1 italic">
                        Operational reserves & active treasury cash calculated based on GDP scale.
                      </div>
                    </div>

                    {/* 4. PLAYER RELATIONS SCORE */}
                    <div className="space-y-1 p-2 bg-[#030603] border border-[#0d2e0d] rounded">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold">
                        <span className="text-gray-400">Sentiment with protagonist:</span>
                        <span className={`${getRelationLabel(currentCountryConfig.opinion).color}`}>
                          {currentCountryConfig.opinion > 0 ? `+${currentCountryConfig.opinion}` : currentCountryConfig.opinion}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="5"
                        value={currentCountryConfig.opinion}
                        onChange={(e) => updateCountryConfig(inspectedCountryId, { opinion: parseInt(e.target.value) })}
                        className="w-full accent-[#00e5ff] bg-[#071307] h-1.5 rounded outline-none cursor-pointer"
                        disabled={inspectedCountryId === playerCountryId}
                      />
                      <div className="text-[8px] text-gray-500 uppercase tracking-tighter mt-1 italic flex justify-between">
                        <span>POSTURE: {getRelationLabel(currentCountryConfig.opinion).title}</span>
                        {inspectedCountryId === playerCountryId && <span className="text-amber-500">PROTAGONIST BASELINE SELF</span>}
                      </div>
                    </div>

                    {/* 5. ALLIANCE BLOCK ATTACHMENT */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 uppercase tracking-tight block">
                        Superpower Bloc/Alliance Alignment:
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['NATO', 'BRICS', 'GCC', 'QUAD', 'SCO', 'NEUTRAL'] as AllianceBlock[]).map((bloc) => {
                          const isActive = currentCountryConfig.alliance === bloc;
                          const colorMap: Record<AllianceBlock, string> = {
                            NATO: 'border-blue-600/70 text-blue-400 hover:bg-blue-950/20',
                            BRICS: 'border-orange-600/70 text-orange-400 hover:bg-orange-950/20',
                            GCC: 'border-yellow-600/70 text-yellow-400 hover:bg-yellow-950/20',
                            QUAD: 'border-teal-600/70 text-teal-400 hover:bg-teal-950/20',
                            SCO: 'border-purple-600/70 text-purple-400 hover:bg-purple-950/20',
                            NEUTRAL: 'border-gray-600/70 text-gray-400 hover:bg-gray-950/20',
                          };
                          return (
                            <button
                              key={bloc}
                              onClick={() => {
                                audio.sfxKeyClick();
                                updateCountryConfig(inspectedCountryId, { alliance: bloc });
                              }}
                              className={`py-1 text-[9px] font-bold border rounded transition-all text-center ${isActive ? 'bg-[#0a200a] text-[#00ff44] border-2 border-[#00ff44] shadow-[0_0_6px_rgba(0,255,100,0.2)]' : `bg-black/40 text-gray-500 ${colorMap[bloc]}`}`}
                            >
                              {bloc}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 6. NUCLEAR WEAPONS CAPABILITY HAZARD TOGGLE */}
                    <div className={`p-3 border rounded transition-all flex items-center justify-between ${currentCountryConfig.nuclear ? 'bg-amber-950/20 border-yellow-600/80 shadow-[0_0_8px_rgba(217,119,6,0.15)]' : 'bg-black/40 border-[#0d2e0d]'}`}>
                      <div className="flex items-center gap-2">
                        <Atom className={`w-6 h-6 shrink-0 ${currentCountryConfig.nuclear ? 'text-yellow-500 animate-spin-slow' : 'text-gray-600'}`} />
                        <div>
                          <div className="text-[10px] font-bold text-white uppercase">NUCLEAR ARSENAL WEAPONS</div>
                          <div className="text-[8px] text-gray-500 uppercase tracking-tighter mt-0.5 max-w-[200px]">
                            {currentCountryConfig.nuclear 
                              ? 'AUTHORISED COMBAT READY STRATEGIC LAUNCH CODES' 
                              : 'NO OPERATION NUCLEAR WEAPONS STOCKS PERMITTED'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          audio.sfxKlaxon();
                          updateCountryConfig(inspectedCountryId, { nuclear: !currentCountryConfig.nuclear });
                        }}
                        className={`px-3 py-1.5 border font-bold text-[9px] uppercase rounded transition-all cursor-pointer ${currentCountryConfig.nuclear ? 'bg-yellow-600 border-yellow-400 text-black hover:bg-yellow-500' : 'bg-black/30 border-gray-800 text-gray-500 hover:text-white'}`}
                      >
                        {currentCountryConfig.nuclear ? 'DECOUPLED' : 'LOCKED'}
                      </button>
                    </div>

                  </div>
                </div>
              ) : (
                // Country List Empty Roster (Inspected remains null) - Main Scenario Design Suite
                <div id="country-list-roster" className="space-y-5">
                  
                  {/* Scenario Presets Section */}
                  <div className="space-y-2 p-3 bg-[#030603] border border-[#1a5c1a]/40 rounded">
                    <h3 className="text-[10px] text-[#00e5ff] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-[#1a5c1a]/30 pb-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      COGNATE WORLD MATRIX PRESETS
                    </h3>
                    <p className="text-[7.5px] text-gray-500 uppercase leading-snug">
                      Apply holistic geopolitical templates to override the entire matrix:
                    </p>
                    
                    <div className="space-y-1.5 mt-2">
                      {[
                        { key: 'DEFAULT', title: 'Sovereign Baseline', desc: 'Standard baseline configurations derived from starting values.' },
                        { key: 'COLD_WAR', title: 'Cold War Bipolar Standoff', desc: 'Democracy vs Communist camps. High tension, radioactive readiness.' },
                        { key: 'MULTIPOLAR', title: 'Multipolar Chaos Blocs', desc: 'Fractured overlapping regional alliances. Distrust, global arms build up.' },
                        { key: 'NUCLEAR_BRINK', title: 'Nuclear Brinkmanship Standoff', desc: 'Almost all nations acquired fallout weapons. Heavy paranoia.' },
                        { key: 'NON_ALIGNED', title: 'Non-Aligned Neutral Wave', desc: 'Dissolved pacts, NEUTRAL focus, scattered regional regime styles.' }
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() => handleApplyPreset(preset.key as any)}
                          className="w-full text-left p-2 bg-black hover:bg-[#041204] border border-[#0d2e0d] hover:border-[#00ff44] rounded text-[9px] transition-all group cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-200 group-hover:text-[#00ff44]">{preset.title}</span>
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-[#00ff44]" />
                          </div>
                          <p className="text-[7.5px] text-gray-500 uppercase mt-0.5 leading-normal">{preset.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stochastic Geopolitical Randomizer */}
                  <div className="space-y-2 p-3 bg-[#030603] border border-[#1a5c1a]/40 rounded">
                    <h3 className="text-[10px] text-[#00e5ff] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-[#1a5c1a]/30 pb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00ffaa]" />
                      STOCHASTIC POSTURE MATRIX
                    </h3>
                    <p className="text-[7.5px] text-gray-500 uppercase leading-snug">
                      Generate surprising yet plausible geopolitical starting conditions based on region-coherent logic blocks.
                    </p>
                    <button
                      onClick={handleApplyRandomization}
                      className="w-full mt-1.5 py-2.5 bg-[#031d0d] hover:bg-[#07361a] border border-[#00ffaa] hover:shadow-[0_0_8px_rgba(0,255,170,0.3)] text-[#00ffaa] text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded flex items-center justify-center gap-1.5"
                    >
                      <Dices className="w-3.5 h-3.5 animate-pulse" />
                      RANDOMIZE ENTIRE MATRIX WORLD
                    </button>
                  </div>

                  {/* Link Share Import / Export Segment */}
                  <div className="space-y-3 p-3 bg-[#030603] border border-[#1a5c1a]/40 rounded">
                    <h3 className="text-[10px] text-[#00e5ff] uppercase font-bold tracking-wider flex items-center gap-1.5 border-b border-[#1a5c1a]/30 pb-1.5">
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      SERIALIZE & SHARE SCENARIOS
                    </h3>
                    
                    {/* Share Button Export */}
                    <div className="space-y-1.5">
                      <button
                        onClick={handleGenerateShareUrl}
                        className="w-full py-2 bg-black hover:bg-[#05111b] border border-blue-900/60 hover:border-blue-400 text-blue-400 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded flex items-center justify-center gap-1.5"
                      >
                        <Copy className="w-3 h-3" />
                        {clipboardStatus === 'SUCCESS' ? 'COPIED SCENARIO MAP DEEP LINK!' : 'EXPORT & COPY SCENARIO DEEP LINK'}
                      </button>
                      
                      {shareUrl && (
                        <div className="bg-black/80 border border-blue-950 p-1.5 rounded">
                          <label className="text-[6.5px] text-blue-500 block uppercase font-bold">Deep Link Config Payload:</label>
                          <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            onClick={(e) => (e.target as any).select()}
                            className="w-full bg-black/40 text-blue-300 text-[7px] border-none outline-none font-sans px-1 truncate pointer-events-auto cursor-text select-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Import Button / Text Arena */}
                    <div className="space-y-1.5 pt-2 border-t border-[#0d2e0d]">
                      <label className="text-[7.5px] text-gray-500 uppercase font-bold block">
                        Import Scenario Deep-Link Code:
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Paste scenario link or base64 token here..."
                          value={importText}
                          onChange={(e) => setImportText(e.target.value)}
                          className="flex-1 bg-black border border-[#0d2e0d] focus:border-blue-500 text-[9px] px-2 py-1 rounded text-white outline-none font-sans"
                        />
                        <button
                          onClick={handleManualImport}
                          className="px-2.5 bg-blue-950 border border-blue-600 hover:bg-blue-900 text-blue-400 text-[9px] font-bold uppercase rounded transition-all cursor-pointer"
                        >
                          INJECT
                        </button>
                      </div>
                      
                      {importStatus === 'SUCCESS' && (
                        <p className="text-[8px] text-[#00ff44] uppercase font-bold tracking-tight animate-pulse">
                          ✓ INTEL MAP CODE INJECTED SUCCESSFULLY!
                        </p>
                      )}
                      {importStatus === 'ERROR' && (
                        <p className="text-[7.5px] text-red-500 uppercase font-bold tracking-tight">
                          ⚠ {importErrorMsg}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Regional Sovereign List Checklist */}
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] text-[#00e5ff] uppercase font-bold border-b border-[#1a5c1a] pb-1 tracking-wider">
                      REGIONAL SOVEREIGN ROSTER
                    </h3>
                    <p className="text-[7.5px] text-gray-500 uppercase leading-snug">
                      Click any country below or on the map centures for detailed fine-tuning:
                    </p>
                    
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 mt-1.5 custom-scrollbar">
                      {Object.keys(INITIAL_COUNTRIES).map((id) => {
                        const cData = INITIAL_COUNTRIES[id];
                        const cConfig = worldBuilderConfig[id];
                        const isPlayer = id === playerCountryId;
                        if (!cData || !cConfig) return null;
                        return (
                          <div
                            key={id}
                            onClick={() => useUIStore.getState().setCountryInspector(id)}
                            className={`p-2 border rounded cursor-pointer transition-all flex items-center justify-between ${isPlayer ? 'bg-[#051a0d] border-[#00ffaa]/60 hover:border-[#00ffaa]' : 'bg-black/40 border-[#0d2e0d] hover:border-green-800'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{cData.flagEmoji}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-white font-bold uppercase">{cData.name}</span>
                                  {isPlayer && (
                                    <span className="text-[6.5px] px-1 bg-[#00ffaa] text-black font-bold uppercase rounded">
                                      PROTAGONIST
                                    </span>
                                  )}
                                </div>
                                <div className="text-[7px]/none text-gray-500 uppercase mt-0.5">
                                  GDP: ${cConfig.gdp >= 1000 ? `${(cConfig.gdp / 1000).toFixed(1)}T` : `$${cConfig.gdp}B`} | MIL: {cConfig.military} | {cConfig.alliance}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {cConfig.nuclear && (
                                <Atom className="w-3 h-3 text-yellow-500" title="Nuclear Deterrent" />
                              )}
                              <ChevronRight className="w-3 h-3 text-gray-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Tab Globals - Configuration inputs (Tension, AI, duration scale, timeline)
              <div id="matrix-globals-panel" className="space-y-4">
                
                {/* World Posture Presets */}
                <div className="space-y-2">
                  <h3 className="text-[10px] text-[#00e5ff] uppercase font-bold border-b border-[#1a5c1a] pb-1 tracking-wider">
                    WORLDBULDER CONFLICT POSTURE
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {(['COLD_PEACE', 'SIMMERING', 'WORLD_ON_EDGE', 'INFERNO'] as const).map((preset) => {
                      const labelMap = {
                        COLD_PEACE: { title: 'COLD PEACE', desc: 'No active wars, stable markets.' },
                        SIMMERING: { title: 'SIMMERING', desc: 'Regional skirmishes occurring.' },
                        WORLD_ON_EDGE: { title: 'ON EDGE', desc: 'Active superpower mobilization.' },
                        INFERNO: { title: 'INFERNO', desc: 'SUPERPOWER COALITION MELTDOWN.' }
                      };
                      const isActive = tensionPreset === preset;
                      return (
                        <div
                          key={preset}
                          onClick={() => { audio.sfxKeyClick(); setTensionPreset(preset); }}
                          className={`p-2.5 border rounded cursor-pointer transition-all flex flex-col justify-between ${isActive ? 'bg-[#061206] border-[#00ff44] text-[#00ff44]' : 'bg-black/40 border-[#0d2e0d] text-gray-400 hover:border-green-800'}`}
                        >
                          <span className={`text-[9px] font-bold ${isActive ? 'text-[#00ff44]' : 'text-white'}`}>
                            {labelMap[preset].title}
                          </span>
                          <span className="text-[7px] text-gray-500 mt-1 uppercase leading-normal">
                            {labelMap[preset].desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Economic Scaling Buffs */}
                <div className="space-y-1.5 p-2.5 bg-[#030603] border border-[#0d2e0d] rounded">
                  <label className="text-[9px] text-gray-400 uppercase tracking-tight block">
                    GLOBAL RESOURCES MULTIPLIER:
                  </label>
                  <select
                    value={multiplier}
                    onChange={(e) => { audio.sfxKeyClick(); setMultiplier(e.target.value as any); }}
                    className="w-full bg-black border border-[#1a5c1a] hover:border-[#00ff44] transition-all text-[10px] px-2 py-1.5 rounded text-white outline-none cursor-pointer"
                  >
                    <option value="REALISTIC">REALISTIC WEAPONS SEEDING (1.0X BASIS)</option>
                    <option value="EMPOWERED">BUFFED CAPITAL EMPOWERED (3.0X STATS)</option>
                    <option value="CRISIS">RESOURCE SCARCITY CRISIS PENALTY (0.5X HARD)</option>
                  </select>
                </div>

                {/* Timeline Config */}
                <div className="space-y-3 p-2.5 bg-[#030603] border border-[#0d2e0d] rounded">
                  <h4 className="text-[9px] text-[#00e5ff] uppercase font-bold tracking-wider">
                    SIMULATION TIMELINE RESOLUTION
                  </h4>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-400 uppercase block">Temporal Protocol Mode:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => { audio.sfxKeyClick(); setDurationMode('ENDLESS'); }}
                        className={`py-1.5 text-[9px] border rounded font-bold transition-all ${durationMode === 'ENDLESS' ? 'bg-[#061206] border-[#00ff44] text-[#00ff44]' : 'bg-black/30 border-gray-800 text-gray-500 hover:text-white'}`}
                      >
                        ENDLESS ENGINE
                      </button>
                      <button
                        onClick={() => { audio.sfxKeyClick(); setDurationMode('TIMED'); }}
                        className={`py-1.5 text-[9px] border rounded font-bold transition-all flex items-center justify-center gap-1 ${durationMode === 'TIMED' ? 'bg-[#061206] border-[#00ff44] text-[#00ff44]' : 'bg-black/30 border-gray-800 text-gray-500 hover:text-white'}`}
                      >
                        TIMED LIMITS
                        {durationMode === 'TIMED' && (
                          <input
                            type="number"
                            value={timedTicks}
                            onChange={(e) => setTimedTicks(Math.max(5, parseInt(e.target.value) || 150))}
                            onClick={(e) => e.stopPropagation()}
                            className="w-10 bg-black border border-[#1a5c1a] text-center font-bold text-[#00ff44] text-[8px] rounded outline-none"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-400 uppercase block">Scale Frequency Resolution:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['DAY', 'WEEK', 'MONTH'] as const).map(scale => (
                        <button
                          key={scale}
                          onClick={() => { audio.sfxKeyClick(); setTickScale(scale); }}
                          className={`text-[9px] font-bold py-1 border rounded transition-all cursor-pointer ${tickScale === scale ? 'bg-[#061206] border-[#00ff44] text-[#00ff44]' : 'bg-black/30 border-gray-800 text-gray-500'}`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-400 uppercase block">Initial Ignition Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-black border border-[#1a5c1a] text-[10px] px-2 py-1 rounded text-white outline-none focus:border-[#00ff44]"
                    />
                  </div>
                </div>

                {/* AI Aggression Parameters */}
                <div className="space-y-2 p-2.5 bg-[#030603] border border-[#0d2e0d] rounded">
                  <label className="text-[9px] text-gray-400 uppercase block">AI Threat Operations Aggression:</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['PASSIVE', 'BALANCED', 'HAWKISH', 'APOCALYPTIC'].map((val, idx) => (
                      <button
                        key={val}
                        onClick={() => { audio.sfxKeyClick(); setAiAggression(idx + 1); }}
                        className={`text-[8px] py-1.5 border font-bold rounded transition-all whitespace-nowrap ${aiAggression === idx + 1 ? 'bg-[#061206] border-[#00ff44] text-[#00ff44]' : 'bg-black/30 border-gray-800 text-gray-500 hover:text-white'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Substate Actor threat */}
                <div className="space-y-2 p-2.5 bg-[#030603] border border-[#0d2e0d] rounded">
                  <label className="text-[9px] text-gray-400 uppercase block">Substate Insurgency Activity Level:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['DORMANT', 'ACTIVE', 'SURGING'].map((val) => (
                      <button
                        key={val}
                        onClick={() => { audio.sfxKeyClick(); setSubstateActivity(val as any); }}
                        className={`text-[8px] py-1.5 border font-bold rounded transition-all ${substateActivity === val ? 'bg-[#061206] border-[#00ff44] text-[#00ff44]' : 'bg-black/30 border-gray-800 text-gray-500 hover:text-white'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Collateral Footer Action in Sidebar */}
          <div className="p-4 border-t border-[#1a5c1a] bg-black/90 shrink-0 space-y-2">
            <button
              id="launch-sim-btn"
              onClick={handleLaunch}
              className="w-full py-3.5 bg-[#072407] hover:bg-[#0f440f] border-2 border-[#00ff44] hover:shadow-[0_0_15px_rgba(0,255,100,0.4)] text-[#00ff44] text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer rounded flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4 animate-bounce" />
              INTEGRATE & LAUNCH COGNATE CONSOLE
            </button>
            <div className="flex justify-between items-center text-[7.5px] text-gray-500 uppercase px-1">
              <span>SECURITY PROTOCOL: SECURE SIM</span>
              <span>ENGINE: SOVEREIGN 2.0A</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
