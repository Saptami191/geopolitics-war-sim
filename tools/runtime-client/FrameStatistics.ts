export class FrameStatistics {
  private framesReceived = 0;
  private totalFramesThisSecond = 0;
  private lastSecondTime = Date.now();

  private lastTick: number | null = null;
  private lastTickTime = Date.now();
  private ticksThisSecond = 0;
  
  private droppedFrames = 0;
  private outOfOrderFrames = 0;
  
  // Current frame info
  private currentVersion = 1;
  private currentTick = 0;
  private countriesCount = 0;
  private unitsCount = 0;
  private strikesCount = 0;
  private tethersCount = 0;
  private isProtocolValid = true;
  private validationErrors: string[] = [];

  // Metrics for FPS and Tick Rate
  private currentFPS = 0;
  private currentTickRate = 0;
  private currentLatency = 0; // in milliseconds

  constructor() {
    // Schedule printing statistics every second
    setInterval(() => this.print(), 1000);
  }

  public registerFrame(frame: any, isValid: boolean, errors: string[]) {
    this.framesReceived++;
    this.totalFramesThisSecond++;
    this.isProtocolValid = isValid;
    this.validationErrors = errors;

    if (isValid && frame) {
      this.currentVersion = frame.version;
      const tick = frame.tick;

      // Handle out-of-order and dropped frames based on tick sequences
      if (this.lastTick !== null) {
        if (tick < this.lastTick) {
          this.outOfOrderFrames++;
        } else if (tick > this.lastTick + 1) {
          this.droppedFrames += (tick - this.lastTick - 1);
        }
        
        // Track how many ticks elapsed this second
        if (tick > this.lastTick) {
          this.ticksThisSecond += (tick - this.lastTick);
        }
      }

      this.currentTick = tick;
      this.lastTick = tick;
      this.countriesCount = Object.keys(frame.countries || {}).length;
      this.unitsCount = Object.keys(frame.units || {}).length;
      this.strikesCount = (frame.activeStrikes || []).length;
      this.tethersCount = (frame.activeTethers || []).length;
    }
  }

  public registerInvalidFrame() {
    this.framesReceived++;
    this.totalFramesThisSecond++;
    this.isProtocolValid = false;
  }

  public updateLatency(ms: number) {
    this.currentLatency = ms;
  }

  private print() {
    const now = Date.now();
    const elapsed = (now - this.lastSecondTime) / 1000;

    // Calculate actual FPS and tick rate
    this.currentFPS = Math.round(this.totalFramesThisSecond / elapsed);
    this.currentTickRate = Math.round(this.ticksThisSecond / elapsed);

    // Reset periodic counters
    this.totalFramesThisSecond = 0;
    this.ticksThisSecond = 0;
    this.lastSecondTime = now;

    // Print statistics block without clearing console logs
    console.log(`\n--- Frame Stats ---`);
    console.log(`Protocol Version: ${this.currentVersion}`);
    console.log(`Tick: ${this.currentTick}`);
    console.log(`Countries: ${this.countriesCount}`);
    console.log(`Units: ${this.unitsCount}`);
    console.log(`Strikes: ${this.strikesCount}`);
    console.log(`Tethers: ${this.tethersCount}`);
    console.log(`FPS: ${this.currentFPS}`);
    console.log(`Tick Rate: ${this.currentTickRate} ticks/sec`);
    console.log(`Latency: ${this.currentLatency ? `${this.currentLatency} ms` : 'xx ms'}`);
    console.log(`Dropped Frames: ${this.droppedFrames}`);
    console.log(`Out-of-order Frames: ${this.outOfOrderFrames}`);
    console.log(`Protocol Valid: ${this.isProtocolValid ? 'YES' : 'NO'}`);

    if (!this.isProtocolValid && this.validationErrors.length > 0) {
      console.log(`\n--- Validation Errors ---`);
      this.validationErrors.slice(0, 10).forEach(err => console.log(` - ${err}`));
      if (this.validationErrors.length > 10) {
        console.log(` ... and ${this.validationErrors.length - 10} more`);
      }
    }
  }
}
