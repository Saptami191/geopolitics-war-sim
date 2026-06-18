import React from 'react';
import { useNationIdentityStore } from '../../store/nationIdentityStore';
import { useWorldStore } from '../../store/worldStore';
import { motion } from 'motion/react';

export const NationSovereignPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const countries = useWorldStore(s => s.countries);
  const nations = Object.values(countries);
  const identities = useNationIdentityStore(s => s.nationIdentities);
  const [selectedNation, setSelectedNation] = React.useState<string>('CN');

  if (!isOpen) return null;

  const identity = identities[selectedNation];
  
  if (!identity) {
    return <div className="absolute inset-y-0 right-0 w-[600px] bg-[#0A0A0A] border-l border-zinc-800 z-[90] p-4 text-white">Loading data...</div>;
  }

  // Polygon calculation
  const cx = 100, cy = 100, r = 80;
  const vectors = [
    identity.ideologyIndex,
    identity.economicModel,
    identity.securityDoctrine,
    identity.hegemonicAmbition,
    identity.leaderVolatility
  ];
  const angles = [-Math.PI/2, -Math.PI/2 + (2*Math.PI/5), -Math.PI/2 + (4*Math.PI/5), -Math.PI/2 + (6*Math.PI/5), -Math.PI/2 + (8*Math.PI/5)];
  
  const points = vectors.map((v, i) => {
    const vRatio = Math.max(0, Math.min(100, v)) / 100;
    const x = cx + vRatio * r * Math.cos(angles[i]);
    const y = cy + vRatio * r * Math.sin(angles[i]);
    return `${x},${y}`;
  }).join(' ');

  const getPostureColor = (posture: string) => {
    switch(posture) {
      case 'COOPERATIVE': return 'text-green-500';
      case 'CAUTIOUS': return 'text-zinc-400';
      case 'COMPETITIVE': return 'text-amber-400';
      case 'HOSTILE': return 'text-orange-500';
      case 'AGGRESSIVE': return 'text-red-500 font-bold';
      case 'DESPERATE': return 'text-red-700 font-black animate-pulse';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="absolute inset-y-0 right-0 w-[600px] bg-[#0A0A0A] border-l border-zinc-800 shadow-2xl flex flex-col z-[90] font-mono text-zinc-300">
      {/* NATION SELECTOR ROW */}
      <div className="flex-shrink-0 p-4 border-b border-zinc-800 flex flex-wrap gap-2 bg-[#050505]">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white pb-2 font-black text-xl">✕</button>
        {nations.map(n => {
           const iden = identities[n.id];
           const postColor = iden ? getPostureColor(iden.currentPosture) : 'text-zinc-500';
           return (
             <button 
                key={n.id} 
                onClick={() => setSelectedNation(n.id)}
                className={`flex items-center gap-1 px-2 py-1 border text-xs tracking-widest ${selectedNation === n.id ? 'border-white text-white bg-zinc-900' : 'border-zinc-800 text-zinc-500 hover:border-zinc-500'}`}
             >
                <span>{n.id}</span>
                <span className={`text-[8px] ${postColor}`}>●</span>
             </button>
           )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 scrollbar-thin">
        
        {/* HEADER SECTION */}
        <div className="flex items-center gap-6 border-b border-zinc-800 pb-6">
          <div className="text-6xl">{nations.find(n => n.id === selectedNation)?.flagEmoji}</div>
          <div className="flex flex-col gap-1">
            <div className="text-3xl font-black text-white">{nations.find(n => n.id === selectedNation)?.name.toUpperCase()}</div>
            <div className="text-xs font-bold tracking-widest text-zinc-500">SOVEREIGN IDENTITY RECORD</div>
            <div className={`text-xl font-bold tracking-widest mt-2 ${getPostureColor(identity.currentPosture)}`}>
              POSTURE: {identity.currentPosture}
            </div>
          </div>
        </div>

        {/* IDENTITY RADAR & MOOD */}
        <div className="flex gap-8">
           <div className="w-1/2 flex flex-col items-center">
             <div className="text-xs font-bold border-b border-zinc-800 w-full text-center pb-2 mb-2">IDENTITY VECTORS</div>
             <svg width="200" height="200" className="opacity-90">
               {[0.2, 0.4, 0.6, 0.8, 1].map(scale => {
                 const pts = angles.map(a => `${100 + scale*80*Math.cos(a)},${100 + scale*80*Math.sin(a)}`).join(' ');
                 return <polygon key={scale} points={pts} fill="none" stroke="#333" strokeWidth="1" />
               })}
               <motion.polygon 
                 points={points} 
                 fill="rgba(59, 130, 246, 0.2)" 
                 stroke="#3b82f6" 
                 strokeWidth="2" 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1, points }}
                 transition={{ duration: 0.5 }}
               />
               <text x="100" y="15" fill="#666" fontSize="8" textAnchor="middle">IDEOLOGY</text>
               <text x="180" y="70" fill="#666" fontSize="8" textAnchor="start">ECONOMY</text>
               <text x="150" y="190" fill="#666" fontSize="8" textAnchor="middle">SECURITY</text>
               <text x="50" y="190" fill="#666" fontSize="8" textAnchor="middle">AMBITION</text>
               <text x="20" y="70" fill="#666" fontSize="8" textAnchor="end">VOLATILITY</text>
             </svg>
           </div>
           
           <div className="w-1/2 flex flex-col gap-4">
             <div className="text-xs font-bold border-b border-zinc-800 pb-2">NATIONAL MOOD</div>
             <div className="flex flex-col gap-3 text-[10px] tracking-widest">
               <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                     <span>SOLIDARITY</span><span>{identity.nationalMood.solidarity}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 relative"><motion.div className="absolute inset-y-0 left-0 bg-blue-500" animate={{ width: `${identity.nationalMood.solidarity}%` }} /></div>
               </div>
               <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                     <span>BELLIGERENCE</span><span className={identity.nationalMood.belligerence > 70 ? 'text-red-500' : ''}>{identity.nationalMood.belligerence}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 relative"><motion.div className="absolute inset-y-0 left-0 bg-red-500" animate={{ width: `${identity.nationalMood.belligerence}%` }} /></div>
               </div>
               <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                     <span>FEAR FACTOR</span><span>{identity.nationalMood.fearFactor}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 relative"><motion.div className="absolute inset-y-0 left-0 bg-amber-500" animate={{ width: `${identity.nationalMood.fearFactor}%` }} /></div>
               </div>
               <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                     <span>GRIEVANCE</span><span className={identity.nationalMood.grievanceAccumulation > 80 ? 'text-orange-500' : ''}>{identity.nationalMood.grievanceAccumulation}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 relative"><motion.div className="absolute inset-y-0 left-0 bg-orange-600" animate={{ width: `${identity.nationalMood.grievanceAccumulation}%` }} /></div>
               </div>
             </div>
           </div>
        </div>

        {/* STRATEGIC AGENDA */}
        <div className="flex flex-col gap-4">
          <div className="text-white font-bold tracking-widest text-sm border-b border-zinc-800 pb-2">ASSESSED STRATEGIC AGENDA</div>
          <div className="flex flex-col gap-3">
             {identity.agenda.map(item => (
                <div key={item.id} className={`border border-zinc-800 bg-[#111] p-3 border-l-4 ${item.type === 'MILITARY' ? 'border-l-red-500' : item.type === 'NUCLEAR' ? 'border-l-red-900' : item.type === 'TERRITORIAL' ? 'border-l-amber-500' : item.type === 'ECONOMIC' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] font-bold text-zinc-500">{item.priority} — {item.type}</span>
                     <span className="text-[10px] text-zinc-600">CONFIDENCE: {item.playerKnowledge}%</span>
                  </div>
                  <div className={`text-sm text-white font-bold mb-3 ${item.playerKnowledge < 30 ? 'bg-black text-transparent select-none' : ''}`}>
                    {item.playerKnowledge < 30 ? 'CLASSIFIED INFO REDACTED' : item.description}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-zinc-500 w-24">PROGRESS:</span>
                     <div className="flex-1 h-1 bg-zinc-900 relative"><motion.div className="absolute inset-y-0 left-0 bg-zinc-300" animate={{ width: `${item.progress}%` }} /></div>
                  </div>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};
