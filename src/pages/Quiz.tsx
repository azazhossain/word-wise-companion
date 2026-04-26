import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ALL_WORDS, splitList, wordsByPart } from "@/data/words";
import { generateQuestions, type MCQ } from "@/lib/mcqEngine";
import { useStreak } from "@/hooks/useProgress";
import { useSaved } from "@/hooks/useSaved";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Quiz = () => {
  const { mode, part } = useParams();
  const [search] = useSearchParams();
  const count = Number(search.get("count") || 10);
  const isMock = mode === "mock" || search.get("mode") === "mock";
  const navigate = useNavigate();
  const { recordActivity } = useStreak();
  const { ids: savedIds } = useSaved();

  const questions = useMemo<MCQ[]>(() => {
    let pool = ALL_WORDS;
    if (mode === "part" && part) pool = wordsByPart(Number(part));
    if (mode === "saved") pool = ALL_WORDS.filter((w) => savedIds.has(w.id));
    if (pool.length < 4) return [];
    return generateQuestions({ pool, count });
  }, [mode, part, count, savedIds]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    if (finished) {
      recordActivity(correctCount, count).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">প্রশ্ন তৈরি করা যায়নি।</p>
        <Button onClick={() => navigate(-1)}>ফিরে যান</Button>
      </div>
    );
  }

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
    if (!isMock) {
      setRevealed(true);
      if (i === q.correctIndex) setCorrectCount((c) => c + 1);
    } else {
      // Mock: count immediately, auto-advance
      if (i === q.correctIndex) setCorrectCount((c) => c + 1);
      setTimeout(() => next(i), 200);
    }
  };

  const next = (forcedSelected?: number) => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 animate-scale-in">
        <div className="gradient-hero flex h-32 w-32 items-center justify-center rounded-full text-primary-foreground shadow-elegant">
          <p className="text-4xl font-bold">{pct}%</p>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">দারুণ চেষ্টা!</h2>
          <p className="mt-2 text-muted-foreground">
            {correctCount} / {questions.length} সঠিক
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button onClick={() => { setIdx(0); setSelected(null); setRevealed(false); setCorrectCount(0); setFinished(false); }}>
            আবার চেষ্টা করুন
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>হোমে ফিরুন</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background animate-fade-in">
      <header className="safe-top flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{isMock ? "Mock Test" : "Practice"}</p>
          <p className="text-sm font-semibold">প্রশ্ন {idx + 1} / {questions.length}</p>
        </div>
        <span className="rounded-lg bg-success/10 px-2 py-1 text-xs font-bold text-success">{correctCount}</span>
      </header>

      <Progress value={((idx + 1) / questions.length) * 100} className="h-1 rounded-none" />

      <div className="flex-1 p-5">
        <Card className="gradient-hero p-6 text-primary-foreground shadow-elegant">
          <p className="text-xs uppercase tracking-wide opacity-80">{q.promptSub}</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight">{q.prompt}</h2>
        </Card>

        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = i === selected;
            const showCorrect = revealed && isCorrect;
            const showWrong = revealed && isSelected && !isCorrect;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border-2 bg-card p-4 text-left text-sm font-medium transition-all active:scale-[0.98]",
                  !revealed && isSelected && "border-primary bg-secondary",
                  !revealed && !isSelected && "border-border",
                  showCorrect && "border-success bg-success/10 text-success",
                  showWrong && "animate-shake border-destructive bg-destructive/10 text-destructive",
                  revealed && !isCorrect && !isSelected && "opacity-60"
                )}
              >
                <span className="flex-1">{opt}</span>
                {showCorrect && <Check className="h-5 w-5" />}
                {showWrong && <X className="h-5 w-5" />}
              </button>
            );
          })}
        </div>
      </div>

      {revealed && !isMock && (
        <div className="max-h-[55vh] overflow-y-auto border-t border-border bg-card p-4 animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">শব্দ</p>
              <p className="text-lg font-bold">{q.word.headword}</p>
            </div>
            <span
              className={cn(
                "rounded-lg px-2 py-1 text-[11px] font-bold",
                selected === q.correctIndex
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {selected === q.correctIndex ? "সঠিক" : "ভুল"}
            </span>
          </div>

          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-success">সঠিক উত্তর</p>
            <p className="mt-0.5 text-sm font-semibold text-success">
              {q.options[q.correctIndex]}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wide text-primary">অর্থ</p>
            <p className="mt-0.5 text-sm">{q.word.meaning}</p>
          </div>

          {q.word.synonyms && (
            <div className="mt-2">
              <p className="text-[11px] uppercase tracking-wide text-success">Synonyms</p>
              <p className="mt-0.5 text-sm">{splitList(q.word.synonyms).join(", ")}</p>
            </div>
          )}

          {q.word.antonyms && (
            <div className="mt-2">
              <p className="text-[11px] uppercase tracking-wide text-destructive">Antonyms</p>
              <p className="mt-0.5 text-sm">{splitList(q.word.antonyms).join(", ")}</p>
            </div>
          )}

          <Button onClick={() => next()} className="mt-4 w-full gap-1">
            পরবর্তী <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
