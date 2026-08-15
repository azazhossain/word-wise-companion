import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, ChevronRight, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PREVIOUS_YEAR_QUESTIONS, findVocabularyForQuestion, findVocabularyForValue, sectionLabel, type PreviousYearQuestion } from "@/data/previousYears";
import { splitList } from "@/data/words";
import { useStreak } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const PreviousYearQuiz = () => {
  const { part } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { recordActivity } = useStreak();
  const selectedPart = part ? Number(part) : null;
  const requestedCount = Number(search.get("count") || 20);
  const questions = useMemo(() => {
    const source = selectedPart
      ? PREVIOUS_YEAR_QUESTIONS.filter((question) => question.part === selectedPart)
      : PREVIOUS_YEAR_QUESTIONS;
    const section = search.get("section");
    const filtered = section === "synonym" || section === "antonym"
      ? source.filter((question) => question.section === section)
      : source;
    return shuffle(filtered).slice(0, Math.min(Math.max(requestedCount, 1), filtered.length));
  }, [requestedCount, search, selectedPart]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) recordActivity(score, questions.length).catch(() => {});
  }, [finished, questions.length, recordActivity, score]);

  const question = questions[index];
  const answered = selected !== null;

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (!questions.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-lg font-bold">এই filter-এ কোনো প্রশ্ন নেই</p>
        <p className="text-sm text-muted-foreground">আগের বছরের প্রশ্নে ফিরে গিয়ে অন্য অংশ বেছে নিন।</p>
        <Button onClick={() => navigate("/previous-years")}>প্রশ্নে ফিরুন</Button>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-10 animate-scale-in">
        <div className="gradient-hero flex h-32 w-32 flex-col items-center justify-center rounded-full text-primary-foreground shadow-elegant">
          <span className="text-4xl font-bold">{percent}%</span>
          <span className="text-[10px] uppercase tracking-wide opacity-75">score</span>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Archive complete</p>
          <h1 className="mt-2 text-2xl font-bold">ভালো হয়েছে। আবার একবার?</h1>
          <p className="mt-2 text-sm text-muted-foreground">{score} / {questions.length}টি সঠিক হয়েছে</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button onClick={restart} className="gap-2"><RotateCcw className="h-4 w-4" /> আবার চেষ্টা করুন</Button>
          <Link to={selectedPart ? `/previous-years/${selectedPart}` : "/previous-years"} data-testid="link-previous-year-quiz-finish-back" className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold transition hover:bg-secondary">
            প্রশ্নের তালিকায় ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  const choose = (optionIndex: number) => {
    if (answered) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) setScore((value) => value + 1);
  };

  const next = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background animate-fade-in">
      <header className="safe-top flex items-center gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md">
        <Button size="icon" variant="ghost" onClick={() => navigate(-1)} aria-label="ফিরে যান" data-testid="button-previous-year-quiz-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{selectedPart ? `পার্ট ${selectedPart}` : "সব পার্ট"} · {sectionLabel(question.section)}</p>
          <p className="text-sm font-semibold">প্রশ্ন {index + 1} / {questions.length}</p>
        </div>
        <span className="rounded-lg bg-success/10 px-2 py-1 text-xs font-bold text-success">{score}</span>
      </header>
      <Progress value={((index + 1) / questions.length) * 100} className="h-1 rounded-none" />

      <main className="flex-1 overflow-y-auto px-4 py-5">
        <Card className="gradient-hero p-5 text-primary-foreground shadow-elegant">
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>Previous year · P{question.part}</span>
            <span>Q{question.number}</span>
          </div>
          <h1 className="mt-5 text-xl font-bold leading-relaxed">{question.prompt}</h1>
        </Card>

        <div className="mt-5 space-y-2.5">
          {question.options.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.correctIndex;
            const isSelected = optionIndex === selected;
            return (
              <button
                type="button"
                key={`${question.id}-${option}`}
                onClick={() => choose(optionIndex)}
                disabled={answered}
                data-testid={`button-previous-year-option-${question.id}-${optionIndex}`}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left text-sm font-medium transition active:scale-[0.98]",
                  !answered && "border-border hover:border-primary/50 hover:bg-secondary/40",
                  answered && isCorrect && "border-success bg-success/10 text-success",
                  answered && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                  answered && !isCorrect && !isSelected && "border-border opacity-55"
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">{String.fromCharCode(65 + optionIndex)}</span>
                <span className="flex-1">{option}</span>
                {answered && isCorrect && <Check className="h-5 w-5" />}
                {answered && isSelected && !isCorrect && <X className="h-5 w-5" />}
              </button>
            );
          })}
        </div>

        {answered && <QuestionFeedback question={question} selected={selected} />}
      </main>

      {answered && (
        <div className="border-t border-border bg-card/90 p-4 safe-bottom backdrop-blur-md">
          <Button onClick={next} className="w-full gap-1.5" data-testid="button-previous-year-next">
            {index === questions.length - 1 ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const Detail = ({ word, label }: { word: NonNullable<ReturnType<typeof findVocabularyForQuestion>>; label: string }) => (
  <div className="rounded-xl border border-border/80 bg-card p-3">
    <p className="text-xs font-bold text-foreground">{label}: {word.headword}</p>
    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{word.meaning}</p>
    <div className="mt-2 space-y-1.5 text-xs">
      {word.synonyms && <p><span className="font-semibold text-success">Synonyms:</span> {splitList(word.synonyms).join(", ")}</p>}
      {word.antonyms && <p><span className="font-semibold text-destructive">Antonyms:</span> {splitList(word.antonyms).join(", ")}</p>}
    </div>
  </div>
);

const QuestionFeedback = ({ question, selected }: { question: PreviousYearQuestion; selected: number }) => {
  const correctWord = findVocabularyForQuestion(question);
  const wrongWords = question.options
    .map((option, optionIndex) => ({
      option,
      optionIndex,
      word: findVocabularyForValue(option),
    }))
    .filter((item) => item.optionIndex !== question.correctIndex);
  const isCorrect = selected === question.correctIndex;

  return (
    <section className="mt-5 space-y-3 animate-slide-up" data-testid={`feedback-previous-year-${question.id}`}>
      <div className={cn("rounded-xl border p-4", isCorrect ? "border-success/25 bg-success/5" : "border-destructive/25 bg-destructive/5")}>
        <div className="flex items-center gap-2">
          {isCorrect ? <CheckCircle2 className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />}
          <p className={cn("text-sm font-bold", isCorrect ? "text-success" : "text-destructive")}>{isCorrect ? "সঠিক উত্তর" : "ভুল হয়েছে"}</p>
        </div>
        <p className="mt-2 text-sm">সঠিক উত্তর: <span className="font-bold">{question.options[question.correctIndex]}</span></p>
      </div>
      {correctWord && <Detail word={correctWord} label="শব্দের নোট" />}
      {wrongWords.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.13em] text-muted-foreground">ভুল option-এর vocabulary</p>
          <div className="space-y-2">
            {wrongWords.map(({ option, word, optionIndex }) =>
              word ? (
                <Detail key={`${option}-${optionIndex}`} word={word} label={`Option · ${option}`} />
              ) : (
                <div key={`${option}-${optionIndex}`} className="rounded-xl border border-border/80 bg-card p-3">
                  <p className="text-xs font-bold text-foreground">Option · {option}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    এই অপশনের বিস্তারিত শব্দতালিকায় পাওয়া যায়নি।
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PreviousYearQuiz;