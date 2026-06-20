import React, { useState } from 'react';
import { useDiplomaticStore } from '../../store/diplomaticStore';
import { BookOpen, ShieldAlert, FileText } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export default function DiplomacyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    diplo_treaties, 
    diplo_crises, 
    diplo_capitalPool, 
    diplo_unscResolutions 
  } = useDiplomaticStore();

  const activeTreatiesCount = Object.values(diplo_treaties).filter(t => t.status === 'RATIFIED').length;
  const activeCrisesCount = diplo_crises.filter(c => c.status === 'ACTIVE').length;
  const pendingResolutionsCount = diplo_unscResolutions.filter(r => r.status === 'PROPOSED' || r.status === 'UNDER_DEBATE').length;

  const openDiplomacyPanel = () => {
    import('../../store/playerStore').then(mod => {
      mod.usePlayerStore.getState().setActiveTab(4);
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900/90 border border-slate-700 text-slate-300 px-3 py-2 text-xs font-mono uppercase hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-between"
      >
        <span className="flex items-center gap-2 text-slate-300 font-bold" style={{fontVariant: 'small-caps'}}>
          <BookOpen className="w-4 h-4 text-emerald-400" />
          IRON COVENANT
        </span>
        <div className="flex gap-2 items-center">
            <span className="text-emerald-400 font-bold">{activeTreatiesCount} T</span>
            {activeCrisesCount > 0 && <span className="bg-red-900 text-red-100 px-1 rounded animate-pulse">{activeCrisesCount} C</span>}
        </div>
      </button>
    );
  }

  return (
    <div className="w-full bg-slate-900/95 border border-slate-700 text-slate-300 shadow-2xl backdrop-blur font-mono text-xs flex flex-col">
      <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2 font-bold text-slate-300" style={{fontVariant: 'small-caps'}}>
          <BookOpen className="w-4 h-4 text-emerald-400" />
          IRON COVENANT
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white uppercase text-[10px]">Close</button>
      </div>

      <div className="p-3 grid grid-cols-2 gap-4 border-b border-slate-800">
        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
            <div className="text-xl font-bold text-emerald-400">{activeTreatiesCount}</div>
            <div className="text-[10px] uppercase text-slate-500">Active Treaties</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
            <div className={`text-xl font-bold ${activeCrisesCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>{activeCrisesCount}</div>
            <div className="text-[10px] uppercase text-slate-500">Active Crises</div>
        </div>
      </div>

      <div className="p-3">
          <div className="text-[10px] text-slate-500 uppercase mb-2">Diplomatic Capital</div>
          <div className="flex flex-col gap-1">
             <div className="flex items-center justify-between">
                <span className="text-slate-400">POLITICAL</span>
                <div className="w-24 h-2 bg-slate-800 border border-slate-700">
                   <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (diplo_capitalPool.political/1000)*100)}%` }}></div>
                </div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-slate-400">ECONOMIC</span>
                <div className="w-24 h-2 bg-slate-800 border border-slate-700">
                   <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (diplo_capitalPool.economic/1000)*100)}%` }}></div>
                </div>
             </div>
          </div>
      </div>

      {pendingResolutionsCount > 0 && (
          <div className="px-3 pb-3">
              <div className="flex justify-between items-center bg-amber-950/20 p-2 border border-amber-900/30 rounded">
                <div className="flex items-center gap-2">
                   <FileText className="w-3 h-3 text-amber-500" />
                   <span className="text-amber-500 text-[10px] font-bold uppercase">Pending UNSC</span>
                </div>
                <span className="text-amber-500 font-bold">{pendingResolutionsCount}</span>
              </div>
          </div>
      )}

      <button 
        onClick={openDiplomacyPanel}
        className="w-full bg-slate-800 hover:bg-slate-700 text-center py-2 text-[10px] font-bold uppercase border-t border-slate-700"
      >
        Open Architecture
      </button>

    </div>
  );
}
