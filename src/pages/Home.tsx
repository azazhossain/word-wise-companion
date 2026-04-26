import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ALL_WORDS, PARTS, totalWords } from "@/data/words";
import { useMemorized, useStreak } from "@/hooks/useProgress";
import { useSaved } from "@/hooks/useSaved";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, BookmarkCheck, BookOpen, Layers, Search, Bell, Sparkles, Bookmark } from "lucide-react";
import { requestNotificationPermission, scheduleDailyReminder } from "@/lib/notifications";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const Home = () => {
  const { count: memorizedCount } = useMemorized();
  const { count: savedCount } = useSaved();
  const { current, best, totalCorrect, totalQuizzes } = useStreak();
  const [wordOfMoment, setWordOfMoment] = useState(() => ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]);

  useEffect(() => {
    const t = setInterval(() => {
      setWordOfMoment(ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const accuracy = useMemo(
    () => (totalQuizzes > 0 ? Math.round((totalCorrect / (totalQuizzes * 10)) * 100) : 0),
    [totalCorrect, totalQuizzes]
  );

  const enableReminder = async () => {
    const ok = await requestNotificationPermission();
    if (!ok) {
      toast.error("Notification permission দেওয়া হয়নি");
      return;
    }
    await scheduleDailyReminder(22, 0);
    toast.success("রাত ১০টায় daily reminder সেট হয়েছে 🔔");
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="gradient-hero safe-top px-5 pb-8 pt-12 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm/none opacity-80">স্বাগতম 👋</p>
            <h1 className="mt-1 text-2xl font-bold">AdroitVocab</h1>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle variant="glass" />
            <Button size="icon" variant="ghost" onClick={enableReminder} className="text-primary-foreground hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Word of the moment */}
        <Card className="mt-5 overflow-hidden border border-white/20 bg-white/10 p-4 text-primary-foreground shadow-glow backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
            <Sparkles className="h-3.5 w-3.5" />
            Word of the Moment
          </div>
          <h2 className="mt-2 text-2xl font-bold">{wordOfMoment.headword}</h2>
          <p className="mt-1 text-sm opacity-95">{wordOfMoment.meaning}</p>
          {wordOfMoment.synonyms && (
            <p className="mt-2 text-xs opacity-80">
              <span className="font-semibold">Syn:</span> {wordOfMoment.synonyms}
            </p>
          )}
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-5 -mt-5">
        <Card className="glass flex flex-col items-center justify-center border-0 p-3">
          <Flame className="h-5 w-5 text-accent" />
          <p className="mt-1 text-lg font-bold">{current}</p>
          <p className="text-[10px] uppercase text-muted-foreground">Streak</p>
        </Card>
        <Card className="glass flex flex-col items-center justify-center border-0 p-3">
          <BookmarkCheck className="h-5 w-5 text-success" />
          <p className="mt-1 text-lg font-bold">{memorizedCount}</p>
          <p className="text-[10px] uppercase text-muted-foreground">Memo</p>
        </Card>
        <Link to="/saved">
          <Card className="glass flex flex-col items-center justify-center border-0 p-3 transition active:scale-95">
            <Bookmark className="h-5 w-5 text-primary" />
            <p className="mt-1 text-lg font-bold">{savedCount}</p>
            <p className="text-[10px] uppercase text-muted-foreground">Saved</p>
          </Card>
        </Link>
        <Card className="glass flex flex-col items-center justify-center border-0 p-3">
          <Trophy className="h-5 w-5 text-accent" />
          <p className="mt-1 text-lg font-bold">{best}</p>
          <p className="text-[10px] uppercase text-muted-foreground">Best</p>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="px-5 pt-6">
        <h3 className="mb-3 text-base font-semibold">দ্রুত শুরু</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/quiz/random?count=10">
            <Card className="gradient-card group flex h-28 flex-col justify-between p-4 text-primary-foreground shadow-elegant transition-transform active:scale-95">
              <BookOpen className="h-6 w-6" />
              <div>
                <p className="text-base font-bold">র‍্যান্ডম কুইজ</p>
                <p className="text-xs opacity-90">১০টি প্রশ্ন</p>
              </div>
            </Card>
          </Link>
          <Link to="/flashcards">
            <Card className="gradient-accent group flex h-28 flex-col justify-between p-4 text-primary-foreground shadow-elegant transition-transform active:scale-95">
              <Layers className="h-6 w-6" />
              <div>
                <p className="text-base font-bold">ফ্ল্যাশকার্ড</p>
                <p className="text-xs opacity-90">{totalWords} শব্দ</p>
              </div>
            </Card>
          </Link>
          <Link to="/dictionary">
            <Card className="flex h-28 flex-col justify-between border bg-card p-4 shadow-soft transition-transform active:scale-95">
              <Search className="h-6 w-6 text-primary" />
              <div>
                <p className="text-base font-bold">ডিকশনারি</p>
                <p className="text-xs text-muted-foreground">খুঁজুন</p>
              </div>
            </Card>
          </Link>
          <Link to="/quiz/mock?count=50">
            <Card className="flex h-28 flex-col justify-between border bg-card p-4 shadow-soft transition-transform active:scale-95">
              <Trophy className="h-6 w-6 text-accent" />
              <div>
                <p className="text-base font-bold">মক টেস্ট</p>
                <p className="text-xs text-muted-foreground">৫০ প্রশ্ন</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Parts */}
      <div className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">১৫টি পার্ট</h3>
          <Link to="/parts" className="text-xs font-medium text-primary">সব দেখুন →</Link>
        </div>
        <div className="space-y-2">
          {PARTS.slice(0, 5).map((p) => {
            const count = ALL_WORDS.filter((w) => w.part === p).length;
            return (
              <Link key={p} to={`/parts/${p}`}>
                <Card className="flex items-center justify-between p-4 shadow-soft transition active:scale-[0.98]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-foreground">
                      {p}
                    </div>
                    <div>
                      <p className="font-semibold">পার্ট {p}</p>
                      <p className="text-xs text-muted-foreground">{count}টি শব্দ</p>
                    </div>
                  </div>
                  <Badge variant="secondary">→</Badge>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {accuracy > 0 && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          গড় নির্ভুলতা: <span className="font-semibold text-foreground">{accuracy}%</span> · মোট কুইজ: {totalQuizzes}
        </p>
      )}
    </div>
  );
};

export default Home;
