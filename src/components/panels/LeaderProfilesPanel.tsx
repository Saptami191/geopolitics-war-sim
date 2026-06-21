import React, { useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { useLeaderStore } from '../../store/leaderStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { audio } from '../../utils/audio';
import { motion } from 'motion/react';
import { 
  User, 
  ShieldAlert, 
  Flame, 
  TrendingUp, 
  Eye, 
  AlertOctagon, 
  Fingerprint, 
  Clock, 
  Lock, 
  Cpu, 
  Award, 
  Radio, 
  HeartCrack,
  Activity,
  UserCheck
} from 'lucide-react';
import AnimatedValue from '../shared/AnimatedValue';

export default function LeaderProfilesPanel() {
  const leaderStore = useLeaderStore();
  const worldStore = useWorldStore();
  const playerStore = usePlayerStore();
  const uiStore = useUIStore();
  
  const currentTick = worldStore.currentTick;
  const playerCountryId = playerStore.countryId;
  const countries = worldStore.countries;
  
  // Track currently selected dossier target country
  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    playerStore.selectedTargetCountryId || 'CN'
  );

  const targetLeader = leaderStore.getLeader(selectedCountryId);
  const playerCountry = countries[playerCountryId];

  const handleSelectCountry = (id: string) => {
    audio.sfxKeyClick();
    setSelectedCountryId(id);
  };

  // Perform active HUMINT decryption sweep using player slush fund
  const handleDecryptRedLine = (rlId: string) => {
    audio.sfxKeyClick();

    if (!playerCountry) return;
    const intel = playerCountry.intelligence;
    const decryptionCostB = 1.0; // Costs $1.0B from slush budget

    if (intel.blackBudgetB < decryptionCostB) {
      uiStore.pushAlert({
        title: 'CRYPTO DESK RECORD DENIED',
        message: `Intelligence Slush allocation insufficent. Direct HUMINT agent decryption requires $1.0B covert reserves.`,
        type: 'DANGER'
      });
      return;
    }

    // Deduct budget and boost discovery
    useWorldStore.getState().updateCountry(playerCountryId, (draft) => {
      draft.intelligence.blackBudgetB -= decryptionCostB;
    });

    // Update target leader's red line discovery progress inside the store
    if (targetLeader && targetLeader.psychology) {
      const updatedPsych = { ...targetLeader.psychology };
      const updatedLines = (updatedPsych.redLines || []).map(rl => {
        if (rl.id === rlId) {
          const newProgress = Math.min(100, rl.discoveryProgress + 35); // Boost progress by +35%
          const updatedRl = { ...rl, discoveryProgress: newProgress };
          if (newProgress === 100) {
            updatedRl.sourceOfDiscovery = 'SLUSH_CRACK_HUMINT';
          }
          return updatedRl;
        }
        return rl;
      });
      
      const newLeader = {
        ...targetLeader,
        psychology: {
          ...updatedPsych,
          redLines: updatedLines
        }
      };
      
      leaderStore.setLeader(selectedCountryId, newLeader);

      // Play code breaking UI alert
      uiStore.pushAlert({
        title: 'HUMINT DESK: MATRIX UNCOVERED',
        message: `Decrypted limits inside ${selectedCountryId} security apparatus. Core red line telemetry updated by +35%.`,
        type: 'INFO'
      });
      
      worldStore.addGlobalEvent(`Signals intercept: Slush-funded crypto analysis penetrated ${selectedCountryId} strategic limit boundaries.`, 'INFO');
    }
  };

  if (!targetLeader || !targetLeader.psychology) {
    return (
      <div className="border border-red-950 bg-black/40 p-4 rounded text-center font-mono text-red-500">
        ERROR: No leadership profiles cached for foreign sector {selectedCountryId}. Advance time clock to initialize.
      </div>
    );
  }

  const psych = targetLeader.psychology;
  const traits = psych.personality.traits;
  const emotions = psych.emotions;
  const stress = psych.stress;

  const currentStressLabel = 
    stress.currentStress > 80 ? 'CRITICAL (COUP RISK ACTIVE)' :
    stress.currentStress > 50 ? 'ELEVATED STRESS' :
    'STABLE (NOMINAL)';

  const stressColorClass = 
    stress.currentStress > 80 ? 'text-red-500 font-extrabold animate-pulse' :
    stress.currentStress > 50 ? 'text-yellow-500 font-bold' :
    'text-[#00ff44]';

  return (
    <div className="flex flex-col gap-4 font-mono text-xs text-gray-300">
      
      {/* 1. Country selection quick tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#132c13] pb-3">
        {Object.keys(countries).map((id) => {
          const ldr = leaderStore.getLeader(id);
          const active = selectedCountryId === id;
          return (
            <button
              key={id}
              onClick={() => handleSelectCountry(id)}
              className={`px-2.5 py-1 text-[10px] uppercase font-bold border rounded transition-all cursor-pointer ${
                active 
                  ? 'bg-[#153e15] text-[#00ff44] border-[#00ff44] shadow-[0_0_6px_rgba(0,255,68,0.2)]'
                  : 'bg-[#030503] text-gray-500 border-[#1a3a1a] hover:text-white hover:bg-white/5'
              }`}
            >
              {id} {ldr ? `(${ldr.type.substring(0, 4)})` : ''}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* 2. LHS Column: Leader Overview Portrait & Persona Traits (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Portrait Summary Box */}
          <div className="border border-[#1a3a1a] bg-[#030503] p-4 rounded shadow-md relative overflow-hidden flex flex-col sm:flex-row gap-4">
            
            <div className="absolute top-0 right-0 p-1.5 bg-[#1e4620]/30 text-emerald-400 border-l border-b border-[#1a3a1a] text-[8px] font-bold tracking-wider uppercase">
              CLASSIFIED DOSSIER
            </div>

            {/* Avatar / Portrait Canvas */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 border-2 border-dashed border-[#053d0e] bg-black rounded relative flex items-center justify-center overflow-hidden">
              {targetLeader.portraitDataUrl ? (
                <img 
                  src={targetLeader.portraitDataUrl} 
                  alt={targetLeader.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <User className="w-12 h-12 text-[#1a4a1a]" />
              )}
              {/* Scanlines layer */}
              <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-[0.08]" />
              <div className="absolute bottom-1 left-1.5 bg-black/80 px-1 py-0.2 border border-[#1a3b1a] text-[7.5px] text-[#00ff44] uppercase font-mono tracking-widest font-bold">
                {selectedCountryId} INTEL
              </div>
            </div>

            {/* Profile Fields */}
            <div className="flex flex-col justify-center gap-1.5 min-w-0">
              <div className="text-sm font-black text-white uppercase truncate flex items-center gap-1">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                {targetLeader.name}
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                Archetype: <span className="text-[#ffb300] font-bold">{psych.personality.archetype}</span>
              </div>
              <div className="text-[10px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                  TENURE: <span className="text-white font-bold">{currentTick - targetLeader.installedAtTick} TICKS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-gray-600" />
                  TRANSITION VULNERABILITY: <span className="text-white font-bold">{psych.succession.coupRiskScore}% COUP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Psychiatric Traits Matrix */}
          <div className="border border-[#1a3a1a] bg-[#030503] p-4 rounded shadow-md flex flex-col gap-3">
            <h4 className="text-[10px] uppercase font-bold text-[#00ff44] border-b border-[#1a3a1a] pb-1.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#00ff44]" />
              PERSISTENT PSYCHIATRIC VECTORS
            </h4>

            <div className="space-y-3">
              {[
                { label: 'Hawkishness (Military Drive)', val: traits.hawkishness, color: 'bg-red-600' },
                { label: 'Prestige Hunger (National Vanity)', val: traits.prestigeHunger, color: 'bg-orange-600' },
                { label: 'Systemic Paranoia (Skepticism)', val: traits.paranoia, color: 'bg-yellow-600' },
                { label: 'Institutional Loyalty (Bureaucracy)', val: traits.institutionalLoyalty, color: 'bg-indigo-600' },
                { label: 'Bureaucratic Corruption Limit', val: traits.corruption, color: 'bg-amber-600' },
                { label: 'Strategic Risk Tolerance', val: traits.riskTolerance, color: 'bg-red-500' },
                { label: 'Diplomatic Adaptability Range', val: traits.adaptability, color: 'bg-teal-600' }
              ].map((tr) => (
                <div key={tr.label} className="text-[10px]">
                  <div className="flex justify-between items-center text-gray-400 mb-1 font-bold">
                    <span>{tr.label}</span>
                    <span className="text-white">{tr.val}%</span>
                  </div>
                  <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-[#0d220d]">
                    <div className={`${tr.color} h-full`} style={{ width: `${tr.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-[#0c140c]/40 border border-[#163016]/40 p-2.5 rounded text-[9px] text-gray-500 leading-normal">
              <span className="text-[#00ff44] font-bold block mb-0.5 uppercase">ADMINISTRATIVE CLASSIFIED ANALYSIS:</span>
              Persona is historically mapped as [ {targetLeader.type} ], showing complex policy variances skewed towards {traits.hawkishness > 60 ? 'confrontational escalation' : 'measured diplomatic dialogues'}.
            </div>
          </div>
        </div>

        {/* 3. RHS Column: Emotional Modifiers, Red-Lines and Memories (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          
          {/* Stress & Transient Emotions Panel */}
          <div className="border border-[#1a3a1a] bg-[#030503] p-4 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Stress Block */}
            <div className="flex flex-col justify-between gap-3 border-r border-[#1a3a1a]/40 pr-0 md:pr-4">
              <div>
                <h4 className="text-[10px] uppercase font-bold text-[#ffb300] border-b border-[#1a3a1a] pb-1.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#ffb300]" />
                  COGNITIVE STRESS TRACKER
                </h4>
                
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black">STRESS LEVEL INDEX</div>
                  <div className="text-xl font-black text-[#ffb300]">
                    <AnimatedValue target={stress.currentStress} formatter={(v) => v.toFixed(0)} />%
                  </div>
                  <div className="text-[10px] tracking-wide text-gray-400 uppercase">
                    POSTURE: <span className={stressColorClass}>{currentStressLabel}</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-black/80 h-3 rounded overflow-hidden border border-[#1e301e] p-0.5">
                <div 
                  className={`h-full rounded-sm transition-all duration-500 ${
                    stress.currentStress > 80 ? 'bg-red-500 animate-pulse' :
                    stress.currentStress > 50 ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${stress.currentStress}%` }}
                />
              </div>
            </div>

            {/* Transient Emotional Modifiers Offset */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] uppercase font-bold text-[#00ff44] border-b border-[#1a3a1a] pb-1.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#00ff44]" />
                TRANSIENT EMOTIONAL INDEX
              </h4>

              <div className="grid grid-cols-2 gap-3 text-[10px] uppercase font-mono mt-1">
                {[
                  { name: 'humiliation', val: emotions.humiliation, icon: <HeartCrack className="w-3.5 h-3.5 text-red-500" /> },
                  { name: 'fear', val: emotions.fear, icon: <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" /> },
                  { name: 'emboldened', val: emotions.emboldenment, icon: <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> },
                  { name: 'anger', val: emotions.anger, icon: <Flame className="w-3.5 h-3.5 text-[#ff2e00]" /> },
                  { name: 'anxiety', val: emotions.anxiety, icon: <Lock className="w-3.5 h-3.5 text-amber-500" /> },
                  { name: 'pride', val: emotions.pride, icon: <Award className="w-3.5 h-3.5 text-indigo-400" /> }
                ].map((emo) => {
                  const intenseClass = emo.val > 40 ? 'text-white font-extrabold shadow-sm bg-[#162716]/30 px-1 border border-[#1d411d]/40 rounded' : 'text-gray-400';
                  return (
                    <div key={emo.name} className={`flex items-center justify-between py-1 border-b border-[#112411]/40 ${intenseClass}`}>
                      <span className="flex items-center gap-1 text-[9px]">
                        {emo.icon}
                        {emo.name}
                      </span>
                      <span>{emo.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deep Strategic Limits: Decrypting Red Lines (Interactive!) */}
          <div className="border border-[#1a3a1a] bg-[#030503] p-4 rounded shadow-md flex flex-col gap-3.5 relative">
            
            <div className="absolute top-4 right-4 text-[8px] text-gray-500 font-bold tracking-widest flex items-center gap-1.5 bg-[#051a05] border border-[#133213] px-1.5 py-0.5 rounded">
              <Radio className="w-3 h-3 text-[#00ff44] animate-pulse" />
              INTELLIGENCE ACCURACY SECTOR
            </div>

            <h4 className="text-[10px] uppercase font-bold text-[#ffb300] border-b border-[#1a3a1a] pb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#ffb300]" />
              DECRYPTED LIMITS & THRESHOLD BOUNDARIES
            </h4>

            <div className="space-y-3.5">
              {(psych.redLines || []).map((rl) => {
                const isRevealed = rl.discoveryProgress >= 100;
                
                return (
                  <div key={rl.id} className="border border-[#0d220d] bg-[#030403] p-3 rounded flex flex-col gap-2 hover:bg-[#071407]/40 transition-all">
                    
                    {/* Header bar */}
                    <div className="flex justify-between items-center border-b border-[#112d11] pb-1">
                      <span className="font-bold text-[#00ff44] uppercase tracking-wide text-[9.5px]">
                        {rl.type.replace('_', ' ')}
                      </span>
                      <span className={`text-[8.5px] font-bold px-1.5 rounded ${isRevealed ? 'bg-[#002f1a] border border-[#009b3e] text-[#00ff44]' : 'bg-[#211600] border border-[#aa7200] text-yellow-500'}`}>
                        {isRevealed ? `[REVEALED IN FULL]` : `INFERRED LOGIC [${rl.discoveryProgress}%]`}
                      </span>
                    </div>

                    {/* Encrypted blure/mask */}
                    <div className="text-[10.5px] leading-relaxed text-gray-300 normal-case font-sans">
                      {isRevealed ? (
                        <p className="normal-case">{rl.description}</p>
                      ) : (
                        <p className="blur-[2.5px] select-none text-gray-600 leading-normal pointer-events-none">
                          {rl.description.replace(/[a-zA-Z]/g, 'X')}
                        </p>
                      )}
                    </div>

                    {/* Interactive analysis sweep buttons */}
                    <div className="flex justify-between items-center mt-1 text-[8.5px] font-mono uppercase tracking-wider text-gray-400">
                      <div>
                        Action Trigger: <span className="text-red-500 font-bold">{isRevealed ? rl.actionOnCross : 'REDACTED'}</span>
                      </div>
                      
                      {!isRevealed && (
                        <button
                          onClick={() => handleDecryptRedLine(rl.id)}
                          className="px-2.5 py-1 bg-[#ffb300]/15 border border-[#ffb300] text-[#ffb300] hover:bg-[#ffb300]/30 rounded font-bold transition-all uppercase cursor-pointer"
                        >
                          💸 Decrypt limits with SIGINT (cost: $1.0B)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leader memory timeline */}
          <div className="border border-[#1a3a1a] bg-[#030503] p-4 rounded shadow-md flex flex-col gap-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-[#1a3a1a] pb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-500" />
              TIMELINE MEMORABILIA & PERSONAL REACTION HISTORY
            </h4>

            <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1 scrollbar-thin">
              {psych.memories.length === 0 ? (
                <p className="text-gray-500 italic text-[10px] leading-relaxed">No strategic personal grievances logged in memory database charts.</p>
              ) : (
                (psych.memories || []).map((mem) => (
                  <div key={mem.id} className="border border-[#112411]/30 bg-black/40 p-2.5 rounded text-[9.5px] hover:bg-[#071307]/35 flex justify-between items-center gap-4">
                    <div className="space-y-0.5 normal-case font-sans leading-relaxed text-gray-450">
                      <div className="font-mono text-[9px] uppercase font-bold text-violet-400">
                        TYPE: {mem.type} against <span className="text-white">{mem.targetCountryId}</span>
                      </div>
                      <p>{mem.description}</p>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#00ff44] font-mono bg-[#112b11] py-0.5 px-2 rounded">
                      WEIGHT {mem.weight}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
