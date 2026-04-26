import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapTheme } from "./hooks/useTheme";

// Apply saved theme before React mounts to avoid flash
void bootstrapTheme();

createRoot(document.getElementById("root")!).render(<App />);
