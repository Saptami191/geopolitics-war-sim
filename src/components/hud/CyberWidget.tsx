import React from 'react';
import { useCyberStore } from '../../store/cyberStore';
import { usePlayerStore } from '../../store/playerStore';
import { Terminal, AlertTriangle, ShieldAlert } from 'lucide-react';
import { audio } from '../../utils/audio';

export default function CyberWidget() {
  const { cyber_aptOperations, cyber_incidents, cyber_attributionQueue, cyber_zeroDays } = useCyberStore();
  const setActiveTab = usePlayerStore(state => state.setActiveTab);

  const activeOps = cyber_aptOperations.filter(o => o.status === 'ACTIVE').length;
  const activeIncidents = cyber_incidents.filter(i => !i.resolvedAtTick).length;
  const pendingDecisions = cyber_attributionQueue.length;
  const classifiedZeroDays = cyber_zeroDays.filter(z => z.status === 'CLASSIFIED').length;

  return (
    <div style={{ minHeight: '80px', position: 'relative' }}>
      <div 
        className="bg-[#050a05]/90 border border-[#00ff41]/30 p-2 flex flex-col font-mono text-xs cursor-pointer hover:bg-[#00ff41]/10 transition-colors backdrop-blur mt-2 h-full"
        onClick={() => {
          audio.sfxKeyClick();
          import('../../store/playerStore').then(mod => {
             mod.usePlayerStore.getState().setActiveTab(102); // Let's assign ID 102 for CyberPanel
          })
        }}
      >
        <div className="flex items-center gap-2 text-[#00ff41] font-bold tracking-widest mb-1 pb-1 border-b border-[#00ff41]/20">
          <Terminal className="w-3.5 h-3.5" />
          <span>GHOST PROTOCOL</span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[10px]">
          <div className="flex justify-between items-center text-[#00ff41]">
             <span>ACTIVE OPS</span>
             <span className="font-bold">{activeOps}</span>
          </div>
          <div className="flex justify-between items-center text-[#41c7ff]">
             <span>0-DAYS</span>
             <span className="font-bold">{classifiedZeroDays}</span>
          </div>
          <div className={`flex justify-between items-center ${activeIncidents > 0 ? 'text-amber-500 font-bold' : 'text-gray-500'}`}>
             <span className="flex items-center gap-1">{activeIncidents > 0 && <AlertTriangle className="w-2.5 h-2.5" />} INTRUSIONS</span>
             <span>{activeIncidents}</span>
          </div>
          <div className={`flex justify-between items-center ${pendingDecisions > 0 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
             <span className="flex items-center gap-1">{pendingDecisions > 0 && <ShieldAlert className="w-2.5 h-2.5" />} ATTR PENDING</span>
             <span>{pendingDecisions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
