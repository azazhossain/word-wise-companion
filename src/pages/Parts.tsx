import { Link } from "react-router-dom";
import { ALL_WORDS, PARTS } from "@/data/words";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Trophy } from "lucide-react";

const Parts = () => {
  return (
    <div className="animate-fade-in">
      <header className="safe-top flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
        <Link to="/">
          <Button size="icon" variant="ghost"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">সব পার্ট</h1>
          <p className="text-xs text-muted-foreground">১৫টি পার্ট · ১০৩৮ শব্দ</p>
        </div>
      </header>

      <div className="space-y-2 p-4">
        {PARTS.map((p) => {
          const count = ALL_WORDS.filter((w) => w.part === p).length;
          return (
            <Card key={p} className="overflow-hidden p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <Link to={`/parts/${p}`} className="flex flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow font-bold text-primary-foreground">
                    {p}
                  </div>
                  <div>
                    <p className="font-semibold">পার্ট {p}</p>
                    <p className="text-xs text-muted-foreground">{count}টি শব্দ</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Link to={`/quiz/part/${p}?count=25`}>
                    <Button size="sm" variant="secondary" className="gap-1">
                      <Play className="h-3.5 w-3.5" /> Quiz
                    </Button>
                  </Link>
                  <Link to={`/quiz/part/${p}?count=50&mode=mock`}>
                    <Button size="sm" className="gap-1">
                      <Trophy className="h-3.5 w-3.5" /> Mock
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Parts;
