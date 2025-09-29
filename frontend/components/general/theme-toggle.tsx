"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark" | null);
    const sysDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (sysDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button onClick={toggle} className="rounded-xl border border-foreground/20 px-3 h-9 text-sm">
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
