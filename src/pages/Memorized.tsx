import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ALL_WORDS, splitList } from "@/data/words";
import { useMemorized } from "@/hooks/useProgress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkCheck, BookmarkX, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Memorized = () => {
  const { ids, toggle, count, loaded } = useMemorized();
  const [openId, setOpenId] = useState<number | null>(null);

  const words = useMemo(
    () => ALL_WORDS.filter((w) => ids.has(w.id)),
    [ids]
  );

  const clearAll = async () => {
    if (!confirm(`সব ${count}টি memorized শব্দ মুছবেন?`)) return;
    for (const id of Array.from(ids)) await toggle(id);
    toast.success("সব memorized শব্দ মুছে ফেলা হয়েছে");
  };

  return (
    <div className="animate-fade-in">
      <header className="safe-top sticky top-0 z-10 flex items-center gap-3 glass px-4 py-3">
        <Link to="/">
          <Button size="icon" variant="ghost"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">মুখস্ত শব্দ</h1>
          <p className="text-xs text-muted-foreground">{count}টি শব্দ মুখস্ত হয়েছে</p>
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
            <BookmarkCheck className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-lg font-bold">এখনো কোনো শব্দ মুখস্ত করা হয়নি</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ফ্ল্যাশকার্ডে ডানদিকে swipe করে অথবা পার্ট থেকে যেকোনো শব্দে 🔖 button-এ tap করুন
          </p>
          <Link to="/flashcards" className="mt-6">
            <Button>ফ্ল্যাশকার্ডে যান</Button>
          </Link>
        </div>
      ) : (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(w.id);
                      toast("মুখস্ত list থেকে সরানো হয়েছে");
                    }}
                    className="rounded-lg p-1.5 text-success transition hover:bg-success/10"
                    aria-label="Remove from memorized"
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
      )}
    </div>
  );
};

export default Memorized;
