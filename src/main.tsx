import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapTheme } from "./hooks/useTheme";
import { bootstrapPalette } from "./hooks/usePalette";

// Apply saved theme + palette before React mounts to avoid flash
(async () => {
  await bootstrapTheme();
  await bootstrapPalette();
})();

createRoot(document.getElementById("root")!).render(<App />);
