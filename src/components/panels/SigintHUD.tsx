import React from 'react';
import { useSigintStore } from '../../store/sigintStore';

export default function SigintHUD({ onClick }: { onClick: () => void }) {
  const { alerts, targets } = useSigintStore();
  
  const unreadAlerts = alerts.filter(a => !a.isAcknowledged).length;
  
  // Highest confidence target
  const targetList = Object.values(targets);
  const highestTarget = targetList.reduce((prev, curr) => (prev && prev.analystConfidence > curr.analystConfidence) ? prev : curr, targetList[0]);
  
  const confirmedCount = targetList.filter(t => t.visibilityTier === 'CONFIRMED').length;

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-1 bg-black border cursor-pointer transition-colors ${unreadAlerts > 0 ? 'border-cyan-500 hover:bg-cyan-950/20' : 'border-cyan-900 hover:bg-gray-900'}`}
      title="ECHO GRID: Signals Intelligence"
    >
      <span className={`text-[9px] font-bold ${unreadAlerts > 0 ? 'text-cyan-400' : 'text-cyan-800'}`}>
         ECHO_GRID
      </span>
      
      <div className="flex flex-col">
         <div className="flex gap-2 text-[8px] font-mono leading-none mb-0.5">
             <span className="text-gray-500">ALERTS: <span className={unreadAlerts > 0 ? 'text-amber-500 font-bold' : 'text-cyan-800'}>{unreadAlerts}</span></span>
             <span className="text-gray-500">CONFIRMED: <span className="text-green-500">{confirmedCount}</span></span>
         </div>
         {highestTarget && highestTarget.visibilityTier !== 'HIDDEN' ? (
             <div className="text-[8px] text-cyan-600 font-mono leading-none truncate max-w-[120px]">
                 TOP: {highestTarget.name} ({Math.floor(highestTarget.analystConfidence)}%)
             </div>
         ) : (
             <div className="text-[8px] text-cyan-800 font-mono leading-none">ACQUIRING SIGNALS...</div>
         )}
      </div>
    </div>
  );
}
