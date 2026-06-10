class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Ambient synth nodes
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientVolume: number = 0.5;

  private isAmbientRunning = false;

  constructor() {
    // Lazy initialize on first interaction to comply with autoplay policies
  }

  private initCtx() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.15, this.ctx.currentTime); // Low background volume
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn('AudioContext failed to start', e);
    }
  }

  public resume() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.warn('Failed to resume audio context', err));
    }
  }

  private getContext(): AudioContext | null {
    this.resume();
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    this.resume();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  // SFX: Terminal typing click
  public sfxKeyClick() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // SFX: Type char with mechanical clicking variation
  public sfxTypeChar() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = Math.random() > 0.5 ? 750 : 900;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // SFX: Radar Ping (sine decay)
  public sfxRadarPing() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.61);
  }

  // SFX: Alert Klaxon (alternating square wave)
  public sfxKlaxon() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    // 3 alternating pulses
    for (let i = 0; i < 3; i++) {
      const pTime = t + i * 0.4;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, pTime);
      osc.frequency.setValueAtTime(550, pTime + 0.2);

      gain.gain.setValueAtTime(0, pTime);
      gain.gain.linearRampToValueAtTime(0.15, pTime + 0.05);
      gain.gain.setValueAtTime(0.15, pTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, pTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(pTime);
      osc.stop(pTime + 0.4);
    }
  }

  // SFX: Missile Launch (whitenoise high pass filtered + pitch sweep)
  public sfxMissileLaunch() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.5; // half second buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.5);
  }

  // SFX: Impact (60Hz low frequency rumble)
  public sfxMissileImpact() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(10, t + 1.2);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.51);
  }

  // SFX: Intercept success chimes
  public sfxIntercept() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, t + 0.1);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.3);
    osc2.start(t + 0.1);
    osc2.stop(t + 0.3);
  }

  // SFX: Nuclear alarm
  public sfxNuclearAlarm() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    // Slow LFO-modulated siren
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(3, t); // 3Hz
    lfoGain.gain.setValueAtTime(100, t); // swing ±100Hz

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.2);
    // Beep 3 times and shut off to avoid infinite annoyance
    gain.gain.setValueAtTime(0.12, t + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(t);
    osc.start(t);

    lfo.stop(t + 3.0);
    osc.stop(t + 3.0);
  }

  // SFX: Economy crash glide
  public sfxMarketCrash() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.8);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.82);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.83);
  }

  // SFX: Sat Destroy static
  public sfxSatDestroy() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
       data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.15);
  }

  // SFX: UN vote chime (C5)
  public sfxUNVote() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.41);
  }

  // SFX: Newspaper mechanical ratchet
  public sfxNewspaper() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const clickTime = t + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950 - i * 50, clickTime);

      gain.gain.setValueAtTime(0.12, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.05);
    }
  }

  // SFX: Faction alarm waves
  public sfxFactionAlert() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const pulseTime = t + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, pulseTime);

      gain.gain.setValueAtTime(0.15, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.11);
    }
  }

  // Ambient Drone Music
  public startAmbientScore() {
    this.resume();
    const ctx = this.getContext();
    if (!ctx || !this.ambientGain || this.isAmbientRunning) return;

    this.isAmbientRunning = true;
    const t = ctx.currentTime;

    // Layer 1: Low rumble (A1 - 55Hz)
    const baseOsc = ctx.createOscillator();
    const baseGain = ctx.createGain();
    baseOsc.type = 'sine';
    baseOsc.frequency.setValueAtTime(55, t);
    baseGain.gain.setValueAtTime(0.05, t);
    baseOsc.connect(baseGain);
    baseGain.connect(this.ambientGain);
    baseOsc.start(t);

    // Layer 2: Mid tension drone (110Hz + LFO vibrato)
    const midOsc = ctx.createOscillator();
    const midGain = ctx.createGain();
    midOsc.type = 'sine';
    midOsc.frequency.setValueAtTime(110, t);
    midGain.gain.setValueAtTime(0.03, t);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, t); // 0.2Hz LFO
    lfoGain.gain.setValueAtTime(4, t); // ±4Hz

    lfo.connect(lfoGain);
    lfoGain.connect(midOsc.frequency);
    midOsc.connect(midGain);
    midGain.connect(this.ambientGain);

    lfo.start(t);
    midOsc.start(t);

    this.ambientOscs.push(
      { osc: baseOsc, gain: baseGain },
      { osc: midOsc, gain: midGain }
    );
  }

  public updateTensionLayers(threatLevel: 'GREEN' | 'AMBER' | 'RED' | 'BLACK') {
    const ctx = this.getContext();
    if (!ctx || !this.ambientGain) return;
    const t = ctx.currentTime;

    // Adjust gain levels based on global threat level
    if (threatLevel === 'RED' || threatLevel === 'BLACK') {
      this.ambientGain.gain.linearRampToValueAtTime(0.25, t + 2.0);
    } else if (threatLevel === 'AMBER') {
      this.ambientGain.gain.linearRampToValueAtTime(0.18, t + 2.0);
    } else {
      this.ambientGain.gain.linearRampToValueAtTime(0.12, t + 2.0);
    }
  }

  public stopAmbientScore() {
    this.ambientOscs.forEach((o) => {
      try {
        o.osc.stop();
      } catch (e) {}
    });
    this.ambientOscs = [];
    this.isAmbientRunning = false;
  }
}

export const audio = new AudioEngine();
