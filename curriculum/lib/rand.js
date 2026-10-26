// Seeded random numbers, so a lesson is the same every time it is taught.

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed) {
  let a = typeof seed === "string" ? hash(seed) : seed >>> 0;
  const next = function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.shuffle = (arr) => {
    const a2 = arr.slice();
    for (let i = a2.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [a2[i], a2[j]] = [a2[j], a2[i]];
    }
    return a2;
  };
  next.sample = (arr, n) => next.shuffle(arr).slice(0, n);
  // Pick n items, avoiding the same item twice in a row where possible.
  next.seq = (arr, n) => {
    const out = [];
    let pool = [];
    while (out.length < n) {
      if (!pool.length) pool = next.shuffle(arr);
      let v = pool.shift();
      if (out.length && v === out[out.length - 1] && pool.length) {
        pool.push(v);
        v = pool.shift();
      }
      out.push(v);
    }
    return out;
  };
  return next;
}
