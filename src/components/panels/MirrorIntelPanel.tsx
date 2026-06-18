import React, { useEffect, useState } from 'react';
import { useMirrorStore } from '../../store/mirrorStore';
import { motion } from 'motion/react';

export const MirrorIntelPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const mirrorStore = useMirrorStore();
  const [radarPath, setRadarPath] = useState('');

  const [localStore, setLocalStore] = useState(mirrorStore);
  
  // Real-time synchronization
  useEffect(() => {
    const unsub = useMirrorStore.subscribe((state) => {
      setLocalStore(state);
    });
    return unsub; 
  }, []);

  const profile = localStore.profile;
  const confidence = (localStore.confidence as any)?.generalConfidence || 0;
  const warningLevel = (localStore as any).warningLevel || 'LOW';

  // Polygon calculation
  useEffect(() => {
    if (!profile) return;
    const cx = 100;
    const cy = 100;
    const r = 80;
    // Sanctions, Covert, Military, Diplomacy, Cyber, Economic
    const biases = [
      profile.sanctionsBias || 0,
      profile.covertBias || 0,
      profile.militaryBias || 0,
      profile.diplomacyBias || 0,
      profile.cyberBias || 0,
      profile.economicBias || 0,
    ];

    const angles = [
      -Math.PI / 2,         // Top (Sanctions)
      -Math.PI / 2 + (Math.PI / 3),  // Covert
      -Math.PI / 2 + (2 * Math.PI / 3), // Military
      Math.PI / 2,          // Diplomacy
      Math.PI / 2 + (Math.PI / 3),  // Cyber
      Math.PI / 2 + (2 * Math.PI / 3)   // Economic
    ];

    const points = biases.map((bias, i) => {
      const bRatio = Math.max(0, Math.min(100, bias)) / 100;
      const x = cx + bRatio * r * Math.cos(angles[i]);
      const y = cy + bRatio * r * Math.sin(angles[i]);
      return `${x},${y}`;
    }).join(' ');

    setRadarPath(points);
  }, [profile]);

  if (!isOpen) return null;

  const getWarningColor = () => {
    if (warningLevel === 'LOW') return 'border-green-500 text-green-500';
    if (warningLevel === 'MEDIUM') return 'border-amber-500 text-amber-500';
    if (warningLevel === 'HIGH') return 'border-orange-500 text-orange-500';
    return 'border-red-500 text-red-500 animate-pulse';
  };

  const getWarningBg = () => {
    if (warningLevel === 'LOW') return 'bg-green-900/20';
    if (warningLevel === 'MEDIUM') return 'bg-amber-900/20';
    if (warningLevel === 'HIGH') return 'bg-orange-900/20';
    return 'bg-red-900/20';
  };

  const barColor = confidence > 90 ? 'bg-red-500' : confidence > 70 ? 'bg-orange-500' : confidence > 45 ? 'bg-amber-500' : 'bg-green-500';

  const getTypewriterText = (fingerprint: string) => {
    switch(fingerprint) {
      case 'SANCTIONS_GRINDER': return "Subject demonstrates systematic preference for economic coercion instruments. Relies on financial attrition as primary deterrent mechanism. Predictable escalation pathway: sanction -> isolate -> wait. VULNERABILITY: Over-reliance creates exploitable sanction-fatigue windows in target economies.";
      case 'COVERT_OPERATOR': return "Subject exhibits consistent preference for deniable covert action over direct confrontation. SIGINT patterns suggest heavy investment in human intelligence assets. VULNERABILITY: Predictable infiltration signatures create counter-intelligence honeypot opportunities.";
      case 'MILITARY_BLITZER': return "Subject deploys military force as first-order deterrent. Forward deployment patterns suggest high aggression threshold with limited diplomatic patience. VULNERABILITY: Predictable mobilization signatures enable A2/AD preparation windows.";
      case 'ALLIANCE_BROKER': return "Subject demonstrates sophisticated multilateral coalition building. Strength through proxy relationships. VULNERABILITY: Alliance dependency creates pressure points — fracturing one alliance shifts entire strategic calculus.";
      case 'INFORMATION_WAR_SPECIALIST': return "Subject consistently leverages information operations, cyber tools, and perception management. VULNERABILITY: Predictable cyber intrusion signatures compromise operation security.";
      case 'ECONOMIC_STRANGLER': return "Subject demonstrates sophisticated economic warfare capability. Targets production capacity and supply chain integrity. VULNERABILITY: Escalatory economic responses risk domestic stability.";
      case 'BALANCED_GRAND_STRATEGIST': return "Subject demonstrates no dominant instrumental bias. Adaptive multi-domain engagement. ASSESSMENT: Unpredictable. RECOMMENDATION: Increase collection effort.";
      default: return "Monitoring phase incomplete. Baseline assessment ongoing.";
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[500px] bg-[#020202] border-l border-zinc-800 shadow-2xl flex flex-col z-[100] font-mono text-zinc-300 overflow-hidden">
      
      {/* Header */}
      <div className="flex-shrink-0 bg-black border-b-2 border-zinc-900 p-4 relative">
         <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
         <div className="text-xs tracking-widest text-zinc-500">CLASSIFIED BEHAVIORAL ASSESSMENT</div>
         <div className="text-[10px] tracking-widest text-zinc-600 mb-4">SOURCE: UNDISCLOSED FOREIGN INTELLIGENCE SERVICE</div>
         
         <div className={`border p-2 text-center font-bold tracking-widest text-sm ${getWarningColor()} ${getWarningBg()}`}>
           {warningLevel === 'LOW' && 'MONITORING ONLY'}
           {warningLevel === 'MEDIUM' && 'PATTERN IDENTIFIED'}
           {warningLevel === 'HIGH' && 'BEHAVIORAL MODEL STABLE'}
           {warningLevel === 'CRITICAL' && 'COUNTERMEASURES ACTIVE'}
         </div>

         <div className="mt-4">
           <div className="flex justify-between text-[10px] font-bold mb-1">
             <span>CONFIDENCE RATING</span>
             <span>{confidence}%</span>
           </div>
           <div className="w-full bg-zinc-900 h-2 overflow-hidden border border-zinc-800">
             <motion.div className={`h-full ${barColor}`} initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 1 }} />
           </div>
           <div className="text-[9px] mt-1 text-zinc-500 text-center">
             {confidence <= 20 && "INSUFFICIENT DATA — MONITORING"}
             {confidence > 20 && confidence <= 45 && "PRELIMINARY ASSESSMENT — LOW CONFIDENCE"}
             {confidence > 45 && confidence <= 70 && "PATTERN EMERGING — MEDIUM CONFIDENCE"}
             {confidence > 70 && confidence <= 90 && "BEHAVIORAL MODEL LOCKED — HIGH CONFIDENCE"}
             {confidence > 90 && "SUBJECT FULLY PROFILED — EXPLOITING NOW"}
           </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 scrollbar-thin">
         
         {/* STRATEGIC FINGERPRINT */}
         <div className="flex flex-col gap-2">
           <div className="text-white font-bold tracking-widest text-sm border-b border-zinc-800 pb-1">ASSESSED STRATEGIC DOCTRINE</div>
           <div className="text-amber-500 font-bold bg-amber-900/10 p-2 border-l-2 border-amber-500">{localStore.fingerprint?.replace('_', ' ') || 'UNKNOWN'}</div>
           <div className="text-xs leading-relaxed text-zinc-400 min-h-[80px]">
             {getTypewriterText(localStore.fingerprint || '')}
           </div>
           <div className="text-[10px] text-zinc-600 font-bold tracking-widest">
             TOTAL DECISIONS ANALYZED: {profile?.totalActionsLogged || 0}
           </div>
         </div>

         {/* RADAR CHART */}
         <div className="flex flex-col gap-2">
           <div className="text-white font-bold tracking-widest text-sm border-b border-zinc-800 pb-1">INSTRUMENTAL BIAS DISTRIBUTION</div>
           <div className="flex justify-center items-center h-[200px] relative">
             <svg width="200" height="200" className="opacity-80">
               {/* Background Grids */}
               {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
                 <polygon key={scale} points={`
                   100,${100 - scale * 80} 
                   ${100 + scale * 80 * Math.cos(Math.PI/6)},${100 - scale * 80 * Math.sin(Math.PI/6)} 
                   ${100 + scale * 80 * Math.cos(Math.PI/6)},${100 + scale * 80 * Math.sin(Math.PI/6)} 
                   100,${100 + scale * 80} 
                   ${100 - scale * 80 * Math.cos(Math.PI/6)},${100 + scale * 80 * Math.sin(Math.PI/6)} 
                   ${100 - scale * 80 * Math.cos(Math.PI/6)},${100 - scale * 80 * Math.sin(Math.PI/6)} 
                 `} fill="none" stroke="#003300" strokeWidth="1" />
               ))}
               
               {/* Current Data Polygon */}
               {radarPath && (
                 <motion.polygon 
                   points={radarPath} 
                   fill="rgba(0, 255, 65, 0.3)" 
                   stroke="#00FF41" 
                   strokeWidth="2" 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1, points: radarPath }}
                   transition={{ duration: 0.8 }}
                 />
               )}
               {/* Center Crosshairs */}
               <line x1="100" y1="20" x2="100" y2="180" stroke="#003300" />
               <line x1="30" y1="60" x2="170" y2="140" stroke="#003300" />
               <line x1="170" y1="60" x2="30" y2="140" stroke="#003300" />
             </svg>

             {/* Labels */}
             <div className="absolute top-0 text-[10px] text-[#00FF41]">SANCTIONS</div>
             <div className="absolute top-[40px] right-2 text-[10px] text-zinc-500">COVERT</div>
             <div className="absolute bottom-[40px] right-2 text-[10px] text-zinc-500">MILITARY</div>
             <div className="absolute bottom-0 text-[10px] text-zinc-500">DIPLOMACY</div>
             <div className="absolute bottom-[40px] left-2 text-[10px] text-zinc-500">CYBER</div>
             <div className="absolute top-[40px] left-2 text-[10px] text-zinc-500">ECONOMIC</div>
           </div>
         </div>

         {/* COUNTERMEASURES */}
         <div className="flex flex-col gap-2 relative">
           <div className="text-white font-bold tracking-widest text-sm border-b border-zinc-800 pb-1">ACTIVE COUNTERMEASURE ASSESSMENT</div>
           {localStore.activeCounterCommitment ? (
             <div className="border border-red-900 bg-red-950/20 p-4 text-xs flex flex-col gap-3 relative overflow-hidden">
               <motion.div className="absolute inset-x-0 h-1 bg-red-500/50" animate={{ top: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
               <div className="text-red-500 font-bold tracking-widest flex items-center justify-between">
                 <span>⚠ COUNTER-STRATEGY DETECTED</span>
                 <span className="text-[10px]">OPERATIONAL</span>
               </div>
               <div><span className="text-zinc-500">NAME:</span> {localStore.activeCounterCommitment.name}</div>
               <div><span className="text-zinc-500">THREAT COUNTERED:</span> {localStore.activeCounterCommitment.threatCounteredCategory}</div>
               <div><span className="text-zinc-500">TICKS ACTIVE:</span> {localStore.activeCounterCommitment.ticksActive}</div>
               
               <div className="mt-2 text-zinc-400">TACTICS DEPLOYED:</div>
               <div className="flex flex-col gap-1 text-red-300">
                 {['Tactic A', 'Tactic B', 'Tactic C'].map((t, i) => (
                   <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}>— {t}</motion.div>
                 ))}
               </div>
             </div>
           ) : (
             <div className="text-xs text-zinc-500 p-4 border border-zinc-900 bg-black text-center">
               NO ACTIVE COUNTERMEASURES DETECTED<br/>
               <span className="text-[10px]">MONITORING PHASE — BEHAVIORAL DATA COLLECTION ONGOING</span>
             </div>
           )}
         </div>

      </div>
    </div>
  );
};
