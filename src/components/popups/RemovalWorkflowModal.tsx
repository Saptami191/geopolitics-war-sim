import React, { useState } from 'react';
import { useRegimePressureStore } from '../../store/regimePressureStore';

export const RemovalWorkflowModal: React.FC<{ targetLeaderId: string, onClose: () => void }> = ({ targetLeaderId, onClose }) => {
  const { initiateTargetedRemoval, advanceRemovalPhase } = useRegimePressureStore();
  const [method, setMethod] = useState<'POLITICAL_EXILE' | 'LEGAL_PERSECUTION' | 'ECONOMIC_ISOLATION' | 'REPUTATION_DESTRUCTION' | 'PHYSICAL_REMOVAL' | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);

  const PHASES = {
    'POLITICAL_EXILE': [
      { name: 'PREPARATION', desc: 'Secure third-country asylum offer', risk: 15 },
      { name: 'PRESSURE', desc: 'Apply sanctions + legal threats', risk: 25 },
      { name: 'NEGOTIATION', desc: 'Back-channel exile terms', risk: 35 },
      { name: 'EXECUTION', desc: 'Leader departs', risk: 20 }
    ],
    'LEGAL_PERSECUTION': [
      { name: 'EVIDENCE', desc: 'Gather corruption evidence', risk: 10 },
      { name: 'PLACEMENT', desc: 'Place evidence with friendly judiciary', risk: 20 },
      { name: 'INDICTMENT', desc: 'Formal indictment issued', risk: 35 },
      { name: 'ISOLATION', desc: 'Asset freezes and travel bans applied', risk: 40 },
      { name: 'REMOVAL', desc: 'Resignation under legal pressure', risk: 30 }
    ],
    'REPUTATION_DESTRUCTION': [
      { name: 'DOSSIER', desc: 'Commission damaging intelligence dossier', risk: 10 },
      { name: 'LEAK', desc: 'Place dossier with international media', risk: 20 },
      { name: 'STORM', desc: 'Global media storm (-30 leader legitimacy)', risk: 30 },
      { name: 'COALITION', desc: 'Domestic political coalition demands resignation', risk: 15 }
    ],
    'PHYSICAL_REMOVAL': [
      { name: 'DEPLOYMENT', desc: 'Deploy specialized operative team', risk: 40 },
      { name: 'EXECUTION', desc: 'Execute removal', risk: 65 },
      { name: 'CLEANUP', desc: 'Cover tracks', risk: 80 }
    ]
  };

  if (!method) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center font-sans">
        <div className="bg-gray-900 border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] w-[500px]">
          <div className="bg-red-900 text-white font-bold p-3 text-sm flex justify-between">
            <span>TARGETED REMOVAL: SELECT VECTOR</span>
            <button onClick={onClose} className="hover:text-red-300">✕</button>
          </div>
          <div className="p-4 space-y-2">
             <button className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 font-bold text-gray-300" onClick={() => {setMethod('POLITICAL_EXILE'); initiateTargetedRemoval(targetLeaderId, 'POLITICAL_EXILE');}}>
               POLITICAL EXILE (4 PHASES)
             </button>
             <button className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 font-bold text-gray-300" onClick={() => {setMethod('LEGAL_PERSECUTION'); initiateTargetedRemoval(targetLeaderId, 'LEGAL_PERSECUTION');}}>
               LEGAL PERSECUTION (5 PHASES)
             </button>
             <button className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 font-bold text-gray-300" onClick={() => {setMethod('REPUTATION_DESTRUCTION'); initiateTargetedRemoval(targetLeaderId, 'REPUTATION_DESTRUCTION');}}>
               REPUTATION DESTRUCTION (4 PHASES)
             </button>
             <button className="w-full text-left p-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900 font-bold text-red-500" onClick={() => {setMethod('PHYSICAL_REMOVAL'); initiateTargetedRemoval(targetLeaderId, 'PHYSICAL_REMOVAL');}}>
               PHYSICAL REMOVAL (EXTREME RISK)
             </button>
          </div>
        </div>
      </div>
    );
  }

  const phases = PHASES[method as keyof typeof PHASES] || [];
  const currentPhase = phases[phaseIdx];

  const advance = () => {
    advanceRemovalPhase(`REM-${targetLeaderId}`);
    if (phaseIdx < phases.length - 1) {
      setPhaseIdx(phaseIdx + 1);
    } else {
      onClose(); // Finished
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center font-sans">
      <div className="bg-gray-900 border border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] w-[600px] flex flex-col">
        <div className="bg-red-900 text-white font-bold p-3 text-sm flex justify-between">
           <span>COVERT ACTION: TARGETED REMOVAL</span>
           <button onClick={onClose} className="hover:text-red-300">✕</button>
        </div>
        
        <div className="p-6">
           <div className="text-xl font-bold text-white mb-1 tracking-widest">{method.replace('_', ' ')}</div>
           <div className="text-xs text-gray-400 mb-6 font-mono">TARGET_ID: {targetLeaderId}</div>
           
           <div className="flex justify-between mb-4 relative">
             {phases.map((p, i) => (
                <div key={i} className={`flex-1 text-center text-xs font-bold ${i === phaseIdx ? 'text-white' : i < phaseIdx ? 'text-gray-600' : 'text-gray-700'}`}>
                   <div className={`w-full h-1 mb-1 ${i === phaseIdx ? 'bg-red-500' : i < phaseIdx ? 'bg-red-900' : 'bg-gray-800'}`}></div>
                   {p.name}
                </div>
             ))}
           </div>

           {currentPhase && (
             <div className="bg-black p-4 border border-gray-700 my-6">
                <div className="font-bold text-red-500 mb-2">CURRENT PHASE: {currentPhase.name}</div>
                <div className="text-sm text-gray-300 mb-4">{currentPhase.desc}</div>
                <div className="flex items-center gap-3">
                   <div className="text-xs text-gray-500 w-24">EXPOSURE RISK:</div>
                   <div className="flex-1 h-3 bg-gray-800 relative">
                     <div className="h-full bg-red-600" style={{width: `${currentPhase.risk}%`}}></div>
                     {/* animated needle mock */}
                     <div className="absolute top-0 bottom-0 w-0.5 bg-white bg-opacity-80 animate-pulse" style={{left: `${currentPhase.risk + (Math.random() * 5 - 2.5)}%`}}></div>
                   </div>
                   <div className="text-sm font-bold text-red-500">{currentPhase.risk}%</div>
                </div>
             </div>
           )}

           <div className="flex justify-between mt-6">
             <button className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 text-sm font-bold" onClick={onClose}>ABORT OPERATION</button>
             <button className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 text-sm font-bold tracking-widest" onClick={advance}>
               {phaseIdx === phases.length - 1 ? 'EXECUTE FINAL PHASE' : 'ADVANCE PHASE'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
