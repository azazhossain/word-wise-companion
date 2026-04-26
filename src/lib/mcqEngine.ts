import { ALL_WORDS, splitList, type Word } from "@/data/words";

export type QuestionType =
  | "FIND_SYNONYM"
  | "FIND_ANTONYM"
  | "MEANING_TO_WORD"
  | "WORD_TO_MEANING";

export interface MCQ {
  id: string;
  type: QuestionType;
  prompt: string;
  promptSub?: string;
  options: string[];
  correctIndex: number;
  word: Word;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const cleanWord = (w: string) =>
  w
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/^\d+\.\s*/, "")
    .trim();

function buildSynonymQ(word: Word, pool: Word[]): MCQ | null {
  const syns = splitList(word.synonyms).map(cleanWord).filter(Boolean);
  if (syns.length === 0) return null;
  const correct = pick(syns);
  const synSet = new Set(syns.map((s) => s.toLowerCase()));
  const candidates = pool
    .filter((w) => w.id !== word.id)
    .flatMap((w) => splitList(w.synonyms).map(cleanWord))
    .filter((s) => s && !synSet.has(s.toLowerCase()));
  const distractors = shuffle(Array.from(new Set(candidates))).slice(0, 3);
  if (distractors.length < 3) return null;
  const opts = shuffle([correct, ...distractors]);
  return {
    id: `syn-${word.id}-${Date.now()}-${Math.random()}`,
    type: "FIND_SYNONYM",
    prompt: cleanWord(word.headword),
    promptSub: "নিচের কোনটি সমার্থক (synonym)?",
    options: opts,
    correctIndex: opts.indexOf(correct),
    word,
  };
}

function buildAntonymQ(word: Word, pool: Word[]): MCQ | null {
  const ants = splitList(word.antonyms).map(cleanWord).filter(Boolean);
  if (ants.length === 0) return null;
  const correct = pick(ants);
  const antSet = new Set(ants.map((s) => s.toLowerCase()));
  const candidates = pool
    .filter((w) => w.id !== word.id)
    .flatMap((w) => splitList(w.antonyms).map(cleanWord))
    .filter((s) => s && !antSet.has(s.toLowerCase()));
  const distractors = shuffle(Array.from(new Set(candidates))).slice(0, 3);
  if (distractors.length < 3) return null;
  const opts = shuffle([correct, ...distractors]);
  return {
    id: `ant-${word.id}-${Date.now()}-${Math.random()}`,
    type: "FIND_ANTONYM",
    prompt: cleanWord(word.headword),
    promptSub: "নিচের কোনটি বিপরীতার্থক (antonym)?",
    options: opts,
    correctIndex: opts.indexOf(correct),
    word,
  };
}

function buildMeaningToWordQ(word: Word, pool: Word[]): MCQ | null {
  const correct = cleanWord(word.headword);
  const distractors = shuffle(pool.filter((w) => w.id !== word.id))
    .slice(0, 3)
    .map((w) => cleanWord(w.headword));
  if (distractors.length < 3) return null;
  const opts = shuffle([correct, ...distractors]);
  return {
    id: `m2w-${word.id}-${Date.now()}-${Math.random()}`,
    type: "MEANING_TO_WORD",
    prompt: word.meaning,
    promptSub: "এই অর্থের ইংরেজি শব্দটি কোনটি?",
    options: opts,
    correctIndex: opts.indexOf(correct),
    word,
  };
}

function buildWordToMeaningQ(word: Word, pool: Word[]): MCQ | null {
  const correct = word.meaning;
  const distractors = shuffle(pool.filter((w) => w.id !== word.id))
    .slice(0, 3)
    .map((w) => w.meaning);
  if (distractors.length < 3) return null;
  const opts = shuffle([correct, ...distractors]);
  return {
    id: `w2m-${word.id}-${Date.now()}-${Math.random()}`,
    type: "WORD_TO_MEANING",
    prompt: cleanWord(word.headword),
    promptSub: "এই শব্দের সঠিক অর্থ কোনটি?",
    options: opts,
    correctIndex: opts.indexOf(correct),
    word,
  };
}

type Builder = (word: Word, pool: Word[]) => MCQ | null;

const BUILDERS: { type: QuestionType; build: Builder }[] = [
  { type: "FIND_SYNONYM", build: buildSynonymQ },
  { type: "FIND_ANTONYM", build: buildAntonymQ },
  { type: "MEANING_TO_WORD", build: buildMeaningToWordQ },
  { type: "WORD_TO_MEANING", build: buildWordToMeaningQ },
];

export interface QuizConfig {
  pool: Word[];
  count: number;
  types?: QuestionType[];
}

export function generateQuestions({ pool, count, types }: QuizConfig): MCQ[] {
  const allowed = new Set<QuestionType>(
    types ?? ["FIND_SYNONYM", "FIND_ANTONYM"]
  );
  const allowedBuilders = BUILDERS.filter((b) => allowed.has(b.type));
  if (allowedBuilders.length === 0) return [];

  const shuffledPool = shuffle(pool);
  const distractorPool = pool.length >= 20 ? pool : ALL_WORDS;
  const questions: MCQ[] = [];
  let i = 0;
  let attempts = 0;
  const maxAttempts = count * 10;

  while (questions.length < count && attempts < maxAttempts) {
    attempts++;
    const w = shuffledPool[i % shuffledPool.length];
    i++;
    const builder = pick(allowedBuilders).build;
    const q = builder(w, distractorPool);
    if (q) questions.push(q);
  }
  return questions;
}
