import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import Home from "./pages/Home";
import Parts from "./pages/Parts";
import PartDetail from "./pages/PartDetail";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Dictionary from "./pages/Dictionary";
import SavedWords from "./pages/SavedWords";
import Memorized from "./pages/Memorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell><Home /></AppShell>} />
          <Route path="/parts" element={<AppShell><Parts /></AppShell>} />
          <Route path="/parts/:part" element={<AppShell><PartDetail /></AppShell>} />
          <Route path="/dictionary" element={<AppShell><Dictionary /></AppShell>} />
          <Route path="/saved" element={<AppShell><SavedWords /></AppShell>} />
          <Route path="/memorized" element={<AppShell><Memorized /></AppShell>} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quiz/:mode" element={<Quiz />} />
          <Route path="/quiz/:mode/:part" element={<Quiz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
