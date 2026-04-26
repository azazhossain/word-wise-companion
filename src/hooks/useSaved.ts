import { useEffect, useState, useCallback } from "react";
import { getJSON, setJSON } from "@/lib/storage";

const KEY_SAVED = "av:saved";

export function useSaved() {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getJSON<number[]>(KEY_SAVED, []).then((arr) => {
      setIds(new Set(arr));
      setLoaded(true);
    });

    // cross-tab / cross-page sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_SAVED && e.newValue) {
        try {
          setIds(new Set(JSON.parse(e.newValue) as number[]));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(
    async (id: number) => {
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        void setJSON(KEY_SAVED, Array.from(next));
        return next;
      });
    },
    []
  );

  const isSaved = useCallback((id: number) => ids.has(id), [ids]);

  return { ids, toggle, isSaved, count: ids.size, loaded };
}
