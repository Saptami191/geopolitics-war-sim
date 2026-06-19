import React from 'react';
import { useEWStore } from '../../store/ewStore';
import { Activity, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function EWStatusWidget() {
  const { globalSpectrumNoise, ewAlerts, activeCampaigns } = useEWStore();

  const numAlerts = ewAlerts.length;
  const numCampaigns = Object.keys(activeCampaigns).length;
  const isHighNoise = globalSpectrumNoise > 70;

  return (
    <div className="bg-black/60 border border-white/10 p-2 rounded flex flex-col gap-1 w-48 font-mono shadow-lg backdrop-blur-sm pointer-events-auto">
      <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
        <div className="text-[10px] text-white/50 flex items-center font-bold">
          <Activity className="w-3 h-3 text-amber-500 mr-1" /> SPECTRUM ENV
        </div>
        <div className={`text-[10px] font-bold ${isHighNoise ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
          {globalSpectrumNoise.toFixed(0)} dB
        </div>
      </div>
      
      <div className="flex justify-between items-center text-[10px]">
        <div className="text-white/40">ACTIVE CAMPAIGNS</div>
        <div className={numCampaigns > 0 ? 'text-amber-400 font-bold' : 'text-white/40'}>
          {numCampaigns}
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px]">
        <div className="text-white/40">BURN WARNINGS</div>
        {numAlerts > 0 ? (
          <div className="flex items-center text-red-500 font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" /> {numAlerts}
          </div>
        ) : (
          <div className="flex items-center text-emerald-500/70">
            <ShieldAlert className="w-3 h-3 mr-1" /> SECURE
          </div>
        )}
      </div>
    </div>
  );
}
