import { useEffect, useState, useCallback } from "react";
import { getJSON, setJSON } from "@/lib/storage";

const KEY_MEMORIZED = "av:memorized";
const KEY_STREAK = "av:streak";

export interface StreakData {
  current: number;
  best: number;
  lastDate: string | null;
  totalQuizzes: number;
  totalCorrect: number;
}

export function useMemorized() {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getJSON<number[]>(KEY_MEMORIZED, []).then((arr) => {
      setIds(new Set(arr));
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback(
    async (id: number) => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setIds(next);
      await setJSON(KEY_MEMORIZED, Array.from(next));
    },
    [ids]
  );

  return { ids, toggle, isMemorized: (id: number) => ids.has(id), count: ids.size, loaded };
}

export function useStreak() {
  const [data, setData] = useState<StreakData>({
    current: 0,
    best: 0,
    lastDate: null,
    totalQuizzes: 0,
    totalCorrect: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getJSON<StreakData>(KEY_STREAK, {
      current: 0,
      best: 0,
      lastDate: null,
      totalQuizzes: 0,
      totalCorrect: 0,
    }).then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, []);

  const recordActivity = useCallback(
    async (correctCount: number, totalCount: number) => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let next = { ...data };
      if (data.lastDate === today) {
        // already counted today, no streak change
      } else if (data.lastDate === yesterday) {
        next.current = data.current + 1;
      } else {
        next.current = 1;
      }
      next.best = Math.max(next.best, next.current);
      next.lastDate = today;
      next.totalQuizzes = data.totalQuizzes + 1;
      next.totalCorrect = data.totalCorrect + correctCount;
      setData(next);
      await setJSON(KEY_STREAK, next);
    },
    [data]
  );

  return { ...data, recordActivity, loaded };
}
