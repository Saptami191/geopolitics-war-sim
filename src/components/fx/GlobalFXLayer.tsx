import React, { useEffect, useRef } from 'react';
import { useFxStore } from '../../store/fxStore';
import { audio } from '../../utils/audio';

export default function GlobalFXLayer() {
  const {
    activeFx,
    globalScreenShakeIntensity,
    nuclearFlashActive,
    coupGlitchActive,
    ceasefireGlowActive,
  } = useFxStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playedRefs = useRef<Set<string>>(new Set());

  // Setup sound playing and screen filter triggers on event triggers
  useEffect(() => {
    const unconsumed = activeFx.filter((fx) => !fx.consumed);
    unconsumed.forEach((fx) => {
      if (!playedRefs.current.has(fx.id)) {
        playedRefs.current.add(fx.id);

        // Sound trigger
        audio.resume();
        if (fx.type === 'NUCLEAR_DETONATION') {
          audio.sfxMissileImpact();
          audio.sfxCrisisWarning();
          
          // Screen flash filter
          const root = document.getElementById('sovereign-fx-shake-root');
          if (root) {
            root.style.filter = 'brightness(2.5) saturate(0)';
            root.style.transition = 'filter 0.05s ease';
            setTimeout(() => {
              root.style.filter = 'brightness(0.5) contrast(1.5) sepia(0.5) saturate(2.5) hue-rotate(-20deg)';
              setTimeout(() => {
                root.style.filter = '';
                root.style.transition = '';
              }, 2000);
            }, 800);
          }
        } else if (fx.type === 'COUP_SUCCESS' || fx.type === 'REGIME_CHANGE') {
          audio.sfxCoupStaticBurst();
        } else if (fx.type === 'CEASEFIRE_SIGNED' || fx.type === 'PEACE_TREATY_RATIFIED') {
          audio.sfxPeaceResolution();
        } else if (fx.type === 'MISSILE_LAUNCH') {
          audio.sfxMissileLaunch();
        } else if (fx.type === 'MISSILE_INTERCEPT') {
          audio.sfxIntercept();
        } else if (fx.type === 'WAR_DECLARED' || fx.type === 'DEFCON_ESCALATION') {
          audio.sfxKlaxon();
        } else if (fx.type === 'PERSONA_PROMOTED') {
          audio.sfxIntelChime();
        }
      }
    });

    if (playedRefs.current.size > 100) {
      playedRefs.current.clear();
    }
  }, [activeFx]);

  // Screen shake animation frame loop
  useEffect(() => {
    let rafId: number;
    const updateShake = () => {
      const shakeIntensity = useFxStore.getState().globalScreenShakeIntensity;
      const root = document.getElementById('sovereign-fx-shake-root');
      if (root) {
        if (shakeIntensity > 0) {
          const x = (Math.random() - 0.5) * shakeIntensity * 12;
          const y = (Math.random() - 0.5) * shakeIntensity * 8;
          const rot = (Math.random() - 0.5) * shakeIntensity * 0.6;
          root.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
          useFxStore.getState().decayFxIntensities();
          rafId = requestAnimationFrame(updateShake);
        } else {
          root.style.transform = '';
        }
      } else {
        rafId = requestAnimationFrame(updateShake);
      }
    };

    if (globalScreenShakeIntensity > 0) {
      rafId = requestAnimationFrame(updateShake);
    } else {
      const root = document.getElementById('sovereign-fx-shake-root');
      if (root) root.style.transform = '';
    }

    return () => cancelAnimationFrame(rafId);
  }, [globalScreenShakeIntensity]);

  // Green phosphor canvas logic for coupGlitchActive
  useEffect(() => {
    if (!coupGlitchActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (time: number) => {
      if (time - lastTime > 80) { // refresh every 80ms
        lastTime = time;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // draw random 1x1 noise at 5% density
        ctx.fillStyle = '#00ff44';
        const numPixels = Math.floor((w * h) * 0.05);
        for (let i = 0; i < numPixels; i++) {
          const x = Math.floor(Math.random() * w);
          const y = Math.floor(Math.random() * h);
          ctx.fillRect(x, y, 1, 1);
        }

        // draw occasional horizontal static line bursts
        if (Math.random() > 0.4) {
          ctx.fillStyle = 'rgba(0, 255, 68, 0.15)';
          const bandY = Math.floor(Math.random() * h);
          ctx.fillRect(0, bandY, w, 40);
        }
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [coupGlitchActive]);

  // Compute highest severity outline border styles
  const activeUnconsumed = activeFx.filter((fx) => !fx.consumed);
  let highestSeverity: 'CATASTROPHIC' | 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
  if (activeUnconsumed.length > 0) {
    const severities = activeUnconsumed.map((fx) => fx.severity);
    if (severities.includes('CATASTROPHIC')) highestSeverity = 'CATASTROPHIC';
    else if (severities.includes('HIGH')) highestSeverity = 'HIGH';
    else if (severities.includes('MEDIUM')) highestSeverity = 'MEDIUM';
    else if (severities.includes('LOW')) highestSeverity = 'LOW';
  }

  let borderClasses = 'fixed inset-0 pointer-events-none transition-all duration-800 z-[999] border-[12px] border-transparent';
  if (highestSeverity === 'CATASTROPHIC') {
    borderClasses = 'fixed inset-0 border-[12px] border-red-600/70 pointer-events-none z-[999] animate-pulse-fx-extreme duration-800';
  } else if (highestSeverity === 'HIGH') {
    borderClasses = 'fixed inset-0 border-[12px] border-orange-500/50 pointer-events-none z-[999] animate-pulse-fx-slow duration-1000';
  } else if (highestSeverity === 'MEDIUM') {
    borderClasses = 'fixed inset-0 border-[12px] border-yellow-500/30 pointer-events-none z-[999]';
  } else if (highestSeverity === 'LOW') {
    borderClasses = 'fixed inset-0 border-[12px] border-[#00ff44]/20 pointer-events-none z-[999]';
  }

  return (
    <>
      {/* LAYER 1: NUCLEAR FLASH */}
      {nuclearFlashActive && (
        <div className="fixed inset-0 z-[9000] pointer-events-none mix-blend-screen animate-nuke-flash" />
      )}

      {/* LAYER 2: COUP GLITCH / REGIME CHANGE */}
      {coupGlitchActive && (
        <div className="fixed inset-0 z-[8500] pointer-events-none overflow-hidden animate-crt-flicker">
          {/* TV Break overlay background */}
          <div className="absolute inset-0 bg-black/45" />
          
          {/* Green phosphor noise Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 mix-blend-screen pointer-events-none" />

          {/* Glitch sliding scanline bars */}
          <div className="absolute left-0 right-0 bg-white/20 animate-scanline-bar-1 opacity-60" style={{ height: '3px' }} />
          <div className="absolute left-0 right-0 bg-[#00ff44]/20 animate-scanline-bar-2 opacity-80" style={{ height: '5px' }} />
          <div className="absolute left-0 right-0 bg-white/10 animate-scanline-bar-3 opacity-40" style={{ height: '2px' }} />
        </div>
      )}

      {/* LAYER 3: CEASEFIRE / PEACE GLOW */}
      {ceasefireGlowActive && (
        <div className="fixed inset-0 z-[7000] pointer-events-none flex flex-col items-center justify-center">
          <div className="absolute inset-0 animate-peace-glow" style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 200, 80, 0.18) 0%, rgba(255, 220, 100, 0.08) 40%, transparent 70%)'
          }} />
          <div className="z-10 animate-peace-banner text-center">
            <div className="text-[#ffd700] font-mono tracking-[0.5em] text-[10px] font-bold bg-black/85 px-6 py-2.5 border border-[#ffd700]/30 shadow-[0_0_20px_rgba(255,193,7,0.25)]">
              ✦ PEACE ACCORD RATIFIED ✦
            </div>
          </div>
        </div>
      )}

      {/* LAYER 5: GLOBAL HUD NOISE VIGNETTE */}
      <div className={borderClasses} />

      {/* LAYER 6: ACTIVE FX EVENT TICKER */}
      <div id="fx-event-ticker" className="fixed bottom-3 left-3 z-[8000] pointer-events-none flex flex-col gap-1.5 max-w-[280px]">
        {activeFx.filter(f => !f.consumed).slice(-3).map((fx) => {
          let emoji = '⚡';
          if (fx.type === 'NUCLEAR_DETONATION') emoji = '☢';
          else if (fx.type === 'MISSILE_LAUNCH') emoji = '🚀';
          else if (fx.type === 'MISSILE_INTERCEPT') emoji = '🛰';
          else if (fx.type === 'COUP_SUCCESS' || fx.type === 'REGIME_CHANGE') emoji = '✊';
          else if (fx.type === 'CEASEFIRE_SIGNED' || fx.type === 'PEACE_TREATY_RATIFIED') emoji = '🕊';
          
          let alertColor = 'border-amber-500/50 text-amber-500';
          if (fx.severity === 'CATASTROPHIC' || fx.severity === 'HIGH') {
            alertColor = 'border-red-500 text-red-500';
          } else if (fx.severity === 'LOW') {
            alertColor = 'border-emerald-500 text-emerald-400';
          }

          return (
            <div
              key={fx.id}
              className={`bg-black/95 border px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase flex items-center justify-between gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-slide-in-fx ${alertColor}`}
            >
              <span className="truncate flex items-center gap-1.5">
                <span className="text-[10px]">{emoji}</span>
                <span className="font-bold">{fx.type.replace(/_/g, ' ')}</span>
              </span>
              <span className="opacity-60 shrink-0 text-[7px]">
                T:{(fx.triggerTick || 0).toString().padStart(4, '0')}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
