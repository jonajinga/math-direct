// Number words, as a child says them.

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function word(n) {
  if (typeof n !== "number") return String(n);
  if (n < 0) return "minus " + word(-n);
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10), o = n % 10;
    return o ? `${TENS[t]}-${ONES[o]}` : TENS[t];
  }
  if (n < 1000) {
    const h = Math.floor(n / 100), r = n % 100;
    return r ? `${ONES[h]} hundred ${word(r)}` : `${ONES[h]} hundred`;
  }
  if (!Number.isInteger(n)) return String(n);
  if (n < 1000000) {
    const th = Math.floor(n / 1000), r = n % 1000;
    return r ? `${word(th)} thousand ${word(r)}` : `${word(th)} thousand`;
  }
  if (n < 1000000000) {
    const m = Math.floor(n / 1000000), r = n % 1000000;
    return r ? `${word(m)} million ${word(r)}` : `${word(m)} million`;
  }
  return String(n);
}

export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function Word(n) {
  return cap(word(n));
}

// "one, two, three" counting chain from a to b (inclusive), stepping by `by`.
export function chain(a, b, by = 1) {
  const out = [];
  if (by > 0) for (let i = a; i <= b; i += by) out.push(word(i));
  else for (let i = a; i >= b; i += by) out.push(word(i));
  return out.join(", ");
}

export function Chain(a, b, by = 1) {
  return cap(chain(a, b, by)) + ".";
}

// Plural helper for picture names.
const PLURALS = {
  fish: "fish", sheep: "sheep", mouse: "mice", leaf: "leaves", bus: "buses",
  box: "boxes", butterfly: "butterflies", strawberry: "strawberries", cherry: "cherries",
  puppy: "puppies", bunny: "bunnies", ladybug: "ladybugs", penny: "pennies",
};

export function plural(name, n = 2) {
  if (n === 1) return name;
  return PLURALS[name] || name + "s";
}

export function ordinal(n) {
  return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth",
    "seventh", "eighth", "ninth", "tenth"][n] || n + "th";
}

// "a" or "an" before a word, as it is said: "an eight", "a one".
// "an eight", "an apple", but "a one": the word starts with a "w" sound.
export function an(w) {
  return /^(eight|eleven|eighteen|eighty|[aei]|o(?!ne\b))/i.test(String(w)) ? "an" : "a";
}

export function list(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return items.join(" and ");
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}
