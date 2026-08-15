import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PREVIOUS_YEAR_QUESTIONS, answerLetter, questionsByPart, sectionLabel } from "@/data/previousYears";
import { cn } from "@/lib/utils";

const PreviousYearPart = () => {
  const { part } = useParams();
  const partNumber = Number(part);
  const [section, setSection] = useState<"all" | "synonym" | "antonym">("all");
  const [query, setQuery] = useState("");
  const source = useMemo(() => questionsByPart(partNumber), [partNumber]);
  const questions = useMemo(() => {
    const search = query.trim().toLowerCase();
    return source.filter((question) => {
      const matchesSection = section === "all" || question.section === section;
      const matchesSearch =
        !search ||
        question.prompt.toLowerCase().includes(search) ||
        question.options.some((option) => option.toLowerCase().includes(search));
      return matchesSection && matchesSearch;
    });
  }, [query, section, source]);

  if (!Number.isInteger(partNumber) || !source.length) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-3 px-6 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
        <h1 className="text-lg font-bold">এই পার্টে প্রশ্ন নেই</h1>
        <p className="text-sm text-muted-foreground">অন্য কোনো পার্ট বেছে নিয়ে আবার শুরু করুন।</p>
        <Link to="/previous-years" className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">আর্কাইভে ফিরুন</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-6">
      <header className="safe-top sticky top-0 z-20 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/previous-years" aria-label="আগের বছরের প্রশ্নে ফিরুন" data-testid="link-previous-year-part-back" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Previous questions</p>
            <h1 className="text-lg font-bold">পার্ট {partNumber}</h1>
          </div>
          <Link to={`/previous-years/quiz/${partNumber}`} data-testid={`link-previous-year-part-quiz-${partNumber}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-card transition active:scale-95">
            <Sparkles className="h-3.5 w-3.5" /> Quiz
          </Link>
        </div>
      </header>

      <section className="gradient-hero mx-4 mt-4 rounded-2xl p-5 text-primary-foreground shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">Part {partNumber} archive</p>
            <h2 className="mt-2 text-2xl font-bold">{source.length}টি প্রশ্ন</h2>
            <p className="mt-1 text-sm opacity-80">Answer key পাশে রেখে দ্রুত revision করুন।</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
            <ClipboardList className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <span className="block text-lg font-bold">{source.filter((q) => q.section === "synonym").length}</span>
            Synonym
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <span className="block text-lg font-bold">{source.filter((q) => q.section === "antonym").length}</span>
            Antonym
          </div>
        </div>
      </section>

      <section className="space-y-3 px-4 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="এই পার্টে খুঁজুন" aria-label="পার্টের প্রশ্ন খুঁজুন" data-testid="input-previous-year-part-search" className="h-11 rounded-xl bg-card pl-9 shadow-soft" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["all", "synonym", "antonym"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setSection(value)} data-testid={`button-previous-year-part-filter-${value}`} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95", section === value ? "gradient-card border-transparent text-primary-foreground shadow-card" : "border-border bg-card text-muted-foreground")}>
              {value === "all" ? "সব" : sectionLabel(value)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 px-4 pt-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Showing {questions.length} of {source.length}</p>
            <h2 className="mt-1 text-base font-bold">প্রশ্ন ও answer key</h2>
          </div>
          <span className="text-xs font-semibold text-success">উত্তর পাশে আছে</span>
        </div>
        {questions.length === 0 ? (
          <Card className="border-dashed p-8 text-center shadow-soft">
            <p className="font-semibold">কোনো প্রশ্ন মেলেনি</p>
            <p className="mt-1 text-xs text-muted-foreground">Search বা filter বদলে দেখুন।</p>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id} data-testid={`card-previous-year-part-question-${question.id}`} className="overflow-hidden border-border/80 shadow-soft">
              <div className="flex items-start gap-3 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">{sectionLabel(question.section)}</span>
                    <span className="text-[10px] text-muted-foreground">Q{question.number}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed">{question.prompt}</p>
                  <div className="mt-3 rounded-xl border border-success/25 bg-success/5 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Answer {question.answer}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-success">{question.options[question.correctIndex]}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-border/70 bg-muted/20 px-4 py-3 sm:grid-cols-4">
                {question.options.map((option, optionIndex) => (
                  <div key={`${question.id}-${option}`} className={cn("rounded-lg px-2 py-1.5 text-xs", optionIndex === question.correctIndex ? "bg-success/10 font-semibold text-success" : "text-muted-foreground")}>
                    <span className="mr-1 font-bold">{answerLetter(optionIndex)}.</span>{option}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </section>

      {questions.length > 0 && (
        <Link to={`/previous-years/quiz/${partNumber}`} data-testid="link-previous-year-part-bottom-quiz" className="mx-4 mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-card transition active:scale-[0.98]">
          এই পার্টে quiz শুরু করুন <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

export default PreviousYearPart;