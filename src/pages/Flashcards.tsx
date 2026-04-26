import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ALL_WORDS, splitList, type Word } from "@/data/words";
import { useMemorized } from "@/hooks/useProgress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BookmarkCheck,
  Bookmark,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const shuffle = <T,>(a: T[]) => {
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
  const [deck, setDeck] = useState<Word[]>(() => shuffle(ALL_WORDS));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exit, setExit] = useState<{ dir: 1 | -1 } | null>(null);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const draggingRef = useRef(false);
  const { isMemorized, toggle } = useMemorized();

  const w = deck[idx];
  const nextW = deck[idx + 1];
  const memo = w ? isMemorized(w.id) : false;

  // Reset transient state when card changes
  useEffect(() => {
    setFlipped(false);
    setDrag({ x: 0, y: 0 });
    setExit(null);
  }, [idx]);

  const advance = (dir: 1 | -1) => {
    if (idx >= deck.length - 1) {
      // bounce back
      setDrag({ x: 0, y: 0 });
      return;
    }
    setExit({ dir });
    window.setTimeout(() => {
      setIdx((i) => i + 1);
    }, 220);
  };

  const next = () => {
    if (exit) return;
    advance(1);
  };
  const prev = () => {
    if (idx === 0 || exit) return;
    setIdx((i) => Math.max(i - 1, 0));
  };
  const reshuffle = () => {
    setDeck(shuffle(ALL_WORDS));
    setIdx(0);
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
    if (
      !draggingRef.current &&
      Math.hypot(dx, dy) > TAP_MOVE_TOLERANCE
    ) {
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
      // mark memorized on right swipe, do nothing special on left
      if (dir === 1 && w && !isMemorized(w.id)) toggle(w.id);
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
      return `translate3d(${exit.dir * window.innerWidth * 1.2}px, 0, 0) rotate(${exit.dir * 25}deg)`;
    }
    const rot = drag.x * 0.06;
    return `translate3d(${drag.x}px, ${drag.y * 0.15}px, 0) rotate(${rot}deg)`;
  }, [drag, exit]);

  const dragOpacity = exit ? 0 : 1;
  const swipeProgress = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1);

  if (!w) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">শেষ! আবার শুরু করুন।</p>
        <Button onClick={reshuffle}>আবার শুরু</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background animate-fade-in">
      <header className="safe-top flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <Link to="/">
          <Button size="icon" variant="ghost">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">ফ্ল্যাশকার্ড</h1>
          <p className="text-xs text-muted-foreground">
            {idx + 1} / {deck.length} · swipe ➡ মুখস্ত · ⬅ স্কিপ
          </p>
        </div>
        <Button size="icon" variant="ghost" onClick={reshuffle}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </header>

      <div className="relative flex flex-1 items-center justify-center p-6">
        {/* next-card stack underneath */}
        {nextW && (
          <div
            className="pointer-events-none absolute h-80 w-full max-w-sm scale-95 opacity-60"
            style={{ transform: "scale(0.95) translateY(8px)" }}
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
              className="pointer-events-none absolute left-10 top-1/2 z-20 -translate-y-1/2 rounded-2xl border-4 border-success bg-success/20 px-5 py-2 text-2xl font-bold text-success rotate-[-12deg]"
              style={{ opacity: drag.x > 0 ? swipeProgress : 0 }}
            >
              মুখস্ত
            </div>
            <div
              className="pointer-events-none absolute right-10 top-1/2 z-20 -translate-y-1/2 rounded-2xl border-4 border-destructive bg-destructive/20 px-5 py-2 text-2xl font-bold text-destructive rotate-[12deg]"
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
            opacity: dragOpacity,
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
            <Card className="gradient-hero absolute inset-0 flex flex-col items-center justify-center p-6 text-primary-foreground shadow-elegant backface-hidden">
              <p className="text-xs uppercase tracking-widest opacity-70">
                পার্ট {w.part}
              </p>
              <h2 className="mt-3 text-center text-3xl font-bold">
                {w.headword}
              </h2>
              <p className="absolute bottom-4 text-xs opacity-70">
                ট্যাপ: উল্টান · স্ক্রল করতে swipe
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

      <div className="grid grid-cols-4 items-center gap-2 border-t border-border bg-card p-4">
        <Button variant="outline" onClick={prev} disabled={idx === 0 || !!exit}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          onClick={() => advance(-1)}
          disabled={!!exit}
          className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" /> স্কিপ
        </Button>
        <Button
          variant={memo ? "default" : "outline"}
          onClick={() => toggle(w.id)}
          className={cn(
            "gap-1.5",
            memo && "bg-success hover:bg-success/90"
          )}
        >
          {memo ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {memo ? "মুখস্ত" : "মার্ক"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (w && !isMemorized(w.id)) toggle(w.id);
            advance(1);
          }}
          disabled={!!exit}
          className="gap-1.5 border-success/40 text-success hover:bg-success/10"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Flashcards;
