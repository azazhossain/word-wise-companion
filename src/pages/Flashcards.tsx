import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ALL_WORDS, PARTS, splitList, wordsByPart, type Word } from "@/data/words";
import { useMemorized } from "@/hooks/useProgress";
import { useSaved } from "@/hooks/useSaved";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BookmarkCheck,
  Bookmark,
  Star,
  X as XIcon,
  Check as CheckIcon,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const shuffleArr = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const SWIPE_THRESHOLD = 90;
const VELOCITY_THRESHOLD = 0.4;
const TAP_MOVE_TOLERANCE = 6;

const Flashcards = () => {
  const [search, setSearch] = useSearchParams();
  const partParam = search.get("part");
  const selectedPart = partParam ? Number(partParam) : null;

  const sourceWords = useMemo<Word[]>(
    () => (selectedPart ? wordsByPart(selectedPart) : ALL_WORDS),
    [selectedPart]
  );

  const [deck, setDeck] = useState<Word[]>(() => shuffleArr(sourceWords));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exit, setExit] = useState<{ dir: 1 | -1 } | null>(null);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const draggingRef = useRef(false);
  const { isMemorized, toggle: toggleMemo } = useMemorized();
  const { isSaved, toggle: toggleSaved } = useSaved();

  // Reset deck whenever the part filter changes
  useEffect(() => {
    setDeck(shuffleArr(sourceWords));
    setIdx(0);
    setFlipped(false);
    setDrag({ x: 0, y: 0 });
    setExit(null);
  }, [sourceWords]);

  const w = deck[idx];
  const nextW = deck[idx + 1];
  const memo = w ? isMemorized(w.id) : false;
  const saved = w ? isSaved(w.id) : false;

  useEffect(() => {
    setFlipped(false);
    setDrag({ x: 0, y: 0 });
    setExit(null);
  }, [idx]);

  const advance = (dir: 1 | -1) => {
    if (idx >= deck.length - 1) {
      setDrag({ x: 0, y: 0 });
      return;
    }
    setExit({ dir });
    window.setTimeout(() => setIdx((i) => i + 1), 220);
  };

  const goNext = () => {
    if (exit || idx >= deck.length - 1) return;
    setIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (exit || idx === 0) return;
    setIdx((i) => Math.max(i - 1, 0));
  };
  const reshuffle = () => {
    setDeck(shuffleArr(sourceWords));
    setIdx(0);
  };

  const setPart = (p: number | null) => {
    if (p === null) setSearch({});
    else setSearch({ part: String(p) });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exit) return;
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    draggingRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current || exit) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!draggingRef.current && Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE) {
      draggingRef.current = true;
    }
    if (draggingRef.current) setDrag({ x: dx, y: dy });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const start = startRef.current;
    const dx = e.clientX - start.x;
    const dt = Math.max(Date.now() - start.t, 1);
    const velocity = Math.abs(dx) / dt;
    const wasDragging = draggingRef.current;
    startRef.current = null;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (!wasDragging) {
      setFlipped((f) => !f);
      return;
    }

    if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      const dir: 1 | -1 = dx > 0 ? 1 : -1;
      if (dir === 1 && w && !isMemorized(w.id)) toggleMemo(w.id);
      advance(dir);
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  const onPointerCancel = () => {
    startRef.current = null;
    draggingRef.current = false;
    setDrag({ x: 0, y: 0 });
  };

  const cardTransform = useMemo(() => {
    if (exit) {
      return `translate3d(${exit.dir * (typeof window !== "undefined" ? window.innerWidth : 400) * 1.2}px, 0, 0) rotate(${exit.dir * 25}deg)`;
    }
    const rot = drag.x * 0.06;
    return `translate3d(${drag.x}px, ${drag.y * 0.15}px, 0) rotate(${rot}deg)`;
  }, [drag, exit]);

  const swipeProgress = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1);
  const progressPct = deck.length ? Math.round(((idx + 1) / deck.length) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-background animate-fade-in">
      <header className="safe-top sticky top-0 z-20 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button size="icon" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gradient">ফ্ল্যাশকার্ড</h1>
            <p className="text-xs text-muted-foreground">
              {selectedPart ? `পার্ট ${selectedPart} · ` : "সব পার্ট · "}
              {deck.length === 0 ? 0 : idx + 1} / {deck.length}
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={reshuffle} aria-label="Shuffle">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Part picker chips */}
        <div className="mt-3 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setPart(null)}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition",
              selectedPart === null
                ? "gradient-card border-transparent text-primary-foreground shadow-card"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            <Layers className="h-3 w-3" /> সব
          </button>
          {PARTS.map((p) => (
            <button
              key={p}
              onClick={() => setPart(p)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition",
                selectedPart === p
                  ? "gradient-card border-transparent text-primary-foreground shadow-card"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              পার্ট {p}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full gradient-hero transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {!w ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            {sourceWords.length === 0
              ? "এই পার্টে কোনো শব্দ নেই।"
              : "শেষ! আবার শুরু করুন।"}
          </p>
          <Button onClick={reshuffle}>আবার শুরু</Button>
        </div>
      ) : (
        <>
          <div className="relative flex flex-1 items-center justify-center px-6 py-4">
            {/* next-card stack underneath */}
            {nextW && (
              <div
                className="pointer-events-none absolute h-80 w-full max-w-sm opacity-60"
                style={{ transform: "scale(0.95) translateY(10px)" }}
              >
                <Card className="gradient-hero flex h-full w-full flex-col items-center justify-center p-6 text-primary-foreground shadow-elegant">
                  <p className="text-xs uppercase tracking-widest opacity-70">
                    পার্ট {nextW.part}
                  </p>
                  <h2 className="mt-3 text-center text-3xl font-bold">
                    {nextW.headword}
                  </h2>
                </Card>
              </div>
            )}

            {/* swipe direction overlays */}
            {drag.x !== 0 && !exit && (
              <>
                <div
                  className="pointer-events-none absolute left-8 top-1/2 z-20 -translate-y-1/2 rounded-2xl border-4 border-success bg-success/20 px-5 py-2 text-xl font-bold text-success rotate-[-12deg]"
                  style={{ opacity: drag.x > 0 ? swipeProgress : 0 }}
                >
                  মুখস্ত
                </div>
                <div
                  className="pointer-events-none absolute right-8 top-1/2 z-20 -translate-y-1/2 rounded-2xl border-4 border-destructive bg-destructive/20 px-5 py-2 text-xl font-bold text-destructive rotate-[12deg]"
                  style={{ opacity: drag.x < 0 ? swipeProgress : 0 }}
                >
                  স্কিপ
                </div>
              </>
            )}

            {/* draggable card */}
            <div
              className="relative z-10 h-80 w-full max-w-sm touch-none select-none"
              style={{
                transform: cardTransform,
                opacity: exit ? 0 : 1,
                transition: exit
                  ? "transform 220ms ease-out, opacity 220ms ease-out"
                  : startRef.current
                  ? "none"
                  : "transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1)",
                willChange: "transform",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            >
              <div
                className="relative h-full w-full preserve-3d"
                style={{
                  transition: "transform 500ms",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <Card className="gradient-hero absolute inset-0 flex flex-col items-center justify-center p-6 text-primary-foreground shadow-elegant ring-glow backface-hidden">
                  <p className="text-xs uppercase tracking-widest opacity-70">
                    পার্ট {w.part}
                  </p>
                  <h2 className="mt-3 text-center text-3xl font-bold">
                    {w.headword}
                  </h2>
                  <p className="absolute bottom-4 text-xs opacity-70">
                    ট্যাপ: উল্টান · swipe ➡ মুখস্ত
                  </p>
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
                      <p className="mt-0.5 text-sm">
                        {splitList(w.synonyms).join(", ")}
                      </p>
                    </div>
                  )}
                  {w.antonyms && (
                    <div>
                      <p className="text-xs uppercase text-destructive">Antonyms</p>
                      <p className="mt-0.5 text-sm">
                        {splitList(w.antonyms).join(", ")}
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>

          {/* Action toolbar — save + memo */}
          <div className="grid grid-cols-2 gap-2 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-md">
            <Button
              variant={saved ? "default" : "outline"}
              onClick={() => {
                toggleSaved(w.id);
                toast(saved ? "Save থেকে সরানো হলো" : "🔖 Saved!");
              }}
              className={cn(
                "gap-1.5",
                saved && "gradient-sunset text-primary-foreground border-transparent"
              )}
            >
              <Star className={cn("h-4 w-4", saved && "fill-current")} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant={memo ? "default" : "outline"}
              onClick={() => {
                toggleMemo(w.id);
                toast(memo ? "মুখস্ত list থেকে সরানো হলো" : "✅ মুখস্ত!");
              }}
              className={cn(
                "gap-1.5",
                memo && "gradient-mint text-primary-foreground border-transparent"
              )}
            >
              {memo ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {memo ? "মুখস্ত" : "মুখস্ত মার্ক"}
            </Button>
          </div>

          {/* Big prev / next navigation */}
          <div className="grid grid-cols-2 gap-2 border-t border-border bg-card px-4 py-3 safe-bottom">
            <Button
              size="lg"
              variant="outline"
              onClick={goPrev}
              disabled={idx === 0 || !!exit}
              className="h-14 gap-2 text-base font-semibold"
            >
              <ChevronLeft className="h-6 w-6" />
              পূর্ববর্তী
            </Button>
            <Button
              size="lg"
              onClick={goNext}
              disabled={idx >= deck.length - 1 || !!exit}
              className="h-14 gap-2 gradient-card text-base font-semibold text-primary-foreground shadow-card"
            >
              পরবর্তী
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Flashcards;
