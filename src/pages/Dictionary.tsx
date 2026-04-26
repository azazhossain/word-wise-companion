import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ALL_WORDS, splitList } from "@/data/words";
import { useMemorized } from "@/hooks/useProgress";
import { useSaved } from "@/hooks/useSaved";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, BookmarkCheck, Bookmark, Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const Dictionary = () => {
  const [q, setQ] = useState("");
  const [onlyMemo, setOnlyMemo] = useState(false);
  const deferred = useDeferredValue(q);
  const { isMemorized, toggle } = useMemorized();
  const { isSaved, toggle: toggleSaved } = useSaved();
  const [openId, setOpenId] = useState<number | null>(null);

  const results = useMemo(() => {
    const term = deferred.trim().toLowerCase();
    let list = ALL_WORDS;
    if (onlyMemo) list = list.filter((w) => isMemorized(w.id));
    if (!term) return list.slice(0, 100);
    return list
      .filter((w) =>
        w.headword.toLowerCase().includes(term) ||
        w.meaning.toLowerCase().includes(term) ||
        w.synonyms.toLowerCase().includes(term) ||
        w.antonyms.toLowerCase().includes(term)
      )
      .slice(0, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferred, onlyMemo]);

  return (
    <div className="animate-fade-in">
      <header className="safe-top sticky top-0 z-10 flex items-center gap-3 glass px-4 py-3">
        <Link to="/"><Button size="icon" variant="ghost"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <h1 className="flex-1 text-lg font-bold">ডিকশনারি</h1>
      </header>

      <div className="sticky top-[57px] z-10 space-y-2 border-b border-border bg-background/95 p-4 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="শব্দ, অর্থ, syn বা ant খুঁজুন..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{results.length} ফলাফল</p>
          <Button size="sm" variant={onlyMemo ? "default" : "outline"} onClick={() => setOnlyMemo((v) => !v)} className="h-7 gap-1 text-xs">
            <Filter className="h-3 w-3" /> {onlyMemo ? "Memorized" : "সব"}
          </Button>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {results.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">কোনো ফলাফল নেই</p>
        ) : (
          results.map((w) => {
            const open = openId === w.id;
            const memo = isMemorized(w.id);
            const saved = isSaved(w.id);
            return (
              <Card key={w.id} className="glass overflow-hidden border-0">
                <button onClick={() => setOpenId(open ? null : w.id)} className="flex w-full items-start justify-between gap-2 p-3 text-left">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{w.headword}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{w.meaning}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSaved(w.id); }}
                      className={cn("rounded-md p-1.5 transition", saved ? "text-accent" : "text-muted-foreground")}
                      aria-label="Save word"
                    >
                      <Star className={cn("h-4 w-4", saved && "fill-current")} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggle(w.id); }}
                      className={cn("rounded-md p-1.5 transition", memo ? "text-success" : "text-muted-foreground")}
                      aria-label="Mark memorized"
                    >
                      {memo ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>
                </button>
                {open && (
                  <div className="space-y-2 border-t border-border/50 bg-muted/20 px-4 py-3 text-sm animate-fade-in">
                    <p>{w.meaning}</p>
                    {w.synonyms && <p><span className="text-xs font-bold uppercase text-success">Syn:</span> {splitList(w.synonyms).join(", ")}</p>}
                    {w.antonyms && <p><span className="text-xs font-bold uppercase text-destructive">Ant:</span> {splitList(w.antonyms).join(", ")}</p>}
                    <p className="text-xs text-muted-foreground">পার্ট {w.part}</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dictionary;
