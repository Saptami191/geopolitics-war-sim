import React, { useState } from 'react';
import { useRegimePressureStore } from '../../store/regimePressureStore';
import { useWorldStore } from '../../store/worldStore';

export const EliteSplitMapOverlay: React.FC<{ countryId: string, onClose: () => void }> = ({ countryId, onClose }) => {
  const { eliteFactions, cultivateEliteSplit } = useRegimePressureStore();
  const world = useWorldStore((s) => s.world);
  const country = world.countriesById[countryId];
  const leader = world.leadersById[country?.leaderId];
  
  const factions = eliteFactions[countryId] || [];
  
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);

  if (!country || !leader) return null;

  // Calculate generic leader power grip
  const powerGrip = factions.reduce((acc, f) => acc + (f.powerShare * (f.loyaltyToLeader / 100)), 0);

  const selectedFaction = factions.find(f => f.id === selectedFactionId);

  return (
    <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm z-40 p-10 font-mono">
      {/* Background blueprint aesthetics */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-4 left-4 text-gray-500 text-xs">REGIME_TOPOLOGY_VIZ // {countryId}</div>
      <div className="absolute bottom-4 right-4 text-gray-500 text-xs">CONFIDENTIAL</div>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white px-3 py-1 border border-gray-600 bg-black/50 z-50">CLOSE</button>

      <div className="flex w-full h-full relative z-10">
        
        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col items-center pt-10">
           {/* Leader Node */}
           <div className="bg-gray-900 border-2 border-white p-4 w-64 text-center z-10 shadow-2xl relative">
             <div className="font-bold text-lg text-white">{leader.fullName}</div>
             <div className="text-xs text-gray-400 mb-2">HEAD OF STATE</div>
             <div className="text-sm text-green-400 font-bold">ESTIMATED REGIME GRIP: {Math.floor(powerGrip)}%</div>
             
             {/* Lines emerging from bottom */}
             {(factions || []).map((f, i) => {
                const total = factions.length;
                const offset = (i - (total - 1) / 2) * 150; // spread them out
                
                // Color based on loyalty
                let lineColor = 'border-green-500';
                if (f.loyaltyToLeader < 50) lineColor = 'border-yellow-500';
                if (f.loyaltyToLeader < f.defectionThreshold) lineColor = 'border-red-500';
                if (!f.playerContactEstablished) lineColor = 'border-gray-700 border-dashed';

                const strokeWidth = Math.max(1, f.powerShare / 10);

                return (
                  <div key={f.id}>
                    <svg className="absolute w-[800px] h-64 pointer-events-none" style={{ left: '50%', top: '100%', transform: `translateX(-50%)` }}>
                       <path d={`M 400 0 C 400 120, ${400 + offset} 120, ${400 + offset} 240`} 
                             fill="transparent" 
                             className={lineColor.replace('border-', 'stroke-')} 
                             strokeWidth={strokeWidth} />
                    </svg>
                  </div>
                );
             })}
           </div>

           {/* Faction Nodes Row */}
           <div className="flex justify-center gap-10 mt-64 z-10">
             {(factions || []).map(f => {
               const isUnknown = !f.playerContactEstablished;
               
               let nodeColor = 'border-green-500 bg-green-900/20';
               if (f.loyaltyToLeader < 50) nodeColor = 'border-yellow-500 bg-yellow-900/20';
               if (f.loyaltyToLeader < f.defectionThreshold) nodeColor = 'border-red-500 bg-red-900/20';
               if (isUnknown) nodeColor = 'border-gray-600 bg-gray-900';

               return (
                 <div key={f.id} 
                      className={`w-40 border-2 ${nodeColor} p-3 cursor-pointer hover:bg-opacity-50 transition-all ${selectedFactionId === f.id ? 'ring-4 ring-white' : ''}`}
                      onClick={() => setSelectedFactionId(f.id)}>
                   <div className="text-center font-bold text-white text-sm break-words">{isUnknown ? 'UNCONFIRMED FACTION' : f.name}</div>
                   {!isUnknown && (
                     <div className="mt-2 text-xs text-center border-t border-gray-700/50 pt-2">
                       <span className="text-blue-400 font-bold">{f.powerShare}% PWR</span>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        </div>

        {/* Detail Drawer */}
        {selectedFaction && (
          <div className="w-[350px] bg-black border-l-2 border-white p-6 relative flex flex-col slide-in-right">
             {selectedFaction.playerContactEstablished ? (
               <>
                 <div className="text-2xl font-bold text-white mb-1 uppercase leading-tight">{selectedFaction.name}</div>
                 <div className="text-xs text-gray-500 mb-6">ID: {selectedFaction.id}</div>

                 <div className="space-y-6">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">EFFECTIVE STATE POWER</div>
                      <div className="text-2xl text-blue-400 font-bold">{selectedFaction.powerShare}%</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-xs mb-1">LOYALTY TO REGIME</div>
                      <div className="flex items-end gap-2">
                         <span className={`text-2xl font-bold ${selectedFaction.loyaltyToLeader < selectedFaction.defectionThreshold ? 'text-red-500' : 'text-green-500'}`}>
                           {Math.floor(selectedFaction.loyaltyToLeader)}%
                         </span>
                         <span className="text-xs text-gray-500 mb-1">/ FLIP THRESHOLD: {selectedFaction.defectionThreshold}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 mt-2">
                         <div className={`h-full ${selectedFaction.loyaltyToLeader < selectedFaction.defectionThreshold ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.floor(selectedFaction.loyaltyToLeader)}%`}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-xs mb-1">ACCUMULATED GRIEVANCES</div>
                      <div className="text-2xl text-orange-500 font-bold">{Math.floor(selectedFaction.grievanceLevel)}</div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-xs mb-1">OP HANDLER</div>
                      <div className="text-sm text-white">{selectedFaction.contactOperativeId || 'UNASSIGNED'}</div>
                    </div>
                 </div>

                 <div className="mt-auto space-y-3">
                   <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3" onClick={() => cultivateEliteSplit(countryId, selectedFaction.id, 1)}>
                     CULTIVATE DISSENT ($1B)
                   </button>
                 </div>
               </>
             ) : (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                 <div className="text-4xl text-gray-600">?</div>
                 <div className="text-xl font-bold text-gray-500 text-center">FACTION IDENTITY UNCONFIRMED</div>
                 <p className="text-xs text-gray-600 text-center px-4">Assign an operative to establish a back-channel and penetrate this network.</p>
                 <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 mt-4 text-xs font-bold" onClick={() => useRegimePressureStore.getState().openEliteBackchannel(countryId, selectedFaction.id, 'OP_MOCK')}>ASSIGN OPERATIVE</button>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
