import React from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { audio } from '../../utils/audio';

export default function PopulationPanel() {
  const countryId = usePlayerStore((s) => s.countryId);
  const countries = useWorldStore((s) => s.countries);
  const country = countries[countryId];
  
  const pushTerminalLine = useUIStore((s) => s.pushTerminalLine);

  if (!country) return null;

  const sim = country.populationSim;

  const handleBorderPolicy = (policy: 'OPEN' | 'CLOSED' | 'CAMPS' | 'DEPORT') => {
    audio.sfxKeyClick();
    
    useWorldStore.getState().applyTickDelta((draft) => {
      const c = draft.countries[countryId];
      if (c && c.populationSim) {
        if (policy === 'OPEN') {
          c.populationSim.migration = Math.max(-10, c.populationSim.migration + 6);
          c.political.stabilityIndex = Math.max(10, c.political.stabilityIndex - 8);
          c.political.popularUnrest = Math.min(100, c.political.popularUnrest + 4);
          pushTerminalLine('POPULATION DIRECTIVE: Borders opened. Net immigration increased. Internal tension is rising.', 'WARNING');
        } else if (policy === 'CLOSED') {
          c.populationSim.migration = Math.max(-15, c.populationSim.migration - 8);
          c.political.stabilityIndex = Math.min(100, c.political.stabilityIndex + 5);
          c.political.popularUnrest = Math.max(0, c.political.popularUnrest - 3);
          pushTerminalLine('POPULATION DIRECTIVE: Borders secured. Tight immigration screening enforced.', 'INFO');
        } else if (policy === 'CAMPS') {
          c.economic.treasuryCashB = Math.max(0, c.economic.treasuryCashB - 1.5);
          c.political.popularUnrest = Math.max(0, c.political.popularUnrest - 8);
          pushTerminalLine('POPULATION DIRECTIVE: Refugee aid zones constructed. Human welfare funding disbursed ($1.5B cost).', 'INFO');
        } else if (policy === 'DEPORT') {
          c.political.popularUnrest = Math.min(100, c.political.popularUnrest + 12);
          c.political.stabilityIndex = Math.max(10, c.political.stabilityIndex - 15);
          c.populationSim.migration = Math.max(-30, c.populationSim.migration - 15);
          pushTerminalLine('POPULATION DIRECTIVE: Strict forced exit policies triggered. Global human rights agencies signal denouncement.', 'CRITICAL');
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-[#1a5c1a] pb-2">
        <span className="text-xs uppercase font-bold text-[#00ff44] tracking-wider font-display">
          👨‍👩‍👧‍👦 Demographic & Sovereign Population Profile (F8)
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          NATION HEADCOUNT RESISTANCES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core demographic stats */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 font-mono space-y-3">
          <span className="text-[10px] font-bold text-[#00e5ff] uppercase block border-b border-[#0d2e0d] pb-1">
            Demographic Ledger
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Total Headcount:</span>
              <span className="text-white font-bold">{country.population.toFixed(1)}M citizens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Urbanization:</span>
              <span className="text-[#00ff44]">{sim?.urbanization || 75}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Literacy Index:</span>
              <span className="text-[#00ff44]">{sim?.educationLevel || 80}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Birth Rate:</span>
              <span className="text-white">{sim?.birthRate || 12} per 1000/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Death Rate:</span>
              <span className="text-white">{sim?.deathRate || 8} per 1000/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 uppercase">Net Migration:</span>
              <span className={((sim?.migration || 0) < 0) ? 'text-red-500' : 'text-green-400'}>
                {sim?.migration || 0}k per tick
              </span>
            </div>
          </div>
        </div>

        {/* Age pyramids bar charts */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#00e5ff] uppercase block border-b border-[#0d2e0d] pb-1">
            Age Demographics Distribution
          </span>

          <div className="space-y-2 text-xs py-2">
            <div>
              <div className="flex justify-between text-[10px] uppercase text-gray-500">
                <span>Youth (&lt; 18 yrs)</span>
                <span>{sim?.ageDemographics.youthPct || 20}%</span>
              </div>
              <div className="w-full bg-[#030603] border border-[#0d2e0d] h-2 mt-1">
                <div className="bg-[#00ff44] h-full" style={{ width: `${sim?.ageDemographics.youthPct || 20}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] uppercase text-gray-500">
                <span>Adult (18 - 65 yrs)</span>
                <span>{sim?.ageDemographics.adultPct || 60}%</span>
              </div>
              <div className="w-full bg-[#030603] border border-[#0d2e0d] h-2 mt-1">
                <div className="bg-[#00e5ff] h-full" style={{ width: `${sim?.ageDemographics.adultPct || 60}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] uppercase text-gray-500">
                <span>Elderly (&gt; 65 yrs)</span>
                <span>{sim?.ageDemographics.elderlyPct || 20}%</span>
              </div>
              <div className="w-full bg-[#030603] border border-[#0d2e0d] h-2 mt-1">
                <div className="bg-purple-500 h-full" style={{ width: `${sim?.ageDemographics.elderlyPct || 20}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Player Border Controls */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#00e5ff] uppercase block border-b border-[#0d2e0d] pb-1">
            Population Border Controls
          </span>

          <div className="grid grid-cols-2 gap-2 mt-3 flex-1 py-1">
            <button
              onClick={() => handleBorderPolicy('OPEN')}
              className="bg-transparent border border-[#00ff44] text-[#00ff44] hover:bg-[#00ff44]/15 rounded text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer"
            >
              OPEN BORDERS
            </button>
            <button
              onClick={() => handleBorderPolicy('CLOSED')}
              className="bg-transparent border border-[#00ff44] text-[#00ff44] hover:bg-[#00ff44]/15 rounded text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer"
            >
              CLOSE BORDERS
            </button>
            <button
              onClick={() => handleBorderPolicy('CAMPS')}
              className="bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/15 rounded text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer"
            >
              REFUGEE CAMPS
            </button>
            <button
              onClick={() => handleBorderPolicy('DEPORT')}
              className="bg-transparent border border-red-600 text-red-500 hover:bg-red-500/15 rounded text-[10px] font-bold uppercase tracking-wider py-2 cursor-pointer"
            >
              DEPORTATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
