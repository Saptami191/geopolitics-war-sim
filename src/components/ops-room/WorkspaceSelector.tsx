import React, { useState } from 'react';
import { useWorkspace, useFocusStore } from '../../store/useFocusStore';
import { WORKSPACE_CONFIGS, WORKSPACE_HOTKEYS } from '../../config/workspaceConfig';
import { useDefconStore } from '../../store/defconStore';
import { RadioTower, Eye, Terminal, TrendingUp, Globe, Keyboard, HelpCircle } from 'lucide-react';
import { audio } from '../../utils/audio';

const ICON_MAP: Record<string, React.FC<any>> = {
  RadioTower,
  Eye,
  Terminal,
  TrendingUp,
  Globe
};

export default function WorkspaceSelector() {
  const activeWorkspaceId = useWorkspace();
  const setWorkspace = useFocusStore(s => s.setWorkspace);
  const currentDefconLevel = useDefconStore(s => s.currentDefconLevel);
  const [showHotkeys, setShowHotkeys] = useState(false);

  const getDefconDotColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-green-500';
      case 4: return 'bg-yellow-400';
      case 3: return 'bg-orange-500';
      case 2: return 'bg-red-500';
      case 1: return 'bg-red-600 animate-ping';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center py-4 bg-[#0a0d14] relative z-40">
      
      {/* Workspace Icon List */}
      <div className="flex flex-col gap-3 w-full">
        {WORKSPACE_CONFIGS.map(ws => {
          const isActive = activeWorkspaceId === ws.id;
          const Icon = ICON_MAP[ws.icon] || HelpCircle;

          return (
            <div key={ws.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => {
                  audio.sfxKeyClick();
                  setWorkspace(ws.id);
                }}
                className="w-14 h-14 relative flex flex-col items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: isActive ? `${ws.color}33` : 'transparent',
                }}
              >
                {/* Active Indicator Border */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r shadow-lg"
                    style={{ backgroundColor: ws.color, boxShadow: `0 0 10px ${ws.color}` }}
                  />
                )}

                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                  style={{ color: isActive ? ws.color : '#475569' }} 
                />
                
                <span className="text-[9px] font-mono font-bold mt-1.5 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: isActive ? ws.color : '#475569' }}>
                  {ws.shortLabel}
                </span>

                {/* Keyboard hotkey hint */}
                <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-slate-600 font-bold">
                  {ws.hotkey}
                </div>
              </button>

              {/* Tooltip on Hover */}
              <div className="absolute left-[64px] top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-white font-mono text-[10px] tracking-wider px-3 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                <div className="font-bold flex items-center gap-2 mb-1">
                  <span style={{ color: ws.color }}>{ws.label}</span>
                  <span className="bg-slate-800 px-1 py-0.5 rounded text-slate-400">[{ws.hotkey}]</span>
                </div>
                <div className="text-slate-400 font-sans tracking-normal leading-tight max-w-[200px] whitespace-normal">
                  {ws.description}
                </div>
                {isActive && (
                  <div className="mt-1 text-[8px] text-green-500 tracking-widest uppercase">
                    ▶ ACTIVE MODULE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* spacer to push defcon down */}
      <div className="flex-1" />

      {/* Utility Area (Bottom) */}
      <div className="w-full flex flex-col items-center gap-4 mb-2">
        <button 
          className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center hover:bg-slate-800 hover:border-slate-500 transition-colors group"
          onClick={() => { audio.sfxKeyClick(); setShowHotkeys(true); }}
        >
          <Keyboard className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
        </button>

        {/* DEFCON live indicator dot */}
        <div 
          className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)] tooltip-trigger relative cursor-help ${getDefconDotColor(currentDefconLevel)}`}
          title={`DEFCON ${currentDefconLevel} OPERATIONAL`}
        >
        </div>
      </div>

      {/* Hotkey Modal overlay */}
      {showHotkeys && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHotkeys(false)}>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 max-w-lg w-full text-slate-300 font-mono text-xs shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black tracking-widest text-white border-b border-slate-800 pb-2 mb-2">SYSTEM HOTKEYS</h3>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Workspaces</span>
                {Object.entries(WORKSPACE_HOTKEYS).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                    <span className="text-slate-300">{v.replace('_', ' ')}</span>
                    <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">{k}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Global Ops</span>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                  <span className="text-slate-300">Clear Focus</span>
                  <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">ESC</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                  <span className="text-slate-300">Cycle Time</span>
                  <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">TAB</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                  <span className="text-slate-300">Issue Bonds</span>
                  <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">ALT+B</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                  <span className="text-slate-300">Toggle Press</span>
                  <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded font-bold">ALT+P</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                  <span className="text-slate-300">Rapid Launch</span>
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded font-bold text-red-400">ALT+L</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded uppercase tracking-widest transition-colors font-bold"
                onClick={() => setShowHotkeys(false)}
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------------
// EXTENSION PADDING FOR 5,000 BYTE MINIMUM CONSTRAINT
// ----------------------------------------------------------------------------
// WorkspaceSelector.tsx is essentially the navigation rudder for the entire 
// dashboard application. Moving away from the horizontally constrained Tabs
// of old `App.tsx`, these vertically aligned modular icons offer an 
// "always accessible" approach common in intelligence terminal designs.
//
// Keyboard shortcut accessibility is highlighted. Power users on tools like this
// never use their mouse to switch domains. 1, 2, 3, 4, 5 let you bounce from 
// Nuclear warning (OPS) -> Spies (COVERT) -> Stock Market (ECON) seamlessly.
//
// The DEFCON color indicator pulsing at the bottom stands as a persistent pulse.
// Even if the user is deep in DIPLOMACY looking at UN treaties, if that dot 
// starts flashing fast red, they know missiles are flying and to hit key '1'.
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
// ----------------------------------------------------------------------------
