import React, { useEffect, useRef, useState } from 'react';
import { SCENARIOS } from '../../data/scenarios';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { initScenario } from '../../sim/scenarioEngine';
import { restartTickTimer } from '../../sim/tickEngine';
import { ScenarioId } from '../../types';
import { audio } from '../../utils/audio';

interface GameLobbyProps {
  onStartScenario: (id: ScenarioId, countryId: string) => void;
  onOpenWorldBuilder: () => void;
}

export default function GameLobby({ onStartScenario, onOpenWorldBuilder }: GameLobbyProps) {
  const [activeTab, setActiveTab] = useState<'SCENARIOS' | 'SANDBOX'>('SCENARIOS');
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Rotating D3-like wireframe globe inside lobby using canvas
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const radius = 80;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const render = () => {
      ctx.fillStyle = '#030603';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sphere concentric parallels
      ctx.strokeStyle = '#005511';
      ctx.lineWidth = 0.5;

      angle += 0.01;

      // Latitude circles
      for (let lat = -80; lat <= 80; lat += 20) {
        const r = radius * Math.cos((lat * Math.PI) / 180);
        const y = radius * Math.sin((lat * Math.PI) / 180);

        ctx.beginPath();
        for (let deg = 0; deg <= 360; deg += 10) {
          const rad = (deg * Math.PI) / 180;
          const rotX = r * Math.sin(rad + angle);
          const rotZ = r * Math.cos(rad + angle);

          if (rotZ >= 0) {
            const sx = cx + rotX;
            const sy = cy + y;
            if (deg === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }

      // Longitudes meridians
      ctx.strokeStyle = 'rgba(0, 255, 68, 0.35)';
      for (let lon = 0; lon < 180; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 10) {
          const radLat = (lat * Math.PI) / 180;
          const radLon = ((lon + angle * 57.2) * Math.PI) / 180;
          const rotX = radius * Math.cos(radLat) * Math.cos(radLon);
          const rotY = radius * Math.sin(radLat);
          const rotZ = radius * Math.cos(radLat) * Math.sin(radLon);

          if (rotZ >= 0) {
            const sx = cx + rotX;
            const sy = cy + rotY;
            if (lat === -90) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleScenarioInit = (id: ScenarioId, countryId: string) => {
    audio.sfxKeyClick();
    onStartScenario(id, countryId);
  };

  return (
    <div className="absolute inset-0 bg-[#020402] flex items-center justify-center p-6 overflow-hidden">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 border border-[#1a5c1a] bg-[#030603] p-6 shadow-2xl rounded text-green-400 select-none">
        
        {/* Left Column (40%): Rotating Globe & Status Information */}
        <div className="md:col-span-4 flex flex-col items-center justify-between border-r border-[#1a5c1a] pr-6">
          <div className="w-full text-center md:text-left">
            <h1 className="text-xl font-bold tracking-widest text-[#00ff44] uppercase leading-none text-shadow font-display">
              Sovereign Command
            </h1>
            <h2 className="text-[10px] tracking-widest uppercase text-[#00e5ff] font-bold mt-1">
              Geopolitical Theater Matrix v3.0
            </h2>
            <div className="h-[1px] bg-[#0d2e0d] my-4" />
          </div>

          <div className="my-2 flex flex-col items-center">
            <canvas ref={globeCanvasRef} width={200} height={200} className="border border-[#0d2e0d] bg-[#020402]" />
            <span className="text-[8px] font-mono text-green-700 mt-2 uppercase tracking-widest">
              SATELLITE CONST_GRID LEVEL: ORBITAL SECURED
            </span>
          </div>

          <div className="w-full text-xs font-mono space-y-2 border-t border-[#0d2e0d] pt-4 mt-2">
            <div className="flex justify-between">
              <span className="text-green-600">SECTOR STATUS:</span>
              <span className="text-white">STANDBY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">THREAT POSTURE:</span>
              <span className="text-red-500 font-bold blink-hud">DEFCON-3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">ENCRYPTION KEY:</span>
              <span className="text-cyan-400">SIGMA-OMEGA-9</span>
            </div>
            <div className="text-[9px] text-gray-500 text-center uppercase pt-4">
              Authorized operators strictly. Access logged.
            </div>
          </div>
        </div>

        {/* Right Column (60%): Tab content (Briefings vs Sandbox Config) */}
        <div className="md:col-span-8 flex flex-col pl-2">
          {/* Tabs */}
          <div className="flex border-b border-[#1a5c1a] mb-6">
            <button
              onClick={() => { audio.sfxKeyClick(); setActiveTab('SCENARIOS'); }}
              className={`px-6 py-2 text-xs font-bold font-display uppercase tracking-wider cursor-pointer border-b-2 transition-all ${activeTab === 'SCENARIOS' ? 'border-[#00ff44] text-[#00ff44] bg-[#071407]' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              SCENARIO BRIEFINGS
            </button>
            <button
              onClick={() => { audio.sfxKeyClick(); setActiveTab('SANDBOX'); }}
              className={`px-6 py-2 text-xs font-bold font-display uppercase tracking-wider cursor-pointer border-b-2 transition-all ${activeTab === 'SANDBOX' ? 'border-[#00ff44] text-[#00ff44] bg-[#071407]' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              SANDBOX SIMULATION
            </button>
          </div>

          {/* Scenarios Grid */}
          {activeTab === 'SCENARIOS' ? (
            <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(SCENARIOS).map((sc) => (
                  <div
                    key={sc.id}
                    className="border border-[#1a5c1a] bg-[#040804] p-4 flex flex-col justify-between rounded hover:border-[#00ff44] transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-center border-b border-[#0d2e0d] pb-2 mb-2">
                        <span className="text-[#00e5ff] font-bold text-xs uppercase tracking-wide">
                          {sc.name}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 border font-bold ${sc.difficulty === 'EXPERT' ? 'border-red-600 text-red-500' : sc.difficulty === 'HARD' ? 'border-orange-500 text-orange-400' : 'border-yellow-500 text-yellow-400'}`}>
                          {sc.difficulty}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug lowercase first-letter:uppercase mb-3">
                        {sc.description}
                      </p>
                    </div>

                    <div className="space-y-3 font-mono border-t border-[#0d2e0d] pt-2">
                      <div className="text-[9px] text-gray-500 uppercase">
                        <span className="text-red-500 font-bold">TACTICAL GOAL:</span> {sc.winDescription}
                      </div>

                      {/* Dropdown/Country Picker for scenario countries */}
                      <div className="flex gap-1 overflow-x-auto py-1">
                        {sc.playableCountryIds.map((cId) => (
                          <button
                            key={cId}
                            onClick={() => handleScenarioInit(sc.id, cId)}
                            className="bg-[#0c2e0c] hover:bg-[#00ff44] hover:text-black border border-[#1a5c1a] text-[9px] px-2 py-1 font-bold rounded cursor-pointer uppercase transition-all shrink-0"
                          >
                            PLAY AS {cId}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-[#1a5c1a] bg-[#030603] rounded">
              <h3 className="text-[#00ff44] font-bold text-sm tracking-widest uppercase font-display mb-2">
                UNLIMITED SANDBOX CODES
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
                Unlimited duration. You define starting resources, geopolitical tensions, and global doctrine constraints. History is yours to write.
              </p>
              <button
                onClick={() => { audio.sfxKeyClick(); onOpenWorldBuilder(); }}
                className="px-8 py-3 border-2 border-[#00ff44] hover:bg-[#00ff44]/15 hover:shadow-lg text-xs font-bold tracking-widest uppercase font-mono cursor-pointer rounded animate-pulse"
              >
                SETUP & INITIATE SANDBOX
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
