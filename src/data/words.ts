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
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean);
