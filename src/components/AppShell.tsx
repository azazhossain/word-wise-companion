import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-md">{children}</main>
      <BottomNav />
    </div>
  );
};
