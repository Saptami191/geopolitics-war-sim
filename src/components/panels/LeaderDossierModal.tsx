import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLeaderStore } from '../../store/leaderStore';
import { useLeaderMemoryStore } from '../../store/leaderMemoryStore';
import { getArchetypeForPersonality } from '../../utils/psychologyGenerator';
import { audio } from '../../utils/audio';

export const LeaderDossierModal: React.FC<{ countryId: string; onClose: () => void }> = ({ countryId, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const leader = useLeaderStore(s => s.leadersByCountryId[countryId]);
  
  // Real psychology integration!
  const emotions = leader?.psychology?.emotions || {
     humiliation: 0, fear: 0, emboldenment: 0, anger: 0, anxiety: 0,
     pride: 0, resentment: 0, vindication: 0, desperation: 0, overconfidence: 0,
     fatigue: 0, relief: 0, paranoiaSpike: 0, moralInjury: 0, shame: 0
  };

  const memoryWeight = useLeaderMemoryStore(s => s.getMemoryWeight(countryId));
  const trustBalance = useLeaderMemoryStore(s => s.getTrustBalance(countryId));
  const rawMemories = useLeaderMemoryStore(s => s.nationMemories[countryId]);
  const memories = rawMemories || [];

  if (!leader) return null;

  const archetype = getArchetypeForPersonality(leader.type, Number(leader.portraitSeed));

  const handleClose = () => {
    audio.sfxRadarPing();
    onClose();
  };

  const handleTab = (t: number) => {
    audio.sfxKeyClick();
    setActiveTab(t);
  };

  const tabs = [
    'IDENTITY & TRAITS',
    'EMOTIONAL STATE',
    'RED LINES & DOCTRINE',
    'DIPLOMATIC MEMORY'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100000] bg-black/90 flex items-center justify-center p-12 font-mono text-zinc-300"
    >
      <div className="w-full max-w-6xl h-full bg-[#0a0a0a] border-2 border-zinc-800 shadow-2xl flex flex-col relative overflow-hidden">
         {/* HEADER */}
         <div className="flex-shrink-0 border-b-2 border-zinc-800 p-6 flex justify-between">
            <div>
              <div className="text-2xl font-black text-white tracking-widest">PSYCHOLOGICAL ASSESSMENT — {leader.name.toUpperCase()}</div>
              <div className="text-xs text-zinc-500 tracking-widest mt-2">NATION: {countryId} | PERSONALITY CLASS: {leader.type.replace('_', ' ')}</div>
              <div className="text-[10px] text-zinc-600 mt-1">FILE CLASSIFICATION: TOP SECRET // HCS // ORCON</div>
            </div>
            <button onClick={handleClose} className="px-6 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors text-xs font-bold tracking-widest h-10">CLOSE FILE</button>
         </div>

         {/* TABS */}
         <div className="flex border-b border-zinc-800 bg-[#050505] text-xs font-bold tracking-widest">
            {tabs.map((t, idx) => (
              <button 
                key={t}
                onClick={() => handleTab(idx)}
                className={`px-8 py-4 border-r border-zinc-800 transition-colors ${activeTab === idx ? 'bg-zinc-900 text-white border-b-2 border-b-white' : 'text-zinc-500 hover:bg-[#111]'}`}
              >
                {t}
              </button>
            ))}
         </div>

         {/* CONTENT (Simplified for now to respect file limits, detailed logic fits inside) */}
         <div className="flex-1 p-8 overflow-y-auto">
            
            {activeTab === 0 && (
              <div className="flex gap-12">
                 <div className="w-1/3 flex flex-col items-center">
                   <img src={leader.portraitDataUrl} className="w-full max-w-[250px] aspect-square object-cover border border-zinc-700 filter grayscale contrast-125" alt={leader.name} />
                   <div className="mt-4 text-center">
                     <div className="text-amber-500 font-bold tracking-widest">ARCHETYPE: {archetype.toUpperCase()}</div>
                     <div className="text-xs text-zinc-500 mt-2">HAWK-DOVE SCORE: {leader.hawkDoveScore}/100</div>
                     <div className="text-xs text-zinc-500">RISK TOLERANCE: {leader.riskTolerance}%</div>
                     <div className="text-xs text-zinc-500 mt-4 border-t border-zinc-800 pt-4 max-w-[300px]">
                       {leader.name} presents as a {archetype}. Assessment confidence: 85%.
                     </div>
                   </div>
                 </div>
                 <div className="w-2/3">
                    <div className="text-xl font-bold border-b border-zinc-800 pb-2 mb-6">PSYCHOLOGICAL TRAIT ASSESSMENT</div>
                    <div className="text-zinc-500 text-sm mb-4">Baseline values abstracted from behavioral history.</div>
                    
                    <div className="flex justify-center items-center h-[300px] relative mt-8">
                       <svg width="300" height="300" className="opacity-80">
                         {/* Background Grids */}
                         {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
                           <polygon key={scale} points={`
                             150,${150 - scale * 120}
                             ${150 + scale * 120 * Math.cos(Math.PI/6)},${150 - scale * 120 * Math.sin(Math.PI/6)}
                             ${150 + scale * 120 * Math.cos(Math.PI/6)},${150 + scale * 120 * Math.sin(Math.PI/6)}
                             150,${150 + scale * 120}
                             ${150 - scale * 120 * Math.cos(Math.PI/6)},${150 + scale * 120 * Math.sin(Math.PI/6)}
                             ${150 - scale * 120 * Math.cos(Math.PI/6)},${150 - scale * 120 * Math.sin(Math.PI/6)}
                           `} fill="none" stroke="#27272a" strokeWidth="1" />
                         ))}
                         
                         {/* Center Crosshairs */}
                         <line x1="150" y1="30" x2="150" y2="270" stroke="#27272a" />
                         <line x1="46" y1="90" x2="254" y2="210" stroke="#27272a" />
                         <line x1="254" y1="90" x2="46" y2="210" stroke="#27272a" />

                         {/* Data Polygon */}
                         {(() => {
                           const traits = [
                             leader.psychology?.personality.traits.hawkishness || 50,
                             leader.psychology?.personality.traits.paranoia || 50,
                             leader.psychology?.personality.traits.rigidity || 50,
                             leader.riskTolerance || 50,
                             leader.psychology?.personality.traits.prestigeHunger || 50,
                             leader.psychology?.personality.traits.crisisComposure || 50
                           ];
                           const angles = [
                             -Math.PI / 2,         
                             -Math.PI / 2 + (Math.PI / 3),  
                             -Math.PI / 2 + (2 * Math.PI / 3), 
                             Math.PI / 2,          
                             Math.PI / 2 + (Math.PI / 3),  
                             Math.PI / 2 + (2 * Math.PI / 3)   
                           ];
                           const points = traits.map((val, i) => {
                             const r = Math.max(0, Math.min(100, val)) / 100 * 120;
                             const x = 150 + r * Math.cos(angles[i]);
                             const y = 150 + r * Math.sin(angles[i]);
                             return `${x},${y}`;
                           }).join(' ');
                           
                           return (
                             <motion.polygon 
                               points={points} 
                               fill="rgba(220, 38, 38, 0.3)" 
                               stroke="#dc2626" 
                               strokeWidth="2" 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               transition={{ duration: 0.8 }}
                             />
                           );
                         })()}
                       </svg>

                       {/* Labels */}
                       <div className="absolute top-0 text-[10px] text-red-500 font-bold tracking-widest">HAWKISHNESS</div>
                       <div className="absolute top-[60px] right-0 text-[10px] text-zinc-400 font-bold tracking-widest">PARANOIA</div>
                       <div className="absolute bottom-[60px] right-0 text-[10px] text-zinc-400 font-bold tracking-widest">RIGIDITY</div>
                       <div className="absolute bottom-0 text-[10px] text-zinc-400 font-bold tracking-widest">RISK TOLERANCE</div>
                       <div className="absolute bottom-[60px] left-0 text-[10px] text-zinc-400 font-bold tracking-widest">PRESTIGE</div>
                       <div className="absolute top-[60px] left-0 text-[10px] text-zinc-400 font-bold tracking-widest">COMPOSURE</div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 1 && (
               <div className="flex flex-col items-center">
                 <div className="text-xl font-bold border-b border-zinc-800 w-full text-center pb-2 mb-8 text-amber-500 tracking-widest">CURRENT EMOTIONAL STATE ASSESSMENT — REAL-TIME</div>
                 <div className="relative w-[300px] h-[300px] border-4 border-zinc-800 rounded-full flex items-center justify-center">
                    {/* Simplified render for MVP */}
                    <div className="absolute text-3xl text-zinc-600">⚠</div>
                    {Object.entries(emotions).map((e, idx) => {
                       if (e[1] > 10) return <div key={e[0]} className="absolute inset-0 border border-red-500/20 rounded-full animate-pulse blur-[1px]" style={{ transform: `scale(${1 + e[1]/100})` }} />;
                       return null;
                    })}
                 </div>
                 <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-4xl text-xs font-bold">
                    {Object.entries(emotions).sort((a,b)=>b[1]-a[1]).map(e => (
                      <div key={e[0]} className="flex justify-between border-b border-zinc-800 pb-1">
                         <span className="uppercase text-zinc-500">{e[0]}</span>
                         <span className={e[1] > 70 ? 'text-red-500 font-black' : 'text-white'}>{Math.floor(e[1])}</span>
                      </div>
                    ))}
                 </div>
               </div>
            )}

            {activeTab === 3 && (
               <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
                 <div className="text-xl font-bold border-b border-zinc-800 pb-2 text-white tracking-widest">INTERACTION MEMORY ARCHIVE</div>
                 
                 <div className="flex gap-8 border border-zinc-800 bg-[#111] p-6 mb-4">
                   <div className="w-1/2 flex flex-col gap-2">
                     <div className="flex justify-between text-xs font-bold text-zinc-500"><span>RESENTMENT WEIGHT</span><span className="text-red-500">{memoryWeight}/100</span></div>
                     <div className="h-2 w-full bg-zinc-900 border border-zinc-800"><div className="h-full bg-red-600" style={{ width: `${memoryWeight}%` }} /></div>
                   </div>
                   <div className="w-1/2 flex flex-col gap-2">
                     <div className="flex justify-between text-xs font-bold text-zinc-500"><span>TRUST BALANCE</span><span className="text-green-500">{trustBalance}/100</span></div>
                     <div className="h-2 w-full bg-zinc-900 border border-zinc-800"><div className="h-full bg-green-500" style={{ width: `${trustBalance}%` }} /></div>
                   </div>
                 </div>

                 <div className="flex flex-col gap-2">
                   {memories.length === 0 && <div className="text-center text-zinc-600 italic py-12">No significant interaction history recorded.</div>}
                   {memories.map(m => (
                      <div key={m.id} className={`p-4 border border-zinc-800 ${m.resentmentDelta > 0 ? 'bg-red-950/10 border-l-4 border-l-red-500' : 'bg-green-950/10 border-l-4 border-l-green-500'}`}>
                         <div className="text-xs text-zinc-500 tracking-widest mb-1">TICK {m.tick} — {m.type}</div>
                         <div className="text-sm text-zinc-300">{m.description}</div>
                         {m.isForgivenAt && <div className="text-[10px] text-zinc-600 mt-2">FORGIVEN AT TICK {m.isForgivenAt}</div>}
                      </div>
                   ))}
                 </div>
               </div>
            )}

         </div>
      </div>
    </motion.div>
  );
};
