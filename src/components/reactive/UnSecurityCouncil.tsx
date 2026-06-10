import React, { useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { audio } from '../../utils/audio';

export default function UnSecurityCouncil() {
  const currentTick = useWorldStore((s) => s.currentTick);
  const countries = useWorldStore((s) => s.countries);
  const playerCountryId = usePlayerStore((s) => s.countryId);
  const pushTerminalLine = useUIStore((s) => s.pushTerminalLine);

  const [activeResolution, setActiveResolution] = useState({
    title: 'RESOLUTION 2948-B: ENFORCE IMMEDIATE CEASEFIRE ON ACTIVE COMBAT ZONES',
    votesFor: ['US', 'GB', 'FR', 'DE', 'JP', 'KR'],
    votesAgainst: ['RU', 'CN', 'IR'],
  });

  const handleVote = (vote: 'FOR' | 'AGAINST') => {
    audio.sfxUNVote();
    if (vote === 'FOR') {
      setActiveResolution((prev) => ({
        ...prev,
        votesFor: prev.votesFor.includes(playerCountryId) ? prev.votesFor : [...prev.votesFor, playerCountryId],
        votesAgainst: prev.votesAgainst.filter((v) => v !== playerCountryId),
      }));
      pushTerminalLine(`UN SECURITY COUNCIL: Sovereign ${playerCountryId} voted FOR Resolution 2948-B.`, 'INFO');
    } else {
      setActiveResolution((prev) => ({
        ...prev,
        votesAgainst: prev.votesAgainst.includes(playerCountryId) ? prev.votesAgainst : [...prev.votesAgainst, playerCountryId],
        votesFor: prev.votesFor.filter((v) => v !== playerCountryId),
      }));
      pushTerminalLine(`UN SECURITY COUNCIL: Sovereign ${playerCountryId} voted AGAINST Resolution 2948-B.`, 'WARNING');
    }
  };

  return (
    <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col font-mono text-green-400 font-bold justify-between h-full">
      <div className="border-b border-[#1a5c1a] pb-2 mb-3 text-center">
        <span className="text-[11px] font-display text-shadow tracking-widest text-[#00ff44] uppercase block">
          🇺🇳 UN SECURITY COUNCIL CHAMBER
        </span>
        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">
          REACTIVE VOTING BENCH — DELEGATE CONSOLE
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] text-white uppercase text-center bg-[#071407] p-2 border border-[#0d2e0d] leading-relaxed rounded">
          {activeResolution.title}
        </p>

        {/* Voting Horseshoe visualization using a simplified SVG layout */}
        <div className="flex justify-center my-3 relative">
          <svg className="w-48 h-24" viewBox="0 0 100 50">
            {/* Semicircle Horseshoe arc */}
            <path d="M 10 40 A 40 40 0 0 1 90 40" fill="none" stroke="#003500" strokeWidth="6" strokeLinecap="round" />
            
            {/* Draw simplified dot representative seats */}
            {Array.from({ length: 11 }).map((_, idx) => {
              const th = Math.PI + (idx * Math.PI) / 10;
              const x = 50 + 38 * Math.cos(th);
              const y = 40 + 38 * Math.sin(th);

              // Color based on vote representation
              let color = '#555';
              if (idx < 5) color = '#00ff44'; // For
              else if (idx < 8) color = '#ff2244'; // Against
              else color = '#ffb300'; // Abstain

              return (
                <circle key={`un-dot-${idx}`} cx={x} cy={y} r="2" fill={color} />
              );
            })}
          </svg>
        </div>

        {/* Live Tally Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] uppercase text-gray-500">
            <span>FOR ({activeResolution.votesFor.length})</span>
            <span>AGAINST ({activeResolution.votesAgainst.length})</span>
          </div>
          <div className="w-full bg-[#040804] border border-[#0d2e0d] h-2.5 flex rounded overflow-hidden">
            <div className="bg-[#00ff44] h-full" style={{ width: `${(activeResolution.votesFor.length / 15) * 100}%` }} />
            <div className="bg-[#ff2244] h-full" style={{ width: `${(activeResolution.votesAgainst.length / 15) * 100}%` }} />
          </div>
        </div>

        {/* Voter buttons for Player */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleVote('FOR')}
            className="flex-1 py-1.5 border border-[#00ff44] hover:bg-[#00ff44]/15 text-[#00ff44] text-[10px] font-bold uppercase cursor-pointer rounded"
          >
            VOTE YES [FOR]
          </button>
          <button
            onClick={() => handleVote('AGAINST')}
            className="flex-1 py-1.5 border border-[#ff2244] hover:bg-[#ff2244]/15 text-[#ff2244] text-[10px] font-bold uppercase cursor-pointer rounded"
          >
            VOTE NO [AGAINST]
          </button>
        </div>
      </div>
    </div>
  );
}
