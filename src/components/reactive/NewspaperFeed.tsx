import React, { useEffect, useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { audio } from '../../utils/audio';

export default function NewspaperFeed() {
  const currentTick = useWorldStore((s) => s.currentTick);
  const countries = useWorldStore((s) => s.countries);
  
  const [headline, setHeadline] = useState('COLD WAR POSTURE ENFORCED BY SUPERPOWERS');
  const [leadStory, setLeadStory] = useState('Superpower cabinets claim that secure missile grids and mutual interception shields are functioning fully, despite regional localized tensions.');

  // Automatically update newspaper story based on active wars
  useEffect(() => {
    // Audit active wars
    const warsList: [string, string][] = [];
    Object.keys(countries).forEach((cId) => {
      countries[cId].atWarWith.forEach((enemyId) => {
        // Dedup
        if (!warsList.some(([a, b]) => (a === cId && b === enemyId) || (a === enemyId && b === cId))) {
          warsList.push([cId, enemyId]);
        }
      });
    });

    if (warsList.length > 0) {
      const [a, b] = warsList[0];
      const nameA = countries[a]?.name || a;
      const nameB = countries[b]?.name || b;
      setHeadline(`DESTRUCIVE OUTBREAK: SHOOTING WAR BRK OUT BETWEEN ${nameA.toUpperCase()} & ${nameB.toUpperCase()}`);
      setLeadStory(`Unprecedented geopolitical stress is shaking borders as forces initiate full-theater operations. Citizens are urged to secure fallout bunkers as DEFCON alert indexes spike.`);
      audio.sfxNewspaper();
    } else {
      setHeadline('COLD WAR POSTURE ENFORCED BY SUPERPOWERS');
      setLeadStory('Superpower cabinets claim that secure missile grids and mutual interception shields are functioning fully, despite regional localized tensions.');
    }
  }, [currentTick, countries]);

  return (
    <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col font-mono text-green-400 font-bold justify-between h-full">
      <div className="border-b border-[#1a5c1a] pb-2 mb-3 text-center">
        <span className="text-[11px] font-display text-shadow tracking-widest text-[#00ff44] uppercase block">
          🗞 The World Herald
        </span>
        <span className="text-[8px] text-gray-500 uppercase tracking-wider block">
          CENTRAL STRATEGIC DAILY DISPATCH — TICK T+{String(currentTick).padStart(4, '0')}
        </span>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        <h3 className="text-xs uppercase font-extrabold text-white text-center leading-tight tracking-wide border-b border-dashed border-[#0d2e0d] pb-2 text-shadow-sm">
          {headline}
        </h3>
        <p className="text-[10px] text-gray-400 lowercase first-letter:uppercase leading-relaxed text-center font-normal px-2">
          {leadStory}
        </p>
      </div>

      <div className="border-t border-[#0d2e0d] pt-2 mt-3 flex justify-between items-center text-[8px] text-gray-500 uppercase">
        <span>clearance: LEVEL 2</span>
        <span>auth: SECURED CONSOLE</span>
      </div>
    </div>
  );
}
