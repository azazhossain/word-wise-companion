export interface Word {
  id: number;
  headword: string;
  meaning: string;
  synonyms: string;
  antonyms: string;
  part: number;
}

import raw from "./words.json";

export const ALL_WORDS: Word[] = raw as Word[];

export const PARTS: number[] = Array.from(
  new Set(ALL_WORDS.map((w) => w.part))
).sort((a, b) => a - b);

export const wordsByPart = (part: number): Word[] =>
  ALL_WORDS.filter((w) => w.part === part);

export const totalWords = ALL_WORDS.length;

export const splitList = (s: string): string[] =>
  s
    .split(/[;,|]/)
    .map((x) => x.trim())
    .filter(Boolean);

export const normalizeTerm = (value: string): string =>
  value
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/^[A-E]\.\s*/i, "")
    .replace(/[“”"'`.,!?;:()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const findWordByTerm = (
  term: string,
  pool: Word[] = ALL_WORDS,
): Word | undefined => {
  const normalized = normalizeTerm(term);
  if (!normalized) return undefined;

  return pool.find((word) => {
    const terms = [
      word.headword,
      ...splitList(word.synonyms),
      ...splitList(word.antonyms),
    ];
    return terms.some((candidate) => normalizeTerm(candidate) === normalized);
  });
};
