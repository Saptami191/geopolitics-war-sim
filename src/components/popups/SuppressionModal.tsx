import React from 'react';
import { useOversightStore } from '../../store/oversightStore';

export default function SuppressionModal({ scandalId, onClose }: { scandalId: string, onClose: () => void }) {
  const store = useOversightStore();
  const scandal = store.activeScandals[scandalId];
  if (!scandal) return null;

  const handleAction = (method: string) => {
     const leak = store.pendingLeaks.find(l => l.id === scandal.triggeringLeakId);
     if (leak) {
        alert(store.suppressLeak(leak.id, method).msg);
     } else {
        alert('Leak no longer pending.');
     }
     onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
       <div className="bg-[#020402] border border-orange-900 w-[600px] p-6 shadow-2xl relative font-mono text-xs">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white">CLOSE</button>
          
          <h2 className="text-orange-400 font-bold text-lg mb-2 tracking-widest border-b border-orange-900/50 pb-2">DAMAGE CONTROL AUTHORIZATION</h2>
          <p className="text-gray-400 mb-6 italic">"{scandal.headlineText}"</p>

          <div className="space-y-4">
             {[
               { method: 'LEGAL_INJUNCTION', label: 'LEGAL INJUNCTION', desc: 'File injunction to delay publication.', cost: '$0.3B & 40 LEGISLATIVE', risk: 'Credibility hit if fails' },
               { method: 'BRIBE_OUTLET', label: 'BRIBE OUTLET', desc: 'Pay for silence.', cost: '$0.5B+ & 50 EXECUTIVE', risk: 'Counter-scandal if high credibility' },
               { method: 'PSYOP_COUNTER', label: 'PSYOP COUNTER', desc: 'Deploy counter-narrative.', cost: 'PSYOP capability', risk: 'Scandal stacking if attributed' },
               { method: 'POLITICAL_PRESSURE', label: 'POLITICAL PRESSURE', desc: 'Pressure friendly editors.', cost: '8 EXECUTIVE', risk: 'Fails on hostile outlets' },
               { method: 'DENY_AND_ATTACK', label: 'DENY AND ATTACK', desc: 'Aggressive public denial.', cost: 'None', risk: 'Streisand effect, worsens if proven' }
             ].map(opt => (
                <div key={opt.method} className="border border-orange-900/30 p-3 bg-black flex justify-between items-center hover:border-orange-500 transition-colors">
                   <div>
                       <h3 className="text-orange-300 font-bold">{opt.label}</h3>
                       <p className="text-gray-500 text-[10px] mt-1">{opt.desc}</p>
                       <div className="flex gap-4 mt-2 text-[9px] text-gray-600">
                           <span>COST: <span className="text-amber-500">{opt.cost}</span></span>
                           <span>RISK: <span className="text-red-500">{opt.risk}</span></span>
                       </div>
                   </div>
                   <button onClick={() => handleAction(opt.method)} className="px-4 py-2 border border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold shrink-0">
                      AUTHORIZE
                   </button>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
