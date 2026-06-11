import { audio } from './audio';

export function playGlobeTransition(onComplete?: () => void) {
  // Ensure we don't duplicate transition canvases
  const existing = document.getElementById('globe-transition-canvas');
  if (existing) {
    existing.remove();
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'globe-transition-canvas';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    background: transparent;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (onComplete) onComplete();
    return;
  }

  const W = canvas.width;
  const H = canvas.height;
  const startTime = performance.now();
  const DURATION = 2200; // total duration 2.2s

  // SFX triggers
  audio.sfxRadarPing();
  setTimeout(() => {
    audio.sfxKlaxon();
  }, 900);

  function frame(now: number) {
    const t = Math.min((now - startTime) / DURATION, 1);
    ctx!.clearRect(0, 0, W, H);

    // Darken background slightly to hide sudden state transition
    ctx!.fillStyle = `rgba(3, 5, 3, ${Math.min(t * 1.5, 0.95)})`;
    ctx!.fillRect(0, 0, W, H);

    if (t < 0.18) {
      // PHASE 1 (0-18%): Scan sweep — green horizontal band sweeping down
      const sweepY = (t / 0.18) * H;
      // Trail gradient behind sweep
      const grad = ctx!.createLinearGradient(0, sweepY - 120, 0, sweepY);
      grad.addColorStop(0, 'rgba(0, 255, 68, 0)');
      grad.addColorStop(0.6, 'rgba(0, 255, 68, 0.12)');
      grad.addColorStop(1, 'rgba(0, 255, 68, 0.6)');
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, sweepY - 120, W, 120);

      // Bright leading edge line
      ctx!.fillStyle = 'rgba(136, 255, 170, 0.95)';
      ctx!.fillRect(0, sweepY, W, 3);
    }

    if (t >= 0.18 && t < 0.41) {
      // PHASE 2 (18-41%): Grid forms — lines draw in from center outward
      const progress = (t - 0.18) / 0.23;
      ctx!.strokeStyle = `rgba(0, 255, 68, ${0.18 * progress})`;
      ctx!.lineWidth = 0.5;

      // Vertical grid lines
      const gridSpacing = 40;
      for (let x = 0; x < W; x += gridSpacing) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, H);
        ctx!.stroke();
      }
      // Horizontal grid lines
      for (let y = 0; y < H; y += gridSpacing) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(W, y);
        ctx!.stroke();
      }

      // Corner bracket indicators (targeting system lock)
      const bracketSize = 24;
      const corners = [[0, 0], [W, 0], [W, H], [0, H]];
      ctx!.strokeStyle = `rgba(0, 255, 68, ${progress})`;
      ctx!.lineWidth = 2;
      corners.forEach(([cx, cy]) => {
        const sx = cx === 0 ? 1 : -1;
        const sy = cy === 0 ? 1 : -1;
        ctx!.beginPath();
        ctx!.moveTo(cx + sx * 12, cy + sy * 4);
        ctx!.lineTo(cx + sx * 12, cy + sy * (4 + bracketSize * progress));
        ctx!.moveTo(cx + sx * 4, cy + sy * 12);
        ctx!.lineTo(cx + sx * (4 + bracketSize * progress), cy + sy * 12);
        ctx!.stroke();
      });
    }

    if (t >= 0.41 && t < 0.64) {
      // PHASE 3 (41-64%): White/green flash from center expanding
      const progress = (t - 0.41) / 0.23;
      const flashAlpha = Math.sin(progress * Math.PI); // bell curve 0->1->0

      // Radial flash
      const flashGrad = ctx!.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
      flashGrad.addColorStop(0, `rgba(0, 255, 68, ${flashAlpha * 0.95})`);
      flashGrad.addColorStop(0.4, `rgba(0, 255, 68, ${flashAlpha * 0.45})`);
      flashGrad.addColorStop(1, 'rgba(0, 255, 68, 0)');
      ctx!.fillStyle = flashGrad;
      ctx!.fillRect(0, 0, W, H);

      // Authenticating / Lock-on typewriter text overlays
      if (progress > 0.1) {
        ctx!.fillStyle = `rgba(0, 255, 68, ${(progress - 0.1) / 0.9})`;
        ctx!.font = `bold 12px "JetBrains Mono", monospace`;
        ctx!.textAlign = 'center';

        const nodes = ['PRE-SHIELD_04', 'ALPHA-7', 'SOVEREIGN-01', 'COSMIC-L5'];
        const selectedNode = nodes[Math.floor(progress * nodes.length) % nodes.length];

        ctx!.fillText('AUTHENTICATING COMMAND CREDENTIALS...', W / 2, H / 2 + 10);
        ctx!.font = `10px "Share Tech Mono", monospace`;
        ctx!.fillStyle = 'rgba(255, 213, 79, 0.9)';
        ctx!.fillText(`NODE LINK: SECURE_${selectedNode}`, W / 2, H / 2 + 32);
      }
    }

    if (t >= 0.64 && t <= 1.0) {
      // PHASE 4 (64-100%): CRT scanline wipe — reveals the playing HUD underneath
      const progress = (t - 0.64) / 0.36;
      const revealY = progress * H * 1.15;

      // Draw solid cover over the unrevealed portion
      ctx!.fillStyle = '#030503';
      ctx!.fillRect(0, revealY, W, H - revealY);

      // Scanline overlay effect on revealed top portion
      for (let y = 0; y < revealY; y += 4) {
        ctx!.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx!.fillRect(0, y, W, 2);
      }

      // Bright green scan sweep leading line
      ctx!.fillStyle = `rgba(136, 255, 170, ${1 - progress * 0.75})`;
      ctx!.fillRect(0, revealY - 2, W, 4);

      // Residual grid fade out
      ctx!.strokeStyle = `rgba(0, 255, 68, ${(1 - progress) * 0.12})`;
      ctx!.lineWidth = 0.4;
      const gridSpacing = 40;
      for (let x = 0; x < W; x += gridSpacing) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, revealY);
        ctx!.stroke();
      }
    }

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(frame);
}
