import { addToneMarks } from "./pinyin.js";

const DICTIONARY_FILES = Array.from({ length: 10 }, (_, i) => `data/cedict_${i + 1}.json`);

/**
 * Build a lookup index mapping each traditional/simplified form to entry indices.
 * @param {Array<object>} dictionaryData
 * @returns {Record<string, number[]>}
 */
export function buildIndex(dictionaryData) {
  const index = {};
  dictionaryData.forEach((entry, i) => {
    if (!index[entry.traditional]) index[entry.traditional] = [];
    if (!index[entry.simplified]) index[entry.simplified] = [];
    index[entry.traditional].push(i);
    index[entry.simplified].push(i);
  });
  return index;
}

/**
 * Fetch the bundled CC-CEDICT chunks and build an in-memory index.
 * @returns {Promise<{ data: Array<object>, index: Record<string, number[]>, maxWordLength: number }>}
 */
export async function loadDictionary() {
  const results = await Promise.all(
    DICTIONARY_FILES.map((file) =>
      fetch(browser.runtime.getURL(file)).then((response) => response.json()),
    ),
  );

  const data = results.flat();

  let maxWordLength = 1;
  for (const entry of data) {
    maxWordLength = Math.max(maxWordLength, entry.traditional.length, entry.simplified.length);
  }

  return { data, index: buildIndex(data), maxWordLength };
}

/**
 * @typedef {object} DefinitionEntry
 * @property {string} headword    The matched lookup string.
 * @property {string} simplified
 * @property {string} traditional
 * @property {string} readingWithTones
 * @property {string[]} meanings
 */

const MAX_SEGMENT_LENGTH = 16;
const MAX_RESULTS = 24;

/**
 * Collect dictionary words within `text` that cover the cursor position,
 * ordered longest-first then left-most. This is forward maximum matching
 * generalized to a cursor anywhere inside the word.
 * @param {{ index: Record<string, number[]>, maxWordLength: number }} dictionary
 * @param {string} text
 * @param {number} cursor
 * @returns {Array<{ word: string }>}
 */
function segmentAroundCursor(dictionary, text, cursor) {
  const maxLen = Math.min(dictionary.maxWordLength || text.length, text.length, MAX_SEGMENT_LENGTH);
  const candidates = [];

  for (let start = cursor; start >= Math.max(0, cursor - maxLen + 1); start--) {
    const longest = Math.min(maxLen, text.length - start);
    const shortest = cursor - start + 1; // must reach the cursor character
    for (let len = longest; len >= shortest; len--) {
      const word = text.slice(start, start + len);
      if (dictionary.index[word]) candidates.push({ word, start, len });
    }
  }

  candidates.sort((a, b) => b.len - a.len || a.start - b.start);
  return candidates;
}

/**
 * Build structured definition entries for the word(s) under the cursor.
 *
 * @param {{ data: Array<object>, index: Record<string, number[]>, maxWordLength: number }} dictionary
 * @param {string} text A contiguous run of Chinese characters around the cursor.
 * @param {number} cursor Index of the hovered character within `text`.
 * @returns {DefinitionEntry[]}
 */
export function findDefinitions(dictionary, text, cursor) {
  if (!text) return [];

  const safeCursor = Number.isInteger(cursor) ? Math.max(0, Math.min(cursor, text.length - 1)) : 0;
  const candidates = segmentAroundCursor(dictionary, text, safeCursor);

  const results = [];
  const seen = new Set();

  for (const { word } of candidates) {
    for (const i of dictionary.index[word]) {
      if (seen.has(i)) continue;
      seen.add(i);

      const entry = dictionary.data[i];
      results.push({
        headword: word,
        simplified: entry.simplified,
        traditional: entry.traditional,
        readingWithTones: addToneMarks(entry.reading),
        meanings: entry.meanings.map((m) => m.meaning),
      });
    }
    if (results.length >= MAX_RESULTS) break;
  }

  return results;
}
