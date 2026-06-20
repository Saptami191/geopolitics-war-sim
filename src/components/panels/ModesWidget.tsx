import React from 'react';
import { useModesStore } from '../../store/modesStore';
import { usePlayerStore } from '../../store/playerStore';

interface ModesWidgetProps {
  onClick: () => void;
}

export function ModesWidget({ onClick }: ModesWidgetProps) {
  const { modes_activeSession } = useModesStore();
  const { player_role, player_toneMode } = usePlayerStore();

  const roleText = player_role === 'SHADOW_DIRECTOR' ? 'SD' : player_role === 'SUPREME_COMMANDER' ? 'SC' : 'CI';
  const toneText = player_toneMode === 'REALISM' ? 'R' : player_toneMode === 'TECHNO_THRILLER' ? 'T' : 'A';
  const hasBrief = !!modes_activeSession;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded hover:border-amber-500 transition-all text-[10px] select-none text-slate-400 font-mono tracking-wide"
      title="Iron Throne Sovereign Framework"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${hasBrief ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-slate-600'}`} />
      <span>
        MODE: <strong className={hasBrief ? 'text-amber-500' : 'text-slate-500'}>
          [{roleText}][{toneText}]
        </strong>
      </span>
    </button>
  );
}
