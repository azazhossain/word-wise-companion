import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "default" | "glass";
}

export const ThemeToggle = ({ className, variant = "default" }: Props) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        variant === "glass" && "text-primary-foreground hover:bg-white/10",
        className
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
