import React, { useState, useEffect } from 'react';
import { SCENARIOS } from '../../data/scenarios';
import { useClockStore } from '../../store/clockStore';
import { useDefconStore } from '../../store/defconStore';
import { useFogOfWarStore } from '../../store/fogOfWarStore';
import { useConsequenceStore } from '../../store/consequenceStore';
import { ScenarioId } from '../../types';
import { audio } from '../../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Sliders,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  Search,
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
  TrendingUp,
  Zap,
  Lock,
  Award,
  Flame,
  Radio,
  FileText,
  MousePointerClick,
  Compass,
  AlertOctagon,
  Scale
} from 'lucide-react';

// Seeded country helper inside lobby with metadata
const LOBBY_NATIONS = [
  { id: 'US', name: 'United States', flag: '🇺🇸', ideology: 'DEMOCRACY', alliance: 'NATO', gdp: 28000, power: 95, diff: 'NOVICE', alignment: 'WESTERN' },
  { id: 'CN', name: 'China', flag: '🇨🇳', ideology: 'AUTOCRACY', alliance: 'SCO', gdp: 19000, power: 88, diff: 'OPERATIVE', alignment: 'EASTERN' },
  { id: 'RU', name: 'Russia', flag: '🇷🇺', ideology: 'AUTOCRACY', alliance: 'SCO', gdp: 2100, power: 90, diff: 'ELITE', alignment: 'EASTERN' },
  { id: 'IN', name: 'India', flag: '🇮🇳', ideology: 'DEMOCRACY', alliance: 'QUAD', gdp: 3900, power: 72, diff: 'OPERATIVE', alignment: 'NON_ALIGNED' },
  { id: 'PK', name: 'Pakistan', flag: '🇵🇰', ideology: 'MILITARY_JUNTA', alliance: 'NEUTRAL', gdp: 350, power: 55, diff: 'ELITE', alignment: 'EASTERN' },
  { id: 'IL', name: 'Israel', flag: '🇮🇱', ideology: 'DEMOCRACY', alliance: 'NEUTRAL', gdp: 520, power: 78, diff: 'OPERATIVE', alignment: 'WESTERN' },
  { id: 'IR', name: 'Iran', flag: '🇮🇷', ideology: 'THEOCRACY', alliance: 'SCO', gdp: 400, power: 60, diff: 'ELITE', alignment: 'EASTERN' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧', ideology: 'DEMOCRACY', alliance: 'NATO', gdp: 3100, power: 70, diff: 'NOVICE', alignment: 'WESTERN' },
  { id: 'FR', name: 'France', flag: '🇫🇷', ideology: 'DEMOCRACY', alliance: 'NATO', gdp: 3000, power: 68, diff: 'NOVICE', alignment: 'WESTERN' },
  { id: 'DE', name: 'Germany', flag: '🇩🇪', ideology: 'DEMOCRACY', alliance: 'NATO', gdp: 4500, power: 62, diff: 'NOVICE', alignment: 'WESTERN' },
  { id: 'JP', name: 'Japan', flag: '🇯🇵', ideology: 'DEMOCRACY', alliance: 'QUAD', gdp: 4200, power: 58, diff: 'NOVICE', alignment: 'WESTERN' },
  { id: 'KR', name: 'South Korea', flag: '🇰🇷', ideology: 'DEMOCRACY', alliance: 'QUAD', gdp: 1800, power: 60, diff: 'OPERATIVE', alignment: 'WESTERN' },
  { id: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', ideology: 'THEOCRACY', alliance: 'GCC', gdp: 1100, power: 65, diff: 'OPERATIVE', alignment: 'NON_ALIGNED' },
  { id: 'BR', name: 'Brazil', flag: '🇧🇷', ideology: 'DEMOCRACY', alliance: 'NEUTRAL', gdp: 2100, power: 48, diff: 'NOVICE', alignment: 'NON_ALIGNED' },
  { id: 'ZA', name: 'South Africa', flag: '🇿🇦', ideology: 'DEMOCRACY', alliance: 'BRICS', gdp: 400, power: 35, diff: 'ELITE', alignment: 'NON_ALIGNED' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺', ideology: 'DEMOCRACY', alliance: 'QUAD', gdp: 1700, power: 55, diff: 'NOVICE', alignment: 'WESTERN' },
  { id: 'TR', name: 'Turkey', flag: '🇹🇷', ideology: 'AUTOCRACY', alliance: 'NATO', gdp: 1100, power: 62, diff: 'ELITE', alignment: 'NON_ALIGNED' },
  { id: 'EG', name: 'Egypt', flag: '🇪🇬', ideology: 'MILITARY_JUNTA', alliance: 'NEUTRAL', gdp: 470, power: 50, diff: 'OPERATIVE', alignment: 'NON_ALIGNED' },
  { id: 'TW', name: 'Taiwan', flag: '🇹🇼', ideology: 'DEMOCRACY', alliance: 'NEUTRAL', gdp: 790, power: 64, diff: 'LEGENDARY', alignment: 'WESTERN' }
];

interface GameLobbyProps {
  onStartScenario: (id: ScenarioId, countryId: string, customOptions?: any) => void;
  onOpenWorldBuilder: () => void;
}

export default function GameLobby({ onStartScenario, onOpenWorldBuilder }: GameLobbyProps) {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('MENA_SPARK');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mission params
  const [durationMode, setDurationMode] = useState<'SCENARIO' | 'TIMED' | 'ENDLESS'>('SCENARIO');
  const [timedTicks, setTimedTicks] = useState(100);
  const [tickScale, setTickScale] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [startDate, setStartDate] = useState('2027-01-15');
  const [initialSpeed, setInitialSpeed] = useState<'PAUSED' | 'NORMAL' | 'FAST' | 'ULTRA'>('PAUSED');

  // Advanced configurations
  const [aiAggression, setAiAggression] = useState(2); // 1-5 slider
  const [nuclearDoctrine, setNuclearDoctrine] = useState<'NO_FIRST_USE' | 'FLEXIBLE' | 'LAUNCH_ON_WARNING'>('FLEXIBLE');
  const [startingIntel, setStartingIntel] = useState<'BLIND' | 'PARTIAL' | 'FULL'>('PARTIAL');
  const [consequencesEnabled, setConsequencesEnabled] = useState(true);
  const [economicVolatility, setEconomicVolatility] = useState(2); // 1-5 slider
  const [substateActivity, setSubstateActivity] = useState(3); // 1-5 slider

  // Real-time background clock state purely for visual tactical ambiance
  const [systemTime, setSystemTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNations = LOBBY_NATIONS.filter(n =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeScenarioObj = SCENARIOS[selectedScenario];
  const isSelectedCountryPlayable = activeScenarioObj?.playableCountryIds.includes(selectedCountry);

  const handleLaunchGame = () => {
    audio.sfxKlaxon();
    
    // 1. Setup clock parameters
    useClockStore.getState().initClock(
      startDate,
      durationMode,
      tickScale,
      durationMode === 'TIMED' ? timedTicks : 100
    );

    // 2. Setup Fog Of War
    const targetAllies = selectedCountry === 'US' ? ['GB', 'FR', 'DE', 'JP', 'KR', 'AU'] : [];
    useFogOfWarStore.getState().initFog(selectedCountry, targetAllies, startingIntel);

    // 3. Setup DEFCON & Consequences State
    useDefconStore.getState().resetDefcon();
    if (!consequencesEnabled) {
      useConsequenceStore.getState().resetScars();
    }

    // 4. Trigger initiation
    onStartScenario(selectedScenario, selectedCountry, {
      aiAggression,
      nuclearDoctrine,
      economicVolatility,
      substateActivity
    });
  };

  return (
    <div className="absolute inset-0 bg-[#020503] flex items-center justify-center p-3 overflow-hidden z-50 select-none font-mono text-green-400">
      {/* Dynamic Cyber Ambient Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #0d2c16 0%, transparent 80%),
            linear-gradient(rgba(0, 255, 68, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 68, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 25px 25px'
        }}
      />
      <div className="scanlines absolute inset-0 pointer-events-none z-10 opacity-30" />

      {/* Main Terminal Shell Container */}
      <div className="w-full max-w-[1550px] h-[96vh] bg-[#030804]/95 border-2 border-green-500/30 rounded-lg flex flex-col p-4 relative z-20 shadow-[0_0_50px_rgba(0,255,68,0.08)] overflow-hidden">
        
        {/* CORNER TECH DESIGN FLAPS */}
        <div className="absolute top-0 left-0 w-8 h-1 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute top-0 left-0 w-1 h-8 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute top-0 right-0 w-8 h-1 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute top-0 right-0 w-1 h-8 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute bottom-0 left-0 w-8 h-1 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute bottom-0 left-0 w-1 h-8 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute bottom-0 right-0 w-8 h-1 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />
        <div className="absolute bottom-0 right-0 w-1 h-8 bg-green-500 shadow-[0_0_8px_rgba(0,255,68,0.5)] z-20" />

        {/* TOP STATUS CONTROL HUB */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1a5c1a]/50 pb-3 mb-4 flex-shrink-0 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center p-2.5 bg-green-500/10 border border-green-500/30 rounded">
              <Compass className="w-6 h-6 text-green-300 animate-spin" style={{ animationDuration: '25s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="live-indicator shrink-0" />
                <h1 className="text-xl font-display font-medium text-white tracking-widest uppercase leading-none">
                  SOVEREIGN COMMAND SIMULATOR <span className="text-[#00ff44] font-bold">V4.0</span>
                </h1>
              </div>
              <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.2em] mt-1 font-mono flex items-center gap-2">
                <span>SYSTEM STATUS: CONNECTED</span>
                <span className="text-green-700">|</span>
                <span>COMMS SECURE</span>
                <span className="text-green-700">|</span>
                <span className="text-[#ffb300] font-bold flex items-center gap-0.5 animate-pulse">
                  <Radio className="w-3.5 h-3.5 inline" /> ACTIVE INTEL DIRECTIVE
                </span>
              </p>
            </div>
          </div>

          {/* SATELLITE METRICS & UTC TIMESTAMP */}
          <div className="flex items-center gap-4 bg-green-950/20 border border-[#1d4422] rounded px-3 py-1.5 text-[9px] font-bold text-gray-400">
            <div className="text-right">
              <div>UPLINK SATELLITE: <span className="text-[#00ff44]">SAT_COM_OVR_29X</span></div>
              <div className="text-[8px] text-[rgba(0,229,255,0.8)] mt-0.5 font-mono">{systemTime}</div>
            </div>
            <div className="w-[1px] h-6 bg-[#1a5c1a]/40" />
            <div className="text-right">
              <div>ENCRYPTION SYSTEM: <span className="text-[#ffb300]">AES_256_COSMIC</span></div>
              <div className="text-gray-500 text-[8px] mt-0.5">AUTHORIZATION KEY VALID</div>
            </div>
            <div className="w-[1px] h-6 bg-[#1a5c1a]/40" />
            <div className="font-mono text-center flex flex-col justify-center items-center px-1">
              <span className="text-[9px] text-[#ff3b4e] font-bold heartbeat tracking-wider">TS/SCI</span>
              <span className="text-[7px] text-gray-500 font-bold">EYES ONLY</span>
            </div>
          </div>
        </div>

        {/* THREE PANEL OPERATIONAL GRID */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0 overflow-hidden mb-4">
          
          {/* PANEL 1: NATION ROSTER DIRECTORY (1 Column) */}
          <div className="border border-[#1a5c1a]/40 bg-[#040905]/95 p-3.5 flex flex-col min-h-0 rounded-md shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 border-tr border-r border-t border-green-500/40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-bl border-l border-b border-green-500/40 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-[#1a5c1a]/50 pb-2 mb-3">
              <h3 className="text-xs uppercase font-bold text-[#00e5ff] tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00e5ff]" /> 01 // COGNATE ROSTER
              </h3>
              <span className="text-[8px] px-1.5 py-0.5 bg-green-950 text-green-400 font-bold border border-green-500/20 uppercase">
                {filteredNations.length} NATIONS
              </span>
            </div>

            {/* Filter */}
            <div className="relative mb-3 flex-shrink-0">
              <input
                type="text"
                placeholder="FILTER COGNATE NATIVES..."
                value={searchQuery}
                onChange={(e) => { audio.sfxKeyClick(); setSearchQuery(e.target.value); }}
                className="w-full bg-[#030603] border border-[#1a5c1a] text-[11px] pl-8 pr-2 py-2 rounded text-white placeholder-green-800 outline-none focus:border-[#00ff44] focus:shadow-[0_0_8px_rgba(0,255,68,0.15)] transition-all font-mono uppercase"
              />
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-green-700" />
            </div>

            {/* Nation Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {filteredNations.map((n) => {
                const isSelected = n.id === selectedCountry;
                const isPlayable = activeScenarioObj?.playableCountryIds.includes(n.id);
                
                return (
                  <div
                    key={n.id}
                    onClick={() => { audio.sfxKeyClick(); setSelectedCountry(n.id); }}
                    className={`group border rounded-md p-2.5 cursor-pointer transition-all relative overflow-hidden ${
                      isSelected 
                        ? 'border-[#00ff44] bg-[#0a1e0b]/80 shadow-[0_0_12px_rgba(0,255,68,0.15)]' 
                        : 'border-[#143217]/50 bg-black/40 hover:border-green-600/70 hover:bg-green-950/10'
                    }`}
                  >
                    {/* Background visual highlight if selected */}
                    {isSelected && (
                      <div className="absolute inset-y-0 left-0 w-[3px] bg-green-500 animate-pulse" />
                    )}

                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{n.flag}</span>
                        <span className="font-bold text-xs uppercase text-white group-hover:text-green-300 transition-colors">
                          {n.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isPlayable && (
                          <span className="text-[7px] text-[#00ff44] border border-[#00ff44]/30 px-1 py-px rounded font-semibold bg-[#00ff44]/5 block tracking-wide">
                            RECOMMENDED
                          </span>
                        )}
                        <span className="text-[8px] font-mono px-1.5 bg-[#0e2712] text-green-400 border border-green-500/20 rounded font-bold">
                          {n.id}
                        </span>
                      </div>
                    </div>

                    <div className="text-[9px] text-gray-500 mt-1 uppercase flex justify-between tracking-wider">
                      <span>GDP: ${(n.gdp / 1000).toFixed(1)}T</span>
                      <span>Alliance: <span className="text-gray-400 font-bold">{n.alliance}</span></span>
                    </div>

                    {/* Meta progress bar visualizing tactical power index */}
                    <div className="mt-2 h-[2.5px] bg-[#0c1b0f] rounded-full overflow-hidden w-full relative">
                      <div 
                        className={`h-full transition-all duration-300 ${isSelected ? 'bg-green-400' : 'bg-green-800/40'}`}
                        style={{ width: `${n.power}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[7.5px] text-gray-600 mt-1 uppercase font-semibold">
                      <span>TACTICAL POWER INDEX</span>
                      <span className={isSelected ? 'text-green-400' : 'text-gray-500'}>{n.power}%</span>
                    </div>
                  </div>
                );
              })}

              {filteredNations.length === 0 && (
                <div className="py-8 text-center text-gray-600 text-[10px] uppercase font-bold flex flex-col items-center gap-2">
                  <AlertOctagon className="w-8 h-8 text-gray-800" />
                  No matching files registered in satellite directory.
                </div>
              )}
            </div>
          </div>

          {/* PANEL 2: MISSION SPOTLIGHT & REGISTER (2 Columns - center) */}
          <div className="md:col-span-2 flex flex-col min-h-0 gap-4 overflow-hidden">
            
            {/* ACTIVE THEATER DIRECTIVE BRIEF (Spotlight details, upper half) */}
            <div className="border border-amber-500/20 bg-[#090b07]/90 p-4 rounded-md flex flex-col relative overflow-hidden flex-shrink-0 shadow-[0_0_24px_rgba(180,120,0,0.03)] border-b-2 border-b-amber-500/30">
              <div className="absolute top-0 right-0 w-3 h-3 border-tr border-r border-t border-amber-500/30 pointer-events-none" />
              <div className="classification-banner absolute top-2 right-2 text-[#ffb300] flex items-center gap-1.5 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20">
                <Shield className="w-3 h-3 text-amber-500 inline" /> OPERATIONAL SPOTLIGHT
              </div>

              <h3 className="text-xs uppercase font-bold text-[#ffb300] tracking-wider mb-2.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ffb300]" /> 02 // SATELLITE DIRECTIVE INTEL
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Left col inside brief: Mission metadata cards */}
                <div className="sm:col-span-1 space-y-2">
                  <div className="bg-[#12110c] border border-amber-500/20 rounded p-2.5">
                    <span className="text-[8px] text-[#ffb300]/80 font-bold uppercase tracking-widest block mb-0.5">THEATER DESIGNATION:</span>
                    <span className="text-sm font-display font-bold text-white tracking-wide uppercase block">
                      {activeScenarioObj?.name}
                    </span>
                  </div>

                  <div className="bg-[#0e0e0b] border border-[#1a1c1a] rounded p-2.5 text-[10px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase">DIFFICULTY:</span>
                      <span className={`font-bold ${
                        activeScenarioObj?.difficulty === 'EXPERT' ? 'text-red-500' :
                        activeScenarioObj?.difficulty === 'HARD' ? 'text-[#ffb300]' : 'text-green-400'
                      }`}>{activeScenarioObj?.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase">STATUS LEVEL:</span>
                      <span className={`font-bold uppercase ${
                        activeScenarioObj?.threatLevel === 'RED' ? 'text-red-500' :
                        activeScenarioObj?.threatLevel === 'ORANGE' ? 'text-[#ffb300]' : 'text-[#00e5ff]'
                      }`}>{activeScenarioObj?.threatLevel} ALERT</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#1a5c1a]/10">
                      <span className="text-gray-500 uppercase">COGNATE COMPAT:</span>
                      {isSelectedCountryPlayable ? (
                        <span className="text-green-400 font-bold flex items-center gap-1 text-[9px]">
                          <CheckCircle2 className="w-3 h-3 text-green-400 inline" /> INTEL ALIGNED
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold flex items-center gap-1 text-[9px] animate-pulse">
                          <XCircle className="w-3 h-3 text-red-500 inline" /> STABILITY GAP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right columns inside brief: Description, objectives, consequences */}
                <div className="sm:col-span-2 space-y-2.5">
                  <div>
                    <span className="text-[8px] text-gray-500 font-bold uppercase block tracking-wider">DIRECTIVE INTELLIGENCE BREVIARY:</span>
                    <p className="text-[10.5px] text-gray-300 leading-normal lowercase first-letter:uppercase mt-1 italic pr-1 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                      "{activeScenarioObj?.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#1a5c1a]/20">
                    <div className="bg-green-950/10 border border-green-500/20 p-2.5 rounded relative">
                      <span className="text-[8px] text-green-400 font-bold block mb-1 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 inline" /> PRIMARY TARGETIVE
                      </span>
                      <p className="text-[9.5px] text-gray-300 leading-normal uppercase">
                        {activeScenarioObj?.winDescription}
                      </p>
                    </div>

                    <div className="bg-red-950/10 border border-red-500/20 p-2.5 rounded relative">
                      <span className="text-[8px] text-red-400 font-bold block mb-1 uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 inline" /> FAILURE COLLATERAL
                      </span>
                      <p className="text-[9.5px] text-gray-300 leading-normal uppercase">
                        {activeScenarioObj?.lossDescription}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* DIRECT DIRECTORY SELECTOR (Lower half) */}
            <div className="border border-[#1a5c1a]/40 bg-[#040905]/95 p-3.5 flex flex-col min-h-0 rounded-md shadow-inner flex-1 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-[#1a5c1a] border-t border-l pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-[#1a5c1a] border-b border-r pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#1a5c1a]/40 pb-2 mb-3 flex-shrink-0">
                <h3 className="text-xs uppercase font-bold text-[#00ff44] tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00ff44]" /> 03 // WORLD SCENARIO GRID REGISTRY
                </h3>
                <span className="text-[8px] text-gray-500 uppercase font-mono tracking-widest">
                  DECRYPTED SIMULATIONS
                </span>
              </div>

              {/* Overriding Custom Sandbox Module Button - Positioned ABOVE for high-priority visibility */}
              <div className="mb-3 flex-shrink-0">
                <div
                  onClick={() => { audio.sfxKeyClick(); onOpenWorldBuilder(); }}
                  className="w-full relative py-3 bg-[#112411]/40 hover:bg-[#1a3a1a]/60 border border-[#00ff44]/70 rounded-md cursor-pointer transition-all duration-300 text-center flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_15px_rgba(0,255,68,0.02)] group hover:shadow-[0_0_20px_rgba(0,255,68,0.15)]"
                >
                  <div className="absolute inset-y-0 left-0 w-2.5 bg-[#00ff44]/30 animate-pulse" />
                  <Compass className="w-5 h-5 text-[#00ff44] animate-pulse" />
                  <div className="text-left select-none">
                    <span className="text-white text-xs font-bold uppercase block tracking-wider">
                      TEMPORAL OVERRIDE: WORLD BUILDER MATRIX
                    </span>
                    <span className="text-[8.5px] text-[#00ff44] font-semibold uppercase tracking-widest block">
                      MANUALLY DEFINE SYSTEM TENSION & SOVEREIGN PRESETS
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenario Cards Grid Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  {Object.values(SCENARIOS).map((sc) => {
                    const isSelected = sc.id === selectedScenario;
                    const threatColor = 
                      sc.threatLevel === 'RED' ? 'text-red-500' :
                      sc.threatLevel === 'ORANGE' ? 'text-[#ffb300]' : 'text-[#00e5ff]';

                    return (
                      <div
                        key={sc.id}
                        onClick={() => { audio.sfxKeyClick(); setSelectedScenario(sc.id); }}
                        className={`group border rounded p-2.5 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-950/15 shadow-[0_0_12px_rgba(255,179,0,0.1)]' 
                            : 'border-[#143217]/50 bg-black/40 hover:border-amber-500/40 hover:bg-amber-500/5'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center border-b border-[#1a5c1a]/20 pb-1 mb-2">
                            <span className={`font-bold text-[11px] uppercase tracking-wide group-hover:text-amber-400 transition-colors ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                              {sc.name}
                            </span>
                            <span className={`text-[8px] font-bold ${threatColor}`}>
                              {sc.threatLevel} AREA
                            </span>
                          </div>
                          
                          <p className="text-[9.5px] text-gray-400 leading-normal lowercase first-letter:uppercase line-clamp-2">
                            {sc.description}
                          </p>
                        </div>

                        <div className="text-[8.5px] text-gray-500 uppercase border-t border-[#1a5c1a]/15 mt-3 pt-1.5 flex justify-between items-center">
                          <span className="text-[#00e5ff] font-bold">LVL // {sc.difficulty}</span>
                          <span className="text-gray-500 font-mono tracking-wider">[ PLAY FILE: {sc.id} ]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* PANEL 3: STRATEGIC CONTROL PROTOCOLS (1 Column) */}
          <div className="border border-[#1a5c1a]/40 bg-[#040905]/95 p-3.5 flex flex-col min-h-0 rounded-md shadow-inner select-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 border-tr border-r border-t border-green-500/40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-bl border-l border-b border-green-500/40 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[#1a5c1a]/40 pb-2 mb-3 flex-shrink-0">
              <h3 className="text-xs uppercase font-bold text-[#00e5ff] tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00e5ff]" /> 04 // STRATEGIC INDEX
              </h3>
              <span className="text-[8px] text-[#ffb300] font-bold">SYSTEM ACTIVE</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4.5 custom-scrollbar text-[11px]">
              
              {/* DURATION CONFIG CHANNELS */}
              <div className="space-y-3 bg-black/30 p-2.5 rounded border border-[#1a5c1a]/25">
                <span className="text-[9.5px] text-[#00e5ff] font-bold uppercase tracking-widest block border-b border-[#1a5c1a]/15 pb-1">
                  I. TEMPORAL DURATION
                </span>
                
                <div className="space-y-1.5 font-bold text-[9.5px] text-gray-400">
                  <div
                    onClick={() => { audio.sfxKeyClick(); setDurationMode('SCENARIO'); }}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                      durationMode === 'SCENARIO' ? 'border-[#00ff44] bg-[#071708] text-white' : 'border-[#1a5c1a]/20 bg-black/20 hover:border-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${durationMode === 'SCENARIO' ? 'bg-[#00ff44] animate-ping' : 'bg-green-900'}`} />
                      <span>SCENARIO OBJECTIVE</span>
                    </div>
                    <span className="text-[7.5px] text-gray-500">STANDARD</span>
                  </div>
                  
                  <div
                    onClick={() => { audio.sfxKeyClick(); setDurationMode('TIMED'); }}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                      durationMode === 'TIMED' ? 'border-[#00ff44] bg-[#071708] text-white' : 'border-[#1a5c1a]/20 bg-black/20 hover:border-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${durationMode === 'TIMED' ? 'bg-[#00ff44] animate-ping' : 'bg-green-900'}`} />
                      <span>TIMED OUT CAMPAIGN</span>
                    </div>
                    {durationMode === 'TIMED' ? (
                      <input
                        type="number"
                        value={timedTicks}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setTimedTicks(Math.max(5, parseInt(e.target.value) || 100))}
                        className="w-14 bg-black border border-green-500 font-bold text-[#00ff44] text-[9px] py-0.5 text-center rounded outline-none"
                      />
                    ) : (
                      <span className="text-[7.5px] text-gray-500">100 TICKS</span>
                    )}
                  </div>

                  <div
                    onClick={() => { audio.sfxKeyClick(); setDurationMode('ENDLESS'); }}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                      durationMode === 'ENDLESS' ? 'border-[#00ff44] bg-[#071708] text-white' : 'border-[#1a5c1a]/20 bg-black/20 hover:border-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${durationMode === 'ENDLESS' ? 'bg-[#00ff44] animate-ping' : 'bg-green-900'}`} />
                      <span>ENDLESS STRATEGY</span>
                    </div>
                    <span className="text-[7.5px] text-gray-500">NO LIMIT</span>
                  </div>
                </div>
              </div>

              {/* CLOCK METRIC CONFIGURATION */}
              <div className="space-y-3 bg-black/30 p-2.5 rounded border border-[#1a5c1a]/25">
                <span className="text-[9.5px] text-[#00e5ff] font-bold uppercase tracking-widest block border-b border-[#1a5c1a]/15 pb-1">
                  II. METRIC SCALE
                </span>

                <div className="space-y-2">
                  <label className="text-[8.5px] text-gray-500 uppercase block font-bold">TICK SCALE FREQUENCY:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['DAY', 'WEEK', 'MONTH'] as const).map(scale => (
                      <button
                        key={scale}
                        onClick={() => { audio.sfxKeyClick(); setTickScale(scale); }}
                        className={`text-[9px] font-bold py-1.5 border rounded cursor-pointer transition-all ${
                          tickScale === scale 
                            ? 'border-[#00ff44] bg-[#071708] text-[#00ff44] font-extrabold shadow-[0_0_6px_rgba(0,255,68,0.1)]' 
                            : 'border-[#1a5c1a]/20 bg-black/30 text-gray-500 hover:text-white hover:border-[#1a5c1a]'
                        }`}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8.5px] text-gray-500 uppercase block font-bold">START DATE:</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#030603] border border-[#1a5c1a] text-[10px] pl-8 pr-2 py-1.5 rounded text-white outline-none focus:border-[#00ff44] font-mono"
                    />
                    <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2 text-green-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8.5px] text-gray-500 uppercase block font-bold">RECONNAISSANCE MODE (SPEED):</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['PAUSED', 'NORMAL', 'FAST', 'ULTRA'] as const).map(speed => (
                      <button
                        key={speed}
                        onClick={() => { audio.sfxKeyClick(); setInitialSpeed(speed); }}
                        className={`text-[8px] font-bold py-1 border rounded cursor-pointer transition-all ${
                          initialSpeed === speed 
                            ? 'border-[#00ff44] bg-[#071708] text-[#00ff44] font-extrabold shadow-[0_0_6px_rgba(0,255,68,0.1)]' 
                            : 'border-[#1a5c1a]/20 bg-black/30 text-gray-500 hover:text-white hover:border-[#1a5c1a]'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MILITARY SYSTEM PROTOCOLS */}
              <div className="space-y-3.5 bg-black/30 p-2.5 rounded border border-[#1a5c1a]/25">
                <span className="text-[9.5px] text-[#00e5ff] font-bold uppercase tracking-widest block border-b border-[#1a5c1a]/15 pb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#00e5ff]" /> III. ADVANCED HARDENERS
                </span>

                {/* Slider: AI Aggression */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-500 font-bold uppercase">AI AGGRESSISTANCE:</span>
                    <span className="text-[#00ff44] font-bold font-mono">{aiAggression} // LEVELD</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={aiAggression}
                      onChange={(e) => { audio.sfxKeyClick(); setAiAggression(parseInt(e.target.value)); }}
                      className="w-full sovereign-slider accent-[#00ff44]"
                      style={{ '--pct': `${(aiAggression - 1) / 4 * 100}%` } as React.CSSProperties}
                    />
                  </div>
                </div>

                {/* Dropdown: Nuclear Esc Doctrine */}
                <div className="space-y-1.5">
                  <label className="text-[8.5px] text-gray-500 uppercase block font-bold">NUCLEAR ESCALATION:</label>
                  <select
                    value={nuclearDoctrine}
                    onChange={(e) => { audio.sfxKeyClick(); setNuclearDoctrine(e.target.value as any); }}
                    className="w-full bg-[#030603] border border-[#1a5c1a] text-[10px] px-2 py-2 rounded text-white outline-none focus:border-[#00ff44] font-mono cursor-pointer"
                  >
                    <option value="NO_FIRST_USE">NO FIRST USE (DEFENSIVE LIMITS)</option>
                    <option value="FLEXIBLE">FLEXIBLE RESPONSE (TENSE MATRIX)</option>
                    <option value="LAUNCH_ON_WARNING">LAUNCH ON HOSTILE WARNING ARC</option>
                  </select>
                </div>

                {/* Buttons: Intelligence coverage */}
                <div className="space-y-1.5">
                  <label className="text-[8.5px] text-gray-500 uppercase block font-bold">STARTING INTEL MATRIX:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['BLIND', 'PARTIAL', 'FULL'] as const).map(intel => (
                      <button
                        key={intel}
                        onClick={() => { audio.sfxKeyClick(); setStartingIntel(intel); }}
                        className={`text-[8.5px] font-bold py-1 border rounded cursor-pointer transition-all ${
                          startingIntel === intel 
                            ? 'border-[#00ff44] bg-[#071708] text-[#00ff44] font-extrabold' 
                            : 'border-[#1a5c1a]/20 bg-black/30 text-gray-500 hover:text-white'
                        }`}
                      >
                        {intel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle: Consequence permanence */}
                <div 
                  onClick={() => { audio.sfxKeyClick(); setConsequencesEnabled(!consequencesEnabled); }}
                  className={`flex justify-between items-center p-2 border rounded cursor-pointer transition-all ${
                    consequencesEnabled ? 'border-[#00ff44]/70 bg-green-950/5' : 'border-[#1a5c1a]/15 bg-black/10'
                  }`}
                >
                  <span className="text-[8.5px] text-gray-500 uppercase font-bold">CONSEQUENCE SCARS:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-bold ${consequencesEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                      {consequencesEnabled ? 'PERMANENT' : 'TRANSIENT'}
                    </span>
                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                      consequencesEnabled ? 'border-green-400 bg-green-950' : 'border-gray-700 bg-black'
                    }`}>
                      {consequencesEnabled && <div className="w-1.5 h-1.5 bg-green-400 rounded-sm" />}
                    </div>
                  </div>
                </div>

                {/* Slider: Economic Volatility */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-500 font-bold uppercase">ECONOMIC VOLATILITY:</span>
                    <span className="text-[#00ff44] font-bold font-mono">{economicVolatility}/5 STRESS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={economicVolatility}
                      onChange={(e) => { audio.sfxKeyClick(); setEconomicVolatility(parseInt(e.target.value)); }}
                      className="w-full sovereign-slider accent-[#00ff44]"
                      style={{ '--pct': `${(economicVolatility - 1) / 4 * 100}%` } as React.CSSProperties}
                    />
                  </div>
                </div>

                {/* Slider: Substate Guerrilla */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-500 font-bold uppercase">SUBSTATE ASSAULTS:</span>
                    <span className="text-[#00ff44] font-bold font-mono">{substateActivity}/5 THREAT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={substateActivity}
                      onChange={(e) => { audio.sfxKeyClick(); setSubstateActivity(parseInt(e.target.value)); }}
                      className="w-full sovereign-slider accent-[#00ff44]"
                      style={{ '--pct': `${(substateActivity - 1) / 4 * 100}%` } as React.CSSProperties}
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM COMMAND INITIATION DECK (Ingress Control Bar) */}
        <div className="border-t border-[#1a5c1a]/50 pt-3 flex flex-col md:flex-row gap-4 items-center justify-between flex-shrink-0 relative z-20">
          
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            {/* Custom blinking terminal indicator */}
            <div className="hidden sm:flex items-center justify-center p-2.5 bg-green-500/5 border border-green-500/20 rounded">
              <Radio className="w-5 h-5 text-[#00ff44] blink-hud" />
            </div>
            <div>
              <span className="text-[#ffb300] text-[10px] font-bold font-mono block uppercase tracking-widest">
                READY DEPLOYMENT COMMAND: COGNATE ID {selectedCountry} // MODE: {activeScenarioObj?.name.toUpperCase()}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wide block mt-1">
                Confirm all temporal limits, intelligence coverages and defensive doctrines before engagement.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* World Builder Override Trigger or simple info metrics */}
            <div className="hidden lg:block text-[9px] text-gray-505 font-mono text-right mr-3 text-gray-500 uppercase">
              <div>THREAT TRANSMISSIVE CODES: LEVEL <span className="text-[#ff2244] font-bold">ALPHA-RED</span></div>
              <div className="mt-0.5">LAUNCH READY COGNATE SATELLITES</div>
            </div>

            <button
              onClick={handleLaunchGame}
              className="w-full md:w-auto px-10 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-black text-xs font-bold font-display uppercase tracking-widest cursor-pointer rounded shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_35px_rgba(34,197,94,0.65)] hover:from-green-400 hover:to-emerald-500 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-black animate-pulse font-bold" />
              INITIATE SECURE COMMAND STRATEGY ENGINES
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
