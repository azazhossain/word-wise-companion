import { useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";

const KEY_THEME = "av:theme";
type Theme = "light" | "dark";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.get(KEY_THEME).then((v) => {
      const initial: Theme = v === "light" || v === "dark" ? v : "dark";
      setTheme(initial);
      applyTheme(initial);
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback(async () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      void storage.set(KEY_THEME, next);
      return next;
    });
  }, []);

  return { theme, toggle, loaded };
}

/** Apply persisted theme as early as possible (call from main.tsx) */
export async function bootstrapTheme() {
  const v = await storage.get(KEY_THEME);
  const initial: Theme = v === "light" ? "light" : "dark";
  applyTheme(initial);
}
