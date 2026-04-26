import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ALL_WORDS, splitList } from "@/data/words";
import { useMemorized } from "@/hooks/useProgress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, BookmarkCheck, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const shuffle = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const Flashcards = () => {
  const [deck, setDeck] = useState(() => shuffle(ALL_WORDS));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { isMemorized, toggle } = useMemorized();

  const w = deck[idx];
  const memo = isMemorized(w.id);

  const next = () => { setFlipped(false); setIdx((i) => Math.min(i + 1, deck.length - 1)); };
  const prev = () => { setFlipped(false); setIdx((i) => Math.max(i - 1, 0)); };
  const reshuffle = () => { setDeck(shuffle(ALL_WORDS)); setIdx(0); setFlipped(false); };

  return (
    <div className="flex min-h-screen flex-col bg-background animate-fade-in">
      <header className="safe-top flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <Link to="/"><Button size="icon" variant="ghost"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">ফ্ল্যাশকার্ড</h1>
          <p className="text-xs text-muted-foreground">{idx + 1} / {deck.length}</p>
        </div>
        <Button size="icon" variant="ghost" onClick={reshuffle}><RefreshCw className="h-4 w-4" /></Button>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div
          className="relative h-80 w-full max-w-sm cursor-pointer preserve-3d transition-transform duration-500"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <Card className="gradient-hero absolute inset-0 flex flex-col items-center justify-center p-6 text-primary-foreground shadow-elegant backface-hidden">
            <p className="text-xs uppercase tracking-widest opacity-70">পার্ট {w.part}</p>
            <h2 className="mt-3 text-center text-3xl font-bold">{w.headword}</h2>
            <p className="absolute bottom-4 text-xs opacity-70">ট্যাপ করুন উল্টানোর জন্য</p>
          </Card>
          {/* Back */}
          <Card
            className="absolute inset-0 flex flex-col gap-3 overflow-y-auto bg-card p-5 shadow-elegant backface-hidden"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div>
              <p className="text-xs uppercase text-primary">অর্থ</p>
              <p className="mt-0.5 font-medium">{w.meaning}</p>
            </div>
            {w.synonyms && (
              <div>
                <p className="text-xs uppercase text-success">Synonyms</p>
                <p className="mt-0.5 text-sm">{splitList(w.synonyms).join(", ")}</p>
              </div>
            )}
            {w.antonyms && (
              <div>
                <p className="text-xs uppercase text-destructive">Antonyms</p>
                <p className="mt-0.5 text-sm">{splitList(w.antonyms).join(", ")}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-2 border-t border-border bg-card p-4">
        <Button variant="outline" onClick={prev} disabled={idx === 0}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant={memo ? "default" : "outline"}
          onClick={() => toggle(w.id)}
          className={cn("gap-1.5", memo && "bg-success hover:bg-success/90")}
        >
          {memo ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {memo ? "মুখস্ত" : "মুখস্ত করুন"}
        </Button>
        <Button variant="outline" onClick={next} disabled={idx >= deck.length - 1}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Flashcards;
