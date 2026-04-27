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
  Shuffle,
  ListOrdered,
  BookmarkCheck,
  Bookmark,
  Star,
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

const sortById = <T extends { id: number }>(a: T[]) =>
  [...a].sort((x, y) => x.id - y.id);

// Horizontal swipe thresholds
const SWIPE_THRESHOLD = 60;        // px of horizontal movement to count as a swipe
const VELOCITY_THRESHOLD = 0.35;   // px/ms (fast flicks count even if shorter)
const TAP_MOVE_TOLERANCE = 8;      // px — anything below counts as a tap (flip)
const VERTICAL_GUARD = 1.2;        // |dx| must beat |dy| * this to count as horizontal

const Flashcards = () => {
  const [search, setSearch] = useSearchParams();
  const partParam = search.get("part");
  const selectedPart = partParam ? Number(partParam) : null;

  const sourceWords = useMemo<Word[]>(
    () => (selectedPart ? wordsByPart(selectedPart) : ALL_WORDS),
    [selectedPart]
  );

  const [shuffled, setShuffled] = useState(false);
  const [deck, setDeck] = useState<Word[]>(() => sortById(sourceWords));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const draggingRef = useRef(false);
  const { isMemorized, toggle: toggleMemo } = useMemorized();
  const { isSaved, toggle: toggleSaved } = useSaved();

  // Reset deck whenever the part filter or shuffle mode changes
  useEffect(() => {
    setDeck(shuffled ? shuffleArr(sourceWords) : sortById(sourceWords));
    setIdx(0);
    setFlipped(false);
  }, [sourceWords, shuffled]);

  const w = deck[idx];
  const memo = w ? isMemorized(w.id) : false;
  const saved = w ? isSaved(w.id) : false;

  // Always show the front face when moving to a new card
  useEffect(() => {
    setFlipped(false);
  }, [idx]);

  const goNext = () => {
    if (idx >= deck.length - 1) return;
    setIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (idx === 0) return;
    setIdx((i) => Math.max(i - 1, 0));
  };
  const reshuffle = () => {
    setDeck(shuffled ? shuffleArr(sourceWords) : sortById(sourceWords));
    setIdx(0);
  };
  const toggleShuffle = () => setShuffled((s) => !s);

  const setPart = (p: number | null) => {
    if (p === null) setSearch({});
    else setSearch({ part: String(p) });
  };

  // --- Simple horizontal swipe (no rotation, no drag visual) ----------------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    draggingRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!draggingRef.current && Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE) {
      draggingRef.current = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const start = startRef.current;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
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

    // Tap → flip card
    if (!wasDragging) {
      setFlipped((f) => !f);
      return;
    }

    // Must be a mostly-horizontal motion
    const horizontal = Math.abs(dx) > Math.abs(dy) * VERTICAL_GUARD;
    const passed =
      horizontal &&
      (Math.abs(dx) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD);
    if (!passed) return;

    if (dx > 0) {
      // right swipe → next word
      if (idx < deck.length - 1) goNext();
    } else {
      // left swipe → previous word
      if (idx > 0) goPrev();
    }
  };

  const onPointerCancel = () => {
    startRef.current = null;
    draggingRef.current = false;
  };
  // -------------------------------------------------------------------------

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
              {deck.length === 0 ? 0 : idx + 1} / {deck.length} ·{" "}
              {shuffled ? "র‍্যান্ডম" : "ক্রমানুসারে"}
            </p>
          </div>
          <Button
            size="icon"
            variant={shuffled ? "default" : "outline"}
            onClick={toggleShuffle}
            aria-label={shuffled ? "Switch to serial order" : "Shuffle"}
            className={cn(shuffled && "gradient-card text-primary-foreground border-0")}
          >
            {shuffled ? (
              <Shuffle className="h-4 w-4" />
            ) : (
              <ListOrdered className="h-4 w-4" />
            )}
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
            {/* card (tap to flip, swipe left/right to navigate) */}
            <div
              className="relative z-10 h-80 w-full max-w-sm touch-pan-y select-none"
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
                  <p className="absolute bottom-4 px-4 text-center text-[11px] opacity-70">
                    ট্যাপ: উল্টান · ⬅ পূর্ববর্তী · পরবর্তী ➡
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
              disabled={idx === 0}
              className="h-14 gap-2 text-base font-semibold"
            >
              <ChevronLeft className="h-6 w-6" />
              পূর্ববর্তী
            </Button>
            <Button
              size="lg"
              onClick={goNext}
              disabled={idx >= deck.length - 1}
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
