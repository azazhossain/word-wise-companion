import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, Search, Sparkles } from "lucide-react";
import { PREVIOUS_YEAR_PARTS, PREVIOUS_YEAR_QUESTIONS, sectionLabel, type PreviousYearSection } from "@/data/previousYears";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Filter = "all" | PreviousYearSection;

const PreviousYears = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visibleQuestions = useMemo(() => {
    const search = query.trim().toLowerCase();
    return PREVIOUS_YEAR_QUESTIONS.filter((question) => {
      const matchesFilter = filter === "all" || question.section === filter;
      const matchesSearch =
        !search ||
        question.prompt.toLowerCase().includes(search) ||
        question.options.some((option) => option.toLowerCase().includes(search));
      return matchesFilter && matchesSearch;
    });
  }, [filter, query]);

  return (
    <div className="animate-fade-in pb-6">
      <header className="safe-top border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="হোমে ফিরুন"
            data-testid="link-previous-years-home"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Archive / 01</p>
            <h1 className="text-lg font-bold">আগের বছরের প্রশ্ন</h1>
          </div>
          <div className="rounded-xl bg-secondary px-2.5 py-1.5 text-center">
            <p className="text-sm font-bold text-secondary-foreground">{PREVIOUS_YEAR_QUESTIONS.length}</p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">প্রশ্ন</p>
          </div>
        </div>
      </header>

      <section className="px-4 pb-2 pt-5">
        <div className="gradient-hero relative overflow-hidden rounded-2xl p-5 text-primary-foreground shadow-elegant">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/20" />
          <div className="absolute -bottom-14 right-8 h-28 w-28 rounded-full border border-white/10" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-80">
              <ClipboardList className="h-4 w-4" />
              পরীক্ষার archive
            </div>
            <h2 className="mt-3 max-w-[18rem] text-2xl font-bold leading-tight">
              যে প্রশ্ন এসেছে,<br />সেটাই আবার ঝালাই করুন।
            </h2>
            <p className="mt-2 max-w-[19rem] text-sm leading-relaxed opacity-85">
              পার্ট ধরে পড়ুন, answer key মিলিয়ে নিন, তারপর timed practice-এ যান।
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                to="/previous-years/quiz"
                data-testid="link-previous-years-all-quiz"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-primary shadow-soft transition active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" /> সব প্রশ্নে quiz
              </Link>
              <span className="inline-flex items-center rounded-lg border border-white/25 px-3 py-2 text-xs font-medium">
                {PREVIOUS_YEAR_PARTS.length}টি পার্ট
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 px-4 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="প্রশ্ন বা option খুঁজুন"
            aria-label="প্রশ্ন খুঁজুন"
            data-testid="input-previous-years-search"
            className="h-11 rounded-xl border-border bg-card pl-9 shadow-soft"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["all", "synonym", "antonym"] as Filter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              data-testid={`button-filter-previous-years-${value}`}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95",
                filter === value
                  ? "gradient-card border-transparent text-primary-foreground shadow-card"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              )}
            >
              {value === "all" ? "সব প্রশ্ন" : sectionLabel(value)}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Browse by part</p>
            <h2 className="mt-1 text-base font-bold">পার্ট বেছে নিন</h2>
          </div>
          <span className="text-xs text-muted-foreground">{visibleQuestions.length}টি match</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {PREVIOUS_YEAR_PARTS.map((part) => {
            const count = PREVIOUS_YEAR_QUESTIONS.filter((question) => {
              return question.part === part && (filter === "all" || question.section === filter);
            }).length;
            return (
              <Link
                key={part}
                to={`/previous-years/${part}`}
                data-testid={`link-previous-years-part-${part}`}
                className="group rounded-xl border border-border bg-card p-3.5 text-foreground no-underline shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
                    {part}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-3 text-sm font-bold">পার্ট {part}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{count}টি প্রশ্ন</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Answer key beside each</p>
            <h2 className="mt-1 text-base font-bold">সব প্রশ্ন একসাথে</h2>
          </div>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </div>
        {visibleQuestions.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 border-dashed p-8 text-center shadow-soft">
            <Search className="h-7 w-7 text-muted-foreground/60" />
            <p className="font-semibold">কোনো প্রশ্ন মেলেনি</p>
            <p className="text-xs text-muted-foreground">অন্য শব্দ দিয়ে খুঁজে দেখুন বা filter বদলান।</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {visibleQuestions.map((question) => (
              <Card key={question.id} data-testid={`card-previous-year-question-${question.id}`} className="border-border/80 p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-bold text-secondary-foreground">
                      P{question.part} · Q{question.number}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {sectionLabel(question.section)}
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[10px] font-bold text-success">
                    <CheckCircle2 className="h-3 w-3" /> {question.answer}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium leading-relaxed">{question.prompt}</p>
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const correct = optionIndex === question.correctIndex;
                    return (
                      <div
                        key={`${question.id}-${optionIndex}`}
                        className={cn(
                          "rounded-lg border px-2.5 py-2 text-xs",
                          correct
                            ? "border-success/30 bg-success/10 font-semibold text-success"
                            : "border-border/60 text-muted-foreground",
                        )}
                      >
                        <span className="mr-1 font-bold">{String.fromCharCode(65 + optionIndex)}.</span>
                        {option}
                        {correct && <span className="ml-1 text-[10px] uppercase">✓ উত্তর</span>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PreviousYears;