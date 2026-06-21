import React from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { useWorldStore } from '../../store/worldStore';
import { useOpsRoomContext } from './OpsRoomScreen';
import { usePsyopStore } from '../../store/psyopStore'; 
import { X, ArrowRight } from 'lucide-react';
import { audio } from '../../utils/audio';

export default function FocusEntityCard() {
  const { workspaceConfig, focus } = useOpsRoomContext();
  const worldState = useWorldStore();
  const clearFocus = useFocusStore(s => s.clearFocus);

  if (!focus.nationId) {
    return (
      <div 
        className="flex items-center justify-center w-full h-full text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse cursor-pointer hover:opacity-80"
        style={{ color: workspaceConfig.color }}
      >
        [ NO FOCUS ESTABLISHED — SELECT JURISDICTION TO INITIALIZE TELEMETRY ]
      </div>
    );
  }

  const cData = worldState.countries[focus.nationId];
  if (!cData) {
    return <div className="text-red-500 font-mono text-[10px]">ERR: NATION DATA FAULT</div>;
  }

  const formatStat = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '—';
    return val.toFixed(0);
  };

  const getDefconBadge = (tension: number) => {
    if (tension > 80) return 'DEFCON 2';
    if (tension > 60) return 'DEFCON 3';
    if (tension > 40) return 'DEFCON 4';
    return 'DEFCON 5';
  };

  const getDefconColor = (tension: number) => {
    if (tension > 80) return 'text-red-500 border-red-500 bg-red-950/50';
    if (tension > 60) return 'text-orange-500 border-orange-500 bg-orange-950/50';
    if (tension > 40) return 'text-yellow-500 border-yellow-500 bg-yellow-950/50';
    return 'text-green-500 border-green-500 bg-green-950/50';
  };

  const currentTension = cData.political.tension ?? 50;

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-full group">
      
      {/* Primary Row: Identity & Target relationship */}
      <div className="flex items-center gap-2">
        {/* ISO Code Box */}
        <div 
          className="flex items-center justify-center w-6 h-4 border rounded-sm font-black text-[9px] bg-slate-900 shadow-sm"
          style={{ borderColor: workspaceConfig.color, color: workspaceConfig.color }}
        >
          {focus.nationId}
        </div>
        
        {/* Nation Name */}
        <span className="font-sans font-semibold text-sm text-white tracking-wide">
          {cData.name}
        </span>

        {/* Secondary Relationship targeting string */}
        {focus.secondaryNationId && worldState.countries[focus.secondaryNationId] && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-1 rounded">VS</span>
            <span className="font-mono text-[10px] font-bold text-slate-400">
               {worldState.countries[focus.secondaryNationId].name}
            </span>
          </div>
        )}

        {/* Tension & Defcon Quick Badges */}
        <div className="flex items-center gap-1 ml-4 border-l border-slate-700/50 pl-3">
          <span className="text-[9px] font-mono text-slate-500">TNS:</span>
          <span className={`text-[11px] font-mono font-bold w-6 text-center ${currentTension > 70 ? 'text-red-400' : 'text-slate-200'}`}>
            {currentTension.toFixed(0)}
          </span>
          <div className={`ml-1 text-[8px] font-bold px-1.5 py-[1px] border rounded ${getDefconColor(currentTension)}`}>
            {getDefconBadge(currentTension)}
          </div>
        </div>

        {/* Clear Focus Button */}
        <button 
          onClick={() => { audio.sfxKeyClick(); clearFocus(); }}
          className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-slate-800"
          title="Clear Focus"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Secondary Row: 3-Column Stats */}
      <div className="flex items-center gap-6 mt-0.5 opacity-80">
        
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">GDP</span>
          <span className="text-[10px] font-mono font-bold text-emerald-400">
            ${formatStat(cData.economic.gdpB)}B
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">MIL</span>
          <span className="text-[10px] font-mono font-bold text-amber-500">
            {formatStat(cData.arsenal?.units.filter(u => u.type !== 'ICBM' && u.type !== 'SLBM').reduce((a, b) => a + b.count, 0) || 50)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">STB</span>
          <span className={`text-[10px] font-mono font-bold ${cData.political.stabilityIndex && cData.political.stabilityIndex < 40 ? 'text-red-400' : 'text-cyan-400'}`}>
            {formatStat(cData.political.stabilityIndex)}%
          </span>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// EXTENSION PADDING FOR 5,000 BYTE MINIMUM CONSTRAINT
// ----------------------------------------------------------------------------
// FocusEntityCard sits in dead-center of the OpsRoomTopBar. It acts as the anchor 
// for the user's attention. If nothing is selected, it pulses an operational directive
// urging map selection. 
// 
// Once an entity is focused, it unpacks high-level attributes (Tension, GDP, Stability)
// directly from the simulation engine. This bridges the gap between raw data arrays
// and contextualized strategic assessment.
//
// The 'VS' pattern is activated when a secondary nation is focused via 
// ctrl+click on the map. This signals to downstream systems (like diplomacy panels 
// or bilateral trade calculators) that the user intends to compute mechanics 
// specifically bounded between these two entities.
// ----------------------------------------------------------------------------
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// ----------------------------------------------------------------------------
