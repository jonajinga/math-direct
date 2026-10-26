// The sounds of Reading 1, in the order the Direct Instruction program
// teaches them (the order of Open Phonics, which followed Engelmann's). Each
// sound names the letters the child sees, how the parent says it, a word it
// is heard in, the lesson it is taught in, and whether it is a stop sound
// (said short, the dot taps) or a continuous one (held, the dot rests).
//
//   id       a key for records and items ("sound:th")
//   letters  what is printed; joined: the letters make one sound and are
//            drawn joined; macron: a long vowel, marked with a line
//   say      the sound as the parent says it, stretched if continuous
//   voiced   said with the voice (true) or whispered (false)

export const SOUNDS = [
  { id: "m", letters: "m", say: "mmm", asIn: "ram", lesson: 1, voiced: true },
  { id: "s", letters: "s", say: "sss", asIn: "bus", lesson: 1, voiced: false },
  { id: "a", letters: "a", say: "aaa", asIn: "and", lesson: 3, voiced: true },
  { id: "ē", letters: "e", macron: true, say: "ēēē", asIn: "eat", lesson: 5, voiced: true },
  { id: "t", letters: "t", say: "t", asIn: "cat", lesson: 7, stop: true, voiced: false },
  { id: "r", letters: "r", say: "rrr", asIn: "bar", lesson: 9, voiced: true },
  { id: "d", letters: "d", say: "d", asIn: "mad", lesson: 12, stop: true, voiced: true },
  { id: "i", letters: "i", say: "iii", asIn: "if", lesson: 14, voiced: true },
  { id: "th", letters: "th", joined: true, say: "ththth", asIn: "this", lesson: 16, voiced: true },
  { id: "c", letters: "c", say: "c", asIn: "tack", lesson: 19, stop: true, voiced: false },
  { id: "o", letters: "o", say: "ooo", asIn: "ox", lesson: 21, voiced: true },
  { id: "n", letters: "n", say: "nnn", asIn: "pan", lesson: 23, voiced: true },
  { id: "f", letters: "f", say: "fff", asIn: "stuff", lesson: 25, voiced: false },
  { id: "u", letters: "u", say: "uuu", asIn: "under", lesson: 27, voiced: true },
  { id: "l", letters: "l", say: "lll", asIn: "pal", lesson: 29, voiced: true },
  { id: "w", letters: "w", say: "www", asIn: "wow", lesson: 31, voiced: true },
  { id: "g", letters: "g", say: "g", asIn: "tag", lesson: 33, stop: true, voiced: true },
  { id: "sh", letters: "sh", joined: true, say: "shshsh", asIn: "wish", lesson: 35, voiced: false },
  { id: "ā", letters: "a", macron: true, say: "āāā", asIn: "ate", lesson: 37, voiced: true },
  { id: "h", letters: "h", say: "h", asIn: "hat", lesson: 39, stop: true, voiced: false },
  { id: "k", letters: "k", say: "k", asIn: "tack", lesson: 41, stop: true, voiced: false },
  { id: "ō", letters: "o", macron: true, say: "ōōō", asIn: "over", lesson: 43, voiced: true },
  { id: "v", letters: "v", say: "vvv", asIn: "love", lesson: 45, voiced: true },
  { id: "p", letters: "p", say: "p", asIn: "sap", lesson: 48, stop: true, voiced: false },
  { id: "ar", letters: "ar", joined: true, say: "ar", asIn: "car", lesson: 49, voiced: true },
  { id: "ch", letters: "ch", joined: true, say: "ch", asIn: "touch", lesson: 50, stop: true, voiced: false },
  { id: "e", letters: "e", say: "eee", asIn: "end", lesson: 52, voiced: true },
  { id: "b", letters: "b", say: "b", asIn: "grab", lesson: 54, stop: true, voiced: true },
  { id: "ing", letters: "ing", joined: true, say: "iiing", asIn: "sing", lesson: 56, voiced: true },
  { id: "ī", letters: "i", macron: true, say: "īīī", asIn: "ice", lesson: 58, voiced: true },
  { id: "y", letters: "y", say: "yyy", asIn: "yard", lesson: 60, voiced: true },
  { id: "er", letters: "er", joined: true, say: "urrr", asIn: "brother", lesson: 62, voiced: true },
  { id: "ir", letters: "ir", joined: true, say: "urrr", asIn: "bird", lesson: 63, voiced: true },
  { id: "ur", letters: "ur", joined: true, say: "urrr", asIn: "burn", lesson: 64, voiced: true },
  { id: "oo", letters: "oo", joined: true, macron: true, say: "ooo", asIn: "moon", lesson: 65, voiced: true },
  { id: "j", letters: "j", say: "j", asIn: "judge", lesson: 67, stop: true, voiced: true },
  { id: "wh", letters: "wh", joined: true, say: "www", asIn: "why", lesson: 69, voiced: true },
  { id: "ȳ", letters: "y", macron: true, say: "īīī", asIn: "my", lesson: 71, voiced: true },
  { id: "ū", letters: "u", macron: true, say: "ūūū", asIn: "use", lesson: 74, voiced: true },
  { id: "qu", letters: "qu", joined: true, say: "kwww", asIn: "quick", lesson: 74, stop: true, voiced: true },
  { id: "x", letters: "x", say: "ksss", asIn: "ox", lesson: 75, stop: true, voiced: false },
  { id: "z", letters: "z", say: "zzz", asIn: "buzz", lesson: 75, voiced: true },
  { id: "ea", letters: "ea", joined: true, say: "ēēē", asIn: "leave", lesson: 79, voiced: true },
  { id: "ee", letters: "ee", joined: true, say: "ēēē", asIn: "feet", lesson: 80, voiced: true },
  { id: "oa", letters: "oa", joined: true, say: "ōōō", asIn: "boat", lesson: 82, voiced: true },
  { id: "ay", letters: "ay", joined: true, say: "āāā", asIn: "day", lesson: 84, voiced: true },
  { id: "ai", letters: "ai", joined: true, say: "āāā", asIn: "rain", lesson: 88, voiced: true },
  { id: "ou", letters: "ou", joined: true, say: "ow", asIn: "loud", lesson: 89, voiced: true },
  { id: "or", letters: "or", joined: true, say: "or", asIn: "for", lesson: 91, voiced: true },
  { id: "ck", letters: "ck", joined: true, say: "k", asIn: "back", lesson: 93, stop: true, voiced: false },
  { id: "th2", letters: "th", joined: true, say: "th", asIn: "thing", lesson: 95, voiced: false, note: "the whispered th, as in thing and math" },
  { id: "ŏŏ", letters: "oo", joined: true, say: "oo", asIn: "book", lesson: 97, voiced: true, note: "the short oo, as in book and look" },
];

export const SOUND_BY_ID = Object.fromEntries(SOUNDS.map((s) => [s.id, s]));

// The sound symbols the Open Phonics word list uses, mapped to sound ids.
export const SYMBOL_TO_ID = { "th (unvoiced)": "th2" };

export function soundsTaughtBy(n) {
  return SOUNDS.filter((s) => s.lesson <= n);
}

// The stretched or short form of a sound, as the parent says it when a word
// is sounded out: "mmm", "t", "ththth".
export function sayOf(id) {
  const s = SOUND_BY_ID[id];
  return s ? s.say : id;
}
