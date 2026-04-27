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
const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.35;
const TAP_MOVE_TOLERANCE = 8;
const VERTICAL_GUARD = 1.2;
const EXIT_MS = 240;       // slide-out duration
const ENTER_MS = 280;      // slide-in duration

type Anim =
  | { phase: "idle" }
  | { phase: "exit"; dir: 1 | -1 }            // current card slides out
  | { phase: "enter"; from: 1 | -1 };         // new card slides in from `from`

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
  const [drag, setDrag] = useState(0);                  // current finger dx
  const [anim, setAnim] = useState<Anim>({ phase: "idle" });
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const draggingRef = useRef(false);
  const widthRef = useRef(360);
  const { isMemorized, toggle: toggleMemo } = useMemorized();
  const { isSaved, toggle: toggleSaved } = useSaved();

  // Reset deck whenever the part filter or shuffle mode changes
  useEffect(() => {
    setDeck(shuffled ? shuffleArr(sourceWords) : sortById(sourceWords));
    setIdx(0);
    setFlipped(false);
    setDrag(0);
    setAnim({ phase: "idle" });
  }, [sourceWords, shuffled]);

  const w = deck[idx];
  const memo = w ? isMemorized(w.id) : false;
  const saved = w ? isSaved(w.id) : false;

  // Always show the front face when arriving on a new card
  useEffect(() => {
    setFlipped(false);
  }, [idx]);

  // After enter animation finishes, return to idle
  useEffect(() => {
    if (anim.phase !== "enter") return;
    const t = window.setTimeout(() => setAnim({ phase: "idle" }), ENTER_MS);
    return () => window.clearTimeout(t);
  }, [anim]);

  // Animated jump: slide current card out in `exitDir`, swap idx, slide new
  // card in from the opposite side.
  const animateTo = (newIdx: number, exitDir: 1 | -1) => {
    if (newIdx < 0 || newIdx >= deck.length || newIdx === idx) {
      // no-op: just snap back to centre
      setDrag(0);
      return;
    }
    setAnim({ phase: "exit", dir: exitDir });
    window.setTimeout(() => {
      setIdx(newIdx);
      setDrag(0);
      // new card enters from the opposite side
      setAnim({ phase: "enter", from: (-exitDir) as 1 | -1 });
    }, EXIT_MS);
  };

  // NOTE: per user request: right swipe → previous, left swipe → next
  const goNext = () => {
    if (anim.phase !== "idle" || idx >= deck.length - 1) return;
    animateTo(idx + 1, -1);
  };
  const goPrev = () => {
    if (anim.phase !== "idle" || idx === 0) return;
    animateTo(idx - 1, 1);
  };
  const reshuffle = () => {
    setDeck(shuffled ? shuffleArr(sourceWords) : sortById(sourceWords));
    setIdx(0);
    setDrag(0);
    setAnim({ phase: "idle" });
  };
  const toggleShuffle = () => setShuffled((s) => !s);

  const setPart = (p: number | null) => {
    if (p === null) setSearch({});
    else setSearch({ part: String(p) });
  };

  // --- Drag handlers --------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (anim.phase !== "idle") return;
    widthRef.current = e.currentTarget.getBoundingClientRect().width || 360;
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    draggingRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current || anim.phase !== "idle") return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (!draggingRef.current && Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE) {
      // commit to a horizontal drag only
      if (Math.abs(dx) > Math.abs(dy) * VERTICAL_GUARD) {
        draggingRef.current = true;
      } else {
        // vertical scrolling — abandon
        startRef.current = null;
        return;
      }
    }
    if (draggingRef.current) setDrag(dx);
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

    const passed =
      Math.abs(dx) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD;
    if (!passed) {
      setDrag(0);
      return;
    }

    if (dx > 0) {
      // right swipe → previous word
      if (idx === 0) setDrag(0);
      else animateTo(idx - 1, 1);
    } else {
      // left swipe → next word
      if (idx >= deck.length - 1) setDrag(0);
      else animateTo(idx + 1, -1);
    }
  };

  const onPointerCancel = () => {
    startRef.current = null;
    draggingRef.current = false;
    setDrag(0);
  };
  // -------------------------------------------------------------------------

  const cardWidth = widthRef.current;

  // Compute the card transform based on drag / animation phase
  let translateX = drag;
  let opacity = 1;
  let transition = "none";
  if (anim.phase === "exit") {
    translateX = anim.dir * (cardWidth + 80);
    opacity = 0;
    transition = `transform ${EXIT_MS}ms ease-out, opacity ${EXIT_MS}ms ease-out`;
  } else if (anim.phase === "enter") {
    // First paint at off-screen position, then transition to centre.
    // We achieve this by keying the card on idx so React remounts it with
    // an initial inline transform; the post-mount effect below transitions it.
    translateX = 0;
    opacity = 1;
    transition = `transform ${ENTER_MS}ms cubic-bezier(0.2, 0.9, 0.3, 1)`;
  } else if (drag !== 0) {
    transition = "none";
  } else {
    transition = "transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1)";
  }

  // Tilt slightly while dragging for natural feel (no Tinder-style rotate)
  const tiltDeg = anim.phase === "idle" && drag !== 0 ? drag * 0.02 : 0;

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
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-4">
            {/* card (tap → flip, swipe left → next, swipe right → previous) */}
            <SwipeCard
              key={`${idx}-${anim.phase}`}
              word={w}
              flipped={flipped}
              translateX={translateX}
              tiltDeg={tiltDeg}
              opacity={opacity}
              transition={transition}
              enterFrom={anim.phase === "enter" ? anim.from : null}
              enterDistance={cardWidth + 80}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            />
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
              disabled={idx === 0 || anim.phase !== "idle"}
              className="h-14 gap-2 text-base font-semibold"
            >
              <ChevronLeft className="h-6 w-6" />
              পূর্ববর্তী
            </Button>
            <Button
              size="lg"
              onClick={goNext}
              disabled={idx >= deck.length - 1 || anim.phase !== "idle"}
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

interface SwipeCardProps {
  word: Word;
  flipped: boolean;
  translateX: number;
  tiltDeg: number;
  opacity: number;
  transition: string;
  enterFrom: 1 | -1 | null;
  enterDistance: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
}

const SwipeCard = ({
  word,
  flipped,
  translateX,
  tiltDeg,
  opacity,
  transition,
  enterFrom,
  enterDistance,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: SwipeCardProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  // When entering, set the starting off-screen transform synchronously, then
  // on next frame transition to centre.
  const [entering, setEntering] = useState(enterFrom !== null);

  useEffect(() => {
    if (enterFrom === null) return;
    setEntering(true);
    // next frame → release to final position
    const r = window.requestAnimationFrame(() => {
      const r2 = window.requestAnimationFrame(() => setEntering(false));
      // store cleanup
      (wrapRef.current as any)._raf = r2;
    });
    return () => {
      window.cancelAnimationFrame(r);
      const r2 = (wrapRef.current as any)?._raf;
      if (r2) window.cancelAnimationFrame(r2);
    };
  }, [enterFrom]);

  let tx = translateX;
  let tr = transition;
  if (enterFrom !== null && entering) {
    tx = enterFrom * enterDistance;
    tr = "none";
  }

  return (
    <div
      ref={wrapRef}
      className="relative z-10 h-80 w-full max-w-sm touch-pan-y select-none"
      style={{
        transform: `translate3d(${tx}px, 0, 0) rotate(${tiltDeg}deg)`,
        transition: tr,
        opacity,
        willChange: "transform, opacity",
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
            পার্ট {word.part}
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold">{word.headword}</h2>
          <p className="absolute bottom-4 px-4 text-center text-[11px] opacity-70">
            ট্যাপ: উল্টান · ➡ পূর্ববর্তী · পরবর্তী ⬅
          </p>
        </Card>
        {/* Back */}
        <Card
          className="absolute inset-0 flex flex-col gap-3 overflow-y-auto bg-card p-5 shadow-elegant backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div>
            <p className="text-xs uppercase text-primary">অর্থ</p>
            <p className="mt-0.5 font-medium">{word.meaning}</p>
          </div>
          {word.synonyms && (
            <div>
              <p className="text-xs uppercase text-success">Synonyms</p>
              <p className="mt-0.5 text-sm">
                {splitList(word.synonyms).join(", ")}
              </p>
            </div>
          )}
          {word.antonyms && (
            <div>
              <p className="text-xs uppercase text-destructive">Antonyms</p>
              <p className="mt-0.5 text-sm">
                {splitList(word.antonyms).join(", ")}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Flashcards;
