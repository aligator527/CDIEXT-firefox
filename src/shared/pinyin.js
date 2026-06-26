const TONE_MARKS = [
  ["a", "ā", "á", "ǎ", "à", "a"],
  ["e", "ē", "é", "ě", "è", "e"],
  ["i", "ī", "í", "ǐ", "ì", "i"],
  ["o", "ō", "ó", "ǒ", "ò", "o"],
  ["u", "ū", "ú", "ǔ", "ù", "u"],
  ["ü", "ǖ", "ǘ", "ǚ", "ǜ", "ü"],
  ["A", "Ā", "Á", "Ǎ", "À", "A"],
  ["E", "Ē", "É", "Ě", "È", "E"],
  ["I", "Ī", "Í", "Ǐ", "Ì", "I"],
  ["O", "Ō", "Ó", "Ǒ", "Ò", "O"],
  ["U", "Ū", "Ú", "Ǔ", "Ù", "U"],
  ["Ü", "Ǖ", "Ǘ", "Ǚ", "Ǜ", "Ü"],
];

/**
 * Convert numbered pinyin (e.g. "ni3 hao3") to pinyin with tone marks.
 * @param {string} pinyin
 * @returns {string}
 */
export function addToneMarks(pinyin) {
  return pinyin
    .split(" ")
    .map((segment) => {
      const toneNumberMatch = segment.match(/\d/);
      if (!toneNumberMatch) return segment;

      const toneNumber = parseInt(toneNumberMatch[0], 10);
      for (const [vowel, ...marks] of TONE_MARKS) {
        if (segment.includes(vowel)) {
          return segment.replace(vowel, marks[toneNumber - 1]).replace(/\d/, "");
        }
      }
      return segment;
    })
    .join(" ");
}
