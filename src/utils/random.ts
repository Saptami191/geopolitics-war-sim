// Simple Seeded Random Number Generator
// Seed can be set to produce reproducible results for game scenarios or random events
export class SeededRandom {
  private seed: number;

  constructor(seed: number = 1337) {
    this.seed = seed;
  }

  // Returns a value between 0 and 1
  public next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns a value between min and max
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Returns standard normal distributed random value centered around mean with std dev
  public gaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next() || 0.0001; // Avoid 0
    const u2 = this.next() || 0.0001;
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
  }
}

export const rng = new SeededRandom();
