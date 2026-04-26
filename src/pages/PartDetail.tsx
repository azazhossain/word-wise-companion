import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { wordsByPart, splitList } from "@/data/words";
import { useMemorized } from "@/hooks/useProgress";
import { useSaved } from "@/hooks/useSaved";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkCheck, Bookmark, ChevronDown, ChevronUp, Play, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PartDetail = () => {
  const { part } = useParams();
  const partNum = Number(part);
  const words = useMemo(() => wordsByPart(partNum), [partNum]);
  const { isMemorized, toggle } = useMemorized();
  const { isSaved, toggle: toggleSaved } = useSaved();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="animate-fade-in">
      <header className="safe-top flex items-center gap-3 glass px-4 py-3">
        <Link to="/parts">
          <Button size="icon" variant="ghost"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">পার্ট {partNum}</h1>
          <p className="text-xs text-muted-foreground">{words.length}টি শব্দ</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 p-4">
        <Link to={`/quiz/part/${partNum}?count=10`}>
          <Button className="w-full gap-2" variant="secondary"><Play className="h-4 w-4" /> Quiz</Button>
        </Link>
        <Link to={`/quiz/part/${partNum}?count=25&mode=mock`}>
          <Button className="w-full gap-2"><Trophy className="h-4 w-4" /> Mock Test</Button>
        </Link>
      </div>

      <div className="space-y-2 px-4 pb-6">
        {words.map((w) => {
          const open = openId === w.id;
          const memo = isMemorized(w.id);
          const saved = isSaved(w.id);
          return (
            <Card key={w.id} className="glass overflow-hidden border-0">
              <button
                onClick={() => setOpenId(open ? null : w.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{w.headword}</p>
                  <p className="truncate text-sm text-muted-foreground">{w.meaning}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSaved(w.id); }}
                    className={cn("rounded-lg p-1.5 transition", saved ? "text-accent" : "text-muted-foreground")}
                    aria-label="Save word"
                  >
                    <Star className={cn("h-5 w-5", saved && "fill-current")} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(w.id); }}
                    className={cn("rounded-lg p-1.5 transition", memo ? "text-success" : "text-muted-foreground")}
                    aria-label="Mark memorized"
                  >
                    {memo ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                  </button>
                  {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t border-border/50 bg-muted/20 px-4 py-3 text-sm animate-fade-in">
                  {w.synonyms && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-primary">Synonyms</p>
                      <p className="mt-0.5">{splitList(w.synonyms).join(", ")}</p>
                    </div>
                  )}
                  {w.antonyms && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-destructive">Antonyms</p>
                      <p className="mt-0.5">{splitList(w.antonyms).join(", ")}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PartDetail;
