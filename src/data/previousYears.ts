import rawQuestions from "./previousYearQuestions.json";
import { ALL_WORDS, splitList, type Word } from "./words";

export type PreviousYearSection = "synonym" | "antonym";

export interface PreviousYearQuestion {
  id: string;
  part: number;
  section: PreviousYearSection;
  number: number;
  prompt: string;
  options: string[];
  answer: string;
  correctIndex: number;
  sourcePage: number;
}

export const PREVIOUS_YEAR_QUESTIONS = rawQuestions as PreviousYearQuestion[];

export const PREVIOUS_YEAR_PARTS = Array.from(
  new Set(PREVIOUS_YEAR_QUESTIONS.map((question) => question.part))
).sort((a, b) => a - b);

export const questionsByPart = (part: number) =>
  PREVIOUS_YEAR_QUESTIONS.filter((question) => question.part === part);

export const answerLetter = (index: number) =>
  String.fromCharCode(65 + index);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[“”"'`.,;:!?()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const vocabularyValues = (word: Word) => [
  word.headword,
  ...splitList(word.synonyms),
  ...splitList(word.antonyms),
];

export const findVocabularyForValue = (value: string): Word | undefined => {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return undefined;

  return ALL_WORDS.find((word) =>
    vocabularyValues(word).some(
      (entry) => normalize(entry) === normalizedValue
    )
  );
};

export const findVocabularyForQuestion = (
  question: PreviousYearQuestion
): Word | undefined => {
  const exactPrompt = findVocabularyForValue(question.prompt);
  if (exactPrompt) return exactPrompt;

  const candidates = ALL_WORDS.filter((word) =>
    question.prompt.toLowerCase().includes(word.headword.toLowerCase())
  ).sort((a, b) => b.headword.length - a.headword.length);

  return candidates[0];
};

export const sectionLabel = (section: PreviousYearSection) =>
  section === "synonym" ? "Synonym" : "Antonym";