import React from 'react';
import { useLeaderStore } from '../../store/leaderStore';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderDossierModal } from './LeaderDossierModal';

export const LeaderDossierPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const leadersByCountryId = useLeaderStore(s => s.leadersByCountryId);
  const leaders = Object.values(leadersByCountryId);
  const [selectedLeaderCountry, setSelectedLeaderCountry] = React.useState<string | null>(null);

  if (!isOpen) return null;

  // sort by hakwDoveScore (highest first)
  const sorted = [...leaders].sort((a, b) => b.hawkDoveScore - a.hawkDoveScore);

  return (
    <>
      <div className="absolute inset-y-0 left-[300px] w-[350px] bg-[#0c0c0c] border-r border-zinc-800 shadow-2xl flex flex-col z-[85] font-mono text-zinc-300">
        <div className="flex-shrink-0 p-4 border-b border-zinc-800 flex justify-between items-center bg-black">
          <div className="font-bold tracking-widest text-sm text-white">WORLD LEADERS</div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 scrollbar-thin">
          {sorted.map(leader => {
            const hColor = leader.hawkDoveScore > 70 ? 'border-red-500' : leader.hawkDoveScore < 40 ? 'border-blue-500' : 'border-zinc-500';
            const bgClass = leader.source === 'COUP' ? 'bg-red-950/20' : 'bg-[#111]';
            
            return (
              <div 
                 key={leader.id}
                 onClick={() => setSelectedLeaderCountry(leader.countryId)}
                 className={`group flex items-center h-[100px] border border-zinc-800 ${bgClass} border-l-4 ${hColor} cursor-pointer hover:bg-zinc-800 transition-colors relative overflow-hidden`}
              >
                <img src={leader.portraitDataUrl} className="w-[80px] h-full object-cover filter grayscale group-hover:grayscale-0 transition-all border-r border-zinc-800" alt={leader.name} />
                <div className="absolute bottom-1 left-1 text-[10px] bg-black px-1 font-bold">{leader.countryId}</div>
                
                <div className="flex-1 p-3 flex flex-col justify-center">
                  <div className="text-sm font-bold text-white truncate">{leader.name}</div>
                  <div className="text-[9px] text-zinc-500 mb-2 truncate">{leader.type.replace('_', ' ')}</div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-[8px] font-bold text-zinc-600 w-16">HAWK INDEX</div>
                    <div className="flex-1 h-1 bg-zinc-900 flex">
                       <div className="h-full bg-red-600" style={{ width: `${leader.hawkDoveScore}%` }} />
                    </div>
                  </div>
                  
                  {leader.source === 'COUP' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-red-500 text-[8px] font-black tracking-widest animate-pulse">
                      <span>⚡</span> COUP INSTALLED
                    </div>
                  )}
                  {leader.source === 'ELECTION' && (
                    <div className="absolute top-2 right-2 text-blue-400 text-[8px] font-bold">ELECTED</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedLeaderCountry && (
          <LeaderDossierModal countryId={selectedLeaderCountry} onClose={() => setSelectedLeaderCountry(null)} />
        )}
      </AnimatePresence>
    </>
  );
};
