import React from 'react';
import { Factory, AlertTriangle } from 'lucide-react';
import { useDefenseIndustryStore } from '../../store/defenseIndustryStore';

export default function DefenseIndustryWidget() {
  const store = useDefenseIndustryStore();
  const usQueues = store.productionQueues['US']?.items || [];
  const usAlerts = store.defenseAlerts.filter(a => a.countryId === 'US' && !a.acknowledged);
  const activeQueues = usQueues.length;
  const blockedQueues = usQueues.filter(q => q.isBlocked).length;
  const currentMob = store.mobilizationStates['US']?.level || 'PEACETIME';

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-2 flex items-center gap-3 font-mono text-xs shadow-lg pointer-events-auto w-64 opacity-90 hover:opacity-100 transition-opacity">
       <div className="p-1.5 bg-slate-800 rounded text-slate-400">
         <Factory size={16} />
       </div>
       
       <div className="flex-1">
          <div className="flex justify-between items-center mb-0.5">
             <span className="text-white font-bold tracking-wider">DEFENSE IND.</span>
             <span className={currentMob === 'PEACETIME' ? 'text-emerald-400' : 'text-amber-400'}>
               {currentMob.replace('_', ' ')}
             </span>
          </div>
          <div className="flex justify-between text-slate-400 text-[10px]">
             <span>{activeQueues} ACTIVE</span>
             {blockedQueues > 0 && <span className="text-rose-400">{blockedQueues} BLOCKED</span>}
          </div>
       </div>

       {usAlerts.length > 0 && (
         <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse absolute -top-1 -right-1" />
       )}
    </div>
  );
}
