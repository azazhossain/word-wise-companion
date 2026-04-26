import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Search, Bookmark, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "হোম", icon: Home },
  { to: "/parts", label: "পার্ট", icon: Layers },
  { to: "/dictionary", label: "ডিকশনারি", icon: Search },
  { to: "/saved", label: "সেভড", icon: Bookmark },
  { to: "/flashcards", label: "ফ্ল্যাশ", icon: BookOpen },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong safe-bottom">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((t) => {
          const active = pathname === t.to || (t.to !== "/" && pathname.startsWith(t.to));
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
              <span className={cn(active && "font-semibold")}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
