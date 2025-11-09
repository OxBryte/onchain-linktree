import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "onchain-linktree-theme";
const ThemeContext = createContext(undefined);

const getStoredPreference = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "dark" || value === "light" ? value : null;
};

const getPreferredTheme = () => {
  const stored = getStoredPreference();
  if (stored) {
    return stored;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

const applyTheme = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  if (!root || !body) {
    return;
  }

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  body.dataset.theme = theme;
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
};

export function ThemeProvider({ children }) {
  const [hasStoredPreference, setHasStoredPreference] = useState(() =>
    getStoredPreference() !== null
  );
  const [theme, setThemeState] = useState(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || hasStoredPreference) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event) => {
      setThemeState(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [hasStoredPreference]);

  const persistTheme = useCallback((value) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, value);
    setHasStoredPreference(true);
  }, []);

  const setTheme = useCallback(
    (value) => {
      const normalized = value === "dark" ? "dark" : "light";
      setThemeState(normalized);
      persistTheme(normalized);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

