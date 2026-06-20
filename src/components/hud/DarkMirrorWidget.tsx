import React from 'react';
import { useArachneStore } from '../../store/arachneStore';
import { useFinintStore } from '../../store/finintStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { audio } from '../../utils/audio';

export default function DarkMirrorWidget() {
  const { arachne_nodes, arachne_fusionProducts, arachne_feeds } = useArachneStore();
  const { finint_flags } = useFinintStore();

  const mappedNodesCount = arachne_nodes.filter(n => n.exposureLevel === 'MAPPED').length;
  const criticalFinintCount = finint_flags.filter(f => f.severity === 'CRITICAL' && !f.isActedUpon).length;
  const newFusionsCount = arachne_fusionProducts.filter(f => f.actionableFlag).length; // Need a "new" flag? Will use actionable.
  const activeFeedsCount = arachne_feeds.filter(f => f.isActive).length;

  const handleClick = () => {
    audio.sfxKeyClick();
    useArachneStore.getState().arachne_setActiveTab('FUSION');
    useUIStore.getState().setActivePanelId('6');
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-black border border-[#444] px-2 py-1 text-left flex flex-col justify-center min-w-[140px] hover:bg-[#111] transition-colors pointer-events-auto"
    >
      <div className="text-[9px] uppercase tracking-widest text-[#aaa] font-bold mb-1 border-b border-[#333] pb-0.5">DARK MIRROR</div>
      <div className="flex justify-between items-center text-[10px] uppercase text-gray-500 mb-0.5">
        <span>Nodes:</span>
        <span className="text-cyan-400 font-bold">{mappedNodesCount}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] uppercase text-gray-500 mb-0.5">
        <span>Feeds:</span>
        <span className="text-amber-500 font-bold">{activeFeedsCount}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] uppercase text-gray-500 mb-0.5">
        <span>Fusions:</span>
        {newFusionsCount > 0 ? (
          <span className="bg-amber-600 text-black px-1 font-bold">{newFusionsCount}</span>
        ) : (
          <span className="text-gray-400">0</span>
        )}
      </div>
      <div className="flex justify-between items-center text-[10px] uppercase text-gray-500">
        <span>Flags:</span>
        {criticalFinintCount > 0 ? (
          <span className="bg-red-600 text-white px-1 font-bold animate-pulse">{criticalFinintCount}</span>
        ) : (
          <span className="text-gray-400">0</span>
        )}
      </div>
    </button>
  );
}
