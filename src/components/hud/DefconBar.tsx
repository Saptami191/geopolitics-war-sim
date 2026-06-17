import React, { useState, useEffect, useRef } from 'react';
import { useDefconStore, DEFCON_PALETTES, DefconLevel } from '../../store/defconStore';
import { useClockStore } from '../../store/clockStore';
import { usePlayerStore } from '../../store/playerStore';
import { PERSONAS } from '../../config/defconRegistry';
import { fmtDate, fmtSession } from '../../utils/format';
import { RadiationCounter } from './RadiationCounter';
import { audio } from '../../utils/audio';

export const DefconBar: React.FC = () => {
  const currentDefcon = useDefconStore((state) => state.currentDefconLevel);
  const playerCountryId = usePlayerStore((state) => state.countryId);
  const activePersona = useDefconStore((state) => state.activePersona);
  const transitionHistory = useDefconStore((state) => state.transitionHistory);
  
  // Clocks
  const calendarDate = useClockStore((state) => state.currentCalendarDate);
  const sessionElapsed = useClockStore((state) => state.sessionElapsedSeconds);
  const currentTick = useClockStore((state) => state.currentTick);

  // Persona Promotion Banner State
  const [showPersonaBanner, setShowPersonaBanner] = useState(false);
  const [bannerPersona, setBannerPersona] = useState(activePersona);
  const prevPersonaRef = useRef(activePersona);

  useEffect(() => {
    if (activePersona !== prevPersonaRef.current) {
      setBannerPersona(activePersona);
      setShowPersonaBanner(true);
      prevPersonaRef.current = activePersona;
      const t = setTimeout(() => {
        setShowPersonaBanner(false);
      }, 3000); // 3 seconds
      return () => clearTimeout(t);
    }
  }, [activePersona]);

  const levels = [
    { value: 5, name: 'PEACE' },
    { value: 4, name: 'WATCH' },
    { value: 3, name: 'ELEVATED' },
    { value: 2, name: 'ARMED' },
    { value: 1, name: 'NUCLEAR' },
  ];

  // Tooltip helper
  const getTooltipAndHistory = (lvlValue: number) => {
    const log = transitionHistory.find((h) => h.toLevel === lvlValue);
    if (log) {
      return `T:${String(log.tick).padStart(4, '0')} | ${log.reason} [${log.source}]`;
    }
    return `DEFCON STATUS LEVEL ${lvlValue} (PEACETIME NOMINAL STATUS)`;
  };

  // Glow classes and custom bar pulsing
  let barEffectsClass = '';
  let borderStyle = '2.5px solid var(--defcon-accent)';
  let shadowStyle = '0 2px 14px var(--defcon-accent-soft)';

  if (currentDefcon === 1) {
    barEffectsClass = 'animate-defcon-1-flicker bg-red-950/20';
    borderStyle = '3px solid #ff0022';
    shadowStyle = '0 0 25px rgba(255, 0, 34, 0.4), inset 0 0 15px rgba(255, 0, 34, 0.15)';
  } else if (currentDefcon === 2) {
    barEffectsClass = 'animate-defcon-2-pulse bg-orange-950/15';
    borderStyle = '2.5px solid #ff8c00';
    shadowStyle = '0 0 15px rgba(255, 140, 0, 0.25)';
  } else if (currentDefcon === 3) {
    barEffectsClass = 'animate-defcon-3-flicker';
    borderStyle = '1.5px solid #1a1a1a';
    shadowStyle = '0 0 10px rgba(245, 166, 35, 0.15)';
  }

  const glyphs: Record<string, string> = {
    ANALYST: '🔍',
    WATCH_OFFICER: '👁',
    CRISIS_LEAD: '⚔',
    JOINT_COMMANDER: '🎖',
    STRATEGIC_COMMAND: '☢',
  };

  const currentPersonaDef = PERSONAS[bannerPersona];

  return (
    <div className="w-full relative z-40 select-none">
      {/* Dynamic Main Action Bar */}
      <div 
        id="defcon-bar-root"
        className={`w-full bg-[#020502] relative py-2.5 px-4 flex flex-col md:flex-row justify-between items-center transition-all duration-300 gap-3 border-b ${barEffectsClass}`}
        style={{
          borderBottom: borderStyle,
          boxShadow: shadowStyle,
        }}
      >
        {/* Top micro line accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1.5px] opacity-70"
          style={{ backgroundColor: 'var(--defcon-accent)' }}
        />

        {/* HUD left brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span 
              className={`w-2 h-2 rounded-full inline-block ${currentDefcon === 1 ? 'bg-red-500 animate-ping-fast' : 'animate-pulse'}`} 
              style={{ 
                backgroundColor: currentDefcon === 1 ? '#ff0022' : 'var(--defcon-accent)', 
                boxShadow: 'var(--defcon-accent-glow)' 
              }} 
            />
            <span 
              className={`classification font-bold tracking-[0.25em] text-[10px] ${currentDefcon === 1 ? 'text-red-500 animate-pulse' : ''}`}
              style={{ 
                color: currentDefcon === 1 ? '#ff0022' : 'var(--defcon-accent)', 
                textShadow: '0 0 5px var(--defcon-accent)'
              }}
            >
              TOP SECRET SOVEREIGN COMMAND EYES ONLY
            </span>
          </div>
          
          <span className="chrome text-gray-700 font-bold hidden md:inline">/</span>
          
          <span className="chrome text-gray-300 text-[9px] font-black tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase hidden md:inline-block">
            COGNATE DIRECTORY: {playerCountryId || 'SEC-01'}
          </span>

          {currentDefcon === 1 && (
            <div className="overflow-hidden whitespace-nowrap w-44 text-[8px] tracking-widest text-[#ff3344] font-bold bg-red-950/40 px-2 py-0.5 border border-red-500/30 rounded-sm uppercase ml-2 select-none">
              <div className="inline-block animate-marquee">
                ⚠ NUCLEAR WAR PROTOCOLS ENGAGED ⚠ LAUNCH CODE GRANTED ⚠ ALL SILOS PRIMED ⚠ OVERWRITE SECURE ⚠&nbsp;
              </div>
            </div>
          )}
        </div>

        {/* DEFCON status pips and reactor status column */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-3 py-1 rounded-sm shadow-inner relative">
            <span className="chrome text-[8px] font-extrabold text-gray-500 tracking-widest">DEFCON APERTURE RANGE:</span>
            <div className="flex gap-1.5">
              {levels.map((lvl) => {
                const isActive = lvl.value === currentDefcon;
                const isPassed = lvl.value >= currentDefcon;
                const pipColor = DEFCON_PALETTES[lvl.value as DefconLevel].accent;
                
                return (
                  <div 
                    key={lvl.value}
                    id={`defcon-pip-btn-${lvl.value}`}
                    onClick={() => {
                      audio.sfxKeyClick();
                      useDefconStore.getState().setDefconLevel(lvl.value as any, 'PLAYER', 'Manual controller override request', currentTick);
                    }}
                    title={getTooltipAndHistory(lvl.value)}
                    className="flex flex-col items-center justify-center relative px-3 py-1 border rounded cursor-pointer transition-all min-w-[70px] select-none hover:bg-white/[0.02]"
                    style={{
                      borderColor: isActive ? pipColor : 'rgba(255, 255, 255, 0.04)',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
                      color: isActive ? pipColor : '#444c45',
                      opacity: isPassed ? 1 : 0.3,
                      boxShadow: isActive ? `0 0 8px ${pipColor}44` : 'none'
                    }}
                  >
                    {/* CSS Border-radius Radar sweeping scan loop */}
                    {isActive && (
                      <div 
                        className="absolute -inset-[1px] rounded border border-transparent animate-spin-slow pointer-events-none"
                        style={{ 
                          borderTopColor: pipColor,
                          animationDuration: '3s',
                          borderRadius: '4px'
                        }} 
                      />
                    )}

                    <div className="flex items-center gap-1">
                      <div 
                        className="w-[5px] h-[5px] rounded-full" 
                        style={{
                          backgroundColor: isActive ? pipColor : '#19241b',
                          boxShadow: isActive ? `0 0 6px ${pipColor}` : 'none'
                        }}
                      />
                      <span className="text-[10px] font-black leading-none">{lvl.value}</span>
                    </div>
                    <span className="text-[6.5px] font-black tracking-widest uppercase mt-0.5">{lvl.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REACTOR CORE STATUS CELLS */}
          <div className="flex items-center gap-2 px-3 py-0.5 bg-black/25 border border-white/5 rounded-sm select-none">
            <span className="text-[6.5px] text-gray-500 font-bold tracking-widest uppercase mr-1">REACTOR CORE CELLS:</span>
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((lvl) => {
                const isEscalated = lvl >= currentDefcon;
                const coreColor = DEFCON_PALETTES[lvl as DefconLevel].accent;
                return (
                  <div 
                    key={lvl}
                    className="relative flex items-center justify-center"
                    title={`Core Reactor Diagnostic: Cell ${lvl}`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${isEscalated ? 'animate-pulse-fx-fast' : 'opacity-20'}`}
                      style={{
                        background: isEscalated 
                          ? `radial-gradient(circle, ${coreColor} 0%, rgba(0,0,0,0.8) 80%)` 
                          : '#222',
                        boxShadow: isEscalated ? `0 0 10px ${coreColor}` : 'none',
                        border: `1px solid ${isEscalated ? coreColor : '#444'}`
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* HUD clock, telemetry indicators */}
        <div className="flex items-center gap-2.5 text-[9px]">
          <RadiationCounter />
          
          <div className="flex items-center gap-1.5 border border-white/5 bg-black/30 px-2.5 py-1 rounded">
            <span className="chrome text-gray-500 font-bold uppercase tracking-wider">📅 date:</span>
            <span className="data-inline font-black tracking-wider uppercase animate-pulse" style={{ color: 'var(--defcon-accent)' }}>{fmtDate(calendarDate)}</span>
          </div>
          
          <div className="flex items-center gap-1.5 border border-white/5 bg-black/30 px-2.5 py-1 rounded hidden lg:flex">
            <span className="chrome text-gray-500 font-bold uppercase tracking-wider">⏱ elapsed:</span>
            <span className="data-inline font-black tracking-widest text-[#00ff44]">{fmtSession(sessionElapsed)}</span>
          </div>

          <div className="flex items-center gap-1.5 border px-2.5 py-1 bg-[#0a100a]/70 rounded" style={{ borderColor: 'var(--defcon-accent)' }}>
            <span className="chrome text-gray-500 font-extrabold tracking-wider">TICK:</span>
            <span className="data-inline font-black tracking-widest animate-pulse" style={{ color: 'var(--defcon-accent)' }}>
              {String(currentTick).padStart(4, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* PERSONA PROMOTION SLIDING EXPAND BANNER */}
      {showPersonaBanner && currentPersonaDef && (
        <div 
          className="absolute left-0 right-0 top-[100%] z-[150] shadow-[0_10px_30px_rgba(0,0,0,0.95)] animate-slide-in-persona overflow-hidden"
          style={{
            borderBottom: `2px solid var(--defcon-accent)`,
            background: `linear-gradient(to bottom, var(--defcon-accent-soft), #000 85%)`
          }}
        >
          <div className="px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Persona card contents */}
            <div className="flex items-center gap-4">
              <div className="text-3xl p-2 bg-black/60 border rounded border-[var(--defcon-accent)] flex items-center justify-center animate-bounce-fx">
                {glyphs[bannerPersona] || '🎖'}
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[7.5px] font-black uppercase text-gray-400 bg-white/5 px-2 py-0.5 rounded tracking-widest">SOVEREIGN PROMOTION RATIFIED</span>
                  <span className="text-[7.5px] font-extrabold text-[#ffd700] tracking-widest">TIER {currentPersonaDef.authorityTier}/5 AUTHORITY</span>
                </div>
                <h3 className="text-sm font-black tracking-[0.2em] uppercase" style={{ color: 'var(--defcon-accent)' }}>
                  {currentPersonaDef.name}
                </h3>
                <p className="text-[8.5px] text-gray-400 font-medium tracking-wide">
                  {currentPersonaDef.description}
                </p>
              </div>
            </div>

            {/* Micro-data classification footer */}
            <div className="text-right flex flex-col items-center md:items-end justify-center">
              <div className="text-[10px] font-bold uppercase py-0.5 px-3 bg-black border border-red-500/40 text-red-400 tracking-widest animate-pulse">
                CLASSIFIED AUTH LEVEL ACTIVATED
              </div>
              <span className="text-[7px] text-gray-500 font-mono tracking-widest uppercase mt-1">
                SECURE HANDSHAKE KEY: {bannerPersona}_DIRECTIVE_{currentTick}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DefconBar;
