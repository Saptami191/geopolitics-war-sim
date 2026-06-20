import React, { useState } from 'react';
import { useSanctionsStore } from '../../store/sanctionsStore';
import { useWorldStore } from '../../store/worldStore';
import { ShieldAlert, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SanctionsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { sanctions_regimes, sanctions_evasionNetworks } = useSanctionsStore();

  const regimes = Object.values(sanctions_regimes);
  const activeRegimesCount = regimes.length;
  const maxPressure = regimes.length > 0 ? Math.max(...regimes.map(r => r.totalEconomicPressureScore)) : 0;
  const activeEvasions = Object.values(sanctions_evasionNetworks).filter(e => e.isDetected).length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-3 py-2 text-xs font-mono uppercase hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          IRON LEDGER STATUS
        </span>
        <div className="flex gap-2">
            <span className="text-red-400">{activeRegimesCount} ACTIVE</span>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full bg-slate-900/95 border border-slate-700 text-slate-300 shadow-2xl backdrop-blur font-mono text-xs flex flex-col">
      <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          IRON LEDGER
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white uppercase text-[10px]">Close</button>
      </div>

      <div className="p-3 grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
            <div className="text-xl font-bold text-emerald-400">{activeRegimesCount}</div>
            <div className="text-[10px] uppercase text-slate-500">Regimes Active</div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
            <div className="text-xl font-bold text-red-500">{maxPressure}%</div>
            <div className="text-[10px] uppercase text-slate-500">Peak Pressure</div>
        </div>
      </div>

      <div className="px-3 pb-3">
          <div className="flex justify-between items-center bg-red-950/20 p-2 border border-red-900/30 rounded">
            <div className="flex items-center gap-2">
               <Activity className="w-4 h-4 text-red-400" />
               <span className="text-red-400 font-bold uppercase">Detected Evasions</span>
            </div>
            <span className="text-red-400 font-bold">{activeEvasions}</span>
          </div>
      </div>
    </div>
  );
}
