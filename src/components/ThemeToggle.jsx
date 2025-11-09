import { useMemo } from "react";
import { useTheme } from "../theme/ThemeProvider.jsx";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const label = useMemo(
    () => `Activate ${isDark ? "light" : "dark"} mode`,
    [isDark]
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className="fixed bottom-6 right-6 z-[100] inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
    >
      <span className="text-lg">{isDark ? "🌞" : "🌙"}</span>
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} mode</span>
    </button>
  );
}

export default ThemeToggle;

