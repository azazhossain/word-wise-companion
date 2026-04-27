import { Check, Moon, Palette as PaletteIcon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/hooks/useTheme";
import { usePalette } from "@/hooks/usePalette";
import { PALETTES } from "@/lib/palettes";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "default" | "glass";
}

export const ThemeToggle = ({ className, variant = "default" }: Props) => {
  const { theme, toggle } = useTheme();
  const { paletteId, setPalette } = usePalette();
  const isDark = theme === "dark";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Theme settings"
          className={cn(
            variant === "glass" && "text-primary-foreground hover:bg-white/10",
            className
          )}
        >
          <PaletteIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">থিম</p>
          <Button
            size="sm"
            variant="outline"
            onClick={toggle}
            className="h-8 gap-1.5 px-2 text-xs"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" /> Light
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" /> Dark
              </>
            )}
          </Button>
        </div>

        <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
          কালার প্যালেট
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PALETTES.map((p) => {
            const active = p.id === paletteId;
            return (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition active:scale-95",
                  active
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border hover:border-primary/40"
                )}
                aria-label={`Use ${p.label} palette`}
              >
                <div
                  className="h-10 w-full rounded-lg shadow-card"
                  style={{ background: p.swatch }}
                />
                <span className="text-[11px] font-medium">{p.label}</span>
                {active && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
