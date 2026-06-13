// Procedural noise systems and Ironbow LUT for thermal camera surveillance feeds

export class SimplexNoise {
  private perm: Uint8Array;
  constructor() {
    this.perm = new Uint8Array(512);
    const source = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      source[i] = i;
    }
    // Shuffle using classic Fisher-Yates
    for (let i = 255; i > 0; i--) {
      const r = Math.floor(Math.random() * (i + 1));
      const t = source[i];
      source[i] = source[r];
      source[r] = t;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = source[i & 255];
    }
  }

  private dot2(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  private static Grad2D = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1]
  ];

  public noise2D(xin: number, yin: number): number {
    let n0 = 0, n1 = 0, n2 = 0;
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1: number, j1: number;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 8;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 8;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 8;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot2(SimplexNoise.Grad2D[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot2(SimplexNoise.Grad2D[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot2(SimplexNoise.Grad2D[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  public fbm2D(x: number, y: number, octaves: number = 3): number {
    let value = 0.0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let maxValue = 0.0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value / maxValue;
  }
}

// 256 RGB triplet color array representing standard Ironbow scientific visualization map
export const IRONBOW_LUT: [number, number, number][] = (() => {
  const lut: [number, number, number][] = [];
  const stops = [
    { pos: 0.0, r: 5, g: 3, b: 18 },        // Cold black/purple
    { pos: 0.15, r: 35, g: 10, b: 95 },     // Indigo
    { pos: 0.32, r: 96, g: 15, b: 130 },    // Purple / Hot violent violet
    { pos: 0.48, r: 185, g: 25, b: 85 },    // Rust ruby red
    { pos: 0.66, r: 236, g: 82, b: 12 },    // Bright hot orange
    { pos: 0.82, r: 251, g: 172, b: 8 },    // Radiant yellow
    { pos: 0.93, r: 254, g: 233, b: 110 },  // Boiling cream yellow
    { pos: 1.0, r: 255, g: 255, b: 255 }    // Absolute white-hot
  ];

  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let left = stops[0];
    let right = stops[stops.length - 1];
    for (let j = 0; j < stops.length - 1; j++) {
      if (t >= stops[j].pos && t <= stops[j + 1].pos) {
        left = stops[j];
        right = stops[j + 1];
        break;
      }
    }
    const range = right.pos - left.pos;
    const factor = range > 0 ? (t - left.pos) / range : 0;
    const r = Math.round(left.r + (right.r - left.r) * factor);
    const g = Math.round(left.g + (right.g - left.g) * factor);
    const b = Math.round(left.b + (right.b - left.b) * factor);
    lut.push([r, g, b]);
  }
  return lut;
})();

export const globalNoise = new SimplexNoise();
