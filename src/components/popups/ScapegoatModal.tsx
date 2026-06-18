import React, { useState } from 'react';
import { useOversightStore } from '../../store/oversightStore';
import { useOperativeStore } from '../../store/operativeStore';

export default function ScapegoatModal({ scandalId, onClose }: { scandalId: string, onClose: () => void }) {
  const store = useOversightStore();
  const operativeStore = useOperativeStore();
  const scandal = store.activeScandals[scandalId];
  
  if (!scandal) return null;

  const handleSacrifice = (target: string) => {
     alert(store.playerResolutionAction(scandalId, 'SCAPEGOAT_SACRIFICE', target).msg);
     onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
       <div className="bg-[#020402] border border-red-900 w-[500px] p-6 shadow-2xl relative font-mono text-xs">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white">CLOSE</button>
          
          <h2 className="text-red-500 font-bold text-lg mb-2 tracking-widest border-b border-red-900/50 pb-2">SACRIFICE OFFICIAL</h2>
          <p className="text-gray-400 mb-4">Select a target to publicly blame for <span className="font-bold text-orange-400">{scandal.codename}</span>.</p>
          
          <div className="bg-red-950/20 text-red-400 border border-red-900 p-2 text-[10px] mb-4">
             IMMEDIATE EFFECT: scandal tier -1<br/>
             LONG-TERM RISK: IC pool -15 | Loyalty of all operatives -5
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
             <h3 className="text-gray-500 font-bold mb-2 mt-4 text-[10px]">CABINET OFFICIALS</h3>
             {['CIA Director', 'Secretary of Defense', 'National Security Advisor', 'Chief of Staff'].map(pos => (
                <div key={pos} className="border border-gray-800 p-2 flex justify-between items-center bg-black hover:border-gray-600 transition-colors">
                    <span className="text-gray-300 font-bold">{pos}</span>
                    <button onClick={() => handleSacrifice(pos)} className="text-[10px] px-3 py-1 bg-red-950/30 hover:bg-red-900/60 border border-red-900 text-red-500 shadow-sm">RESIGN</button>
                </div>
             ))}

             <h3 className="text-gray-500 font-bold mb-2 mt-4 text-[10px]">INTELLIGENCE OPERATIVES</h3>
             {Object.values(operativeStore.operatives).map(op => (
                <div key={op.id} className="border border-gray-800 p-2 flex justify-between items-center bg-black hover:border-gray-600 transition-colors">
                    <div>
                       <span className="text-gray-300 font-bold block">{op.name}</span>
                       <span className="text-gray-600 text-[9px]">{op.coverType} · Loyalty: {op.loyalty}</span>
                    </div>
                    <button onClick={() => handleSacrifice(op.id)} className="text-[10px] px-3 py-1 border border-orange-900 text-orange-500 hover:bg-orange-950/30">BURN</button>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
