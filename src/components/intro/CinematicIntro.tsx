import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { audio } from '../../utils/audio';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [act, setAct] = useState<1 | 2 | 3>(1);
  const [briefedText, setBriefedText] = useState('');
  const [tick, setTick] = useState(0);

  const fullBriefingLines = [
    '> INITIALIZING SOVEREIGN COMMAND SIMULATOR v3.0',
    '> CLEARANCE LEVEL: COSMIC TOP SECRET',
    '> AUTHORIZATION CODE: SIGMA-9-OMEGA-LOCK',
    '> THEATER STATUS: 4 ACTIVE GEOPOLITICAL CONFLICTS DETECTED',
    '> NUCLEAR POSTURE: ELEVATED DEFCON STATUS',
    '> ALL ORBITAL WEAPONS AND SATELLITE CHANNELS: STANDBY',
    '> AWAITING COMMANDER DIRECTIVE INPUT...',
    '█'
  ];

  // Act controller timers
  useEffect(() => {
    audio.resume();
    audio.startAmbientScore();

    // Act 1: Globe rotates (0 - 3s)
    const t1 = setTimeout(() => {
      setAct(2); // Shatter
      audio.sfxKlaxon();
    }, 3000);

    // Act 2: Shatter lasts 800ms (3s - 3.8s)
    const t2 = setTimeout(() => {
      setAct(3); // Start briefing typing
    }, 3850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Text briefing typewriter effect
  useEffect(() => {
    if (act !== 3) return;

    let lineIndex = 0;
    let charIndex = 0;
    let currentText = '';

    const interval = setInterval(() => {
      if (lineIndex < fullBriefingLines.length) {
        const line = fullBriefingLines[lineIndex];
        if (charIndex < line.length) {
          currentText += line[charIndex];
          setBriefedText(currentText);
          audio.sfxTypeChar();
          charIndex++;
        } else {
          currentText += '\n';
          setBriefedText(currentText);
          lineIndex++;
          charIndex = 0;
        }
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [act]);

  // Canvas ortho rendering animation for Globe and Shatter
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;
    let angle = 0;
    let shatterTime = 0;

    // Create wireframe sphere points
    const points: { x: number; y: number; z: number }[] = [];
    const radius = 220;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Generate grid of points on sphere
    for (let lat = -90; lat <= 90; lat += 15) {
      const radLat = (lat * Math.PI) / 180;
      const cosLat = Math.cos(radLat);
      const sinLat = Math.sin(radLat);

      for (let lon = 0; lon < 360; lon += 15) {
        const radLon = (lon * Math.PI) / 180;
        const x = radius * cosLat * Math.cos(radLon);
        const y = radius * sinLat;
        const z = radius * cosLat * Math.sin(radLon);
        points.push({ x, y, z });
      }
    }

    // Shards for disintegration
    const shards = Array.from({ length: 40 }).map((_, idx) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        vx: (Math.random() * 6 - 3) * 3,
        vy: (Math.random() * 6 - 3) * 3,
        vz: (Math.random() * 4 - 2) * 3,
        size: Math.random() * 25 + 15,
        alpha: 1
      };
    });

    const draw = () => {
      ctx.fillStyle = '#020402';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // CRT Scanlines visual effect overlay
      ctx.strokeStyle = '#071407';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      if (act === 1) {
        angle += 0.015;

        // Draw orthographic projected rotating globe lines
        ctx.strokeStyle = '#00ff44';
        ctx.lineWidth = 1.0;
        ctx.shadowColor = '#00ff44';
        ctx.shadowBlur = 10;

        // Project and Draw latitude circles
        for (let lat = -90; lat <= 90; lat += 20) {
          const r = radius * Math.cos((lat * Math.PI) / 180);
          const y = radius * Math.sin((lat * Math.PI) / 180);
          
          ctx.beginPath();
          for (let deg = 0; deg <= 360; deg += 5) {
            const rad = (deg * Math.PI) / 180;
            const rotX = r * Math.cos(rad + angle);
            const rotZ = r * Math.sin(rad + angle);

            if (rotZ >= 0) { // Ortho back-face Culling simplified
              const screenX = centerX + rotX;
              const screenY = centerY + y;
              if (deg === 0) ctx.moveTo(screenX, screenY);
              else ctx.lineTo(screenX, screenY);
            }
          }
          ctx.stroke();
        }

        // Draw longitude lines
        for (let lon = 0; lon < 180; lon += 24) {
          ctx.beginPath();
          for (let lat = -90; lat <= 90; lat += 5) {
            const radLat = (lat * Math.PI) / 180;
            const radLon = ((lon + angle * 57.3) * Math.PI) / 180;
            const rotX = radius * Math.cos(radLat) * Math.cos(radLon);
            const rotY = radius * Math.sin(radLat);
            const rotZ = radius * Math.cos(radLat) * Math.sin(radLon);

            if (rotZ >= 0) {
              const screenX = centerX + rotX;
              const screenY = centerY + rotY;
              if (lat === -90) ctx.moveTo(screenX, screenY);
              else ctx.lineTo(screenX, screenY);
            }
          }
          ctx.stroke();
        }

        // Reset shadows
        ctx.shadowBlur = 0;

      } else if (act === 2) {
        shatterTime += 1;

        // Shattering animation of triangles expanding outwards
        ctx.shadowBlur = 15;
        shards.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.alpha = Math.max(0, 1 - shatterTime / 40);

          ctx.fillStyle = `rgba(0, 255, 68, ${s.alpha})`;
          ctx.strokeStyle = `rgba(0, 255, 68, ${s.alpha * 0.8})`;
          ctx.shadowColor = '#00ff44';

          ctx.beginPath();
          ctx.moveTo(centerX + s.x, centerY + s.y);
          ctx.lineTo(centerX + s.x + s.size, centerY + s.y - s.size / 2);
          ctx.lineTo(centerX + s.x + s.size / 2, centerY + s.y + s.size);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });

        // Upward horizontal scanning phosphor sweep wave
        const sweepY = canvas.height - (shatterTime * (canvas.height / 35));
        ctx.fillStyle = 'rgba(0, 255, 100, 0.4)';
        ctx.fillRect(0, sweepY - 15, canvas.width, 30);
        ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';
        ctx.fillRect(0, sweepY - 50, canvas.width, 100);

        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [act]);

  return (
    <div className="absolute inset-0 z-50 bg-[#020402] flex flex-col justify-center items-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Skipping command */}
      <button
        onClick={() => { audio.sfxKeyClick(); onComplete(); }}
        className="absolute bottom-6 right-6 z-50 px-4 py-1.5 border border-[#1a3a1a] text-[#00ff44] hover:border-[#00ff44] hover:bg-[#060f06] transition-colors rounded text-[10px] tracking-widest font-mono cursor-pointer uppercase font-bold"
      >
        SKIP CINEMATIC &gt;&gt;
      </button>

      {/* Act 3 typing classified console */}
      {act === 3 && (
        <div className="relative z-10 w-full max-w-2xl px-6 py-8 border border-[#1a3a1a] bg-[#030603]/90 backdrop-blur shadow-2xl rounded text-left">
          <div className="text-[10px] uppercase font-bold text-[#00e5ff] tracking-widest border-b border-[#1a3a1a] pb-2 mb-4 flex justify-between select-none">
            <span>📡 DECRYPTED METRIC BROADCST RECONNAISSANCE</span>
            <span className="text-red-500 blink-hud">● WARNING DEFCON POSTURE LEVEL 2</span>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed text-[#00ff44] whitespace-pre-wrap select-none">
            {briefedText}
          </pre>

          {briefedText.length >= fullBriefingLines.join('\n').length - 5 && (
            <div className="mt-8 pt-4 border-t border-[#1a3a1a] flex justify-center">
              <button
                onClick={() => { audio.sfxKlaxon(); onComplete(); }}
                className="px-6 py-2 border-2 border-[#00ff44] bg-transparent text-[#00ff44] hover:bg-[#00ff44]/15 hover:shadow-lg transition-all text-xs tracking-widest font-bold font-mono cursor-pointer rounded animate-pulse"
              >
                INITIALIZE COMMAND DECOMMISSION
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
