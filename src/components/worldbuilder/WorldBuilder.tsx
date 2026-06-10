import React, { useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { initScenario } from '../../sim/scenarioEngine';
import { restartTickTimer } from '../../sim/tickEngine';
import { audio } from '../../utils/audio';

interface WorldBuilderProps {
  onLaunchSandbox: (selectedCountryId: string, options: any) => void;
  onBack: () => void;
}

const POPULAR_NATIONS = [
  { id: 'US', name: 'United States', flag: '🇺🇸', continent: 'North America', gdp: 28000, desc: 'Global hyperpower' },
  { id: 'CN', name: 'China', flag: '🇨🇳', continent: 'Asia', gdp: 19000, desc: 'Industrial production giant' },
  { id: 'RU', name: 'Russia', flag: '🇷🇺', continent: 'Europe', gdp: 2100, desc: 'Siberian nuclear and energy core' },
  { id: 'IN', name: 'India', flag: '🇮🇳', continent: 'Asia', gdp: 3900, desc: 'Rapidly growing democratic hub' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe', gdp: 3100, desc: 'Advanced carrier threat capability' },
  { id: 'FR', name: 'France', flag: '🇫🇷', continent: 'Europe', gdp: 3000, desc: 'Independent strategic power' },
  { id: 'DE', name: 'Germany', flag: '🇩🇪', continent: 'Europe', gdp: 4500, desc: 'Industrial core of European zone' },
  { id: 'JP', name: 'Japan', flag: '🇯🇵', continent: 'Asia', gdp: 4200, desc: 'High-tech military defense island' },
  { id: 'KR', name: 'South Korea', flag: '🇰🇷', continent: 'Asia', gdp: 1800, desc: 'Semiconductor fab specialist' },
  { id: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', continent: 'Middle East', gdp: 1100, desc: 'Petrochemical critical leverage' },
  { id: 'IL', name: 'Israel', flag: '🇮🇱', continent: 'Middle East', gdp: 520, desc: 'Sub-metric iron shield canopy' },
  { id: 'TW', name: 'Taiwan', flag: '🇹🇼', continent: 'Asia', gdp: 790, desc: 'Silicon fabrication island flashpoint' },
  { id: 'UA', name: 'Ukraine', flag: '🇺🇦', continent: 'Europe', gdp: 160, desc: 'Active European perimeter defense' },
  { id: 'BR', name: 'Brazil', flag: '🇧🇷', continent: 'South America', gdp: 2100, desc: 'Green resource giant' },
  { id: 'ZA', name: 'South Africa', flag: '🇿🇦', continent: 'Africa', gdp: 400, desc: 'Sub-Saharan extraction hub' },
];

export default function WorldBuilder({ onLaunchSandbox, onBack }: WorldBuilderProps) {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [tensionPreset, setTensionPreset] = useState<'COLD_PEACE' | 'SIMMERING' | 'WORLD_ON_EDGE' | 'INFERNO'>('SIMMERING');
  const [multiplier, setMultiplier] = useState<'REALISTIC' | 'EMPOWERED' | 'CRISIS'>('REALISTIC');
  const [aiAggression, setAiAggression] = useState(2); // 1 = passive, 2 = balanced, 3 = apocalyptic
  const [substateActivity, setSubstateActivity] = useState<'DORMANT' | 'ACTIVE' | 'SURGING'>('ACTIVE');

  const handleLaunch = () => {
    audio.sfxKlaxon();
    onLaunchSandbox(selectedCountry, {
      tensionPreset,
      spendingMultiplier: multiplier === 'EMPOWERED' ? 3.0 : multiplier === 'CRISIS' ? 0.5 : 1.0,
      aiAggression,
      substateActivity
    });
  };

  return (
    <div className="absolute inset-0 bg-[#020402] flex flex-col justify-between p-6 overflow-hidden select-none text-green-400 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1a5c1a] pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { audio.sfxKeyClick(); onBack(); }}
            className="text-gray-500 hover:text-white px-2 py-1 border border-transparent hover:border-[#1a5c1a] text-[10px] uppercase font-bold"
          >
            &lt; RETURN TO LOBBY
          </button>
          <span className="text-[#00ff44] text-xs font-bold font-display uppercase tracking-wider">
            Sovereign Command Sandbox Configuration Matrix
          </span>
        </div>
        <span className="text-[9px] text-[#00e5ff] tracking-widest font-bold Header-Tag">CLEARANCE: COSMIC TOP SECRET</span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 py-6 overflow-hidden min-h-0">
        
        {/* Column 1: Choose Your Nation */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col min-h-0 rounded">
          <h3 className="text-xs uppercase font-bold border-b border-[#1a5c1a] pb-2 mb-3 text-[#00e5ff]">
            🚩 1. SELECT COGNATE NATION
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {POPULAR_NATIONS.map((n) => {
              const isSelected = n.id === selectedCountry;
              return (
                <div
                  key={n.id}
                  onClick={() => { audio.sfxKeyClick(); setSelectedCountry(n.id); }}
                  className={`border p-2.5 rounded cursor-pointer transition-all ${isSelected ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black hover:border-green-800'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs uppercase text-white">
                      {n.flag} {n.name}
                    </span>
                    <span className="text-[8px] px-1 bg-[#1a4a1a] text-[#00ff44] rounded">
                      {n.id}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 uppercase">
                    GDP: ${(n.gdp / 1000).toFixed(1)}T | {n.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: World Tension Presets */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col rounded">
          <h3 className="text-xs uppercase font-bold border-b border-[#1a5c1a] pb-2 mb-3 text-[#00e5ff]">
            ⚡ 2. WORLDBULDER CONFLICT POSTURE
          </h3>
          <div className="space-y-4">
            <div
              onClick={() => { audio.sfxKeyClick(); setTensionPreset('COLD_PEACE'); }}
              className={`border p-3 rounded cursor-pointer ${tensionPreset === 'COLD_PEACE' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-white text-xs font-bold uppercase">COLD PEACE</div>
              <p className="text-[9px] text-gray-400 mt-1 lowercase first-letter:uppercase">
                Allopinions stabilized. Basic trade networks fully functional, with no active wars anywhere.
              </p>
            </div>

            <div
              onClick={() => { audio.sfxKeyClick(); setTensionPreset('SIMMERING'); }}
              className={`border p-3 rounded cursor-pointer ${tensionPreset === 'SIMMERING' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-white text-xs font-bold uppercase">SIMMERING TENSIONS</div>
              <p className="text-[9px] text-gray-400 mt-1 lowercase first-letter:uppercase">
                Initial regional conflicts starting to cook. Some flashpoints active with baseline friction.
              </p>
            </div>

            <div
              onClick={() => { audio.sfxKeyClick(); setTensionPreset('WORLD_ON_EDGE'); }}
              className={`border p-3 rounded cursor-pointer ${tensionPreset === 'WORLD_ON_EDGE' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-white text-xs font-bold uppercase">WORLD ON EDGE</div>
              <p className="text-[9px] text-gray-400 mt-1 lowercase first-letter:uppercase">
                Severe active military operations. Multiple superpowers mobilized. High internal unrest.
              </p>
            </div>

            <div
              onClick={() => { audio.sfxKeyClick(); setTensionPreset('INFERNO'); }}
              className={`border p-3 rounded cursor-pointer ${tensionPreset === 'INFERNO' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-white text-xs font-bold uppercase">INFERNO</div>
              <p className="text-[9px] text-red-500 mt-1 lowercase first-letter:uppercase font-bold">
                SUPERPOWER ALIGNMENTS SEVERED. 8+ GLOBAL ACTIVE WARS AND MULTIPLE NATION THREAT CODES LEVEL RED.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Resource Multiplier */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col rounded">
          <h3 className="text-xs uppercase font-bold border-b border-[#1a5c1a] pb-2 mb-3 text-[#00e5ff]">
            💵 3. STARTING RESOURCES MULTIPLIER
          </h3>
          <div className="space-y-4">
            <div
              onClick={() => { audio.sfxKeyClick(); setMultiplier('REALISTIC'); }}
              className={`border p-3 rounded cursor-pointer ${multiplier === 'REALISTIC' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-white text-xs font-bold uppercase">REALISTIC MULTIPLIER</div>
              <p className="text-[9px] text-gray-400 mt-1 lowercase first-letter:uppercase">
                Seeded properties conforming to absolute 2025 realistic values for GDP and treasury resources.
              </p>
            </div>

            <div
              onClick={() => { audio.sfxKeyClick(); setMultiplier('EMPOWERED'); }}
              className={`border p-3 rounded cursor-pointer ${multiplier === 'EMPOWERED' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-[#00ff44] text-xs font-bold uppercase">EMPOWERED (3.0X)</div>
              <p className="text-[9px] text-gray-400 mt-1 lowercase first-letter:uppercase">
                Your sovereign starts with 3x treasury gold reserves and 1.5x missile ammunition stockpile.
              </p>
            </div>

            <div
              onClick={() => { audio.sfxKeyClick(); setMultiplier('CRISIS'); }}
              className={`border p-3 rounded cursor-pointer ${multiplier === 'CRISIS' ? 'border-[#00ff44] bg-[#071707]' : 'border-[#0d2e0d] bg-black'}`}
            >
              <div className="text-red-500 text-xs font-bold uppercase">CRISIS PENALTY (0.5X)</div>
              <p className="text-[9px] text-red-400 mt-1 lowercase first-letter:uppercase">
                Severe budget compression. 50% cash penalty, elevated starting public unrest.
              </p>
            </div>
          </div>
        </div>

        {/* Column 4: Advanced Options */}
        <div className="border border-[#1a5c1a] bg-[#030603] p-4 flex flex-col rounded justify-between">
          <div>
            <h3 className="text-xs uppercase font-bold border-b border-[#1a5c1a] pb-2 mb-3 text-[#00e5ff]">
              🛠 4. ADVANCED POSTURE OPTIONS
            </h3>

            <div className="space-y-4 mt-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">AI Aggression:</label>
                <div className="flex gap-1 justify-between">
                  {['PASSIVE', 'BALANCED', 'HAWKISH'].map((val, idx) => (
                    <button
                      key={val}
                      onClick={() => { audio.sfxKeyClick(); setAiAggression(idx + 1); }}
                      className={`text-[9px] flex-1 px-1 py-1 border font-bold cursor-pointer rounded ${aiAggression === idx + 1 ? 'border-[#00ff44] bg-[#071707] text-[#00ff44]' : 'border-[#0d2e0d] text-gray-500 hover:text-white'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Sub-State Activity:</label>
                <div className="flex gap-1 justify-between">
                  {['DORMANT', 'ACTIVE', 'SURGING'].map((val) => (
                    <button
                      key={val}
                      onClick={() => { audio.sfxKeyClick(); setSubstateActivity(val as any); }}
                      className={`text-[9px] flex-1 px-1 py-1 border font-bold cursor-pointer rounded ${substateActivity === val ? 'border-[#00ff44] bg-[#071707] text-[#00ff44]' : 'border-[#0d2e0d] text-gray-500 hover:text-white'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#0d2e0d] pt-4">
            <button
              onClick={handleLaunch}
              className="w-full py-3 border-2 border-[#00ff44] hover:bg-[#00ff44]/15 hover:shadow-lg text-xs font-bold font-display uppercase tracking-wider text-[#00ff44] cursor-pointer rounded animate-pulse"
            >
              LAUNCH SIMULATION
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
