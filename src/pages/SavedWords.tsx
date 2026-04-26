import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ALL_WORDS, splitList } from "@/data/words";
import { useSaved } from "@/hooks/useSaved";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkCheck, BookmarkX, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

const SavedWords = () => {
  const { ids, toggle, count, loaded } = useSaved();
  const [openId, setOpenId] = useState<number | null>(null);

  const words = useMemo(
    () => ALL_WORDS.filter((w) => ids.has(w.id)),
    [ids]
  );

  const clearAll = async () => {
    if (!confirm(`সব ${count}টি saved word মুছবেন?`)) return;
    for (const id of Array.from(ids)) await toggle(id);
    toast.success("সব saved word মুছে ফেলা হয়েছে");
  };

  return (
    <div className="animate-fade-in">
      <header className="safe-top sticky top-0 z-10 flex items-center gap-3 glass px-4 py-3">
        <Link to="/">
          <Button size="icon" variant="ghost"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">সংরক্ষিত শব্দ</h1>
          <p className="text-xs text-muted-foreground">{count}টি শব্দ সেভ করা আছে</p>
        </div>
        {count > 0 && (
          <Button size="icon" variant="ghost" onClick={clearAll} className="text-destructive">
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </header>

      {loaded && count === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="glass mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <BookmarkCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-lg font-bold">এখনো কোনো শব্দ সেভ করা নেই</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ডিকশনারি বা পার্ট থেকে যেকোনো শব্দে 🔖 বাটনে tap করুন
          </p>
          <Link to="/dictionary" className="mt-6">
            <Button>ডিকশনারিতে যান</Button>
          </Link>
        </div>
      ) : (
        <>
          {count > 0 && (
            <div className="px-4 pt-4">
              <Link to="/quiz/saved?count=10">
                <Button className="w-full gap-2 gradient-card text-primary-foreground shadow-elegant">
                  <Play className="h-4 w-4" /> Saved শব্দ দিয়ে কুইজ
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-2 p-4">
            {words.map((w) => {
              const open = openId === w.id;
              return (
                <Card key={w.id} className="glass overflow-hidden border-0">
                  <button
                    onClick={() => setOpenId(open ? null : w.id)}
                    className="flex w-full items-start justify-between gap-2 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{w.headword}</p>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{w.meaning}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggle(w.id); toast("শব্দটি unsave করা হয়েছে"); }}
                      className="rounded-lg p-1.5 text-primary transition hover:bg-primary/10"
                      aria-label="Remove saved word"
                    >
                      <BookmarkX className="h-5 w-5" />
                    </button>
                  </button>
                  {open && (
                    <div className="space-y-2 border-t border-border/50 bg-muted/20 px-4 py-3 text-sm animate-fade-in">
                      <p>{w.meaning}</p>
                      {w.synonyms && (
                        <p>
                          <span className="text-xs font-bold uppercase text-success">Syn:</span>{" "}
                          {splitList(w.synonyms).join(", ")}
                        </p>
                      )}
                      {w.antonyms && (
                        <p>
                          <span className="text-xs font-bold uppercase text-destructive">Ant:</span>{" "}
                          {splitList(w.antonyms).join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">পার্ট {w.part}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SavedWords;
