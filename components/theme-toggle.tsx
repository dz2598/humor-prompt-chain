"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener("chain-theme-change", notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("chain-theme-change", notify);
      };
    },
    () => (localStorage.getItem("chain-theme") as Theme | null) || "system",
    () => "system",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function choose(next: Theme) {
    localStorage.setItem("chain-theme", next);
    window.dispatchEvent(new Event("chain-theme-change"));
  }

  return <div className="theme-switch" aria-label="Color theme">
    {(["light", "system", "dark"] as Theme[]).map(option => <button key={option} type="button" className={theme === option ? "active" : ""} onClick={() => choose(option)}>{option}</button>)}
  </div>;
}
