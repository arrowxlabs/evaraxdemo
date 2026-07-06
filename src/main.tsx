import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { syncThemeFromServer } from "./hooks/useTheme";

// Sync theme from backend so all visitors see the admin-selected theme instantly.
syncThemeFromServer();

// Prefetch the transition video into HTTP cache so navigation plays instantly.
// Uses a low-priority fetch after paint, no blocking.
if (typeof window !== "undefined") {
  const prefetch = () => {
    try {
      fetch("/transitions/evara-transition-fast.mp4", {
        cache: "force-cache",
        priority: "low" as RequestPriority,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  };
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 800);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
