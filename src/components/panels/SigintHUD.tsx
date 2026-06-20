import React from 'react';
import { useSigintStore } from '../../store/sigintStore';
import { useUIStore } from '../../store/uiStore';
import { audio } from '../../utils/audio';

export default function SigintHUD({ onClick }: { onClick: () => void }) {
  const store = useSigintStore();
  const uiStore = useUIStore();
  
  const { alerts, targets } = store;
  const unreadAlerts = alerts.filter(a => !a.isAcknowledged).length;
  
  // Highest confidence target
  const targetList = Object.values(targets);
  const highestTarget = targetList.reduce(
    (prev, curr) => (prev && prev.analystConfidence > curr.analystConfidence) ? prev : curr, 
    targetList[0]
  );
  
  const confirmedCount1 = targetList.filter(t => t.visibilityTier === 'CONFIRMED').length;

  // U8200 Metrics
  const activeAssets = store.u8200Assets.filter(a => a.isActive).length;
  const confirmedCount2 = store.u8200Signals.filter(s => s.status === 'CONFIRMED').length;
  const anomalyCount = store.u8200Signals.filter(s => s.anomalyFlag === true).length;
  const budget = store.u8200Budget;
  const isBudgetCritical = budget.totalAllocated > 0 && (budget.remaining / budget.totalAllocated) < 0.20;

  const handleU8200HUDClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    audio.sfxKeyClick();
    uiStore.setActivePanelId('U8200_COMMAND');
  };

  return (
    <div className="flex flex-col gap-1.5 select-none shrink-0">
      {/* Legacy Echo Grid Display */}
      <div 
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-1 bg-black border cursor-pointer transition-colors ${
          unreadAlerts > 0 ? 'border-cyan-500 hover:bg-cyan-950/20' : 'border-cyan-900 hover:bg-gray-900'
        }`}
        title="ECHO GRID: Signals Intelligence"
      >
        <span className={`text-[9px] font-bold tracking-wider ${unreadAlerts > 0 ? 'text-cyan-400' : 'text-cyan-800'}`}>
          ECHO_GRID
        </span>
        
        <div className="flex flex-col">
          <div className="flex gap-2 text-[8px] font-mono leading-none mb-0.5">
            <span className="text-gray-500">ALERTS: <span className={unreadAlerts > 0 ? 'text-amber-500 font-bold' : 'text-cyan-800'}>{unreadAlerts}</span></span>
            <span className="text-gray-500">CONFIRMED: <span className="text-green-500">{confirmedCount1}</span></span>
          </div>
          {highestTarget && highestTarget.visibilityTier !== 'HIDDEN' ? (
            <div className="text-[8px] text-cyan-600 font-mono leading-none truncate max-w-[124px]">
              TOP: {highestTarget.name} ({Math.floor(highestTarget.analystConfidence)}%)
            </div>
          ) : (
            <div className="text-[8px] text-cyan-800 font-mono leading-none">ACQUIRING SIGNALS...</div>
          )}
        </div>
      </div>

      {/* U8200 Status Row */}
      <div 
        onClick={handleU8200HUDClick}
        className={`flex items-center gap-3 px-3 py-1 bg-[#010404] border cursor-pointer transition-all ${
          anomalyCount > 0 ? 'border-red-500/80 hover:bg-red-950/15 animate-pulse' : 'border-cyan-950 hover:bg-gray-950'
        }`}
        title="UNIT 8200: Electronic Spectrum Command"
      >
        <span className={`text-[9px] font-bold tracking-wider ${anomalyCount > 0 ? 'text-red-400' : 'text-cyan-700'}`}>
          UNIT_8200
        </span>

        <div className="flex flex-col font-mono text-[8.5px] leading-snug">
          <div className="flex gap-1.5 text-gray-500">
            <span>ASSETS: <span className="text-white font-bold">{activeAssets}</span></span>
            <span>
              {confirmedCount2 > 0 ? (
                <span className="text-green-400 font-bold">◆ {confirmedCount2} CONF</span>
              ) : (
                <span>0 CONF</span>
              )}
            </span>
            <span>
              {anomalyCount > 0 ? (
                <span className="text-red-500 font-black animate-pulse">⚠ {anomalyCount} ANOM</span>
              ) : (
                <span>0 ANOM</span>
              )}
            </span>
          </div>
          <div>
            {isBudgetCritical ? (
              <span className="text-red-500 font-bold animate-pulse text-[8px] tracking-wider">⚠ BUDGET CRITICAL</span>
            ) : (
              <span className="text-emerald-600 font-semibold text-[8px] tracking-wide">BUDGET: {budget.remaining}U</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
