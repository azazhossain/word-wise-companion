import { useCallback, useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { applyPalette, DEFAULT_PALETTE_ID, getPalette } from "@/lib/palettes";

const KEY_PALETTE = "av:palette";

function isDarkNow(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

export function usePalette() {
  const [paletteId, setPaletteId] = useState<string>(DEFAULT_PALETTE_ID);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.get(KEY_PALETTE).then((v) => {
      const id = v && getPalette(v).id === v ? v : DEFAULT_PALETTE_ID;
      setPaletteId(id);
      applyPalette(id, isDarkNow());
      setLoaded(true);
    });
  }, []);

  const setPalette = useCallback(async (id: string) => {
    setPaletteId(id);
    applyPalette(id, isDarkNow());
    await storage.set(KEY_PALETTE, id);
  }, []);

  return { paletteId, setPalette, loaded };
}

/** Re-apply current palette whenever the dark/light theme flips. */
export function syncPaletteToTheme() {
  storage.get(KEY_PALETTE).then((v) => {
    const id = v && getPalette(v).id === v ? v : DEFAULT_PALETTE_ID;
    applyPalette(id, isDarkNow());
  });
}

/** Apply persisted palette as early as possible (before React mounts). */
export async function bootstrapPalette() {
  const v = await storage.get(KEY_PALETTE);
  const id = v && getPalette(v).id === v ? v : DEFAULT_PALETTE_ID;
  applyPalette(id, isDarkNow());
}
