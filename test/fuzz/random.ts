/** A deterministic pseudo random number generator. */
export type Rng = {
  /** Float in `[0, 1)`. */
  next: () => number;
  /** Integer in `[0, maxExclusive)`. */
  int: (maxExclusive: number) => number;
  /** Integer in `[min, max]`, both inclusive. */
  range: (min: number, max: number) => number;
  /** `true` with the given probability, `0.5` by default. */
  bool: (probability?: number) => boolean;
  /** A random element of a non-empty array. */
  pick: <T>(items: readonly T[]) => T;
  /** A shuffled copy of an array. */
  shuffle: <T>(items: readonly T[]) => T[];
};

/** Mulberry32: small, fast and good enough for generating test data. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (maxExclusive: number): number =>
    maxExclusive <= 0 ? 0 : Math.floor(next() * maxExclusive);

  const rng: Rng = {
    next,
    int,
    range: (min, max) => min + int(max - min + 1),
    bool: (probability = 0.5) => next() < probability,
    pick: <T>(items: readonly T[]): T => items[int(items.length)],
    shuffle: <T>(items: readonly T[]): T[] => {
      const result = items.slice();
      for (let i = result.length; i-- > 1; ) {
        const j = int(i + 1);
        const tmp = result[i];
        result[i] = result[j];
        result[j] = tmp;
      }
      return result;
    }
  };

  return rng;
}

/** Seed used by a single test, e.g. `abc123-592`. */
export function iterationSeed(seed: string, index: number): string {
  return `${seed}-${index}`;
}

/** FNV-1a hash, used to turn a readable seed string into a number. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** A new seed for a run that was not given one. */
export function createSeed(): string {
  const words = new Uint32Array(2);
  const hasWebCrypto =
    typeof crypto !== "undefined" && crypto.getRandomValues !== undefined;
  if (hasWebCrypto) {
    crypto.getRandomValues(words);
    return words[0].toString(36) + words[1].toString(36);
  }
  return Math.floor(Math.random() * 0xffffffff).toString(36);
}
