import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme(
  initialTheme: Theme = "dark",
  onUpdate?: (theme: Theme) => void
) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Keep localStorage in sync so the anti-FOUC script works on next load
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    onUpdate?.(next);
  }, [theme, onUpdate]);

  return { theme, toggle };
}
