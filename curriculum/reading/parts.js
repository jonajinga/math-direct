// The word parts of Reading 2: sounds spelled with more than one letter
// that come after the forty-odd sounds of Reading 1, silent-letter pairs,
// doubled letters, and the endings and syllables read as one part. The
// lesson is the Reading 2 lesson (Open Phonics lesson less 100). Blends
// (bl, str, nd) are not parts: the child sounds out each letter of a blend.
//
//   kind   sound: a new sound; silent: a pair with a silent letter; double:
//          two letters, one sound; suffix: an ending; syllable: a final
//          syllable read as one part

export const PARTS = [
  { id: "ng", letters: "ng", say: "ng", asIn: "ring", lesson: 2, kind: "sound", voiced: true, note: "the sound at the end of ring and song" },
  { id: "ow", letters: "ow", say: "ow", asIn: "cow", lesson: 15, kind: "sound", voiced: true, note: "as in cow and how; in snow the o says ōōō" },
  { id: "oi", letters: "oi", say: "oy", asIn: "oil", lesson: 17, kind: "sound", voiced: true },
  { id: "oy", letters: "oy", say: "oy", asIn: "boy", lesson: 17, kind: "sound", voiced: true },
  { id: "aw", letters: "aw", say: "aw", asIn: "saw", lesson: 18, kind: "sound", voiced: true },
  { id: "igh", letters: "igh", say: "īīī", asIn: "night", lesson: 20, kind: "sound", voiced: true },
  { id: "kn", letters: "kn", say: "nnn", asIn: "know", lesson: 21, kind: "silent", voiced: true, note: "the k is silent" },
  { id: "wr", letters: "wr", say: "rrr", asIn: "write", lesson: 21, kind: "silent", voiced: true, note: "the w is silent" },
  { id: "ew", letters: "ew", say: "ooo", asIn: "new", lesson: 22, kind: "sound", voiced: true },
  { id: "au", letters: "au", say: "aw", asIn: "cause", lesson: 28, kind: "sound", voiced: true, note: "the same sound as aw" },
  { id: "gn", letters: "gn", say: "nnn", asIn: "gnat", lesson: 29, kind: "silent", voiced: true, note: "the g is silent" },
  { id: "mb", letters: "mb", say: "mmm", asIn: "lamb", lesson: 29, kind: "silent", voiced: true, note: "the b is silent" },
  { id: "gh", letters: "gh", say: "g", asIn: "ghost", lesson: 30, kind: "silent", stop: true, voiced: true, note: "the h is silent" },
  { id: "ff", letters: "ff", say: "fff", asIn: "stuff", lesson: 33, kind: "double", voiced: false },
  { id: "ll", letters: "ll", say: "lll", asIn: "ball", lesson: 33, kind: "double", voiced: true },
  { id: "ss", letters: "ss", say: "sss", asIn: "miss", lesson: 33, kind: "double", voiced: false },
  { id: "zz", letters: "zz", say: "zzz", asIn: "buzz", lesson: 33, kind: "double", voiced: true },
  { id: "tion", letters: "tion", say: "shun", asIn: "action", lesson: 40, kind: "suffix", voiced: false },
  { id: "sion", letters: "sion", say: "zhun", asIn: "vision", lesson: 40, kind: "suffix", voiced: true },
  { id: "ble", letters: "ble", say: "bul", asIn: "table", lesson: 42, kind: "syllable", voiced: true },
  { id: "tle", letters: "tle", say: "tul", asIn: "little", lesson: 42, kind: "syllable", voiced: false },
  { id: "dle", letters: "dle", say: "dul", asIn: "middle", lesson: 42, kind: "syllable", voiced: true },
  { id: "ple", letters: "ple", say: "pul", asIn: "apple", lesson: 43, kind: "syllable", voiced: false },
  { id: "gle", letters: "gle", say: "gul", asIn: "giggle", lesson: 43, kind: "syllable", voiced: true },
  { id: "kle", letters: "kle", say: "kul", asIn: "sparkle", lesson: 43, kind: "syllable", voiced: false },
];

export const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p]));

// The endings taught as word parts, each with the Reading 2 lesson it comes
// in and how it is said. A word with the ending is read as its first part
// and then the whole word.
export const ENDINGS = [
  { id: "ed", letters: "ed", say: "d, t, or id", lesson: 23, note: "-ed says d after a voiced sound (played), t after a whispered one (jumped), and id after t or d (wanted)" },
  { id: "er", letters: "er", say: "er", lesson: 35, note: "comparing two things: bigger" },
  { id: "est", letters: "est", say: "est", lesson: 35, note: "the most: biggest" },
  { id: "ly", letters: "ly", say: "lee", lesson: 36 },
  { id: "ful", letters: "ful", say: "ful", lesson: 37 },
  { id: "less", letters: "less", say: "less", lesson: 37 },
  { id: "ness", letters: "ness", say: "ness", lesson: 38 },
];
